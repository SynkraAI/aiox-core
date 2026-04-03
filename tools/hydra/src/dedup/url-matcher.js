/**
 * @module url-matcher
 * @description Dedup Layer 1: URL matching against processed content index.
 * Instant check -- if same URL was already processed, skip.
 *
 * Uses SQLite (dedup-store) when available, falls back to JSON (dedup-index).
 */

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
      if (!_useSqlite) {
        console.warn('[url-matcher] better-sqlite3 not available, falling back to JSON index.');
      }
    } catch {
      _useSqlite = false;
    }
  }
  return _useSqlite;
}

/**
 * Normalize a URL for comparison (remove fragments, trailing slashes, tracking params).
 * @param {string} url - Raw URL
 * @returns {string} Normalized URL
 */
export function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    // Remove fragment
    parsed.hash = '';

    // Remove UTM and tracking params
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign',
      'utm_term', 'utm_content', 'ref', 'source',
      'fbclid', 'gclid',
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // Sort remaining query params for consistency
    parsed.searchParams.sort();

    // Remove trailing slash
    let normalized = parsed.toString();
    if (normalized.endsWith('/') && parsed.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized.toLowerCase();
  } catch {
    // If URL is invalid, use as-is
    return (url || '').toLowerCase().trim();
  }
}

/**
 * Check if a URL has already been processed.
 * @param {string} url - URL to check
 * @returns {Promise<{ isDuplicate: boolean, existingId?: string }>}
 */
export async function checkUrl(url) {
  const normalized = normalizeUrl(url);

  if (useSqlite()) {
    const store = getDedupStore();
    return store.checkUrl(normalized);
  }

  // Fallback to JSON
  const { loadIndex } = await import('./dedup-index.js');
  const index = await loadIndex();
  const existing = index.urls[normalized];
  if (existing) {
    return { isDuplicate: true, existingId: existing.id };
  }
  return { isDuplicate: false };
}

/**
 * Register a URL as processed.
 * @param {string} url - URL to register
 * @param {string} contentId - Content ID
 * @param {string} title - Content title for reference
 * @param {string} [sourceType] - Source type (rss, github, etc.)
 * @returns {Promise<void>}
 */
export async function registerUrl(url, contentId, title, sourceType) {
  const normalized = normalizeUrl(url);

  if (useSqlite()) {
    const store = getDedupStore();
    store.registerUrl(normalized, contentId, title, sourceType);
    return;
  }

  // Fallback to JSON
  const { loadIndex, saveIndex } = await import('./dedup-index.js');
  const index = await loadIndex();
  index.urls[normalized] = {
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
