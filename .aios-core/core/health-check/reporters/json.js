/**
 * JSON Reporter
 *
 * Generates JSON-formatted health check reports.
 * Suitable for CI/CD integration, dashboards, and programmatic consumption.
 *
 * @module aios-core/health-check/reporters/json
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { CheckStatus, CheckSeverity } = require('../base-check');

/**
 * Sensitive patterns to redact from output
 */
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /api[_-]?secret/i,
  /password/i,
  /secret/i,
  /token/i,
  /credential/i,
  /private[_-]?key/i,
  /auth/i,
];

/**
 * JSON Reporter
 *
 * @class JSONReporter
 */
class JSONReporter {
  /**
   * Create a new JSONReporter
   * @param {Object} config - Configuration
   * @param {boolean} [config.output.pretty=true] - Pretty print JSON
   * @param {boolean} [config.output.sanitize=true] - Sanitize secrets
   */
  constructor(config = {}) {
    this.config = config;
    this.pretty = config.output?.pretty !== false;
    this.sanitize = config.output?.sanitize !== false;
  }

  /**
   * Generate JSON report
   * @param {Object} data - Report data
   * @returns {string} JSON string
   */
  async generate(data) {
    const { checkResults, scores, healingResults, config, timestamp } = data;

    // Build report object
    const report = {
      $schema: 'https://aios.synkra.ai/schemas/health-check-report.json',
      version: '1.0.0',
      timestamp,
      mode: config?.mode || 'quick',
      duration: this.calculateDuration(checkResults),

      // Overall summary
      overall: {
        score: scores.overall.score,
        status: scores.overall.status,
        issuesCount: scores.overall.issuesCount,
        autoFixedCount: healingResults?.filter((h) => h.success).length || 0,
      },

      // Domain scores
      domains: this.formatDomainScores(scores.domains),

      // Issues grouped by severity
      issues: this.formatIssues(checkResults),

      // Auto-fixed items
      autoFixed: this.formatAutoFixed(healingResults),

      // Technical debt
      techDebt: this.extractTechDebt(checkResults),

      // Historical data (placeholder for future)
      history: {
        trend: [],
        previousScore: null,
        scoreDelta: null,
      },

      // All check results (sanitized)
      checks: this.formatChecks(checkResults),
    };

    // Sanitize sensitive data
    if (this.sanitize) {
      this.sanitizeObject(report);
    }

    // Return formatted JSON
    if (this.pretty) {
      return JSON.stringify(report, null, 2);
    }
    return JSON.stringify(report);
  }

  /**
   * Calculate total duration
   * @private
   */
  calculateDuration(checkResults) {
    const totalMs = checkResults.reduce((sum, r) => sum + (r.duration || 0), 0);
    if (totalMs < 1000) return `${totalMs}ms`;
    return `${(totalMs / 1000).toFixed(1)}s`;
  }

  /**
   * Format domain scores
   * @private
   */
  formatDomainScores(domains) {
    const formatted = {};

    for (const [domain, data] of Object.entries(domains)) {
      formatted[domain] = {
        score: data.score,
        status: data.status,
        summary: data.summary,
        checks: data.checks.map((c) => ({
          name: c.name,
          status: c.status,
          severity: c.severity,
        })),
      };
    }

    return formatted;
  }

  /**
   * Format issues grouped by severity
   * @private
   */
  formatIssues(checkResults) {
    const issues = checkResults.filter(
      (r) =>
        r.status === CheckStatus.FAIL ||
        r.status === CheckStatus.WARNING ||
        r.status === CheckStatus.ERROR,
    );

    const grouped = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };

    for (const issue of issues) {
      const group = issue.severity.toLowerCase();
      if (grouped[group]) {
        grouped[group].push({
          id: issue.checkId,
          name: issue.name,
          domain: issue.domain,
          status: issue.status,
          message: issue.message,
          recommendation: issue.recommendation,
          healable: issue.healable,
          healingTier: issue.healingTier,
        });
      }
    }

    return grouped;
  }

  /**
   * Format auto-fixed items
   * @private
   */
  formatAutoFixed(healingResults) {
    if (!healingResults) return [];

    return healingResults
      .filter((h) => h.success)
      .map((h) => ({
        checkId: h.checkId,
        tier: h.tier,
        action: h.action,
        message: h.message,
        backupPath: h.backupPath || null,
      }));
  }

  /**
   * Extract tech debt items
   * @private
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
        recommendation: r.recommendation,
        firstDetected: new Date().toISOString(),
      }));
  }

  /**
   * Format all checks
   * @private
   */
  formatChecks(checkResults) {
    return checkResults.map((r) => ({
      id: r.checkId,
      name: r.name,
      domain: r.domain,
      severity: r.severity,
      status: r.status,
      message: r.message,
      recommendation: r.recommendation,
      duration: r.duration,
      timestamp: r.timestamp,
      fromCache: r.fromCache || false,
      healable: r.healable,
      healingTier: r.healingTier,
      // Sanitize details
      details: this.sanitize ? this.sanitizeDetails(r.details) : r.details,
    }));
  }

  /**
   * Sanitize an object by redacting sensitive values
   * @private
   */
  sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      // Check if key matches sensitive pattern
      if (this.isSensitiveKey(key)) {
        obj[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        this.sanitizeObject(value);
      } else if (typeof value === 'string') {
        obj[key] = this.sanitizeString(value);
      }
    }
  }

  /**
   * Sanitize details object
   * @private
   */
  sanitizeDetails(details) {
    if (!details) return null;

    const sanitized = { ...details };
    this.sanitizeObject(sanitized);
    return sanitized;
  }

  /**
   * Check if a key is sensitive
   * @private
   */
  isSensitiveKey(key) {
    return SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
  }

  /**
   * Sanitize a string value
   * @private
   */
  sanitizeString(value) {
    // Redact values that look like tokens/keys
    if (/^(sk-|pk-|api_|key_)/i.test(value)) {
      return '[REDACTED]';
    }
    // Redact long hex strings (likely tokens)
    if (/^[a-f0-9]{32,}$/i.test(value)) {
      return '[REDACTED]';
    }
    // Redact base64 encoded strings longer than 50 chars
    if (/^[A-Za-z0-9+/=]{50,}$/.test(value)) {
      return '[REDACTED]';
    }
    return value;
  }
}

module.exports = JSONReporter;
