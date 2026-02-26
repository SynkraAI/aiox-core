/**
 * Memory Bridge — MIS consumer for SYNAPSE engine.
 *
 * Connects SynapseEngine to the Memory Intelligence System (MIS)
 * via SynapseMemoryProvider. Implements bracket-aware retrieval with
 * agent-scoped sector filtering and token budget enforcement.
 *
 * Consumer-only: reads from MIS APIs, never modifies memory stores.
 * Graceful no-op when MIS module is not installed.
 *
 * @module core/synapse/memory/memory-bridge
 * @version 2.0.0
 * @created Story SYN-10 - Pro Memory Bridge (Feature-Gated MIS Consumer)
 * @migrated Story INS-4.11 - Removed pro feature gate (AC9)
 */

'use strict';

const { estimateTokens } = require('../utils/tokens');

/** Memory bridge timeout in milliseconds. */
const BRIDGE_TIMEOUT_MS = 15;

/**
 * Bracket-to-memory-layer mapping.
 *
 * FRESH   → skip (no memory needed)
 * MODERATE → Layer 1 metadata (~50 tokens)
 * DEPLETED → Layer 2 chunks (~200 tokens)
 * CRITICAL → Layer 3 full content (~1000 tokens)
 */
const BRACKET_LAYER_MAP = {
  FRESH: { layer: 0, maxTokens: 0 },
  MODERATE: { layer: 1, maxTokens: 50 },
  DEPLETED: { layer: 2, maxTokens: 200 },
  CRITICAL: { layer: 3, maxTokens: 1000 },
};

/** Default sector for unknown agents. */
const DEFAULT_SECTORS = ['semantic'];

/**
 * MemoryBridge — MIS consumer for SYNAPSE engine.
 *
 * Provides bracket-aware memory retrieval with:
 * - Agent-scoped sector filtering
 * - Token budget enforcement
 * - Session-level caching
 * - Timeout protection (<15ms)
 * - Error catch-all with warn-and-proceed
 * - Graceful no-op when MIS module is not installed
 */
class MemoryBridge {
  /**
   * @param {object} [options={}]
   * @param {number} [options.timeout=15] - Max execution time in ms
   */
  constructor(options = {}) {
    this._timeout = options.timeout || BRIDGE_TIMEOUT_MS;
    this._provider = null;
    this._initialized = false;
  }

  /**
   * Lazy-load the SynapseMemoryProvider (open-source).
   * Gracefully returns null if MIS dependencies are not available.
   *
   * @private
   * @returns {object|null} Provider instance or null
   */
  _getProvider() {
    if (this._provider) return this._provider;

    try {
      const { SynapseMemoryProvider } = require('./synapse-memory-provider');
      this._provider = new SynapseMemoryProvider();
      return this._provider;
    } catch {
      // Provider or MIS not available — graceful degradation
      return null;
    }
  }

  /**
   * Get memory hints for the current prompt context.
   *
   * Returns an array of memory hint objects suitable for injection
   * into the SYNAPSE pipeline. Gracefully returns [] when:
   * - MIS module is not installed
   * - Bracket is FRESH (no memory needed)
   * - Provider fails or times out
   * - Any error occurs
   *
   * @param {string} agentId - Active agent ID (e.g., 'dev', 'qa')
   * @param {string} bracket - Context bracket (FRESH, MODERATE, DEPLETED, CRITICAL)
   * @param {number} tokenBudget - Max tokens available for memory hints
   * @returns {Promise<Array<{content: string, source: string, relevance: number, tokens: number}>>}
   */
  async getMemoryHints(agentId, bracket, tokenBudget) {
    try {
      // 1. Bracket check — FRESH needs no memory
      const bracketConfig = BRACKET_LAYER_MAP[bracket];
      if (!bracketConfig || bracketConfig.layer === 0) {
        return [];
      }

      // 2. Calculate effective token budget
      const effectiveBudget = Math.min(
        bracketConfig.maxTokens,
        tokenBudget > 0 ? tokenBudget : bracketConfig.maxTokens,
      );

      if (effectiveBudget <= 0) {
        return [];
      }

      // 3. Load provider
      const provider = this._getProvider();
      if (!provider) {
        return [];
      }

      // 4. Execute with timeout protection
      const hints = await this._executeWithTimeout(
        () => provider.getMemories(agentId, bracket, effectiveBudget),
        this._timeout,
      );

      // 5. Enforce token budget on results
      return this._enforceTokenBudget(hints || [], effectiveBudget);
    } catch (error) {
      // Catch-all: warn and proceed with empty results
      console.warn(`[synapse:memory-bridge] Error getting memory hints: ${error.message}`);
      return [];
    }
  }

  /**
   * Execute a function with timeout protection.
   *
   * @private
   * @param {Function} fn - Async function to execute
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise<*>} Result or empty array on timeout
   */
  async _executeWithTimeout(fn, timeoutMs) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        console.warn(`[synapse:memory-bridge] Timeout after ${timeoutMs}ms`);
        resolve([]);
      }, timeoutMs);

      Promise.resolve(fn())
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          console.warn(`[synapse:memory-bridge] Provider error: ${error.message}`);
          resolve([]);
        });
    });
  }

  /**
   * Enforce token budget on hint array.
   * Removes hints from end until within budget.
   *
   * @private
   * @param {Array<{content: string, tokens: number}>} hints
   * @param {number} budget
   * @returns {Array}
   */
  _enforceTokenBudget(hints, budget) {
    if (!Array.isArray(hints) || hints.length === 0) {
      return [];
    }

    const result = [];
    let tokensUsed = 0;

    for (const hint of hints) {
      const hintTokens = hint.tokens || estimateTokens(hint.content || '');
      if (tokensUsed + hintTokens > budget) {
        break;
      }
      result.push({ ...hint, tokens: hintTokens });
      tokensUsed += hintTokens;
    }

    return result;
  }

  /**
   * Clear provider cache. Used for testing and session reset.
   */
  clearCache() {
    if (this._provider && typeof this._provider.clearCache === 'function') {
      this._provider.clearCache();
    }
  }

  /**
   * Reset internal state. Used for testing.
   *
   * @private
   */
  _reset() {
    this._provider = null;
    this._initialized = false;
  }
}

module.exports = {
  MemoryBridge,
  BRACKET_LAYER_MAP,
  BRIDGE_TIMEOUT_MS,
  DEFAULT_SECTORS,
};
