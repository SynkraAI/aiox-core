/**
 * @module PatternStore
 * @description Stores and manages learned workflow patterns
 * @story WIS-5 - Pattern Capture (Internal)
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

/**
 * Default storage path for learned patterns
 * @type {string}
 */
const DEFAULT_STORAGE_PATH = path.join(__dirname, '../../..', 'data', 'learned-patterns.yaml');

/**
 * Default maximum number of patterns
 * @type {number}
 */
const DEFAULT_MAX_PATTERNS = 100;

/**
 * Default auto-prune threshold (percentage of max)
 * @type {number}
 */
const DEFAULT_PRUNE_THRESHOLD = 0.9;

/**
 * Pattern status values
 * @type {Object}
 */
const PATTERN_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  PROMOTED: 'promoted',
  DEPRECATED: 'deprecated',
};

/**
 * PatternStore class for persisting workflow patterns
 */
class PatternStore {
  /**
   * Create a PatternStore instance
   * @param {Object} options - Configuration options
   * @param {string} options.storagePath - Path to storage file
   * @param {number} options.maxPatterns - Maximum patterns to store
   * @param {number} options.pruneThreshold - Auto-prune threshold (0-1)
   * @param {string} options.pruneStrategy - Prune strategy ('oldest_low_occurrence' | 'lowest_success_rate')
   */
  constructor(options = {}) {
    this.storagePath = options.storagePath || DEFAULT_STORAGE_PATH;
    this.maxPatterns = options.maxPatterns || DEFAULT_MAX_PATTERNS;
    this.pruneThreshold = options.pruneThreshold || DEFAULT_PRUNE_THRESHOLD;
    this.pruneStrategy = options.pruneStrategy || 'oldest_low_occurrence';
    this._cache = null;
    this._cacheTime = null;
  }

  /**
   * Save a pattern to storage
   * @param {Object} pattern - Pattern to save
   * @returns {Object} Save result
   */
  save(pattern) {
    const data = this._load();

    // Ensure pattern has required fields
    const normalizedPattern = this._normalizePattern(pattern);

    // Check for existing pattern with same sequence
    const existingIndex = data.patterns.findIndex((p) =>
      this._sequenceEquals(p.sequence, normalizedPattern.sequence),
    );

    if (existingIndex >= 0) {
      // Update existing pattern
      const existing = data.patterns[existingIndex];
      existing.occurrences = (existing.occurrences || 1) + 1;
      existing.lastSeen = new Date().toISOString();

      // Update success rate (weighted average)
      const totalOccurrences = existing.occurrences;
      const newSuccessRate = normalizedPattern.successRate || 1.0;
      existing.successRate =
        (existing.successRate * (totalOccurrences - 1) + newSuccessRate) / totalOccurrences;

      data.patterns[existingIndex] = existing;

      this._save(data);
      return { action: 'updated', pattern: existing };
    }

    // Add new pattern
    data.patterns.push(normalizedPattern);

    // Check if auto-prune needed
    if (data.patterns.length > this.maxPatterns * this.pruneThreshold) {
      this._autoPrune(data);
    }

    this._save(data);
    return { action: 'created', pattern: normalizedPattern };
  }

  /**
   * Load all patterns from storage
   * @returns {Object} Loaded data with patterns array
   */
  load() {
    return this._load();
  }

  /**
   * Find patterns similar to a given sequence
   * @param {string[]} sequence - Sequence to match
   * @returns {Object[]} Matching patterns sorted by relevance
   */
  findSimilar(sequence) {
    const data = this._load();

    if (!sequence || sequence.length === 0) {
      return [];
    }

    const matches = [];

    for (const pattern of data.patterns) {
      const similarity = this._calculateSimilarity(sequence, pattern.sequence);

      if (similarity > 0.3) {
        // Minimum threshold for consideration
        matches.push({
          ...pattern,
          similarity: similarity,
        });
      }
    }

    // Sort by similarity (descending), then by occurrences
    return matches.sort((a, b) => {
      if (Math.abs(a.similarity - b.similarity) > 0.1) {
        return b.similarity - a.similarity;
      }
      return (b.occurrences || 1) - (a.occurrences || 1);
    });
  }

  /**
   * Get storage statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const data = this._load();
    const patterns = data.patterns;

    const statusCounts = {
      pending: 0,
      active: 0,
      promoted: 0,
      deprecated: 0,
    };

    let totalSuccessRate = 0;
    let totalOccurrences = 0;

    for (const pattern of patterns) {
      statusCounts[pattern.status || 'pending']++;
      totalSuccessRate += pattern.successRate || 0;
      totalOccurrences += pattern.occurrences || 1;
    }

    const avgSuccessRate = patterns.length > 0 ? totalSuccessRate / patterns.length : 0;

    return {
      totalPatterns: patterns.length,
      maxPatterns: this.maxPatterns,
      utilizationPercent: Math.round((patterns.length / this.maxPatterns) * 100),
      statusCounts: statusCounts,
      avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
      totalOccurrences: totalOccurrences,
      storageFile: this.storagePath,
      lastUpdated: data.lastUpdated || null,
    };
  }

  /**
   * Prune patterns based on configured strategy
   * @param {Object} options - Prune options
   * @param {number} options.keepCount - Number of patterns to keep
   * @param {string} options.strategy - Prune strategy override
   * @returns {Object} Prune result
   */
  prune(options = {}) {
    const data = this._load();
    const originalCount = data.patterns.length;

    const keepCount = options.keepCount || Math.floor(this.maxPatterns * 0.7);
    const strategy = options.strategy || this.pruneStrategy;

    if (data.patterns.length <= keepCount) {
      return { pruned: 0, remaining: data.patterns.length };
    }

    // Sort patterns for pruning
    let sorted;
    if (strategy === 'lowest_success_rate') {
      sorted = [...data.patterns].sort((a, b) => {
        // Keep promoted/active patterns
        if (a.status === 'promoted' || a.status === 'active') return -1;
        if (b.status === 'promoted' || b.status === 'active') return 1;
        // Then by success rate
        return (b.successRate || 0) - (a.successRate || 0);
      });
    } else {
      // oldest_low_occurrence (default)
      sorted = [...data.patterns].sort((a, b) => {
        // Keep promoted patterns
        if (a.status === 'promoted') return -1;
        if (b.status === 'promoted') return 1;
        // Keep active patterns
        if (a.status === 'active') return -1;
        if (b.status === 'active') return 1;
        // Then by occurrences (higher = keep)
        if ((a.occurrences || 1) !== (b.occurrences || 1)) {
          return (b.occurrences || 1) - (a.occurrences || 1);
        }
        // Then by last seen (newer = keep)
        return new Date(b.lastSeen || 0) - new Date(a.lastSeen || 0);
      });
    }

    // Keep top patterns
    data.patterns = sorted.slice(0, keepCount);

    this._save(data);

    return {
      pruned: originalCount - data.patterns.length,
      remaining: data.patterns.length,
    };
  }

  /**
   * Update pattern status
   * @param {string} patternId - Pattern ID
   * @param {string} newStatus - New status value
   * @returns {Object} Update result
   */
  updateStatus(patternId, newStatus) {
    const data = this._load();
    const pattern = data.patterns.find((p) => p.id === patternId);

    if (!pattern) {
      return { success: false, error: 'Pattern not found' };
    }

    const validStatuses = Object.values(PATTERN_STATUS);
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: `Invalid status: ${newStatus}` };
    }

    pattern.status = newStatus;
    pattern.lastUpdated = new Date().toISOString();

    this._save(data);

    return { success: true, pattern: pattern };
  }

  /**
   * Get patterns by status
   * @param {string} status - Status to filter by
   * @returns {Object[]} Patterns with given status
   */
  getByStatus(status) {
    const data = this._load();
    return data.patterns.filter((p) => p.status === status);
  }

  /**
   * Get active and promoted patterns (for SuggestionEngine)
   * @returns {Object[]} Active patterns
   */
  getActivePatterns() {
    const data = this._load();
    return data.patterns.filter(
      (p) => p.status === PATTERN_STATUS.ACTIVE || p.status === PATTERN_STATUS.PROMOTED,
    );
  }

  /**
   * Delete a pattern by ID
   * @param {string} patternId - Pattern ID
   * @returns {Object} Delete result
   */
  delete(patternId) {
    const data = this._load();
    const index = data.patterns.findIndex((p) => p.id === patternId);

    if (index < 0) {
      return { success: false, error: 'Pattern not found' };
    }

    data.patterns.splice(index, 1);
    this._save(data);

    return { success: true };
  }

  /**
   * Load data from storage file
   * @returns {Object} Loaded data
   * @private
   */
  _load() {
    // Use cache if valid (within 5 seconds)
    if (this._cache && this._cacheTime && Date.now() - this._cacheTime < 5000) {
      return this._cache;
    }

    try {
      if (fs.existsSync(this.storagePath)) {
        const content = fs.readFileSync(this.storagePath, 'utf8');
        const data = yaml.load(content) || {};
        data.patterns = data.patterns || [];
        this._cache = data;
        this._cacheTime = Date.now();
        return data;
      }
    } catch (error) {
      console.warn('[PatternStore] Failed to load:', error.message);
    }

    // Return empty structure
    const empty = { version: '1.0', patterns: [] };
    this._cache = empty;
    this._cacheTime = Date.now();
    return empty;
  }

  /**
   * Save data to storage file
   * @param {Object} data - Data to save
   * @private
   */
  _save(data) {
    try {
      data.lastUpdated = new Date().toISOString();

      // Sort patterns for git-friendly diffs
      data.patterns.sort((a, b) => a.id.localeCompare(b.id));

      // Ensure directory exists
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const content = yaml.dump(data, { indent: 2, lineWidth: 120 });
      fs.writeFileSync(this.storagePath, content, 'utf8');

      // Invalidate cache
      this._cache = data;
      this._cacheTime = Date.now();
    } catch (error) {
      console.error('[PatternStore] Failed to save:', error.message);
      throw error;
    }
  }

  /**
   * Normalize pattern object
   * @param {Object} pattern - Pattern to normalize
   * @returns {Object} Normalized pattern
   * @private
   */
  _normalizePattern(pattern) {
    return {
      id: pattern.id || crypto.randomUUID(),
      sequence: pattern.sequence || [],
      agents: pattern.agents || [],
      occurrences: pattern.occurrences || 1,
      successRate: pattern.successRate || 1.0,
      firstSeen: pattern.firstSeen || new Date().toISOString(),
      lastSeen: pattern.lastSeen || new Date().toISOString(),
      workflow: pattern.workflow || null,
      status: pattern.status || PATTERN_STATUS.PENDING,
    };
  }

  /**
   * Check if two sequences are equal
   * @param {string[]} seq1 - First sequence
   * @param {string[]} seq2 - Second sequence
   * @returns {boolean} True if equal
   * @private
   */
  _sequenceEquals(seq1, seq2) {
    if (!seq1 || !seq2 || seq1.length !== seq2.length) {
      return false;
    }
    return seq1.every((cmd, i) => cmd === seq2[i]);
  }

  /**
   * Calculate similarity between sequences
   * @param {string[]} seq1 - First sequence
   * @param {string[]} seq2 - Second sequence
   * @returns {number} Similarity score (0-1)
   * @private
   */
  _calculateSimilarity(seq1, seq2) {
    if (!seq1 || !seq2) return 0;

    // Check for subsequence match
    const joined1 = seq1.join('|');
    const joined2 = seq2.join('|');

    if (joined2.includes(joined1) || joined1.includes(joined2)) {
      return 0.9;
    }

    // Check for partial overlap
    let matches = 0;
    for (const cmd of seq1) {
      if (seq2.includes(cmd)) {
        matches++;
      }
    }

    return matches / Math.max(seq1.length, seq2.length);
  }

  /**
   * Auto-prune when approaching limit
   * @param {Object} data - Data object
   * @private
   */
  _autoPrune(data) {
    const keepCount = Math.floor(this.maxPatterns * 0.8);

    // Sort by priority (keep promoted > active > pending)
    // Then by occurrences, then by last seen
    data.patterns.sort((a, b) => {
      // Status priority
      const statusPriority = { promoted: 3, active: 2, pending: 1, deprecated: 0 };
      const aPriority = statusPriority[a.status] || 0;
      const bPriority = statusPriority[b.status] || 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      // Then by occurrences
      if ((a.occurrences || 1) !== (b.occurrences || 1)) {
        return (b.occurrences || 1) - (a.occurrences || 1);
      }

      // Then by last seen
      return new Date(b.lastSeen || 0) - new Date(a.lastSeen || 0);
    });

    data.patterns = data.patterns.slice(0, keepCount);
  }

  /**
   * Invalidate cache
   */
  invalidateCache() {
    this._cache = null;
    this._cacheTime = null;
  }
}

/**
 * Create a new PatternStore instance
 * @param {Object} options - Configuration options
 * @returns {PatternStore} New instance
 */
function createPatternStore(options = {}) {
  return new PatternStore(options);
}

module.exports = {
  PatternStore,
  createPatternStore,
  DEFAULT_STORAGE_PATH,
  DEFAULT_MAX_PATTERNS,
  DEFAULT_PRUNE_THRESHOLD,
  PATTERN_STATUS,
};
