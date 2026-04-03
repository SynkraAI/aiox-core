/**
 * @module job-runner
 * @description Executes pipeline jobs with retry, circuit breaker, checkpoint, and rate limiting.
 */

import { RetryPolicy } from './retry-policy.js';
import { CircuitBreaker } from './circuit-breaker.js';
import { RateLimiter } from './rate-limiter.js';
import { Checkpoint } from './checkpoint.js';
import { LockManager } from './lock-manager.js';
import { defaultLogger } from '../logging/logger.js';

/** Source groups in priority order */
export const SOURCE_GROUPS = ['rss', 'github', 'youtube', 'podcast', 'web', 'twitter', 'newsletter'];

/**
 * @typedef {Object} JobRunnerOptions
 * @property {Object} [retry] - RetryPolicy options
 * @property {Object} [circuitBreaker] - CircuitBreaker options
 * @property {Object} [rateLimits] - RateLimiter config per adapter type
 * @property {Object} [lock] - LockManager options
 * @property {Object} [checkpoint] - Checkpoint options
 * @property {Object} [logger] - Logger instance
 */

export class JobRunner {
  /**
   * @param {JobRunnerOptions} [options={}]
   */
  constructor(options = {}) {
    this.retryPolicy = new RetryPolicy(options.retry || {});
    this.circuitBreaker = new CircuitBreaker(options.circuitBreaker || {});
    this.rateLimiter = new RateLimiter(options.rateLimits || {});
    this.checkpoint = new Checkpoint(options.checkpoint || {});
    this.lockManager = new LockManager(options.lock || {});
    this.logger = options.logger || defaultLogger;
    this._running = false;
    this._aborted = false;
  }

  /**
   * Execute a pipeline run with full resilience.
   * @param {Function} pipelineFn - The pipeline function to execute (receives options)
   * @param {Object} [pipelineOptions={}] - Options to pass to the pipeline
   * @returns {Promise<Object>} Pipeline result
   */
  async execute(pipelineFn, pipelineOptions = {}) {
    // Acquire lock
    if (!this.lockManager.acquire()) {
      const lockInfo = this.lockManager.getLockInfo();
      this.logger.warn({ lockInfo }, 'Another instance is already running. Skipping.');
      return { skipped: true, reason: 'lock_held' };
    }

    this._running = true;
    this._aborted = false;

    try {
      this.logger.info('Job runner starting pipeline execution');

      // Check for resumable checkpoint
      const resumable = this.checkpoint.hasResumable();
      if (resumable) {
        const pending = this.checkpoint.getPendingGroups();
        this.logger.info({ pending }, 'Resuming from checkpoint');
      }

      // Execute pipeline with retry
      const result = await this.retryPolicy.execute(
        () => pipelineFn({
          ...pipelineOptions,
          logger: this.logger,
          circuitBreaker: this.circuitBreaker,
          checkpoint: this.checkpoint,
          rateLimiter: this.rateLimiter,
        }),
        { job: 'pipeline' },
        this.logger,
      );

      // Clear checkpoint on success
      this.checkpoint.clear();
      this.logger.info('Pipeline execution completed successfully');

      return result;
    } catch (error) {
      this.logger.error({ error: error.message }, 'Pipeline execution failed after all retries');
      throw error;
    } finally {
      this._running = false;
      this.lockManager.release();
    }
  }

  /**
   * Abort the current run.
   */
  abort() {
    this._aborted = true;
    this.logger.warn('Job runner abort requested');
  }

  /**
   * Check if the runner is currently executing.
   * @returns {boolean}
   */
  isRunning() {
    return this._running;
  }

  /**
   * Check if abort was requested.
   * @returns {boolean}
   */
  isAborted() {
    return this._aborted;
  }

  /**
   * Get circuit breaker summary.
   * @returns {{ closed: number, open: number, halfOpen: number }}
   */
  getCircuitBreakerSummary() {
    return this.circuitBreaker.getSummary();
  }
}
