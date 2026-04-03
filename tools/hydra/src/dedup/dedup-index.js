/**
 * @module dedup-index
 * @description Persistent deduplication index for HYDRA (JSON fallback).
 * This module is retained for backward compatibility when better-sqlite3
 * is not available. When SQLite IS available, the functions in url-matcher.js
 * and content-hash.js route directly to dedup-store.js and these functions
 * are not called.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_DIR = path.resolve(__dirname, '../../hydra-data/index');
const INDEX_FILE = path.join(INDEX_DIR, 'dedup-index.json');

/**
 * @typedef {Object} DedupIndex
 * @property {{ [url: string]: { id: string, title: string, processedAt: string } }} urls - URL index
 * @property {{ [hash: string]: { id: string, title: string, processedAt: string } }} hashes - Hash index
 * @property {{ totalProcessed: number, totalDuplicates: number, lastUpdated: string }} stats - Stats
 */

/**
 * Create a fresh empty index.
 * @returns {DedupIndex}
 */
function createEmptyIndex() {
  return {
    urls: {},
    hashes: {},
    stats: {
      totalProcessed: 0,
      totalDuplicates: 0,
      lastUpdated: new Date().toISOString(),
    },
  };
}

/**
 * Load the dedup index from disk.
 * @returns {Promise<DedupIndex>}
 */
export async function loadIndex() {
  try {
    if (!fs.existsSync(INDEX_FILE)) {
      return createEmptyIndex();
    }
    const data = fs.readFileSync(INDEX_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`[DedupIndex] Failed to load index, creating new: ${error.message}`);
    return createEmptyIndex();
  }
}

/**
 * Save the dedup index to disk.
 * @param {DedupIndex} index - Index to save
 * @returns {Promise<void>}
 */
export async function saveIndex(index) {
  try {
    if (!fs.existsSync(INDEX_DIR)) {
      fs.mkdirSync(INDEX_DIR, { recursive: true });
    }
    index.stats.lastUpdated = new Date().toISOString();
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
  } catch (error) {
    console.error(`[DedupIndex] Failed to save index: ${error.message}`);
  }
}

/**
 * Get index statistics.
 * @returns {Promise<{ urls: number, hashes: number, totalProcessed: number, totalDuplicates: number }>}
 */
export async function getIndexStats() {
  const index = await loadIndex();
  return {
    urls: Object.keys(index.urls).length,
    hashes: Object.keys(index.hashes).length,
    totalProcessed: index.stats.totalProcessed,
    totalDuplicates: index.stats.totalDuplicates,
  };
}

/**
 * Increment the processed/duplicate counters.
 * When SQLite is active, this is a no-op because pipeline_runs tracks metrics.
 * @param {'processed'|'duplicate'} type - Counter type
 * @returns {Promise<void>}
 */
export async function incrementCounter(type) {
  // When SQLite is available, counters are tracked via pipeline_runs table.
  // This function only does work in JSON fallback mode.
  try {
    const { isSqliteAvailable } = await import('./dedup-store.js');
    if (isSqliteAvailable()) {
      return; // No-op: metrics are tracked in pipeline_runs
    }
  } catch {
    // dedup-store not available, continue with JSON
  }

  const index = await loadIndex();
  if (type === 'processed') {
    index.stats.totalProcessed++;
  } else if (type === 'duplicate') {
    index.stats.totalDuplicates++;
  }
  await saveIndex(index);
}
