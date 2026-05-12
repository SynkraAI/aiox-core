'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const crypto = require('crypto');

const DEFAULT_REGISTRY_PATH = path.resolve(__dirname, '../../data/entity-registry.yaml');

const EMPTY_REGISTRY = {
  metadata: { version: '1.0.0', lastUpdated: null, entityCount: 0, checksumAlgorithm: 'sha256' },
  entities: {},
  categories: [],
};

class RegistryLoader {
  constructor(registryPath) {
    this._registryPath = registryPath || DEFAULT_REGISTRY_PATH;
    this._registry = null;
    this._cache = new Map();
    this._keywordIndex = null;
  }

  /**
   * Load and parse the entity registry YAML file.
   * Returns empty registry if file is missing (first run) or empty.
   */
  load() {
    this._cache.clear();
    this._keywordIndex = null;

    if (!fs.existsSync(this._registryPath)) {
      console.info(`[IDS] Registry file not found at ${this._registryPath}. Returning empty registry.`);
      this._registry = structuredClone(EMPTY_REGISTRY);
      return this._registry;
    }

    let content;
    try {
      content = fs.readFileSync(this._registryPath, 'utf8');
    } catch (err) {
      throw new Error(`[IDS] Failed to read registry at ${this._registryPath}: ${err.message}`);
    }

    if (!content || !content.trim()) {
      console.info('[IDS] Registry file is empty. Returning empty registry.');
      this._registry = structuredClone(EMPTY_REGISTRY);
      return this._registry;
    }

    try {
      this._registry = yaml.load(content);
    } catch (err) {
      throw new Error(`[IDS] Failed to parse registry at ${this._registryPath}: ${err.message}`);
    }

    if (!this._registry || !this._registry.entities) {
      this._registry = structuredClone(EMPTY_REGISTRY);
    }

    return this._registry;
  }

  /**
   * Ensure registry is loaded before querying.
   */
  _ensureLoaded() {
    if (!this._registry) {
      this.load();
    }
  }

  /**
   * Get all entities as a flat array of { id, category, ...entityData }.
   */
  _getAllEntities() {
    this._ensureLoaded();

    const cacheKey = '__allEntities';
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }

    const result = [];
    const entities = this._registry.entities || {};

    for (const [category, categoryEntities] of Object.entries(entities)) {
      if (!categoryEntities || typeof categoryEntities !== 'object') continue;
      for (const [entityId, entityData] of Object.entries(categoryEntities)) {
        result.push({ id: entityId, category, ...entityData });
      }
    }

    this._cache.set(cacheKey, result);
    return result;
  }

  /**
   * Build inverted keyword index for fast lookup.
   */
  _buildKeywordIndex() {
    if (this._keywordIndex) return this._keywordIndex;

    this._keywordIndex = new Map();
    const allEntities = this._getAllEntities();

    for (const entity of allEntities) {
      const keywords = entity.keywords || [];
      for (const kw of keywords) {
        const lower = kw.toLowerCase();
        if (!this._keywordIndex.has(lower)) {
          this._keywordIndex.set(lower, []);
        }
        this._keywordIndex.get(lower).push(entity);
      }
    }

    return this._keywordIndex;
  }

  /**
   * Query entities by keywords. Returns entities matching ANY of the given keywords.
   */
  queryByKeywords(keywords) {
    if (!keywords || !keywords.length) return [];
    this._ensureLoaded();

    const index = this._buildKeywordIndex();
    const seen = new Set();
    const result = [];

    for (const kw of keywords) {
      const lower = kw.toLowerCase();
      const matches = index.get(lower) || [];
      for (const entity of matches) {
        if (!seen.has(entity.id)) {
          seen.add(entity.id);
          result.push(entity);
        }
      }
    }

    return result;
  }

  /**
   * Query entities by type (task, template, script, module, agent, checklist, data).
   */
  queryByType(type) {
    if (!type) return [];
    this._ensureLoaded();

    const cacheKey = `type:${type}`;
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }

    const result = this._getAllEntities().filter(
      (e) => e.type && e.type.toLowerCase() === type.toLowerCase(),
    );

    this._cache.set(cacheKey, result);
    return result;
  }

  /**
   * Query entities by path pattern (substring match).
   */
  queryByPath(pathPattern) {
    if (!pathPattern) return [];
    this._ensureLoaded();

    const lower = pathPattern.toLowerCase();
    return this._getAllEntities().filter(
      (e) => e.path && e.path.toLowerCase().includes(lower),
    );
  }

  /**
   * Query entities by purpose text (substring match, case-insensitive).
   */
  queryByPurpose(purposeText) {
    if (!purposeText) return [];
    this._ensureLoaded();

    const lower = purposeText.toLowerCase();
    return this._getAllEntities().filter(
      (e) => e.purpose && e.purpose.toLowerCase().includes(lower),
    );
  }

  /**
   * Get both usedBy and dependencies for an entity.
   */
  getRelationships(entityId) {
    this._ensureLoaded();
    const entity = this._findById(entityId);
    if (!entity) return { usedBy: [], dependencies: [] };
    return {
      usedBy: entity.usedBy || [],
      dependencies: entity.dependencies || [],
    };
  }

  /**
   * Get entities that use the given entity.
   */
  getUsedBy(entityId) {
    return this.getRelationships(entityId).usedBy;
  }

  /**
   * Get dependencies of the given entity.
   */
  getDependencies(entityId) {
    return this.getRelationships(entityId).dependencies;
  }

  /**
   * Find an entity by its ID across all categories.
   */
  _findById(entityId) {
    if (!entityId) return null;

    const cacheKey = `id:${entityId}`;
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }

    const entity = this._getAllEntities().find((e) => e.id === entityId) || null;
    this._cache.set(cacheKey, entity);
    return entity;
  }

  /**
   * Get entity with code intelligence metadata (Story NOG-2).
   * @param {string} entityId - Entity ID
   * @returns {Object|null} Entity with codeIntelMetadata or null
   */
  getEntityWithIntel(entityId) {
    const entity = this._findById(entityId);
    if (!entity) return null;
    return {
      ...entity,
      codeIntelMetadata: entity.codeIntelMetadata || null,
    };
  }

  /**
   * Query entities by keywords with optional role filter (Story NOG-2).
   * @param {string[]} keywords - Keywords to search
   * @param {Object} [options]
   * @param {string} [options.role] - Filter by codeIntelMetadata.role
   * @returns {Object[]} Matching entities
   */
  findByKeyword(keywords, options = {}) {
    const results = this.queryByKeywords(keywords);
    if (!options.role) return results;
    return results.filter(
      (e) => e.codeIntelMetadata && e.codeIntelMetadata.role === options.role,
    );
  }

  /**
   * Get registry metadata.
   */
  getMetadata() {
    this._ensureLoaded();
    return this._registry.metadata || {};
  }

  /**
   * Get categories list.
   */
  getCategories() {
    this._ensureLoaded();
    return this._registry.categories || [];
  }

  /**
   * Get total entity count from actual data.
   */
  getEntityCount() {
    return this._getAllEntities().length;
  }

  /**
   * Verify checksum of an entity's source file.
   */
  verifyChecksum(entityId, repoRoot) {
    if (!entityId || !repoRoot) return null;

    const entity = this._findById(entityId);
    if (!entity || !entity.checksum || !entity.path) return null;

    const filePath = path.resolve(repoRoot, entity.path);
    if (!fs.existsSync(filePath)) return false;

    try {
      const content = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const expected = entity.checksum.replace('sha256:', '');
      return hash === expected;
    } catch (err) {
      throw new Error(`[IDS] Failed to verify checksum for ${entityId}: ${err.message}`);
    }
  }
}

module.exports = { RegistryLoader, DEFAULT_REGISTRY_PATH, EMPTY_REGISTRY };
