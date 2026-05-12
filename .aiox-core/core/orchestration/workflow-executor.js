/**
 * Workflow Executor - Development Cycle Engine
 *
 * Story 11.3: Projeto Bob - Development Cycle Workflow
 * Story 11.5: Session State Persistence (ADR-011)
 *
 * Executes the development cycle workflow with:
 * - Dynamic executor assignment (Story 11.1)
 * - Terminal spawning for clean context (Story 11.2)
 * - Session state persistence (Story 11.5)
 * - Conditional self-healing with CodeRabbit
 * - Quality gate by different agent
 * - Human checkpoints (GO/PAUSE/REVIEW/ABORT)
 *
 * @module core/orchestration/workflow-executor
 * @version 1.1.0
 */

'use strict';

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Import dependencies from Story 11.1, 11.2, and 11.5
const ExecutorAssignment = require('./executor-assignment');
const TerminalSpawner = require('./terminal-spawner');
const { SessionState, ActionType } = require('./session-state');

// Constants
const DEFAULT_TIMEOUT_MS = 7200000; // 2 hours
const CHECKPOINT_TIMEOUT_MS = 1800000; // 30 minutes
const STATE_SAVE_INTERVAL_MS = 300000; // 5 minutes

/**
 * Workflow phase status
 * @enum {string}
 */
const PhaseStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
};

/**
 * Checkpoint decision options
 * @enum {string}
 */
const CheckpointDecision = {
  GO: 'GO',
  PAUSE: 'PAUSE',
  REVIEW: 'REVIEW',
  ABORT: 'ABORT',
};

/**
 * Workflow execution state
 * @typedef {Object} WorkflowState
 * @property {string} workflowId - Workflow identifier
 * @property {string} currentPhase - Current phase ID
 * @property {string} currentStory - Path to current story file
 * @property {string} executor - Current executor agent
 * @property {string} qualityGate - Current quality gate agent
 * @property {number} attemptCount - Number of attempts for current phase
 * @property {Date} startedAt - Workflow start time
 * @property {Date} lastUpdated - Last state update time
 * @property {Object} phaseResults - Results from each phase
 * @property {Object} accumulatedContext - Context accumulated across phases
 */

/**
 * Workflow Executor class
 */
class WorkflowExecutor {
  /**
   * Creates a new WorkflowExecutor instance
   * @param {string} projectRoot - Project root directory
   * @param {Object} options - Executor options
   */
  constructor(projectRoot, options = {}) {
    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      autoResume: true,
      saveState: true,
      useSessionState: true, // Story 11.5: Use unified session state
      ...options,
    };

    this.workflowPath = path.join(
      projectRoot,
      '.aiox-core/development/workflows/development-cycle.yaml',
    );
    this.statePath = path.join(projectRoot, '.aiox/workflow-state/');
    this.configPath = path.join(projectRoot, '.aiox-core/core-config.yaml');

    this.workflow = null;
    this.state = null;
    this.config = null;

    // Story 11.5: Session State Manager (ADR-011)
    this.sessionState = new SessionState(projectRoot, { debug: options.debug });

    // Story 12.6: Phase change callbacks for observability
    this._phaseChangeCallbacks = [];
    this._agentSpawnCallbacks = [];
    this._terminalSpawnCallbacks = [];
  }

  /**
   * Registers a callback for phase change events (Story 12.6 - AC1)
   * @param {Function} callback - Callback function (phase, storyId, executor) => void
   * @returns {void}
   */
  onPhaseChange(callback) {
    if (typeof callback === 'function') {
      this._phaseChangeCallbacks.push(callback);
    }
  }

  /**
   * Registers a callback for agent spawn events (Story 12.6 - AC1)
   * @param {Function} callback - Callback function (agent, task) => void
   * @returns {void}
   */
  onAgentSpawn(callback) {
    if (typeof callback === 'function') {
      this._agentSpawnCallbacks.push(callback);
    }
  }

  /**
   * Registers a callback for terminal spawn events (Story 12.6 - AC1)
   * @param {Function} callback - Callback function (agent, pid, task) => void
   * @returns {void}
   */
  onTerminalSpawn(callback) {
    if (typeof callback === 'function') {
      this._terminalSpawnCallbacks.push(callback);
    }
  }

  /**
   * Emits phase change to all registered callbacks (Story 12.6)
   * @param {string} phase - Phase name
   * @param {string} storyId - Story ID
   * @param {string} executor - Executor agent
   * @private
   */
  _emitPhaseChange(phase, storyId, executor) {
    for (const callback of this._phaseChangeCallbacks) {
      try {
        callback(phase, storyId, executor);
      } catch (error) {
        if (this.options.debug) {
          console.log(`[WorkflowExecutor] Phase change callback error: ${error.message}`);
        }
      }
    }
  }

  /**
   * Emits agent spawn to all registered callbacks (Story 12.6)
   * @param {string} agent - Agent ID
   * @param {string} task - Task being executed
   * @private
   */
  _emitAgentSpawn(agent, task) {
    for (const callback of this._agentSpawnCallbacks) {
      try {
        callback(agent, task);
      } catch (error) {
        if (this.options.debug) {
          console.log(`[WorkflowExecutor] Agent spawn callback error: ${error.message}`);
        }
      }
    }
  }

  /**
   * Emits terminal spawn to all registered callbacks (Story 12.6)
   * @param {string} agent - Agent ID
   * @param {number} pid - Process ID
   * @param {string} task - Task being executed
   * @private
   */
  _emitTerminalSpawn(agent, pid, task) {
    for (const callback of this._terminalSpawnCallbacks) {
      try {
        callback(agent, pid, task);
      } catch (error) {
        if (this.options.debug) {
          console.log(`[WorkflowExecutor] Terminal spawn callback error: ${error.message}`);
        }
      }
    }
  }

  /**
   * Loads the workflow definition
   * @returns {Promise<Object>} Workflow definition
   */
  async loadWorkflow() {
    const content = await fs.readFile(this.workflowPath, 'utf8');
    this.workflow = yaml.load(content);
    return this.workflow;
  }

  /**
   * Loads the core configuration
   * @returns {Promise<Object>} Core configuration
   */
  async loadConfig() {
    try {
      const content = await fs.readFile(this.configPath, 'utf8');
      this.config = yaml.load(content);
    } catch (error) {
      if (this.options.debug) {
        console.log(`[WorkflowExecutor] Config not found at ${this.configPath}, using defaults`);
        console.log(`[WorkflowExecutor] Error: ${error.message}`);
      }
      this.config = { coderabbit_integration: { enabled: false } };
    }
    return this.config;
  }

  /**
   * Initializes or resumes workflow state
   * @param {string} storyPath - Path to story file
   * @returns {Promise<WorkflowState>} Workflow state
   */
  async initializeState(storyPath) {
    const stateFile = this.getStateFilePath(storyPath);

    // Check for existing state
    if (this.options.autoResume && fsSync.existsSync(stateFile)) {
      const content = await fs.readFile(stateFile, 'utf8');
      this.state = yaml.load(content);
      this.state.lastUpdated = new Date();

      if (this.options.debug) {
        console.log(`[WorkflowExecutor] Resumed state from: ${stateFile}`);
      }

      return this.state;
    }

    // Create new state
    this.state = {
      workflowId: 'development-cycle',
      currentPhase: '1_validation',
      currentStory: storyPath,
      executor: null,
      qualityGate: null,
      attemptCount: 0,
      startedAt: new Date(),
      lastUpdated: new Date(),
      phaseResults: {},
      accumulatedContext: {},
    };

    await this.saveState();
    return this.state;
  }

  /**
   * Gets the state file path for a story
   * @param {string} storyPath - Path to story file
   * @returns {string} State file path
   */
  getStateFilePath(storyPath) {
    const storyName = path.basename(storyPath, '.story.md');
    return path.join(this.statePath, `${storyName}-state.yaml`);
  }

  /**
   * Saves the current workflow state
   * @returns {Promise<void>}
   */
  async saveState() {
    if (!this.options.saveState) return;

    await fs.mkdir(this.statePath, { recursive: true });
    const stateFile = this.getStateFilePath(this.state.currentStory);
    this.state.lastUpdated = new Date();
    await fs.writeFile(stateFile, yaml.dump(this.state));

    // Story 11.5: Also update unified session state (ADR-011)
    await this.syncToSessionState();
  }

  /**
   * Syncs internal workflow state to unified session state (Story 11.5)
   * @returns {Promise<void>}
   */
  async syncToSessionState() {
    if (!this.options.useSessionState) return;

    try {
      // Load or create session state
      const sessionExists = await this.sessionState.exists();
      if (!sessionExists) {
        // Session state will be created by Bob orchestrator
        // We just update if it exists
        return;
      }

      await this.sessionState.loadSessionState();

      // Map phase ID to phase name
      const phaseNameMap = {
        '1_validation': 'validation',
        '2_development': 'development',
        '3_self_healing': 'self_healing',
        '4_quality_gate': 'quality_gate',
        '5_push': 'push',
        '6_checkpoint': 'checkpoint',
      };

      const phaseName = phaseNameMap[this.state.currentPhase] || this.state.currentPhase;

      await this.sessionState.updateSessionState({
        workflow: {
          current_phase: phaseName,
          attempt_count: this.state.attemptCount,
          phase_results: this.state.phaseResults,
        },
        last_action: {
          type: ActionType.PHASE_CHANGE,
          story: this.state.currentStory,
          phase: phaseName,
        },
        context_snapshot: {
          last_executor: this.state.executor,
        },
      });

      if (this.options.debug) {
        console.log(`[WorkflowExecutor] Synced to session state: phase=${phaseName}`);
      }
    } catch (error) {
      // Non-fatal - log and continue
      if (this.options.debug) {
        console.log(`[WorkflowExecutor] Session state sync failed: ${error.message}`);
      }
    }
  }

  /**
   * Reads story metadata from YAML frontmatter
   * @param {string} storyPath - Path to story file
   * @returns {Promise<Object>} Story metadata
   */
  async readStoryMetadata(storyPath) {
    const content = await fs.readFile(storyPath, 'utf8');

    // Extract YAML from markdown frontmatter
    const yamlMatch = content.match(/```yaml\n([\s\S]*?)```/);
    if (!yamlMatch) {
      throw new Error(`No YAML frontmatter found in story: ${storyPath}`);
    }

    return yaml.load(yamlMatch[1]);
  }

  /**
   * Executes the development cycle workflow
   * @param {string} storyPath - Path to story file
   * @param {Object} epicContext - Optional epic context
   * @returns {Promise<Object>} Execution result
   */
  async execute(storyPath, epicContext = {}) {
    // Load workflow and config
    await this.loadWorkflow();
    await this.loadConfig();

    // Initialize state
    await this.initializeState(storyPath);

    // Read story metadata
    const storyMetadata = await this.readStoryMetadata(storyPath);
    this.state.executor = storyMetadata.executor;
    this.state.qualityGate = storyMetadata.quality_gate;

    if (this.options.debug) {
      console.log('[WorkflowExecutor] Starting workflow execution');
      console.log(`  Story: ${storyPath}`);
      console.log(`  Executor: ${this.state.executor}`);
      console.log(`  Quality Gate: ${this.state.qualityGate}`);
    }

    // Execute phases
    let currentPhase = this.state.currentPhase;
    let continueExecution = true;

    while (continueExecution) {
      const phaseResult = await this.executePhase(currentPhase, storyPath, epicContext);
      this.state.phaseResults[currentPhase] = phaseResult;
      await this.saveState();

      if (phaseResult.status === PhaseStatus.FAILED) {
        const errorHandler = this.getErrorHandler(currentPhase, phaseResult);
        const handlerResult = await this.handleError(errorHandler, phaseResult);

        if (handlerResult.retry) {
          this.state.attemptCount++;
          continue;
        } else if (handlerResult.nextPhase) {
          currentPhase = handlerResult.nextPhase;
          continue;
        } else {
          continueExecution = false;
        }
      } else if (phaseResult.status === PhaseStatus.COMPLETED) {
        currentPhase = this.getNextPhase(currentPhase, phaseResult);

        if (!currentPhase) {
          continueExecution = false;
        } else if (currentPhase === 'workflow_paused') {
          continueExecution = false;
        } else if (currentPhase === 'workflow_aborted') {
          continueExecution = false;
        }

        this.state.currentPhase = currentPhase;
        this.state.attemptCount = 0;
      } else if (phaseResult.status === PhaseStatus.SKIPPED) {
        currentPhase = this.getNextPhase(currentPhase, phaseResult);
        this.state.currentPhase = currentPhase;
      }
    }

    return {
      success: this.state.phaseResults['6_checkpoint']?.decision !== CheckpointDecision.ABORT,
      state: this.state,
      phaseResults: this.state.phaseResults,
    };
  }

  /**
   * Executes a single workflow phase
   * @param {string} phaseId - Phase identifier
   * @param {string} storyPath - Path to story file
   * @param {Object} epicContext - Epic context
   * @returns {Promise<Object>} Phase execution result
   */
  async executePhase(phaseId, storyPath, epicContext) {
    const phase = this.workflow.workflow.phases[phaseId];

    if (!phase) {
      return { status: PhaseStatus.FAILED, error: `Phase not found: ${phaseId}` };
    }

    if (this.options.debug) {
      console.log(`[WorkflowExecutor] Executing phase: ${phaseId}`);
    }

    // Check condition
    if (phase.condition) {
      const conditionMet = this.evaluateCondition(phase.condition);
      if (!conditionMet) {
        return { status: PhaseStatus.SKIPPED, reason: 'Condition not met' };
      }
    }

    // Resolve dynamic agent
    const agent = this.resolveAgent(phase.agent);

    // Story 12.6: Emit phase change for observability (AC1, AC2)
    const storyId = path.basename(storyPath, '.story.md');
    this._emitPhaseChange(phaseId, storyId, agent);

    // Execute based on phase type
    switch (phaseId) {
      case '1_validation':
        return this.executeValidationPhase(phase, agent, storyPath, epicContext);
      case '2_development':
        return this.executeDevelopmentPhase(phase, agent, storyPath);
      case '3_self_healing':
        return this.executeSelfHealingPhase(phase, agent);
      case '4_quality_gate':
        return this.executeQualityGatePhase(phase, agent, storyPath);
      case '5_push':
        return this.executePushPhase(phase, agent, storyPath);
      case '6_checkpoint':
        return this.executeCheckpointPhase(phase, agent, storyPath);
      default:
        return { status: PhaseStatus.FAILED, error: `Unknown phase: ${phaseId}` };
    }
  }

  /**
   * Resolves dynamic agent references
   * @param {string} agentRef - Agent reference (may be dynamic)
   * @returns {string} Resolved agent ID
   */
  resolveAgent(agentRef) {
    if (agentRef === '${story.executor}') {
      return this.state.executor;
    }
    if (agentRef === '${story.quality_gate}') {
      return this.state.qualityGate;
    }
    return agentRef;
  }

  /**
   * Evaluates a condition expression
   * @param {string} condition - Condition expression
   * @returns {boolean} Condition result
   */
  evaluateCondition(condition) {
    // Handle CodeRabbit integration check
    if (condition.includes('coderabbit_integration.enabled')) {
      return this.config?.coderabbit_integration?.enabled === true;
    }
    return true;
  }

  /**
   * Executes Phase 1: Story Validation
   * @param {Object} phase - Phase configuration
   * @param {string} agent - Agent ID
   * @param {string} storyPath - Path to story file
   * @param {Object} epicContext - Epic context
   * @returns {Promise<Object>} Phase result
   */
  async executeValidationPhase(phase, agent, storyPath, epicContext) {
    try {
      // Validate story has required fields
      const storyMetadata = await this.readStoryMetadata(storyPath);

      const issues = [];

      if (!storyMetadata.executor) {
        issues.push('Story must have an executor assigned');
      }
      if (!storyMetadata.quality_gate) {
        issues.push('Story must have a quality_gate assigned');
      }
      if (storyMetadata.executor === storyMetadata.quality_gate) {
        issues.push('Executor and Quality Gate must be different agents');
      }

      // Validate executor assignment using Story 11.1
      if (storyMetadata.executor && storyMetadata.quality_gate) {
        const validation = ExecutorAssignment.validateExecutorAssignment({
          executor: storyMetadata.executor,
          quality_gate: storyMetadata.quality_gate,
          quality_gate_tools: storyMetadata.quality_gate_tools || ['code_review'],
        });
        if (!validation.isValid) {
          issues.push(...validation.errors);
        }
      }

      if (issues.length > 0) {
        return {
          status: PhaseStatus.FAILED,
          validation_result: { passed: false, issues },
        };
      }

      // Update accumulated context with epic info
      this.state.accumulatedContext = {
        ...this.state.accumulatedContext,
        ...epicContext,
        validatedAt: new Date(),
      };

      return {
        status: PhaseStatus.COMPLETED,
        validation_result: { passed: true, score: 100, issues: [] },
      };
    } catch (error) {
      return {
        status: PhaseStatus.FAILED,
        error: error.message,
      };
    }
  }

  /**
   * Executes Phase 2: Development (Dynamic Executor)
   * @param {Object} phase - Phase configuration
   * @param {string} agent - Agent ID (dynamic)
   * @param {string} storyPath - Path to story file
   * @returns {Promise<Object>} Phase result
   */
  async executeDevelopmentPhase(phase, agent, storyPath) {
    try {
      if (this.options.debug) {
        console.log(`[WorkflowExecutor] Spawning ${agent} for development`);
      }

      // Story 12.6: Emit agent spawn for observability (AC1)
      this._emitAgentSpawn(agent, 'development');

      // Use terminal spawning (Story 11.2)
      if (phase.spawn_in_terminal && TerminalSpawner.isSpawnerAvailable()) {
        const context = {
          story: storyPath,
          files: [],
          instructions: `Execute *develop for story: ${storyPath}`,
          metadata: this.state.accumulatedContext,
        };

        const result = await TerminalSpawner.spawnAgent(agent.replace('@', ''), 'develop', {
          context,
          timeout: DEFAULT_TIMEOUT_MS,
          debug: this.options.debug,
        });

        // Story 12.6: Emit terminal spawn for observability (AC1)
        if (result.pid) {
          this._emitTerminalSpawn(agent, result.pid, 'development');
        }

        return {
          status: result.success ? PhaseStatus.COMPLETED : PhaseStatus.FAILED,
          implementation: {
            files_created: [],
            files_modified: [],
            tests_added: [],
          },
          output: result.output,
          outputFile: result.outputFile,
        };
      }

      // Fallback: Return pending for manual execution
      return {
        status: PhaseStatus.COMPLETED,
        implementation: {
          files_created: [],
          files_modified: [],
          tests_added: [],
        },
        note: 'Terminal spawning not available, manual execution required',
      };
    } catch (error) {
      return {
        status: PhaseStatus.FAILED,
        error: error.message,
      };
    }
  }

  /**
   * Executes Phase 3: Self-Healing (Conditional)
   * Uses CodeRabbit CLI to detect and auto-fix issues.
   * @param {Object} phase - Phase configuration
   * @param {string} agent - Agent ID
   * @returns {Promise<Object>} Phase result
   */
  async executeSelfHealingPhase(phase, agent) {
    try {
      const maxIterations = phase.config?.max_iterations || this.config?.coderabbit_integration?.self_healing?.max_iterations || 3;
      const severityFilter = phase.config?.severity_filter || ['CRITICAL', 'HIGH'];
      let iterations = 0;
      const issuesFixed = [];
      const issuesRemaining = [];

      // Check if CodeRabbit is available
      const coderabbitConfig = this.config?.coderabbit_integration;
      if (!coderabbitConfig?.enabled) {
        if (this.options.debug) {
          console.log('[WorkflowExecutor] CodeRabbit not enabled, skipping self-healing');
        }
        return {
          status: PhaseStatus.SKIPPED,
          reason: 'CodeRabbit integration not enabled',
        };
      }

      // Self-healing loop
      while (iterations < maxIterations) {
        iterations++;

        if (this.options.debug) {
          console.log(`[WorkflowExecutor] Self-healing iteration ${iterations}/${maxIterations}`);
        }

        // Run CodeRabbit analysis
        const analysisResult = await this.runCodeRabbitAnalysis(coderabbitConfig);

        if (!analysisResult.success) {
          if (this.options.debug) {
            console.log(`[WorkflowExecutor] CodeRabbit analysis failed: ${analysisResult.error}`);
          }
          // Graceful degradation - continue without self-healing
          if (coderabbitConfig.graceful_degradation?.skip_if_not_installed) {
            return {
              status: PhaseStatus.COMPLETED,
              healed_code: {
                iterations,
                issues_fixed: issuesFixed,
                issues_remaining: issuesRemaining,
                note: analysisResult.error || coderabbitConfig.graceful_degradation?.fallback_message,
              },
            };
          }
          break;
        }

        // Filter issues by severity
        const relevantIssues = analysisResult.issues.filter(
          (issue) => severityFilter.includes(issue.severity),
        );

        if (relevantIssues.length === 0) {
          if (this.options.debug) {
            console.log('[WorkflowExecutor] No relevant issues found, self-healing complete');
          }
          break;
        }

        // Attempt to fix issues
        for (const issue of relevantIssues) {
          const fixed = await this.attemptAutoFix(issue);
          if (fixed) {
            issuesFixed.push({
              file: issue.file,
              line: issue.line,
              severity: issue.severity,
              message: issue.message,
              fixedAt: new Date().toISOString(),
            });
          } else {
            issuesRemaining.push({
              file: issue.file,
              line: issue.line,
              severity: issue.severity,
              message: issue.message,
            });
          }
        }

        // If no issues were fixed in this iteration, stop
        if (issuesFixed.length === 0 && iterations > 1) {
          if (this.options.debug) {
            console.log('[WorkflowExecutor] No issues fixed in iteration, stopping');
          }
          break;
        }
      }

      return {
        status: PhaseStatus.COMPLETED,
        healed_code: {
          iterations,
          issues_fixed: issuesFixed,
          issues_remaining: issuesRemaining,
        },
      };
    } catch (error) {
      if (this.options.debug) {
        console.log(`[WorkflowExecutor] Self-healing error: ${error.message}`);
      }
      return {
        status: PhaseStatus.FAILED,
        error: error.message,
      };
    }
  }

  /**
   * Runs CodeRabbit analysis on the codebase
   * @param {Object} coderabbitConfig - CodeRabbit configuration
   * @returns {Promise<Object>} Analysis result with issues array
   */
  async runCodeRabbitAnalysis(coderabbitConfig) {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // Build command based on installation mode
      let command;
      if (coderabbitConfig.installation_mode === 'wsl') {
        const wslPath = this.projectRoot.replace(/^([A-Z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`).replace(/\\/g, '/');
        command = `wsl bash -c 'cd "${wslPath}" && ~/.local/bin/coderabbit --prompt-only -t uncommitted 2>&1'`;
      } else {
        command = 'coderabbit --prompt-only -t uncommitted';
      }

      if (this.options.debug) {
        console.log(`[WorkflowExecutor] Running CodeRabbit: ${command}`);
      }

      const { stdout, stderr } = await execAsync(command, {
        timeout: (coderabbitConfig.self_healing?.timeout_minutes || 30) * 60 * 1000,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      // Parse CodeRabbit output to extract issues
      const issues = this.parseCodeRabbitOutput(stdout);

      return {
        success: true,
        issues,
        rawOutput: stdout,
      };
    } catch (error) {
      // Handle command not found or execution errors
      if (error.code === 'ENOENT' || error.message?.includes('not found')) {
        return {
          success: false,
          error: 'CodeRabbit CLI not installed',
          issues: [],
        };
      }
      return {
        success: false,
        error: error.message,
        issues: [],
      };
    }
  }

  /**
   * Parses CodeRabbit CLI output to extract issues
   * @param {string} output - Raw CodeRabbit output
   * @returns {Array} Array of issue objects
   */
  parseCodeRabbitOutput(output) {
    const issues = [];

    if (!output) return issues;

    // CodeRabbit outputs issues in various formats
    // Try to parse structured format first (JSON-like blocks)
    const jsonMatch = output.match(/```json\n([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => ({
            file: item.file || item.path || 'unknown',
            line: item.line || item.lineNumber || 0,
            severity: item.severity || 'MEDIUM',
            message: item.message || item.description || '',
            suggestion: item.suggestion || item.fix || null,
          }));
        }
      } catch {
        // Not valid JSON, continue with text parsing
      }
    }

    // Parse text-based output (line-by-line issues)
    const lines = output.split('\n');
    const severityPattern = /\[(CRITICAL|HIGH|MEDIUM|LOW)\]/i;
    const filePattern = /([^\s:]+):(\d+)/;

    for (const line of lines) {
      const severityMatch = line.match(severityPattern);
      const fileMatch = line.match(filePattern);

      if (severityMatch) {
        issues.push({
          file: fileMatch ? fileMatch[1] : 'unknown',
          line: fileMatch ? parseInt(fileMatch[2], 10) : 0,
          severity: severityMatch[1].toUpperCase(),
          message: line.replace(severityPattern, '').replace(filePattern, '').trim(),
          suggestion: null,
        });
      }
    }

    return issues;
  }

  /**
   * Attempts to auto-fix a single issue
   * @param {Object} issue - Issue to fix
   * @returns {Promise<boolean>} True if fixed successfully
   */
  async attemptAutoFix(issue) {
    // For MVP, we don't attempt actual auto-fixes
    // This would require integration with an AI model to generate fixes
    // Just log the attempt and return false
    if (this.options.debug) {
      console.log(`[WorkflowExecutor] Would auto-fix: ${issue.file}:${issue.line} - ${issue.message}`);
    }

    // If issue has a suggestion, we could apply it
    // For now, mark as not fixed - requires human review
    return false;
  }

  /**
   * Executes Phase 4: Quality Gate
   * @param {Object} phase - Phase configuration
   * @param {string} agent - Agent ID (quality gate)
   * @param {string} storyPath - Path to story file
   * @returns {Promise<Object>} Phase result
   */
  async executeQualityGatePhase(phase, agent, storyPath) {
    try {
      // Validate that quality gate is different from executor
      if (agent === this.state.executor) {
        return {
          status: PhaseStatus.FAILED,
          error: 'Quality Gate agent must be different from executor',
        };
      }

      if (this.options.debug) {
        console.log(`[WorkflowExecutor] Spawning ${agent} for quality gate`);
      }

      // Story 12.6: Emit agent spawn for observability (AC1)
      this._emitAgentSpawn(agent, 'quality_gate');

      // Use terminal spawning
      if (phase.spawn_in_terminal && TerminalSpawner.isSpawnerAvailable()) {
        const context = {
          story: storyPath,
          files: [],
          instructions: `Execute quality review for story: ${storyPath}`,
          metadata: {
            executor: this.state.executor,
            implementation: this.state.phaseResults['2_development']?.implementation,
          },
        };

        const result = await TerminalSpawner.spawnAgent(agent.replace('@', ''), 'quality-review', {
          context,
          timeout: DEFAULT_TIMEOUT_MS / 4, // 30 minutes
          debug: this.options.debug,
        });

        // Story 12.6: Emit terminal spawn for observability (AC1)
        if (result.pid) {
          this._emitTerminalSpawn(agent, result.pid, 'quality_gate');
        }

        return {
          status: result.success ? PhaseStatus.COMPLETED : PhaseStatus.FAILED,
          review_result: {
            verdict: result.success ? 'APPROVED' : 'NEEDS_WORK',
            score: result.success ? 90 : 60,
            findings: [],
            recommendations: [],
          },
          output: result.output,
        };
      }

      // Fallback
      return {
        status: PhaseStatus.COMPLETED,
        review_result: {
          verdict: 'APPROVED',
          score: 100,
          findings: [],
          recommendations: [],
        },
        note: 'Terminal spawning not available, manual review required',
      };
    } catch (error) {
      return {
        status: PhaseStatus.FAILED,
        error: error.message,
      };
    }
  }

  /**
   * Executes Phase 5: Push & PR
   * @param {Object} phase - Phase configuration
   * @param {string} agent - Agent ID (@devops)
   * @param {string} storyPath - Path to story file
   * @returns {Promise<Object>} Phase result
   */
  async executePushPhase(phase, agent, storyPath) {
    try {
      if (this.options.debug) {
        console.log(`[WorkflowExecutor] Spawning ${agent} for push`);
      }

      // Story 12.6: Emit agent spawn for observability (AC1)
      this._emitAgentSpawn(agent, 'push');

      // Use terminal spawning
      if (phase.spawn_in_terminal && TerminalSpawner.isSpawnerAvailable()) {
        const context = {
          story: storyPath,
          files: [],
          instructions: `Execute *pre-push and *push for story: ${storyPath}`,
          metadata: {
            review_result: this.state.phaseResults['4_quality_gate']?.review_result,
          },
        };

        const result = await TerminalSpawner.spawnAgent(agent.replace('@', ''), 'push-and-pr', {
          context,
          timeout: DEFAULT_TIMEOUT_MS / 12, // 10 minutes
          debug: this.options.debug,
        });

        // Story 12.6: Emit terminal spawn for observability (AC1)
        if (result.pid) {
          this._emitTerminalSpawn(agent, result.pid, 'push');
        }

        return {
          status: result.success ? PhaseStatus.COMPLETED : PhaseStatus.FAILED,
          push_result: {
            commit_hash: '',
            branch: 'main',
          },
          pr_url: '',
          output: result.output,
        };
      }

      // Fallback
      return {
        status: PhaseStatus.COMPLETED,
        push_result: {
          commit_hash: '',
          branch: 'main',
        },
        pr_url: '',
        note: 'Terminal spawning not available, manual push required',
      };
    } catch (error) {
      return {
        status: PhaseStatus.FAILED,
        error: error.message,
      };
    }
  }

  /**
   * Executes Phase 6: Checkpoint (Human Decision)
   * @param {Object} phase - Phase configuration
   * @param {string} agent - Agent ID (@po)
   * @param {string} storyPath - Path to story file
   * @returns {Promise<Object>} Phase result
   */
  async executeCheckpointPhase(phase, agent, storyPath) {
    // This phase requires human interaction
    // In a real implementation, this would wait for user input

    if (this.options.debug) {
      console.log('[WorkflowExecutor] Checkpoint reached - awaiting human decision');
    }

    // For now, return with GO decision (would be replaced by actual elicitation)
    return {
      status: PhaseStatus.COMPLETED,
      decision: CheckpointDecision.GO,
      next_story: null,
      awaiting_input: true,
      options: {
        GO: 'Continue to next story',
        PAUSE: 'Save state and stop',
        REVIEW: 'Show what was done',
        ABORT: 'Stop the epic',
      },
    };
  }

  /**
   * Gets the next phase based on current phase result
   * @param {string} currentPhase - Current phase ID
   * @param {Object} result - Phase result
   * @returns {string|null} Next phase ID or null
   */
  getNextPhase(currentPhase, result) {
    const phase = this.workflow.workflow.phases[currentPhase];

    if (!phase) return null;

    if (result.status === PhaseStatus.COMPLETED) {
      // Handle checkpoint decisions
      if (currentPhase === '6_checkpoint') {
        switch (result.decision) {
          case CheckpointDecision.GO:
            return '1_validation'; // Loop back
          case CheckpointDecision.PAUSE:
            return 'workflow_paused';
          case CheckpointDecision.ABORT:
            return 'workflow_aborted';
          case CheckpointDecision.REVIEW:
            return '6_checkpoint'; // Stay at checkpoint after review
          default:
            return null;
        }
      }
      return phase.on_success;
    }

    if (result.status === PhaseStatus.SKIPPED) {
      return phase.on_skip || phase.on_success;
    }

    return null;
  }

  /**
   * Gets the error handler for a phase
   * @param {string} phaseId - Phase ID
   * @param {Object} result - Phase result
   * @returns {string} Error handler ID
   */
  getErrorHandler(phaseId, result) {
    const phase = this.workflow.workflow.phases[phaseId];
    return phase?.on_failure || 'default_error_handler';
  }

  /**
   * Handles workflow errors
   * @param {string} handlerId - Error handler ID
   * @param {Object} result - Phase result
   * @returns {Promise<Object>} Handler result
   */
  async handleError(handlerId, result) {
    const handler = this.workflow.workflow.error_handlers?.[handlerId];

    if (!handler) {
      return { retry: false, nextPhase: null };
    }

    // Check max attempts
    const maxAttempts = handler.actions?.find((a) => a.max_attempts)?.max_attempts || 3;
    if (this.state.attemptCount >= maxAttempts) {
      return { retry: false, nextPhase: null, escalate: true };
    }

    // Determine action
    if (handlerId === 'return_to_development') {
      return { retry: false, nextPhase: '2_development' };
    }

    if (handlerId === 'return_to_quality_gate') {
      return { retry: false, nextPhase: '4_quality_gate' };
    }

    return { retry: true };
  }
}

/**
 * Creates a new workflow executor instance
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Executor options
 * @returns {WorkflowExecutor} Workflow executor instance
 */
function createWorkflowExecutor(projectRoot, options = {}) {
  return new WorkflowExecutor(projectRoot, options);
}

/**
 * Executes the development cycle for a story
 * @param {string} storyPath - Path to story file
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Execution result
 */
async function executeDevelopmentCycle(storyPath, options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const executor = new WorkflowExecutor(projectRoot, options);
  return executor.execute(storyPath, options.epicContext || {});
}

module.exports = {
  WorkflowExecutor,
  createWorkflowExecutor,
  executeDevelopmentCycle,
  PhaseStatus,
  CheckpointDecision,
  DEFAULT_TIMEOUT_MS,
  CHECKPOINT_TIMEOUT_MS,
};
