'use strict';

const { getClient, isCodeIntelAvailable } = require('../../code-intel');

/**
 * Data source that provides cache and latency metrics from the code-intel client.
 * Falls back to offline data when Code Graph MCP is unavailable.
 * Implements the same interface as CodeIntelSource: getData(), getLastUpdate(), isStale().
 */
class MetricsSource {
  /**
   * @param {Object} [options]
   * @param {number} [options.cacheTTL=5000] - Cache TTL in milliseconds
   */
  constructor(options = {}) {
    this._cache = null;
    this._cacheTimestamp = 0;
    this._cacheTTL = options.cacheTTL || 5000;
  }

  /**
   * Get metrics from code-intel client.
   * Primary: live metrics from active provider.
   * Fallback: offline placeholder with providerAvailable=false.
   * @returns {Promise<Object>} Metrics object
   */
  async getData() {
    if (this._cache && !this.isStale()) {
      return this._cache;
    }

    let result;

    try {
      if (isCodeIntelAvailable()) {
        const client = getClient();
        const metrics = client.getMetrics();
        result = {
          cacheHits: metrics.cacheHits || 0,
          cacheMisses: metrics.cacheMisses || 0,
          cacheHitRate: metrics.cacheHitRate || 0,
          circuitBreakerState: metrics.circuitBreakerState || 'CLOSED',
          latencyLog: metrics.latencyLog || [],
          providerAvailable: true,
          activeProvider: metrics.activeProvider || null,
          timestamp: Date.now(),
        };
      } else {
        result = this._offlineMetrics();
      }
    } catch (_err) {
      result = this._offlineMetrics();
    }

    this._cache = result;
    this._cacheTimestamp = Date.now();
    return result;
  }

  /**
   * Get timestamp of last successful data fetch.
   * @returns {number}
   */
  getLastUpdate() {
    return this._cacheTimestamp;
  }

  /**
   * Check if cached data is expired.
   * @returns {boolean}
   */
  isStale() {
    return Date.now() - this._cacheTimestamp > this._cacheTTL;
  }

  /**
   * Return offline placeholder metrics.
   * @returns {Object}
   * @private
   */
  _offlineMetrics() {
    return {
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      circuitBreakerState: 'CLOSED',
      latencyLog: [],
      providerAvailable: false,
      activeProvider: null,
      timestamp: Date.now(),
    };
  }
}

module.exports = { MetricsSource };
