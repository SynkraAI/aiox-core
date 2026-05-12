'use strict';

const path = require('path');
const { RegistryLoader } = require('../../../.aiox-core/core/ids/registry-loader');

const FIXTURES = path.resolve(__dirname, 'fixtures');
const VALID_REGISTRY = path.join(FIXTURES, 'valid-registry.yaml');
const EMPTY_REGISTRY = path.join(FIXTURES, 'empty-registry.yaml');
const CORRUPT_REGISTRY = path.join(FIXTURES, 'corrupt-registry.yaml');
const MISSING_REGISTRY = path.join(FIXTURES, 'does-not-exist.yaml');

describe('RegistryLoader', () => {
  describe('load()', () => {
    it('loads a valid registry file', () => {
      const loader = new RegistryLoader(VALID_REGISTRY);
      const registry = loader.load();

      expect(registry).toBeDefined();
      expect(registry.metadata).toBeDefined();
      expect(registry.metadata.version).toBe('1.0.0');
      expect(registry.entities).toBeDefined();
      expect(registry.categories).toBeDefined();
    });

    it('returns empty registry when file is missing (AC: 11)', () => {
      const loader = new RegistryLoader(MISSING_REGISTRY);
      const registry = loader.load();

      expect(registry).toBeDefined();
      expect(registry.metadata).toBeDefined();
      expect(registry.metadata.entityCount).toBe(0);
      expect(registry.entities).toEqual({});
    });

    it('returns empty registry when file is empty (AC: 11)', () => {
      const emptyPath = path.join(FIXTURES, 'actually-empty.yaml');
      const fs = require('fs');
      fs.writeFileSync(emptyPath, '', 'utf8');

      try {
        const loader = new RegistryLoader(emptyPath);
        const registry = loader.load();

        expect(registry).toBeDefined();
        expect(registry.metadata.entityCount).toBe(0);
      } finally {
        fs.unlinkSync(emptyPath);
      }
    });

    it('throws descriptive error for corrupt YAML', () => {
      const loader = new RegistryLoader(CORRUPT_REGISTRY);

      expect(() => loader.load()).toThrow(/Failed to parse registry/);
    });

    it('handles registry with empty entities gracefully', () => {
      const loader = new RegistryLoader(EMPTY_REGISTRY);
      const registry = loader.load();

      expect(registry).toBeDefined();
      expect(loader.getEntityCount()).toBe(0);
    });
  });

  describe('queryByKeywords()', () => {
    let loader;

    beforeEach(() => {
      loader = new RegistryLoader(VALID_REGISTRY);
      loader.load();
    });

    it('returns entities matching a single keyword', () => {
      const results = loader.queryByKeywords(['validate']);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((e) => e.id === 'validate-story')).toBe(true);
    });

    it('returns entities matching multiple keywords', () => {
      const results = loader.queryByKeywords(['template', 'engine']);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((e) => e.id === 'template-engine')).toBe(true);
    });

    it('returns empty array for no matches', () => {
      const results = loader.queryByKeywords(['zzz-nonexistent-zzz']);
      expect(results).toEqual([]);
    });

    it('returns empty array for empty input', () => {
      expect(loader.queryByKeywords([])).toEqual([]);
      expect(loader.queryByKeywords(null)).toEqual([]);
    });

    it('is case-insensitive', () => {
      const results = loader.queryByKeywords(['VALIDATE']);
      expect(results.some((e) => e.id === 'validate-story')).toBe(true);
    });

    it('deduplicates results when multiple keywords match same entity', () => {
      const results = loader.queryByKeywords(['product', 'owner', 'backlog']);
      const poCount = results.filter((e) => e.id === 'po').length;
      expect(poCount).toBe(1);
    });
  });

  describe('queryByType()', () => {
    let loader;

    beforeEach(() => {
      loader = new RegistryLoader(VALID_REGISTRY);
      loader.load();
    });

    it('returns all entities of a given type', () => {
      const tasks = loader.queryByType('task');
      expect(tasks.length).toBe(2);
      expect(tasks.every((e) => e.type === 'task')).toBe(true);
    });

    it('is case-insensitive', () => {
      const agents = loader.queryByType('AGENT');
      expect(agents.length).toBe(2);
    });

    it('returns empty array for unknown type', () => {
      expect(loader.queryByType('widget')).toEqual([]);
    });

    it('returns empty array for null/empty input', () => {
      expect(loader.queryByType(null)).toEqual([]);
      expect(loader.queryByType('')).toEqual([]);
    });
  });

  describe('queryByPath()', () => {
    let loader;

    beforeEach(() => {
      loader = new RegistryLoader(VALID_REGISTRY);
      loader.load();
    });

    it('finds entities by partial path match', () => {
      const results = loader.queryByPath('tasks/');
      expect(results.length).toBe(2);
    });

    it('is case-insensitive', () => {
      const results = loader.queryByPath('AGENTS/');
      expect(results.length).toBe(2);
    });

    it('returns empty for no match', () => {
      expect(loader.queryByPath('nonexistent/')).toEqual([]);
    });

    it('returns empty for null input', () => {
      expect(loader.queryByPath(null)).toEqual([]);
    });
  });

  describe('queryByPurpose()', () => {
    let loader;

    beforeEach(() => {
      loader = new RegistryLoader(VALID_REGISTRY);
      loader.load();
    });

    it('finds entities by purpose text', () => {
      const results = loader.queryByPurpose('backlog management');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((e) => e.id === 'po')).toBe(true);
    });

    it('is case-insensitive', () => {
      const results = loader.queryByPurpose('HANDLEBARS');
      expect(results.some((e) => e.id === 'template-engine')).toBe(true);
    });

    it('returns empty for no match', () => {
      expect(loader.queryByPurpose('zzz-nothing-zzz')).toEqual([]);
    });
  });

  describe('getRelationships()', () => {
    let loader;

    beforeEach(() => {
      loader = new RegistryLoader(VALID_REGISTRY);
      loader.load();
    });

    it('returns usedBy and dependencies for an entity', () => {
      const rels = loader.getRelationships('create-doc');
      expect(rels.usedBy).toContain('po');
      expect(rels.usedBy).toContain('sm');
      expect(rels.dependencies).toContain('template-engine');
    });

    it('returns dependencies and usedBy for a dependency entity', () => {
      const rels = loader.getRelationships('template-engine');
      expect(rels.dependencies).toEqual([]);
      expect(rels.usedBy).toContain('create-doc');
    });

    it('returns empty arrays for unknown entity', () => {
      const rels = loader.getRelationships('unknown-entity');
      expect(rels).toEqual({ usedBy: [], dependencies: [] });
    });
  });

  describe('getUsedBy() / getDependencies()', () => {
    let loader;

    beforeEach(() => {
      loader = new RegistryLoader(VALID_REGISTRY);
      loader.load();
    });

    it('getUsedBy returns correct list', () => {
      expect(loader.getUsedBy('create-doc')).toContain('po');
    });

    it('getDependencies returns correct list', () => {
      expect(loader.getDependencies('po')).toContain('create-doc');
    });
  });

  describe('getMetadata() / getCategories() / getEntityCount()', () => {
    it('returns metadata from valid registry', () => {
      const loader = new RegistryLoader(VALID_REGISTRY);
      loader.load();

      expect(loader.getMetadata().version).toBe('1.0.0');
      expect(loader.getCategories().length).toBeGreaterThan(0);
      expect(loader.getEntityCount()).toBe(5);
    });

    it('returns zero count for empty registry', () => {
      const loader = new RegistryLoader(EMPTY_REGISTRY);
      loader.load();

      expect(loader.getEntityCount()).toBe(0);
    });
  });

  describe('caching', () => {
    it('returns same results on repeated queries without reloading', () => {
      const loader = new RegistryLoader(VALID_REGISTRY);
      loader.load();

      const first = loader.queryByType('task');
      const second = loader.queryByType('task');
      expect(first).toBe(second);
    });

    it('clears cache on reload', () => {
      const loader = new RegistryLoader(VALID_REGISTRY);
      loader.load();

      const before = loader.queryByType('task');
      loader.load();
      const after = loader.queryByType('task');

      expect(before).not.toBe(after);
      expect(before).toEqual(after);
    });
  });

  describe('performance (AC: 9)', () => {
    it('returns query results in under 100ms', () => {
      const loader = new RegistryLoader(VALID_REGISTRY);
      loader.load();

      const start = performance.now();
      loader.queryByKeywords(['validate', 'template']);
      loader.queryByType('task');
      loader.queryByPath('tasks/');
      loader.queryByPurpose('documentation');
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(100);
    });
  });
});
