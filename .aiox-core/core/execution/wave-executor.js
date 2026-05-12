/**
 * Wave Executor
 * Story 10.1 - Parallel Agent Execution
 *
 * Executes task waves in parallel, leveraging the WaveAnalyzer
 * for dependency-aware scheduling.
 */

const EventEmitter = require('events');
const _path = require('path');

// Import dependencies with fallbacks
let WaveAnalyzer;
try {
  WaveAnalyzer = require('../../workflow-intelligence/engine/wave-analyzer');
} catch {
  WaveAnalyzer = null;
}

let RateLimitManager;
try {
  RateLimitManager = require('./rate-limit-manager');
} catch {
  RateLimitManager = null;
}

class WaveExecutor extends EventEmitter {
  constructor(config = {}) {
    super();

    // Configuration
    this.maxParallel = config.maxParallel || 4;
    this.taskTimeout = config.taskTimeout || 10 * 60 * 1000; // 10 minutes
    this.continueOnNonCriticalFailure = config.continueOnNonCriticalFailure !== false;

    // Dependencies
    this.waveAnalyzer = config.waveAnalyzer || (WaveAnalyzer ? new WaveAnalyzer() : null);
    this.taskExecutor = config.taskExecutor || null;
    this.rateLimitManager =
      config.rateLimitManager || (RateLimitManager ? new RateLimitManager() : null);

    // State
    this.activeExecutions = new Map();
    this.completedWaves = [];
    this.currentWaveIndex = 0;
  }

  /**
   * Execute all waves for a workflow
   * @param {string} workflowId - Workflow identifier
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Execution results
   */
  async executeWaves(workflowId, context = {}) {
    const startTime = Date.now();

    // Get wave analysis
    let analysis;
    if (this.waveAnalyzer) {
      analysis = this.waveAnalyzer.analyze(workflowId);
    } else {
      // Fallback: single wave with all tasks
      analysis = {
        waves: [
          {
            index: 1,
            tasks: context.tasks || [],
          },
        ],
      };
    }

    if (!analysis.waves || analysis.waves.length === 0) {
      return {
        workflowId,
        success: true,
        waves: [],
        totalDuration: 0,
        message: 'No waves to execute',
      };
    }

    this.emit('execution_started', { workflowId, totalWaves: analysis.waves.length });

    const results = [];
    let aborted = false;

    for (const wave of analysis.waves) {
      if (aborted) break;

      this.currentWaveIndex = wave.index;
      this.emit('wave_started', {
        waveIndex: wave.index,
        tasks: wave.tasks.map((t) => ({ id: t.id, description: t.description })),
        totalTasks: wave.tasks.length,
      });

      const waveResult = await this.executeWave(wave, context);

      results.push({
        wave: wave.index,
        results: waveResult,
        allSucceeded: waveResult.every((r) => r.success),
        duration: waveResult.reduce((sum, r) => sum + (r.duration || 0), 0),
      });

      this.emit('wave_completed', {
        waveIndex: wave.index,
        results: waveResult,
        success: waveResult.every((r) => r.success),
      });

      // Check if we should continue
      const criticalFailed = waveResult.some((r) => !r.success && r.critical);
      if (criticalFailed) {
        this.emit('wave_failed', {
          waveIndex: wave.index,
          reason: 'critical_task_failed',
          failedTasks: waveResult.filter((r) => !r.success && r.critical),
        });

        if (!this.continueOnNonCriticalFailure) {
          aborted = true;
        }
      }
    }

    const totalDuration = Date.now() - startTime;

    const executionResult = {
      workflowId,
      waves: results,
      success: !aborted && results.every((w) => w.allSucceeded),
      aborted,
      totalDuration,
      metrics: this.calculateMetrics(results),
    };

    this.emit('execution_completed', executionResult);

    return executionResult;
  }

  /**
   * Execute a single wave with parallel task execution
   * @param {Object} wave - Wave definition
   * @param {Object} context - Execution context
   * @returns {Promise<Array>} - Task results
   */
  async executeWave(wave, context) {
    const tasks = wave.tasks || [];

    if (tasks.length === 0) {
      return [];
    }

    // Split tasks into chunks based on maxParallel
    const chunks = this.chunkArray(tasks, this.maxParallel);
    const allResults = [];

    for (const chunk of chunks) {
      // Execute chunk in parallel
      const promises = chunk.map((task) => this.executeTaskWithTimeout(task, context));

      const chunkResults = await Promise.allSettled(promises);

      // Process results
      for (let i = 0; i < chunkResults.length; i++) {
        const result = chunkResults[i];
        const task = chunk[i];

        if (result.status === 'fulfilled') {
          allResults.push({
            taskId: task.id,
            success: result.value.success,
            result: result.value,
            critical: task.critical || false,
            duration: result.value.duration || 0,
          });
        } else {
          allResults.push({
            taskId: task.id,
            success: false,
            error: result.reason?.message || 'Unknown error',
            critical: task.critical || false,
            duration: 0,
          });
        }

        this.emit('task_completed', {
          taskId: task.id,
          success: result.status === 'fulfilled' && result.value?.success,
          waveIndex: wave.index,
        });
      }
    }

    return allResults;
  }

  /**
   * Execute a task with timeout
   * @param {Object} task - Task to execute
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Task result
   */
  async executeTaskWithTimeout(task, context) {
    const startTime = Date.now();

    // Track active execution
    this.activeExecutions.set(task.id, {
      task,
      startTime,
      status: 'running',
    });

    this.emit('task_started', { taskId: task.id, description: task.description });

    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Task ${task.id} timed out after ${this.taskTimeout}ms`));
        }, this.taskTimeout);
      });

      // Execute task with rate limiting if available
      let executionPromise;
      if (this.taskExecutor) {
        if (this.rateLimitManager) {
          executionPromise = this.rateLimitManager.executeWithRetry(
            () => this.taskExecutor(task, context),
            { taskId: task.id },
          );
        } else {
          executionPromise = this.taskExecutor(task, context);
        }
      } else {
        // Default executor (no-op)
        executionPromise = this.defaultExecutor(task, context);
      }

      // Race between execution and timeout
      const result = await Promise.race([executionPromise, timeoutPromise]);

      // Update active execution
      this.activeExecutions.set(task.id, {
        task,
        startTime,
        endTime: Date.now(),
        status: 'completed',
        success: result.success,
      });

      return {
        ...result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      // Update active execution
      this.activeExecutions.set(task.id, {
        task,
        startTime,
        endTime: Date.now(),
        status: 'failed',
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    } finally {
      // Remove from active after a delay (for monitoring)
      setTimeout(() => {
        this.activeExecutions.delete(task.id);
      }, 5000);
    }
  }

  /**
   * Default task executor (placeholder)
   * @param {Object} task - Task to execute
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Execution result
   */
  async defaultExecutor(task, _context) {
    // This should be overridden or configured
    console.log(`[WaveExecutor] Executing task: ${task.id}`);
    return { success: true, output: 'Default executor - no action taken' };
  }

  /**
   * Split array into chunks
   * @param {Array} array - Array to split
   * @param {number} size - Chunk size
   * @returns {Array<Array>} - Chunked arrays
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Calculate execution metrics
   * @param {Array} waveResults - Results from all waves
   * @returns {Object} - Metrics
   */
  calculateMetrics(waveResults) {
    const allTasks = waveResults.flatMap((w) => w.results);
    const successful = allTasks.filter((t) => t.success).length;
    const failed = allTasks.filter((t) => !t.success).length;
    const totalDuration = allTasks.reduce((sum, t) => sum + (t.duration || 0), 0);

    // Calculate wall time (actual elapsed time)
    const wallTime = waveResults.reduce((sum, w) => {
      const maxDuration = Math.max(...w.results.map((r) => r.duration || 0));
      return sum + maxDuration;
    }, 0);

    return {
      totalTasks: allTasks.length,
      successful,
      failed,
      successRate: allTasks.length > 0 ? (successful / allTasks.length) * 100 : 100,
      totalDuration,
      wallTime,
      parallelEfficiency: wallTime > 0 ? totalDuration / wallTime : 1,
      totalWaves: waveResults.length,
    };
  }

  /**
   * Get current execution status
   * @returns {Object} - Current status
   */
  getStatus() {
    const active = [];
    for (const [taskId, execution] of this.activeExecutions) {
      active.push({
        taskId,
        status: execution.status,
        elapsed: Date.now() - execution.startTime,
      });
    }

    return {
      currentWave: this.currentWaveIndex,
      activeExecutions: active,
      completedWaves: this.completedWaves.length,
    };
  }

  /**
   * Format status for CLI output
   * @returns {string} - Formatted status
   */
  formatStatus() {
    const status = this.getStatus();

    let output = '🌊 Wave Executor Status\n';
    output += '━'.repeat(40) + '\n\n';

    output += `Current Wave: ${status.currentWave}\n`;
    output += `Completed Waves: ${status.completedWaves}\n`;
    output += `Active Executions: ${status.activeExecutions.length}\n\n`;

    if (status.activeExecutions.length > 0) {
      output += '**Active Tasks:**\n';
      for (const exec of status.activeExecutions) {
        const elapsed = Math.round(exec.elapsed / 1000);
        const icon = exec.status === 'running' ? '🔄' : exec.status === 'completed' ? '✅' : '❌';
        output += `  ${icon} ${exec.taskId} - ${elapsed}s\n`;
      }
    }

    return output;
  }

  /**
   * Cancel all active executions
   */
  cancelAll() {
    for (const [taskId, execution] of this.activeExecutions) {
      execution.status = 'cancelled';
      this.emit('task_cancelled', { taskId });
    }
    this.emit('execution_cancelled', { reason: 'user_requested' });
  }
}

module.exports = WaveExecutor;
module.exports.WaveExecutor = WaveExecutor;
