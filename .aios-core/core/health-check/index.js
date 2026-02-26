/**
 * Health Check System - Main Entry Point (HCS-2)
 *
 * Provides comprehensive health checking capabilities for AIOS projects.
 * Supports 5 domains: Project Coherence, Local Environment, Repository Health,
 * Deployment Environment, and Service Integration.
 *
 * NOTE (INS-4.8): This is a SEPARATE system from `core/doctor/` (INS-4.1).
 * The primary diagnostic interface is `aios doctor` (bin/aios.js → core/doctor/).
 * The agent-facing task `*health-check` now delegates to `aios doctor --json`
 * and no longer calls this module. This module is preserved for potential
 * programmatic use but is NOT the primary health check mechanism.
 *
 * @module aios-core/health-check
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 * @see core/doctor/ for the primary diagnostic system (15 checks)
 */

const HealthCheckEngine = require('./engine');
const { BaseCheck, CheckSeverity, CheckStatus } = require('./base-check');
const CheckRegistry = require('./check-registry');
const HealerManager = require('./healers');
const ReporterManager = require('./reporters');

/**
 * Default configuration for health checks
 */
const DEFAULT_CONFIG = {
  mode: 'quick',
  domains: ['project', 'local', 'repository', 'deployment', 'services'],
  autoFix: true,
  autoFixTier: 1,
  parallel: true,
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
  },
  performance: {
    quickModeTimeout: 10000, // 10s
    fullModeTimeout: 60000, // 60s
  },
  output: {
    format: 'console',
    verbose: false,
    colors: true,
  },
};

/**
 * Main Health Check class
 *
 * Orchestrates health check execution, healing, and reporting.
 *
 * @class HealthCheck
 * @example
 * const healthCheck = new HealthCheck({ mode: 'full' });
 * const results = await healthCheck.run();
 * console.log(results.overall.score);
 */
class HealthCheck {
  /**
   * Create a new HealthCheck instance
   * @param {Object} config - Configuration options
   * @param {string} [config.mode='quick'] - Execution mode ('quick' or 'full')
   * @param {string[]} [config.domains] - Domains to check
   * @param {boolean} [config.autoFix=true] - Enable auto-fixing
   * @param {number} [config.autoFixTier=1] - Maximum tier for auto-fix (1-3)
   * @param {boolean} [config.parallel=true] - Run checks in parallel
   * @param {Object} [config.cache] - Cache configuration
   * @param {Object} [config.performance] - Performance settings
   * @param {Object} [config.output] - Output settings
   */
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.engine = new HealthCheckEngine(this.config);
    this.registry = new CheckRegistry();
    this.healers = new HealerManager(this.config);
    this.reporters = new ReporterManager(this.config);
    this.results = null;
    this.lastRun = null;
  }

  /**
   * Run health checks
   *
   * @param {Object} options - Run options (overrides config)
   * @param {string} [options.mode] - Execution mode
   * @param {string} [options.domain] - Specific domain to check ('all' for all domains)
   * @param {boolean} [options.autoFix] - Enable auto-fixing
   * @param {boolean} [options.verbose] - Enable verbose output
   * @returns {Promise<HealthCheckResults>} Health check results
   */
  async run(options = {}) {
    const runConfig = {
      ...this.config,
      ...options,
    };

    const startTime = Date.now();

    try {
      // Select checks based on mode and domain
      const selectedChecks = this.selectChecks(runConfig);

      // Run all checks
      const checkResults = await this.engine.runChecks(selectedChecks, runConfig);

      // Apply auto-fixes if enabled
      let healingResults = [];
      if (runConfig.autoFix) {
        healingResults = await this.healers.applyFixes(checkResults, runConfig.autoFixTier);
      }

      // Calculate scores
      const scores = this.calculateScores(checkResults);

      // Generate report
      const report = await this.reporters.generate(checkResults, scores, healingResults, runConfig);

      // Store results
      this.results = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        mode: runConfig.mode,
        duration: `${Date.now() - startTime}ms`,
        overall: scores.overall,
        domains: scores.domains,
        checks: checkResults,
        autoFixed: healingResults.filter((h) => h.success),
        techDebt: this.extractTechDebt(checkResults),
        report,
      };

      this.lastRun = Date.now();

      return this.results;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  /**
   * Select checks based on mode and domain
   * @private
   * @param {Object} config - Run configuration
   * @returns {BaseCheck[]} Selected checks
   */
  selectChecks(config) {
    const { mode, domain, domains } = config;

    // Get all registered checks
    let checks = this.registry.getAllChecks();

    // Filter by domain
    if (domain && domain !== 'all') {
      checks = checks.filter((c) => c.domain === domain);
    } else if (domains && domains.length > 0) {
      checks = checks.filter((c) => domains.includes(c.domain));
    }

    // Filter by mode
    if (mode === 'quick') {
      // Quick mode: only CRITICAL and HIGH severity
      checks = checks.filter(
        (c) => c.severity === CheckSeverity.CRITICAL || c.severity === CheckSeverity.HIGH,
      );
    }

    // Sort by priority (CRITICAL first)
    checks.sort((a, b) => {
      const priorityOrder = {
        [CheckSeverity.CRITICAL]: 0,
        [CheckSeverity.HIGH]: 1,
        [CheckSeverity.MEDIUM]: 2,
        [CheckSeverity.LOW]: 3,
        [CheckSeverity.INFO]: 4,
      };
      return priorityOrder[a.severity] - priorityOrder[b.severity];
    });

    return checks;
  }

  /**
   * Calculate health scores from check results
   * @private
   * @param {Object[]} checkResults - Array of check results
   * @returns {Object} Scores object with overall and per-domain scores
   */
  calculateScores(checkResults) {
    const weights = {
      [CheckSeverity.CRITICAL]: 25,
      [CheckSeverity.HIGH]: 15,
      [CheckSeverity.MEDIUM]: 7,
      [CheckSeverity.LOW]: 3,
      [CheckSeverity.INFO]: 0,
    };

    // Calculate overall score
    let maxPenalty = 0;
    let actualPenalty = 0;

    for (const result of checkResults) {
      const weight = weights[result.severity] || 0;
      maxPenalty += weight;

      if (result.status !== CheckStatus.PASS) {
        actualPenalty += weight;
      }
    }

    const overallScore =
      maxPenalty > 0 ? Math.round(100 - (actualPenalty / maxPenalty) * 100) : 100;

    // Calculate per-domain scores
    const domains = {};
    const domainResults = this.groupByDomain(checkResults);

    for (const [domain, results] of Object.entries(domainResults)) {
      let domainMaxPenalty = 0;
      let domainActualPenalty = 0;

      for (const result of results) {
        const weight = weights[result.severity] || 0;
        domainMaxPenalty += weight;

        if (result.status !== CheckStatus.PASS) {
          domainActualPenalty += weight;
        }
      }

      const domainScore =
        domainMaxPenalty > 0
          ? Math.round(100 - (domainActualPenalty / domainMaxPenalty) * 100)
          : 100;

      const passedCount = results.filter((r) => r.status === CheckStatus.PASS).length;
      const failedCount = results.filter(
        (r) => r.status === CheckStatus.FAIL || r.status === CheckStatus.ERROR,
      ).length;
      const warningCount = results.filter((r) => r.status === CheckStatus.WARNING).length;

      domains[domain] = {
        score: domainScore,
        status: this.scoreToStatus(domainScore),
        checks: results.map((r) => ({
          name: r.name,
          status: r.status,
          severity: r.severity,
          message: r.message,
        })),
        summary: {
          total: results.length,
          passed: passedCount,
          failed: failedCount,
          warnings: warningCount,
        },
      };
    }

    return {
      overall: {
        score: overallScore,
        status: this.scoreToStatus(overallScore),
        issuesCount: checkResults.filter((r) => r.status !== CheckStatus.PASS).length,
        autoFixedCount: 0, // Will be updated after healing
      },
      domains,
    };
  }

  /**
   * Convert score to status string
   * @private
   * @param {number} score - Score (0-100)
   * @returns {string} Status string
   */
  scoreToStatus(score) {
    if (score >= 90) return 'healthy';
    if (score >= 70) return 'degraded';
    if (score >= 50) return 'warning';
    return 'critical';
  }

  /**
   * Group check results by domain
   * @private
   * @param {Object[]} checkResults - Array of check results
   * @returns {Object} Results grouped by domain
   */
  groupByDomain(checkResults) {
    return checkResults.reduce((acc, result) => {
      const domain = result.domain || 'unknown';
      if (!acc[domain]) {
        acc[domain] = [];
      }
      acc[domain].push(result);
      return acc;
    }, {});
  }

  /**
   * Extract technical debt items from check results
   * @private
   * @param {Object[]} checkResults - Array of check results
   * @returns {Object[]} Technical debt items
   */
  extractTechDebt(checkResults) {
    return checkResults
      .filter(
        (r) =>
          r.status === CheckStatus.WARNING ||
          (r.severity === CheckSeverity.LOW && r.status !== CheckStatus.PASS),
      )
      .map((r) => ({
        id: r.checkId,
        name: r.name,
        domain: r.domain,
        severity: r.severity,
        description: r.message,
        recommendation: r.recommendation || 'Address when possible',
        firstDetected: new Date().toISOString(),
      }));
  }

  /**
   * Get available domains
   * @returns {string[]} Array of domain names
   */
  getDomains() {
    return ['project', 'local', 'repository', 'deployment', 'services'];
  }

  /**
   * Get check count by domain
   * @returns {Object} Object with domain -> count mapping
   */
  getCheckCounts() {
    const counts = {};
    for (const domain of this.getDomains()) {
      counts[domain] = this.registry.getChecksByDomain(domain).length;
    }
    return counts;
  }

  /**
   * Clear cached results
   */
  clearCache() {
    this.engine.clearCache();
    this.results = null;
  }

  /**
   * Get last run results
   * @returns {HealthCheckResults|null} Last run results or null
   */
  getLastResults() {
    return this.results;
  }
}

// Export main class and utilities
module.exports = {
  HealthCheck,
  HealthCheckEngine,
  BaseCheck,
  CheckSeverity,
  CheckStatus,
  CheckRegistry,
  HealerManager,
  ReporterManager,
  DEFAULT_CONFIG,
};
