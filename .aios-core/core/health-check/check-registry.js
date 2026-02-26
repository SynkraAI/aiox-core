/**
 * Check Registry
 *
 * Central registry for all health checks. Manages check registration,
 * lookup, and categorization by domain and severity.
 *
 * @module aios-core/health-check/check-registry
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { BaseCheck, CheckSeverity, CheckDomain } = require('./base-check');

/**
 * Registry for health checks
 *
 * @class CheckRegistry
 * @example
 * const registry = new CheckRegistry();
 * registry.register(new PackageJsonCheck());
 * const checks = registry.getChecksByDomain('project');
 */
class CheckRegistry {
  constructor() {
    this.checks = new Map();
    this.byDomain = new Map();
    this.bySeverity = new Map();

    // Initialize domain and severity maps
    for (const domain of Object.values(CheckDomain)) {
      this.byDomain.set(domain, []);
    }

    for (const severity of Object.values(CheckSeverity)) {
      this.bySeverity.set(severity, []);
    }

    // Auto-register built-in checks
    this.registerBuiltInChecks();
  }

  /**
   * Register a check
   * @param {BaseCheck} check - Check instance to register
   * @throws {Error} If check is invalid or already registered
   */
  register(check) {
    if (!(check instanceof BaseCheck)) {
      throw new Error('Check must be an instance of BaseCheck');
    }

    if (this.checks.has(check.id)) {
      throw new Error(`Check with id '${check.id}' is already registered`);
    }

    // Add to main registry
    this.checks.set(check.id, check);

    // Add to domain index
    const domainChecks = this.byDomain.get(check.domain) || [];
    domainChecks.push(check);
    this.byDomain.set(check.domain, domainChecks);

    // Add to severity index
    const severityChecks = this.bySeverity.get(check.severity) || [];
    severityChecks.push(check);
    this.bySeverity.set(check.severity, severityChecks);
  }

  /**
   * Unregister a check
   * @param {string} checkId - Check ID to unregister
   * @returns {boolean} True if check was removed
   */
  unregister(checkId) {
    const check = this.checks.get(checkId);
    if (!check) return false;

    // Remove from main registry
    this.checks.delete(checkId);

    // Remove from domain index
    const domainChecks = this.byDomain.get(check.domain) || [];
    const domainIndex = domainChecks.findIndex((c) => c.id === checkId);
    if (domainIndex !== -1) {
      domainChecks.splice(domainIndex, 1);
    }

    // Remove from severity index
    const severityChecks = this.bySeverity.get(check.severity) || [];
    const severityIndex = severityChecks.findIndex((c) => c.id === checkId);
    if (severityIndex !== -1) {
      severityChecks.splice(severityIndex, 1);
    }

    return true;
  }

  /**
   * Get a check by ID
   * @param {string} checkId - Check ID
   * @returns {BaseCheck|undefined} Check instance or undefined
   */
  getCheck(checkId) {
    return this.checks.get(checkId);
  }

  /**
   * Get all registered checks
   * @returns {BaseCheck[]} Array of all checks
   */
  getAllChecks() {
    return Array.from(this.checks.values());
  }

  /**
   * Get checks by domain
   * @param {string} domain - Domain name
   * @returns {BaseCheck[]} Array of checks in domain
   */
  getChecksByDomain(domain) {
    return this.byDomain.get(domain) || [];
  }

  /**
   * Get checks by severity
   * @param {string} severity - Severity level
   * @returns {BaseCheck[]} Array of checks with severity
   */
  getChecksBySeverity(severity) {
    return this.bySeverity.get(severity) || [];
  }

  /**
   * Get checks by tag
   * @param {string} tag - Tag to filter by
   * @returns {BaseCheck[]} Array of checks with tag
   */
  getChecksByTag(tag) {
    return this.getAllChecks().filter((check) => check.tags && check.tags.includes(tag));
  }

  /**
   * Get checks that support healing
   * @param {number} [maxTier] - Maximum healing tier (1-3)
   * @returns {BaseCheck[]} Array of healable checks
   */
  getHealableChecks(maxTier = 3) {
    return this.getAllChecks().filter(
      (check) => check.healingTier > 0 && check.healingTier <= maxTier,
    );
  }

  /**
   * Get registry statistics
   * @returns {Object} Registry stats
   */
  getStats() {
    const stats = {
      total: this.checks.size,
      byDomain: {},
      bySeverity: {},
      healable: 0,
    };

    for (const [domain, checks] of this.byDomain.entries()) {
      stats.byDomain[domain] = checks.length;
    }

    for (const [severity, checks] of this.bySeverity.entries()) {
      stats.bySeverity[severity] = checks.length;
    }

    stats.healable = this.getAllChecks().filter((c) => c.healingTier > 0).length;

    return stats;
  }

  /**
   * Clear all registered checks
   */
  clear() {
    this.checks.clear();

    for (const domain of this.byDomain.keys()) {
      this.byDomain.set(domain, []);
    }

    for (const severity of this.bySeverity.keys()) {
      this.bySeverity.set(severity, []);
    }
  }

  /**
   * Register built-in checks
   * @private
   */
  registerBuiltInChecks() {
    // Import and register all built-in checks
    // This will be populated as checks are implemented
    try {
      // Project domain checks
      const projectChecks = require('./checks/project');
      for (const Check of Object.values(projectChecks)) {
        if (typeof Check === 'function' && Check.prototype instanceof BaseCheck) {
          this.register(new Check());
        }
      }

      // Local environment checks
      const localChecks = require('./checks/local');
      for (const Check of Object.values(localChecks)) {
        if (typeof Check === 'function' && Check.prototype instanceof BaseCheck) {
          this.register(new Check());
        }
      }

      // Repository checks
      const repositoryChecks = require('./checks/repository');
      for (const Check of Object.values(repositoryChecks)) {
        if (typeof Check === 'function' && Check.prototype instanceof BaseCheck) {
          this.register(new Check());
        }
      }

      // Deployment checks
      const deploymentChecks = require('./checks/deployment');
      for (const Check of Object.values(deploymentChecks)) {
        if (typeof Check === 'function' && Check.prototype instanceof BaseCheck) {
          this.register(new Check());
        }
      }

      // Services checks
      const servicesChecks = require('./checks/services');
      for (const Check of Object.values(servicesChecks)) {
        if (typeof Check === 'function' && Check.prototype instanceof BaseCheck) {
          this.register(new Check());
        }
      }
    } catch (error) {
      // Built-in checks may not be available yet during initial setup
      // This is expected and will be populated as checks are implemented
      if (process.env.AIOS_DEBUG) {
        console.warn('Some built-in checks could not be loaded:', error.message);
      }
    }
  }
}

module.exports = CheckRegistry;
