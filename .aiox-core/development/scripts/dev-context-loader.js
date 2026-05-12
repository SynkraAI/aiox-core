/**
 * Dev Context Loader - Optimized File Loading for @dev Agent
 *
 * Loads devLoadAlwaysFiles with smart caching and summarization.
 * Reduces ~2,300 lines to ~500 lines summary on initial load.
 * Full files loaded only when needed for specific tasks.
 *
 * Part of Story 6.1.2.6 Performance Optimization
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const CACHE_DIR = path.join(process.cwd(), '.aiox', 'cache');
const CACHE_TTL = 3600 * 1000; // 1 hour

class DevContextLoader {
  constructor() {
    this.coreConfigPath = path.join(process.cwd(), '.aiox-core', 'core-config.yaml');
    this.summaryCache = new Map();
    this.cacheDir = CACHE_DIR; // Make configurable for testing
  }

  /**
   * Load dev context files with smart caching
   *
   * @param {Object} options - Load options
   * @param {boolean} options.fullLoad - Load full files instead of summaries
   * @param {boolean} options.skipCache - Skip cache and force reload
   * @returns {Promise<Object>} Context data
   */
  async load(options = {}) {
    const fullLoad = options.fullLoad || false;
    const skipCache = options.skipCache || false;

    const startTime = Date.now();

    // Load core config to get devLoadAlwaysFiles list
    // TD-6: Handle null/undefined coreConfig gracefully
    const coreConfig = await this.loadCoreConfig();
    const fileList = (coreConfig && coreConfig.devLoadAlwaysFiles) || [];

    if (fileList.length === 0) {
      return {
        status: 'no_files',
        loadTime: Date.now() - startTime,
        files: [],
      };
    }

    // Load files (with cache)
    const files = await this.loadFiles(fileList, { fullLoad, skipCache });

    const loadTime = Date.now() - startTime;

    return {
      status: 'loaded',
      loadTime,
      loadStrategy: fullLoad ? 'full' : 'summary',
      files,
      filesCount: files.length,
      totalLines: files.reduce((sum, f) => sum + (f.linesCount || 0), 0),
      cacheHits: files.filter((f) => f.cached).length,
    };
  }

  /**
   * Load core config
   *
   * @returns {Promise<Object>} Core configuration
   */
  async loadCoreConfig() {
    try {
      const content = await fs.readFile(this.coreConfigPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      console.warn('⚠️ Could not load core-config.yaml:', error.message);
      return {};
    }
  }

  /**
   * Load files with caching
   *
   * @param {Array<string>} fileList - List of file paths
   * @param {Object} options - Load options
   * @returns {Promise<Array>} Loaded files
   */
  async loadFiles(fileList, options = {}) {
    const { fullLoad, skipCache } = options;
    const results = [];

    for (const filePath of fileList) {
      const absolutePath = path.join(process.cwd(), filePath);

      try {
        // Check if file exists
        await fs.access(absolutePath);

        // Try to load from cache
        if (!skipCache) {
          const cached = await this.loadFromCache(filePath, fullLoad);
          if (cached) {
            results.push({ ...cached, cached: true });
            continue;
          }
        }

        // Load from disk
        const content = await fs.readFile(absolutePath, 'utf8');
        const lines = content.split('\n');
        const linesCount = lines.length;

        let fileData;
        if (fullLoad) {
          // Full load
          fileData = {
            path: filePath,
            content,
            linesCount,
            cached: false,
          };
        } else {
          // Summary load
          const summary = this.generateSummary(filePath, content, lines);
          fileData = {
            path: filePath,
            summary,
            linesCount,
            summaryLines: summary.split('\n').length,
            cached: false,
            note: 'Use *load-full to load complete file',
          };
        }

        // Save to cache
        await this.saveToCache(filePath, fileData, fullLoad);

        results.push(fileData);
      } catch (error) {
        // File not found or read error - continue
        console.warn(`⚠️ Could not load ${filePath}:`, error.message);
        results.push({
          path: filePath,
          error: error.message,
          cached: false,
        });
      }
    }

    return results;
  }

  /**
   * Generate file summary (first 100 lines + key sections)
   *
   * @param {string} filePath - File path
   * @param {string} content - Full content
   * @param {Array<string>} lines - Content lines
   * @returns {string} Summary
   */
  generateSummary(filePath, content, lines) {
    const fileName = path.basename(filePath);

    // Extract key sections (h1, h2 headers)
    const headers = lines.filter((line) => line.match(/^#{1,2}\s+/)).slice(0, 20); // First 20 headers

    // First 100 lines
    const preview = lines.slice(0, 100);

    const summary = [
      `📄 ${fileName} (${lines.length} lines)`,
      '',
      '## Key Sections:',
      ...headers.map((h) => `- ${h.replace(/^#+\s*/, '')}`),
      '',
      '## Preview (first 100 lines):',
      '```',
      ...preview,
      '```',
      '',
      `...and ${Math.max(0, lines.length - 100)} more lines`,
    ];

    return summary.join('\n');
  }

  /**
   * Load from cache
   *
   * @param {string} filePath - File path
   * @param {boolean} fullLoad - Full load flag
   * @returns {Promise<Object|null>} Cached data or null
   */
  async loadFromCache(filePath, fullLoad) {
    const cacheKey = this.getCacheKey(filePath, fullLoad);
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);

    try {
      const stat = await fs.stat(cachePath);
      const age = Date.now() - stat.mtimeMs;

      if (age > CACHE_TTL) {
        // Cache expired
        return null;
      }

      const cached = JSON.parse(await fs.readFile(cachePath, 'utf8'));
      return cached;
    } catch (_error) {
      // Cache miss
      return null;
    }
  }

  /**
   * Save to cache
   *
   * @param {string} filePath - File path
   * @param {Object} data - Data to cache
   * @param {boolean} fullLoad - Full load flag
   * @returns {Promise<void>}
   */
  async saveToCache(filePath, data, fullLoad) {
    const cacheKey = this.getCacheKey(filePath, fullLoad);
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);

    try {
      // Ensure cache directory exists
      await fs.mkdir(this.cacheDir, { recursive: true });

      await fs.writeFile(cachePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      // Cache write error - not critical
      console.warn('⚠️ Could not save cache:', error.message);
    }
  }

  /**
   * Get cache key for file
   *
   * @param {string} filePath - File path
   * @param {boolean} fullLoad - Full load flag
   * @returns {string} Cache key
   */
  getCacheKey(filePath, fullLoad) {
    const normalized = filePath.replace(/[^a-zA-Z0-9]/g, '_');
    const type = fullLoad ? 'full' : 'summary';
    return `devcontext_${normalized}_${type}`;
  }

  /**
   * Clear cache
   *
   * @returns {Promise<void>}
   */
  async clearCache() {
    try {
      const files = await fs.readdir(this.cacheDir);
      const devContextFiles = files.filter((f) => f.startsWith('devcontext_'));

      for (const file of devContextFiles) {
        await fs.unlink(path.join(this.cacheDir, file));
      }

      console.log(`✅ Cleared ${devContextFiles.length} cache files`);
    } catch (error) {
      console.warn('⚠️ Could not clear cache:', error.message);
    }
  }
}

// CLI Interface
if (require.main === module) {
  const loader = new DevContextLoader();
  const command = process.argv[2];

  (async () => {
    if (command === 'clear-cache') {
      await loader.clearCache();
    } else if (command === 'load-full') {
      const result = await loader.load({ fullLoad: true });
      console.log(JSON.stringify(result, null, 2));
    } else {
      // Default: summary load
      const result = await loader.load({ fullLoad: false });
      console.log(JSON.stringify(result, null, 2));
    }
  })().catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = DevContextLoader;
