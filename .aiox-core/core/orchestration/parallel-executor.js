/**
 * Parallel Executor - Executes multiple phases concurrently
 *
 * Handles parallel execution of workflow phases that don't have
 * dependencies on each other (e.g., phases 1-3 in brownfield discovery).
 *
 * @module core/orchestration/parallel-executor
 * @version 1.0.0
 */

const chalk = require('chalk');

/**
 * Manages parallel execution of workflow phases
 */
class ParallelExecutor {
  constructor() {
    this.maxConcurrency = 3; // Default max parallel executions
    this.runningTasks = new Map();
  }

  /**
   * Execute multiple phases in parallel
   * @param {Array<Object>} phases - Phases to execute
   * @param {Function} executePhase - Function to execute a single phase
   * @param {Object} options - Execution options
   * @returns {Promise<Object[]>} Results from all phases
   */
  async executeParallel(phases, executePhase, options = {}) {
    const maxConcurrency = options.maxConcurrency || this.maxConcurrency;
    const results = [];
    const errors = [];

    console.log(chalk.yellow(`\n⚡ Executing ${phases.length} phases in parallel (max ${maxConcurrency} concurrent)`));

    // Use Promise.allSettled for resilient parallel execution
    const promises = phases.map(async (phase) => {
      const phaseId = phase.phase || phase.step;
      this.runningTasks.set(phaseId, { status: 'running', startTime: Date.now() });

      try {
        const result = await executePhase(phase);
        this.runningTasks.set(phaseId, {
          status: 'completed',
          endTime: Date.now(),
          result,
        });
        return { phase: phaseId, status: 'fulfilled', result };
      } catch (error) {
        this.runningTasks.set(phaseId, {
          status: 'failed',
          endTime: Date.now(),
          error: error.message,
        });
        return { phase: phaseId, status: 'rejected', error: error.message };
      }
    });

    // Execute with concurrency limit
    const settled = await this._executeWithConcurrencyLimit(promises, maxConcurrency);

    // Process results
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        results.push(result.result);
      } else {
        errors.push(result.error);
        console.log(chalk.red(`   ❌ Phase ${result.phase} failed: ${result.error}`));
      }
    }

    // Summary
    const successCount = results.length;
    const failCount = errors.length;
    console.log(chalk.gray(`   Completed: ${successCount} success, ${failCount} failed`));

    return {
      results,
      errors,
      summary: {
        total: phases.length,
        success: successCount,
        failed: failCount,
      },
    };
  }

  /**
   * Execute promises with concurrency limit
   * @private
   */
  async _executeWithConcurrencyLimit(tasks, limit) {
    const results = [];
    const executing = new Set();

    for (const task of tasks) {
      const p = Promise.resolve().then(() => task);
      results.push(p);

      if (limit <= tasks.length) {
        const e = p.then(() => executing.delete(e));
        executing.add(e);

        if (executing.size >= limit) {
          await Promise.race(executing);
        }
      }
    }

    return Promise.allSettled(results);
  }

  /**
   * Get status of running tasks
   * @returns {Object} Map of task statuses
   */
  getStatus() {
    const status = {};
    for (const [id, taskStatus] of this.runningTasks) {
      status[id] = { ...taskStatus };
      if (taskStatus.startTime && taskStatus.endTime) {
        status[id].duration = taskStatus.endTime - taskStatus.startTime;
      }
    }
    return status;
  }

  /**
   * Check if any tasks are still running
   * @returns {boolean} True if tasks are running
   */
  hasRunningTasks() {
    for (const [, status] of this.runningTasks) {
      if (status.status === 'running') {
        return true;
      }
    }
    return false;
  }

  /**
   * Wait for all running tasks to complete
   * @param {number} timeout - Maximum wait time in ms
   * @returns {Promise<void>}
   */
  async waitForCompletion(timeout = 300000) {
    const startTime = Date.now();

    while (this.hasRunningTasks()) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for parallel tasks to complete');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Cancel all running tasks
   * Note: This marks tasks as cancelled but cannot truly cancel async operations
   */
  cancelAll() {
    for (const [id, status] of this.runningTasks) {
      if (status.status === 'running') {
        this.runningTasks.set(id, {
          ...status,
          status: 'cancelled',
          cancelledAt: Date.now(),
        });
      }
    }
  }

  /**
   * Clear task history
   */
  clear() {
    this.runningTasks.clear();
  }

  /**
   * Set maximum concurrency
   * @param {number} max - Maximum concurrent executions
   */
  setMaxConcurrency(max) {
    this.maxConcurrency = Math.max(1, Math.min(10, max));
  }

  /**
   * Get execution summary
   * @returns {Object} Summary statistics
   */
  getSummary() {
    let completed = 0;
    let failed = 0;
    let running = 0;
    let totalDuration = 0;

    for (const [, status] of this.runningTasks) {
      switch (status.status) {
        case 'completed':
          completed++;
          if (status.startTime && status.endTime) {
            totalDuration += status.endTime - status.startTime;
          }
          break;
        case 'failed':
          failed++;
          break;
        case 'running':
          running++;
          break;
      }
    }

    return {
      total: this.runningTasks.size,
      completed,
      failed,
      running,
      averageDuration: completed > 0 ? Math.round(totalDuration / completed) : 0,
    };
  }
}

module.exports = ParallelExecutor;
