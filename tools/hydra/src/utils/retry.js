/**
 * @module retry
 * @description Story 6.5 -- Retry wrapper with exponential backoff.
 * Lightweight utility function for wrapping API calls.
 * Complements the RetryPolicy class in scheduler/retry-policy.js.
 */

/**
 * Retry an async function with exponential backoff.
 * Retries on 429 (rate limit), 503 (service unavailable), and ECONNRESET.
 *
 * @template T
 * @param {() => Promise<T>} fn - Async function to execute
 * @param {Object} [options={}]
 * @param {number} [options.maxRetries=3] - Maximum number of retries (not counting initial attempt)
 * @param {number} [options.baseDelayMs=1000] - Base delay between retries
 * @param {number} [options.maxDelayMs=30000] - Maximum delay cap
 * @param {Function} [options.onRetry] - Callback on each retry: (error, attempt, delay) => void
 * @param {Function} [options.shouldRetry] - Custom retry predicate: (error) => boolean
 * @returns {Promise<T>}
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    onRetry = null,
    shouldRetry = null,
  } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Default: retry on rate limits, service unavailable, connection reset
      const retryable = shouldRetry
        ? shouldRetry(error)
        : isRetryableError(error);

      if (!retryable) throw error;

      const delay = calculateDelay(attempt, baseDelayMs, maxDelayMs);

      if (onRetry) {
        onRetry(error, attempt + 1, delay);
      }

      await sleep(delay);
    }
  }
}

/**
 * Check if an error is retryable by default.
 * @param {Error} error
 * @returns {boolean}
 */
export function isRetryableError(error) {
  // HTTP status-based retries
  if (error.status === 429 || error.status === 503 || error.status === 502) return true;

  // Response status in different error shapes
  if (error.response?.status === 429 || error.response?.status === 503) return true;

  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') return true;

  // Rate limit error messages
  if (error.message && /rate.?limit/i.test(error.message)) return true;

  return false;
}

/**
 * Calculate delay with exponential backoff + jitter.
 * @param {number} attempt - Current attempt (0-indexed)
 * @param {number} baseDelayMs
 * @param {number} maxDelayMs
 * @returns {number}
 */
function calculateDelay(attempt, baseDelayMs, maxDelayMs) {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * baseDelayMs;
  return Math.min(exponential + jitter, maxDelayMs);
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
