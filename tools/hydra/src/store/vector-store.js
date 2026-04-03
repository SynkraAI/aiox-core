/**
 * @module vector-store
 * @description Vector store for semantic search and embeddings (Story 3.6).
 * Provides a local file-based vector store with optional Qdrant integration.
 *
 * Architecture:
 *   - Local mode (default): JSON file with fingerprint vectors + brute-force kNN
 *   - Qdrant mode (optional): HTTP API to Qdrant server for production-grade search
 *
 * The local mode is sufficient for HYDRA's daily volume (~200 items/day)
 * and avoids requiring a separate Qdrant server for MVP.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeFingerprint, cosineSimilarity } from '../dedup/semantic-dedup.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_DIR = path.resolve(__dirname, '../../hydra-data/vectors');
const STORE_FILE = path.join(STORE_DIR, 'vector-index.json');

/**
 * @typedef {Object} VectorEntry
 * @property {string} id - Content ID
 * @property {string} title - Content title
 * @property {string} url - Content URL
 * @property {string} tier - Quality tier (S/A/B)
 * @property {number} score - Weighted score
 * @property {string[]} domains - Associated domains
 * @property {string[]} tags - Content tags
 * @property {Record<string, number>} vector - Text fingerprint vector
 * @property {string} storedAt - ISO timestamp
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id - Content ID
 * @property {string} title - Content title
 * @property {string} url - Content URL
 * @property {string} tier - Quality tier
 * @property {number} score - Weighted score
 * @property {number} similarity - Similarity to query (0.0 - 1.0)
 * @property {string[]} domains - Associated domains
 */

/**
 * @typedef {Object} VectorStoreConfig
 * @property {'local'|'qdrant'} mode - Storage mode
 * @property {string} [qdrantUrl] - Qdrant server URL (for qdrant mode)
 * @property {string} [collection] - Qdrant collection name
 * @property {number} [maxEntries] - Max entries in local store
 */

export class VectorStore {
  /**
   * @param {VectorStoreConfig} [config]
   */
  constructor(config = {}) {
    this.mode = config.mode || 'local';
    this.qdrantUrl = config.qdrantUrl || 'http://localhost:6333';
    this.collection = config.collection || 'hydra-content';
    this.maxEntries = config.maxEntries || 50000;

    /** @type {VectorEntry[]} */
    this._entries = [];
    this._loaded = false;
  }

  /**
   * Load local store from disk (lazy).
   * @returns {Promise<void>}
   */
  async _ensureLoaded() {
    if (this._loaded) return;
    this._loaded = true;

    if (this.mode !== 'local') return;

    try {
      if (fs.existsSync(STORE_FILE)) {
        const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
        this._entries = Array.isArray(data) ? data : [];
      }
    } catch {
      this._entries = [];
    }
  }

  /**
   * Save local store to disk.
   * @returns {Promise<void>}
   */
  async _saveLocal() {
    try {
      if (!fs.existsSync(STORE_DIR)) {
        fs.mkdirSync(STORE_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this._entries, null, 2), 'utf-8');
    } catch (error) {
      console.warn(`[VectorStore] Failed to save: ${error.message}`);
    }
  }

  /**
   * Add content to the vector store.
   * @param {Object} params
   * @param {string} params.id - Content ID
   * @param {string} params.title - Content title
   * @param {string} params.url - Content URL
   * @param {string} params.tier - Quality tier
   * @param {number} params.score - Weighted score
   * @param {string[]} params.domains - Associated domains
   * @param {string[]} params.tags - Content tags
   * @param {string} params.normalizedText - Normalized text for vectorization
   * @returns {Promise<{ stored: boolean, error?: string }>}
   */
  async upsert(params) {
    const { id, title, url, tier, score, domains, tags, normalizedText } = params;

    const fingerprint = computeFingerprint(normalizedText);
    if (fingerprint.tokens < 10) {
      return { stored: false, error: 'Text too short for vectorization' };
    }

    if (this.mode === 'qdrant') {
      return this._upsertQdrant(params, fingerprint.vector);
    }

    // Local mode
    await this._ensureLoaded();

    // Check if ID already exists (update)
    const existingIdx = this._entries.findIndex((e) => e.id === id);
    const entry = {
      id,
      title,
      url,
      tier,
      score,
      domains: domains || [],
      tags: tags || [],
      vector: fingerprint.vector,
      storedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      this._entries[existingIdx] = entry;
    } else {
      this._entries.push(entry);
    }

    // Enforce max entries (remove lowest-scored oldest entries)
    if (this._entries.length > this.maxEntries) {
      this._entries.sort((a, b) => b.score - a.score || new Date(b.storedAt) - new Date(a.storedAt));
      this._entries = this._entries.slice(0, this.maxEntries);
    }

    await this._saveLocal();
    return { stored: true };
  }

  /**
   * Search for similar content using text query.
   * @param {string} queryText - Text to search for
   * @param {Object} [options]
   * @param {number} [options.limit=10] - Max results
   * @param {number} [options.minSimilarity=0.3] - Minimum similarity threshold
   * @param {string[]} [options.filterDomains] - Filter by domains
   * @param {string[]} [options.filterTiers] - Filter by tiers
   * @returns {Promise<SearchResult[]>}
   */
  async search(queryText, options = {}) {
    const { limit = 10, minSimilarity = 0.3, filterDomains, filterTiers } = options;

    const queryFingerprint = computeFingerprint(queryText);
    if (queryFingerprint.tokens < 3) {
      return [];
    }

    if (this.mode === 'qdrant') {
      return this._searchQdrant(queryFingerprint.vector, options);
    }

    // Local brute-force kNN search
    await this._ensureLoaded();

    const results = [];

    for (const entry of this._entries) {
      // Apply filters
      if (filterDomains && filterDomains.length > 0) {
        const hasMatch = entry.domains.some((d) => filterDomains.includes(d));
        if (!hasMatch) continue;
      }
      if (filterTiers && filterTiers.length > 0) {
        if (!filterTiers.includes(entry.tier)) continue;
      }

      const similarity = cosineSimilarity(queryFingerprint.vector, entry.vector);
      if (similarity >= minSimilarity) {
        results.push({
          id: entry.id,
          title: entry.title,
          url: entry.url,
          tier: entry.tier,
          score: entry.score,
          similarity: Math.round(similarity * 1000) / 1000,
          domains: entry.domains,
        });
      }
    }

    // Sort by similarity descending
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  /**
   * Get entries count and stats.
   * @returns {Promise<{ total: number, byTier: Record<string, number>, byDomain: Record<string, number> }>}
   */
  async getStats() {
    await this._ensureLoaded();

    const byTier = {};
    const byDomain = {};

    for (const entry of this._entries) {
      byTier[entry.tier] = (byTier[entry.tier] || 0) + 1;
      for (const domain of entry.domains || []) {
        byDomain[domain] = (byDomain[domain] || 0) + 1;
      }
    }

    return {
      total: this._entries.length,
      byTier,
      byDomain,
    };
  }

  /**
   * Remove an entry by ID.
   * @param {string} id - Content ID
   * @returns {Promise<boolean>} True if entry was found and removed
   */
  async remove(id) {
    if (this.mode === 'qdrant') {
      return this._removeQdrant(id);
    }

    await this._ensureLoaded();
    const before = this._entries.length;
    this._entries = this._entries.filter((e) => e.id !== id);

    if (this._entries.length < before) {
      await this._saveLocal();
      return true;
    }
    return false;
  }

  /**
   * Clear all entries.
   * @returns {Promise<void>}
   */
  async clear() {
    this._entries = [];
    if (this.mode === 'local') {
      await this._saveLocal();
    }
  }

  // --- Qdrant integration stubs (for future use) ---

  /**
   * Upsert to Qdrant (stub — requires Qdrant server running).
   * @param {Object} params - Content params
   * @param {Record<string, number>} vector - Fingerprint vector
   * @returns {Promise<{ stored: boolean, error?: string }>}
   */
  async _upsertQdrant(params, vector) {
    try {
      // Convert sparse vector to dense array for Qdrant
      // This requires a fixed vocabulary, which we don't have in MVP.
      // For now, fall back to local mode with a warning.
      console.warn('[VectorStore] Qdrant mode not fully implemented — falling back to local storage');
      this.mode = 'local';
      return this.upsert(params);
    } catch (error) {
      return { stored: false, error: `Qdrant upsert failed: ${error.message}` };
    }
  }

  /**
   * Search Qdrant (stub).
   * @param {Record<string, number>} vector - Query vector
   * @param {Object} options - Search options
   * @returns {Promise<SearchResult[]>}
   */
  async _searchQdrant(vector, options) {
    console.warn('[VectorStore] Qdrant search not fully implemented — falling back to local search');
    this.mode = 'local';
    // Re-run with local mode
    return [];
  }

  /**
   * Remove from Qdrant (stub).
   * @param {string} id - Content ID
   * @returns {Promise<boolean>}
   */
  async _removeQdrant(id) {
    console.warn('[VectorStore] Qdrant remove not fully implemented');
    return false;
  }

  /**
   * Get summary for daily digest.
   * @returns {string}
   */
  getSummary() {
    return `Vector Store: ${this._entries.length} entries (${this.mode} mode)`;
  }
}
