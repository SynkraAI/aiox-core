/**
 * Base Layer Class
 *
 * Abstract base class for quality gate layers.
 * Provides common functionality for all layer implementations.
 *
 * @module core/quality-gates/base-layer
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

/**
 * Base class for quality gate layers
 * @abstract
 */
class BaseLayer {
  /**
   * Create a new layer instance
   * @param {string} name - Layer name
   * @param {Object} config - Layer configuration
   */
  constructor(name, config = {}) {
    if (new.target === BaseLayer) {
      throw new Error('BaseLayer is abstract and cannot be instantiated directly');
    }
    this.name = name;
    this.config = config;
    this.enabled = config.enabled !== false;
    this.startTime = null;
    this.endTime = null;
    this.results = [];
  }

  /**
   * Execute the layer checks
   * @abstract
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer results
   */
  async execute(_context) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Start timing for this layer
   */
  startTimer() {
    this.startTime = Date.now();
  }

  /**
   * Stop timing and return duration
   * @returns {number} Duration in milliseconds
   */
  stopTimer() {
    this.endTime = Date.now();
    return this.getDuration();
  }

  /**
   * Get execution duration
   * @returns {number} Duration in milliseconds
   */
  getDuration() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return end - this.startTime;
  }

  /**
   * Add a result to the layer results
   * @param {Object} result - Check result
   */
  addResult(result) {
    this.results.push({
      ...result,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if layer passed
   * @returns {boolean} True if all checks passed
   */
  hasPassed() {
    return this.results.every((r) => r.pass);
  }

  /**
   * Get summary of layer results
   * @returns {Object} Summary object
   */
  getSummary() {
    const passed = this.results.filter((r) => r.pass).length;
    const failed = this.results.filter((r) => !r.pass).length;
    const warnings = this.results.filter((r) => r.warnings && r.warnings.length > 0).length;

    return {
      layer: this.name,
      enabled: this.enabled,
      pass: this.hasPassed(),
      duration: this.getDuration(),
      checks: {
        total: this.results.length,
        passed,
        failed,
        warnings,
      },
      results: this.results,
    };
  }

  /**
   * Reset layer state for re-execution
   */
  reset() {
    this.startTime = null;
    this.endTime = null;
    this.results = [];
  }

  /**
   * Format duration for display
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}

module.exports = { BaseLayer };
