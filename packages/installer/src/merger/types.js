/**
 * @fileoverview Type definitions for the merger module
 * @module merger/types
 */

/**
 * Result of a merge operation
 * @typedef {Object} MergeResult
 * @property {string} content - Final content after merge
 * @property {MergeStats} stats - Statistics about the merge operation
 * @property {MergeChange[]} changes - List of changes applied
 * @property {boolean} [isLegacyMigration] - True if this was a legacy file migration
 */

/**
 * Statistics about a merge operation
 * @typedef {Object} MergeStats
 * @property {number} preserved - Items preserved from original
 * @property {number} updated - Items updated with new content
 * @property {number} added - New items added
 * @property {number} conflicts - Conflicts detected (values differ)
 */

/**
 * A single change in the merge operation
 * @typedef {Object} MergeChange
 * @property {'preserved'|'updated'|'added'|'conflict'} type - Type of change
 * @property {string} identifier - Name of section/variable affected
 * @property {string} [reason] - Reason for the change
 */

/**
 * Options for merge operations
 * @typedef {Object} MergeOptions
 * @property {boolean} [preview] - If true, don't actually write changes
 * @property {boolean} [verbose] - If true, include detailed change info
 * @property {string} [projectType] - 'BROWNFIELD' | 'GREENFIELD' | 'EXISTING_AIOX'
 */

/**
 * Creates an empty MergeStats object
 * @returns {MergeStats}
 */
function createEmptyStats() {
  return {
    preserved: 0,
    updated: 0,
    added: 0,
    conflicts: 0,
  };
}

/**
 * Creates a MergeResult object
 * @param {string} content
 * @param {MergeStats} stats
 * @param {MergeChange[]} changes
 * @returns {MergeResult}
 */
function createMergeResult(content, stats, changes) {
  return {
    content,
    stats,
    changes,
  };
}

module.exports = {
  createEmptyStats,
  createMergeResult,
};
