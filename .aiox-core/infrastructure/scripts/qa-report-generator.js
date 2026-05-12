#!/usr/bin/env node

/**
 * AIOX QA Report Generator
 *
 * Story: 6.2 - QA Report Generator
 * Epic: Epic 6 - QA Evolution
 *
 * Generates comprehensive QA reports with structured issue tracking,
 * test results, and recommendations for story validation.
 *
 * Features:
 * - AC1: Template for qa_report.md created
 * - AC2: Sections: Summary, Test Results, Issues Found, Regression, Security
 * - AC3: Issues categorized: Critical (blocks), Major (important), Minor (nice-to-fix)
 * - AC4: Recommendation: APPROVE or REJECT with justification
 * - AC5: Locations specific for each issue (file:line)
 * - AC6: Schema JSON for parsing automatizado
 * - AC7: Integrates with dashboard status.json
 *
 * @author @qa (Quinn)
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // AC7: Dashboard integration paths
  dashboardStatusPath: '.aiox/dashboard/status.json',
  legacyStatusPath: '.aiox/status.json',
  // Template path
  templatePath: '.aiox-core/product/templates/qa-report-tmpl.md',
  // Default output filename
  defaultOutputFile: 'qa_report.md',
  // Version
  version: '1.0.0',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Issue severity levels (AC3)
 */
const Severity = {
  CRITICAL: 'critical', // Blocks release
  MAJOR: 'major', // Important to fix
  MINOR: 'minor', // Nice to fix
};

/**
 * Issue categories
 */
const Category = {
  FUNCTIONAL: 'functional',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  USABILITY: 'usability',
  ACCESSIBILITY: 'accessibility',
  REGRESSION: 'regression',
  COMPATIBILITY: 'compatibility',
  DOCUMENTATION: 'documentation',
};

/**
 * Verdict types (AC4)
 */
const Verdict = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
};

/**
 * Build status types
 */
const BuildStatus = {
  PASSING: 'passing',
  FAILING: 'failing',
  UNKNOWN: 'unknown',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              QA REPORT GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class QAReportGenerator {
  /**
   * Create a new QAReportGenerator instance
   *
   * @param {string} storyId - Story ID (e.g., 'STORY-6.2')
   * @param {Object} [options] - Configuration options
   * @param {string} [options.rootPath] - Project root path (defaults to cwd)
   * @param {string} [options.agentName] - QA agent name
   * @param {Object} [options.testResults] - Pre-loaded test results
   */
  constructor(storyId, options = {}) {
    this.storyId = storyId;
    this.rootPath = options.rootPath || process.cwd();
    this.agentName = options.agentName || 'Quinn (QA Guardian)';

    // Initialize report data
    this.data = {
      storyId,
      generatedAt: new Date().toISOString(),
      agentName: this.agentName,
      verdict: null,
      verdictReason: '',
      totalIssues: 0,
      issuesBySeverity: {
        critical: 0,
        major: 0,
        minor: 0,
      },
      coverage: 0,
      buildStatus: BuildStatus.UNKNOWN,
      tests: {
        unit: { total: 0, pass: 0, fail: 0, skip: 0 },
        integration: { total: 0, pass: 0, fail: 0, skip: 0 },
        e2e: { total: 0, pass: 0, fail: 0, skip: 0 },
      },
      issues: {
        critical: [],
        major: [],
        minor: [],
      },
      regression: {
        detected: false,
        items: [],
      },
      security: {
        vulnerabilities: [],
        score: 100,
      },
      requiredActions: [],
      suggestions: [],
    };

    // Load test results if provided
    if (options.testResults) {
      this.loadTestResults(options.testResults);
    }
  }

  /**
   * Load test results from object or file
   *
   * @param {Object|string} source - Test results object or path to JSON file
   * @returns {QAReportGenerator} this instance for chaining
   */
  loadTestResults(source) {
    let results;

    if (typeof source === 'string') {
      // Load from file
      const filePath = path.isAbsolute(source) ? source : path.join(this.rootPath, source);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Test results file not found: ${filePath}`);
      }

      results = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } else {
      results = source;
    }

    // Map test results to report structure
    if (results.unit) {
      this.data.tests.unit = {
        total: results.unit.total || 0,
        pass: results.unit.pass || results.unit.passed || 0,
        fail: results.unit.fail || results.unit.failed || 0,
        skip: results.unit.skip || results.unit.skipped || 0,
      };
    }

    if (results.integration) {
      this.data.tests.integration = {
        total: results.integration.total || 0,
        pass: results.integration.pass || results.integration.passed || 0,
        fail: results.integration.fail || results.integration.failed || 0,
        skip: results.integration.skip || results.integration.skipped || 0,
      };
    }

    if (results.e2e) {
      this.data.tests.e2e = {
        total: results.e2e.total || 0,
        pass: results.e2e.pass || results.e2e.passed || 0,
        fail: results.e2e.fail || results.e2e.failed || 0,
        skip: results.e2e.skip || results.e2e.skipped || 0,
      };
    }

    // Coverage
    if (results.coverage !== undefined) {
      this.data.coverage = results.coverage;
    }

    // Build status
    if (results.buildStatus) {
      this.data.buildStatus = results.buildStatus;
    } else {
      // Infer from test results
      const totalFail =
        this.data.tests.unit.fail + this.data.tests.integration.fail + this.data.tests.e2e.fail;
      this.data.buildStatus = totalFail > 0 ? BuildStatus.FAILING : BuildStatus.PASSING;
    }

    return this;
  }

  /**
   * Add an issue to the report (AC3, AC5)
   *
   * @param {Object} issue - Issue details
   * @param {string} issue.id - Unique issue ID
   * @param {string} issue.title - Issue title
   * @param {string} issue.severity - Severity level (critical, major, minor)
   * @param {string} issue.location - File location (file:line format)
   * @param {string} issue.category - Issue category
   * @param {string} issue.description - Detailed description
   * @param {string} [issue.expected] - Expected behavior
   * @param {string} [issue.actual] - Actual behavior
   * @param {string[]} [issue.verification] - Verification steps
   * @returns {QAReportGenerator} this instance for chaining
   */
  addIssue(issue) {
    const severity = issue.severity?.toLowerCase() || Severity.MINOR;

    if (!Object.values(Severity).includes(severity)) {
      throw new Error(
        `Invalid severity: ${severity}. Must be one of: ${Object.values(Severity).join(', ')}`
      );
    }

    const normalizedIssue = {
      id: issue.id || `ISSUE-${this.data.totalIssues + 1}`,
      title: issue.title || 'Untitled Issue',
      severity,
      location: issue.location || 'unknown',
      category: issue.category || Category.FUNCTIONAL,
      description: issue.description || '',
      expected: issue.expected || '',
      actual: issue.actual || '',
      verification: issue.verification || [],
    };

    this.data.issues[severity].push(normalizedIssue);
    this.data.issuesBySeverity[severity]++;
    this.data.totalIssues++;

    return this;
  }

  /**
   * Add multiple issues at once
   *
   * @param {Object[]} issues - Array of issue objects
   * @returns {QAReportGenerator} this instance for chaining
   */
  addIssues(issues) {
    for (const issue of issues) {
      this.addIssue(issue);
    }
    return this;
  }

  /**
   * Categorize issues based on predefined rules (AC3)
   *
   * @param {Object[]} rawIssues - Raw issues without severity
   * @returns {QAReportGenerator} this instance for chaining
   */
  categorizeIssues(rawIssues) {
    for (const issue of rawIssues) {
      // Auto-categorize based on keywords if no severity provided
      if (!issue.severity) {
        issue.severity = this._inferSeverity(issue);
      }
      this.addIssue(issue);
    }
    return this;
  }

  /**
   * Infer severity from issue content
   * @private
   */
  _inferSeverity(issue) {
    const text = `${issue.title} ${issue.description}`.toLowerCase();

    // Critical patterns
    const criticalPatterns = [
      'crash',
      'data loss',
      'security',
      'vulnerability',
      'broken',
      'fails',
      'exception',
      'error',
      'critical',
      'blocking',
      'blocker',
    ];

    // Major patterns
    const majorPatterns = [
      'incorrect',
      'wrong',
      'bug',
      'defect',
      'issue',
      'problem',
      'unexpected',
      'missing',
      'incomplete',
    ];

    for (const pattern of criticalPatterns) {
      if (text.includes(pattern)) {
        return Severity.CRITICAL;
      }
    }

    for (const pattern of majorPatterns) {
      if (text.includes(pattern)) {
        return Severity.MAJOR;
      }
    }

    return Severity.MINOR;
  }

  /**
   * Add regression item
   *
   * @param {Object} regression - Regression details
   * @param {string} regression.file - Affected file
   * @param {string} regression.description - What regressed
   * @param {string} regression.commit - Commit that introduced it
   * @returns {QAReportGenerator} this instance for chaining
   */
  addRegression(regression) {
    this.data.regression.detected = true;
    this.data.regression.items.push({
      file: regression.file,
      description: regression.description,
      commit: regression.commit || 'unknown',
    });
    return this;
  }

  /**
   * Add security vulnerability
   *
   * @param {Object} vulnerability - Vulnerability details
   * @returns {QAReportGenerator} this instance for chaining
   */
  addSecurityVulnerability(vulnerability) {
    this.data.security.vulnerabilities.push({
      severity: vulnerability.severity || 'medium',
      type: vulnerability.type || 'unknown',
      location: vulnerability.location || 'unknown',
      description: vulnerability.description || '',
    });

    // Reduce security score based on severity
    const severityScores = { critical: 30, high: 20, medium: 10, low: 5 };
    const deduction = severityScores[vulnerability.severity?.toLowerCase()] || 10;
    this.data.security.score = Math.max(0, this.data.security.score - deduction);

    return this;
  }

  /**
   * Calculate verdict based on issues (AC4)
   *
   * @returns {string} APPROVE or REJECT
   */
  calculateVerdict() {
    // Reject if any critical issues
    if (this.data.issuesBySeverity.critical > 0) {
      this.data.verdict = Verdict.REJECT;
      this.data.verdictReason = `${this.data.issuesBySeverity.critical} critical issue(s) found that block release.`;
      this._generateRequiredActions();
      return this.data.verdict;
    }

    // Reject if tests are failing
    const totalFail =
      this.data.tests.unit.fail + this.data.tests.integration.fail + this.data.tests.e2e.fail;

    if (totalFail > 0) {
      this.data.verdict = Verdict.REJECT;
      this.data.verdictReason = `${totalFail} test(s) failing. All tests must pass before approval.`;
      this._generateRequiredActions();
      return this.data.verdict;
    }

    // Reject if security score is too low
    if (this.data.security.score < 70) {
      this.data.verdict = Verdict.REJECT;
      this.data.verdictReason = `Security score ${this.data.security.score}/100 is below threshold (70).`;
      this._generateRequiredActions();
      return this.data.verdict;
    }

    // Reject if too many major issues
    if (this.data.issuesBySeverity.major > 3) {
      this.data.verdict = Verdict.REJECT;
      this.data.verdictReason = `${this.data.issuesBySeverity.major} major issues exceed threshold (3). Please fix before approval.`;
      this._generateRequiredActions();
      return this.data.verdict;
    }

    // Approve with conditions
    this.data.verdict = Verdict.APPROVE;

    if (this.data.issuesBySeverity.major > 0 || this.data.issuesBySeverity.minor > 0) {
      const parts = [];
      if (this.data.issuesBySeverity.major > 0) {
        parts.push(`${this.data.issuesBySeverity.major} major issue(s)`);
      }
      if (this.data.issuesBySeverity.minor > 0) {
        parts.push(`${this.data.issuesBySeverity.minor} minor issue(s)`);
      }
      this.data.verdictReason = `Approved with ${parts.join(' and ')} noted for follow-up.`;
      this._generateSuggestions();
    } else {
      this.data.verdictReason = 'All acceptance criteria met. No blocking issues found.';
    }

    return this.data.verdict;
  }

  /**
   * Generate required actions for rejection
   * @private
   */
  _generateRequiredActions() {
    this.data.requiredActions = [];

    // Critical issues
    for (const issue of this.data.issues.critical) {
      this.data.requiredActions.push(`Fix critical issue: ${issue.id} - ${issue.title}`);
    }

    // Failing tests
    const totalFail =
      this.data.tests.unit.fail + this.data.tests.integration.fail + this.data.tests.e2e.fail;

    if (totalFail > 0) {
      this.data.requiredActions.push(`Fix ${totalFail} failing test(s)`);
    }

    // Security vulnerabilities
    const criticalVulns = this.data.security.vulnerabilities.filter(
      (v) => v.severity === 'critical' || v.severity === 'high'
    );

    if (criticalVulns.length > 0) {
      this.data.requiredActions.push(
        `Address ${criticalVulns.length} critical/high security vulnerability(ies)`
      );
    }
  }

  /**
   * Generate suggestions for approved reports
   * @private
   */
  _generateSuggestions() {
    this.data.suggestions = [];

    // Major issues as suggestions
    for (const issue of this.data.issues.major) {
      this.data.suggestions.push(`Consider fixing: ${issue.id} - ${issue.title}`);
    }

    // Coverage suggestion
    if (this.data.coverage < 80) {
      this.data.suggestions.push(
        `Improve test coverage (currently ${this.data.coverage}%, target 80%)`
      );
    }

    // Minor issues summary
    if (this.data.issuesBySeverity.minor > 0) {
      this.data.suggestions.push(
        `${this.data.issuesBySeverity.minor} minor issue(s) can be addressed in future iterations`
      );
    }
  }

  /**
   * Generate the full QA report
   *
   * @returns {Object} Report data with verdict
   */
  generateReport() {
    // Calculate verdict if not already done
    if (!this.data.verdict) {
      this.calculateVerdict();
    }

    return this.data;
  }

  /**
   * Generate markdown report from template
   *
   * @returns {string} Markdown formatted report
   */
  toMarkdown() {
    const report = this.generateReport();

    // Simple template rendering (Handlebars-like)
    let markdown = this._getTemplate();

    // Replace simple placeholders
    markdown = markdown.replace(/\{\{storyId\}\}/g, report.storyId);
    markdown = markdown.replace(/\{\{generatedAt\}\}/g, report.generatedAt);
    markdown = markdown.replace(/\{\{agentName\}\}/g, report.agentName);
    markdown = markdown.replace(/\{\{verdict\}\}/g, report.verdict);
    markdown = markdown.replace(/\{\{verdictReason\}\}/g, report.verdictReason);
    markdown = markdown.replace(/\{\{totalIssues\}\}/g, String(report.totalIssues));
    markdown = markdown.replace(/\{\{coverage\}\}/g, String(report.coverage));
    markdown = markdown.replace(/\{\{buildStatus\}\}/g, report.buildStatus);

    // Issues by severity
    markdown = markdown.replace(
      /\{\{issuesBySeverity\.critical\}\}/g,
      String(report.issuesBySeverity.critical)
    );
    markdown = markdown.replace(
      /\{\{issuesBySeverity\.major\}\}/g,
      String(report.issuesBySeverity.major)
    );
    markdown = markdown.replace(
      /\{\{issuesBySeverity\.minor\}\}/g,
      String(report.issuesBySeverity.minor)
    );

    // Test results
    for (const type of ['unit', 'integration', 'e2e']) {
      for (const metric of ['total', 'pass', 'fail', 'skip']) {
        markdown = markdown.replace(
          new RegExp(`\\{\\{tests\\.${type}\\.${metric}\\}\\}`, 'g'),
          String(report.tests[type][metric])
        );
      }
    }

    // Security score
    markdown = markdown.replace(/\{\{security\.score\}\}/g, String(report.security.score));

    // JSON schema (AC6)
    markdown = markdown.replace(/\{\{jsonSchema\}\}/g, JSON.stringify(this.toJSON(), null, 2));

    // Handle conditional blocks and loops (simplified)
    markdown = this._renderConditionalBlocks(markdown, report);

    return markdown;
  }

  /**
   * Get template content
   * @private
   */
  _getTemplate() {
    const templatePath = path.join(this.rootPath, CONFIG.templatePath);

    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf-8');
    }

    // Fallback inline template
    return this._getInlineTemplate();
  }

  /**
   * Inline template fallback
   * @private
   */
  _getInlineTemplate() {
    return `# QA Report: {{storyId}}

**Version:** 1.0
**Generated:** {{generatedAt}}
**Agent:** {{agentName}}

---

## Summary

| Metric | Value |
|--------|-------|
| **Verdict** | {{verdict}} |
| **Total Issues** | {{totalIssues}} |
| **Critical** | {{issuesBySeverity.critical}} |
| **Major** | {{issuesBySeverity.major}} |
| **Minor** | {{issuesBySeverity.minor}} |
| **Test Coverage** | {{coverage}}% |
| **Build Status** | {{buildStatus}} |

---

## Test Results

### Unit Tests
- Total: {{tests.unit.total}}
- Pass: {{tests.unit.pass}}
- Fail: {{tests.unit.fail}}

### Integration Tests
- Total: {{tests.integration.total}}
- Pass: {{tests.integration.pass}}
- Fail: {{tests.integration.fail}}

### E2E Tests
- Total: {{tests.e2e.total}}
- Pass: {{tests.e2e.pass}}
- Fail: {{tests.e2e.fail}}

---

## Recommendation

### Verdict: {{verdict}}

**Justification:**
{{verdictReason}}

---

## Metadata

\`\`\`json
{{jsonSchema}}
\`\`\`

---

*Generated by AIOX QA Report Generator v1.0*
`;
  }

  /**
   * Render conditional blocks (simplified Handlebars-like)
   * @private
   */
  _renderConditionalBlocks(markdown, report) {
    // Render issue lists
    let result = markdown;

    // Critical issues
    if (report.issues.critical.length > 0) {
      const issuesList = report.issues.critical.map((issue) => this._renderIssue(issue)).join('\n');
      result = result.replace(
        /\{\{#if issues\.critical\.length\}\}([\s\S]*?)\{\{#each issues\.critical\}\}[\s\S]*?\{\{\/each\}\}([\s\S]*?)\{\{else\}\}[\s\S]*?\{\{\/if\}\}/g,
        `$1${issuesList}$2`
      );
    } else {
      result = result.replace(
        /\{\{#if issues\.critical\.length\}\}[\s\S]*?\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
        '$1'
      );
    }

    // Major issues
    if (report.issues.major.length > 0) {
      const issuesList = report.issues.major
        .map((issue) => this._renderIssue(issue, false))
        .join('\n');
      result = result.replace(
        /\{\{#if issues\.major\.length\}\}([\s\S]*?)\{\{#each issues\.major\}\}[\s\S]*?\{\{\/each\}\}([\s\S]*?)\{\{else\}\}[\s\S]*?\{\{\/if\}\}/g,
        `$1${issuesList}$2`
      );
    } else {
      result = result.replace(
        /\{\{#if issues\.major\.length\}\}[\s\S]*?\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
        '$1'
      );
    }

    // Minor issues
    if (report.issues.minor.length > 0) {
      const issuesList = report.issues.minor
        .map((issue) => this._renderIssue(issue, false, true))
        .join('\n');
      result = result.replace(
        /\{\{#if issues\.minor\.length\}\}([\s\S]*?)\{\{#each issues\.minor\}\}[\s\S]*?\{\{\/each\}\}([\s\S]*?)\{\{else\}\}[\s\S]*?\{\{\/if\}\}/g,
        `$1${issuesList}$2`
      );
    } else {
      result = result.replace(
        /\{\{#if issues\.minor\.length\}\}[\s\S]*?\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
        '$1'
      );
    }

    // Regression
    if (report.regression.detected) {
      const regressionList = report.regression.items
        .map((r) => `- **${r.file}**: ${r.description} (introduced in ${r.commit})`)
        .join('\n');
      result = result.replace(
        /\{\{#if regression\.detected\}\}[\s\S]*?\{\{#each regression\.items\}\}[\s\S]*?\{\{\/each\}\}([\s\S]*?)\{\{else\}\}[\s\S]*?\{\{\/if\}\}/g,
        `### Regression Detected\n\n${regressionList}$1`
      );
    } else {
      result = result.replace(
        /\{\{#if regression\.detected\}\}[\s\S]*?\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
        '$1'
      );
    }

    // Security vulnerabilities
    if (report.security.vulnerabilities.length > 0) {
      const vulnRows = report.security.vulnerabilities
        .map((v) => `| ${v.severity} | ${v.type} | \`${v.location}\` | ${v.description} |`)
        .join('\n');
      result = result.replace(
        /\{\{#if security\.vulnerabilities\.length\}\}[\s\S]*?\{\{#each security\.vulnerabilities\}\}[\s\S]*?\{\{\/each\}\}([\s\S]*?)\{\{else\}\}[\s\S]*?\{\{\/if\}\}/g,
        `### Vulnerabilities Found\n\n| Severity | Type | Location | Description |\n|----------|------|----------|-------------|\n${vulnRows}$1`
      );
    } else {
      result = result.replace(
        /\{\{#if security\.vulnerabilities\.length\}\}[\s\S]*?\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
        '$1'
      );
    }

    // Required actions (for REJECT)
    if (report.verdict === Verdict.REJECT && report.requiredActions.length > 0) {
      const actionsList = report.requiredActions.map((a, i) => `${i + 1}. ${a}`).join('\n');
      result = result.replace(
        /\{\{#if verdict === 'REJECT'\}\}[\s\S]*?\{\{#each requiredActions\}\}[\s\S]*?\{\{\/each\}\}([\s\S]*?)\{\{\/if\}\}/g,
        `### Required Actions Before Approval\n\n${actionsList}$1`
      );
    } else {
      result = result.replace(/\{\{#if verdict === 'REJECT'\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    // Suggestions
    if (report.suggestions.length > 0) {
      const suggestionsList = report.suggestions.map((s) => `- ${s}`).join('\n');
      result = result.replace(
        /\{\{#if suggestions\.length\}\}[\s\S]*?\{\{#each suggestions\}\}[\s\S]*?\{\{\/each\}\}([\s\S]*?)\{\{\/if\}\}/g,
        `### Suggestions for Improvement\n\n${suggestionsList}$1`
      );
    } else {
      result = result.replace(/\{\{#if suggestions\.length\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    return result;
  }

  /**
   * Render a single issue
   * @private
   */
  _renderIssue(issue, includeVerification = true, isMinor = false) {
    const severity = issue.severity.toUpperCase();
    let md = `#### ${issue.id}: ${issue.title}\n\n`;
    md += `| Field | Value |\n|-------|-------|\n`;
    md += `| **Severity** | ${severity} |\n`;
    md += `| **Location** | \`${issue.location}\` |\n`;
    md += `| **Category** | ${issue.category} |\n\n`;
    md += `**Description:**\n${issue.description}\n\n`;

    if (!isMinor) {
      md += `**Expected Behavior:**\n${issue.expected || 'N/A'}\n\n`;
      md += `**Actual Behavior:**\n${issue.actual || 'N/A'}\n\n`;
    }

    if (includeVerification && issue.verification && issue.verification.length > 0) {
      md += `**Verification Steps:**\n`;
      issue.verification.forEach((step, i) => {
        md += `${i + 1}. ${step}\n`;
      });
      md += '\n';
    }

    md += '---\n';
    return md;
  }

  /**
   * Save report to file
   *
   * @param {string} [outputPath] - Output path (defaults to qa_report.md in story folder)
   * @returns {string} Path to saved file
   */
  saveReport(outputPath) {
    const markdown = this.toMarkdown();

    let savePath;
    if (outputPath) {
      savePath = path.isAbsolute(outputPath) ? outputPath : path.join(this.rootPath, outputPath);
    } else {
      // Default to docs/stories/{storyId}/qa_report.md
      savePath = path.join(this.rootPath, 'docs/stories', this.storyId, CONFIG.defaultOutputFile);
    }

    // Ensure directory exists
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(savePath, markdown, 'utf-8');
    return savePath;
  }

  /**
   * Update dashboard status.json with QA report data (AC7)
   *
   * @returns {string} Path to updated status file
   */
  updateStatusJson() {
    const report = this.generateReport();

    // Update dashboard status.json
    const dashboardPath = path.join(this.rootPath, CONFIG.dashboardStatusPath);
    this._updateStatusFile(dashboardPath, report);

    // Update legacy status.json for backwards compatibility
    const legacyPath = path.join(this.rootPath, CONFIG.legacyStatusPath);
    this._updateStatusFile(legacyPath, report);

    return dashboardPath;
  }

  /**
   * Update a specific status file
   * @private
   */
  _updateStatusFile(statusPath, report) {
    let status = {};

    if (fs.existsSync(statusPath)) {
      try {
        status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
      } catch {
        status = {};
      }
    }

    // Initialize structure if needed
    if (!status.version) status.version = '1.0';
    if (!status.stories) {
      status.stories = { inProgress: [], completed: [] };
    }

    // Add/update qaReports section
    if (!status.qaReports) {
      status.qaReports = {};
    }

    status.qaReports[this.storyId] = {
      verdict: report.verdict,
      verdictReason: report.verdictReason,
      totalIssues: report.totalIssues,
      issuesBySeverity: report.issuesBySeverity,
      coverage: report.coverage,
      buildStatus: report.buildStatus,
      security: {
        score: report.security.score,
        vulnerabilities: report.security.vulnerabilities.length,
      },
      tests: {
        total: report.tests.unit.total + report.tests.integration.total + report.tests.e2e.total,
        pass: report.tests.unit.pass + report.tests.integration.pass + report.tests.e2e.pass,
        fail: report.tests.unit.fail + report.tests.integration.fail + report.tests.e2e.fail,
      },
      generatedAt: report.generatedAt,
    };

    status.updatedAt = new Date().toISOString();

    // Ensure directory exists
    const dir = path.dirname(statusPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(statusPath, JSON.stringify(status, null, 2), 'utf-8');
  }

  /**
   * Get JSON representation (AC6)
   *
   * @returns {Object} JSON schema for automated parsing
   */
  toJSON() {
    const report = this.generateReport();

    return {
      schema: 'aiox-qa-report-v1',
      storyId: report.storyId,
      generatedAt: report.generatedAt,
      agent: report.agentName,
      verdict: {
        status: report.verdict,
        reason: report.verdictReason,
      },
      summary: {
        totalIssues: report.totalIssues,
        bySeverity: report.issuesBySeverity,
        coverage: report.coverage,
        buildStatus: report.buildStatus,
        securityScore: report.security.score,
      },
      tests: report.tests,
      issues: {
        critical: report.issues.critical.map((i) => ({
          id: i.id,
          title: i.title,
          location: i.location,
          category: i.category,
        })),
        major: report.issues.major.map((i) => ({
          id: i.id,
          title: i.title,
          location: i.location,
          category: i.category,
        })),
        minor: report.issues.minor.map((i) => ({
          id: i.id,
          title: i.title,
          location: i.location,
          category: i.category,
        })),
      },
      regression: report.regression,
      security: {
        score: report.security.score,
        vulnerabilities: report.security.vulnerabilities,
      },
      actions: {
        required: report.requiredActions,
        suggested: report.suggestions,
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Quick helper to generate a QA report
 *
 * @param {string} storyId - Story ID
 * @param {Object} options - Options including issues and test results
 * @returns {QAReportGenerator} Generator instance
 */
function createQAReport(storyId, options = {}) {
  const generator = new QAReportGenerator(storyId, options);

  if (options.issues) {
    generator.categorizeIssues(options.issues);
  }

  return generator;
}

/**
 * Generate and save a QA report in one call
 *
 * @param {string} storyId - Story ID
 * @param {Object} options - Options
 * @returns {string} Path to saved report
 */
function generateAndSaveReport(storyId, options = {}) {
  const generator = createQAReport(storyId, options);
  generator.generateReport();
  const reportPath = generator.saveReport(options.outputPath);
  generator.updateStatusJson();
  return reportPath;
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
    console.log(`
QA Report Generator - AIOX QA Evolution (Story 6.2)

Usage:
  node qa-report-generator.js <story-id> [command] [options]
  *qa-report <story-id> [command] [options]

Commands:
  generate        Generate QA report (default)
  json            Output report as JSON schema (AC6)
  save            Generate and save report to file
  update          Update dashboard status.json (AC7)
  all             Generate, save, and update dashboard

Options:
  --output <path>       Custom output path for report
  --test-results <path> Path to test results JSON file
  --agent <name>        QA agent name
  --quiet, -q           Suppress console output
  --help, -h            Show this help message

Examples:
  node qa-report-generator.js STORY-6.2
  node qa-report-generator.js STORY-6.2 json
  node qa-report-generator.js STORY-6.2 save --output ./qa_report.md
  node qa-report-generator.js STORY-6.2 all --test-results ./test-results.json

Acceptance Criteria Coverage:
  AC1: Template for qa_report.md created
  AC2: Sections: Summary, Test Results, Issues, Regression, Security
  AC3: Issues categorized: Critical, Major, Minor
  AC4: Recommendation: APPROVE or REJECT with justification
  AC5: Locations specific (file:line) for each issue
  AC6: Schema JSON for automated parsing
  AC7: Integrates with .aiox/dashboard/status.json
`);
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  // Parse arguments
  let storyId = null;
  let command = 'generate';
  let outputPath = null;
  let testResultsPath = null;
  let agentName = null;
  let quiet = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output' && args[i + 1]) {
      outputPath = args[++i];
    } else if (arg === '--test-results' && args[i + 1]) {
      testResultsPath = args[++i];
    } else if (arg === '--agent' && args[i + 1]) {
      agentName = args[++i];
    } else if (arg === '--quiet' || arg === '-q') {
      quiet = true;
    } else if (!arg.startsWith('-')) {
      if (!storyId) {
        storyId = arg;
      } else {
        command = arg;
      }
    }
  }

  if (!storyId) {
    console.error('Error: Story ID required');
    process.exit(1);
  }

  try {
    const options = {};
    if (agentName) options.agentName = agentName;

    const generator = new QAReportGenerator(storyId, options);

    // Load test results if provided
    if (testResultsPath) {
      generator.loadTestResults(testResultsPath);
    }

    switch (command) {
      case 'generate':
        generator.generateReport();
        if (!quiet) {
          console.log(generator.toMarkdown());
        }
        break;

      case 'json':
        generator.generateReport();
        console.log(JSON.stringify(generator.toJSON(), null, 2));
        break;

      case 'save': {
        generator.generateReport();
        const savePath = generator.saveReport(outputPath);
        if (!quiet) console.log(`QA report saved to: ${savePath}`);
        break;
      }

      case 'update': {
        generator.generateReport();
        const updatePath = generator.updateStatusJson();
        if (!quiet) console.log(`Dashboard status.json updated: ${updatePath}`);
        break;
      }

      case 'all': {
        generator.generateReport();
        const reportPath = generator.saveReport(outputPath);
        const statusPath = generator.updateStatusJson();
        if (!quiet) {
          console.log(`QA report saved to: ${reportPath}`);
          console.log(`Dashboard status.json updated: ${statusPath}`);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  QAReportGenerator,
  // Enums
  Severity,
  Category,
  Verdict,
  BuildStatus,
  // Helper functions
  createQAReport,
  generateAndSaveReport,
  // Config
  CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
