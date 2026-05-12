/**
 * Quality Metrics Hook Integration
 *
 * Provides functions for recording metrics from various workflow hooks.
 * Can be called from pre-commit, PR automation, and manual reviews.
 *
 * @module quality/metrics-hook
 * @version 1.0.0
 * @story 3.11a - Quality Gates Metrics Collector
 */

const { MetricsCollector } = require('./metrics-collector');

/**
 * Record Layer 1 (pre-commit) metrics
 *
 * @param {Object} result - Pre-commit result
 * @param {boolean} result.passed - Whether all checks passed
 * @param {number} result.durationMs - Total duration in milliseconds
 * @param {number} [result.findingsCount] - Number of issues found
 * @param {Object} [result.metadata] - Additional metadata
 * @returns {Promise<Object>} Recorded run
 *
 * @example
 * // Call from pre-commit hook
 * const { recordPreCommitMetrics } = require('./.aiox-core/quality/metrics-hook');
 * const startTime = Date.now();
 * // ... run checks ...
 * await recordPreCommitMetrics({
 *   passed: allChecksPassed,
 *   durationMs: Date.now() - startTime,
 *   findingsCount: lintErrors + typeErrors
 * });
 */
async function recordPreCommitMetrics(result) {
  try {
    const collector = new MetricsCollector();
    return await collector.recordPreCommit({
      passed: result.passed,
      durationMs: result.durationMs || 0,
      findingsCount: result.findingsCount || 0,
      metadata: {
        triggeredBy: 'hook',
        ...result.metadata,
      },
    });
  } catch (error) {
    // Don't fail the commit if metrics recording fails
    console.warn(`[metrics] Warning: Failed to record pre-commit metrics: ${error.message}`);
    return null;
  }
}

/**
 * Record Layer 2 (PR automation) metrics
 *
 * @param {Object} result - PR review result
 * @param {boolean} result.passed - Whether review passed
 * @param {number} result.durationMs - Total duration in milliseconds
 * @param {Object} [result.coderabbit] - CodeRabbit findings
 * @param {Object} [result.quinn] - Quinn (QA agent) findings
 * @param {Object} [result.metadata] - Additional metadata
 * @returns {Promise<Object>} Recorded run
 *
 * @example
 * const { recordPRReviewMetrics } = require('./.aiox-core/quality/metrics-hook');
 * await recordPRReviewMetrics({
 *   passed: true,
 *   durationMs: 180000, // 3 minutes
 *   coderabbit: {
 *     findingsCount: 5,
 *     severityBreakdown: { critical: 0, high: 1, medium: 2, low: 2 }
 *   },
 *   quinn: {
 *     findingsCount: 3,
 *     topCategories: ['test-coverage', 'documentation']
 *   },
 *   metadata: { prNumber: 42, branchName: 'feature/x' }
 * });
 */
async function recordPRReviewMetrics(result) {
  try {
    const collector = new MetricsCollector();
    return await collector.recordPRReview({
      passed: result.passed,
      durationMs: result.durationMs || 0,
      findingsCount: result.findingsCount || 0,
      coderabbit: result.coderabbit,
      quinn: result.quinn,
      metadata: {
        triggeredBy: 'pr',
        ...result.metadata,
      },
    });
  } catch (error) {
    console.warn(`[metrics] Warning: Failed to record PR review metrics: ${error.message}`);
    return null;
  }
}

/**
 * Record Layer 3 (human review) metrics
 *
 * @param {Object} result - Human review result
 * @param {boolean} result.passed - Whether review passed
 * @param {number} result.durationMs - Total duration in milliseconds
 * @param {number} [result.findingsCount] - Number of issues found
 * @param {Object} [result.metadata] - Additional metadata
 * @returns {Promise<Object>} Recorded run
 *
 * @example
 * const { recordHumanReviewMetrics } = require('./.aiox-core/quality/metrics-hook');
 * await recordHumanReviewMetrics({
 *   passed: true,
 *   durationMs: 600000, // 10 minutes
 *   findingsCount: 1,
 *   metadata: { reviewer: 'tech-lead', storyId: '3.11a' }
 * });
 */
async function recordHumanReviewMetrics(result) {
  try {
    const collector = new MetricsCollector();
    return await collector.recordHumanReview({
      passed: result.passed,
      durationMs: result.durationMs || 0,
      findingsCount: result.findingsCount || 0,
      metadata: {
        triggeredBy: 'manual',
        ...result.metadata,
      },
    });
  } catch (error) {
    console.warn(`[metrics] Warning: Failed to record human review metrics: ${error.message}`);
    return null;
  }
}

/**
 * Simple pre-commit wrapper that measures and records timing
 *
 * @param {Function} checkFn - Function that runs checks, returns { passed, findingsCount }
 * @returns {Promise<Object>} Result of the check function
 *
 * @example
 * const { withPreCommitMetrics } = require('./.aiox-core/quality/metrics-hook');
 *
 * async function runPreCommitChecks() {
 *   return await withPreCommitMetrics(async () => {
 *     const lintResult = await runLint();
 *     const typeResult = await runTypeCheck();
 *     return {
 *       passed: lintResult.passed && typeResult.passed,
 *       findingsCount: lintResult.errors + typeResult.errors
 *     };
 *   });
 * }
 */
async function withPreCommitMetrics(checkFn) {
  const startTime = Date.now();
  let result;

  try {
    result = await checkFn();
  } catch (error) {
    result = { passed: false, findingsCount: 1, error: error.message };
  }

  const durationMs = Date.now() - startTime;

  await recordPreCommitMetrics({
    passed: result.passed,
    durationMs,
    findingsCount: result.findingsCount || 0,
    metadata: result.metadata,
  });

  return result;
}

/**
 * Get quick metrics summary for display
 *
 * @returns {Promise<Object>} Quick summary
 */
async function getQuickSummary() {
  try {
    const collector = new MetricsCollector();
    const metrics = await collector.getMetrics();

    return {
      layer1: {
        passRate: metrics.layers.layer1.passRate,
        lastRun: metrics.layers.layer1.lastRun,
        totalRuns: metrics.layers.layer1.totalRuns,
      },
      layer2: {
        passRate: metrics.layers.layer2.passRate,
        autoCatchRate: metrics.layers.layer2.autoCatchRate,
        totalRuns: metrics.layers.layer2.totalRuns,
      },
      layer3: {
        passRate: metrics.layers.layer3.passRate,
        totalRuns: metrics.layers.layer3.totalRuns,
      },
      historyCount: metrics.history.length,
    };
  } catch (error) {
    return null;
  }
}

// CLI runner for direct invocation
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    switch (command) {
      case 'pre-commit': {
        // Record a simple pre-commit result
        const passed = args[1] !== 'failed';
        const duration = parseInt(args[2], 10) || 0;
        const findings = parseInt(args[3], 10) || 0;

        const result = await recordPreCommitMetrics({
          passed,
          durationMs: duration,
          findingsCount: findings,
        });

        if (result) {
          console.log(`[metrics] Layer 1 recorded: ${passed ? 'PASS' : 'FAIL'}`);
        }
        break;
      }

      case 'summary': {
        const summary = await getQuickSummary();
        if (summary) {
          console.log(JSON.stringify(summary, null, 2));
        }
        break;
      }

      default:
        console.log('Usage: node metrics-hook.js <command> [args]');
        console.log('Commands:');
        console.log('  pre-commit [passed|failed] [durationMs] [findingsCount]');
        console.log('  summary');
    }
  })();
}

module.exports = {
  recordPreCommitMetrics,
  recordPRReviewMetrics,
  recordHumanReviewMetrics,
  withPreCommitMetrics,
  getQuickSummary,
};
