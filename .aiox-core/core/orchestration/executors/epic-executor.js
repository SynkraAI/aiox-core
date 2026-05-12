/**
 * EpicExecutor - Base class for all ADE Epic Executors
 *
 * Story: 0.3 - Epic Executors
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Provides common interface and utilities for epic execution.
 * Each epic has a dedicated executor that encapsulates its specific logic.
 *
 * @module core/orchestration/executors/epic-executor
 * @version 1.0.0
 * @author @dev (Dex)
 */

/**
 * Execution status enum
 * @enum {string}
 */
const ExecutionStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  SKIPPED: 'skipped',
};

/**
 * Base class for Epic Executors (AC1)
 * All epic-specific executors extend this class
 */
class EpicExecutor {
  /**
   * Create an EpicExecutor
   * @param {Object} orchestrator - Parent MasterOrchestrator instance
   * @param {number} epicNum - Epic number (3, 4, 5, 6, or 7)
   */
  constructor(orchestrator, epicNum) {
    this.orchestrator = orchestrator;
    this.epicNum = epicNum;

    // Execution state
    this.status = ExecutionStatus.PENDING;
    this.startTime = null;
    this.endTime = null;
    this.artifacts = [];
    this.errors = [];
    this.logs = [];

    // Configuration from orchestrator
    this.projectRoot = orchestrator?.projectRoot || process.cwd();
    this.storyId = orchestrator?.storyId || null;
  }

  /**
   * Execute the epic - must be implemented by subclasses
   * @param {Object} context - Execution context from orchestrator
   * @returns {Promise<Object>} Execution result
   * @abstract
   */
  async execute(_context) {
    throw new Error(`${this.constructor.name} must implement execute()`);
  }

  /**
   * Get standardized result (AC7)
   * @returns {Object} Standardized execution result
   */
  getResult() {
    return {
      epicNum: this.epicNum,
      status: this.status,
      success: this.status === ExecutionStatus.SUCCESS,
      artifacts: this.artifacts,
      errors: this.errors,
      duration: this._getDuration(),
      durationMs: this._getDurationMs(),
      startTime: this.startTime,
      endTime: this.endTime,
      logs: this.logs,
    };
  }

  /**
   * Start execution - call at beginning of execute()
   * @protected
   */
  _startExecution() {
    this.status = ExecutionStatus.RUNNING;
    this.startTime = new Date().toISOString();
    this._log(`Starting Epic ${this.epicNum} execution`);
  }

  /**
   * Complete execution successfully
   * @param {Object} [result] - Optional result data to merge
   * @protected
   */
  _completeExecution(result = {}) {
    this.status = ExecutionStatus.SUCCESS;
    this.endTime = new Date().toISOString();
    this._log(`Epic ${this.epicNum} completed successfully`);

    return {
      ...this.getResult(),
      ...result,
    };
  }

  /**
   * Fail execution with error
   * @param {Error|string} error - Error or error message
   * @protected
   */
  _failExecution(error) {
    this.status = ExecutionStatus.FAILED;
    this.endTime = new Date().toISOString();

    const errorMessage = error instanceof Error ? error.message : error;
    this.errors.push({
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    this._log(`Epic ${this.epicNum} failed: ${errorMessage}`, 'error');

    return {
      ...this.getResult(),
      error: errorMessage,
    };
  }

  /**
   * Skip execution with reason
   * @param {string} reason - Skip reason
   * @protected
   */
  _skipExecution(reason) {
    this.status = ExecutionStatus.SKIPPED;
    this.endTime = new Date().toISOString();
    this._log(`Epic ${this.epicNum} skipped: ${reason}`);

    return {
      ...this.getResult(),
      skipped: true,
      skipReason: reason,
    };
  }

  /**
   * Add artifact to results
   * @param {string} type - Artifact type (file, report, data)
   * @param {string} path - Path or identifier
   * @param {Object} [metadata] - Additional metadata
   * @protected
   */
  _addArtifact(type, path, metadata = {}) {
    this.artifacts.push({
      type,
      path,
      createdAt: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Log message
   * @param {string} message - Log message
   * @param {string} [level='info'] - Log level
   * @protected
   */
  _log(message, level = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      epic: this.epicNum,
    };
    this.logs.push(entry);

    // Also log to console if orchestrator has logging
    if (this.orchestrator?._log) {
      this.orchestrator._log(`[Epic${this.epicNum}] ${message}`, { level });
    }
  }

  /**
   * Get duration as formatted string
   * @private
   */
  _getDuration() {
    const ms = this._getDurationMs();
    if (!ms) return null;

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Get duration in milliseconds
   * @private
   */
  _getDurationMs() {
    if (!this.startTime || !this.endTime) return null;
    return new Date(this.endTime).getTime() - new Date(this.startTime).getTime();
  }

  /**
   * Validate context has required fields
   * @param {Object} context - Context to validate
   * @param {string[]} required - Required field names
   * @protected
   */
  _validateContext(context, required) {
    const missing = required.filter((field) => context[field] === undefined);
    if (missing.length > 0) {
      throw new Error(`Missing required context fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Get path relative to project root
   * @param {...string} segments - Path segments
   * @protected
   */
  _getPath(...segments) {
    const path = require('path');
    return path.join(this.projectRoot, ...segments);
  }
}

module.exports = EpicExecutor;
module.exports.ExecutionStatus = ExecutionStatus;
