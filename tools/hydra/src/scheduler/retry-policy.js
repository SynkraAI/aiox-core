/**
 * @module retry-policy
 * @description Exponential backoff with jitter for retry logic.
 */

/**
 * @typedef {Object} RetryOptions
 * @property {number} [baseDelayMs=1000] - Base delay in ms
 * @property {number} [maxDelayMs=60000] - Maximum delay in ms
 * @property {number} [maxAttempts=5] - Maximum number of attempts
 * @property {boolean} [jitter=true] - Add random jitter to delays
 */

export class RetryPolicy {
  /**
   * @param {RetryOptions} [options={}]
   */
  constructor(options = {}) {
    this.baseDelayMs = options.baseDelayMs ?? 1000;
    this.maxDelayMs = options.maxDelayMs ?? 60000;
    this.maxAttempts = options.maxAttempts ?? 5;
    this.jitter = options.jitter ?? true;
  }

  /**
   * Calculate delay for a given attempt number (0-indexed).
   * @param {number} attempt - Current attempt number (0-indexed)
   * @returns {number} Delay in milliseconds
   */
  getDelay(attempt) {
    if (attempt <= 0) return 0;

    const exponentialDelay = this.baseDelayMs * Math.pow(2, attempt);
    const jitterMax = this.jitter ? this.baseDelayMs * Math.pow(2, attempt - 1) : 0;
    const jitterValue = jitterMax > 0 ? Math.random() * jitterMax : 0;

    return Math.min(exponentialDelay + jitterValue, this.maxDelayMs);
  }

  /**
   * Check if more attempts are allowed.
   * @param {number} attempt - Current attempt number (0-indexed)
   * @returns {boolean}
   */
  shouldRetry(attempt) {
    return attempt < this.maxAttempts - 1;
  }

  /**
   * Execute a function with retry logic.
   * @template T
   * @param {() => Promise<T>} fn - Async function to execute
   * @param {Object} [context={}] - Context for logging
   * @param {Object} [logger] - Logger instance
   * @returns {Promise<T>}
   */
  async execute(fn, context = {}, logger = null) {
    let lastError;

    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.getDelay(attempt);
          if (logger) {
            logger.warn({ ...context, attempt, delay }, `Retry attempt ${attempt + 1}/${this.maxAttempts}`);
          }
          await sleep(delay);
        }
        return await fn();
      } catch (error) {
        lastError = error;
        if (!this.shouldRetry(attempt)) {
          if (logger) {
            logger.error({ ...context, attempt: attempt + 1, error: error.message }, 'All retry attempts exhausted');
          }
          break;
        }
      }
    }

    throw lastError;
  }
}

/**
 * Sleep for a given duration.
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
