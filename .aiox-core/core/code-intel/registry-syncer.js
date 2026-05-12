'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { getClient, isCodeIntelAvailable } = require('../code-intel');
const { RegistryLoader, DEFAULT_REGISTRY_PATH } = require('../ids/registry-loader');

// Role inference from entity path (order matters: more specific patterns first)
const ROLE_MAP = [
  ['tasks/', 'task'],
  ['templates/', 'template'],
  ['agents/', 'agent'],
  ['workflows/', 'workflow'],
  ['scripts/', 'script'],
  ['/data/', 'config'],
  ['/core/', 'module'],
];

/**
 * Infer entity role from its file path.
 * @param {string} entityPath - Entity source path
 * @returns {string} Inferred role
 */
function inferRole(entityPath) {
  if (!entityPath) return 'unknown';
  const normalized = entityPath.replace(/\\/g, '/');
  for (const [pattern, role] of ROLE_MAP) {
    if (normalized.includes(pattern)) return role;
  }
  return 'unknown';
}

/**
 * RegistrySyncer — Enriches entity registry with code intelligence data.
 *
 * Features:
 * - Batch enrichment of usedBy, dependencies, keywords via code intelligence
 * - Incremental sync (mtime-based) and full resync (--full flag)
 * - Atomic write (temp file + rename) to prevent registry corruption
 * - Graceful fallback when no provider is available
 */
class RegistrySyncer {
  /**
   * @param {Object} [options]
   * @param {string} [options.registryPath] - Path to entity-registry.yaml
   * @param {string} [options.repoRoot] - Repository root for resolving entity paths
   * @param {Object} [options.client] - Code intel client (for testing injection)
   * @param {Function} [options.logger] - Logger function (defaults to console.log)
   */
  constructor(options = {}) {
    this._registryPath = options.registryPath || DEFAULT_REGISTRY_PATH;
    this._repoRoot = options.repoRoot || path.resolve(__dirname, '../../../');
    this._client = options.client || null;
    this._logger = options.logger || console.log;
    this._stats = { processed: 0, skipped: 0, errors: 0, total: 0 };
  }

  /**
   * Get code intel client (lazy, allows injection for testing).
   * @returns {Object|null}
   */
  _getClient() {
    if (this._client) return this._client;
    return getClient();
  }

  /**
   * Sync the entity registry with code intelligence data.
   * @param {Object} [options]
   * @param {boolean} [options.full=false] - Force full resync (ignore lastSynced)
   * @returns {Promise<Object>} Sync stats
   */
  async sync(options = {}) {
    const isFull = options.full === true;

    // AC5: Fallback — check provider availability first
    if (!this._isProviderAvailable()) {
      this._logger('[registry-syncer] No code intelligence provider available, skipping enrichment');
      return { processed: 0, skipped: 0, errors: 0, total: 0, aborted: true };
    }

    // Load registry
    const loader = new RegistryLoader(this._registryPath);
    const registry = loader.load();
    const entities = registry.entities || {};

    // Flatten all entities for iteration
    const allEntities = [];
    for (const [category, categoryEntities] of Object.entries(entities)) {
      if (!categoryEntities || typeof categoryEntities !== 'object') continue;
      for (const [entityId, entityData] of Object.entries(categoryEntities)) {
        allEntities.push({ id: entityId, category, data: entityData });
      }
    }

    this._stats = { processed: 0, skipped: 0, errors: 0, total: allEntities.length };
    this._logger(`[registry-syncer] Starting ${isFull ? 'full' : 'incremental'} sync of ${allEntities.length} entities`);

    // Iterate and enrich
    for (const entity of allEntities) {
      try {
        const wasProcessed = await this.syncEntity(entity, entities, isFull);
        if (wasProcessed) {
          this._stats.processed++;
        } else {
          this._stats.skipped++;
        }
      } catch (error) {
        this._stats.errors++;
        this._logger(`[registry-syncer] Error enriching ${entity.id}: ${error.message}`);
      }
    }

    // Update metadata
    registry.metadata = registry.metadata || {};
    registry.metadata.lastUpdated = new Date().toISOString();
    registry.metadata.entityCount = allEntities.length;

    // Atomic write
    this._atomicWrite(this._registryPath, registry);

    this._logger(`[registry-syncer] Sync complete: ${this._stats.processed} processed, ${this._stats.skipped} skipped, ${this._stats.errors} errors`);
    return { ...this._stats };
  }

  /**
   * Enrich a single entity with code intelligence data.
   * @param {Object} entity - { id, category, data }
   * @param {Object} entities - Full entities map (for cross-reference)
   * @param {boolean} isFull - Force full resync
   * @returns {Promise<boolean>} true if entity was processed, false if skipped
   */
  async syncEntity(entity, entities, isFull) {
    const { id, data } = entity;
    const sourcePath = data.path;

    // Skip entities without source path
    if (!sourcePath) {
      return false;
    }

    // AC6: Incremental sync — check mtime vs lastSynced
    if (!isFull) {
      const shouldSkip = this._shouldSkipIncremental(data);
      if (shouldSkip) {
        return false;
      }
    }

    const client = this._getClient();
    const now = new Date().toISOString();

    // AC2: Populate usedBy via findReferences
    const usedByIds = await this._findUsedBy(client, id, entities);
    if (usedByIds !== null) {
      data.usedBy = usedByIds;
    }

    // AC3: Populate dependencies via analyzeDependencies (JS/TS files only)
    const deps = await this._findDependencies(client, sourcePath);
    if (deps !== null) {
      data.dependencies = deps;
    }

    // AC4: Populate codeIntelMetadata
    const callerCount = Array.isArray(data.usedBy) ? data.usedBy.length : 0;
    data.codeIntelMetadata = {
      callerCount,
      role: inferRole(sourcePath),
      lastSynced: now,
      provider: client._activeProvider ? client._activeProvider.name : 'unknown',
    };

    return true;
  }

  /**
   * Check if provider is available.
   * @returns {boolean}
   * @private
   */
  _isProviderAvailable() {
    if (this._client) {
      return typeof this._client.findReferences === 'function';
    }
    return isCodeIntelAvailable();
  }

  /**
   * Check if entity should be skipped in incremental mode.
   * @param {Object} entityData
   * @returns {boolean} true if should skip
   * @private
   */
  _shouldSkipIncremental(entityData) {
    const metadata = entityData.codeIntelMetadata;

    // Entities without lastSynced are always processed (AC6)
    if (!metadata || !metadata.lastSynced) {
      return false;
    }

    // Get file mtime
    const sourcePath = entityData.path;
    if (!sourcePath) return true;

    const fullPath = path.resolve(this._repoRoot, sourcePath);
    try {
      const stat = fs.statSync(fullPath);
      const lastSyncedMs = new Date(metadata.lastSynced).getTime();
      // Skip if file hasn't changed since last sync
      return stat.mtimeMs <= lastSyncedMs;
    } catch (_error) {
      // File doesn't exist — clear metadata and skip
      this._logger(`[registry-syncer] Warning: source file not found for ${sourcePath}, skipping`);
      return true;
    }
  }

  /**
   * Find entities that reference this entity (usedBy).
   * @param {Object} client - Code intel client
   * @param {string} entityId - Entity ID to search for
   * @param {Object} entities - Full entities map for cross-referencing
   * @returns {Promise<string[]|null>} Array of entity IDs or null on failure
   * @private
   */
  async _findUsedBy(client, entityId, entities) {
    try {
      const references = await client.findReferences(entityId);
      if (!references || !Array.isArray(references)) return null;

      // Cross-reference with registry to get entity IDs
      const usedByIds = [];
      for (const ref of references) {
        const refPath = ref.file || ref.path || ref;
        if (typeof refPath !== 'string') continue;

        const matchedId = this._findEntityByPath(refPath, entities);
        if (matchedId && matchedId !== entityId) {
          usedByIds.push(matchedId);
        }
      }

      return [...new Set(usedByIds)]; // Deduplicate
    } catch (_error) {
      return null;
    }
  }

  /**
   * Find dependencies of a source file.
   * @param {Object} client - Code intel client
   * @param {string} sourcePath - Source file path
   * @returns {Promise<string[]|null>} Array of dependency names or null on failure
   * @private
   */
  async _findDependencies(client, sourcePath) {
    // Only analyze JS/TS files for import dependencies
    if (!sourcePath.match(/\.(js|ts|mjs|cjs)$/)) return null;

    try {
      const fullPath = path.resolve(this._repoRoot, sourcePath);
      const result = await client.analyzeDependencies(fullPath);
      if (!result) return null;

      // Filter to internal project dependencies only
      const deps = [];
      const items = result.dependencies || result.imports || result;
      if (!Array.isArray(items)) return null;

      for (const dep of items) {
        const depPath = dep.path || dep.source || dep;
        if (typeof depPath !== 'string') continue;
        // Internal deps: relative paths or project paths (not node_modules)
        if (depPath.startsWith('.') || depPath.startsWith('/') || depPath.includes('.aiox-core')) {
          deps.push(depPath);
        }
      }

      return deps;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Find entity ID by file path (cross-reference lookup).
   * @param {string} filePath - File path from reference
   * @param {Object} entities - Full entities map
   * @returns {string|null} Entity ID or null
   * @private
   */
  _findEntityByPath(filePath, entities) {
    const normalized = filePath.replace(/\\/g, '/');
    for (const [_category, categoryEntities] of Object.entries(entities)) {
      if (!categoryEntities || typeof categoryEntities !== 'object') continue;
      for (const [entityId, entityData] of Object.entries(categoryEntities)) {
        if (entityData.path && normalized.includes(entityData.path.replace(/\\/g, '/'))) {
          return entityId;
        }
      }
    }
    return null;
  }

  /**
   * Atomic write: write to temp file then rename.
   * Prevents partial corruption if process crashes mid-write.
   * @param {string} registryPath - Target path
   * @param {Object} registry - Registry data to write
   * @private
   */
  _atomicWrite(registryPath, registry) {
    const tmpPath = registryPath + '.tmp';
    const content = yaml.dump(registry, { lineWidth: 120, noRefs: true });
    fs.writeFileSync(tmpPath, content, 'utf8');
    fs.renameSync(tmpPath, registryPath);
  }

  /**
   * Get sync statistics from last run.
   * @returns {Object}
   */
  getStats() {
    return { ...this._stats };
  }
}

module.exports = { RegistrySyncer, inferRole, ROLE_MAP };
