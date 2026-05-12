/**
 * Session State Persistence Module
 *
 * Story 11.5: Projeto Bob - Session State Persistence
 * ADR-011: Unified Session State (absorbs Workflow State from 11.3)
 *
 * Provides session state persistence to disk for:
 * - Resume work days later without losing context
 * - Crash recovery with state restoration
 * - Progress tracking across epic/story development
 *
 * @module core/orchestration/session-state
 * @version 1.1.0
 */

'use strict';

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Constants
const SESSION_STATE_VERSION = '1.2';
const SESSION_STATE_FILENAME = '.session-state.yaml';
const CRASH_THRESHOLD_MINUTES = 30;
const LEGACY_WORKFLOW_STATE_DIR = '.aiox/workflow-state';

/**
 * Action types for session state tracking
 * @enum {string}
 */
const ActionType = {
  GO: 'GO',
  PAUSE: 'PAUSE',
  REVIEW: 'REVIEW',
  ABORT: 'ABORT',
  PHASE_CHANGE: 'PHASE_CHANGE',
  EPIC_STARTED: 'EPIC_STARTED',
  STORY_STARTED: 'STORY_STARTED',
  STORY_COMPLETED: 'STORY_COMPLETED',
  CHECKPOINT_REACHED: 'CHECKPOINT_REACHED',
  ERROR_OCCURRED: 'ERROR_OCCURRED',
};

/**
 * Phase names for development cycle
 * @enum {string}
 */
const Phase = {
  VALIDATION: 'validation',
  DEVELOPMENT: 'development',
  SELF_HEALING: 'self_healing',
  QUALITY_GATE: 'quality_gate',
  PUSH: 'push',
  CHECKPOINT: 'checkpoint',
};

/**
 * Resume options for session recovery
 * @enum {string}
 */
const ResumeOption = {
  CONTINUE: 'continue',
  REVIEW: 'review',
  RESTART: 'restart',
  DISCARD: 'discard',
};

/**
 * Session State Manager class
 */
class SessionState {
  /**
   * Creates a new SessionState instance
   * @param {string} projectRoot - Project root directory
   * @param {Object} options - Options
   */
  constructor(projectRoot, options = {}) {
    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      autoMigrate: true,
      ...options,
    };

    this.stateFilePath = path.join(projectRoot, 'docs/stories', SESSION_STATE_FILENAME);
    this.legacyStatePath = path.join(projectRoot, LEGACY_WORKFLOW_STATE_DIR);
    this.state = null;
  }

  /**
   * Gets the path to the session state file
   * @returns {string} Session state file path
   */
  getStateFilePath() {
    return this.stateFilePath;
  }

  /**
   * Checks if a session state file exists
   * @returns {Promise<boolean>} True if state file exists
   */
  async exists() {
    try {
      await fs.access(this.stateFilePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates a new session state for an epic
   * @param {Object} epicInfo - Epic information
   * @param {string} epicInfo.id - Epic ID
   * @param {string} epicInfo.title - Epic title
   * @param {number} epicInfo.totalStories - Total number of stories
   * @param {string[]} epicInfo.storyIds - Array of story IDs
   * @param {string} branch - Git branch name
   * @returns {Promise<Object>} Created session state
   */
  async createSessionState(epicInfo, branch = 'main') {
    const now = new Date().toISOString();

    this.state = {
      session_state: {
        version: SESSION_STATE_VERSION,
        last_updated: now,

        // Epic Context (AC2)
        epic: {
          id: epicInfo.id,
          title: epicInfo.title,
          total_stories: epicInfo.totalStories,
        },

        // Progress Tracking (AC3)
        progress: {
          current_story: epicInfo.storyIds[0] || null,
          stories_done: [],
          stories_pending: [...epicInfo.storyIds],
        },

        // Workflow State (ADR-011 - migrated from 11.3)
        workflow: {
          current_phase: null,
          attempt_count: 0,
          phase_results: {},
          started_at: now,
        },

        // Last Action (AC4)
        last_action: {
          type: ActionType.EPIC_STARTED,
          timestamp: now,
          story: epicInfo.storyIds[0] || null,
          phase: null,
        },

        // Context Snapshot (AC5)
        context_snapshot: {
          files_modified: 0,
          executor_distribution: {},
          last_executor: null,
          branch: branch,
        },

        // Resume Instructions (auto-generated)
        resume_instructions: this.generateResumeInstructions({
          epicTitle: epicInfo.title,
          currentStory: epicInfo.storyIds[0],
          storiesDone: 0,
          totalStories: epicInfo.totalStories,
          lastPhase: null,
          lastExecutor: null,
        }),

        // Story 12.7: Session-level overrides (temporary, not persisted to user config)
        overrides: {
          educational_mode: null, // null = not overridden, true/false = session override
        },
      },
    };

    await this.save();

    if (this.options.debug) {
      console.log(`[SessionState] Created new session state: ${this.stateFilePath}`);
    }

    return this.state;
  }

  /**
   * Loads session state from disk
   * @returns {Promise<Object|null>} Session state or null if not found
   */
  async loadSessionState() {
    // Check for existing session state
    if (await this.exists()) {
      const content = await fs.readFile(this.stateFilePath, 'utf8');
      this.state = yaml.load(content);

      if (this.options.debug) {
        console.log(`[SessionState] Loaded session state from: ${this.stateFilePath}`);
      }

      return this.state;
    }

    // Check for legacy workflow state and migrate (ADR-011)
    if (this.options.autoMigrate) {
      const migrated = await this.migrateFromWorkflowState();
      if (migrated) {
        return this.state;
      }
    }

    return null;
  }

  /**
   * Updates the session state
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated session state
   */
  async updateSessionState(updates) {
    if (!this.state) {
      throw new Error('Session state not initialized. Call loadSessionState() or createSessionState() first.');
    }

    const now = new Date().toISOString();

    // Update last_updated timestamp
    this.state.session_state.last_updated = now;

    // Apply updates to specific sections
    if (updates.progress) {
      this.state.session_state.progress = {
        ...this.state.session_state.progress,
        ...updates.progress,
      };
    }

    if (updates.workflow) {
      this.state.session_state.workflow = {
        ...this.state.session_state.workflow,
        ...updates.workflow,
      };
    }

    if (updates.last_action) {
      this.state.session_state.last_action = {
        ...updates.last_action,
        timestamp: now,
      };
    }

    if (updates.context_snapshot) {
      this.state.session_state.context_snapshot = {
        ...this.state.session_state.context_snapshot,
        ...updates.context_snapshot,
      };
    }

    // Story 12.7: Handle overrides updates
    if (updates.overrides) {
      this.state.session_state.overrides = {
        ...(this.state.session_state.overrides || {}),
        ...updates.overrides,
      };
    }

    // Regenerate resume instructions
    this.state.session_state.resume_instructions = this.generateResumeInstructions({
      epicTitle: this.state.session_state.epic.title,
      currentStory: this.state.session_state.progress.current_story,
      storiesDone: this.state.session_state.progress.stories_done.length,
      totalStories: this.state.session_state.epic.total_stories,
      lastPhase: this.state.session_state.last_action.phase,
      lastExecutor: this.state.session_state.context_snapshot.last_executor,
    });

    await this.save();

    return this.state;
  }

  /**
   * Records a phase change in the session state
   * @param {string} phase - New phase name
   * @param {string} storyId - Story ID
   * @param {string} executor - Executor agent
   * @returns {Promise<Object>} Updated session state
   */
  async recordPhaseChange(phase, storyId, executor) {
    const updates = {
      workflow: {
        current_phase: phase,
      },
      last_action: {
        type: ActionType.PHASE_CHANGE,
        story: storyId,
        phase: phase,
      },
      context_snapshot: {
        last_executor: executor,
      },
    };

    // Update executor distribution
    if (this.state && executor) {
      const distribution = this.state.session_state.context_snapshot.executor_distribution || {};
      distribution[executor] = (distribution[executor] || 0) + 1;
      updates.context_snapshot.executor_distribution = distribution;
    }

    return this.updateSessionState(updates);
  }

  /**
   * Records story completion
   * @param {string} storyId - Completed story ID
   * @param {string} nextStoryId - Next story ID (optional)
   * @returns {Promise<Object>} Updated session state
   */
  async recordStoryCompleted(storyId, nextStoryId = null) {
    const storiesDone = [...this.state.session_state.progress.stories_done, storyId];
    const storiesPending = this.state.session_state.progress.stories_pending.filter(
      (id) => id !== storyId,
    );

    return this.updateSessionState({
      progress: {
        current_story: nextStoryId || (storiesPending[0] || null),
        stories_done: storiesDone,
        stories_pending: storiesPending,
      },
      workflow: {
        current_phase: null,
        attempt_count: 0,
        phase_results: {},
      },
      last_action: {
        type: ActionType.STORY_COMPLETED,
        story: storyId,
        phase: null,
      },
    });
  }

  /**
   * Records a user pause action
   * @param {string} storyId - Current story ID
   * @param {string} phase - Current phase
   * @returns {Promise<Object>} Updated session state
   */
  async recordPause(storyId, phase) {
    return this.updateSessionState({
      last_action: {
        type: ActionType.PAUSE,
        story: storyId,
        phase: phase,
      },
    });
  }

  /**
   * Sets a session-level override (Story 12.7 - AC6)
   * Session overrides are temporary and only last for the current session.
   *
   * @param {string} key - Override key (e.g., 'educational_mode')
   * @param {*} value - Override value (null to clear)
   * @returns {Promise<Object>} Updated session state
   */
  async setSessionOverride(key, value) {
    if (!this.state) {
      throw new Error('Session state not initialized. Call loadSessionState() or createSessionState() first.');
    }

    const now = new Date().toISOString();

    // Ensure overrides field exists (backward compatibility)
    if (!this.state.session_state.overrides) {
      this.state.session_state.overrides = {};
    }

    // Set the override
    this.state.session_state.overrides[key] = value;
    this.state.session_state.last_updated = now;

    await this.save();

    if (this.options.debug) {
      console.log(`[SessionState] Set session override: ${key} = ${value}`);
    }

    return this.state;
  }

  /**
   * Gets a session-level override (Story 12.7 - AC6)
   *
   * @param {string} key - Override key (e.g., 'educational_mode')
   * @returns {*} Override value or null if not set
   */
  getSessionOverride(key) {
    if (!this.state?.session_state?.overrides) {
      return null;
    }
    return this.state.session_state.overrides[key] ?? null;
  }

  /**
   * Clears a session-level override (Story 12.7 - AC6)
   *
   * @param {string} key - Override key to clear
   * @returns {Promise<Object>} Updated session state
   */
  async clearSessionOverride(key) {
    return this.setSessionOverride(key, null);
  }

  /**
   * Gets all session overrides
   * @returns {Object} All current overrides
   */
  getSessionOverrides() {
    if (!this.state?.session_state?.overrides) {
      return {};
    }
    return { ...this.state.session_state.overrides };
  }

  /**
   * Generates human-readable resume instructions
   * @param {Object} context - Context for instructions
   * @returns {string} Resume instructions text
   */
  generateResumeInstructions(context) {
    const { currentStory, storiesDone, totalStories, lastPhase, lastExecutor } = context;

    let instructions = '';

    if (currentStory) {
      instructions += `Story ${currentStory} estava em fase de ${lastPhase || 'início'}.\n`;
    }

    if (lastExecutor) {
      instructions += `${lastExecutor} estava trabalhando no desenvolvimento.\n`;
    }

    instructions += `Progresso: ${storiesDone} de ${totalStories} stories completas.\n`;
    instructions += 'Próximo passo: continuar implementação ou revisar o que foi feito.';

    return instructions;
  }

  /**
   * Detects if session was interrupted by a crash
   * @returns {Promise<Object>} Crash detection result
   */
  async detectCrash() {
    if (!this.state) {
      await this.loadSessionState();
    }

    if (!this.state) {
      return { isCrash: false, reason: 'No session state found' };
    }

    const lastUpdated = new Date(this.state.session_state.last_updated);
    const lastActionType = this.state.session_state.last_action.type;
    const now = new Date();

    // Calculate minutes since last update
    const minutesSinceUpdate = (now - lastUpdated) / (1000 * 60);

    // Crash detected if:
    // - last_updated > 30 min AND
    // - last_action.type is NOT PAUSE or COMPLETE (STORY_COMPLETED)
    const normalEndStates = [ActionType.PAUSE, ActionType.STORY_COMPLETED, ActionType.ABORT];
    const isCrash = minutesSinceUpdate > CRASH_THRESHOLD_MINUTES && !normalEndStates.includes(lastActionType);

    return {
      isCrash,
      minutesSinceUpdate: Math.round(minutesSinceUpdate),
      lastActionType,
      lastPhase: this.state.session_state.last_action.phase,
      lastStory: this.state.session_state.last_action.story,
      reason: isCrash
        ? `Session appears to have crashed ${Math.round(minutesSinceUpdate)} minutes ago during ${lastActionType}`
        : 'Session ended normally',
    };
  }

  /**
   * Gets resume options menu
   * @returns {Object} Resume options with labels
   */
  getResumeOptions() {
    return {
      [ResumeOption.CONTINUE]: {
        label: 'Continuar de onde parou',
        description: 'Resume from last saved state',
      },
      [ResumeOption.REVIEW]: {
        label: 'Revisar o que foi feito',
        description: 'Show progress summary before continuing',
      },
      [ResumeOption.RESTART]: {
        label: `Recomeçar story ${this.state?.session_state.progress.current_story} do zero`,
        description: 'Restart current story from beginning',
      },
      [ResumeOption.DISCARD]: {
        label: 'Iniciar novo épico (descarta sessão)',
        description: 'Discard current session and start fresh',
      },
    };
  }

  /**
   * Generates a formatted resume summary for display
   * @returns {string} Formatted resume summary
   */
  getResumeSummary() {
    if (!this.state) {
      return 'No session state loaded.';
    }

    const { epic, progress, last_action } = this.state.session_state;

    return `🔄 Sessão anterior detectada!

Epic: ${epic.title}
Progresso: ${progress.stories_done.length} de ${epic.total_stories} stories completas
Último story: ${progress.current_story}
Fase quando pausou: ${last_action.phase || 'N/A'}

O que você quer fazer?

[1] Continuar de onde parou
[2] Revisar o que foi feito
[3] Recomeçar story ${progress.current_story} do zero
[4] Iniciar novo épico (descarta sessão)`;
  }

  /**
   * Handles resume option selection
   * @param {string} option - Selected resume option
   * @returns {Promise<Object>} Resume action result
   */
  async handleResumeOption(option) {
    switch (option) {
      case ResumeOption.CONTINUE:
        return {
          action: 'continue',
          story: this.state.session_state.progress.current_story,
          phase: this.state.session_state.workflow.current_phase,
        };

      case ResumeOption.REVIEW:
        return {
          action: 'review',
          summary: this.getProgressSummary(),
        };

      case ResumeOption.RESTART:
        // Reset workflow state but keep progress
        await this.updateSessionState({
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: new Date().toISOString(),
          },
          last_action: {
            type: ActionType.STORY_STARTED,
            story: this.state.session_state.progress.current_story,
            phase: null,
          },
        });
        return {
          action: 'restart',
          story: this.state.session_state.progress.current_story,
        };

      case ResumeOption.DISCARD:
        await this.discard();
        return {
          action: 'discard',
          message: 'Session discarded. Ready for new epic.',
        };

      default:
        throw new Error(`Unknown resume option: ${option}`);
    }
  }

  /**
   * Gets a detailed progress summary
   * @returns {Object} Progress summary
   */
  getProgressSummary() {
    if (!this.state) {
      return null;
    }

    const { epic, progress, workflow, context_snapshot } = this.state.session_state;

    return {
      epic: {
        id: epic.id,
        title: epic.title,
        totalStories: epic.total_stories,
      },
      progress: {
        completed: progress.stories_done.length,
        total: epic.total_stories,
        percentage: epic.total_stories > 0
          ? Math.round((progress.stories_done.length / epic.total_stories) * 100)
          : 0,
        storiesDone: progress.stories_done,
        storiesPending: progress.stories_pending,
        currentStory: progress.current_story,
      },
      workflow: {
        currentPhase: workflow.current_phase,
        attemptCount: workflow.attempt_count,
        phaseResults: workflow.phase_results,
      },
      context: {
        filesModified: context_snapshot.files_modified,
        executorDistribution: context_snapshot.executor_distribution,
        branch: context_snapshot.branch,
      },
    };
  }

  /**
   * Migrates from legacy workflow state (ADR-011)
   * @returns {Promise<boolean>} True if migration occurred
   */
  async migrateFromWorkflowState() {
    try {
      // Check if legacy workflow state directory exists
      if (!fsSync.existsSync(this.legacyStatePath)) {
        return false;
      }

      // Find state files in legacy directory
      const files = await fs.readdir(this.legacyStatePath);
      const stateFiles = files.filter((f) => f.endsWith('-state.yaml'));

      if (stateFiles.length === 0) {
        return false;
      }

      if (this.options.debug) {
        console.log(`[SessionState] Found ${stateFiles.length} legacy workflow state files to migrate`);
      }

      // Read the most recent state file
      const latestStateFile = stateFiles.sort().pop();
      const legacyContent = await fs.readFile(
        path.join(this.legacyStatePath, latestStateFile),
        'utf8',
      );
      const legacyState = yaml.load(legacyContent);

      // Create new session state from legacy
      this.state = {
        session_state: {
          version: SESSION_STATE_VERSION,
          last_updated: new Date().toISOString(),

          // Create minimal epic context (will need to be updated)
          epic: {
            id: 'migrated',
            title: 'Migrated from Workflow State',
            total_stories: 1,
          },

          // Migrate progress
          progress: {
            current_story: legacyState.currentStory || null,
            stories_done: [],
            stories_pending: [],
          },

          // Migrate workflow state
          workflow: {
            current_phase: legacyState.currentPhase || null,
            attempt_count: legacyState.attemptCount || 0,
            phase_results: legacyState.phaseResults || {},
            started_at: legacyState.startedAt || new Date().toISOString(),
          },

          // Create last action
          last_action: {
            type: ActionType.PHASE_CHANGE,
            timestamp: legacyState.lastUpdated || new Date().toISOString(),
            story: legacyState.currentStory || null,
            phase: legacyState.currentPhase || null,
          },

          // Migrate context
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: legacyState.executor || null,
            branch: 'main',
          },

          resume_instructions: 'Migrated from legacy workflow state. Please review and continue.',

          // Story 12.7: Initialize overrides (empty on migration)
          overrides: {
            educational_mode: null,
          },
        },
      };

      // Save migrated state
      await this.save();

      // Archive legacy files (rename, don't delete)
      for (const file of stateFiles) {
        const oldPath = path.join(this.legacyStatePath, file);
        const newPath = path.join(this.legacyStatePath, `${file}.migrated`);
        await fs.rename(oldPath, newPath);
      }

      if (this.options.debug) {
        console.log('[SessionState] Migration complete. Legacy files archived.');
      }

      return true;
    } catch (error) {
      if (this.options.debug) {
        console.log(`[SessionState] Migration failed: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Saves the current state to disk
   * @returns {Promise<void>}
   */
  async save() {
    if (!this.state) {
      throw new Error('No state to save');
    }

    // Ensure directory exists
    const dir = path.dirname(this.stateFilePath);
    await fs.mkdir(dir, { recursive: true });

    // Write state file
    const content = yaml.dump(this.state, {
      lineWidth: 120,
      noRefs: true,
    });

    await fs.writeFile(this.stateFilePath, content, 'utf8');
  }

  /**
   * Discards the current session state
   * @returns {Promise<void>}
   */
  async discard() {
    if (await this.exists()) {
      // Archive instead of delete
      const archivePath = `${this.stateFilePath}.discarded.${Date.now()}`;
      await fs.rename(this.stateFilePath, archivePath);

      if (this.options.debug) {
        console.log(`[SessionState] Session archived to: ${archivePath}`);
      }
    }

    this.state = null;
  }

  /**
   * Validates session state schema
   * @param {Object} state - State to validate
   * @returns {Object} Validation result
   */
  static validateSchema(state) {
    const errors = [];

    if (!state?.session_state) {
      errors.push('Missing session_state root');
      return { isValid: false, errors };
    }

    const ss = state.session_state;

    // Validate version
    if (!ss.version) {
      errors.push('Missing version field');
    }

    // Validate epic (AC2)
    if (!ss.epic?.id || !ss.epic?.title || ss.epic?.total_stories === undefined) {
      errors.push('Invalid epic field: requires id, title, total_stories');
    }

    // Validate progress (AC3)
    if (!ss.progress || !Array.isArray(ss.progress.stories_done) || !Array.isArray(ss.progress.stories_pending)) {
      errors.push('Invalid progress field: requires current_story, stories_done[], stories_pending[]');
    }

    // Validate last_action (AC4)
    if (!ss.last_action?.type || !ss.last_action?.timestamp) {
      errors.push('Invalid last_action field: requires type, timestamp, story, phase');
    }

    // Validate context_snapshot (AC5)
    if (ss.context_snapshot?.files_modified === undefined) {
      errors.push('Invalid context_snapshot field: requires files_modified, executor_distribution, branch');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Creates a new SessionState instance
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Options
 * @returns {SessionState} SessionState instance
 */
function createSessionState(projectRoot, options = {}) {
  return new SessionState(projectRoot, options);
}

/**
 * Checks if a session state exists for the project
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<boolean>} True if session state exists
 */
async function sessionStateExists(projectRoot) {
  const sessionState = new SessionState(projectRoot);
  return sessionState.exists();
}

/**
 * Loads session state from project
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Options
 * @returns {Promise<Object|null>} Session state or null
 */
async function loadSessionState(projectRoot, options = {}) {
  const sessionState = new SessionState(projectRoot, options);
  return sessionState.loadSessionState();
}

module.exports = {
  SessionState,
  createSessionState,
  sessionStateExists,
  loadSessionState,
  ActionType,
  Phase,
  ResumeOption,
  SESSION_STATE_VERSION,
  SESSION_STATE_FILENAME,
  CRASH_THRESHOLD_MINUTES,
};
