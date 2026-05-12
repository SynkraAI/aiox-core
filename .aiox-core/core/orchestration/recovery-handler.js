/**
 * Recovery Handler - Story 0.5
 *
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Manages automatic error recovery for the orchestration pipeline.
 * Integrates with stuck-detector, rollback-manager, and recovery-tracker.
 *
 * Features:
 * - AC1: handleEpicFailure(epicNum, error) method
 * - AC2: Recovery strategies: RETRY, ROLLBACK_AND_RETRY, SKIP, ESCALATE
 * - AC3: Integrates with stuck-detector for loop detection
 * - AC4: Integrates with rollback-manager for state rollback
 * - AC5: Max retries configurable (default: 3)
 * - AC6: Automatic escalation after max retries
 * - AC7: Detailed logs for each recovery attempt
 *
 * @module core/orchestration/recovery-handler
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              RECOVERY STRATEGIES (AC2)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Recovery strategies enum
 */
const RecoveryStrategy = {
  /** Retry the same epic with same approach */
  RETRY_SAME_APPROACH: 'retry_same_approach',
  /** Rollback and retry with different approach */
  ROLLBACK_AND_RETRY: 'rollback_and_retry',
  /** Skip the failed phase and continue */
  SKIP_PHASE: 'skip_phase',
  /** Escalate to human for manual intervention */
  ESCALATE_TO_HUMAN: 'escalate_to_human',
  /** Trigger recovery workflow (Epic 5) */
  TRIGGER_RECOVERY_WORKFLOW: 'trigger_recovery_workflow',
};

/**
 * Recovery result enum
 */
const RecoveryResult = {
  SUCCESS: 'success',
  FAILED: 'failed',
  ESCALATED: 'escalated',
  SKIPPED: 'skipped',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              RECOVERY HANDLER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * RecoveryHandler - Manages automatic error recovery (AC1)
 */
class RecoveryHandler extends EventEmitter {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.projectRoot - Project root path
   * @param {string} options.storyId - Story ID
   * @param {number} [options.maxRetries=3] - Max retries per epic (AC5)
   * @param {boolean} [options.autoEscalate=true] - Auto-escalate after max retries (AC6)
   * @param {boolean} [options.circularDetection=true] - Enable circular approach detection
   * @param {Object} [options.orchestrator] - Parent orchestrator instance
   */
  constructor(options = {}) {
    super();

    this.projectRoot = options.projectRoot || process.cwd();
    this.storyId = options.storyId;
    this.maxRetries = options.maxRetries ?? 3; // AC5
    this.autoEscalate = options.autoEscalate ?? true; // AC6
    this.circularDetection = options.circularDetection ?? true;
    this.orchestrator = options.orchestrator;

    // Track attempts and logs (AC7)
    this.attempts = {};
    this.logs = [];

    // Lazy-load external recovery modules (AC3, AC4)
    this._stuckDetector = null;
    this._rollbackManager = null;
    this._recoveryTracker = null;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              EXTERNAL MODULE INTEGRATION (AC3, AC4)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Get StuckDetector instance (AC3)
   * @private
   */
  _getStuckDetector() {
    if (!this._stuckDetector) {
      try {
        const { StuckDetector } = require('../../infrastructure/scripts/stuck-detector');
        this._stuckDetector = new StuckDetector({
          maxAttempts: this.maxRetries,
          circularDetection: this.circularDetection,
          verbose: false,
        });
      } catch (error) {
        this._log(`StuckDetector not available: ${error.message}`, 'warn');
      }
    }
    return this._stuckDetector;
  }

  /**
   * Get RollbackManager instance (AC4)
   * @private
   */
  _getRollbackManager() {
    if (!this._rollbackManager) {
      try {
        const { RollbackManager } = require('../../infrastructure/scripts/rollback-manager');
        this._rollbackManager = new RollbackManager({
          storyId: this.storyId,
          rootPath: this.projectRoot,
        });
      } catch (error) {
        this._log(`RollbackManager not available: ${error.message}`, 'warn');
      }
    }
    return this._rollbackManager;
  }

  /**
   * Get RecoveryTracker instance
   * @private
   */
  _getRecoveryTracker() {
    if (!this._recoveryTracker) {
      try {
        const { RecoveryTracker } = require('../../infrastructure/scripts/recovery-tracker');
        this._recoveryTracker = new RecoveryTracker({
          storyId: this.storyId,
          rootPath: this.projectRoot,
        });
      } catch (error) {
        this._log(`RecoveryTracker not available: ${error.message}`, 'warn');
      }
    }
    return this._recoveryTracker;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              MAIN RECOVERY HANDLER (AC1)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Handle epic failure with automatic recovery (AC1)
   *
   * @param {number} epicNum - Failed epic number
   * @param {Error|string} error - Error that caused failure
   * @param {Object} [context={}] - Additional context
   * @returns {Promise<Object>} Recovery result
   */
  async handleEpicFailure(epicNum, error, context = {}) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const timestamp = new Date().toISOString();

    this._log(`Handling failure for Epic ${epicNum}: ${errorMessage}`, 'error');

    // Initialize attempts tracking for this epic
    if (!this.attempts[epicNum]) {
      this.attempts[epicNum] = [];
    }

    // Record this failure attempt (AC7)
    const attemptNum = this.attempts[epicNum].length + 1;
    const attempt = {
      number: attemptNum,
      timestamp,
      error: errorMessage,
      approach: context.approach || 'default',
      epicNum,
      context,
    };
    this.attempts[epicNum].push(attempt);

    // Check if stuck using StuckDetector (AC3)
    const stuckResult = this._checkIfStuck(epicNum);

    // Select recovery strategy (AC2)
    const strategy = this._selectRecoveryStrategy(epicNum, error, stuckResult, context);

    this._log(`Selected strategy: ${strategy}`, 'info');

    // Execute recovery based on strategy
    const result = await this._executeRecoveryStrategy(epicNum, strategy, error, context);

    // Record recovery result (AC7)
    attempt.recoveryStrategy = strategy;
    attempt.recoveryResult = result.success ? RecoveryResult.SUCCESS : RecoveryResult.FAILED;
    attempt.recoveryDetails = result;

    // Emit event
    this.emit('recoveryAttempt', {
      epicNum,
      attempt: attemptNum,
      strategy,
      result,
    });

    return result;
  }

  /**
   * Check if execution is stuck (AC3)
   * @private
   */
  _checkIfStuck(epicNum) {
    const detector = this._getStuckDetector();
    if (!detector) {
      return { stuck: false, reason: null };
    }

    const attempts = this.attempts[epicNum] || [];
    const formattedAttempts = attempts.map((a) => ({
      success: false,
      approach: a.approach,
      error: a.error,
      timestamp: a.timestamp,
    }));

    return detector.check(formattedAttempts);
  }

  /**
   * Select recovery strategy based on error type and context (AC2)
   * @private
   */
  _selectRecoveryStrategy(epicNum, error, stuckResult, _context = {}) {
    const attemptCount = (this.attempts[epicNum] || []).length;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // AC6: Escalate after max retries
    if (attemptCount >= this.maxRetries && this.autoEscalate) {
      this._log(`Max retries (${this.maxRetries}) reached, escalating...`, 'warn');
      return RecoveryStrategy.ESCALATE_TO_HUMAN;
    }

    // Circular approach detected - need different approach (AC3)
    if (stuckResult.stuck && stuckResult.reason?.includes('circular')) {
      this._log('Circular approach detected, triggering rollback...', 'warn');
      return RecoveryStrategy.ROLLBACK_AND_RETRY;
    }

    // Too many consecutive failures - escalate (only if autoEscalate enabled)
    if (
      stuckResult.stuck &&
      stuckResult.context?.consecutiveFailures >= this.maxRetries &&
      this.autoEscalate
    ) {
      this._log('Too many consecutive failures, escalating...', 'warn');
      return RecoveryStrategy.ESCALATE_TO_HUMAN;
    }

    // Analyze error type to select strategy
    const errorType = this._classifyError(errorMessage);

    switch (errorType) {
      case 'transient':
        // Network, timeout errors - retry same approach
        return RecoveryStrategy.RETRY_SAME_APPROACH;

      case 'state':
        // State corruption, inconsistent data - rollback and retry
        return RecoveryStrategy.ROLLBACK_AND_RETRY;

      case 'configuration':
        // Missing config, env vars - skip if non-critical
        if (!this._isEpicCritical(epicNum)) {
          return RecoveryStrategy.SKIP_PHASE;
        }
        // For critical epics, escalate only if autoEscalate enabled
        return this.autoEscalate
          ? RecoveryStrategy.ESCALATE_TO_HUMAN
          : RecoveryStrategy.ROLLBACK_AND_RETRY;

      case 'dependency':
        // Missing deps, incompatible versions - trigger recovery workflow
        return RecoveryStrategy.TRIGGER_RECOVERY_WORKFLOW;

      case 'fatal':
        // Unrecoverable errors - escalate only if autoEscalate enabled
        return this.autoEscalate
          ? RecoveryStrategy.ESCALATE_TO_HUMAN
          : RecoveryStrategy.ROLLBACK_AND_RETRY;

      default:
        // First few attempts - retry
        if (attemptCount < 2) {
          return RecoveryStrategy.RETRY_SAME_APPROACH;
        }
        // After 2 failed attempts - try rollback
        if (attemptCount < this.maxRetries) {
          return RecoveryStrategy.ROLLBACK_AND_RETRY;
        }
        // Max attempts reached - escalate only if enabled
        return this.autoEscalate
          ? RecoveryStrategy.ESCALATE_TO_HUMAN
          : RecoveryStrategy.ROLLBACK_AND_RETRY;
    }
  }

  /**
   * Classify error type
   * @private
   */
  _classifyError(errorMessage) {
    const lowerMessage = errorMessage.toLowerCase();

    // Transient errors (network, timeout)
    if (
      /timeout|econnrefused|etimedout|network|fetch.*failed|connection.*refused/.test(lowerMessage)
    ) {
      return 'transient';
    }

    // State errors
    if (/state.*corrupt|inconsistent|invalid.*state|out.*of.*sync/.test(lowerMessage)) {
      return 'state';
    }

    // Configuration errors
    if (/config.*missing|env.*not.*set|environment.*undefined|missing.*config/.test(lowerMessage)) {
      return 'configuration';
    }

    // Dependency errors
    if (
      /cannot.*find.*module|module.*not.*found|dependency|package.*not.*found/.test(lowerMessage)
    ) {
      return 'dependency';
    }

    // Fatal errors
    if (/fatal|critical|unrecoverable|out.*of.*memory|heap.*overflow/.test(lowerMessage)) {
      return 'fatal';
    }

    return 'unknown';
  }

  /**
   * Check if epic is critical (cannot be skipped)
   * @private
   */
  _isEpicCritical(epicNum) {
    // Epic 3 (Spec) and Epic 4 (Execution) are critical
    return [3, 4].includes(epicNum);
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              STRATEGY EXECUTION (AC2)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Execute recovery strategy (AC2)
   * @private
   */
  async _executeRecoveryStrategy(epicNum, strategy, error, context) {
    const result = {
      epicNum,
      strategy,
      success: false,
      shouldRetry: false,
      newApproach: false,
      escalated: false,
      skipped: false,
      details: {},
    };

    try {
      switch (strategy) {
        case RecoveryStrategy.RETRY_SAME_APPROACH:
          result.shouldRetry = true;
          result.success = true;
          result.details.message = 'Retry with same approach';
          this._log(`Will retry Epic ${epicNum} with same approach`, 'info');
          break;

        case RecoveryStrategy.ROLLBACK_AND_RETRY:
          await this._executeRollback(epicNum, context);
          result.shouldRetry = true;
          result.newApproach = true;
          result.success = true;
          result.details.message = 'Rollback completed, retry with new approach';
          this._log(`Rollback completed for Epic ${epicNum}, will retry with new approach`, 'info');
          break;

        case RecoveryStrategy.SKIP_PHASE:
          result.skipped = true;
          result.success = true;
          result.details.message = `Epic ${epicNum} skipped due to non-critical failure`;
          this._log(`Skipping Epic ${epicNum}`, 'warn');
          break;

        case RecoveryStrategy.ESCALATE_TO_HUMAN:
          await this._escalateToHuman(epicNum, error, context);
          result.escalated = true;
          result.success = false;
          result.details.message = 'Escalated to human for manual intervention';
          this._log(`Escalated Epic ${epicNum} to human`, 'warn');
          break;

        case RecoveryStrategy.TRIGGER_RECOVERY_WORKFLOW: {
          const recoveryResult = await this._triggerRecoveryWorkflow(epicNum, error, context);
          result.success = recoveryResult.success;
          result.shouldRetry = recoveryResult.shouldRetry;
          result.details = recoveryResult;
          break;
        }

        default:
          result.details.message = `Unknown strategy: ${strategy}`;
          this._log(`Unknown recovery strategy: ${strategy}`, 'error');
      }
    } catch (recoveryError) {
      result.success = false;
      result.details.error = recoveryError.message;
      this._log(`Recovery failed: ${recoveryError.message}`, 'error');
    }

    return result;
  }

  /**
   * Execute rollback (AC4)
   * @private
   */
  async _executeRollback(epicNum, context) {
    const manager = this._getRollbackManager();
    if (!manager) {
      this._log('RollbackManager not available, skipping rollback', 'warn');
      return { success: false, reason: 'manager_unavailable' };
    }

    try {
      // Get subtask ID from context or generate one
      const subtaskId = context.subtaskId || `epic-${epicNum}`;

      // Check if checkpoint exists
      const checkpoint = await manager.getCheckpoint(subtaskId);
      if (!checkpoint) {
        this._log(`No checkpoint found for ${subtaskId}, creating one now`, 'info');
        await manager.saveCheckpoint(subtaskId, {
          files: context.affectedFiles || [],
        });
        return { success: true, checkpointCreated: true };
      }

      // Perform rollback
      const result = await manager.rollback(subtaskId, {
        hard: true, // Auto-confirm in autonomous mode
        reason: `Recovery from Epic ${epicNum} failure`,
      });

      return result;
    } catch (error) {
      this._log(`Rollback failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * Escalate to human (AC6)
   * @private
   */
  async _escalateToHuman(epicNum, error, context) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Generate escalation report
    const report = {
      timestamp: new Date().toISOString(),
      storyId: this.storyId,
      epicNum,
      epicName: this._getEpicName(epicNum),
      error: errorMessage,
      attempts: this.attempts[epicNum] || [],
      totalAttempts: (this.attempts[epicNum] || []).length,
      maxRetries: this.maxRetries,
      context,
      suggestions: this._generateSuggestions(epicNum, error),
    };

    // Get suggestions from StuckDetector if available
    const detector = this._getStuckDetector();
    if (detector) {
      const attempts = (this.attempts[epicNum] || []).map((a) => ({
        success: false,
        approach: a.approach,
        error: a.error,
      }));
      const fullReport = detector.generateEscalationReport(`epic-${epicNum}`, attempts);
      report.stuckDetectorReport = fullReport;
    }

    // Save escalation report
    const reportPath = await this._saveEscalationReport(report);
    report.reportPath = reportPath;

    // Emit escalation event
    this.emit('escalation', report);

    this._log(`Escalation report saved to: ${reportPath}`, 'info');

    return report;
  }

  /**
   * Generate suggestions for recovery
   * @private
   */
  _generateSuggestions(epicNum, error) {
    const suggestions = [];
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = this._classifyError(errorMessage);

    switch (errorType) {
      case 'transient':
        suggestions.push('Check network connectivity');
        suggestions.push('Verify external services are available');
        suggestions.push('Wait and retry after a few minutes');
        break;

      case 'state':
        suggestions.push('Check for conflicting changes');
        suggestions.push('Verify state files are not corrupted');
        suggestions.push('Consider starting fresh from last known good state');
        break;

      case 'configuration':
        suggestions.push('Verify all required environment variables are set');
        suggestions.push('Check configuration files for errors');
        suggestions.push('Ensure .env file exists and is properly formatted');
        break;

      case 'dependency':
        suggestions.push('Run npm install to ensure all dependencies are installed');
        suggestions.push('Check package.json for correct versions');
        suggestions.push('Try npm cache clean --force and reinstall');
        break;

      default:
        suggestions.push('Review error logs for more details');
        suggestions.push('Check recent code changes');
        suggestions.push('Consider breaking the task into smaller steps');
    }

    return suggestions;
  }

  /**
   * Trigger recovery workflow (Epic 5)
   * @private
   */
  async _triggerRecoveryWorkflow(epicNum, error, context) {
    this._log(`Triggering recovery workflow for Epic ${epicNum}`, 'info');

    // If orchestrator is available, use it to execute Epic 5
    if (this.orchestrator && typeof this.orchestrator.executeEpic === 'function') {
      try {
        const result = await this.orchestrator.executeEpic(5, {
          failedEpic: epicNum,
          error,
          ...context,
        });

        return {
          success: result.success,
          shouldRetry: result.shouldRetry ?? false,
          recoveryResult: result,
        };
      } catch (error) {
        this._log(`Recovery workflow failed: ${error.message}`, 'error');
        return {
          success: false,
          shouldRetry: false,
          error: error.message,
        };
      }
    }

    // Fallback: manual recovery
    return {
      success: false,
      shouldRetry: false,
      message: 'Orchestrator not available for recovery workflow',
    };
  }

  /**
   * Save escalation report to file
   * @private
   */
  async _saveEscalationReport(report) {
    const reportsDir = path.join(this.projectRoot, '.aiox', 'escalations');
    await fs.ensureDir(reportsDir);

    const filename = `escalation-${this.storyId}-epic${report.epicNum}-${Date.now()}.json`;
    const reportPath = path.join(reportsDir, filename);

    await fs.writeJson(reportPath, report, { spaces: 2 });

    return reportPath;
  }

  /**
   * Get epic name
   * @private
   */
  _getEpicName(epicNum) {
    const names = {
      3: 'Spec Pipeline',
      4: 'Execution Engine',
      5: 'Recovery System',
      6: 'QA Loop',
      7: 'Memory Layer',
    };
    return names[epicNum] || `Epic ${epicNum}`;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              LOGGING (AC7)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Log message with timestamp (AC7)
   * @private
   */
  _log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
    };

    this.logs.push(logEntry);

    // Also log to orchestrator if available
    if (this.orchestrator && typeof this.orchestrator._log === 'function') {
      this.orchestrator._log(`[Recovery] ${message}`, { level });
    }
  }

  /**
   * Get all logs (AC7)
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get logs for specific epic
   */
  getEpicLogs(epicNum) {
    return this.logs.filter(
      (log) => log.message.includes(`Epic ${epicNum}`) || log.message.includes(`epic-${epicNum}`),
    );
  }

  /**
   * Get attempt history for all epics
   */
  getAttemptHistory() {
    return { ...this.attempts };
  }

  /**
   * Get attempt count for specific epic (AC5)
   */
  getAttemptCount(epicNum) {
    return (this.attempts[epicNum] || []).length;
  }

  /**
   * Check if can retry (under max retries) (AC5)
   */
  canRetry(epicNum) {
    return this.getAttemptCount(epicNum) < this.maxRetries;
  }

  /**
   * Reset attempts for an epic
   */
  resetAttempts(epicNum) {
    this.attempts[epicNum] = [];
    this._log(`Reset attempts for Epic ${epicNum}`, 'info');
  }

  /**
   * Clear all state
   */
  clear() {
    this.attempts = {};
    this.logs = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  RecoveryHandler,
  RecoveryStrategy,
  RecoveryResult,
};
