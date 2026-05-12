'use strict';

const { getClient, isCodeIntelAvailable } = require('../../code-intel');
const { RegistryLoader } = require('../../ids/registry-loader');

/**
 * Data source that provides normalized graph data from code-intel
 * or falls back to entity-registry.yaml when provider is offline.
 */
/**
 * Classify a script entity into subcategory based on its path.
 * @param {string} filePath - Entity path
 * @returns {string} 'scripts/task' | 'scripts/engine' | 'scripts/infra'
 */
function _classifyScript(filePath) {
  if (filePath.includes('/development/scripts/')) return 'scripts/task';
  if (filePath.includes('/core/')) return 'scripts/engine';
  if (filePath.includes('/infrastructure/')) return 'scripts/infra';
  return 'scripts/task';
}

/**
 * Detect fine-grained category from entity path and base category.
 * @param {string} baseCategory - Original category from registry/provider
 * @param {string} filePath - Entity path
 * @returns {string} Refined category
 */
function _detectCategory(baseCategory, filePath) {
  const path = (filePath || '').toLowerCase();

  if (path.includes('/checklists/')) return 'checklists';
  if (path.includes('/workflows/')) return 'workflows';
  if (path.includes('/utils/')) return 'utils';
  if (path.includes('/data/')) return 'data';
  if (path.includes('/tools/')) return 'tools';

  if (baseCategory === 'scripts' || path.includes('/scripts/')) {
    return _classifyScript(path);
  }

  return baseCategory;
}

class CodeIntelSource {
  /**
   * @param {Object} [options]
   * @param {number} [options.cacheTTL=5000] - Cache TTL in milliseconds
   */
  constructor(options = {}) {
    this._cache = null;
    this._cacheTimestamp = 0;
    this._cacheTTL = options.cacheTTL || 5000;
  }

  /**
   * Get normalized graph data.
   * Primary: code-intel provider (live data).
   * Fallback: entity-registry.yaml (static data).
   * @returns {Promise<Object>} { nodes, edges, source, isFallback, timestamp }
   */
  async getData() {
    if (this._cache && !this.isStale()) {
      return this._cache;
    }

    let result;

    try {
      if (isCodeIntelAvailable()) {
        const client = getClient();
        const deps = await client.analyzeDependencies('.');
        result = this._wrap(this._normalizeDeps(deps), 'code-intel', false);
      } else {
        result = this._getRegistryFallback();
      }
    } catch (_err) {
      result = this._getRegistryFallback();
    }

    this._cache = result;
    this._cacheTimestamp = Date.now();
    return result;
  }

  /**
   * Get timestamp of last successful data fetch.
   * @returns {number}
   */
  getLastUpdate() {
    return this._cacheTimestamp;
  }

  /**
   * Check if cached data is expired.
   * @returns {boolean}
   */
  isStale() {
    return Date.now() - this._cacheTimestamp > this._cacheTTL;
  }

  /**
   * Load graph data from entity-registry.yaml as fallback.
   * @returns {Object} Wrapped graph data
   */
  _getRegistryFallback() {
    try {
      const loader = new RegistryLoader();
      const registry = loader.load();
      return this._wrap(this._registryToTree(registry), 'registry', true);
    } catch (_err) {
      return this._wrap({ nodes: [], edges: [] }, 'registry', true);
    }
  }

  /**
   * Normalize analyzeDependencies output to { nodes, edges }.
   * Handles various shapes from different providers.
   * @param {*} deps - Raw output from analyzeDependencies
   * @returns {Object} { nodes: Array, edges: Array }
   */
  _normalizeDeps(deps) {
    if (!deps) {
      return { nodes: [], edges: [] };
    }

    // Already normalized format
    if (Array.isArray(deps.nodes) && Array.isArray(deps.edges)) {
      return { nodes: deps.nodes, edges: deps.edges };
    }

    // Array of dependency objects
    if (Array.isArray(deps)) {
      const nodes = [];
      const edges = [];
      const seen = new Set();

      for (const dep of deps) {
        const id = dep.id || dep.name || dep.path;
        if (!id || seen.has(id)) continue;
        seen.add(id);

        nodes.push({
          id,
          label: dep.label || dep.name || id,
          type: dep.type || 'unknown',
          path: dep.path || '',
          category: _detectCategory(dep.category || dep.type || 'other', dep.path || ''),
        });

        for (const target of dep.dependencies || dep.deps || []) {
          edges.push({ from: id, to: target, type: 'depends' });
        }
      }

      return { nodes, edges };
    }

    // Flat object with dependencies property
    if (deps.dependencies && typeof deps.dependencies === 'object') {
      return this._normalizeDeps(
        Object.entries(deps.dependencies).map(([key, val]) => ({
          id: key,
          ...((typeof val === 'object' && val) || {}),
        }))
      );
    }

    return { nodes: [], edges: [] };
  }

  /**
   * Convert entity-registry to normalized graph format.
   * Groups entities by category and maps dependencies/usedBy to edges.
   * @param {Object} registry - Loaded registry data
   * @returns {Object} { nodes: Array, edges: Array }
   */
  _registryToTree(registry) {
    const nodes = [];
    const edges = [];
    const edgeSet = new Set();

    for (const [category, entities] of Object.entries(registry.entities || {})) {
      if (!entities || typeof entities !== 'object') continue;

      for (const [entityId, entity] of Object.entries(entities)) {
        nodes.push({
          id: entityId,
          label: entityId,
          type: entity.type || category,
          path: entity.path || '',
          category: _detectCategory(category, entity.path || ''),
          lifecycle: entity.lifecycle || 'production',  // NOG-16C: pass lifecycle for graph filtering
        });

        for (const dep of entity.dependencies || []) {
          const edgeKey = `${entityId}->depends->${dep}`;
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({ from: entityId, to: dep, type: 'depends' });
          }
        }

        for (const consumer of entity.usedBy || []) {
          const edgeKey = `${consumer}->uses->${entityId}`;
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({ from: consumer, to: entityId, type: 'uses' });
          }
        }
      }
    }

    return { nodes, edges };
  }

  /**
   * Wrap data in standard result envelope.
   * @param {Object} data - { nodes, edges }
   * @param {string} source - 'code-intel' | 'registry'
   * @param {boolean} isFallback
   * @returns {Object}
   */
  _wrap(data, source, isFallback) {
    return {
      nodes: data.nodes || [],
      edges: data.edges || [],
      source,
      isFallback,
      timestamp: Date.now(),
    };
  }
}

module.exports = { CodeIntelSource, _classifyScript, _detectCategory };
