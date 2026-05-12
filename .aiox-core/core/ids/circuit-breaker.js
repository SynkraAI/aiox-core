'use strict';

/**
 * CircuitBreaker — IDS Story IDS-5a
 *
 * Implements the Circuit Breaker pattern for graceful degradation.
 * Prevents cascading failures by tracking consecutive failures and
 * opening the circuit when a threshold is reached.
 *
 * States:
 *   CLOSED  -> Normal operation, requests pass through
 *   OPEN    -> Failures exceeded threshold, requests short-circuit
 *   HALF_OPEN -> After reset timeout, allows one probe request
 *
 * Source: ids-principles.md circuit_breaker config
 */

const STATE_CLOSED = 'CLOSED';
const STATE_OPEN = 'OPEN';
const STATE_HALF_OPEN = 'HALF_OPEN';

const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_SUCCESS_THRESHOLD = 3;
const DEFAULT_RESET_TIMEOUT_MS = 60000;

class CircuitBreaker {
  /**
   * @param {object} [options]
   * @param {number} [options.failureThreshold=5] — Failures before opening circuit
   * @param {number} [options.successThreshold=3] — Successes in half-open to close circuit
   * @param {number} [options.resetTimeoutMs=60000] — Time before transitioning to half-open
   */
  constructor(options = {}) {
    this._failureThreshold = options.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD;
    this._successThreshold = options.successThreshold ?? DEFAULT_SUCCESS_THRESHOLD;
    this._resetTimeoutMs = options.resetTimeoutMs ?? DEFAULT_RESET_TIMEOUT_MS;

    this._state = STATE_CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._lastFailureTime = 0;
    this._totalTrips = 0;
    this._halfOpenProbeInFlight = false;
  }

  /**
   * Check if the circuit allows the request to pass.
   * @returns {boolean} true if the request is allowed
   */
  isAllowed() {
    if (this._state === STATE_CLOSED) {
      return true;
    }

    if (this._state === STATE_OPEN) {
      const elapsed = Date.now() - this._lastFailureTime;
      if (elapsed >= this._resetTimeoutMs) {
        this._state = STATE_HALF_OPEN;
        this._successCount = 0;
        this._halfOpenProbeInFlight = true; // This request IS the probe
        return true;
      }
      return false;
    }

    // HALF_OPEN: allow exactly one probe request
    if (!this._halfOpenProbeInFlight) {
      this._halfOpenProbeInFlight = true;
      return true;
    }
    return false;
  }

  /**
   * Record a successful operation.
   */
  recordSuccess() {
    if (this._state === STATE_HALF_OPEN) {
      this._halfOpenProbeInFlight = false;
      this._successCount++;
      if (this._successCount >= this._successThreshold) {
        this._state = STATE_CLOSED;
        this._failureCount = 0;
        this._successCount = 0;
      }
    } else if (this._state === STATE_CLOSED) {
      // Reset consecutive failure count on success
      this._failureCount = 0;
    }
  }

  /**
   * Record a failed operation.
   */
  recordFailure() {
    this._failureCount++;
    this._lastFailureTime = Date.now();

    if (this._state === STATE_HALF_OPEN) {
      // Any failure in half-open re-opens the circuit
      this._halfOpenProbeInFlight = false;
      this._state = STATE_OPEN;
      this._totalTrips++;
      this._successCount = 0;
    } else if (this._state === STATE_CLOSED) {
      if (this._failureCount >= this._failureThreshold) {
        this._state = STATE_OPEN;
        this._totalTrips++;
      }
    }
  }

  /**
   * Get current circuit breaker state.
   * @returns {string} STATE_CLOSED, STATE_OPEN, or STATE_HALF_OPEN
   */
  getState() {
    return this._state;
  }

  /**
   * Get diagnostic stats for logging/metrics.
   * @returns {object}
   */
  getStats() {
    return {
      state: this.getState(),
      failureCount: this._failureCount,
      successCount: this._successCount,
      totalTrips: this._totalTrips,
      lastFailureTime: this._lastFailureTime || null,
    };
  }

  /**
   * Reset the circuit breaker to CLOSED state.
   * Useful for testing and manual recovery.
   */
  reset() {
    this._state = STATE_CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._lastFailureTime = 0;
    this._halfOpenProbeInFlight = false;
  }
}

module.exports = {
  CircuitBreaker,
  STATE_CLOSED,
  STATE_OPEN,
  STATE_HALF_OPEN,
  DEFAULT_FAILURE_THRESHOLD,
  DEFAULT_SUCCESS_THRESHOLD,
  DEFAULT_RESET_TIMEOUT_MS,
};
