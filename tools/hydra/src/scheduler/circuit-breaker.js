/**
 * @module circuit-breaker
 * @description Per-source-group circuit breaker with disk persistence.
 * States: CLOSED (normal) -> OPEN (skip) -> HALF_OPEN (probe) -> CLOSED
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CB_STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

/**
 * @typedef {Object} CircuitBreakerOptions
 * @property {number} [failureThreshold=3] - Consecutive failures to open
 * @property {number} [cooldownMs=300000] - Cooldown before half-open (5 min)
 * @property {number} [halfOpenMaxAttempts=1] - Probes in half-open state
 * @property {string} [stateFile] - Path to persist state
 */

export class CircuitBreaker {
  /**
   * @param {CircuitBreakerOptions} [options={}]
   */
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold ?? 3;
    this.cooldownMs = options.cooldownMs ?? 300000;
    this.halfOpenMaxAttempts = options.halfOpenMaxAttempts ?? 1;
    this.stateFile = options.stateFile ??
      path.resolve(__dirname, '../../hydra-data/state/circuit-breakers.json');

    /** @type {Map<string, { state: string, failures: number, lastFailure: number, halfOpenAttempts: number }>} */
    this.breakers = new Map();

    this._loadState();
  }

  /**
   * Check if circuit is open for a group.
   * @param {string} group - Source group name
   * @returns {boolean}
   */
  isOpen(group) {
    const breaker = this._getBreaker(group);

    if (breaker.state === CB_STATES.CLOSED) return false;

    if (breaker.state === CB_STATES.OPEN) {
      // Check if cooldown has elapsed
      if (Date.now() - breaker.lastFailure >= this.cooldownMs) {
        breaker.state = CB_STATES.HALF_OPEN;
        breaker.halfOpenAttempts = 0;
        this._saveState();
        return false; // Allow one probe
      }
      return true;
    }

    // HALF_OPEN: allow limited attempts
    if (breaker.state === CB_STATES.HALF_OPEN) {
      return breaker.halfOpenAttempts >= this.halfOpenMaxAttempts;
    }

    return false;
  }

  /**
   * Record a failure for a group.
   * @param {string} group - Source group name
   */
  recordFailure(group) {
    const breaker = this._getBreaker(group);
    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.state === CB_STATES.HALF_OPEN) {
      breaker.state = CB_STATES.OPEN;
      breaker.halfOpenAttempts = 0;
    } else if (breaker.failures >= this.failureThreshold) {
      breaker.state = CB_STATES.OPEN;
    }

    this._saveState();
  }

  /**
   * Record a success for a group (resets breaker).
   * @param {string} group - Source group name
   */
  recordSuccess(group) {
    const breaker = this._getBreaker(group);
    breaker.state = CB_STATES.CLOSED;
    breaker.failures = 0;
    breaker.halfOpenAttempts = 0;
    this._saveState();
  }

  /**
   * Get the state of all breakers.
   * @returns {Object} Map of group -> state info
   */
  getState() {
    const state = {};
    for (const [group, breaker] of this.breakers) {
      state[group] = { ...breaker };
    }
    return state;
  }

  /**
   * Get summary counts.
   * @returns {{ closed: number, open: number, halfOpen: number }}
   */
  getSummary() {
    let closed = 0, open = 0, halfOpen = 0;
    for (const breaker of this.breakers.values()) {
      if (breaker.state === CB_STATES.CLOSED) closed++;
      else if (breaker.state === CB_STATES.OPEN) open++;
      else halfOpen++;
    }
    return { closed, open, halfOpen };
  }

  /**
   * Reset a specific breaker.
   * @param {string} group - Source group name
   */
  reset(group) {
    this.breakers.delete(group);
    this._saveState();
  }

  /**
   * Reset all breakers.
   */
  resetAll() {
    this.breakers.clear();
    this._saveState();
  }

  /** @private */
  _getBreaker(group) {
    if (!this.breakers.has(group)) {
      this.breakers.set(group, {
        state: CB_STATES.CLOSED,
        failures: 0,
        lastFailure: 0,
        halfOpenAttempts: 0,
      });
    }
    return this.breakers.get(group);
  }

  /** @private */
  _loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = JSON.parse(fs.readFileSync(this.stateFile, 'utf-8'));
        for (const [group, state] of Object.entries(data)) {
          this.breakers.set(group, state);
        }
      }
    } catch {
      // Start fresh if state file is corrupted
    }
  }

  /** @private */
  _saveState() {
    try {
      const dir = path.dirname(this.stateFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {};
      for (const [group, state] of this.breakers) {
        data[group] = state;
      }
      fs.writeFileSync(this.stateFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Non-critical — state will be rebuilt on next run
    }
  }
}
