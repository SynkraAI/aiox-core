/**
 * @fileoverview Merge strategy for .env files
 * @module merger/strategies/env-merger
 */

const { BaseMerger } = require('./base-merger.js');
const { createMergeResult, createEmptyStats } = require('../types.js');
const { parseEnvFile } = require('../parsers/env-parser.js');

/**
 * Merge strategy for .env files.
 * Preserves existing variables and adds new ones from the template.
 * @extends BaseMerger
 */
class EnvMerger extends BaseMerger {
  name = 'env';

  /**
   * Can always merge .env files
   * @returns {boolean} Always true
   */
  canMerge() {
    return true;
  }

  /**
   * Merge existing .env with template, preserving existing values
   * @param {string} existingContent - Existing .env content
   * @param {string} newContent - Template .env content
   * @param {import('../types.js').MergeOptions} [options] - Merge options
   * @returns {Promise<import('../types.js').MergeResult>} Merge result
   */
  async merge(existingContent, newContent, _options = {}) {
    const existing = parseEnvFile(existingContent);
    const template = parseEnvFile(newContent);

    const stats = createEmptyStats();
    const changes = [];
    const newVars = [];
    const suggestions = [];

    // Find variables to add from template
    for (const [key, templateVar] of template.variables) {
      if (!existing.variables.has(key)) {
        // New variable - will be added
        newVars.push({
          key,
          value: templateVar.value,
          comment: templateVar.comment,
        });
        changes.push({
          type: 'added',
          identifier: key,
        });
        stats.added++;
      } else {
        // Variable exists - check if value differs
        const existingVar = existing.variables.get(key);
        if (existingVar.value !== templateVar.value) {
          // Different value - preserve existing, suggest new
          suggestions.push({
            key,
            currentValue: existingVar.value,
            suggestedValue: templateVar.value,
          });
          changes.push({
            type: 'preserved',
            identifier: key,
            reason: 'existing value kept, different from template',
          });
          stats.conflicts++;
        } else {
          // Same value - just preserve
          changes.push({
            type: 'preserved',
            identifier: key,
          });
        }
        stats.preserved++;
      }
    }

    // Count preserved variables not in template
    for (const [key] of existing.variables) {
      if (!template.variables.has(key)) {
        changes.push({
          type: 'preserved',
          identifier: key,
          reason: 'user variable (not in template)',
        });
        stats.preserved++;
      }
    }

    // Build merged content
    let merged = existingContent;

    // Ensure trailing newline
    if (merged && !merged.endsWith('\n')) {
      merged += '\n';
    }

    // Add AIOX section if there are new vars or suggestions
    if (newVars.length > 0 || suggestions.length > 0) {
      const date = new Date().toISOString().split('T')[0];
      merged += `\n# === AIOX Variables (added ${date}) ===\n`;

      // Add new variables
      for (const { key, value, comment } of newVars) {
        if (comment && !comment.includes('AIOX')) {
          // Add original comment if it's not an AIOX header
          merged += `${comment}\n`;
        }
        merged += `${key}=${value}\n`;
      }

      // Add suggestions for variables with different values
      if (suggestions.length > 0) {
        merged += '\n# AIOX_NOTE: The following variables already exist with different values:\n';
        for (const { key, suggestedValue } of suggestions) {
          merged += `# AIOX_SUGGESTED: ${key}=${suggestedValue}\n`;
        }
      }
    }

    return createMergeResult(merged, stats, changes);
  }

  /**
   * @returns {string} Description of this strategy
   */
  getDescription() {
    return 'Merges .env files by adding new variables while preserving existing values';
  }
}

module.exports = { EnvMerger };
