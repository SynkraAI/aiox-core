/**
 * @module rate-limiter
 * @description Token bucket rate limiter per adapter type.
 */

/**
 * @typedef {Object} RateLimitConfig
 * @property {number} [requestsPerMinute] - Requests allowed per minute
 * @property {number} [requestsPerHour] - Requests allowed per hour
 * @property {number} [requestsPer15Min] - Requests per 15 minutes
 * @property {number} [burstSize=1] - Max burst above rate
 */

export class RateLimiter {
  /**
   * @param {Object<string, RateLimitConfig>} config - Rate limits by adapter type
   */
  constructor(config = {}) {
    /** @type {Map<string, { tokens: number, maxTokens: number, refillRate: number, lastRefill: number }>} */
    this.buckets = new Map();
    this.config = config;

    this._initBuckets();
  }

  /**
   * Check if a request is allowed for a given adapter type.
   * Consumes a token if allowed.
   * @param {string} adapterType - Adapter type (e.g., 'github', 'youtube')
   * @returns {boolean} True if request is allowed
   */
  tryAcquire(adapterType) {
    const bucket = this.buckets.get(adapterType);
    if (!bucket) return true; // No limit configured

    this._refill(bucket);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Get the wait time in ms before next request is allowed.
   * @param {string} adapterType - Adapter type
   * @returns {number} Wait time in ms (0 if immediately available)
   */
  getWaitTime(adapterType) {
    const bucket = this.buckets.get(adapterType);
    if (!bucket) return 0;

    this._refill(bucket);

    if (bucket.tokens >= 1) return 0;

    // Time until next token
    const tokensNeeded = 1 - bucket.tokens;
    return Math.ceil(tokensNeeded / bucket.refillRate * 1000);
  }

  /**
   * Wait until a request is allowed, then consume a token.
   * @param {string} adapterType - Adapter type
   * @returns {Promise<void>}
   */
  async waitAndAcquire(adapterType) {
    const waitTime = this.getWaitTime(adapterType);
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.tryAcquire(adapterType);
  }

  /**
   * Get current token count for an adapter type.
   * @param {string} adapterType - Adapter type
   * @returns {number}
   */
  getTokens(adapterType) {
    const bucket = this.buckets.get(adapterType);
    if (!bucket) return Infinity;
    this._refill(bucket);
    return bucket.tokens;
  }

  /** @private */
  _initBuckets() {
    for (const [type, cfg] of Object.entries(this.config)) {
      let ratePerSecond;

      if (cfg.requestsPerMinute) {
        ratePerSecond = cfg.requestsPerMinute / 60;
      } else if (cfg.requestsPerHour) {
        ratePerSecond = cfg.requestsPerHour / 3600;
      } else if (cfg.requestsPer15Min) {
        ratePerSecond = cfg.requestsPer15Min / 900;
      } else {
        continue; // No rate configured
      }

      const burstSize = cfg.burstSize ?? 1;
      const maxTokens = Math.max(ratePerSecond * 60, burstSize); // 1 minute worth + burst

      this.buckets.set(type, {
        tokens: maxTokens,
        maxTokens,
        refillRate: ratePerSecond,
        lastRefill: Date.now(),
      });
    }
  }

  /** @private */
  _refill(bucket) {
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000; // seconds
    bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + elapsed * bucket.refillRate);
    bucket.lastRefill = now;
  }
}
