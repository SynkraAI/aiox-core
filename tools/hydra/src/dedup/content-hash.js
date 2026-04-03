/**
 * @module content-hash
 * @description Dedup Layer 2: SHA256 content hash matching.
 * Detects exact duplicates by hashing normalized text.
 *
 * Uses SQLite (dedup-store) when available, falls back to JSON (dedup-index).
 */

import { createHash } from 'node:crypto';
import { getDedupStore, isSqliteAvailable } from './dedup-store.js';

/** @type {boolean|null} */
let _useSqlite = null;

/**
 * Determine whether to use SQLite or JSON backend.
 * @returns {boolean}
 */
function useSqlite() {
  if (_useSqlite === null) {
    try {
      _useSqlite = isSqliteAvailable();
    } catch {
      _useSqlite = false;
    }
  }
  return _useSqlite;
}

/**
 * Compute SHA256 hash of normalized content.
 * @param {string} normalizedText - Cleaned, normalized text
 * @returns {string} SHA256 hex digest
 */
export function computeHash(normalizedText) {
  return createHash('sha256').update(normalizedText, 'utf-8').digest('hex');
}

/**
 * Check if content hash already exists in the index.
 * @param {string} hash - SHA256 hash to check
 * @returns {Promise<{ isDuplicate: boolean, existingId?: string }>}
 */
export async function checkHash(hash) {
  if (useSqlite()) {
    const store = getDedupStore();
    return store.checkHash(hash);
  }

  // Fallback to JSON
  const { loadIndex } = await import('./dedup-index.js');
  const index = await loadIndex();
  const existing = index.hashes[hash];
  if (existing) {
    return { isDuplicate: true, existingId: existing.id };
  }
  return { isDuplicate: false };
}

/**
 * Register a content hash as processed.
 * @param {string} hash - SHA256 hash
 * @param {string} contentId - Content ID
 * @param {string} title - Content title
 * @param {string} [url] - Source URL
 * @returns {Promise<void>}
 */
export async function registerHash(hash, contentId, title, url) {
  if (useSqlite()) {
    const store = getDedupStore();
    store.registerHash(hash, contentId, title, url);
    return;
  }

  // Fallback to JSON
  const { loadIndex, saveIndex } = await import('./dedup-index.js');
  const index = await loadIndex();
  index.hashes[hash] = {
    id: contentId,
    title,
    processedAt: new Date().toISOString(),
  };
  await saveIndex(index);
}

/**
 * Reset the SQLite detection cache (for testing).
 */
export function _resetSqliteDetection() {
  _useSqlite = null;
}

/**
 * Force SQLite mode on/off (for testing).
 * @param {boolean} value
 */
export function _forceSqliteMode(value) {
  _useSqlite = value;
}
