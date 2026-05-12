/**
 * Epic5Executor - Recovery System Executor
 *
 * Story: 0.3 - Epic Executors (AC4)
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Wraps recovery scripts (stuck-detector, rollback-manager, approach-manager)
 * to handle errors and recover from failures during execution.
 *
 * Note: Epic 5 is on-demand - triggered when other epics fail.
 *
 * @module core/orchestration/executors/epic-5-executor
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const EpicExecutor = require('./epic-executor');

/**
 * Recovery strategies
 */
const RecoveryStrategy = {
  RETRY_SAME_APPROACH: 'retry_same_approach',
  ROLLBACK_AND_RETRY: 'rollback_and_retry',
  SKIP_PHASE: 'skip_phase',
  ESCALATE_TO_HUMAN: 'escalate_to_human',
  STUCK_RECOVERY: 'stuck_recovery',
};

/**
 * Epic 5 Executor - Recovery System
 * Handles error detection and recovery
 */
class Epic5Executor extends EpicExecutor {
  constructor(orchestrator) {
    super(orchestrator, 5);

    // Lazy-load recovery scripts
    this._stuckDetector = null;
    this._rollbackManager = null;
    this._approachManager = null;
    this._recoveryTracker = null;
  }

  /**
   * Get StuckDetector instance
   * @private
   */
  _getStuckDetector() {
    if (!this._stuckDetector) {
      try {
        this._stuckDetector = require('../../infrastructure/scripts/stuck-detector');
      } catch (error) {
        this._log(`StuckDetector not available: ${error.message}`, 'warn');
      }
    }
    return this._stuckDetector;
  }

  /**
   * Get RollbackManager instance
   * @private
   */
  _getRollbackManager() {
    if (!this._rollbackManager) {
      try {
        this._rollbackManager = require('../../infrastructure/scripts/rollback-manager');
      } catch (error) {
        this._log(`RollbackManager not available: ${error.message}`, 'warn');
      }
    }
    return this._rollbackManager;
  }

  /**
   * Execute Recovery System
   * @param {Object} context - Execution context
   * @param {number} context.failedEpic - Epic that failed
   * @param {Error|Object} context.error - Error that triggered recovery
   * @param {number} context.attempts - Number of attempts so far
   * @returns {Promise<Object>} Recovery result
   */
  async execute(context) {
    this._startExecution();

    try {
      const { failedEpic, error, attempts = 0, storyId } = context;

      this._log(`Recovery triggered for Epic ${failedEpic}`);
      this._log(`Error: ${error?.message || error}`);
      this._log(`Previous attempts: ${attempts}`);

      // Detect if stuck in circular pattern
      const StuckDetector = this._getStuckDetector();
      let isStuck = false;

      if (StuckDetector) {
        const detector = new StuckDetector({
          storyId,
          maxAttempts: this.orchestrator?.maxRetries || 3,
        });

        const stuckStatus = await detector.checkStatus(storyId, failedEpic);
        isStuck = stuckStatus.isStuck;

        if (isStuck) {
          this._log('Circular pattern detected - stuck state', 'warn');
        }
      }

      // Select recovery strategy
      const strategy = this._selectRecoveryStrategy(failedEpic, error, attempts, isStuck);
      this._log(`Selected strategy: ${strategy}`);

      // Execute recovery based on strategy
      const recoveryResult = await this._executeRecoveryStrategy(strategy, context);

      this._addArtifact(
        'recovery-log',
        JSON.stringify({
          failedEpic,
          strategy,
          result: recoveryResult,
        }),
      );

      return this._completeExecution({
        strategy,
        shouldRetry: recoveryResult.shouldRetry,
        newApproach: recoveryResult.newApproach,
        escalated: recoveryResult.escalated,
        recoveryResult,
      });
    } catch (error) {
      return this._failExecution(error);
    }
  }

  /**
   * Select appropriate recovery strategy
   * @private
   */
  _selectRecoveryStrategy(failedEpic, error, attempts, isStuck) {
    const maxAttempts = this.orchestrator?.maxRetries || 3;

    // If stuck in circular pattern, escalate
    if (isStuck) {
      return RecoveryStrategy.STUCK_RECOVERY;
    }

    // If max attempts reached, escalate
    if (attempts >= maxAttempts) {
      return RecoveryStrategy.ESCALATE_TO_HUMAN;
    }

    // Analyze error type
    const errorMessage = error?.message || String(error);

    // Dependency/import errors - try different approach
    if (errorMessage.match(/cannot find module|import.*failed/i)) {
      return RecoveryStrategy.ROLLBACK_AND_RETRY;
    }

    // Test failures - retry same approach
    if (errorMessage.match(/test.*failed|assertion/i)) {
      return RecoveryStrategy.RETRY_SAME_APPROACH;
    }

    // Syntax errors - need different approach
    if (errorMessage.match(/syntax error|unexpected token/i)) {
      return RecoveryStrategy.ROLLBACK_AND_RETRY;
    }

    // Default: retry same approach first
    if (attempts < 1) {
      return RecoveryStrategy.RETRY_SAME_APPROACH;
    }

    // Then try different approach
    return RecoveryStrategy.ROLLBACK_AND_RETRY;
  }

  /**
   * Execute selected recovery strategy
   * @private
   */
  async _executeRecoveryStrategy(strategy, context) {
    switch (strategy) {
      case RecoveryStrategy.RETRY_SAME_APPROACH:
        return this._executeRetrySameApproach(context);

      case RecoveryStrategy.ROLLBACK_AND_RETRY:
        return this._executeRollbackAndRetry(context);

      case RecoveryStrategy.SKIP_PHASE:
        return this._executeSkipPhase(context);

      case RecoveryStrategy.ESCALATE_TO_HUMAN:
        return this._executeEscalateToHuman(context);

      case RecoveryStrategy.STUCK_RECOVERY:
        return this._executeStuckRecovery(context);

      default:
        return { shouldRetry: false, reason: 'unknown_strategy' };
    }
  }

  /**
   * Retry with same approach
   * @private
   */
  async _executeRetrySameApproach(_context) {
    this._log('Executing retry with same approach');

    return {
      shouldRetry: true,
      newApproach: false,
      message: 'Retrying with same approach',
    };
  }

  /**
   * Rollback and retry with different approach
   * @private
   */
  async _executeRollbackAndRetry(context) {
    this._log('Executing rollback and retry');

    const RollbackManager = this._getRollbackManager();
    if (RollbackManager) {
      try {
        const manager = new RollbackManager({
          storyId: context.storyId,
          rootPath: this.projectRoot,
        });
        await manager.rollbackLastChange();
        this._log('Rollback completed');
      } catch (error) {
        this._log(`Rollback failed: ${error.message}`, 'warn');
      }
    }

    return {
      shouldRetry: true,
      newApproach: true,
      message: 'Rolled back and will retry with different approach',
    };
  }

  /**
   * Skip the failing phase
   * @private
   */
  async _executeSkipPhase(_context) {
    this._log('Skipping failing phase');

    return {
      shouldRetry: false,
      skipped: true,
      message: 'Phase skipped due to persistent failures',
    };
  }

  /**
   * Escalate to human
   * @private
   */
  async _executeEscalateToHuman(context) {
    this._log('Escalating to human intervention');

    // Create escalation report
    const reportPath = this._getPath('.aiox', 'escalations', `${context.storyId}-${Date.now()}.md`);

    const report = `# Escalation Report

**Story:** ${context.storyId}
**Failed Epic:** ${context.failedEpic}
**Time:** ${new Date().toISOString()}

## Error

\`\`\`
${context.error?.message || context.error}
\`\`\`

## Attempts

${context.attempts} attempts made before escalation.

## Recommended Actions

1. Review the error message and stack trace
2. Check for environment or configuration issues
3. Consider alternative implementation approaches
4. Manual intervention may be required

---
*Generated by Epic 5 Recovery System*
`;

    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeFile(reportPath, report);
    this._addArtifact('escalation-report', reportPath);

    return {
      shouldRetry: false,
      escalated: true,
      reportPath,
      message: 'Escalated to human - intervention required',
    };
  }

  /**
   * Handle stuck state recovery
   * @private
   */
  async _executeStuckRecovery(context) {
    this._log('Executing stuck state recovery');

    // Always escalate when stuck
    return this._executeEscalateToHuman(context);
  }
}

module.exports = Epic5Executor;
module.exports.RecoveryStrategy = RecoveryStrategy;
