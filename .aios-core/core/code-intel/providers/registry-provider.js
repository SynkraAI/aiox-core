'use strict';

const fs = require('fs');
const path = require('path');
const { CodeIntelProvider } = require('./provider-interface');

// Layer priority for disambiguation (lower index = higher priority)
const LAYER_PRIORITY = { L1: 0, L2: 1, L3: 2, L4: 3 };

/**
 * RegistryProvider — Native code intelligence provider using Entity Registry.
 *
 * Implements 5 of 8 primitives without requiring any MCP server.
 * Data source: .aios-core/data/entity-registry.yaml (737+ entities, 14 categories).
 *
 * AST-only primitives (findCallers, findCallees, analyzeComplexity) return null.
 */
class RegistryProvider extends CodeIntelProvider {
  constructor(options = {}) {
    super('registry', options);

    this._registryPath = options.registryPath || null;
    this._registry = null;
    this._registryMtime = null;

    // In-memory indexes (built on first load)
    this._byName = null;   // Map<string, Array<Entity>>
    this._byPath = null;   // Map<string, Entity>
    this._byCategory = null; // Map<string, Array<Entity>>
    this._byKeyword = null;  // Map<string, Array<Entity>> (inverted index)
  }

  /**
   * Check if this provider is available (registry loaded and non-empty).
   * @returns {boolean}
   */
  isAvailable() {
    this._ensureLoaded();
    return this._registry !== null && this._byName !== null && this._byName.size > 0;
  }

  // --- Lazy Loading ---

  /**
   * Resolve the registry file path from options or default location.
   * @returns {string|null}
   * @private
   */
  _resolveRegistryPath() {
    if (this._registryPath) return this._registryPath;

    // Default: resolve from project root
    const projectRoot = this.options.projectRoot || process.cwd();
    const defaultPath = path.join(projectRoot, '.aios-core', 'data', 'entity-registry.yaml');

    if (fs.existsSync(defaultPath)) {
      this._registryPath = defaultPath;
      return defaultPath;
    }

    return null;
  }

  /**
   * Ensure registry is loaded (lazy-load on first call).
   * Reloads if file mtime has changed.
   * @private
   */
  _ensureLoaded() {
    const filePath = this._resolveRegistryPath();
    if (!filePath) return;

    try {
      const stat = fs.statSync(filePath);
      const currentMtime = stat.mtimeMs;

      // Already loaded and file hasn't changed
      if (this._registry && this._registryMtime === currentMtime) return;

      const content = fs.readFileSync(filePath, 'utf8');

      // Use js-yaml with JSON_SCHEMA for safe parsing (no arbitrary types)
      let yaml;
      try {
        yaml = require('js-yaml');
      } catch (_e) {
        // Fallback to yaml package
        yaml = require('yaml');
        const parsed = yaml.parse(content);
        this._buildIndexes(parsed);
        this._registryMtime = currentMtime;
        return;
      }

      const parsed = yaml.load(content, { schema: yaml.JSON_SCHEMA });
      this._buildIndexes(parsed);
      this._registryMtime = currentMtime;
    } catch (_error) {
      // Graceful degradation: if parse fails, provider returns null for all calls
      this._registry = null;
      this._byName = null;
      this._byPath = null;
      this._byCategory = null;
      this._byKeyword = null;
    }
  }

  /**
   * Build in-memory indexes from parsed registry.
   * @param {Object} parsed - Parsed YAML object
   * @private
   */
  _buildIndexes(parsed) {
    if (!parsed || !parsed.entities) {
      this._registry = null;
      this._byName = null;
      this._byPath = null;
      this._byCategory = null;
      this._byKeyword = null;
      return;
    }

    this._registry = parsed;
    this._byName = new Map();
    this._byPath = new Map();
    this._byCategory = new Map();
    this._byKeyword = new Map();

    const entities = parsed.entities;

    for (const [category, categoryEntities] of Object.entries(entities)) {
      if (!categoryEntities || typeof categoryEntities !== 'object') continue;

      // byCategory
      if (!this._byCategory.has(category)) {
        this._byCategory.set(category, []);
      }

      for (const [entityName, entityData] of Object.entries(categoryEntities)) {
        if (!entityData || typeof entityData !== 'object') continue;

        // Validate path: reject entries with '..' segments (defense-in-depth)
        if (entityData.path && entityData.path.includes('..')) continue;

        const entity = {
          name: entityName,
          category,
          ...entityData,
        };

        // byName — Map<string, Array<Entity>> to handle duplicates
        if (!this._byName.has(entityName)) {
          this._byName.set(entityName, []);
        }
        this._byName.get(entityName).push(entity);

        // byPath
        if (entityData.path) {
          this._byPath.set(entityData.path, entity);
        }

        // byCategory
        this._byCategory.get(category).push(entity);

        // byKeyword (inverted index)
        if (Array.isArray(entityData.keywords)) {
          for (const keyword of entityData.keywords) {
            const kw = String(keyword).toLowerCase();
            if (!this._byKeyword.has(kw)) {
              this._byKeyword.set(kw, []);
            }
            this._byKeyword.get(kw).push(entity);
          }
        }
      }
    }
  }

  // --- Disambiguation ---

  /**
   * Score and rank candidates for a symbol lookup.
   * Scoring: exact name+type > exact name > layer priority > alphabetical path.
   * @param {Array<Object>} candidates - Array of entity objects
   * @param {string} symbol - The search symbol
   * @param {Object} [options] - Optional type/layer hints
   * @returns {Array<Object>} Sorted candidates (best match first)
   * @private
   */
  _rankCandidates(candidates, symbol, options = {}) {
    if (!candidates || candidates.length === 0) return [];

    const symbolLower = symbol.toLowerCase();

    return candidates
      .map((entity) => {
        let score = 0;

        // Exact name match
        if (entity.name === symbol) score += 100;
        else if (entity.name.toLowerCase() === symbolLower) score += 90;

        // Type hint match
        if (options.type && entity.type === options.type) score += 50;

        // Layer priority (L1=40, L2=30, L3=20, L4=10)
        const layerPriority = LAYER_PRIORITY[entity.layer];
        if (layerPriority !== undefined) {
          score += (4 - layerPriority) * 10;
        }

        return { entity, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Tie-break: alphabetical path
        const pathA = a.entity.path || '';
        const pathB = b.entity.path || '';
        return pathA.localeCompare(pathB);
      })
      .map((item) => item.entity);
  }

  // --- Fuzzy Matching ---

  /**
   * Find entities matching a symbol using fuzzy matching.
   * Order: exact name > path contains > keywords contains.
   * @param {string} symbol - Symbol to search
   * @param {Object} [options] - Search options
   * @returns {Array<Object>} Matched entities sorted by relevance
   * @private
   */
  _fuzzyMatch(symbol, _options = {}) {
    this._ensureLoaded();
    if (!this._byName) return [];

    const symbolLower = symbol.toLowerCase();
    const results = [];
    const seen = new Set();

    // 1. Exact name match (may return multiple for duplicate names)
    const exactMatches = this._byName.get(symbol) || this._byName.get(symbolLower) || [];
    for (const entity of exactMatches) {
      const key = `${entity.name}:${entity.category}:${entity.path}`;
      if (!seen.has(key)) {
        results.push({ entity, matchType: 'exact', score: 100 });
        seen.add(key);
      }
    }

    // Also check case-insensitive
    if (exactMatches.length === 0) {
      for (const [name, entities] of this._byName) {
        if (name.toLowerCase() === symbolLower) {
          for (const entity of entities) {
            const key = `${entity.name}:${entity.category}:${entity.path}`;
            if (!seen.has(key)) {
              results.push({ entity, matchType: 'exact-ci', score: 90 });
              seen.add(key);
            }
          }
        }
      }
    }

    // 2. Path contains
    for (const [filePath, entity] of this._byPath) {
      const key = `${entity.name}:${entity.category}:${entity.path}`;
      if (seen.has(key)) continue;
      if (filePath.toLowerCase().includes(symbolLower)) {
        results.push({ entity, matchType: 'path', score: 60 });
        seen.add(key);
      }
    }

    // 3. Keywords contains
    const keywordMatches = this._byKeyword.get(symbolLower) || [];
    for (const entity of keywordMatches) {
      const key = `${entity.name}:${entity.category}:${entity.path}`;
      if (seen.has(key)) continue;
      results.push({ entity, matchType: 'keyword', score: 40 });
      seen.add(key);
    }

    // Sort by score, then by layer priority, then alphabetical path
    return results
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const layerA = LAYER_PRIORITY[a.entity.layer] ?? 99;
        const layerB = LAYER_PRIORITY[b.entity.layer] ?? 99;
        if (layerA !== layerB) return layerA - layerB;
        return (a.entity.path || '').localeCompare(b.entity.path || '');
      })
      .map((r) => r.entity);
  }

  // --- 5 Implemented Primitives ---

  async findDefinition(symbol, options = {}) {
    this._ensureLoaded();
    if (!this._byName) return null;

    const matches = this._fuzzyMatch(symbol, options);
    if (matches.length === 0) return null;

    const best = this._rankCandidates(matches, symbol, options)[0] || matches[0];

    return {
      file: best.path || null,
      line: 1,
      column: 0,
      context: best.purpose || `${best.type} in ${best.category}`,
    };
  }

  async findReferences(symbol, _options = {}) {
    this._ensureLoaded();
    if (!this._byName) return null;

    const references = [];
    const symbolLower = symbol.toLowerCase();

    // Search usedBy and dependencies fields across all entities
    for (const [_category, categoryEntities] of Object.entries(this._registry.entities)) {
      if (!categoryEntities || typeof categoryEntities !== 'object') continue;

      for (const [_entityName, entityData] of Object.entries(categoryEntities)) {
        if (!entityData || typeof entityData !== 'object') continue;

        const usedBy = Array.isArray(entityData.usedBy) ? entityData.usedBy : [];
        const deps = Array.isArray(entityData.dependencies) ? entityData.dependencies : [];

        // Check if this entity references the symbol
        const referencesSymbol =
          usedBy.some((u) => String(u).toLowerCase() === symbolLower) ||
          deps.some((d) => String(d).toLowerCase() === symbolLower);

        if (referencesSymbol) {
          references.push({
            file: entityData.path || null,
            line: 1,
            context: entityData.purpose || `References ${symbol}`,
          });
        }
      }
    }

    // Also find entities that the symbol's usedBy/deps point to
    const symbolEntities = this._byName.get(symbol) || [];
    for (const entity of symbolEntities) {
      if (Array.isArray(entity.usedBy)) {
        for (const refName of entity.usedBy) {
          const refEntities = this._byName.get(refName) || [];
          for (const ref of refEntities) {
            references.push({
              file: ref.path || null,
              line: 1,
              context: `${ref.name} uses ${symbol}`,
            });
          }
        }
      }
    }

    return references.length > 0 ? references : null;
  }

  async analyzeDependencies(targetPath, options = {}) {
    this._ensureLoaded();
    if (!this._byName || !this._registry) return null;

    const nodes = [];
    const edges = [];
    let unresolvedCount = 0;
    const visited = new Set();

    // Find entity by path or name
    let rootEntities = [];
    if (this._byPath.has(targetPath)) {
      rootEntities = [this._byPath.get(targetPath)];
    } else {
      rootEntities = this._byName.get(targetPath) || [];
    }

    if (rootEntities.length === 0) {
      // Try fuzzy match
      const fuzzy = this._fuzzyMatch(targetPath, options);
      if (fuzzy.length > 0) rootEntities = [fuzzy[0]];
    }

    const queue = [...rootEntities];

    while (queue.length > 0) {
      const entity = queue.shift();
      const entityKey = `${entity.name}:${entity.category}`;

      if (visited.has(entityKey)) continue;
      visited.add(entityKey);

      nodes.push({
        name: entity.name,
        path: entity.path || null,
        layer: entity.layer || null,
        category: entity.category || null,
      });

      const deps = Array.isArray(entity.dependencies) ? entity.dependencies : [];
      for (const depName of deps) {
        const depEntities = this._byName.get(depName);
        if (depEntities && depEntities.length > 0) {
          const dep = depEntities[0]; // Take first match
          edges.push({
            from: entity.name,
            to: dep.name,
            resolved: true,
          });

          const depKey = `${dep.name}:${dep.category}`;
          if (!visited.has(depKey)) {
            queue.push(dep);
          }
        } else {
          // Unresolved dependency
          edges.push({
            from: entity.name,
            to: depName,
            resolved: false,
          });
          unresolvedCount++;
        }
      }
    }

    return {
      nodes,
      edges,
      unresolvedCount,
    };
  }

  async analyzeCodebase(targetPath, _options = {}) {
    this._ensureLoaded();
    if (!this._byCategory) return null;

    const files = [];
    const structure = {};
    const patterns = [];

    for (const [category, entities] of this._byCategory) {
      structure[category] = {
        count: entities.length,
        layers: {},
      };

      for (const entity of entities) {
        if (entity.path) files.push(entity.path);

        const layer = entity.layer || 'unknown';
        if (!structure[category].layers[layer]) {
          structure[category].layers[layer] = 0;
        }
        structure[category].layers[layer]++;
      }

      // Detect patterns from category
      if (entities.length > 5) {
        patterns.push({
          name: `${category}-convention`,
          description: `${entities.length} ${category} entities follow consistent structure`,
          count: entities.length,
        });
      }
    }

    return { files, structure, patterns };
  }

  async getProjectStats(_options = {}) {
    this._ensureLoaded();
    if (!this._byCategory || !this._byPath) return null;

    const languages = {};
    const layerCounts = { L1: 0, L2: 0, L3: 0, L4: 0 };

    for (const [_path, entity] of this._byPath) {
      // Count by layer
      if (entity.layer && layerCounts[entity.layer] !== undefined) {
        layerCounts[entity.layer]++;
      }

      // Detect language from file extension
      const ext = path.extname(entity.path || '').slice(1);
      if (ext) {
        languages[ext] = (languages[ext] || 0) + 1;
      }
    }

    return {
      files: this._byPath.size,
      lines: 0, // Cannot determine without reading files
      languages,
      layers: layerCounts,
      categories: this._byCategory.size,
      totalEntities: this._byName
        ? Array.from(this._byName.values()).reduce((sum, arr) => sum + arr.length, 0)
        : 0,
    };
  }

  // --- 3 AST-only primitives inherit null from base class ---
  // findCallers, findCallees, analyzeComplexity → return null (base class default)
}

module.exports = { RegistryProvider, LAYER_PRIORITY };
