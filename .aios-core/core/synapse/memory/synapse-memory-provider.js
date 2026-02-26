/**
 * Synapse Memory Provider — MIS retrieval for SYNAPSE engine.
 *
 * Implements the provider interface consumed by MemoryBridge.
 * Open-source: no feature gate required.
 *
 * Responsibilities:
 * - Agent-scoped memory retrieval using AGENT_SECTOR_PREFERENCES
 * - Progressive disclosure layer selection based on bracket
 * - Session-level caching (keyed by agentId-bracket)
 * - Token budget respect
 *
 * @module core/synapse/memory/synapse-memory-provider
 * @version 2.0.0
 * @created Story SYN-10 - Pro Memory Bridge (Feature-Gated MIS Consumer)
 * @migrated Story INS-4.11 - Moved from pro/ to open-source (AC9)
 */

'use strict';

const { estimateTokens } = require('../utils/tokens');

/** Default sectors for unknown agents. */
const DEFAULT_SECTORS = ['semantic'];

/**
 * Agent sector preferences for memory retrieval.
 * Defines which cognitive sectors each agent prefers.
 *
 * Moved from pro/memory/memory-loader.js to open-source.
 */
const AGENT_SECTOR_PREFERENCES = {
  dev: ['procedural', 'semantic'],
  qa: ['reflective', 'episodic'],
  architect: ['semantic', 'reflective'],
  pm: ['episodic', 'semantic'],
  po: ['episodic', 'semantic'],
  sm: ['procedural', 'episodic'],
  devops: ['procedural', 'episodic'],
  analyst: ['semantic', 'reflective'],
  'data-engineer': ['procedural', 'semantic'],
  'ux-design-expert': ['reflective', 'procedural'],
};

/**
 * Bracket → retrieval configuration.
 */
const BRACKET_CONFIG = {
  MODERATE: { layer: 1, limit: 3, minRelevance: 0.7 },
  DEPLETED: { layer: 2, limit: 5, minRelevance: 0.5 },
  CRITICAL: { layer: 3, limit: 10, minRelevance: 0.3 },
};

/**
 * SynapseMemoryProvider — Open-source memory retrieval.
 *
 * Provides memories from MIS for SYNAPSE engine injection.
 * Session-level caching avoids repeated MIS queries for
 * the same agent + bracket combination.
 *
 * Uses lazy-loading for MemoryLoader to gracefully degrade
 * when the MIS module is not installed.
 */
class SynapseMemoryProvider {
  /**
   * @param {object} [options={}]
   * @param {string} [options.projectDir] - Project directory for MemoryLoader
   */
  constructor(options = {}) {
    this._projectDir = options.projectDir || process.cwd();
    this._loader = null;
    /** @type {Map<string, Array>} Session-level cache keyed by `${agentId}-${bracket}` */
    this._cache = new Map();
  }

  /**
   * Lazy-load MemoryLoader.
   * Gracefully returns null if pro/memory module is not available.
   *
   * @private
   * @returns {object|null}
   */
  _getLoader() {
    if (this._loader) return this._loader;

    try {
      const { MemoryLoader } = require('../../../../pro/memory/memory-loader');
      this._loader = new MemoryLoader(this._projectDir);
      return this._loader;
    } catch {
      // MIS module not available — graceful degradation
      return null;
    }
  }

  /**
   * Get memories for SYNAPSE engine injection.
   *
   * Uses bracket to determine:
   * - Which MIS layer to query (1=metadata, 2=chunks, 3=full)
   * - How many results to return
   * - Minimum relevance threshold
   *
   * Results are cached per session (agentId + bracket).
   *
   * @param {string} agentId - Active agent ID
   * @param {string} bracket - Context bracket (MODERATE, DEPLETED, CRITICAL)
   * @param {number} tokenBudget - Max tokens for memory hints
   * @returns {Promise<Array<{content: string, source: string, relevance: number, tokens: number}>>}
   */
  async getMemories(agentId, bracket, tokenBudget) {
    // Cache lookup
    const cacheKey = `${agentId}-${bracket}`;
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }

    // Get bracket config
    const config = BRACKET_CONFIG[bracket];
    if (!config) {
      return [];
    }

    // Get loader (lazy-load, graceful if unavailable)
    const loader = this._getLoader();
    if (!loader) {
      return [];
    }

    // Get agent sectors
    const sectors = AGENT_SECTOR_PREFERENCES[agentId] || DEFAULT_SECTORS;

    // Query MIS via MemoryLoader
    const memories = await loader.queryMemories(agentId, {
      sectors,
      layer: config.layer,
      limit: config.limit,
      minRelevance: config.minRelevance,
      tokenBudget,
    });

    // Transform to hint format
    const hints = this._transformToHints(memories, tokenBudget);

    // Cache results
    this._cache.set(cacheKey, hints);

    return hints;
  }

  /**
   * Transform MIS memory results into hint format.
   *
   * @private
   * @param {Array} memories - Raw memories from MemoryLoader
   * @param {number} tokenBudget - Max tokens
   * @returns {Array<{content: string, source: string, relevance: number, tokens: number}>}
   */
  _transformToHints(memories, tokenBudget) {
    if (!Array.isArray(memories) || memories.length === 0) {
      return [];
    }

    const hints = [];
    let tokensUsed = 0;

    for (const memory of memories) {
      const content = memory.content || memory.summary || memory.title || '';
      const tokens = estimateTokens(content);

      if (tokensUsed + tokens > tokenBudget) {
        break;
      }

      hints.push({
        content,
        source: memory.source || memory.sector || 'memory',
        relevance: memory.relevance || memory.attention || 0,
        tokens,
      });

      tokensUsed += tokens;
    }

    return hints;
  }

  /**
   * Clear the session cache.
   */
  clearCache() {
    this._cache.clear();
  }
}

module.exports = {
  SynapseMemoryProvider,
  AGENT_SECTOR_PREFERENCES,
  BRACKET_CONFIG,
  DEFAULT_SECTORS,
};
