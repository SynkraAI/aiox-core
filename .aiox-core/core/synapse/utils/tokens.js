/**
 * SYNAPSE Token Utilities
 *
 * Shared token estimation used by formatter and memory bridge.
 *
 * @module core/synapse/utils/tokens
 * @version 1.0.0
 * @created Story SYN-10 - Pro Memory Bridge (extracted from formatter.js)
 */

'use strict';

/**
 * Estimate the number of tokens from a string.
 *
 * Uses the proven heuristic: tokens ~ string.length / 4
 *
 * @param {string} text - Text to estimate
 * @returns {number} Estimated token count
 */
function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

module.exports = { estimateTokens };
