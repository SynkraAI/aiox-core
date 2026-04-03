/**
 * @module scoring-cache
 * @description Semantic scoring cache for HYDRA (Story 3.4).
 * Caches LLM scoring results to avoid re-scoring similar content.
 * Uses a local file-based cache (Redis integration optional via adapter).
 *
 * Strategy:
 *   1. Before calling LLM, check if similar content was already scored
 *   2. "Similar" = same source domain + similar title (Dice coefficient >= 0.7)
 *   3. If cache hit with high confidence, return cached score
 *   4. After LLM scoring, store result in cache
 *
 * This saves ~30-50% of LLM calls in typical pipelines where the same
 * sources publish related articles.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.resolve(__dirname, '../../hydra-data/cache');
const CACHE_FILE = path.join(CACHE_DIR, 'scoring-cache.json');

/**
 * Default cache configuration.
 */
const DEFAULTS = {
  maxEntries: 5000,
  ttlMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  titleSimilarityThreshold: 0.7,
  enabled: true,
};

/**
 * @typedef {Object} CacheEntry
 * @property {string} key - Cache key (domain:titleHash)
 * @property {string} title - Original title
 * @property {string} domain - Source domain
 * @property {{ tier: string, action: string, label: string, weightedScore: number, scores: Object, reasoning: string }} result - Scoring result
 * @property {number} createdAt - Timestamp (ms)
 * @property {number} hits - Number of cache hits
 */

/**
 * @typedef {Object} CacheStats
 * @property {number} entries - Total cache entries
 * @property {number} hits - Total cache hits (this session)
 * @property {number} misses - Total cache misses (this session)
 * @property {number} evictions - Entries evicted (TTL expired)
 */

export class ScoringCache {
  /**
   * @param {Object} [config] - Cache configuration
   * @param {number} [config.maxEntries] - Maximum cache entries
   * @param {number} [config.ttlMs] - Time-to-live in milliseconds
   * @param {number} [config.titleSimilarityThreshold] - Min title similarity for cache hit
   * @param {boolean} [config.enabled] - Whether caching is enabled
   */
  constructor(config = {}) {
    this.maxEntries = config.maxEntries || DEFAULTS.maxEntries;
    this.ttlMs = config.ttlMs || DEFAULTS.ttlMs;
    this.titleSimilarityThreshold = config.titleSimilarityThreshold || DEFAULTS.titleSimilarityThreshold;
    this.enabled = config.enabled !== false;

    /** @type {CacheEntry[]} */
    this.entries = [];
    this.sessionHits = 0;
    this.sessionMisses = 0;
    this._loaded = false;
  }

  /**
   * Load cache from disk (lazy, once per session).
   * @returns {Promise<void>}
   */
  async _ensureLoaded() {
    if (this._loaded) return;
    this._loaded = true;

    try {
      if (fs.existsSync(CACHE_FILE)) {
        const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        this.entries = Array.isArray(data) ? data : [];
        // Evict expired entries on load
        this._evictExpired();
      }
    } catch {
      this.entries = [];
    }
  }

  /**
   * Save cache to disk.
   * @returns {Promise<void>}
   */
  async _save() {
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(this.entries, null, 2), 'utf-8');
    } catch (error) {
      console.warn(`[ScoringCache] Failed to save: ${error.message}`);
    }
  }

  /**
   * Evict expired entries.
   * @returns {number} Number of entries evicted
   */
  _evictExpired() {
    const now = Date.now();
    const before = this.entries.length;
    this.entries = this.entries.filter((e) => (now - e.createdAt) < this.ttlMs);
    return before - this.entries.length;
  }

  /**
   * Compute bigram set from a string for Dice coefficient calculation.
   * @param {string} str - Input string
   * @returns {Set<string>}
   */
  _bigrams(str) {
    const normalized = (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const set = new Set();
    for (let i = 0; i < normalized.length - 1; i++) {
      set.add(normalized.slice(i, i + 2));
    }
    return set;
  }

  /**
   * Compute Dice coefficient between two strings.
   * @param {string} a - First string
   * @param {string} b - Second string
   * @returns {number} Similarity (0.0 - 1.0)
   */
  diceCoefficient(a, b) {
    const bigramsA = this._bigrams(a);
    const bigramsB = this._bigrams(b);

    if (bigramsA.size === 0 || bigramsB.size === 0) return 0;

    let intersection = 0;
    for (const bg of bigramsA) {
      if (bigramsB.has(bg)) intersection++;
    }

    return (2 * intersection) / (bigramsA.size + bigramsB.size);
  }

  /**
   * Extract domain from URL.
   * @param {string} url - Content URL
   * @returns {string}
   */
  _extractDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return 'unknown';
    }
  }

  /**
   * Look up a cached scoring result for similar content.
   * @param {string} title - Content title
   * @param {string} url - Content URL (for domain matching)
   * @returns {Promise<{ hit: boolean, result?: Object, similarity?: number, cachedTitle?: string }>}
   */
  async lookup(title, url) {
    if (!this.enabled) {
      return { hit: false };
    }

    await this._ensureLoaded();

    const domain = this._extractDomain(url);

    for (const entry of this.entries) {
      // Must be same domain
      if (entry.domain !== domain) continue;

      // Check title similarity
      const sim = this.diceCoefficient(title, entry.title);
      if (sim >= this.titleSimilarityThreshold) {
        entry.hits++;
        this.sessionHits++;
        return {
          hit: true,
          result: entry.result,
          similarity: Math.round(sim * 1000) / 1000,
          cachedTitle: entry.title,
        };
      }
    }

    this.sessionMisses++;
    return { hit: false };
  }

  /**
   * Store a scoring result in the cache.
   * @param {string} title - Content title
   * @param {string} url - Content URL
   * @param {Object} result - Scoring result from LLM judge
   * @returns {Promise<void>}
   */
  async store(title, url, result) {
    if (!this.enabled) return;

    await this._ensureLoaded();

    const domain = this._extractDomain(url);

    // Check if a similar entry already exists (update instead of duplicating)
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].domain === domain) {
        const sim = this.diceCoefficient(title, this.entries[i].title);
        if (sim >= 0.9) {
          // Update existing entry
          this.entries[i].result = result;
          this.entries[i].createdAt = Date.now();
          await this._save();
          return;
        }
      }
    }

    // Add new entry
    this.entries.push({
      key: `${domain}:${title.slice(0, 50)}`,
      title,
      domain,
      result,
      createdAt: Date.now(),
      hits: 0,
    });

    // Enforce max entries (remove oldest)
    if (this.entries.length > this.maxEntries) {
      this.entries.sort((a, b) => a.createdAt - b.createdAt);
      this.entries.splice(0, this.entries.length - this.maxEntries);
    }

    await this._save();
  }

  /**
   * Get cache statistics.
   * @returns {Promise<CacheStats>}
   */
  async getStats() {
    await this._ensureLoaded();
    const evictions = this._evictExpired();

    return {
      entries: this.entries.length,
      hits: this.sessionHits,
      misses: this.sessionMisses,
      evictions,
    };
  }

  /**
   * Clear all cache entries.
   * @returns {Promise<void>}
   */
  async clear() {
    this.entries = [];
    this.sessionHits = 0;
    this.sessionMisses = 0;
    await this._save();
  }

  /**
   * Get summary for daily digest.
   * @returns {string}
   */
  getSummary() {
    const total = this.sessionHits + this.sessionMisses;
    const hitRate = total > 0 ? ((this.sessionHits / total) * 100).toFixed(0) : 0;
    return `Cache: ${this.entries.length} entries, ${this.sessionHits} hits / ${this.sessionMisses} misses (${hitRate}% hit rate)`;
  }
}
