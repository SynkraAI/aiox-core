/**
 * Semantic Pattern Search - Story 12.7
 *
 * Find patterns by semantic similarity, not just exact string matches.
 * Merges exact, semantic, and subsequence matches with confidence scoring.
 *
 * @module semantic-search
 * @version 1.0.0
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  // Match weights
  exactMatchWeight: 1.0,
  semanticMatchWeight: 0.7,
  subsequenceMatchWeight: 0.5,
  fuzzyMatchWeight: 0.3,

  // Thresholds
  minSimilarityScore: 0.3,
  maxResults: 10,

  // Performance
  maxQueryLength: 100,
  cacheEnabled: true,
  cacheTTL: 60000, // 1 minute

  // Synonym groups for semantic matching
  synonymGroups: [
    ['create', 'make', 'generate', 'add', 'new'],
    ['delete', 'remove', 'destroy', 'drop'],
    ['update', 'modify', 'change', 'edit', 'alter'],
    ['get', 'fetch', 'retrieve', 'load', 'read'],
    ['list', 'show', 'display', 'view'],
    ['test', 'verify', 'check', 'validate'],
    ['build', 'compile', 'bundle', 'package'],
    ['deploy', 'publish', 'release', 'ship'],
    ['fix', 'repair', 'resolve', 'patch'],
    ['review', 'inspect', 'audit', 'examine'],
    ['story', 'task', 'ticket', 'issue'],
    ['dev', 'develop', 'development', 'implement'],
    ['qa', 'quality', 'testing'],
    ['start', 'begin', 'init', 'initialize'],
    ['end', 'finish', 'complete', 'done'],
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              SEMANTIC SEARCH ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════

class SemanticSearch {
  /**
   * Create a new SemanticSearch instance
   *
   * @param {Object} options - Configuration options
   * @param {Object} [options.config] - Config overrides
   */
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this._synonymIndex = this._buildSynonymIndex();
    this._cache = new Map();
    this._lastCacheClean = Date.now();
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              SEARCH
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Search patterns by semantic similarity
   *
   * @param {string} query - Search query
   * @param {Object[]} patterns - Patterns to search
   * @param {Object} options - Search options
   * @returns {Object[]} Matched patterns with scores
   */
  search(query, patterns, options = {}) {
    if (!query || !patterns || patterns.length === 0) {
      return [];
    }

    const startTime = Date.now();

    // Normalize query
    const normalizedQuery = this._normalize(query);
    if (normalizedQuery.length === 0) {
      return [];
    }

    // Check cache
    const cacheKey = this._getCacheKey(normalizedQuery, patterns.length);
    if (this.config.cacheEnabled) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Score all patterns
    const scored = patterns
      .map((pattern) => {
        const score = this._scorePattern(normalizedQuery, pattern);
        return { pattern, score };
      })
      .filter((item) => item.score >= this.config.minSimilarityScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, options.maxResults || this.config.maxResults);

    // Add metadata
    const results = scored.map((item) => ({
      ...item.pattern,
      _searchScore: item.score,
      _searchMethod: this._determineMatchMethod(item.score),
    }));

    // Cache results
    if (this.config.cacheEnabled) {
      this._setCache(cacheKey, results);
    }

    // Performance check
    const elapsed = Date.now() - startTime;
    if (elapsed > 100) {
      console.warn(`SemanticSearch: Query took ${elapsed}ms (target <100ms)`);
    }

    return results;
  }

  /**
   * Find similar patterns to a given pattern
   *
   * @param {Object} pattern - Reference pattern
   * @param {Object[]} patterns - Patterns to compare
   * @param {Object} options - Search options
   * @returns {Object[]} Similar patterns
   */
  findSimilar(pattern, patterns, options = {}) {
    if (!pattern || !patterns) {
      return [];
    }

    // Build query from pattern
    const queryParts = [];

    if (pattern.name) queryParts.push(pattern.name);
    if (pattern.workflow) queryParts.push(pattern.workflow);
    if (pattern.sequence) queryParts.push(...pattern.sequence);
    if (pattern.commands) queryParts.push(...pattern.commands);

    const query = queryParts.join(' ');

    // Exclude the reference pattern
    const candidatePatterns = patterns.filter((p) => p.id !== pattern.id);

    return this.search(query, candidatePatterns, options);
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              SCORING
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Score a pattern against a query
   * @private
   */
  _scorePattern(query, pattern) {
    const scores = [];

    // Get searchable text from pattern
    const patternText = this._getPatternText(pattern);
    const normalizedPattern = this._normalize(patternText);

    // 1. Exact match
    const exactScore = this._exactMatch(query, normalizedPattern);
    if (exactScore > 0) {
      scores.push(exactScore * this.config.exactMatchWeight);
    }

    // 2. Semantic match (synonym-based)
    const semanticScore = this._semanticMatch(query, normalizedPattern);
    if (semanticScore > 0) {
      scores.push(semanticScore * this.config.semanticMatchWeight);
    }

    // 3. Subsequence match
    const subsequenceScore = this._subsequenceMatch(query, normalizedPattern);
    if (subsequenceScore > 0) {
      scores.push(subsequenceScore * this.config.subsequenceMatchWeight);
    }

    // 4. Fuzzy match (Levenshtein-based)
    const fuzzyScore = this._fuzzyMatch(query, normalizedPattern);
    if (fuzzyScore > 0) {
      scores.push(fuzzyScore * this.config.fuzzyMatchWeight);
    }

    // Return best score (not sum, to avoid over-counting)
    return scores.length > 0 ? Math.max(...scores) : 0;
  }

  /**
   * Exact substring match
   * @private
   */
  _exactMatch(query, text) {
    if (text.includes(query)) {
      return 1.0;
    }

    // Check word-level exact match
    const queryWords = query.split(/\s+/);
    const textWords = text.split(/\s+/);

    const matchedWords = queryWords.filter((qw) => textWords.includes(qw));
    return matchedWords.length / queryWords.length;
  }

  /**
   * Semantic match using synonyms
   * @private
   */
  _semanticMatch(query, text) {
    const queryWords = query.split(/\s+/);
    const textWords = text.split(/\s+/);

    let matchCount = 0;

    for (const qw of queryWords) {
      // Direct match
      if (textWords.includes(qw)) {
        matchCount++;
        continue;
      }

      // Synonym match
      const synonyms = this._getSynonyms(qw);
      if (synonyms.some((syn) => textWords.includes(syn))) {
        matchCount += 0.8; // Slightly lower weight for synonym match
      }
    }

    return matchCount / queryWords.length;
  }

  /**
   * Subsequence match (words appear in order, not necessarily adjacent)
   * @private
   */
  _subsequenceMatch(query, text) {
    const queryWords = query.split(/\s+/);
    const textWords = text.split(/\s+/);

    let queryIndex = 0;
    let matchCount = 0;

    for (const tw of textWords) {
      if (queryIndex < queryWords.length && tw === queryWords[queryIndex]) {
        matchCount++;
        queryIndex++;
      }
    }

    return matchCount / queryWords.length;
  }

  /**
   * Fuzzy match using Levenshtein distance
   * @private
   */
  _fuzzyMatch(query, text) {
    const queryWords = query.split(/\s+/);
    const textWords = text.split(/\s+/);

    let totalSimilarity = 0;

    for (const qw of queryWords) {
      let bestSimilarity = 0;

      for (const tw of textWords) {
        const distance = this._levenshteinDistance(qw, tw);
        const maxLen = Math.max(qw.length, tw.length);
        const similarity = 1 - distance / maxLen;

        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
        }
      }

      totalSimilarity += bestSimilarity;
    }

    return totalSimilarity / queryWords.length;
  }

  /**
   * Calculate Levenshtein distance
   * @private
   */
  _levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              HELPERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Normalize text for comparison
   * @private
   */
  _normalize(text) {
    if (!text) return '';

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, this.config.maxQueryLength);
  }

  /**
   * Get searchable text from pattern
   * @private
   */
  _getPatternText(pattern) {
    const parts = [];

    if (pattern.name) parts.push(pattern.name);
    if (pattern.id) parts.push(pattern.id);
    if (pattern.workflow) parts.push(pattern.workflow);
    if (pattern.description) parts.push(pattern.description);
    if (pattern.sequence) parts.push(pattern.sequence.join(' '));
    if (pattern.commands) parts.push(pattern.commands.join(' '));
    if (pattern.agents) parts.push(pattern.agents.join(' '));
    if (pattern.keywords) parts.push(pattern.keywords.join(' '));

    return parts.join(' ');
  }

  /**
   * Build synonym index for fast lookup
   * @private
   */
  _buildSynonymIndex() {
    const index = new Map();

    for (const group of this.config.synonymGroups) {
      for (const word of group) {
        const synonyms = group.filter((w) => w !== word);
        index.set(word, synonyms);
      }
    }

    return index;
  }

  /**
   * Get synonyms for a word
   * @private
   */
  _getSynonyms(word) {
    return this._synonymIndex.get(word) || [];
  }

  /**
   * Determine match method from score
   * @private
   */
  _determineMatchMethod(score) {
    if (score >= 0.9) return 'exact';
    if (score >= 0.6) return 'semantic';
    if (score >= 0.4) return 'subsequence';
    return 'fuzzy';
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              CACHE
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Get cache key
   * @private
   */
  _getCacheKey(query, patternCount) {
    return `${query}:${patternCount}`;
  }

  /**
   * Get from cache
   * @private
   */
  _getFromCache(key) {
    this._cleanCache();

    const entry = this._cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.config.cacheTTL) {
      return entry.results;
    }

    return null;
  }

  /**
   * Set cache entry
   * @private
   */
  _setCache(key, results) {
    this._cache.set(key, {
      results,
      timestamp: Date.now(),
    });
  }

  /**
   * Clean expired cache entries
   * @private
   */
  _cleanCache() {
    const now = Date.now();

    // Only clean every 30 seconds
    if (now - this._lastCacheClean < 30000) {
      return;
    }

    this._lastCacheClean = now;

    for (const [key, entry] of this._cache.entries()) {
      if (now - entry.timestamp >= this.config.cacheTTL) {
        this._cache.delete(key);
      }
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this._cache.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              STATISTICS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Get search statistics
   *
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      cacheSize: this._cache.size,
      synonymGroups: this.config.synonymGroups.length,
      synonymCount: this._synonymIndex.size,
      config: {
        minSimilarityScore: this.config.minSimilarityScore,
        maxResults: this.config.maxResults,
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Create a new SemanticSearch instance
 *
 * @param {Object} options - Options
 * @returns {SemanticSearch} New instance
 */
function createSemanticSearch(options = {}) {
  return new SemanticSearch(options);
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  SemanticSearch,
  createSemanticSearch,
  DEFAULT_CONFIG,
};
