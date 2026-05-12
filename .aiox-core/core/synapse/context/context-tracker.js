/**
 * SYNAPSE Context Bracket Tracker
 *
 * Calculates the current context bracket (FRESH/MODERATE/DEPLETED/CRITICAL)
 * based on estimated token usage. Provides token budgets and layer filtering
 * per bracket for the SynapseEngine orchestrator.
 *
 * Pure arithmetic module — zero I/O, zero external dependencies.
 *
 * @module core/synapse/context/context-tracker
 * @version 1.0.0
 * @created Story SYN-3 - Context Bracket Tracker
 */

/**
 * Bracket definitions with thresholds and token budgets.
 *
 * Thresholds represent the percentage of context remaining:
 * - FRESH: 60-100% remaining (lean injection)
 * - MODERATE: 40-60% remaining (standard injection)
 * - DEPLETED: 25-40% remaining (reinforcement injection)
 * - CRITICAL: 0-25% remaining (warning + handoff prep)
 *
 * @type {Object.<string, {min: number, max: number, tokenBudget: number}>}
 */
const BRACKETS = {
  FRESH:    { min: 60, max: 100, tokenBudget: 800 },
  MODERATE: { min: 40, max: 60,  tokenBudget: 1500 },
  DEPLETED: { min: 25, max: 40,  tokenBudget: 2000 },
  CRITICAL: { min: 0,  max: 25,  tokenBudget: 2500 },
};

/**
 * Token budget constants per bracket (shorthand access).
 *
 * @type {Object.<string, number>}
 */
const TOKEN_BUDGETS = {
  FRESH: 800,
  MODERATE: 1500,
  DEPLETED: 2000,
  CRITICAL: 2500,
};

/**
 * Safety multiplier for XML-heavy output (SYNAPSE rules).
 * chars/4 underestimates by 15-25% on XML; 1.2x corrects this.
 * @see NOG-9 research C6-token-budget.md
 */
const XML_SAFETY_MULTIPLIER = 1.2;

/**
 * Default configuration values.
 */
const DEFAULTS = {
  avgTokensPerPrompt: 1500,
  maxContext: 200000,
};

/**
 * Layer configurations per bracket.
 *
 * FRESH: L0 (Constitution), L1 (Global), L2 (Agent), L7 (Star-Command if explicit)
 * MODERATE: All 8 layers active
 * DEPLETED: All layers + memory hints enabled
 * CRITICAL: All layers + memory hints + handoff warning
 */
const LAYER_CONFIGS = {
  FRESH:    { layers: [0, 1, 2, 7], memoryHints: false, handoffWarning: false },
  MODERATE: { layers: [0, 1, 2, 3, 4, 5, 6, 7], memoryHints: false, handoffWarning: false },
  DEPLETED: { layers: [0, 1, 2, 3, 4, 5, 6, 7], memoryHints: true, handoffWarning: false },
  CRITICAL: { layers: [0, 1, 2, 3, 4, 5, 6, 7], memoryHints: true, handoffWarning: true },
};

/**
 * Calculate the context bracket based on remaining context percentage.
 *
 * @param {number} contextPercent - Percentage of context remaining (0-100)
 * @returns {string} Bracket name: 'FRESH' | 'MODERATE' | 'DEPLETED' | 'CRITICAL'
 */
function calculateBracket(contextPercent) {
  if (typeof contextPercent !== 'number' || isNaN(contextPercent)) {
    return 'CRITICAL';
  }

  if (contextPercent >= 60) {
    return 'FRESH';
  }
  if (contextPercent >= 40) {
    return 'MODERATE';
  }
  if (contextPercent >= 25) {
    return 'DEPLETED';
  }
  return 'CRITICAL';
}

/**
 * Estimate the percentage of context remaining based on prompt count.
 *
 * Formula: 100 - ((promptCount * avgTokensPerPrompt) / maxContext * 100)
 * Result is clamped to 0-100 range.
 *
 * @param {number} promptCount - Number of prompts in current session
 * @param {Object} [options={}] - Configuration options
 * @param {number} [options.avgTokensPerPrompt=1500] - Average tokens per prompt
 * @param {number} [options.maxContext=200000] - Maximum context window size in tokens
 * @returns {number} Percentage of context remaining (0.0 to 100.0)
 */
function estimateContextPercent(promptCount, options = {}) {
  const {
    avgTokensPerPrompt = DEFAULTS.avgTokensPerPrompt,
    maxContext = DEFAULTS.maxContext,
  } = options;

  if (typeof promptCount !== 'number' || isNaN(promptCount) || promptCount < 0) {
    return 100;
  }

  if (maxContext <= 0) {
    return 0;
  }

  const usedTokens = promptCount * avgTokensPerPrompt * XML_SAFETY_MULTIPLIER;
  const percent = 100 - (usedTokens / maxContext * 100);
  return Math.max(0, Math.min(100, percent));
}

/**
 * Get the maximum token budget for injection at the given bracket.
 *
 * @param {string} bracket - Bracket name ('FRESH' | 'MODERATE' | 'DEPLETED' | 'CRITICAL')
 * @returns {number|null} Max tokens for injection, or null for invalid bracket
 */
function getTokenBudget(bracket) {
  if (TOKEN_BUDGETS[bracket] !== undefined) {
    return TOKEN_BUDGETS[bracket];
  }
  return null;
}

/**
 * Get the active layer configuration for a given bracket.
 *
 * Returns an object with:
 * - layers: array of active layer numbers (0-7)
 * - memoryHints: whether memory hints should be included
 * - handoffWarning: whether a context handoff warning should be shown
 *
 * @param {string} bracket - Bracket name ('FRESH' | 'MODERATE' | 'DEPLETED' | 'CRITICAL')
 * @returns {{ layers: number[], memoryHints: boolean, handoffWarning: boolean }|null}
 *   Layer config object, or null for invalid bracket
 */
function getActiveLayers(bracket) {
  const config = LAYER_CONFIGS[bracket];
  if (!config) {
    return null;
  }
  // Return a copy to prevent mutation
  return {
    layers: [...config.layers],
    memoryHints: config.memoryHints,
    handoffWarning: config.handoffWarning,
  };
}

/**
 * Check if the given bracket requires a context handoff warning.
 *
 * @param {string} bracket - Bracket name
 * @returns {boolean} True if bracket is CRITICAL
 */
function needsHandoffWarning(bracket) {
  return bracket === 'CRITICAL';
}

/**
 * Check if the given bracket should include memory hints.
 *
 * @param {string} bracket - Bracket name
 * @returns {boolean} True if bracket is DEPLETED or CRITICAL
 */
function needsMemoryHints(bracket) {
  return bracket === 'DEPLETED' || bracket === 'CRITICAL';
}

module.exports = {
  calculateBracket,
  estimateContextPercent,
  getTokenBudget,
  getActiveLayers,
  needsHandoffWarning,
  needsMemoryHints,
  BRACKETS,
  TOKEN_BUDGETS,
  DEFAULTS,
  XML_SAFETY_MULTIPLIER,
};
