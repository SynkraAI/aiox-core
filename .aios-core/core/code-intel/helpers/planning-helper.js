'use strict';

const { getEnricher, getClient, isCodeIntelAvailable } = require('../index');

// Risk level thresholds based on blast radius (reference count)
// Consistent with dev-helper.js and qa-helper.js
const RISK_THRESHOLDS = {
  LOW_MAX: 4,       // 0-4 refs = LOW
  MEDIUM_MAX: 15,   // 5-15 refs = MEDIUM
                     // >15 refs = HIGH
};

/**
 * PlanningHelper — Code intelligence helper for @pm/@architect agent tasks.
 *
 * All functions return null gracefully when no provider is available.
 * Never throws — safe to call unconditionally in task workflows.
 */

/**
 * Get codebase overview with project description and statistics.
 * Used by brownfield-create-epic and create-doc for Codebase Intelligence section.
 *
 * @param {string} path - Path to analyze
 * @returns {Promise<{codebase: Object, stats: Object}|null>}
 */
async function getCodebaseOverview(path) {
  if (!path) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const enricher = getEnricher();
    const project = await enricher.describeProject(path);

    if (!project) return null;

    return {
      codebase: project.codebase || null,
      stats: project.stats || null,
    };
  } catch {
    return null;
  }
}

/**
 * Get dependency graph summary for a path.
 * Used by brownfield-create-epic and analyze-project-structure for dependency analysis.
 *
 * @param {string} path - Path to analyze dependencies for
 * @returns {Promise<{dependencies: Object, summary: {totalDeps: number, depth: string}}|null>}
 */
async function getDependencyGraph(path) {
  if (!path) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const client = getClient();
    const deps = await client.analyzeDependencies(path);

    if (!deps) return null;

    return {
      dependencies: deps,
      summary: _buildDependencySummary(deps),
    };
  } catch {
    return null;
  }
}

/**
 * Get complexity analysis for a set of files.
 * Used by analyze-project-structure for complexity metrics per file.
 *
 * @param {string[]} files - Files to analyze complexity for
 * @returns {Promise<{perFile: Array<{file: string, complexity: Object}>, average: number}|null>}
 */
async function getComplexityAnalysis(files) {
  if (!files || files.length === 0) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const client = getClient();
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const complexity = await client.analyzeComplexity(file);
          return {
            file,
            complexity: complexity || null,
          };
        } catch {
          return {
            file,
            complexity: null,
          };
        }
      }),
    );

    const validResults = results.filter((r) => r.complexity !== null);
    const scores = validResults
      .map((r) => r.complexity && typeof r.complexity.score === 'number' ? r.complexity.score : null)
      .filter((s) => s !== null);
    const average = scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;

    return {
      perFile: results,
      average,
    };
  } catch {
    return null;
  }
}

/**
 * Get implementation context for a set of symbols.
 * Composes findDefinition + analyzeDependencies + findTests for each symbol.
 * Used by plan-create-context for precise implementation context.
 *
 * @param {string[]} symbols - Symbol names to get context for
 * @returns {Promise<{definitions: Array, dependencies: Array, relatedTests: Array}|null>}
 */
async function getImplementationContext(symbols) {
  if (!symbols || symbols.length === 0) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const client = getClient();
    const enricher = getEnricher();

    const definitions = [];
    const dependencies = [];
    const relatedTests = [];

    await Promise.all(
      symbols.map(async (symbol) => {
        // Per-item try/catch — partial results accepted
        try {
          const def = await client.findDefinition(symbol);
          if (def) definitions.push({ symbol, ...def });
        } catch { /* skip */ }

        try {
          const deps = await client.analyzeDependencies(symbol);
          if (deps) dependencies.push({ symbol, deps });
        } catch { /* skip */ }

        try {
          const tests = await enricher.findTests(symbol);
          if (tests) relatedTests.push({ symbol, tests });
        } catch { /* skip */ }
      }),
    );

    return {
      definitions,
      dependencies,
      relatedTests,
    };
  } catch {
    return null;
  }
}

/**
 * Get implementation impact analysis for a set of files.
 * Used by plan-create-implementation for blast radius and risk assessment.
 *
 * @param {string[]} files - Files to assess impact for
 * @returns {Promise<{blastRadius: number, riskLevel: string, references: Array}|null>}
 */
async function getImplementationImpact(files) {
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
 * Build a summary from dependency analysis results.
 * @param {Object} deps - Raw dependency graph from analyzeDependencies
 * @returns {{totalDeps: number, depth: string}}
 * @private
 */
function _buildDependencySummary(deps) {
  if (!deps) return { totalDeps: 0, depth: 'none' };

  // Handle various shapes of dependency data
  let totalDeps = 0;
  if (Array.isArray(deps)) {
    totalDeps = deps.length;
  } else if (deps.dependencies && Array.isArray(deps.dependencies)) {
    totalDeps = deps.dependencies.length;
  } else if (typeof deps === 'object') {
    totalDeps = Object.keys(deps).length;
  }

  let depth = 'shallow';
  if (totalDeps > RISK_THRESHOLDS.MEDIUM_MAX) {
    depth = 'deep';
  } else if (totalDeps > RISK_THRESHOLDS.LOW_MAX) {
    depth = 'moderate';
  }

  return { totalDeps, depth };
}

/**
 * Calculate risk level from blast radius count.
 * Consistent with dev-helper.js and qa-helper.js thresholds.
 * @param {number} blastRadius - Number of references affected
 * @returns {string} 'LOW' | 'MEDIUM' | 'HIGH'
 * @private
 */
function _calculateRiskLevel(blastRadius) {
  if (blastRadius <= RISK_THRESHOLDS.LOW_MAX) return 'LOW';
  if (blastRadius <= RISK_THRESHOLDS.MEDIUM_MAX) return 'MEDIUM';
  return 'HIGH';
}

module.exports = {
  getCodebaseOverview,
  getDependencyGraph,
  getComplexityAnalysis,
  getImplementationContext,
  getImplementationImpact,
  // Exposed for testing
  _buildDependencySummary,
  _calculateRiskLevel,
  RISK_THRESHOLDS,
};
