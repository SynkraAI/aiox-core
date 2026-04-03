/**
 * @module scoring-rubric
 * @description Scoring rubric and tier classification for HYDRA curator.
 * Implements the 5-dimension weighted scoring system from the PRD.
 */

/**
 * Default scoring weights (must sum to 1.0).
 */
export const DEFAULT_WEIGHTS = {
  relevance: 0.30,
  novelty: 0.25,
  actionability: 0.20,
  authority: 0.15,
  depth: 0.10,
};

/**
 * Tier definitions with thresholds and actions.
 */
export const TIERS = {
  S: { minScore: 4.5, action: 'ingest_full_alert', label: 'S-Tier (Exceptional)' },
  A: { minScore: 3.5, action: 'ingest_full', label: 'A-Tier (High Quality)' },
  B: { minScore: 2.5, action: 'ingest_metadata_only', label: 'B-Tier (Decent)' },
  C: { minScore: 1.5, action: 'skip_store_reference', label: 'C-Tier (Low Value)' },
  D: { minScore: 0, action: 'discard', label: 'D-Tier (Discard)' },
};

/**
 * Calculate weighted score from individual dimension scores.
 * @param {Object} scores - Individual dimension scores (1-5 each)
 * @param {number} scores.relevance - Relevance to active projects
 * @param {number} scores.novelty - New info vs existing KB
 * @param {number} scores.actionability - Practical/implementable insights
 * @param {number} scores.authority - Source credibility
 * @param {number} scores.depth - Analytical depth
 * @param {Object} [weights] - Custom weights
 * @returns {number} Weighted score (1.0 - 5.0)
 */
export function calculateWeightedScore(scores, weights = DEFAULT_WEIGHTS) {
  const dims = ['relevance', 'novelty', 'actionability', 'authority', 'depth'];
  let total = 0;
  let weightSum = 0;

  for (const dim of dims) {
    const score = Math.max(1, Math.min(5, Number(scores[dim]) || 1));
    const weight = weights[dim] || DEFAULT_WEIGHTS[dim];
    total += score * weight;
    weightSum += weight;
  }

  // Normalize in case weights don't sum to 1.0
  return weightSum > 0 ? total / weightSum : 1;
}

/**
 * Classify a score into a tier.
 * @param {number} score - Weighted score (1.0 - 5.0)
 * @returns {{ tier: string, action: string, label: string }}
 */
export function classifyTier(score) {
  for (const [tier, def] of Object.entries(TIERS)) {
    if (score >= def.minScore) {
      return { tier, action: def.action, label: def.label };
    }
  }
  return { tier: 'D', action: 'discard', label: TIERS.D.label };
}

/**
 * Check if a tier requires hallucination checking.
 * @param {string} tier - Tier letter (S, A, B, C, D)
 * @returns {boolean}
 */
export function requiresHallucinationCheck(tier) {
  return tier === 'S' || tier === 'A';
}

/**
 * Get minimum confidence required for a tier.
 * @param {string} tier - Tier letter
 * @returns {number} Minimum confidence (1-5)
 */
export function getMinConfidence(tier) {
  const map = { S: 4, A: 3, B: 2, C: 1, D: 1 };
  return map[tier] || 1;
}
