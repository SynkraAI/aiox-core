/**
 * @fileoverview Merge strategy for YAML config files (Phase 1)
 *
 * Phase 1 rules (target/user always wins):
 * - New keys in source (not in target) → added to target
 * - Keys in both with same value → preserved
 * - Keys in both with different values → target wins (conflict logged)
 * - Keys in target but not source → kept (deprecated warning)
 *
 * @module merger/strategies/yaml-merger
 * @story INS-4.7
 */

'use strict';

const yaml = require('js-yaml');
const { BaseMerger } = require('./base-merger.js');
const { createMergeResult, createEmptyStats } = require('../types.js');

/**
 * Merge strategy for YAML configuration files.
 * Implements Phase 1: add new keys + preserve user values + warn conflicts.
 * @extends BaseMerger
 */
class YamlMerger extends BaseMerger {
  name = 'yaml';

  /**
   * Can merge if both contents are valid YAML
   * @param {string} existingContent - Existing YAML content
   * @param {string} newContent - New YAML content
   * @returns {boolean} True if both are parseable YAML
   */
  canMerge(existingContent, newContent) {
    try {
      yaml.load(existingContent);
      yaml.load(newContent);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Merge source (framework) YAML with target (user) YAML.
   * Target/user values always win on conflict (Phase 1).
   *
   * @param {string} sourceContent - Framework YAML content
   * @param {string} targetContent - User YAML content
   * @param {import('../types.js').MergeOptions} [options] - Merge options
   * @returns {Promise<import('../types.js').MergeResult>} Merge result
   */
  async merge(sourceContent, targetContent, _options = {}) {
    const source = yaml.load(sourceContent) || {};
    const target = yaml.load(targetContent) || {};
    const stats = createEmptyStats();
    const changes = [];

    const merged = this._deepMergeTargetWins(source, target, '', stats, changes);

    // Detect deprecated keys (in target but not in source) at top level
    this._detectDeprecated(source, target, '', stats, changes);

    const content = yaml.dump(merged, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    });

    return createMergeResult(content, stats, changes);
  }

  /**
   * Deep merge where target (user) values always win.
   * New keys from source are added; existing keys preserved.
   *
   * @param {Object} source - Framework config
   * @param {Object} target - User config
   * @param {string} prefix - Key path prefix for change tracking
   * @param {import('../types.js').MergeStats} stats - Stats accumulator
   * @param {import('../types.js').MergeChange[]} changes - Changes accumulator
   * @returns {Object} Merged object
   * @private
   */
  _deepMergeTargetWins(source, target, prefix, stats, changes) {
    const result = { ...target };

    for (const key of Object.keys(source)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (!(key in target)) {
        // New key from source — add it
        result[key] = source[key];
        stats.added++;
        changes.push({
          type: 'added',
          identifier: fullKey,
          reason: 'New key from framework',
        });
      } else if (
        this._isPlainObject(source[key]) &&
        this._isPlainObject(target[key])
      ) {
        // Both are objects — recurse
        result[key] = this._deepMergeTargetWins(
          source[key], target[key], fullKey, stats, changes,
        );
      } else if (JSON.stringify(target[key]) !== JSON.stringify(source[key])) {
        // Conflict: different values — target (user) wins
        stats.conflicts++;
        changes.push({
          type: 'conflict',
          identifier: fullKey,
          reason: 'Keeping user value',
        });
      } else {
        // Same value — preserved
        stats.preserved++;
        changes.push({
          type: 'preserved',
          identifier: fullKey,
        });
      }
    }

    return result;
  }

  /**
   * Detect deprecated keys (in target but not in source) recursively.
   *
   * @param {Object} source - Framework config
   * @param {Object} target - User config
   * @param {string} prefix - Key path prefix
   * @param {import('../types.js').MergeStats} stats - Stats accumulator
   * @param {import('../types.js').MergeChange[]} changes - Changes accumulator
   * @private
   */
  _detectDeprecated(source, target, prefix, stats, changes) {
    for (const key of Object.keys(target)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (!(key in source)) {
        stats.conflicts++;
        changes.push({
          type: 'conflict',
          identifier: fullKey,
          reason: 'Deprecated key — may be removed in future version',
        });
      } else if (
        this._isPlainObject(source[key]) &&
        this._isPlainObject(target[key])
      ) {
        this._detectDeprecated(source[key], target[key], fullKey, stats, changes);
      }
    }
  }

  /**
   * Check if value is a plain object (not array, null, etc.)
   * @param {*} value - Value to check
   * @returns {boolean}
   * @private
   */
  _isPlainObject(value) {
    if (value === null || typeof value !== 'object') return false;
    if (Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  /**
   * @returns {string} Description of this strategy
   */
  getDescription() {
    return 'Merges YAML config files by adding new keys while preserving user values (Phase 1)';
  }
}

module.exports = { YamlMerger };
