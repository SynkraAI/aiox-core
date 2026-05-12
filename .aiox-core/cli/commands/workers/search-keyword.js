/**
 * Keyword Search Module
 *
 * Implements keyword-based search with fuzzy matching.
 * Used as fallback when semantic search is unavailable.
 *
 * @module cli/commands/workers/search-keyword
 * @version 1.0.0
 * @story 2.7 - Discovery CLI Search
 */

const { getRegistry } = require('../../../core/registry/registry-loader');

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1,      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate fuzzy match score (0-100) - Optimized version
 * @param {string} text - Text to search in
 * @param {string} query - Search query
 * @returns {number} Match score
 */
function fuzzyMatchScore(text, query) {
  if (!text || !query) return 0;

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match - early exit
  if (textLower === queryLower) {
    return 100;
  }

  // Contains exact query - early exit
  if (textLower.includes(queryLower)) {
    // Higher score if at word boundary
    const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(queryLower)}\\b`);
    if (wordBoundaryRegex.test(textLower)) {
      return 95;
    }
    return 85;
  }

  // Check individual words
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
  const textWords = textLower.split(/\s+/).filter(w => w.length > 0);

  // Quick check: if no word overlap possible, return early
  if (textWords.length === 0 || queryWords.length === 0) {
    return 0;
  }

  let wordMatchScore = 0;
  let matchedWords = 0;

  for (const queryWord of queryWords) {
    let bestWordScore = 0;

    // Quick exact/contains checks first (avoid Levenshtein when possible)
    for (const textWord of textWords) {
      // Exact word match
      if (textWord === queryWord) {
        bestWordScore = 100;
        break; // Can't do better, exit early
      }

      // Word starts with query
      if (textWord.startsWith(queryWord)) {
        bestWordScore = Math.max(bestWordScore, 90);
        continue; // Might find exact match later
      }

      // Query starts with text word (partial match)
      if (queryWord.startsWith(textWord) && textWord.length >= 3) {
        bestWordScore = Math.max(bestWordScore, 85);
        continue;
      }

      // Word contains query
      if (textWord.includes(queryWord) && queryWord.length >= 3) {
        bestWordScore = Math.max(bestWordScore, 80);
        continue;
      }
    }

    // Only do Levenshtein for short queries if no good match found
    // This is the expensive part - skip it when we already have decent score
    if (bestWordScore < 70 && queryWord.length <= 8) {
      for (const textWord of textWords) {
        // Skip very different length words
        const lenDiff = Math.abs(queryWord.length - textWord.length);
        if (lenDiff > 3) continue;

        const distance = levenshteinDistance(queryWord, textWord);
        const maxLen = Math.max(queryWord.length, textWord.length);
        const similarity = 1 - (distance / maxLen);

        if (similarity >= 0.7) {
          bestWordScore = Math.max(bestWordScore, Math.round(similarity * 70));
        }
      }
    }

    if (bestWordScore > 0) {
      matchedWords++;
      wordMatchScore += bestWordScore;
    }
  }

  if (matchedWords === 0) {
    return 0;
  }

  // Calculate average word score weighted by matched words ratio
  const avgWordScore = wordMatchScore / queryWords.length;
  const matchedRatio = matchedWords / queryWords.length;

  return Math.round(avgWordScore * matchedRatio);
}

/**
 * Escape special regex characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build searchable text fields from worker
 * @param {object} worker - Worker object
 * @returns {object} Object with searchable fields
 */
function buildSearchFields(worker) {
  return {
    id: worker.id || '',
    name: worker.name || '',
    description: worker.description || '',
    category: worker.category || '',
    subcategory: worker.subcategory || '',
    tags: (worker.tags || []).join(' '),
    inputs: (worker.inputs || []).join(' '),
    outputs: (worker.outputs || []).join(' '),
    combined: [
      worker.id,
      worker.name,
      worker.description,
      worker.category,
      worker.subcategory,
      ...(worker.tags || []),
      ...(worker.inputs || []),
      ...(worker.outputs || []),
    ].filter(Boolean).join(' '),
  };
}

/**
 * Perform keyword search with fuzzy matching - Optimized version
 * @param {string} query - Search query
 * @returns {Promise<Array<{worker: object, score: number}>>} Search results with scores
 */
async function searchKeyword(query) {
  const registry = getRegistry();
  const workers = await registry.getAll();

  const results = [];
  const queryLower = query.toLowerCase().trim();

  for (const worker of workers) {
    // Quick pre-check: does ID or name contain query?
    const idLower = (worker.id || '').toLowerCase();
    const nameLower = (worker.name || '').toLowerCase();

    // Fast path: exact ID match
    if (idLower === queryLower) {
      results.push({ ...worker, score: 100, matchType: 'id' });
      continue;
    }

    // Fast path: ID contains query
    if (idLower.includes(queryLower)) {
      results.push({ ...worker, score: 95, matchType: 'id' });
      continue;
    }

    // Fast path: name contains query
    if (nameLower.includes(queryLower)) {
      results.push({ ...worker, score: 90, matchType: 'name' });
      continue;
    }

    // Check tags quickly
    const tags = (worker.tags || []).map(t => t.toLowerCase());
    const tagMatch = tags.find(t => t === queryLower || t.includes(queryLower));
    if (tagMatch) {
      results.push({ ...worker, score: 85, matchType: 'tags' });
      continue;
    }

    // Slower path: full fuzzy search on all fields
    const fields = buildSearchFields(worker);

    // Only do expensive fuzzy scoring on important fields
    let bestScore = 0;
    let matchType = 'combined';

    // Check ID with fuzzy
    const idScore = fuzzyMatchScore(fields.id, queryLower) * 1.5;
    if (idScore > bestScore) {
      bestScore = idScore;
      matchType = 'id';
    }

    // Check name with fuzzy
    const nameScore = fuzzyMatchScore(fields.name, queryLower) * 1.3;
    if (nameScore > bestScore) {
      bestScore = nameScore;
      matchType = 'name';
    }

    // Check description (skip if we already have good score)
    if (bestScore < 70) {
      const descScore = fuzzyMatchScore(fields.description, queryLower) * 0.8;
      if (descScore > bestScore) {
        bestScore = descScore;
        matchType = 'description';
      }
    }

    // Include results with score above threshold
    if (bestScore >= 20) {
      results.push({
        ...worker,
        score: Math.round(Math.min(bestScore, 100)),
        matchType: matchType,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Search by exact tag match
 * @param {string[]} tags - Tags to search for
 * @returns {Promise<Array>} Workers matching any tag
 */
async function searchByTags(tags) {
  const registry = getRegistry();
  const results = [];

  for (const tag of tags) {
    const workers = await registry.getByTag(tag);
    for (const worker of workers) {
      if (!results.find(r => r.id === worker.id)) {
        results.push({
          ...worker,
          score: 100,
          matchType: 'tag-exact',
        });
      }
    }
  }

  return results;
}

module.exports = {
  searchKeyword,
  searchByTags,
  fuzzyMatchScore,
  levenshteinDistance,
  buildSearchFields,
};
