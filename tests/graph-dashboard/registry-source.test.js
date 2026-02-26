'use strict';

let mockRegistryData = null;

jest.mock('../../.aios-core/core/ids/registry-loader', () => ({
  RegistryLoader: jest.fn().mockImplementation(() => ({
    load: () => {
      if (mockRegistryData === 'THROW') {
        throw new Error('Registry file missing');
      }
      return mockRegistryData;
    },
  })),
}));

const { RegistrySource } = require('../../.aios-core/core/graph-dashboard/data-sources/registry-source');

describe('RegistrySource', () => {
  let source;

  beforeEach(() => {
    source = new RegistrySource({ cacheTTL: 0 });
    mockRegistryData = {
      metadata: { entityCount: 5, lastUpdated: '2026-02-21T04:07:07.055Z', version: '1.0.0' },
      entities: {
        tasks: {
          'task-a': { path: 'a.md' },
          'task-b': { path: 'b.md' },
          'task-c': { path: 'c.md' },
        },
        agents: {
          dev: { path: 'dev.md' },
          qa: { path: 'qa.md' },
        },
      },
    };
  });

  describe('getData', () => {
    it('should return entity statistics from registry', async () => {
      const result = await source.getData();

      expect(result.totalEntities).toBe(5);
      expect(result.categories.tasks.count).toBe(3);
      expect(result.categories.agents.count).toBe(2);
      expect(result.lastUpdated).toBe('2026-02-21T04:07:07.055Z');
      expect(result.version).toBe('1.0.0');
      expect(result.timestamp).toBeDefined();
    });

    it('should calculate percentages per category', async () => {
      const result = await source.getData();

      expect(result.categories.tasks.pct).toBeCloseTo(60, 0);
      expect(result.categories.agents.pct).toBeCloseTo(40, 0);
    });

    it('should handle empty registry gracefully', async () => {
      mockRegistryData = { metadata: { entityCount: 0 }, entities: {} };

      const result = await source.getData();

      expect(result.totalEntities).toBe(0);
      expect(result.categories).toEqual({});
      expect(result.lastUpdated).toBeNull();
    });

    it('should handle missing metadata gracefully', async () => {
      mockRegistryData = { entities: {} };

      const result = await source.getData();

      expect(result.totalEntities).toBe(0);
      expect(result.version).toBeNull();
    });

    it('should return empty stats when RegistryLoader throws', async () => {
      mockRegistryData = 'THROW';

      const result = await source.getData();

      expect(result.totalEntities).toBe(0);
      expect(result.categories).toEqual({});
      expect(result.lastUpdated).toBeNull();
    });

    it('should skip non-object entity categories', async () => {
      mockRegistryData = {
        metadata: { entityCount: 2 },
        entities: {
          tasks: { 'task-a': {} , 'task-b': {} },
          badEntry: null,
          alsoBAd: 'string',
        },
      };

      const result = await source.getData();

      expect(Object.keys(result.categories)).toEqual(['tasks']);
    });
  });

  describe('caching', () => {
    it('should return cached data when not stale', async () => {
      const cachedSource = new RegistrySource({ cacheTTL: 60000 });
      const first = await cachedSource.getData();
      const second = await cachedSource.getData();

      expect(first.timestamp).toBe(second.timestamp);
    });

    it('should refresh data when cache is stale', async () => {
      const result1 = await source.getData();
      const result2 = await source.getData();

      // cacheTTL=0 means always stale
      expect(result2.timestamp).toBeGreaterThanOrEqual(result1.timestamp);
    });
  });

  describe('isStale / getLastUpdate', () => {
    it('should report stale when no data fetched', () => {
      expect(source.isStale()).toBe(true);
      expect(source.getLastUpdate()).toBe(0);
    });

    it('should report not stale after fresh fetch', async () => {
      const cachedSource = new RegistrySource({ cacheTTL: 60000 });
      await cachedSource.getData();

      expect(cachedSource.isStale()).toBe(false);
      expect(cachedSource.getLastUpdate()).toBeGreaterThan(0);
    });
  });
});
