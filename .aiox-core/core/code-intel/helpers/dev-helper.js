'use strict';

const { getEnricher, getClient, isCodeIntelAvailable } = require('../index');

// Risk level thresholds based on blast radius (reference count)
const RISK_THRESHOLDS = {
  LOW_MAX: 4,       // 0-4 refs = LOW
  MEDIUM_MAX: 15,   // 5-15 refs = MEDIUM
                     // >15 refs = HIGH
};

// Minimum references to suggest REUSE (>threshold = REUSE, <=threshold = ADAPT)
const REUSE_MIN_REFS = 2;

/**
 * DevHelper — Code intelligence helper for @dev agent tasks.
 *
 * All functions return null gracefully when no provider is available.
 * Never throws — safe to call unconditionally in task workflows.
 */

/**
 * Check for duplicates and similar code before writing a new file or function.
 * Used by IDS Gate G4 in dev-develop-story and build-autonomous tasks.
 *
 * @param {string} fileName - Name of the file/function to be created
 * @param {string} description - Description of what it does
 * @returns {Promise<{duplicates: Object, references: Array, suggestion: string}|null>}
 */
async function checkBeforeWriting(fileName, description) {
  if (!isCodeIntelAvailable()) {
    return null;
  }

  try {
    const enricher = getEnricher();
    const dupes = await enricher.detectDuplicates(description, { path: '.' });

    // Also search for the fileName as a symbol reference
    const client = getClient();
    const nameRefs = await client.findReferences(fileName);

    const hasMatches = (dupes && dupes.matches && dupes.matches.length > 0) ||
      (nameRefs && nameRefs.length > 0);

    if (!hasMatches) {
      return null;
    }

    return {
      duplicates: dupes,
      references: nameRefs || [],
      suggestion: _formatSuggestion(dupes, nameRefs),
    };
  } catch {
    return null;
  }
}

/**
 * Suggest reuse of an existing symbol instead of creating a new one.
 * Searches for definitions and references to determine REUSE vs ADAPT.
 *
 * @param {string} symbol - Symbol name to search for
 * @returns {Promise<{file: string, line: number, references: number, suggestion: string}|null>}
 */
async function suggestReuse(symbol) {
  if (!isCodeIntelAvailable()) {
    return null;
  }

  try {
    const client = getClient();
    const [definition, refs] = await Promise.all([
      client.findDefinition(symbol),
      client.findReferences(symbol),
    ]);

    if (!definition && (!refs || refs.length === 0)) {
      return null;
    }

    const refCount = refs ? refs.length : 0;
    // REUSE if widely used, ADAPT if exists but lightly used
    const suggestion = refCount > REUSE_MIN_REFS ? 'REUSE' : 'ADAPT';

    return {
      file: definition ? definition.file : (refs[0] ? refs[0].file : null),
      line: definition ? definition.line : (refs[0] ? refs[0].line : null),
      references: refCount,
      suggestion,
    };
  } catch {
    return null;
  }
}

/**
 * Get naming conventions and patterns for a given path.
 * Used to ensure new code follows existing project conventions.
 *
 * @param {string} targetPath - Path to analyze conventions for
 * @returns {Promise<{patterns: Array, stats: Object}|null>}
 */
async function getConventionsForPath(targetPath) {
  if (!isCodeIntelAvailable()) {
    return null;
  }

  try {
    const enricher = getEnricher();
    return await enricher.getConventions(targetPath);
  } catch {
    return null;
  }
}

/**
 * Assess refactoring impact with blast radius and risk level.
 * Used by dev-suggest-refactoring to show impact before changes.
 *
 * @param {string[]} files - Files to assess impact for
 * @returns {Promise<{blastRadius: number, riskLevel: string, references: Array, complexity: Object}|null>}
 */
async function assessRefactoringImpact(files) {
  if (!isCodeIntelAvailable()) {
    return null;
  }

  try {
    const enricher = getEnricher();
    const impact = await enricher.assessImpact(files);

    if (!impact) {
      return null;
    }

    return {
      blastRadius: impact.blastRadius,
      riskLevel: _calculateRiskLevel(impact.blastRadius),
      references: impact.references,
      complexity: impact.complexity,
    };
  } catch {
    return null;
  }
}

/**
 * Format a Code Intelligence Suggestion message from duplicate detection results.
 * @param {Object|null} dupes - Result from detectDuplicates
 * @param {Array|null} nameRefs - Result from findReferences
 * @returns {string} Formatted suggestion message
 * @private
 */
function _formatSuggestion(dupes, nameRefs) {
  const parts = [];

  if (dupes && dupes.matches && dupes.matches.length > 0) {
    parts.push(`Found ${dupes.matches.length} similar match(es) in codebase`);
    const firstMatch = dupes.matches[0];
    if (firstMatch.file) {
      parts.push(`Closest: ${firstMatch.file}${firstMatch.line ? ':' + firstMatch.line : ''}`);
    }
  }

  if (nameRefs && nameRefs.length > 0) {
    parts.push(`Symbol already referenced in ${nameRefs.length} location(s)`);
    const firstRef = nameRefs[0];
    if (firstRef.file) {
      parts.push(`First ref: ${firstRef.file}${firstRef.line ? ':' + firstRef.line : ''}`);
    }
  }

  parts.push('Consider REUSE or ADAPT before creating new code (IDS Article IV-A)');

  return parts.join('. ') + '.';
}

/**
 * Calculate risk level from blast radius count.
 * @param {number} blastRadius - Number of references affected
 * @returns {string} 'LOW' | 'MEDIUM' | 'HIGH'
 * @private
 */
function _calculateRiskLevel(blastRadius) {
  if (blastRadius <= RISK_THRESHOLDS.LOW_MAX) {
    return 'LOW';
  }
  if (blastRadius <= RISK_THRESHOLDS.MEDIUM_MAX) {
    return 'MEDIUM';
  }
  return 'HIGH';
}

module.exports = {
  checkBeforeWriting,
  suggestReuse,
  getConventionsForPath,
  assessRefactoringImpact,
  // Exposed for testing
  _formatSuggestion,
  _calculateRiskLevel,
  RISK_THRESHOLDS,
  REUSE_MIN_REFS,
};
