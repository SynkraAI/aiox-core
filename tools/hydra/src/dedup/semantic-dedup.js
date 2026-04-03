/**
 * @module semantic-dedup
 * @description Dedup Layer 3: Semantic similarity matching (Story 3.1).
 * Uses cosine similarity on lightweight text fingerprints for near-duplicate detection.
 * Pure Node.js implementation — no external Python/Model2Vec dependency needed.
 *
 * Strategy:
 *   1. Compute a text fingerprint (n-gram frequency vector)
 *   2. Compare against stored fingerprints using cosine similarity
 *   3. If similarity exceeds threshold for content type, mark as duplicate
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FINGERPRINT_DIR = path.resolve(__dirname, '../../hydra-data/fingerprints');
const FINGERPRINT_FILE = path.join(FINGERPRINT_DIR, 'fingerprints.json');

/**
 * Default semantic dedup thresholds per content type (from PRD section 6).
 */
const DEFAULT_THRESHOLDS = {
  rss: 0.85,
  youtube: 0.75,
  podcast: 0.75,
  twitter: 0.90,
  github: 0.85,
  web: 0.80,
  newsletter: 0.85,
  default: 0.85,
};

/**
 * Tokenize text into normalized words.
 * @param {string} text - Input text
 * @returns {string[]}
 */
function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Build n-gram frequency map from tokens.
 * Uses a combination of unigrams and bigrams for better semantic capture.
 * @param {string[]} tokens - Tokenized words
 * @returns {Map<string, number>} Frequency map
 */
function buildNgramMap(tokens) {
  const freqMap = new Map();

  // Unigrams
  for (const token of tokens) {
    freqMap.set(token, (freqMap.get(token) || 0) + 1);
  }

  // Bigrams (capture word-pair patterns)
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]}_${tokens[i + 1]}`;
    freqMap.set(bigram, (freqMap.get(bigram) || 0) + 1);
  }

  return freqMap;
}

/**
 * Compute a compact text fingerprint as a sparse vector.
 * @param {string} text - Normalized text
 * @returns {{ tokens: number, vector: Record<string, number> }}
 */
export function computeFingerprint(text) {
  const tokens = tokenize(text);
  if (tokens.length === 0) {
    return { tokens: 0, vector: {} };
  }

  const freqMap = buildNgramMap(tokens);

  // Convert to normalized frequency vector (TF-like)
  const vector = {};
  const maxFreq = Math.max(...freqMap.values());

  for (const [term, freq] of freqMap) {
    vector[term] = freq / maxFreq;
  }

  return { tokens: tokens.length, vector };
}

/**
 * Compute cosine similarity between two sparse vectors.
 * @param {Record<string, number>} vecA - First vector
 * @param {Record<string, number>} vecB - Second vector
 * @returns {number} Similarity score (0.0 - 1.0)
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) return 0;

  const keysA = Object.keys(vecA);
  const keysB = Object.keys(vecB);

  if (keysA.length === 0 || keysB.length === 0) return 0;

  // Use smaller vector as lookup source for efficiency
  const [smaller, larger] = keysA.length <= keysB.length
    ? [vecA, vecB]
    : [vecB, vecA];

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  // Dot product: only iterate over shared dimensions
  for (const key of Object.keys(smaller)) {
    const a = smaller[key];
    magA += a * a;
    if (key in larger) {
      dotProduct += a * larger[key];
    }
  }

  for (const key of Object.keys(larger)) {
    const b = larger[key];
    magB += b * b;
  }

  // Add remaining magnitude from smaller keys not in larger
  // (already handled above)

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Load stored fingerprints from disk.
 * @returns {Promise<Array<{ id: string, title: string, sourceType: string, vector: Record<string, number>, storedAt: string }>>}
 */
export async function loadFingerprints() {
  try {
    if (!fs.existsSync(FINGERPRINT_FILE)) {
      return [];
    }
    const data = fs.readFileSync(FINGERPRINT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save fingerprints to disk.
 * @param {Array<{ id: string, title: string, sourceType: string, vector: Record<string, number>, storedAt: string }>} fingerprints
 * @returns {Promise<void>}
 */
export async function saveFingerprints(fingerprints) {
  try {
    if (!fs.existsSync(FINGERPRINT_DIR)) {
      fs.mkdirSync(FINGERPRINT_DIR, { recursive: true });
    }
    fs.writeFileSync(FINGERPRINT_FILE, JSON.stringify(fingerprints, null, 2), 'utf-8');
  } catch (error) {
    console.error(`[SemanticDedup] Failed to save fingerprints: ${error.message}`);
  }
}

/**
 * Get the similarity threshold for a given source type.
 * @param {string} sourceType - Content source type
 * @param {Object} [customThresholds] - Custom threshold overrides
 * @returns {number} Threshold (0.0 - 1.0)
 */
export function getThreshold(sourceType, customThresholds = {}) {
  return customThresholds[sourceType]
    || DEFAULT_THRESHOLDS[sourceType]
    || DEFAULT_THRESHOLDS.default;
}

/**
 * Check if content is semantically similar to any previously stored fingerprint.
 * @param {string} normalizedText - Normalized content text
 * @param {string} sourceType - Source type for threshold selection
 * @param {Object} [options] - Options
 * @param {Object} [options.thresholds] - Custom threshold overrides
 * @param {Array} [options.fingerprints] - Pre-loaded fingerprints (avoids disk read)
 * @returns {Promise<{ isDuplicate: boolean, similarity: number, matchedId?: string, matchedTitle?: string }>}
 */
export async function checkSemantic(normalizedText, sourceType, options = {}) {
  const fingerprint = computeFingerprint(normalizedText);

  if (fingerprint.tokens < 10) {
    // Too short for meaningful semantic comparison
    return { isDuplicate: false, similarity: 0 };
  }

  const threshold = getThreshold(sourceType, options.thresholds);
  const stored = options.fingerprints || await loadFingerprints();

  let maxSimilarity = 0;
  let matchedItem = null;

  for (const item of stored) {
    const sim = cosineSimilarity(fingerprint.vector, item.vector);
    if (sim > maxSimilarity) {
      maxSimilarity = sim;
      matchedItem = item;
    }

    // Early exit if we find a clear duplicate
    if (sim >= threshold) {
      return {
        isDuplicate: true,
        similarity: Math.round(sim * 1000) / 1000,
        matchedId: item.id,
        matchedTitle: item.title,
      };
    }
  }

  return {
    isDuplicate: false,
    similarity: Math.round(maxSimilarity * 1000) / 1000,
    matchedId: matchedItem?.id,
    matchedTitle: matchedItem?.title,
  };
}

/**
 * Register a content fingerprint for future dedup checks.
 * @param {string} contentId - Content ID
 * @param {string} title - Content title
 * @param {string} normalizedText - Normalized text
 * @param {string} sourceType - Source type
 * @returns {Promise<void>}
 */
export async function registerFingerprint(contentId, title, normalizedText, sourceType) {
  const fingerprint = computeFingerprint(normalizedText);

  if (fingerprint.tokens < 10) return;

  const stored = await loadFingerprints();

  stored.push({
    id: contentId,
    title,
    sourceType,
    vector: fingerprint.vector,
    storedAt: new Date().toISOString(),
  });

  // Keep only the last 10000 fingerprints to prevent unbounded growth
  if (stored.length > 10000) {
    stored.splice(0, stored.length - 10000);
  }

  await saveFingerprints(stored);
}
