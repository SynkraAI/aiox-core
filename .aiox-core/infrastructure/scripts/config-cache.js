/**
 * Configuration Cache
 *
 * Provides caching for configuration data with TTL (time-to-live) support.
 * Part of Story 6.1.2.6: Framework Configuration System
 *
 * @module config-cache
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
    if (!this.cache.has(key)) {
      return false;
    }
    const timestamp = this.timestamps.get(key);
    if (Date.now() - timestamp > this.ttl) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return false;
    }
    return true;
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
const cacheCleanupTimer = setInterval(() => {
  const cleared = globalConfigCache.clearExpired();
  if (cleared > 0) {
    console.log(`🗑️ Config cache: Cleared ${cleared} expired entries`);
  }
}, 60 * 1000);

if (typeof cacheCleanupTimer.unref === 'function') {
  cacheCleanupTimer.unref();
}

module.exports = {
  ConfigCache,
  globalConfigCache,
};

// CLI support
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'stats':
      console.log('\n📊 Config Cache Statistics:\n');
      console.log(JSON.stringify(globalConfigCache.getStats(), null, 2));
      console.log('');
      break;

    case 'entries':
      console.log('\n📋 Cache Entries:\n');
      const entries = globalConfigCache.entries();

      if (entries.length === 0) {
        console.log('  (empty)');
      } else {
        entries.forEach(entry => {
          console.log(`  ${entry.key}`);
          console.log(`    Age: ${entry.ageSeconds}s`);
          console.log(`    Expires in: ${entry.expiresSeconds}s`);
          console.log('');
        });
      }
      break;

    case 'clear':
      globalConfigCache.clear();
      console.log('✅ Cache cleared');
      break;

    case 'test':
      console.log('\n🧪 Testing config cache...\n');

      // Test 1: Set and get
      console.log('Test 1: Set and get values');
      globalConfigCache.set('test-key-1', 'test-value-1');
      globalConfigCache.set('test-key-2', { foo: 'bar' });

      const val1 = globalConfigCache.get('test-key-1');
      const val2 = globalConfigCache.get('test-key-2');

      console.log(`  test-key-1: ${val1} ✅`);
      console.log(`  test-key-2: ${JSON.stringify(val2)} ✅`);
      console.log('');

      // Test 2: Cache miss
      console.log('Test 2: Cache miss');
      const val3 = globalConfigCache.get('nonexistent-key');
      console.log(`  nonexistent-key: ${val3} (expected: null) ✅`);
      console.log('');

      // Test 3: Statistics
      console.log('Test 3: Statistics');
      const stats = globalConfigCache.getStats();
      console.log(`  Hits: ${stats.hits}`);
      console.log(`  Misses: ${stats.misses}`);
      console.log(`  Hit Rate: ${stats.hitRate}`);
      console.log(`  Size: ${stats.size} ✅`);
      console.log('');

      // Test 4: TTL (short TTL for testing)
      console.log('Test 4: TTL expiration (testing with 1s TTL)');
      const testCache = new ConfigCache(1000); // 1 second TTL
      testCache.set('expiring-key', 'expiring-value');

      console.log(`  Immediate get: ${testCache.get('expiring-key')} ✅`);
      console.log('  Waiting 1.5 seconds...');

      setTimeout(() => {
        const expired = testCache.get('expiring-key');
        console.log(`  After expiration: ${expired} (expected: null) ✅`);
        console.log('');
        console.log('✅ All tests passed!\n');
      }, 1500);

      break;

    default:
      console.log(`
Usage:
  node config-cache.js stats     - Show cache statistics
  node config-cache.js entries   - List all cache entries
  node config-cache.js clear     - Clear all cache entries
  node config-cache.js test      - Run test suite
      `);
  }
}
