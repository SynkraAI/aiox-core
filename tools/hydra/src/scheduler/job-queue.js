/**
 * @module job-queue
 * @description Simple in-memory priority queue for scheduled jobs.
 */

/**
 * @typedef {Object} Job
 * @property {string} id - Unique job identifier
 * @property {string} name - Human-readable job name
 * @property {number} priority - Priority (lower = higher priority)
 * @property {Function} fn - Async function to execute
 * @property {Object} [options] - Job-specific options
 * @property {string} [status] - Job status
 * @property {string} [createdAt] - ISO timestamp
 * @property {string} [completedAt] - ISO timestamp
 * @property {string} [error] - Error message if failed
 */

export class JobQueue {
  constructor() {
    /** @type {Job[]} */
    this.queue = [];
    /** @type {Job[]} */
    this.completed = [];
    this._processing = false;
  }

  /**
   * Add a job to the queue.
   * @param {Object} job - Job definition
   * @param {string} job.id - Unique identifier
   * @param {string} job.name - Display name
   * @param {number} [job.priority=5] - Priority (1=highest, 10=lowest)
   * @param {Function} job.fn - Async function to execute
   * @param {Object} [job.options] - Additional options
   */
  enqueue({ id, name, priority = 5, fn, options = {} }) {
    this.queue.push({
      id,
      name,
      priority,
      fn,
      options,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      error: null,
    });

    // Sort by priority (ascending)
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get the next job to process (dequeue).
   * @returns {Job|null}
   */
  dequeue() {
    if (this.queue.length === 0) return null;
    const job = this.queue.shift();
    job.status = 'running';
    return job;
  }

  /**
   * Mark a job as completed.
   * @param {Job} job - The job
   * @param {Object} [result] - Execution result
   */
  complete(job, result) {
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.result = result;
    this.completed.push(job);
  }

  /**
   * Mark a job as failed.
   * @param {Job} job - The job
   * @param {Error} error - The error
   */
  fail(job, error) {
    job.status = 'failed';
    job.completedAt = new Date().toISOString();
    job.error = error.message;
    this.completed.push(job);
  }

  /**
   * Process all queued jobs sequentially.
   * @param {Object} [logger] - Logger instance
   * @returns {Promise<{ succeeded: number, failed: number }>}
   */
  async processAll(logger = null) {
    if (this._processing) {
      throw new Error('Queue is already being processed');
    }

    this._processing = true;
    let succeeded = 0;
    let failed = 0;

    try {
      let job;
      while ((job = this.dequeue()) !== null) {
        try {
          if (logger) logger.info({ jobId: job.id, jobName: job.name }, 'Processing job');
          const result = await job.fn(job.options);
          this.complete(job, result);
          succeeded++;
        } catch (error) {
          this.fail(job, error);
          failed++;
          if (logger) logger.error({ jobId: job.id, error: error.message }, 'Job failed');
        }
      }
    } finally {
      this._processing = false;
    }

    return { succeeded, failed };
  }

  /**
   * Get queue size.
   * @returns {number}
   */
  size() {
    return this.queue.length;
  }

  /**
   * Check if queue is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.queue.length === 0;
  }

  /**
   * Get completed job results.
   * @returns {Job[]}
   */
  getCompleted() {
    return [...this.completed];
  }

  /**
   * Clear completed jobs.
   */
  clearCompleted() {
    this.completed = [];
  }
}
