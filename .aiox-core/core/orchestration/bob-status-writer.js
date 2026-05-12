/**
 * Bob Status Writer
 *
 * Story 12.6: Observability Panel Integration + Dashboard Bridge
 * PRD Reference: §3.8 (Painel de Observabilidade do Bob)
 *
 * Writes Bob orchestration state to `.aiox/dashboard/bob-status.json`
 * for dashboard consumption. Follows CLI First principle — CLI panel
 * works standalone, Dashboard is optional consumer.
 *
 * Features:
 * - Atomic file writes (temp file + rename)
 * - Single source of truth schema shared with WebSocket events
 * - Integrates with DashboardIntegration (extends, doesn't duplicate)
 *
 * @module core/orchestration/bob-status-writer
 * @version 1.0.0
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * Bob Status Schema version
 * @constant {string}
 */
const BOB_STATUS_VERSION = '1.0';

/**
 * Bob Status Schema (Story 12.6 - AC9: Single source of truth)
 * Used by both bob-status.json and WebSocket events
 *
 * @typedef {Object} BobStatusSchema
 * @property {string} version - Schema version
 * @property {string} timestamp - ISO8601 timestamp
 * @property {Object} orchestration - Orchestration state
 * @property {boolean} orchestration.active - Whether Bob is actively orchestrating
 * @property {string} orchestration.mode - Orchestration mode ('bob')
 * @property {string} orchestration.epic_id - Current epic ID
 * @property {string} orchestration.current_story - Current story ID
 * @property {Object} pipeline - Pipeline state
 * @property {string[]} pipeline.stages - All pipeline stages
 * @property {string} pipeline.current_stage - Current stage
 * @property {string} pipeline.story_progress - Progress string (e.g., '3/8')
 * @property {string[]} pipeline.completed_stages - Completed stages
 * @property {Object} current_agent - Current agent info
 * @property {string} current_agent.id - Agent ID (e.g., '@dev')
 * @property {string} current_agent.name - Agent name (e.g., 'Dex')
 * @property {string} current_agent.task - Current task
 * @property {string} current_agent.reason - Why this agent was assigned
 * @property {string} current_agent.started_at - ISO8601 timestamp
 * @property {Object[]} active_terminals - Active terminal processes
 * @property {Object[]} surface_decisions - Decisions surfaced to user
 * @property {Object} elapsed - Elapsed time info
 * @property {number} elapsed.story_seconds - Seconds on current story
 * @property {number} elapsed.session_seconds - Total session seconds
 * @property {Object[]} errors - Current errors
 * @property {Object} educational - Educational mode data
 * @property {boolean} educational.enabled - Whether educational mode is on
 * @property {Object[]} educational.tradeoffs - Trade-off decisions shown
 * @property {Object[]} educational.reasoning - Reasoning explanations
 */

/**
 * Default pipeline stages
 * @constant {string[]}
 */
const DEFAULT_PIPELINE_STAGES = [
  'validation',
  'development',
  'self_healing',
  'quality_gate',
  'push',
  'checkpoint',
];

/**
 * Creates the default Bob status schema
 * @returns {BobStatusSchema} Default status object
 */
function createDefaultBobStatus() {
  return {
    version: BOB_STATUS_VERSION,
    timestamp: new Date().toISOString(),
    orchestration: {
      active: false,
      mode: 'bob',
      epic_id: null,
      current_story: null,
    },
    pipeline: {
      stages: DEFAULT_PIPELINE_STAGES,
      current_stage: null,
      story_progress: '0/0',
      completed_stages: [],
    },
    current_agent: {
      id: null,
      name: null,
      task: null,
      reason: null,
      started_at: null,
    },
    active_terminals: [],
    surface_decisions: [],
    elapsed: {
      story_seconds: 0,
      session_seconds: 0,
    },
    errors: [],
    educational: {
      enabled: false,
      tradeoffs: [],
      reasoning: [],
    },
  };
}

/**
 * BobStatusWriter - Writes Bob orchestration state for dashboard consumption
 */
class BobStatusWriter {
  /**
   * Creates a new BobStatusWriter instance
   * @param {string} projectRoot - Project root directory
   * @param {Object} [options] - Writer options
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(projectRoot, options = {}) {
    if (!projectRoot || typeof projectRoot !== 'string') {
      throw new Error('projectRoot is required and must be a string');
    }

    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      ...options,
    };

    this.dashboardDir = path.join(projectRoot, '.aiox', 'dashboard');
    this.statusPath = path.join(this.dashboardDir, 'bob-status.json');

    // Internal state tracking
    this._status = createDefaultBobStatus();
    this._sessionStartTime = Date.now();
    this._storyStartTime = null;
  }

  /**
   * Initializes the writer and creates the status file
   * @returns {Promise<void>}
   */
  async initialize() {
    await fs.ensureDir(this.dashboardDir);
    this._status = createDefaultBobStatus();
    this._status.orchestration.active = true;
    this._sessionStartTime = Date.now();
    await this.writeBobStatus(this._status);
    this._log('BobStatusWriter initialized');
  }

  /**
   * Writes Bob status atomically (temp file + rename) (AC6, AC11)
   * @param {BobStatusSchema} state - Status to write
   * @returns {Promise<void>}
   */
  async writeBobStatus(state) {
    try {
      await fs.ensureDir(this.dashboardDir);

      // Update timestamp
      state.timestamp = new Date().toISOString();

      // Update elapsed times
      const now = Date.now();
      state.elapsed.session_seconds = Math.floor((now - this._sessionStartTime) / 1000);
      if (this._storyStartTime) {
        state.elapsed.story_seconds = Math.floor((now - this._storyStartTime) / 1000);
      }

      // Atomic write: write to temp file, then rename
      const tempPath = path.join(os.tmpdir(), `bob-status-${Date.now()}.json`);
      await fs.writeJson(tempPath, state, { spaces: 2 });
      await fs.move(tempPath, this.statusPath, { overwrite: true });

      this._status = state;
      this._log(`Status written: stage=${state.pipeline.current_stage}, agent=${state.current_agent.id}`);
    } catch (error) {
      this._log(`Failed to write status: ${error.message}`);
      // Silent failure - never interrupt CLI (CLI First principle)
    }
  }

  /**
   * Updates orchestration state
   * @param {Object} orchestration - Orchestration updates
   * @returns {Promise<void>}
   */
  async updateOrchestration(orchestration) {
    this._status.orchestration = { ...this._status.orchestration, ...orchestration };
    await this.writeBobStatus(this._status);
  }

  /**
   * Updates pipeline phase (AC6)
   * @param {string} phase - Current phase
   * @param {string} [storyProgress] - Story progress string
   * @returns {Promise<void>}
   */
  async updatePhase(phase, storyProgress = null) {
    this._status.pipeline.current_stage = phase;
    if (storyProgress) {
      this._status.pipeline.story_progress = storyProgress;
    }
    await this.writeBobStatus(this._status);
  }

  /**
   * Marks a phase as completed
   * @param {string} phase - Phase to mark as completed
   * @returns {Promise<void>}
   */
  async completePhase(phase) {
    if (!this._status.pipeline.completed_stages.includes(phase)) {
      this._status.pipeline.completed_stages.push(phase);
    }
    await this.writeBobStatus(this._status);
  }

  /**
   * Updates current agent (AC6)
   * @param {string} id - Agent ID
   * @param {string} name - Agent name
   * @param {string} task - Current task
   * @param {string} [reason] - Assignment reason
   * @returns {Promise<void>}
   */
  async updateAgent(id, name, task, reason = null) {
    this._status.current_agent = {
      id,
      name,
      task,
      reason,
      started_at: new Date().toISOString(),
    };
    await this.writeBobStatus(this._status);
  }

  /**
   * Clears current agent
   * @returns {Promise<void>}
   */
  async clearAgent() {
    this._status.current_agent = {
      id: null,
      name: null,
      task: null,
      reason: null,
      started_at: null,
    };
    await this.writeBobStatus(this._status);
  }

  /**
   * Adds an active terminal (AC6)
   * @param {string} agent - Agent ID
   * @param {number} pid - Process ID
   * @param {string} task - Task description
   * @returns {Promise<void>}
   */
  async addTerminal(agent, pid, task) {
    this._status.active_terminals.push({
      agent,
      pid,
      task,
      started_at: new Date().toISOString(),
    });
    await this.writeBobStatus(this._status);
  }

  /**
   * Removes an active terminal
   * @param {number} pid - Process ID to remove
   * @returns {Promise<void>}
   */
  async removeTerminal(pid) {
    this._status.active_terminals = this._status.active_terminals.filter((t) => t.pid !== pid);
    await this.writeBobStatus(this._status);
  }

  /**
   * Records a surface decision (AC6)
   * @param {string} criteria - Decision criteria ID
   * @param {string} action - Action taken
   * @param {Object} [context] - Additional context
   * @returns {Promise<void>}
   */
  async recordSurfaceDecision(criteria, action, context = {}) {
    this._status.surface_decisions.push({
      criteria,
      action,
      context,
      timestamp: new Date().toISOString(),
      resolved: false,
    });
    await this.writeBobStatus(this._status);
  }

  /**
   * Resolves a surface decision
   * @param {string} criteria - Criteria ID to resolve
   * @returns {Promise<void>}
   */
  async resolveSurfaceDecision(criteria) {
    const decision = this._status.surface_decisions.find((d) => d.criteria === criteria && !d.resolved);
    if (decision) {
      decision.resolved = true;
      decision.resolved_at = new Date().toISOString();
    }
    await this.writeBobStatus(this._status);
  }

  /**
   * Adds an error (AC6)
   * @param {string} phase - Phase where error occurred
   * @param {string} message - Error message
   * @param {boolean} [recoverable=true] - Whether error is recoverable
   * @returns {Promise<void>}
   */
  async addError(phase, message, recoverable = true) {
    this._status.errors.push({
      phase,
      message,
      recoverable,
      timestamp: new Date().toISOString(),
    });
    await this.writeBobStatus(this._status);
  }

  /**
   * Clears errors
   * @returns {Promise<void>}
   */
  async clearErrors() {
    this._status.errors = [];
    await this.writeBobStatus(this._status);
  }

  /**
   * Updates educational mode data
   * @param {Object} educational - Educational mode updates
   * @returns {Promise<void>}
   */
  async updateEducational(educational) {
    this._status.educational = { ...this._status.educational, ...educational };
    await this.writeBobStatus(this._status);
  }

  /**
   * Adds a trade-off decision (educational mode)
   * @param {string} choice - Choice description
   * @param {string} selected - Selected option
   * @param {string} reason - Reason for choice
   * @returns {Promise<void>}
   */
  async addTradeoff(choice, selected, reason) {
    this._status.educational.tradeoffs.push({
      choice,
      selected,
      reason,
      timestamp: new Date().toISOString(),
    });
    await this.writeBobStatus(this._status);
  }

  /**
   * Starts story timer
   * @param {string} storyId - Story ID
   * @returns {Promise<void>}
   */
  async startStory(storyId) {
    this._storyStartTime = Date.now();
    this._status.orchestration.current_story = storyId;
    this._status.elapsed.story_seconds = 0;
    this._status.pipeline.completed_stages = [];
    await this.writeBobStatus(this._status);
  }

  /**
   * Sets the current story progress
   * @param {string} progress - Progress string (e.g., '3/8')
   * @returns {Promise<void>}
   */
  async setStoryProgress(progress) {
    this._status.pipeline.story_progress = progress;
    await this.writeBobStatus(this._status);
  }

  /**
   * Sets the epic ID
   * @param {string} epicId - Epic ID
   * @returns {Promise<void>}
   */
  async setEpicId(epicId) {
    this._status.orchestration.epic_id = epicId;
    await this.writeBobStatus(this._status);
  }

  /**
   * Marks orchestration as complete
   * @returns {Promise<void>}
   */
  async complete() {
    this._status.orchestration.active = false;
    await this.writeBobStatus(this._status);
    this._log('BobStatusWriter completed');
  }

  /**
   * Gets the current status (for external consumers)
   * @returns {BobStatusSchema} Current status
   */
  getStatus() {
    return { ...this._status };
  }

  /**
   * Gets the status file path
   * @returns {string} Path to bob-status.json
   */
  getStatusPath() {
    return this.statusPath;
  }

  /**
   * Reads current status from file
   * @returns {Promise<BobStatusSchema|null>} Status or null if not found
   */
  async readStatus() {
    try {
      if (await fs.pathExists(this.statusPath)) {
        return await fs.readJson(this.statusPath);
      }
    } catch (error) {
      this._log(`Failed to read status: ${error.message}`);
    }
    return null;
  }

  /**
   * Debug logger
   * @param {string} message - Log message
   * @private
   */
  _log(message) {
    if (this.options.debug) {
      console.log(`[BobStatusWriter] ${message}`);
    }
  }
}

/**
 * Bob Status Schema constant for export (AC9: Single source of truth)
 * Shared between BobStatusWriter and DashboardEmitter
 */
const BOB_STATUS_SCHEMA = {
  version: BOB_STATUS_VERSION,
  stages: DEFAULT_PIPELINE_STAGES,
  createDefault: createDefaultBobStatus,
};

module.exports = {
  BobStatusWriter,
  BOB_STATUS_SCHEMA,
  BOB_STATUS_VERSION,
  DEFAULT_PIPELINE_STAGES,
  createDefaultBobStatus,
};
