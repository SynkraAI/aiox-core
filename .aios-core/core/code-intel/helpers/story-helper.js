'use strict';

const { getEnricher, getClient, isCodeIntelAvailable } = require('../index');

/**
 * StoryHelper — Code intelligence helper for @sm/@po agent tasks.
 *
 * All functions return null gracefully when no provider is available.
 * Never throws — safe to call unconditionally in task workflows.
 *
 * Functions:
 *   - detectDuplicateStory(description) — for @sm story creation (advisory warning)
 *   - suggestRelevantFiles(description) — for @sm story creation (file suggestions)
 *   - validateNoDuplicates(description) — for @po story validation (checklist boolean)
 */

/**
 * Detect duplicate stories/functionality in the codebase.
 * Used by @sm during story creation — returns advisory warning only, never blocks.
 *
 * @param {string} description - Story description to check for duplicates
 * @returns {Promise<{matches: Array, warning: string}|null>} Duplicate info or null
 */
async function detectDuplicateStory(description) {
  if (!description) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const enricher = getEnricher();
    const result = await enricher.detectDuplicates(description, { path: '.' });

    if (!result || !result.matches || result.matches.length === 0) return null;

    return {
      matches: result.matches,
      warning: _formatDuplicateWarning(result.matches),
    };
  } catch {
    return null;
  }
}

/**
 * Suggest relevant files for a new story based on description.
 * Composes findReferences + analyzeCodebase for comprehensive file suggestions.
 * Used by @sm during story creation to pre-populate "Suggested Files" section.
 *
 * @param {string} description - Story description to find relevant files for
 * @returns {Promise<{files: Array, codebaseContext: Object|null}|null>} File suggestions or null
 */
async function suggestRelevantFiles(description) {
  if (!description) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const client = getClient();

    // Per-capability try/catch — partial results accepted
    let files = null;
    let codebaseContext = null;

    try {
      const refs = await client.findReferences(description);
      if (refs) {
        files = refs;
      }
    } catch { /* skip — partial result ok */ }

    try {
      const analysis = await client.analyzeCodebase('.');
      if (analysis) {
        codebaseContext = analysis;
      }
    } catch { /* skip — partial result ok */ }

    // Return null only if we got nothing at all
    if (!files && !codebaseContext) return null;

    return {
      files: files || [],
      codebaseContext,
    };
  } catch {
    return null;
  }
}

/**
 * Validate that a story description does not duplicate existing functionality.
 * Used by @po during story validation — returns boolean for checklist item.
 *
 * @param {string} description - Story description to validate
 * @returns {Promise<{hasDuplicates: boolean, matches: Array, suggestion: string|null}|null>} Validation result or null
 */
async function validateNoDuplicates(description) {
  if (!description) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const enricher = getEnricher();
    const result = await enricher.detectDuplicates(description, { path: '.' });

    if (!result) {
      return {
        hasDuplicates: false,
        matches: [],
        suggestion: null,
      };
    }

    const hasDuplicates = result.matches && result.matches.length > 0;

    return {
      hasDuplicates,
      matches: result.matches || [],
      suggestion: hasDuplicates ? 'Consider ADAPT instead of CREATE — similar functionality exists' : null,
    };
  } catch {
    return null;
  }
}

/**
 * Format a human-readable warning message from duplicate matches.
 * @param {Array} matches - Array of duplicate match objects
 * @returns {string} Formatted warning message
 * @private
 */
function _formatDuplicateWarning(matches) {
  if (!matches || matches.length === 0) return '';

  const fileList = matches
    .map((m) => m.file || m.path || 'unknown')
    .slice(0, 5)
    .join(', ');

  return `Similar functionality already exists in: ${fileList}. Consider ADAPT instead of CREATE.`;
}

module.exports = {
  detectDuplicateStory,
  suggestRelevantFiles,
  validateNoDuplicates,
  // Exposed for testing
  _formatDuplicateWarning,
};
