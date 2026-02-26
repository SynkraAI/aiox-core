/**
 * Health Check Engine
 *
 * Core execution engine for health checks. Handles parallel execution,
 * caching, timeout management, and result aggregation.
 *
 * @module aios-core/health-check/engine
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { CheckStatus, CheckSeverity } = require('./base-check');

/**
 * Simple in-memory cache for check results
 * @private
 */
class ResultCache {
  constructor(ttl = 300000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Get cached result
   * @param {string} key - Cache key
   * @returns {Object|null} Cached result or null
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set cached result
   * @param {string} key - Cache key
   * @param {Object} value - Value to cache
   */
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached results
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      ttl: this.ttl,
    };
  }
}

/**
 * Health Check Engine
 *
 * Executes health checks with support for:
 * - Parallel execution within domains
 * - Result caching
 * - Timeout management
 * - Fail-fast for critical issues
 *
 * @class HealthCheckEngine
 */
class HealthCheckEngine {
  /**
   * Create a new HealthCheckEngine
   * @param {Object} config - Engine configuration
   * @param {boolean} [config.parallel=true] - Enable parallel execution
   * @param {Object} [config.cache] - Cache configuration
   * @param {Object} [config.performance] - Performance settings
   */
  constructor(config = {}) {
    this.config = config;
    this.parallel = config.parallel !== false;
    this.cache = new ResultCache(config.cache?.ttl || 300000);
    this.cacheEnabled = config.cache?.enabled !== false;

    this.timeouts = {
      quick: config.performance?.quickModeTimeout || 10000,
      full: config.performance?.fullModeTimeout || 60000,
    };

    this.startTime = null;
    this.results = [];
    this.errors = [];
  }

  /**
   * Run all provided checks
   *
   * @param {BaseCheck[]} checks - Array of checks to run
   * @param {Object} runConfig - Runtime configuration
   * @returns {Promise<Object[]>} Array of check results
   */
  async runChecks(checks, runConfig = {}) {
    this.startTime = Date.now();
    this.results = [];
    this.errors = [];

    const mode = runConfig.mode || 'quick';
    const timeout = this.timeouts[mode] || this.timeouts.quick;

    // Group checks by domain for parallel execution
    const _checksByDomain = this.groupByDomain(checks);

    // Execute checks by priority
    const _priorityOrder = [
      CheckSeverity.CRITICAL,
      CheckSeverity.HIGH,
      CheckSeverity.MEDIUM,
      CheckSeverity.LOW,
      CheckSeverity.INFO,
    ];

    try {
      // Run CRITICAL checks first
      const criticalChecks = checks.filter((c) => c.severity === CheckSeverity.CRITICAL);
      if (criticalChecks.length > 0) {
        const criticalResults = await this.runCheckGroup(criticalChecks, timeout, runConfig);
        this.results.push(...criticalResults);

        // Fail-fast in quick mode if critical failures
        if (mode === 'quick' && this.hasCriticalFailure(criticalResults)) {
          return this.results;
        }
      }

      // Run remaining checks by domain (parallel)
      const remainingChecks = checks.filter((c) => c.severity !== CheckSeverity.CRITICAL);

      if (this.parallel) {
        // Group by domain and run domains in parallel
        const domainGroups = this.groupByDomain(remainingChecks);
        const domainPromises = Object.entries(domainGroups).map(([_domain, domainChecks]) =>
          this.runCheckGroup(domainChecks, timeout, runConfig),
        );

        const domainResults = await Promise.all(domainPromises);
        for (const results of domainResults) {
          this.results.push(...results);
        }
      } else {
        // Run sequentially
        const results = await this.runCheckGroup(remainingChecks, timeout, runConfig);
        this.results.push(...results);
      }

      return this.results;
    } catch (error) {
      this.errors.push({
        message: error.message,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Run a group of checks (with optional parallelization within group)
   * @private
   * @param {BaseCheck[]} checks - Checks to run
   * @param {number} timeout - Timeout in milliseconds
   * @param {Object} runConfig - Runtime configuration
   * @returns {Promise<Object[]>} Check results
   */
  async runCheckGroup(checks, timeout, runConfig) {
    if (checks.length === 0) return [];

    const results = [];
    const remainingTime = timeout - (Date.now() - this.startTime);

    if (remainingTime <= 0) {
      // Timeout exceeded, mark remaining as skipped
      return checks.map((check) => this.createSkippedResult(check, 'Timeout exceeded'));
    }

    if (this.parallel) {
      // Run in parallel with timeout
      const promises = checks.map((check) => this.runSingleCheck(check, remainingTime, runConfig));

      const settledResults = await Promise.allSettled(promises);

      for (let i = 0; i < settledResults.length; i++) {
        const settled = settledResults[i];
        if (settled.status === 'fulfilled') {
          results.push(settled.value);
        } else {
          results.push(this.createErrorResult(checks[i], settled.reason));
        }
      }
    } else {
      // Run sequentially
      for (const check of checks) {
        const elapsedTime = Date.now() - this.startTime;
        if (elapsedTime >= timeout) {
          results.push(this.createSkippedResult(check, 'Timeout exceeded'));
          continue;
        }

        try {
          const result = await this.runSingleCheck(check, timeout - elapsedTime, runConfig);
          results.push(result);
        } catch (error) {
          results.push(this.createErrorResult(check, error));
        }
      }
    }

    return results;
  }

  /**
   * Run a single check with timeout
   * @private
   * @param {BaseCheck} check - Check to run
   * @param {number} timeout - Timeout in milliseconds
   * @param {Object} runConfig - Runtime configuration
   * @returns {Promise<Object>} Check result
   */
  async runSingleCheck(check, timeout, runConfig) {
    // Check cache first
    if (this.cacheEnabled && check.cacheable !== false) {
      const cached = this.cache.get(check.id);
      if (cached) {
        return { ...cached, fromCache: true };
      }
    }

    const startTime = Date.now();
    let timeoutId = null;

    try {
      // Create timeout promise with clearable timeout
      // Story TD-6: Fix Jest worker leak by properly clearing timeouts
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('Check timeout')),
          Math.min(timeout, check.timeout || 5000),
        );
      });

      // Execute check with timeout
      const result = await Promise.race([check.execute(runConfig), timeoutPromise]);

      // Clear timeout to prevent Jest worker leak (TD-6)
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      const checkResult = {
        checkId: check.id,
        name: check.name,
        domain: check.domain,
        severity: check.severity,
        status: result.status,
        message: result.message,
        details: result.details || null,
        recommendation: result.recommendation || null,
        healable: result.healable || false,
        healingTier: result.healingTier || 0,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        fromCache: false,
      };

      // Cache successful results
      if (this.cacheEnabled && check.cacheable !== false) {
        this.cache.set(check.id, checkResult);
      }

      return checkResult;
    } catch (error) {
      // Clear timeout on error as well (TD-6)
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      return this.createErrorResult(check, error, Date.now() - startTime);
    }
  }

  /**
   * Create an error result
   * @private
   * @param {BaseCheck} check - The check that failed
   * @param {Error} error - The error
   * @param {number} duration - Execution duration
   * @returns {Object} Error result
   */
  createErrorResult(check, error, duration = 0) {
    return {
      checkId: check.id,
      name: check.name,
      domain: check.domain,
      severity: check.severity,
      status: CheckStatus.ERROR,
      message: `Check failed: ${error.message}`,
      details: { error: error.message },
      recommendation: 'Investigate check execution error',
      healable: false,
      healingTier: 0,
      duration,
      timestamp: new Date().toISOString(),
      fromCache: false,
    };
  }

  /**
   * Create a skipped result
   * @private
   * @param {BaseCheck} check - The skipped check
   * @param {string} reason - Skip reason
   * @returns {Object} Skipped result
   */
  createSkippedResult(check, reason) {
    return {
      checkId: check.id,
      name: check.name,
      domain: check.domain,
      severity: check.severity,
      status: CheckStatus.SKIPPED,
      message: reason,
      details: null,
      recommendation: 'Run in full mode or increase timeout',
      healable: false,
      healingTier: 0,
      duration: 0,
      timestamp: new Date().toISOString(),
      fromCache: false,
    };
  }

  /**
   * Check if results contain critical failures
   * @private
   * @param {Object[]} results - Check results
   * @returns {boolean} True if critical failure exists
   */
  hasCriticalFailure(results) {
    return results.some(
      (r) =>
        r.severity === CheckSeverity.CRITICAL &&
        (r.status === CheckStatus.FAIL || r.status === CheckStatus.ERROR),
    );
  }

  /**
   * Group checks by domain
   * @private
   * @param {BaseCheck[]} checks - Checks to group
   * @returns {Object} Checks grouped by domain
   */
  groupByDomain(checks) {
    return checks.reduce((acc, check) => {
      const domain = check.domain || 'unknown';
      if (!acc[domain]) {
        acc[domain] = [];
      }
      acc[domain].push(check);
      return acc;
    }, {});
  }

  /**
   * Clear the result cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get execution statistics
   * @returns {Object} Execution stats
   */
  getStats() {
    return {
      totalDuration: this.startTime ? Date.now() - this.startTime : 0,
      checksRun: this.results.length,
      errors: this.errors.length,
      cacheStats: this.cache.getStats(),
    };
  }
}

module.exports = HealthCheckEngine;
