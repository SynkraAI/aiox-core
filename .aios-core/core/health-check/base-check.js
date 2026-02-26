/**
 * Base Check Class
 *
 * Abstract base class for all health checks. Provides common
 * functionality and enforces the check interface.
 *
 * @module aios-core/health-check/base-check
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

/**
 * Check severity levels
 * @enum {string}
 */
const CheckSeverity = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO',
};

/**
 * Check status values
 * @enum {string}
 */
const CheckStatus = {
  PASS: 'pass',
  FAIL: 'fail',
  WARNING: 'warning',
  ERROR: 'error',
  SKIPPED: 'skipped',
};

/**
 * Health check domains
 * @enum {string}
 */
const CheckDomain = {
  PROJECT: 'project',
  LOCAL: 'local',
  REPOSITORY: 'repository',
  DEPLOYMENT: 'deployment',
  SERVICES: 'services',
};

/**
 * Base class for all health checks
 * @abstract
 */
class BaseCheck {
  /**
   * Create a new check instance
   * @param {Object} options - Check options
   * @param {string} options.id - Unique check identifier
   * @param {string} options.name - Human-readable check name
   * @param {string} options.description - Check description
   * @param {string} options.domain - Check domain (project, local, repository, deployment, services)
   * @param {string} options.severity - Check severity (CRITICAL, HIGH, MEDIUM, LOW, INFO)
   * @param {number} [options.timeout=5000] - Check timeout in milliseconds
   * @param {boolean} [options.cacheable=true] - Whether results can be cached
   * @param {number} [options.healingTier=0] - Healing tier (0=no healing, 1-3=auto-heal tiers)
   */
  constructor(options) {
    if (new.target === BaseCheck) {
      throw new Error('BaseCheck is abstract and cannot be instantiated directly');
    }

    // Validate required options
    if (!options.id) throw new Error('Check must have an id');
    if (!options.name) throw new Error('Check must have a name');
    if (!options.domain) throw new Error('Check must have a domain');
    if (!options.severity) throw new Error('Check must have a severity');

    this.id = options.id;
    this.name = options.name;
    this.description = options.description || '';
    this.domain = options.domain;
    this.severity = options.severity;
    this.timeout = options.timeout || 5000;
    this.cacheable = options.cacheable !== false;
    this.healingTier = options.healingTier || 0;
    this.tags = options.tags || [];
  }

  /**
   * Execute the health check
   * @abstract
   * @param {Object} context - Execution context
   * @returns {Promise<CheckResult>} Check result
   */
  async execute(_context) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Create a passing result
   * @param {string} message - Success message
   * @param {Object} [details] - Additional details
   * @returns {CheckResult} Pass result
   */
  pass(message, details = null) {
    return {
      status: CheckStatus.PASS,
      message,
      details,
      healable: false,
      healingTier: 0,
    };
  }

  /**
   * Create a failing result
   * @param {string} message - Failure message
   * @param {Object} [options] - Additional options
   * @param {Object} [options.details] - Additional details
   * @param {string} [options.recommendation] - Fix recommendation
   * @param {boolean} [options.healable] - Whether issue can be auto-fixed
   * @param {number} [options.healingTier] - Healing tier (1-3)
   * @returns {CheckResult} Fail result
   */
  fail(message, options = {}) {
    return {
      status: CheckStatus.FAIL,
      message,
      details: options.details || null,
      recommendation: options.recommendation || null,
      healable: options.healable || false,
      healingTier: options.healingTier || this.healingTier,
    };
  }

  /**
   * Create a warning result
   * @param {string} message - Warning message
   * @param {Object} [options] - Additional options
   * @param {Object} [options.details] - Additional details
   * @param {string} [options.recommendation] - Recommendation
   * @param {boolean} [options.healable] - Whether issue can be auto-fixed
   * @param {number} [options.healingTier] - Healing tier (1-3)
   * @returns {CheckResult} Warning result
   */
  warning(message, options = {}) {
    return {
      status: CheckStatus.WARNING,
      message,
      details: options.details || null,
      recommendation: options.recommendation || null,
      healable: options.healable || false,
      healingTier: options.healingTier || this.healingTier,
    };
  }

  /**
   * Create an error result
   * @param {string} message - Error message
   * @param {Error} [error] - Original error
   * @returns {CheckResult} Error result
   */
  error(message, error = null) {
    return {
      status: CheckStatus.ERROR,
      message,
      details: error ? { error: error.message, stack: error.stack } : null,
      healable: false,
      healingTier: 0,
    };
  }

  /**
   * Get check metadata
   * @returns {Object} Check metadata
   */
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      domain: this.domain,
      severity: this.severity,
      timeout: this.timeout,
      cacheable: this.cacheable,
      healingTier: this.healingTier,
      tags: this.tags,
    };
  }

  /**
   * Check if this check supports auto-healing
   * @returns {boolean} True if healable
   */
  isHealable() {
    return this.healingTier > 0;
  }

  /**
   * Get the healer function for this check
   * Override in subclass if check supports healing
   * @returns {Function|null} Healer function or null
   */
  getHealer() {
    return null;
  }
}

/**
 * @typedef {Object} CheckResult
 * @property {string} status - Result status (pass, fail, warning, error, skipped)
 * @property {string} message - Result message
 * @property {Object|null} details - Additional details
 * @property {string|null} recommendation - Fix recommendation
 * @property {boolean} healable - Whether issue can be auto-fixed
 * @property {number} healingTier - Healing tier (0=no healing, 1-3=auto-heal tiers)
 */

module.exports = {
  BaseCheck,
  CheckSeverity,
  CheckStatus,
  CheckDomain,
};
