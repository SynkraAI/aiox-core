/**
 * Workflow State Manager
 *
 * @deprecated Superseded by session-state.js (Story 11.5).
 * Bob uses SessionState exclusively. This module is maintained for
 * backward compatibility with MasterOrchestrator (Epic 0) only.
 * New code should use: .aios-core/core/orchestration/session-state.js
 *
 * File-based state persistence for guided workflow automation.
 * Tracks workflow execution progress across Claude Code sessions.
 *
 * State files are stored at: .aios/{instance-id}-state.yaml
 *
 * Design constraints:
 * - Claude Code = one agent per session, no background processes
 * - Human remains the orchestrator; system tracks state and guides
 * - Each session picks up where the last left off via state file
 *
 * @module workflow-state-manager
 * @version 2.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const WORKFLOW_STATE_VERSION = '2.0';

class WorkflowStateManager {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.basePath] - Project root path (defaults to cwd)
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   */
  constructor(options = {}) {
    this.basePath = options.basePath || process.cwd();
    this.verbose = options.verbose || false;
    this.stateDir = path.join(this.basePath, '.aios');
  }

  /**
   * @private
   */
  _log(message) {
    if (this.verbose) {
      console.log(`[WorkflowStateManager] ${message}`);
    }
  }

  // ============ State CRUD ============

  /**
   * Create initial state from a workflow definition
   *
   * @param {Object} workflowData - Parsed workflow YAML (the workflow: block)
   * @param {Object} instanceConfig - Instance configuration
   * @param {string} [instanceConfig.target_context='core']
   * @param {string} [instanceConfig.squad_name]
   * @returns {Promise<Object>} Created state object
   */
  async createState(workflowData, instanceConfig = {}) {
    const wf = workflowData.workflow || workflowData;
    if (!wf || !wf.id) {
      throw new Error('workflow.id is required to create workflow state');
    }
    const instanceId = this._generateInstanceId(wf.id);

    const state = {
      state_version: WORKFLOW_STATE_VERSION,
      workflow_id: wf.id,
      workflow_name: wf.name || wf.id,
      instance_id: instanceId,
      target_context: instanceConfig.target_context || 'core',
      squad_name: instanceConfig.squad_name || null,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      current_phase: null,
      current_step_index: 0,
      steps: [],
      artifacts: [],
      decisions: [],
    };

    // Build steps from workflow sequence
    if (wf.sequence && Array.isArray(wf.sequence)) {
      state.steps = wf.sequence.map((step, index) => {
        // Determine action description
        let action = '';
        if (step.creates) action = `creates: ${step.creates}`;
        else if (step.updates) action = `updates: ${step.updates}`;
        else if (step.validates) action = `validates: ${step.validates}`;
        else if (step.action) action = step.action;
        else if (step.repeat_development_cycle) action = 'repeat_development_cycle';
        else if (step.workflow_end) action = 'workflow_end';

        const isOptional = step.optional === true || !!step.condition;

        return {
          step_index: index,
          phase: step.agent ? `${step.agent}: ${action}` : action,
          agent: step.agent || null,
          action: action,
          status: 'pending',
          optional: isOptional,
          started_at: null,
          completed_at: null,
          artifacts_created: [],
          notes: step.notes || null,
          session_id: null,
        };
      });

      // Set initial phase
      if (state.steps.length > 0) {
        state.current_phase = state.steps[0].phase;
      }

      // Build initial artifact registry
      for (let i = 0; i < wf.sequence.length; i++) {
        const step = wf.sequence[i];
        if (step.creates) {
          state.artifacts.push({
            name: step.creates,
            created_by_step: i,
            path: null,
            status: 'pending',
          });
        }
      }
    }

    // Ensure .aios directory exists
    await this._ensureStateDir();

    // Save state
    await this.saveState(state);

    this._log(`State created: ${instanceId}`);
    return state;
  }

  // ============ Runtime-First Next Action ============

  /**
   * Build normalized execution state from runtime signals.
   * Deterministic priority:
   * blocked > qa_rejected > ci_red > completed > in_development > ready_for_validation > unknown
   *
   * @param {Object} [signals={}]
   * @param {string} [signals.story_status]
   * @param {string} [signals.qa_status]
   * @param {string} [signals.ci_status]
   * @param {boolean} [signals.has_uncommitted_changes]
   * @returns {{ state: string, reasons: string[], normalized: Object }}
   */
  evaluateExecutionState(signals = {}) {
    const storyStatus = String(signals.story_status || 'unknown').toLowerCase();
    const qaStatus = String(signals.qa_status || 'unknown').toLowerCase();
    const ciStatus = String(signals.ci_status || 'unknown').toLowerCase();
    const hasUncommitted = Boolean(signals.has_uncommitted_changes);

    const reasons = [];
    let state = 'unknown';

    if (storyStatus === 'blocked') {
      state = 'blocked';
      reasons.push('story status is blocked');
    } else if (qaStatus === 'rejected' || qaStatus === 'fail' || qaStatus === 'failed') {
      state = 'qa_rejected';
      reasons.push(`qa status is ${qaStatus}`);
    } else if (ciStatus === 'red' || ciStatus === 'failed' || ciStatus === 'error') {
      state = 'ci_red';
      reasons.push(`ci status is ${ciStatus}`);
    } else if (storyStatus === 'done' || storyStatus === 'completed') {
      state = 'completed';
      reasons.push(`story status is ${storyStatus}`);
    } else if (storyStatus === 'in_progress' || storyStatus === 'review') {
      if (hasUncommitted) {
        state = 'in_development';
        reasons.push('story in progress with uncommitted changes');
      } else {
        state = 'ready_for_validation';
        reasons.push('story in progress with clean working tree');
      }
    }

    return {
      state,
      reasons,
      normalized: {
        story_status: storyStatus,
        qa_status: qaStatus,
        ci_status: ciStatus,
        has_uncommitted_changes: hasUncommitted,
      },
    };
  }

  /**
   * Deterministic next-action recommendation for runtime-first flows.
   *
   * @param {Object} [signals={}]
   * @param {Object} [options={}]
   * @param {string} [options.story]
   * @returns {{ state: string, command: string, agent: string, rationale: string, confidence: number }}
   */
  getNextActionRecommendation(signals = {}, options = {}) {
    const result = this.evaluateExecutionState(signals);
    const storyArg = options.story ? ` ${options.story}` : '';

    const map = {
      blocked: {
        command: `*orchestrate-status${storyArg}`,
        agent: '@po',
        rationale: 'Story is blocked. Surface blockers and unblock path first.',
        confidence: 0.95,
      },
      qa_rejected: {
        command: `*apply-qa-fixes${storyArg}`,
        agent: '@dev',
        rationale: 'QA rejected the story. Apply fixes before progressing.',
        confidence: 0.95,
      },
      ci_red: {
        command: '*run-tests',
        agent: '@dev',
        rationale: 'CI is red. Reproduce and fix failing tests/checks first.',
        confidence: 0.92,
      },
      completed: {
        command: `*close-story${storyArg}`,
        agent: '@po',
        rationale: 'Story is complete. Close lifecycle and move to next item.',
        confidence: 0.9,
      },
      in_development: {
        command: '*run-tests',
        agent: '@dev',
        rationale: 'Code is in progress with local changes. Validate before QA handoff.',
        confidence: 0.85,
      },
      ready_for_validation: {
        command: `*review-build${storyArg}`,
        agent: '@qa',
        rationale: 'Development appears stable. Proceed to QA structured review.',
        confidence: 0.82,
      },
      unknown: {
        command: `*next${storyArg}`,
        agent: '@dev',
        rationale: 'Context is incomplete. Request explicit workflow guidance.',
        confidence: 0.4,
      },
    };

    const recommendation = map[result.state] || map.unknown;
    return {
      state: result.state,
      command: recommendation.command,
      agent: recommendation.agent,
      rationale: recommendation.rationale,
      confidence: recommendation.confidence,
    };
  }

  /**
   * Load state from file
   * @param {string} instanceId
   * @returns {Promise<Object|null>} State object or null if not found
   */
  async loadState(instanceId) {
    const statePath = this._resolveStatePath(instanceId);
    try {
      const content = await fs.readFile(statePath, 'utf-8');
      const state = yaml.load(content);
      this._log(`State loaded: ${instanceId}`);
      return state;
    } catch (error) {
      if (error.code === 'ENOENT') {
        this._log(`State not found: ${instanceId}`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Save state to file
   * @param {Object} state
   * @returns {Promise<void>}
   */
  async saveState(state) {
    state.updated_at = new Date().toISOString();
    const statePath = this._resolveStatePath(state.instance_id);
    await this._ensureStateDir();
    const content = yaml.dump(state, { lineWidth: 120, noRefs: true });
    await fs.writeFile(statePath, content, 'utf-8');
    this._log(`State saved: ${state.instance_id}`);
  }

  /**
   * List all active workflow state files
   * @returns {Promise<Array>} Array of { instanceId, workflowId, status, updatedAt }
   */
  async listActiveWorkflows() {
    const results = [];

    try {
      const files = await fs.readdir(this.stateDir);
      const stateFiles = files.filter((f) => f.endsWith('-state.yaml'));

      for (const file of stateFiles) {
        try {
          const content = await fs.readFile(path.join(this.stateDir, file), 'utf-8');
          const state = yaml.load(content);
          if (state && state.status === 'active') {
            results.push({
              instanceId: state.instance_id,
              workflowId: state.workflow_id,
              workflowName: state.workflow_name,
              status: state.status,
              updatedAt: state.updated_at,
              progress: this.getProgress(state),
            });
          }
        } catch (err) {
          this._log(`Warning: Could not parse state file ${file}: ${err.message}`);
        }
      }
    } catch {
      this._log('State directory does not exist yet');
    }

    return results;
  }

  // ============ State Transitions ============

  /**
   * Advance to the next pending step
   * @param {Object} state
   * @returns {Object} Updated state
   */
  advanceStep(state) {
    const currentIndex = state.current_step_index;

    // Find next pending step after current
    for (let i = currentIndex + 1; i < state.steps.length; i++) {
      if (state.steps[i].status === 'pending') {
        state.current_step_index = i;
        state.current_phase = state.steps[i].phase;
        this._log(`Advanced to step ${i}: ${state.steps[i].phase}`);
        return state;
      }
    }

    // No more pending steps — workflow is complete
    state.status = 'completed';
    state.current_phase = 'Workflow complete';
    this._log('All steps completed');
    return state;
  }

  /**
   * Mark a step as completed
   * @param {Object} state
   * @param {number} stepIndex
   * @param {Array<string>} [artifacts=[]] - Artifacts created in this step
   * @returns {Object} Updated state
   */
  markStepCompleted(state, stepIndex, artifacts = []) {
    if (stepIndex < 0 || stepIndex >= state.steps.length) {
      throw new Error(`Invalid step index: ${stepIndex}`);
    }

    const step = state.steps[stepIndex];
    step.status = 'completed';
    step.completed_at = new Date().toISOString();
    step.artifacts_created = artifacts;

    // Update artifact registry
    for (const artifactName of artifacts) {
      const artifact = state.artifacts.find((a) => a.name === artifactName);
      if (artifact) {
        artifact.status = 'created';
      }
    }

    this._log(`Step ${stepIndex} marked completed`);
    return state;
  }

  /**
   * Mark a step as skipped (only if optional)
   * @param {Object} state
   * @param {number} stepIndex
   * @returns {Object} Updated state
   */
  markStepSkipped(state, stepIndex) {
    if (stepIndex < 0 || stepIndex >= state.steps.length) {
      throw new Error(`Invalid step index: ${stepIndex}`);
    }

    const step = state.steps[stepIndex];
    if (!step.optional) {
      throw new Error(`Step ${stepIndex} is not optional and cannot be skipped`);
    }

    step.status = 'skipped';
    step.completed_at = new Date().toISOString();

    this._log(`Step ${stepIndex} marked skipped`);
    return state;
  }

  // ============ Queries ============

  /**
   * Get the current step object
   * @param {Object} state
   * @returns {Object|null} Current step or null if all complete
   */
  getCurrentStep(state) {
    if (state.status === 'completed' || state.status === 'aborted') {
      return null;
    }
    return state.steps[state.current_step_index] || null;
  }

  /**
   * Get progress summary
   * @param {Object} state
   * @returns {Object} { completed, total, percentage, currentPhase }
   */
  getProgress(state) {
    const total = state.steps.length;
    const completed = state.steps.filter(
      (s) => s.status === 'completed' || s.status === 'skipped',
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      percentage,
      currentPhase: state.current_phase,
    };
  }

  /**
   * Get artifact status overview
   * @param {Object} state
   * @returns {Object} { created: [], pending: [] }
   */
  getArtifactStatus(state) {
    const created = state.artifacts.filter((a) => a.status === 'created');
    const pending = state.artifacts.filter((a) => a.status === 'pending');
    return { created, pending };
  }

  // ============ Integration ============

  /**
   * Generate context string for session handoff continuity
   * @param {Object} state
   * @returns {string} Handoff context string
   */
  generateHandoffContext(state) {
    const progress = this.getProgress(state);
    const currentStep = this.getCurrentStep(state);
    const artifacts = this.getArtifactStatus(state);

    const lines = [
      '## Workflow Handoff Context',
      '',
      `**Workflow:** ${state.workflow_name} (${state.instance_id})`,
      `**Status:** ${state.status}`,
      `**Progress:** ${progress.completed}/${progress.total} steps (${progress.percentage}%)`,
      `**Current Phase:** ${state.current_phase}`,
      '',
    ];

    if (currentStep) {
      lines.push('### Current Step');
      lines.push(`- **Step ${currentStep.step_index + 1}:** ${currentStep.phase}`);
      if (currentStep.agent) {
        lines.push(`- **Agent:** @${currentStep.agent}`);
      }
      lines.push(`- **Action:** ${currentStep.action}`);
      if (currentStep.notes) {
        lines.push(`- **Notes:** ${currentStep.notes}`);
      }
      lines.push('');
    }

    if (artifacts.created.length > 0) {
      lines.push('### Completed Artifacts');
      for (const a of artifacts.created) {
        lines.push(`- ${a.name}${a.path ? ` (${a.path})` : ''}`);
      }
      lines.push('');
    }

    if (artifacts.pending.length > 0) {
      lines.push('### Pending Artifacts');
      for (const a of artifacts.pending) {
        lines.push(`- ${a.name}`);
      }
      lines.push('');
    }

    if (state.decisions.length > 0) {
      lines.push('### Key Decisions');
      for (const d of state.decisions) {
        lines.push(`- Step ${d.step_index + 1}: ${d.decision}`);
      }
      lines.push('');
    }

    lines.push('### Resume Command');
    lines.push(`\`*run-workflow ${state.workflow_id} continue\``);

    return lines.join('\n');
  }

  /**
   * Generate formatted status report with visual progress bar
   * @param {Object} state
   * @returns {string} Formatted report
   */
  generateStatusReport(state) {
    const progress = this.getProgress(state);

    // Build progress bar
    const barLength = 20;
    const filledLength = Math.round((progress.percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

    const lines = [
      `=== Workflow Status: ${state.workflow_name} ===`,
      `Instance: ${state.instance_id}`,
      `Status: ${state.status.toUpperCase()}`,
      `Started: ${state.started_at}`,
      `Updated: ${state.updated_at}`,
      '',
      `Progress: [${bar}] ${progress.percentage}% (${progress.completed}/${progress.total})`,
      '',
      '--- Steps ---',
    ];

    for (const step of state.steps) {
      let statusIcon;
      switch (step.status) {
        case 'completed': statusIcon = '[x]'; break;
        case 'skipped': statusIcon = '[-]'; break;
        case 'in_progress': statusIcon = '[>]'; break;
        default: statusIcon = '[ ]';
      }

      const isCurrent = step.step_index === state.current_step_index && state.status === 'active';
      const marker = isCurrent ? ' <-- current' : '';
      const optional = step.optional ? ' (optional)' : '';

      lines.push(`  ${statusIcon} Step ${step.step_index + 1}: ${step.phase}${optional}${marker}`);
    }

    // Artifacts summary
    if (state.artifacts.length > 0) {
      lines.push('');
      lines.push('--- Artifacts ---');
      for (const a of state.artifacts) {
        const icon = a.status === 'created' ? '[x]' : '[ ]';
        lines.push(`  ${icon} ${a.name}${a.path ? ` → ${a.path}` : ''}`);
      }
    }

    // Decisions
    if (state.decisions.length > 0) {
      lines.push('');
      lines.push('--- Decisions ---');
      for (const d of state.decisions) {
        lines.push(`  Step ${d.step_index + 1}: ${d.decision}`);
      }
    }

    return lines.join('\n');
  }

  // ============ Agent Path Resolution ============

  /**
   * Resolve agent directory paths based on workflow state context.
   * For hybrid workflows, returns both core and squad paths.
   *
   * @param {Object} state - Workflow state object
   * @returns {{ corePath: string, squadPath: string|null }} Agent directory paths
   */
  resolveAgentPaths(state) {
    const corePath = path.join(this.basePath, '.aios-core', 'development', 'agents');

    if (state.target_context === 'core') {
      return { corePath, squadPath: null };
    }

    // Sanitize squad_name to prevent path traversal
    const squadName = state.squad_name;
    if (squadName && (squadName.includes('..') || squadName.includes('/') || squadName.includes('\\'))) {
      return { corePath, squadPath: null };
    }

    // Both 'squad' and 'hybrid' have a squad path
    const squadPath = squadName
      ? path.join(this.basePath, 'squads', squadName, 'agents')
      : null;

    return { corePath, squadPath };
  }

  // ============ Helpers ============

  /**
   * @private
   */
  _resolveStatePath(instanceId) {
    return path.join(this.stateDir, `${instanceId}-state.yaml`);
  }

  /**
   * @private
   */
  _generateInstanceId(workflowId) {
    // Sanitize workflowId to prevent path traversal
    if (!workflowId || workflowId.includes('..') || workflowId.includes('/') || workflowId.includes('\\')) {
      throw new Error('workflow.id contains invalid path characters');
    }
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8);
    return `${workflowId}-${date}-${random}`;
  }

  /**
   * @private
   */
  async _ensureStateDir() {
    await fs.mkdir(this.stateDir, { recursive: true });
  }
}

module.exports = { WorkflowStateManager };
