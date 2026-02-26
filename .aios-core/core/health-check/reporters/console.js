/**
 * Console Reporter
 *
 * Generates formatted console output for health check results.
 * Supports colors and various verbosity levels.
 *
 * @module aios-core/health-check/reporters/console
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { CheckStatus, CheckSeverity } = require('../base-check');

/**
 * ANSI color codes
 */
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // Status colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

/**
 * Status icons
 */
const icons = {
  pass: '✓',
  fail: '✗',
  warning: '⚠',
  error: '⊘',
  skipped: '○',
  info: 'ℹ',
};

/**
 * Console Reporter
 *
 * @class ConsoleReporter
 */
class ConsoleReporter {
  /**
   * Create a new ConsoleReporter
   * @param {Object} config - Configuration
   * @param {boolean} [config.output.colors=true] - Use colors
   * @param {boolean} [config.output.verbose=false] - Verbose output
   */
  constructor(config = {}) {
    this.useColors = config.output?.colors !== false;
    this.verbose = config.output?.verbose || false;
  }

  /**
   * Generate console report
   * @param {Object} data - Report data
   * @returns {string} Formatted console output
   */
  async generate(data) {
    const { checkResults, scores, healingResults, config: _config } = data;
    const lines = [];

    // Header
    lines.push('');
    lines.push(this.formatHeader('AIOS Health Check Report'));
    lines.push(this.formatDivider());

    // Overall summary
    lines.push(this.formatOverallSummary(scores.overall));
    lines.push('');

    // Domain summaries
    lines.push(this.formatHeader('Domain Summary', 2));
    for (const [domain, domainScore] of Object.entries(scores.domains)) {
      lines.push(this.formatDomainSummary(domain, domainScore));
    }
    lines.push('');

    // Issues (failures and warnings)
    const issues = checkResults.filter(
      (r) =>
        r.status === CheckStatus.FAIL ||
        r.status === CheckStatus.WARNING ||
        r.status === CheckStatus.ERROR,
    );

    if (issues.length > 0) {
      lines.push(this.formatHeader('Issues Found', 2));
      for (const issue of issues) {
        lines.push(this.formatIssue(issue));
      }
      lines.push('');
    }

    // Auto-fixed items
    if (healingResults && healingResults.length > 0) {
      const fixed = healingResults.filter((h) => h.success);
      if (fixed.length > 0) {
        lines.push(this.formatHeader('Auto-Fixed', 2));
        for (const fix of fixed) {
          lines.push(this.formatFix(fix));
        }
        lines.push('');
      }
    }

    // Verbose: show all checks
    if (this.verbose) {
      lines.push(this.formatHeader('All Checks', 2));
      for (const result of checkResults) {
        lines.push(this.formatCheckResult(result));
      }
      lines.push('');
    }

    // Footer
    lines.push(this.formatDivider());
    lines.push(this.formatFooter(data));

    return lines.join('\n');
  }

  /**
   * Format header text
   * @private
   */
  formatHeader(text, level = 1) {
    if (level === 1) {
      return this.color(`${colors.bold}${colors.cyan}`, `═══ ${text} ═══`);
    }
    return this.color(`${colors.bold}${colors.white}`, `── ${text} ──`);
  }

  /**
   * Format divider line
   * @private
   */
  formatDivider() {
    return this.color(colors.dim, '─'.repeat(50));
  }

  /**
   * Format overall summary
   * @private
   */
  formatOverallSummary(overall) {
    const { score, status, issuesCount } = overall;

    const scoreColor = this.getScoreColor(score);
    const statusIcon = this.getStatusIcon(status);

    const lines = [
      '',
      this.color(`${colors.bold}`, 'Overall Health: ') +
        this.color(scoreColor, `${score}/100 ${statusIcon}`),
      '',
      this.color(colors.dim, `Status: ${status.toUpperCase()}`),
      this.color(colors.dim, `Issues: ${issuesCount}`),
    ];

    return lines.join('\n');
  }

  /**
   * Format domain summary
   * @private
   */
  formatDomainSummary(domain, domainScore) {
    const { score, status, summary } = domainScore;
    const scoreColor = this.getScoreColor(score);
    const icon = this.getStatusIcon(status);

    const domainName = domain.charAt(0).toUpperCase() + domain.slice(1);
    const stats = `(${summary.passed}/${summary.total} passed)`;

    return (
      `  ${icon} ${this.color(colors.bold, domainName.padEnd(15))} ` +
      `${this.color(scoreColor, String(score).padStart(3))}% ` +
      `${this.color(colors.dim, stats)}`
    );
  }

  /**
   * Format an issue
   * @private
   */
  formatIssue(issue) {
    const icon = this.getCheckIcon(issue.status);
    const severityColor = this.getSeverityColor(issue.severity);

    const lines = [
      `  ${icon} ${this.color(severityColor, `[${issue.severity}]`)} ${issue.name}`,
      `     ${this.color(colors.dim, issue.message)}`,
    ];

    if (issue.recommendation) {
      lines.push(`     ${this.color(colors.cyan, '→ ' + issue.recommendation)}`);
    }

    return lines.join('\n');
  }

  /**
   * Format a fix
   * @private
   */
  formatFix(fix) {
    const icon = this.color(colors.green, icons.pass);
    return `  ${icon} ${fix.checkId}: ${this.color(colors.green, fix.message)}`;
  }

  /**
   * Format a check result
   * @private
   */
  formatCheckResult(result) {
    const icon = this.getCheckIcon(result.status);
    const duration = result.duration ? `${result.duration}ms` : '';

    return `  ${icon} ${result.name.padEnd(35)} ${this.color(colors.dim, duration)}`;
  }

  /**
   * Format footer
   * @private
   */
  formatFooter(data) {
    const { timestamp, config } = data;
    const mode = config?.mode || 'quick';
    const time = new Date(timestamp).toLocaleTimeString();

    return this.color(colors.dim, `Mode: ${mode} | Time: ${time}`);
  }

  /**
   * Get color for score
   * @private
   */
  getScoreColor(score) {
    if (score >= 90) return colors.green;
    if (score >= 70) return colors.yellow;
    if (score >= 50) return colors.yellow;
    return colors.red;
  }

  /**
   * Get status icon
   * @private
   */
  getStatusIcon(status) {
    switch (status) {
      case 'healthy':
        return this.color(colors.green, '●');
      case 'degraded':
        return this.color(colors.yellow, '●');
      case 'warning':
        return this.color(colors.yellow, '●');
      case 'critical':
        return this.color(colors.red, '●');
      default:
        return '○';
    }
  }

  /**
   * Get check icon
   * @private
   */
  getCheckIcon(status) {
    switch (status) {
      case CheckStatus.PASS:
        return this.color(colors.green, icons.pass);
      case CheckStatus.FAIL:
        return this.color(colors.red, icons.fail);
      case CheckStatus.WARNING:
        return this.color(colors.yellow, icons.warning);
      case CheckStatus.ERROR:
        return this.color(colors.red, icons.error);
      case CheckStatus.SKIPPED:
        return this.color(colors.dim, icons.skipped);
      default:
        return icons.info;
    }
  }

  /**
   * Get severity color
   * @private
   */
  getSeverityColor(severity) {
    switch (severity) {
      case CheckSeverity.CRITICAL:
        return colors.red;
      case CheckSeverity.HIGH:
        return colors.red;
      case CheckSeverity.MEDIUM:
        return colors.yellow;
      case CheckSeverity.LOW:
        return colors.cyan;
      case CheckSeverity.INFO:
        return colors.dim;
      default:
        return colors.white;
    }
  }

  /**
   * Apply color if colors are enabled
   * @private
   */
  color(colorCode, text) {
    if (!this.useColors) return text;
    return `${colorCode}${text}${colors.reset}`;
  }
}

module.exports = ConsoleReporter;
