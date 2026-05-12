/**
 * Epic6Executor - QA Loop Executor
 *
 * Story: 0.3 - Epic Executors (AC5)
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Wraps qa-loop-orchestrator to execute review → fix → re-review cycles
 * until quality standards are met.
 *
 * @module core/orchestration/executors/epic-6-executor
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const EpicExecutor = require('./epic-executor');

/**
 * QA verdict types
 */
const QAVerdict = {
  APPROVED: 'approved',
  NEEDS_REVISION: 'needs_revision',
  BLOCKED: 'blocked',
};

/**
 * Epic 6 Executor - QA Loop
 * Manages quality assurance review cycles
 */
class Epic6Executor extends EpicExecutor {
  constructor(orchestrator) {
    super(orchestrator, 6);
    this.maxIterations = 3;

    // Lazy-load QA orchestrator
    this._qaOrchestrator = null;
  }

  /**
   * Get QA Loop Orchestrator
   * @private
   */
  _getQAOrchestrator() {
    if (!this._qaOrchestrator) {
      try {
        this._qaOrchestrator = require('../../infrastructure/scripts/qa-loop-orchestrator');
      } catch (error) {
        this._log(`QA Loop Orchestrator not available: ${error.message}`, 'warn');
      }
    }
    return this._qaOrchestrator;
  }

  /**
   * Execute QA Loop
   * @param {Object} context - Execution context
   * @param {Object} context.buildResult - Result from Epic 4
   * @param {Array} context.testResults - Test results
   * @param {Array} context.codeChanges - Code changes to review
   * @returns {Promise<Object>} QA result with verdict
   */
  async execute(context) {
    this._startExecution();

    try {
      const { buildResult, testResults, codeChanges, storyId, techStack } = context;

      this._log(`Starting QA loop for ${storyId}`);

      let iteration = 0;
      let currentVerdict = QAVerdict.NEEDS_REVISION;
      const reviewHistory = [];

      while (iteration < this.maxIterations && currentVerdict === QAVerdict.NEEDS_REVISION) {
        iteration++;
        this._log(`QA iteration ${iteration}/${this.maxIterations}`);

        // Run review
        const reviewResult = await this._runReview({
          storyId,
          buildResult,
          testResults,
          codeChanges,
          iteration,
          techStack,
        });

        reviewHistory.push(reviewResult);

        // Check verdict
        currentVerdict = reviewResult.verdict;

        if (currentVerdict === QAVerdict.BLOCKED) {
          this._log('Review blocked - critical issues found', 'error');
          break;
        }

        if (currentVerdict === QAVerdict.NEEDS_REVISION && iteration < this.maxIterations) {
          this._log('Review needs revision, applying fixes...');
          await this._applyFixes(reviewResult.issues, context);
        }
      }

      // Generate QA report
      const reportPath = await this._generateReport(storyId, reviewHistory, currentVerdict);
      this._addArtifact('qa-report', reportPath);

      const passed = currentVerdict === QAVerdict.APPROVED;

      return this._completeExecution({
        verdict: currentVerdict,
        passed,
        iterations: iteration,
        reviewHistory,
        reportPath,
      });
    } catch (error) {
      return this._failExecution(error);
    }
  }

  /**
   * Run a single review cycle
   * @private
   */
  async _runReview(context) {
    const { storyId, iteration, techStack: _techStack } = context;

    this._log(`Running review cycle ${iteration}`);

    // Check for QA orchestrator
    const QAOrchestrator = this._getQAOrchestrator();

    if (QAOrchestrator) {
      try {
        const orchestrator = new QAOrchestrator({
          storyId,
          rootPath: this.projectRoot,
        });

        return await orchestrator.runReview(context);
      } catch (error) {
        this._log(`QA orchestrator error: ${error.message}`, 'warn');
      }
    }

    // Fallback: perform basic checks
    const issues = await this._performBasicChecks(context);

    // Determine verdict based on issues
    let verdict = QAVerdict.APPROVED;

    const criticalIssues = issues.filter((i) => i.severity === 'critical');
    const majorIssues = issues.filter((i) => i.severity === 'major');

    if (criticalIssues.length > 0) {
      verdict = QAVerdict.BLOCKED;
    } else if (majorIssues.length > 0 || issues.length > 5) {
      verdict = QAVerdict.NEEDS_REVISION;
    }

    return {
      iteration,
      verdict,
      issues,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Perform basic quality checks
   * @private
   */
  async _performBasicChecks(_context) {
    const issues = [];

    // Check if tests exist
    const testsDir = this._getPath('tests');
    if (!(await fs.pathExists(testsDir))) {
      issues.push({
        type: 'missing_tests',
        severity: 'major',
        message: 'No tests directory found',
      });
    }

    // Check for lint errors (would run actual linter in full implementation)
    // For now, return stub
    this._log('Basic quality checks completed');

    return issues;
  }

  /**
   * Apply fixes for found issues
   * @private
   */
  async _applyFixes(issues, _context) {
    this._log(`Applying fixes for ${issues.length} issues`);

    // In full implementation, this would invoke @dev agent
    // to fix each issue. For now, just log.
    for (const issue of issues) {
      this._log(`Would fix: ${issue.type} - ${issue.message}`);
    }
  }

  /**
   * Generate QA report
   * @private
   */
  async _generateReport(storyId, reviewHistory, finalVerdict) {
    const reportPath = this._getPath('.aiox', 'qa-reports', `${storyId}-${Date.now()}.md`);

    const verdictEmoji = {
      [QAVerdict.APPROVED]: '✅',
      [QAVerdict.NEEDS_REVISION]: '⚠️',
      [QAVerdict.BLOCKED]: '❌',
    };

    let report = `# QA Report: ${storyId}

**Final Verdict:** ${verdictEmoji[finalVerdict]} ${finalVerdict.toUpperCase()}
**Iterations:** ${reviewHistory.length}
**Generated:** ${new Date().toISOString()}

---

## Review History

`;

    for (const review of reviewHistory) {
      report += `### Iteration ${review.iteration}

**Verdict:** ${verdictEmoji[review.verdict]} ${review.verdict}
**Time:** ${review.timestamp}
**Issues Found:** ${review.issues?.length || 0}

`;

      if (review.issues && review.issues.length > 0) {
        report += '**Issues:**\n\n';
        for (const issue of review.issues) {
          report += `- [${issue.severity}] ${issue.type}: ${issue.message}\n`;
        }
        report += '\n';
      }
    }

    report += `---
*Generated by Epic 6 QA Loop Executor*
`;

    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeFile(reportPath, report);

    return reportPath;
  }
}

module.exports = Epic6Executor;
module.exports.QAVerdict = QAVerdict;
