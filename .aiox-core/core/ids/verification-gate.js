'use strict';

/**
 * VerificationGate — IDS Story IDS-5a
 *
 * Abstract base class for IDS verification gates (G1-G6).
 * Uses the Template Method pattern: subclasses implement _doVerify()
 * while the base class handles timeout, circuit breaker, logging,
 * and graceful degradation.
 *
 * Gate behavior:
 *   - Advisory gates (G1-G4): log and return suggestions, never block
 *   - Blocking gates (G5-G6): handled in IDS-5b
 *
 * Key principle: Development must NEVER be blocked by IDS failures.
 *
 * Source: ids-principles.md, story IDS-5a
 */

const { CircuitBreaker } = require('./circuit-breaker');

const DEFAULT_TIMEOUT_MS = 2000;

/**
 * Build a GateResult structure.
 * @param {object} fields
 * @returns {object}
 */
function createGateResult(fields = {}) {
  return {
    gateId: fields.gateId || null,
    agent: fields.agent || null,
    timestamp: fields.timestamp || new Date().toISOString(),
    context: fields.context || {},
    result: {
      passed: fields.passed !== undefined ? fields.passed : true,
      blocking: fields.blocking !== undefined ? fields.blocking : false,
      warnings: fields.warnings || [],
      opportunities: fields.opportunities || [],
    },
    override: fields.override || null,
    executionMs: fields.executionMs || 0,
    circuitBreakerState: fields.circuitBreakerState || 'CLOSED',
  };
}

class VerificationGate {
  /**
   * @param {object} config
   * @param {string} config.gateId — Gate identifier (e.g., 'G1', 'G2')
   * @param {string} config.agent — Agent identifier (e.g., '@pm', '@dev')
   * @param {boolean} [config.blocking=false] — Whether this gate can block workflow
   * @param {number} [config.timeoutMs=2000] — Timeout for gate execution
   * @param {object} [config.circuitBreakerOptions] — Options for CircuitBreaker
   * @param {Function} [config.logger] — Custom logger function (defaults to console)
   */
  constructor(config = {}) {
    if (!config.gateId) {
      throw new Error('[IDS-Gate] gateId is required');
    }
    if (!config.agent) {
      throw new Error('[IDS-Gate] agent is required');
    }

    this._gateId = config.gateId;
    this._agent = config.agent;
    this._blocking = config.blocking || false;
    this._timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this._circuitBreaker = new CircuitBreaker(config.circuitBreakerOptions || {});
    this._logger = config.logger || console;
    this._invocationCount = 0;
    this._lastResult = null;
  }

  // ================================================================
  // Public API
  // ================================================================

  /**
   * Execute the verification gate with timeout and circuit breaker protection.
   * Template Method: calls _doVerify() implemented by subclasses.
   *
   * @param {object} context — Gate-specific verification context
   * @returns {Promise<object>} GateResult structure
   */
  async verify(context = {}) {
    this._invocationCount++;
    const startTime = Date.now();

    // Circuit breaker check: if open, warn-and-proceed
    if (!this._circuitBreaker.isAllowed()) {
      const stats = this._circuitBreaker.getStats();
      this._log('warn', `Circuit breaker OPEN (${stats.totalTrips} trips). Skipping gate.`);

      const result = createGateResult({
        gateId: this._gateId,
        agent: this._agent,
        passed: true,
        blocking: false,
        warnings: [`Gate ${this._gateId} skipped: circuit breaker open`],
        opportunities: [],
        context,
        executionMs: Date.now() - startTime,
        circuitBreakerState: stats.state,
      });

      this._logInvocation(result);
      this._lastResult = result;
      return result;
    }

    try {
      // Execute with timeout wrapper
      const verifyResult = await this._executeWithTimeout(context);
      const executionMs = Date.now() - startTime;

      this._circuitBreaker.recordSuccess();

      const result = createGateResult({
        gateId: this._gateId,
        agent: this._agent,
        passed: verifyResult.passed !== undefined ? verifyResult.passed : true,
        blocking: this._blocking && !verifyResult.passed,
        warnings: verifyResult.warnings || [],
        opportunities: verifyResult.opportunities || [],
        override: verifyResult.override || null,
        context,
        executionMs,
        circuitBreakerState: this._circuitBreaker.getState(),
      });

      this._logInvocation(result);
      this._lastResult = result;
      return result;
    } catch (error) {
      const executionMs = Date.now() - startTime;
      this._circuitBreaker.recordFailure();

      // Graceful degradation: log-and-proceed on error
      this._log('warn', `Gate failed (${error.message}). Proceeding with warning.`);

      const result = createGateResult({
        gateId: this._gateId,
        agent: this._agent,
        passed: true,
        blocking: false,
        warnings: [`Gate ${this._gateId} error: ${error.message}`],
        opportunities: [],
        context,
        executionMs,
        circuitBreakerState: this._circuitBreaker.getState(),
      });

      this._logInvocation(result);
      this._lastResult = result;
      return result;
    }
  }

  /**
   * Get the gate identifier.
   * @returns {string}
   */
  getGateId() {
    return this._gateId;
  }

  /**
   * Get the agent this gate is associated with.
   * @returns {string}
   */
  getAgent() {
    return this._agent;
  }

  /**
   * Get whether this gate blocks workflow.
   * @returns {boolean}
   */
  isBlocking() {
    return this._blocking;
  }

  /**
   * Get invocation count.
   * @returns {number}
   */
  getInvocationCount() {
    return this._invocationCount;
  }

  /**
   * Get the last result.
   * @returns {object|null}
   */
  getLastResult() {
    return this._lastResult;
  }

  /**
   * Get circuit breaker stats.
   * @returns {object}
   */
  getCircuitBreakerStats() {
    return this._circuitBreaker.getStats();
  }

  // ================================================================
  // Template Method — subclasses must implement
  // ================================================================

  /**
   * Perform the actual verification logic.
   * Subclasses MUST override this method.
   *
   * @param {object} context — Gate-specific context
   * @returns {Promise<object>} Object with { passed, warnings, opportunities }
   * @abstract
   */
  async _doVerify(_context) {
    throw new Error(
      `[IDS-Gate] _doVerify() must be implemented by subclass (gate: ${this._gateId})`,
    );
  }

  // ================================================================
  // Internal helpers
  // ================================================================

  /**
   * Execute _doVerify with a timeout. On timeout, returns warn-and-proceed.
   * @param {object} context
   * @returns {Promise<object>}
   */
  async _executeWithTimeout(context) {
    return new Promise((resolve, reject) => {
      let isSettled = false;

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          this._log('warn', `Gate timed out after ${this._timeoutMs}ms. Warn-and-proceed.`);
          resolve({
            passed: true,
            warnings: [`Gate ${this._gateId} timed out after ${this._timeoutMs}ms`],
            opportunities: [],
          });
        }
      }, this._timeoutMs);

      this._doVerify(context)
        .then((result) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            resolve(result);
          }
        })
        .catch((error) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            reject(error);
          }
        });
    });
  }

  /**
   * Log a gate invocation for metrics.
   * @param {object} result — GateResult structure
   */
  _logInvocation(result) {
    this._log('info', `Gate ${this._gateId} invoked`, {
      passed: result.result.passed,
      blocking: result.result.blocking,
      warnings: result.result.warnings.length,
      opportunities: result.result.opportunities.length,
      executionMs: result.executionMs,
      circuitBreakerState: result.circuitBreakerState,
      invocationCount: this._invocationCount,
    });
  }

  /**
   * Internal logging helper.
   * @param {string} level — 'info', 'warn', 'error'
   * @param {string} message
   * @param {object} [data]
   */
  _log(level, message, data) {
    const prefix = `[IDS-${this._gateId}]`;
    const logFn = this._logger[level] || this._logger.log || console.log;
    if (data) {
      logFn(`${prefix} ${message}`, data);
    } else {
      logFn(`${prefix} ${message}`);
    }
  }
}

module.exports = {
  VerificationGate,
  createGateResult,
  DEFAULT_TIMEOUT_MS,
};
