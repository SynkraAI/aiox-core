'use strict';

const { getEnricher, getClient, isCodeIntelAvailable } = require('../index');

// Risk level thresholds based on blast radius (reference count)
// Consistent with dev-helper.js
const RISK_THRESHOLDS = {
  LOW_MAX: 4,       // 0-4 refs = LOW
  MEDIUM_MAX: 15,   // 5-15 refs = MEDIUM
                     // >15 refs = HIGH
};

// Coverage status thresholds based on test reference count
const COVERAGE_THRESHOLDS = {
  INDIRECT_MAX: 2,  // 1-2 test refs = INDIRECT
  MINIMAL_MAX: 5,   // 3-5 test refs = MINIMAL
                     // >5 test refs = GOOD
};

/**
 * QaHelper — Code intelligence helper for @qa agent tasks.
 *
 * All functions return null gracefully when no provider is available.
 * Never throws — safe to call unconditionally in task workflows.
 */

/**
 * Get blast radius and risk level for a set of files.
 * Used by qa-gate to assess impact of changes in gate decisions.
 *
 * @param {string[]} files - Files to assess blast radius for
 * @returns {Promise<{blastRadius: number, riskLevel: string, references: Array}|null>}
 */
async function getBlastRadius(files) {
  if (!files || files.length === 0) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const enricher = getEnricher();
    const impact = await enricher.assessImpact(files);

    if (!impact) return null;

    return {
      blastRadius: impact.blastRadius,
      riskLevel: _calculateRiskLevel(impact.blastRadius),
      references: impact.references || [],
    };
  } catch {
    return null;
  }
}

/**
 * Get test coverage status for a list of symbols.
 * Used by qa-gate to assess test coverage per modified function.
 *
 * @param {string[]} symbols - Symbol names to check test coverage for
 * @returns {Promise<Array<{symbol: string, status: string, testCount: number, tests: Array}>|null>}
 */
async function getTestCoverage(symbols) {
  if (!symbols || symbols.length === 0) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const enricher = getEnricher();
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const tests = await enricher.findTests(symbol);
          const testCount = tests ? tests.length : 0;
          return {
            symbol,
            status: _calculateCoverageStatus(testCount),
            testCount,
            tests: tests || [],
          };
        } catch {
          return {
            symbol,
            status: 'NO_TESTS',
            testCount: 0,
            tests: [],
          };
        }
      }),
    );

    return results;
  } catch {
    return null;
  }
}

/**
 * Get reference impact for a set of files — which consumers are affected.
 * Used by qa-review-story to show consumers affected by each change.
 *
 * @param {string[]} files - Files to check reference impact for
 * @returns {Promise<Array<{file: string, consumers: Array}>|null>}
 */
async function getReferenceImpact(files) {
  if (!files || files.length === 0) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const client = getClient();
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const refs = await client.findReferences(file);
          return {
            file,
            consumers: refs || [],
          };
        } catch {
          return {
            file,
            consumers: [],
          };
        }
      }),
    );

    return results;
  } catch {
    return null;
  }
}

/**
 * Suggest gate influence based on blast radius risk level.
 * Returns advisory message when HIGH risk detected — never changes verdict automatically.
 *
 * @param {string} riskLevel - Risk level from getBlastRadius ('LOW'|'MEDIUM'|'HIGH')
 * @returns {{advisory: string, suggestedGate: string}|null}
 */
function suggestGateInfluence(riskLevel) {
  if (!riskLevel) return null;

  if (riskLevel === 'HIGH') {
    return {
      advisory: 'HIGH blast radius detected. Consider CONCERNS gate with additional review recommended.',
      suggestedGate: 'CONCERNS',
    };
  }

  return null;
}

/**
 * Calculate risk level from blast radius count.
 * Consistent with dev-helper.js thresholds.
 * @param {number} blastRadius - Number of references affected
 * @returns {string} 'LOW' | 'MEDIUM' | 'HIGH'
 * @private
 */
function _calculateRiskLevel(blastRadius) {
  if (blastRadius <= RISK_THRESHOLDS.LOW_MAX) return 'LOW';
  if (blastRadius <= RISK_THRESHOLDS.MEDIUM_MAX) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Calculate coverage status from test reference count.
 * @param {number} testCount - Number of test references found
 * @returns {string} 'NO_TESTS' | 'INDIRECT' | 'MINIMAL' | 'GOOD'
 * @private
 */
function _calculateCoverageStatus(testCount) {
  if (testCount === 0) return 'NO_TESTS';
  if (testCount <= COVERAGE_THRESHOLDS.INDIRECT_MAX) return 'INDIRECT';
  if (testCount <= COVERAGE_THRESHOLDS.MINIMAL_MAX) return 'MINIMAL';
  return 'GOOD';
}

module.exports = {
  getBlastRadius,
  getTestCoverage,
  getReferenceImpact,
  suggestGateInfluence,
  // Exposed for testing
  _calculateRiskLevel,
  _calculateCoverageStatus,
  RISK_THRESHOLDS,
  COVERAGE_THRESHOLDS,
};
