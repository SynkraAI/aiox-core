/**
 * Service Registry Loader
 *
 * Loads and queries the service registry with caching support.
 * Provides fast lookups by ID, category, tags, and search.
 *
 * @module registry-loader
 * @version 1.0.0
 * @created Story 2.6 - Service Registry Creation
 */

const fs = require('fs').promises;
const path = require('path');

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const REGISTRY_RELATIVE_PATH = path.join('.aiox-core', 'core', 'registry', 'service-registry.json');
const PACKAGE_REGISTRY_PATH = path.join(__dirname, 'service-registry.json');

function uniquePaths(paths) {
  return Array.from(new Set(paths));
}

function getDefaultRegistryPaths() {
  return uniquePaths([
    path.join(process.cwd(), REGISTRY_RELATIVE_PATH),
    PACKAGE_REGISTRY_PATH,
  ]);
}

async function readRegistryFile(paths) {
  const errors = [];

  for (const registryPath of paths) {
    try {
      return {
        content: await fs.readFile(registryPath, 'utf8'),
        registryPath,
      };
    } catch (error) {
      errors.push(`${registryPath}: ${error.message}`);
    }
  }

  throw new Error(`Failed to load registry: ${errors.join('; ')}`);
}

/**
 * Service Registry class with caching
 */
class ServiceRegistry {
  constructor(options = {}) {
    this.registryPath = options.registryPath || null;
    this.cache = null;
    this.cacheTimestamp = 0;
    this.cacheTTL = options.cacheTTL || CACHE_TTL_MS;
    this.resolvedRegistryPath = null;

    // Indexed lookups (built on load)
    this._byId = new Map();
    this._byCategory = new Map();
    this._byTag = new Map();
    this._byAgent = new Map();
  }

  /**
   * Load registry from file with caching
   * @param {boolean} force - Force reload ignoring cache
   * @returns {Promise<object>} Registry data
   */
  async load(force = false) {
    const now = Date.now();

    // Return cached if valid
    if (!force && this.cache && (now - this.cacheTimestamp) < this.cacheTTL) {
      return this.cache;
    }

    const registryPaths = this.registryPath ? [this.registryPath] : getDefaultRegistryPaths();

    const startTime = Date.now();

    try {
      const { content, registryPath } = await readRegistryFile(registryPaths);
      this.cache = JSON.parse(content);
      this.cacheTimestamp = now;
      this.resolvedRegistryPath = registryPath;

      // Build indexes
      this._buildIndexes();

      const loadTime = Date.now() - startTime;
      if (loadTime > 500) {
        console.warn(`Registry load time exceeded 500ms: ${loadTime}ms`);
      }

      return this.cache;
    } catch (error) {
      if (error.message.startsWith('Failed to load registry:')) {
        throw error;
      }
      throw new Error(`Failed to load registry: ${error.message}`);
    }
  }

  /**
   * Build lookup indexes for fast queries
   */
  _buildIndexes() {
    this._byId.clear();
    this._byCategory.clear();
    this._byTag.clear();
    this._byAgent.clear();

    for (const worker of this.cache.workers) {
      // By ID
      this._byId.set(worker.id, worker);

      // By category
      if (!this._byCategory.has(worker.category)) {
        this._byCategory.set(worker.category, []);
      }
      this._byCategory.get(worker.category).push(worker);

      // By tags
      for (const tag of worker.tags || []) {
        if (!this._byTag.has(tag)) {
          this._byTag.set(tag, []);
        }
        this._byTag.get(tag).push(worker);
      }

      // By agent
      for (const agent of worker.agents || []) {
        if (!this._byAgent.has(agent)) {
          this._byAgent.set(agent, []);
        }
        this._byAgent.get(agent).push(worker);
      }
    }
  }

  /**
   * Get worker by ID
   * @param {string} id - Worker ID
   * @returns {object|null} Worker entry or null
   */
  async getById(id) {
    await this.load();
    return this._byId.get(id) || null;
  }

  /**
   * Get workers by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of workers
   */
  async getByCategory(category) {
    await this.load();
    return this._byCategory.get(category) || [];
  }

  /**
   * Get workers by tag
   * @param {string} tag - Tag name
   * @returns {Promise<Array>} Array of workers
   */
  async getByTag(tag) {
    await this.load();
    return this._byTag.get(tag) || [];
  }

  /**
   * Get workers by multiple tags (AND)
   * @param {string[]} tags - Array of tags
   * @returns {Promise<Array>} Workers with all tags
   */
  async getByTags(tags) {
    await this.load();

    if (tags.length === 0) return [];
    if (tags.length === 1) return this.getByTag(tags[0]);

    // Get workers with first tag, then filter by rest
    const candidates = this._byTag.get(tags[0]) || [];
    return candidates.filter(worker => {
      const workerTags = new Set(worker.tags || []);
      return tags.every(tag => workerTags.has(tag));
    });
  }

  /**
   * Get workers for an agent
   * @param {string} agent - Agent ID
   * @returns {Promise<Array>} Workers for the agent
   */
  async getForAgent(agent) {
    await this.load();
    return this._byAgent.get(agent) || [];
  }

  /**
   * Search workers by query
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<Array>} Matching workers
   */
  async search(query, options = {}) {
    await this.load();

    const queryLower = query.toLowerCase();
    const { category, maxResults = 20 } = options;

    let results = this.cache.workers.filter(worker => {
      // Filter by category if specified
      if (category && worker.category !== category) {
        return false;
      }

      // Search in ID, name, description, tags
      const searchText = [
        worker.id,
        worker.name,
        worker.description,
        ...(worker.tags || []),
      ].join(' ').toLowerCase();

      return searchText.includes(queryLower);
    });

    // Score and sort by relevance
    results = results.map(worker => {
      let score = 0;
      if (worker.id.includes(queryLower)) score += 10;
      if (worker.name.toLowerCase().includes(queryLower)) score += 8;
      if ((worker.tags || []).some(t => t.includes(queryLower))) score += 5;
      if (worker.description.toLowerCase().includes(queryLower)) score += 2;
      return { worker, score };
    });

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, maxResults).map(r => r.worker);
  }

  /**
   * Get all workers
   * @returns {Promise<Array>} All workers
   */
  async getAll() {
    await this.load();
    return this.cache.workers;
  }

  /**
   * Get registry metadata
   * @returns {Promise<object>} Registry info
   */
  async getInfo() {
    await this.load();
    return {
      version: this.cache.version,
      generated: this.cache.generated,
      totalWorkers: this.cache.totalWorkers,
      categories: Object.keys(this.cache.categories),
    };
  }

  /**
   * Get category summary
   * @returns {Promise<object>} Categories with counts
   */
  async getCategories() {
    await this.load();
    return this.cache.categories;
  }

  /**
   * Get all unique tags
   * @returns {Promise<string[]>} Array of tags
   */
  async getTags() {
    await this.load();
    return Array.from(this._byTag.keys()).sort();
  }

  /**
   * Check if worker exists
   * @param {string} id - Worker ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(id) {
    await this.load();
    return this._byId.has(id);
  }

  /**
   * Get worker count
   * @returns {Promise<number>} Total workers
   */
  async count() {
    await this.load();
    return this.cache.totalWorkers;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = null;
    this.cacheTimestamp = 0;
    this.resolvedRegistryPath = null;
    this._byId.clear();
    this._byCategory.clear();
    this._byTag.clear();
    this._byAgent.clear();
  }

  /**
   * Get performance metrics
   * @returns {object} Cache metrics
   */
  getMetrics() {
    return {
      cached: this.cache !== null,
      cacheAge: this.cache ? Date.now() - this.cacheTimestamp : null,
      registryPath: this.resolvedRegistryPath,
      workerCount: this._byId.size,
      categoryCount: this._byCategory.size,
      tagCount: this._byTag.size,
    };
  }
}

// Singleton instance
let _instance = null;

/**
 * Get registry singleton
 * @param {object} options - Registry options
 * @returns {ServiceRegistry} Registry instance
 */
function getRegistry(options = {}) {
  if (!_instance || options.fresh) {
    _instance = new ServiceRegistry(options);
  }
  return _instance;
}

/**
 * Quick load function
 * @param {string} registryPath - Optional path to registry file
 * @returns {Promise<object>} Registry data
 */
async function loadRegistry(registryPath = null) {
  const registry = getRegistry({ registryPath });
  return registry.load();
}

// Export both class and helpers
module.exports = {
  ServiceRegistry,
  getRegistry,
  getDefaultRegistryPaths,
  loadRegistry,
};
