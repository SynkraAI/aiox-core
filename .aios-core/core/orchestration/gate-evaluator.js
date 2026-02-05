/**
 * Gate Evaluator - Story 0.6
 *
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Evaluates quality gates between epics to ensure bad outputs don't propagate.
 *
 * Features:
 * - AC1: Gate check after each epic completes
 * - AC2: Gate verdicts: APPROVED, NEEDS_REVISION, BLOCKED
 * - AC3: BLOCKED halts pipeline and escalates
 * - AC4: NEEDS_REVISION returns to previous epic
 * - AC5: Gates configurable in core-config.yaml
 * - AC6: Gate results saved in state
 * - AC7: Strict mode: any gate fail = halt
 *
 * @module core/orchestration/gate-evaluator
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GATE VERDICTS (AC2)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Gate verdict enum
 */
const GateVerdict = {
  /** Output meets all quality criteria */
  APPROVED: 'approved',
  /** Output needs revision, return to previous epic */
  NEEDS_REVISION: 'needs_revision',
  /** Critical issue, halt pipeline */
  BLOCKED: 'blocked',
};

/**
 * Default gate configurations
 */
const DEFAULT_GATE_CONFIG = {
  // Epic 3 -> Epic 4 gate
  epic3_to_epic4: {
    blocking: true,
    minScore: 3.0,
    requireApproval: false,
    checks: ['spec_exists', 'complexity_assessed', 'requirements_defined'],
  },
  // Epic 4 -> Epic 6 gate
  epic4_to_epic6: {
    blocking: true,
    requireTests: true,
    minTestCoverage: 0,
    checks: ['plan_complete', 'implementation_exists', 'no_critical_errors'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GATE EVALUATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * GateEvaluator - Evaluates quality gates between epics (AC1)
 */
class GateEvaluator {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.projectRoot - Project root path
   * @param {boolean} [options.strictMode=false] - Strict mode: any fail = halt (AC7)
   * @param {Object} [options.gateConfig] - Custom gate configurations (AC5)
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.strictMode = options.strictMode ?? false;
    this.gateConfig = options.gateConfig || null;

    // Results storage (AC6)
    this.results = [];
    this.logs = [];
  }

  /**
   * Load gate configuration from core-config.yaml (AC5)
   * @private
   */
  async _loadConfig() {
    if (this.gateConfig) {
      return this.gateConfig;
    }

    try {
      const configPath = path.join(this.projectRoot, '.aios-core', 'core-config.yaml');
      if (await fs.pathExists(configPath)) {
        const content = await fs.readFile(configPath, 'utf8');
        const config = yaml.load(content);

        if (config?.autoClaude?.orchestrator?.gates) {
          return { ...DEFAULT_GATE_CONFIG, ...config.autoClaude.orchestrator.gates };
        }
      }
    } catch (error) {
      this._log(`Failed to load gate config: ${error.message}`, 'warn');
    }

    return DEFAULT_GATE_CONFIG;
  }

  /**
   * Get gate key for transition
   * @private
   */
  _getGateKey(fromEpic, toEpic) {
    return `epic${fromEpic}_to_epic${toEpic}`;
  }

  /**
   * Evaluate gate between epics (AC1)
   *
   * @param {number} fromEpic - Source epic number
   * @param {number} toEpic - Target epic number
   * @param {Object} epicResult - Result from the source epic
   * @returns {Promise<Object>} Gate evaluation result
   */
  async evaluate(fromEpic, toEpic, epicResult) {
    const gateKey = this._getGateKey(fromEpic, toEpic);
    this._log(`Evaluating gate: ${gateKey}`, 'info');

    const config = await this._loadConfig();
    const gateConfig = config[gateKey] || { blocking: false };

    const result = {
      gate: gateKey,
      fromEpic,
      toEpic,
      timestamp: new Date().toISOString(),
      verdict: GateVerdict.APPROVED,
      score: 0,
      checks: [],
      issues: [],
      config: gateConfig,
    };

    try {
      // Run gate checks
      const checks = await this._runGateChecks(fromEpic, toEpic, epicResult, gateConfig);
      result.checks = checks;

      // Calculate score
      const passedChecks = checks.filter((c) => c.passed).length;
      result.score = checks.length > 0 ? (passedChecks / checks.length) * 5 : 5;

      // Collect issues
      result.issues = checks
        .filter((c) => !c.passed)
        .map((c) => ({
          check: c.name,
          message: c.message,
          severity: c.severity || 'medium',
        }));

      // Determine verdict (AC2)
      result.verdict = this._determineVerdict(result, gateConfig);

      this._log(`Gate ${gateKey}: ${result.verdict} (score: ${result.score.toFixed(1)})`, 'info');
    } catch (error) {
      result.verdict = GateVerdict.BLOCKED;
      result.issues.push({
        check: 'gate_evaluation',
        message: error.message,
        severity: 'critical',
      });
      this._log(`Gate evaluation failed: ${error.message}`, 'error');
    }

    // Store result (AC6)
    this.results.push(result);

    return result;
  }

  /**
   * Run individual gate checks
   * @private
   */
  async _runGateChecks(fromEpic, toEpic, epicResult, gateConfig) {
    const checks = [];

    // Get check list for this gate
    const checkNames = gateConfig.checks || this._getDefaultChecks(fromEpic, toEpic);

    for (const checkName of checkNames) {
      const checkResult = await this._runCheck(checkName, fromEpic, epicResult, gateConfig);
      checks.push(checkResult);
    }

    // Additional config-based checks
    // Only check minScore if epic actually provides a score
    if (gateConfig.minScore !== undefined && epicResult.score !== undefined) {
      checks.push({
        name: 'min_score',
        passed: epicResult.score >= gateConfig.minScore,
        message: `Epic score ${epicResult.score} ${epicResult.score >= gateConfig.minScore ? '>=' : '<'} min ${gateConfig.minScore}`,
        severity: 'high',
      });
    }

    // Only check requireTests for epics that actually run tests (epic 4, 6)
    // Skip check if testResults is undefined or marked as skipped/not-ran
    if (gateConfig.requireTests && epicResult.testResults !== undefined) {
      // Handle both array format (actual test results) and object format (status)
      const isArray = Array.isArray(epicResult.testResults);
      const testsSkipped =
        !isArray && (epicResult.testResults?.skipped || epicResult.testResults?.ran === false);
      const hasTests = isArray ? epicResult.testResults.length > 0 : epicResult.testsRun > 0;

      // Only fail if tests were expected AND not skipped AND didn't run
      if (!testsSkipped) {
        checks.push({
          name: 'require_tests',
          passed: hasTests,
          message: hasTests ? 'Tests were executed' : 'No tests were run',
          severity: 'high',
        });
      }
    }

    if (gateConfig.minTestCoverage !== undefined && gateConfig.minTestCoverage > 0) {
      const coverage = epicResult.testCoverage || 0;
      checks.push({
        name: 'min_coverage',
        passed: coverage >= gateConfig.minTestCoverage,
        message: `Test coverage ${coverage}% ${coverage >= gateConfig.minTestCoverage ? '>=' : '<'} min ${gateConfig.minTestCoverage}%`,
        severity: 'medium',
      });
    }

    return checks;
  }

  /**
   * Run a single check
   * @private
   */
  async _runCheck(checkName, fromEpic, epicResult, _gateConfig) {
    const result = {
      name: checkName,
      passed: false,
      message: '',
      severity: 'medium',
    };

    switch (checkName) {
      // Epic 3 checks
      case 'spec_exists':
        result.passed =
          !!epicResult.specPath || !!epicResult.artifacts?.find((a) => a.type === 'spec');
        result.message = result.passed ? 'Spec file exists' : 'No spec file generated';
        result.severity = 'critical';
        break;

      case 'complexity_assessed':
        result.passed = !!epicResult.complexity;
        result.message = result.passed
          ? `Complexity: ${epicResult.complexity}`
          : 'Complexity not assessed';
        result.severity = 'medium';
        break;

      case 'requirements_defined':
        result.passed =
          Array.isArray(epicResult.requirements) && epicResult.requirements.length > 0;
        result.message = result.passed
          ? `${epicResult.requirements?.length || 0} requirements defined`
          : 'No requirements defined';
        result.severity = 'medium'; // Medium severity - requirements can be implicit
        break;

      // Epic 4 checks
      case 'plan_complete':
        result.passed = !!epicResult.planPath || epicResult.planComplete === true;
        result.message = result.passed ? 'Implementation plan complete' : 'Plan not complete';
        result.severity = 'high';
        break;

      case 'implementation_exists':
        result.passed = !!epicResult.implementationPath || epicResult.codeChanges?.length > 0;
        result.message = result.passed ? 'Implementation exists' : 'No implementation found';
        result.severity = 'critical';
        break;

      case 'no_critical_errors': {
        const criticalErrors = (epicResult.errors || []).filter((e) => e.severity === 'critical');
        result.passed = criticalErrors.length === 0;
        result.message = result.passed
          ? 'No critical errors'
          : `${criticalErrors.length} critical errors found`;
        result.severity = 'critical';
        break;
      }

      // Epic 6 checks
      case 'qa_report_exists':
        result.passed = !!epicResult.reportPath || !!epicResult.qaReport;
        result.message = result.passed ? 'QA report generated' : 'No QA report';
        result.severity = 'medium';
        break;

      case 'verdict_generated':
        result.passed = !!epicResult.verdict;
        result.message = result.passed ? `QA verdict: ${epicResult.verdict}` : 'No QA verdict';
        result.severity = 'medium';
        break;

      case 'tests_pass': {
        const hasResults = Array.isArray(epicResult.testResults) && epicResult.testResults.length > 0;
        const allPass = hasResults && epicResult.testResults.every((t) => t.passed);
        result.passed = allPass;
        result.message = !hasResults ? 'No test results' : (allPass ? 'All tests pass' : 'Some tests failed');
        result.severity = 'high';
        break;
      }

      default:
        // Unknown check - pass by default
        result.passed = true;
        result.message = `Unknown check: ${checkName}`;
        result.severity = 'low';
    }

    return result;
  }

  /**
   * Get default checks for a gate
   * @private
   */
  _getDefaultChecks(fromEpic, _toEpic) {
    switch (fromEpic) {
      case 3:
        return ['spec_exists', 'complexity_assessed'];
      case 4:
        return ['plan_complete', 'no_critical_errors'];
      case 6:
        return ['qa_report_exists', 'verdict_generated'];
      default:
        return [];
    }
  }

  /**
   * Determine verdict based on checks and config (AC2)
   * @private
   */
  _determineVerdict(result, gateConfig) {
    // Strict mode: any failure = blocked (AC7)
    if (this.strictMode && result.issues.length > 0) {
      return GateVerdict.BLOCKED;
    }

    // Check for critical issues
    const criticalIssues = result.issues.filter((i) => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      return GateVerdict.BLOCKED;
    }

    // Check minimum score if configured
    if (gateConfig.minScore !== undefined && result.score < gateConfig.minScore) {
      return gateConfig.blocking ? GateVerdict.BLOCKED : GateVerdict.NEEDS_REVISION;
    }

    // Check for high severity issues
    const highIssues = result.issues.filter((i) => i.severity === 'high');
    if (highIssues.length > 0) {
      // If gate is blocking, block; otherwise needs revision
      return gateConfig.blocking ? GateVerdict.BLOCKED : GateVerdict.NEEDS_REVISION;
    }

    // Allow minor issues if configured
    if (
      gateConfig.allowMinorIssues &&
      result.issues.every((i) => i.severity === 'low' || i.severity === 'medium')
    ) {
      return GateVerdict.APPROVED;
    }

    // Any remaining issues - needs revision
    if (result.issues.length > 0) {
      return GateVerdict.NEEDS_REVISION;
    }

    return GateVerdict.APPROVED;
  }

  /**
   * Check if verdict blocks pipeline (AC3)
   *
   * @param {string} verdict - Gate verdict
   * @returns {boolean} True if should block
   */
  shouldBlock(verdict) {
    return verdict === GateVerdict.BLOCKED;
  }

  /**
   * Check if verdict requires revision (AC4)
   *
   * @param {string} verdict - Gate verdict
   * @returns {boolean} True if needs revision
   */
  needsRevision(verdict) {
    return verdict === GateVerdict.NEEDS_REVISION;
  }

  /**
   * Get all gate results (AC6)
   *
   * @returns {Object[]} All gate evaluation results
   */
  getResults() {
    return [...this.results];
  }

  /**
   * Get result for specific gate (AC6)
   *
   * @param {string} gateKey - Gate key (e.g., 'epic3_to_epic4')
   * @returns {Object|null} Gate result or null
   */
  getResult(gateKey) {
    return this.results.find((r) => r.gate === gateKey) || null;
  }

  /**
   * Get results summary
   *
   * @returns {Object} Summary of all gate evaluations
   */
  getSummary() {
    const approved = this.results.filter((r) => r.verdict === GateVerdict.APPROVED).length;
    const needsRevision = this.results.filter(
      (r) => r.verdict === GateVerdict.NEEDS_REVISION,
    ).length;
    const blocked = this.results.filter((r) => r.verdict === GateVerdict.BLOCKED).length;

    return {
      total: this.results.length,
      approved,
      needsRevision,
      blocked,
      allPassed: blocked === 0 && needsRevision === 0,
      averageScore:
        this.results.length > 0
          ? this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length
          : 0,
    };
  }

  /**
   * Clear all results
   */
  clear() {
    this.results = [];
    this.logs = [];
  }

  /**
   * Log message
   * @private
   */
  _log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    this.logs.push({ timestamp, level, message });
  }

  /**
   * Get logs
   */
  getLogs() {
    return [...this.logs];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  GateEvaluator,
  GateVerdict,
  DEFAULT_GATE_CONFIG,
};
