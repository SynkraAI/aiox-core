/**
 * Score Calculator Module
 *
 * Calculates and normalizes relevance scores for search results.
 *
 * @module cli/utils/score-calculator
 * @version 1.0.0
 * @story 2.7 - Discovery CLI Search
 */

/**
 * Calculate scores for search results
 * @param {Array} results - Search results (may already have scores)
 * @param {string} query - Original search query
 * @returns {Array} Results with calculated/adjusted scores
 */
function calculateScores(results, query) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);

  return results.map(result => {
    let score = result.score || 0;

    // Boost for exact ID match
    if (result.id === queryLower) {
      score = Math.max(score, 100);
    } else if (result.id.toLowerCase() === queryLower) {
      score = Math.max(score, 99);
    } else if (result.id.toLowerCase().includes(queryLower)) {
      score = Math.max(score, 95);
    }

    // Boost for exact name match
    if (result.name.toLowerCase() === queryLower) {
      score = Math.max(score, 98);
    } else if (result.name.toLowerCase().includes(queryLower)) {
      score = Math.max(score, 90);
    }

    // Boost for tag matches
    const tags = (result.tags || []).map(t => t.toLowerCase());
    const tagMatchCount = queryWords.filter(word =>
      tags.some(tag => tag === word || tag.includes(word)),
    ).length;

    if (tagMatchCount > 0) {
      const tagBoost = Math.min(15, tagMatchCount * 5);
      score = Math.min(100, score + tagBoost);
    }

    // Boost for category match
    if (result.category && queryWords.some(w => result.category.toLowerCase().includes(w))) {
      score = Math.min(100, score + 5);
    }

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      ...result,
      score,
    };
  });
}

/**
 * Sort results by score descending
 * @param {Array} results - Search results with scores
 * @returns {Array} Sorted results
 */
function sortByScore(results) {
  return [...results].sort((a, b) => {
    // Primary sort by score
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Secondary sort by name length (shorter = more relevant)
    return a.name.length - b.name.length;
  });
}

/**
 * Normalize scores to ensure even distribution
 * @param {Array} results - Search results
 * @returns {Array} Results with normalized scores
 */
function normalizeScores(results) {
  if (results.length === 0) return results;

  const scores = results.map(r => r.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const range = maxScore - minScore;

  if (range === 0) {
    // All same score, just return as-is
    return results;
  }

  return results.map(result => ({
    ...result,
    score: Math.round(((result.score - minScore) / range) * 100),
  }));
}

/**
 * Calculate relevance score based on multiple factors
 * @param {object} worker - Worker object
 * @param {string} query - Search query
 * @param {object} options - Scoring options
 * @returns {number} Relevance score 0-100
 */
function calculateRelevanceScore(worker, query, options = {}) {
  const weights = {
    idMatch: options.idWeight || 1.5,
    nameMatch: options.nameWeight || 1.3,
    tagMatch: options.tagWeight || 1.1,
    descriptionMatch: options.descriptionWeight || 0.8,
    categoryMatch: options.categoryWeight || 0.7,
  };

  const queryLower = query.toLowerCase();
  let score = 0;

  // ID matching
  if (worker.id.toLowerCase() === queryLower) {
    score += 100 * weights.idMatch;
  } else if (worker.id.toLowerCase().includes(queryLower)) {
    score += 80 * weights.idMatch;
  }

  // Name matching
  const nameLower = worker.name.toLowerCase();
  if (nameLower === queryLower) {
    score += 100 * weights.nameMatch;
  } else if (nameLower.includes(queryLower)) {
    score += 70 * weights.nameMatch;
  }

  // Tag matching
  const tags = (worker.tags || []).map(t => t.toLowerCase());
  for (const tag of tags) {
    if (tag === queryLower) {
      score += 50 * weights.tagMatch;
      break;
    } else if (tag.includes(queryLower) || queryLower.includes(tag)) {
      score += 30 * weights.tagMatch;
    }
  }

  // Description matching
  if (worker.description && worker.description.toLowerCase().includes(queryLower)) {
    score += 30 * weights.descriptionMatch;
  }

  // Category matching
  if (worker.category && worker.category.toLowerCase().includes(queryLower)) {
    score += 20 * weights.categoryMatch;
  }

  // Normalize to 0-100
  return Math.min(100, Math.round(score));
}

/**
 * Boost score for exact matches
 * @param {Array} results - Search results
 * @param {string} query - Search query
 * @returns {Array} Results with boosted exact matches
 */
function boostExactMatches(results, query) {
  const queryLower = query.toLowerCase();

  return results.map(result => {
    let boostedScore = result.score;

    // Exact ID match gets top score
    if (result.id.toLowerCase() === queryLower) {
      boostedScore = 100;
    }

    return {
      ...result,
      score: boostedScore,
    };
  });
}

/**
 * Calculate search accuracy for testing
 * @param {Array} results - Search results
 * @param {string} expectedId - Expected first result ID
 * @returns {object} Accuracy metrics
 */
function calculateSearchAccuracy(results, expectedId) {
  if (results.length === 0) {
    return {
      found: false,
      position: -1,
      accuracy: 0,
    };
  }

  const position = results.findIndex(r => r.id === expectedId);

  return {
    found: position !== -1,
    position: position,
    isFirst: position === 0,
    accuracy: position === 0 ? 100 : position > 0 ? Math.max(0, 100 - (position * 10)) : 0,
  };
}

module.exports = {
  calculateScores,
  sortByScore,
  normalizeScores,
  calculateRelevanceScore,
  boostExactMatches,
  calculateSearchAccuracy,
};
