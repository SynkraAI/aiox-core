/**
 * Markdown Reporter
 *
 * Generates Markdown-formatted health check reports.
 * Suitable for documentation, GitHub, and static site hosting.
 *
 * @module aios-core/health-check/reporters/markdown
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { CheckStatus, CheckSeverity } = require('../base-check');

/**
 * Status emojis for Markdown
 */
const statusEmoji = {
  pass: '✅',
  fail: '❌',
  warning: '⚠️',
  error: '🔴',
  skipped: '⏭️',
};

/**
 * Severity badges
 */
const severityBadge = {
  CRITICAL: '🔴 CRITICAL',
  HIGH: '🟠 HIGH',
  MEDIUM: '🟡 MEDIUM',
  LOW: '🔵 LOW',
  INFO: 'ℹ️ INFO',
};

/**
 * Health status badges
 */
const healthBadge = {
  healthy: '🟢 Healthy',
  degraded: '🟡 Degraded',
  warning: '🟠 Warning',
  critical: '🔴 Critical',
};

/**
 * Markdown Reporter
 *
 * @class MarkdownReporter
 */
class MarkdownReporter {
  /**
   * Create a new MarkdownReporter
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.verbose = config.output?.verbose || false;
  }

  /**
   * Generate Markdown report
   * @param {Object} data - Report data
   * @returns {string} Markdown content
   */
  async generate(data) {
    const { checkResults, scores, healingResults, config, timestamp } = data;
    const sections = [];

    // Header
    sections.push(this.generateHeader(timestamp, config));

    // Summary section
    sections.push(this.generateSummary(scores, checkResults));

    // Domain breakdown
    sections.push(this.generateDomainBreakdown(scores));

    // Issues section
    const issues = checkResults.filter(
      (r) =>
        r.status === CheckStatus.FAIL ||
        r.status === CheckStatus.WARNING ||
        r.status === CheckStatus.ERROR,
    );

    if (issues.length > 0) {
      sections.push(this.generateIssuesSection(issues));
    }

    // Auto-fixed section
    if (healingResults && healingResults.length > 0) {
      const fixed = healingResults.filter((h) => h.success);
      if (fixed.length > 0) {
        sections.push(this.generateAutoFixedSection(fixed));
      }
    }

    // Tech debt section
    const techDebt = this.extractTechDebt(checkResults);
    if (techDebt.length > 0) {
      sections.push(this.generateTechDebtSection(techDebt));
    }

    // All checks (verbose mode)
    if (this.verbose) {
      sections.push(this.generateAllChecksSection(checkResults));
    }

    // Footer
    sections.push(this.generateFooter(config));

    return sections.join('\n\n');
  }

  /**
   * Generate header section
   * @private
   */
  generateHeader(timestamp, config) {
    const date = new Date(timestamp).toLocaleDateString();
    const time = new Date(timestamp).toLocaleTimeString();
    const mode = config?.mode || 'quick';

    return `# AIOS Health Check Report

**Generated:** ${date} at ${time}
**Mode:** ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
  }

  /**
   * Generate summary section
   * @private
   */
  generateSummary(scores, checkResults) {
    const { score, status, issuesCount } = scores.overall;
    const totalChecks = checkResults.length;
    const passedChecks = checkResults.filter((r) => r.status === CheckStatus.PASS).length;

    return `## Overall Health

| Metric | Value |
|--------|-------|
| **Health Score** | ${score}/100 ${healthBadge[status]} |
| **Checks Passed** | ${passedChecks}/${totalChecks} |
| **Issues Found** | ${issuesCount} |`;
  }

  /**
   * Generate domain breakdown section
   * @private
   */
  generateDomainBreakdown(scores) {
    const lines = [
      '## Domain Breakdown',
      '',
      '| Domain | Score | Status | Checks |',
      '|--------|-------|--------|--------|',
    ];

    for (const [domain, domainScore] of Object.entries(scores.domains)) {
      const domainName = domain.charAt(0).toUpperCase() + domain.slice(1);
      const { score, status, summary } = domainScore;
      const badge = healthBadge[status] || status;
      const checks = `${summary.passed}/${summary.total}`;

      lines.push(`| ${domainName} | ${score}% | ${badge} | ${checks} |`);
    }

    return lines.join('\n');
  }

  /**
   * Generate issues section
   * @private
   */
  generateIssuesSection(issues) {
    const lines = ['## Issues Found', ''];

    // Group by severity
    const bySeverity = this.groupBySeverity(issues);

    for (const severity of [
      CheckSeverity.CRITICAL,
      CheckSeverity.HIGH,
      CheckSeverity.MEDIUM,
      CheckSeverity.LOW,
    ]) {
      const severityIssues = bySeverity[severity];
      if (!severityIssues || severityIssues.length === 0) continue;

      lines.push(`### ${severityBadge[severity]}`, '');

      for (const issue of severityIssues) {
        const emoji = statusEmoji[issue.status] || '•';
        lines.push(`- ${emoji} **${issue.name}**`);
        lines.push(`  - ${issue.message}`);
        if (issue.recommendation) {
          lines.push(`  - 💡 *${issue.recommendation}*`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate auto-fixed section
   * @private
   */
  generateAutoFixedSection(fixed) {
    const lines = [
      '## Auto-Fixed Issues',
      '',
      '| Check | Action | Result |',
      '|-------|--------|--------|',
    ];

    for (const fix of fixed) {
      lines.push(`| ${fix.checkId} | ${fix.action} | ✅ ${fix.message} |`);
    }

    return lines.join('\n');
  }

  /**
   * Generate tech debt section
   * @private
   */
  generateTechDebtSection(techDebt) {
    const lines = [
      '## Technical Debt',
      '',
      '> These items are not critical but should be addressed when possible.',
      '',
      '| Item | Domain | Severity | Description |',
      '|------|--------|----------|-------------|',
    ];

    for (const item of techDebt) {
      lines.push(`| ${item.name} | ${item.domain} | ${item.severity} | ${item.description} |`);
    }

    return lines.join('\n');
  }

  /**
   * Generate all checks section (verbose)
   * @private
   */
  generateAllChecksSection(checkResults) {
    const lines = [
      '## All Checks',
      '',
      '<details>',
      '<summary>Click to expand full check list</summary>',
      '',
      '| Check | Domain | Severity | Status | Duration |',
      '|-------|--------|----------|--------|----------|',
    ];

    for (const result of checkResults) {
      const emoji = statusEmoji[result.status] || '•';
      const duration = result.duration ? `${result.duration}ms` : '-';
      lines.push(
        `| ${result.name} | ${result.domain} | ${result.severity} | ${emoji} ${result.status} | ${duration} |`,
      );
    }

    lines.push('', '</details>');

    return lines.join('\n');
  }

  /**
   * Generate footer section
   * @private
   */
  generateFooter(_config) {
    return `---

*Report generated by AIOS Health Check System v1.0.0*

> Run \`*health-check --mode=full\` for a comprehensive analysis.`;
  }

  /**
   * Group issues by severity
   * @private
   */
  groupBySeverity(issues) {
    return issues.reduce((acc, issue) => {
      const severity = issue.severity || 'MEDIUM';
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(issue);
      return acc;
    }, {});
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
        name: r.name,
        domain: r.domain,
        severity: r.severity,
        description: r.message,
      }));
  }
}

module.exports = MarkdownReporter;
