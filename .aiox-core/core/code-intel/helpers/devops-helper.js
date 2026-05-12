'use strict';

const { getEnricher, isCodeIntelAvailable } = require('../index');

/**
 * DevOpsHelper — Code intelligence helper for @devops agent tasks.
 *
 * All functions return null gracefully when no provider is available.
 * Never throws — safe to call unconditionally in task workflows.
 *
 * Functions:
 *   - assessPrePushImpact(files) — for @devops pre-push quality gate (blast radius + risk)
 *   - generateImpactSummary(files) — for @devops PR automation (impact summary for PR description)
 *   - classifyRiskLevel(blastRadius) — pure logic risk classification (LOW/MEDIUM/HIGH)
 *   - _formatImpactReport(impact, riskLevel) — private formatting helper
 */

/**
 * Assess impact of changed files for the pre-push quality gate.
 * Used by @devops during *pre-push — returns blast radius, risk level, and formatted report.
 *
 * @param {string[]} files - Array of changed file paths
 * @returns {Promise<{impact: Object, riskLevel: string, report: string}|null>} Impact analysis or null
 */
async function assessPrePushImpact(files) {
  if (!files || files.length === 0) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const enricher = getEnricher();
    const impact = await enricher.assessImpact(files);

    if (!impact) {
      return {
        impact: null,
        riskLevel: 'LOW',
        report: _formatImpactReport(null, 'LOW'),
      };
    }

    const riskLevel = classifyRiskLevel(impact.blastRadius);

    return {
      impact,
      riskLevel,
      report: _formatImpactReport(impact, riskLevel),
    };
  } catch {
    return null;
  }
}

/**
 * Generate an impact summary for PR description enrichment.
 * Composes assessImpact + findTests to provide summary text and test coverage info.
 * Used by @devops during *create-pr — returns summary for PR body.
 *
 * @param {string[]} files - Array of changed file paths
 * @returns {Promise<{summary: string, testCoverage: Array|null}|null>} Impact summary or null
 */
async function generateImpactSummary(files) {
  if (!files || files.length === 0) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const enricher = getEnricher();
    const impact = await enricher.assessImpact(files);

    if (!impact) return null;

    // Per-capability try/catch — partial results accepted
    let testCoverage = null;
    try {
      const tests = await enricher.findTests(files[0]);
      if (tests) {
        testCoverage = tests;
      }
    } catch { /* skip — partial result ok */ }

    const riskLevel = classifyRiskLevel(impact.blastRadius);
    const fileCount = impact.references ? impact.references.length : 0;
    const topFiles = (impact.references || [])
      .map((r) => r.file || r.path || 'unknown')
      .slice(0, 10);

    const summaryLines = [
      `**Blast Radius:** ${impact.blastRadius} files affected`,
      `**Risk Level:** ${riskLevel}`,
      `**Avg Complexity:** ${impact.complexity ? impact.complexity.average.toFixed(1) : 'N/A'}`,
    ];

    if (topFiles.length > 0) {
      summaryLines.push('', '**Affected Files:**');
      topFiles.forEach((f) => summaryLines.push(`- ${f}`));
    }

    if (testCoverage && testCoverage.length > 0) {
      summaryLines.push('', `**Related Tests:** ${testCoverage.length} test file(s) found`);
    } else {
      summaryLines.push('', '**Related Tests:** No related tests found');
    }

    return {
      summary: summaryLines.join('\n'),
      testCoverage,
    };
  } catch {
    return null;
  }
}

/**
 * Classify risk level based on blast radius count.
 * Pure logic function — no provider dependency.
 *
 * @param {number} blastRadius - Number of affected files
 * @returns {string} 'LOW' | 'MEDIUM' | 'HIGH'
 */
function classifyRiskLevel(blastRadius) {
  if (!blastRadius || blastRadius <= 5) return 'LOW';
  if (blastRadius <= 15) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Format a human-readable impact report for pre-push output.
 * @param {Object|null} impact - Impact analysis result from enricher.assessImpact
 * @param {string} riskLevel - Risk level classification
 * @returns {string} Formatted report string
 * @private
 */
function _formatImpactReport(impact, riskLevel) {
  if (!impact) {
    return '📊 Impact Analysis: No impact data available (code intelligence returned empty result)';
  }

  const lines = [
    '📊 Impact Analysis:',
    `   Blast Radius: ${impact.blastRadius} files affected`,
    `   Risk Level: ${riskLevel}`,
    `   Avg Complexity: ${impact.complexity ? impact.complexity.average.toFixed(1) : 'N/A'}`,
  ];

  const topFiles = (impact.references || [])
    .map((r) => r.file || r.path || 'unknown')
    .slice(0, 10);

  if (topFiles.length > 0) {
    lines.push('   Top affected files:');
    topFiles.forEach((f) => lines.push(`     - ${f}`));
  }

  if (riskLevel === 'HIGH') {
    lines.push('', `   ⚠️  HIGH RISK: ${impact.blastRadius} files affected. Confirm push?`);
  }

  return lines.join('\n');
}

module.exports = {
  assessPrePushImpact,
  generateImpactSummary,
  classifyRiskLevel,
  // Exposed for testing
  _formatImpactReport,
};
