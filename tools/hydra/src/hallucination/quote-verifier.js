/**
 * @module quote-verifier
 * @description Quote verification via fuzzy string matching (Story 7.4).
 * Verifies that quoted text actually exists in the original content.
 */

/**
 * @typedef {Object} QuoteVerifyResult
 * @property {string} quote - The quote being verified
 * @property {'CONFIRMED'|'PARAPHRASED'|'HALLUCINATED'} status - Verification status
 * @property {number} similarity - Similarity score (0-1)
 * @property {string} [bestMatch] - Best matching substring from original
 */

/**
 * Compute bigram set from a string.
 * @param {string} str - Input string
 * @returns {Set<string>}
 */
function getBigrams(str) {
  const normalized = str.toLowerCase().replace(/\s+/g, ' ').trim();
  const bigrams = new Set();
  for (let i = 0; i < normalized.length - 1; i++) {
    bigrams.add(normalized.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Compute Sorensen-Dice coefficient between two strings.
 * A simple, effective fuzzy string similarity metric.
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Similarity score (0-1)
 */
export function diceCoefficient(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const bigramsA = getBigrams(a);
  const bigramsB = getBigrams(b);

  if (bigramsA.size === 0 || bigramsB.size === 0) return 0;

  let intersection = 0;
  for (const bigram of bigramsA) {
    if (bigramsB.has(bigram)) intersection++;
  }

  return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

/**
 * Find the best matching substring in the text for a given quote.
 * Uses a sliding window approach.
 * @param {string} quote - Quote to find
 * @param {string} text - Original text to search in
 * @returns {{ similarity: number, bestMatch: string }}
 */
export function findBestMatch(quote, text) {
  if (!quote || !text) return { similarity: 0, bestMatch: '' };

  const quoteNorm = quote.toLowerCase().trim();
  const textNorm = text.toLowerCase();

  // First try exact substring match
  if (textNorm.includes(quoteNorm)) {
    return { similarity: 1.0, bestMatch: quote };
  }

  // Sliding window — check windows of similar length to the quote
  const quoteLen = quoteNorm.length;
  const windowSizes = [quoteLen, Math.floor(quoteLen * 1.2), Math.floor(quoteLen * 0.8)];

  let bestSimilarity = 0;
  let bestMatch = '';

  for (const windowSize of windowSizes) {
    if (windowSize > textNorm.length) continue;

    // Step by 1/4 of window size for efficiency
    const step = Math.max(1, Math.floor(windowSize / 4));

    for (let i = 0; i <= textNorm.length - windowSize; i += step) {
      const window = textNorm.slice(i, i + windowSize);
      const similarity = diceCoefficient(quoteNorm, window);

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = text.slice(i, i + windowSize);

        // Early exit if very good match found
        if (similarity >= 0.95) {
          return { similarity: bestSimilarity, bestMatch };
        }
      }
    }
  }

  return { similarity: bestSimilarity, bestMatch };
}

/**
 * Verify a list of quotes against the original text.
 * @param {string[]} quotes - Quotes to verify
 * @param {string} originalText - Original text
 * @param {{ confirmThreshold?: number, paraphraseThreshold?: number }} [thresholds] - Custom thresholds
 * @returns {QuoteVerifyResult[]}
 */
export function verifyQuotes(quotes, originalText, thresholds = {}) {
  const confirmThreshold = thresholds.confirmThreshold || 0.80;
  const paraphraseThreshold = thresholds.paraphraseThreshold || 0.60;

  return quotes.map((quote) => {
    const { similarity, bestMatch } = findBestMatch(quote, originalText);

    let status;
    if (similarity >= confirmThreshold) {
      status = 'CONFIRMED';
    } else if (similarity >= paraphraseThreshold) {
      status = 'PARAPHRASED';
    } else {
      status = 'HALLUCINATED';
    }

    return { quote, status, similarity: Math.round(similarity * 100) / 100, bestMatch };
  });
}
