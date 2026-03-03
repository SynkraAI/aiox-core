/**
 * Configuration Cache
 *
 * Provides caching for configuration data with TTL (time-to-live) support.
 * Part of Story 6.1.2.6: Framework Configuration System
 *
 * @module core/config/config-cache
 * @migrated Story 2.2 - Core Module Creation
 */

/**
 * Configuration Cache Class
 *
 * Caches configuration data with automatic expiration
 */
class ConfigCache {
  /**
   * Create a new ConfigCache
   *
   * @param {number} ttl - Time-to-live in milliseconds (default: 5 minutes)
   */
  constructor(ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.timestamps = new Map();
    this.ttl = ttl;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get value from cache
   *
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if not found/expired
   */
  get(key) {
    if (!this.cache.has(key)) {
      this.misses++;
      return null;
    }

    const timestamp = this.timestamps.get(key);
    const now = Date.now();

    // Check if expired
    if (now - timestamp > this.ttl) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return this.cache.get(key);
  }

  /**
   * Set value in cache
   *
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  set(key, value) {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
  }

  /**
   * Check if key exists in cache (and is not expired)
   *
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Invalidate (delete) a specific cache entry
   *
   * @param {string} key - Cache key to invalidate
   * @returns {boolean} True if entry was deleted
   */
  invalidate(key) {
    const deleted = this.cache.delete(key);
    this.timestamps.delete(key);
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Clear expired entries
   *
   * @returns {number} Number of entries cleared
   */
  clearExpired() {
    const now = Date.now();
    let cleared = 0;

    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp > this.ttl) {
        this.cache.delete(key);
        this.timestamps.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Get cache size
   *
   * @returns {number} Number of entries in cache
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   *
   * @returns {Object} Cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total * 100).toFixed(1) : '0.0';

    return {
      size: this.size,
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: `${hitRate}%`,
      ttl: this.ttl,
      ttlMinutes: (this.ttl / 1000 / 60).toFixed(1),
    };
  }

  /**
   * Reset statistics (but keep cache)
   */
  resetStats() {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get all cache keys
   *
   * @returns {string[]} Array of cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all cache entries
   *
   * @returns {Array<{key: string, value: *, age: number}>} Array of entries with age
   */
  entries() {
    const now = Date.now();
    const entries = [];

    for (const [key, value] of this.cache.entries()) {
      const timestamp = this.timestamps.get(key);
      const age = now - timestamp;

      entries.push({
        key,
        value,
        age,
        ageSeconds: (age / 1000).toFixed(1),
        expires: this.ttl - age,
        expiresSeconds: ((this.ttl - age) / 1000).toFixed(1),
      });
    }

    return entries;
  }

  /**
   * Set new TTL
   *
   * @param {number} ttl - New TTL in milliseconds
   */
  setTTL(ttl) {
    this.ttl = ttl;
  }

  /**
   * Serialize cache to JSON
   *
   * @returns {string} JSON string
   */
  toJSON() {
    return JSON.stringify({
      size: this.size,
      stats: this.getStats(),
      entries: this.entries().map(e => ({
        key: e.key,
        age: e.ageSeconds,
        expires: e.expiresSeconds,
      })),
    }, null, 2);
  }
}

// Global cache instance (singleton)
const globalConfigCache = new ConfigCache();

// Auto cleanup expired entries every minute
// .unref() allows Node.js to exit naturally when all other work is done
const _cacheCleanupTimer = setInterval(() => {
  const cleared = globalConfigCache.clearExpired();
  if (cleared > 0) {
    console.log(`🗑️ Config cache: Cleared ${cleared} expired entries`);
  }
}, 60 * 1000);
_cacheCleanupTimer.unref();

module.exports = {
  ConfigCache,
  globalConfigCache,
};
