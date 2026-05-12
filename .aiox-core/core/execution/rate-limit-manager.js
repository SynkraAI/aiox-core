/**
 * Rate Limit Manager
 * Story 11.3 - Enhanced Capabilities
 *
 * Handles API rate limits gracefully with exponential backoff,
 * preemptive throttling, and comprehensive metrics.
 */

const EventEmitter = require('events');

class RateLimitManager extends EventEmitter {
  constructor(config = {}) {
    super();

    // Configuration
    this.maxRetries = config.maxRetries || 5;
    this.baseDelay = config.baseDelay || 1000; // 1s
    this.maxDelay = config.maxDelay || 30000; // 30s
    this.requestsPerMinute = config.requestsPerMinute || 50;

    // Metrics
    this.metrics = {
      rateLimitHits: 0,
      totalRetries: 0,
      successAfterRetry: 0,
      totalWaitTime: 0,
      preemptiveThrottles: 0,
      totalRequests: 0,
    };

    // Request log for preemptive throttling
    this.requestLog = [];

    // Rate limit events log
    this.eventLog = [];
    this.maxEventLog = 100;
  }

  /**
   * Execute a function with automatic retry on rate limits
   * @param {Function} fn - Async function to execute
   * @param {Object} context - Context for logging
   * @returns {Promise<any>} - Result of the function
   */
  async executeWithRetry(fn, context = {}) {
    // Preemptive throttle
    await this.preemptiveThrottle();

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logRequest();
        this.metrics.totalRequests++;

        const result = await fn();

        if (attempt > 1) {
          this.metrics.successAfterRetry++;
          this.logEvent('success_after_retry', { attempt, context });
        }

        return result;
      } catch (error) {
        if (!this.isRateLimitError(error)) {
          throw error;
        }

        this.metrics.rateLimitHits++;
        this.emit('rate_limit_hit', { attempt, error, context });

        if (attempt === this.maxRetries) {
          this.logEvent('max_retries_exceeded', { context, error: error.message });
          throw new Error(`Rate limit exceeded after ${this.maxRetries} retries: ${error.message}`);
        }

        const delay = this.calculateDelay(attempt, error);
        this.logEvent('rate_limit_hit', { attempt, delay, context, error: error.message });

        this.metrics.totalWaitTime += delay;
        this.metrics.totalRetries++;

        this.emit('waiting', { attempt, delay, context });
        await this.sleep(delay);
      }
    }
  }

  /**
   * Calculate delay with exponential backoff and jitter
   * @param {number} attempt - Current attempt number
   * @param {Error} error - The error that triggered retry
   * @returns {number} - Delay in milliseconds
   */
  calculateDelay(attempt, error) {
    // Check for Retry-After header (common in 429 responses)
    if (error.retryAfter) {
      return Math.min(error.retryAfter * 1000, this.maxDelay);
    }

    // Extract retry-after from error message if present
    const retryAfterMatch = error.message?.match(/retry.?after[:\s]*(\d+)/i);
    if (retryAfterMatch) {
      return Math.min(parseInt(retryAfterMatch[1]) * 1000, this.maxDelay);
    }

    // Exponential backoff: 1s → 2s → 4s → 8s → 16s
    const exponential = this.baseDelay * Math.pow(2, attempt - 1);

    // Add jitter (0-1000ms) to prevent thundering herd
    const jitter = Math.random() * 1000;

    return Math.min(exponential + jitter, this.maxDelay);
  }

  /**
   * Preemptively throttle if approaching rate limit
   */
  async preemptiveThrottle() {
    // Clean old requests (older than 1 minute)
    const oneMinuteAgo = Date.now() - 60000;
    this.requestLog = this.requestLog.filter((t) => t > oneMinuteAgo);

    // Check if we're approaching limit (80% threshold)
    const threshold = this.requestsPerMinute * 0.8;
    if (this.requestLog.length >= threshold) {
      // Calculate wait time until oldest request expires
      const waitTime = 60000 - (Date.now() - this.requestLog[0]);

      if (waitTime > 0) {
        this.metrics.preemptiveThrottles++;
        this.logEvent('preemptive_throttle', {
          waitTime,
          currentCount: this.requestLog.length,
          threshold,
        });
        this.emit('preemptive_throttle', { waitTime, currentCount: this.requestLog.length });
        await this.sleep(waitTime);
      }
    }
  }

  /**
   * Check if error is a rate limit error
   * @param {Error} error - The error to check
   * @returns {boolean} - True if rate limit error
   */
  isRateLimitError(error) {
    // HTTP 429 Too Many Requests
    if (error.status === 429 || error.statusCode === 429) return true;

    // Check error message
    const message = error.message?.toLowerCase() || '';
    if (message.includes('rate limit')) return true;
    if (message.includes('too many requests')) return true;
    if (message.includes('throttl')) return true;
    if (message.includes('quota exceeded')) return true;

    // Anthropic/Claude specific
    if (message.includes('overloaded')) return true;

    // Check error code
    if (error.code === 'RATE_LIMITED') return true;
    if (error.code === 'TOO_MANY_REQUESTS') return true;

    return false;
  }

  /**
   * Log a request timestamp
   */
  logRequest() {
    this.requestLog.push(Date.now());
  }

  /**
   * Log an event
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  logEvent(type, data) {
    const event = {
      type,
      timestamp: new Date().toISOString(),
      ...data,
    };

    this.eventLog.push(event);

    // Keep log bounded
    if (this.eventLog.length > this.maxEventLog) {
      this.eventLog.shift();
    }
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current metrics
   * @returns {Object} - Metrics object
   */
  getMetrics() {
    return {
      ...this.metrics,
      averageWaitTime:
        this.metrics.totalRetries > 0
          ? Math.round(this.metrics.totalWaitTime / this.metrics.totalRetries)
          : 0,
      successRate:
        this.metrics.totalRequests > 0
          ? ((this.metrics.totalRequests - this.metrics.rateLimitHits) /
              this.metrics.totalRequests) *
            100
          : 100,
      currentRequestCount: this.requestLog.filter((t) => t > Date.now() - 60000).length,
      requestsPerMinuteLimit: this.requestsPerMinute,
    };
  }

  /**
   * Get recent events
   * @param {number} limit - Maximum events to return
   * @returns {Array} - Recent events
   */
  getRecentEvents(limit = 20) {
    return this.eventLog.slice(-limit);
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      rateLimitHits: 0,
      totalRetries: 0,
      successAfterRetry: 0,
      totalWaitTime: 0,
      preemptiveThrottles: 0,
      totalRequests: 0,
    };
    this.eventLog = [];
  }

  /**
   * Format status for CLI output
   * @returns {string} - Formatted status
   */
  formatStatus() {
    const metrics = this.getMetrics();
    const recentEvents = this.getRecentEvents(5);

    let output = '📊 Rate Limit Manager Status\n';
    output += '━'.repeat(40) + '\n\n';

    output += '**Metrics:**\n';
    output += `  Total Requests: ${metrics.totalRequests}\n`;
    output += `  Rate Limit Hits: ${metrics.rateLimitHits}\n`;
    output += `  Success Rate: ${metrics.successRate.toFixed(1)}%\n`;
    output += `  Avg Wait Time: ${metrics.averageWaitTime}ms\n`;
    output += `  Preemptive Throttles: ${metrics.preemptiveThrottles}\n`;
    output += `  Current RPM: ${metrics.currentRequestCount}/${metrics.requestsPerMinuteLimit}\n\n`;

    if (recentEvents.length > 0) {
      output += '**Recent Events:**\n';
      for (const event of recentEvents) {
        const time = event.timestamp.split('T')[1].split('.')[0];
        output += `  [${time}] ${event.type}`;
        if (event.delay) output += ` (delay: ${event.delay}ms)`;
        if (event.attempt) output += ` (attempt: ${event.attempt})`;
        output += '\n';
      }
    }

    return output;
  }
}

/**
 * Wrap a function with rate limiting
 * @param {Function} fn - Function to wrap
 * @param {RateLimitManager} manager - Rate limit manager instance
 * @param {Object} context - Context for logging
 * @returns {Function} - Wrapped function
 */
function withRateLimit(fn, manager, context = {}) {
  return async (...args) => {
    return manager.executeWithRetry(() => fn(...args), context);
  };
}

// Singleton instance for global use
let globalManager = null;

/**
 * Get global rate limit manager instance
 * @param {Object} config - Configuration (only used on first call)
 * @returns {RateLimitManager}
 */
function getGlobalManager(config = {}) {
  if (!globalManager) {
    globalManager = new RateLimitManager(config);
  }
  return globalManager;
}

module.exports = RateLimitManager;
module.exports.RateLimitManager = RateLimitManager;
module.exports.withRateLimit = withRateLimit;
module.exports.getGlobalManager = getGlobalManager;
