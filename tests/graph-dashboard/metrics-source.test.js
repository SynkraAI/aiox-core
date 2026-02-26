'use strict';

let mockIsAvailable = false;
let mockMetricsResult = null;

const mockClient = {
  getMetrics: jest.fn().mockImplementation(() => mockMetricsResult),
};

jest.mock('../../.aios-core/core/code-intel', () => ({
  getClient: () => mockClient,
  isCodeIntelAvailable: () => mockIsAvailable,
}));

const { MetricsSource } = require('../../.aios-core/core/graph-dashboard/data-sources/metrics-source');

describe('MetricsSource', () => {
  let source;

  beforeEach(() => {
    source = new MetricsSource({ cacheTTL: 0 });
    mockIsAvailable = false;
    mockMetricsResult = null;
    mockClient.getMetrics.mockImplementation(() => mockMetricsResult);
  });

  describe('getData - live metrics', () => {
    it('should return live metrics when code-intel is available', async () => {
      mockIsAvailable = true;
      mockMetricsResult = {
        cacheHits: 89,
        cacheMisses: 11,
        cacheHitRate: 0.89,
        circuitBreakerState: 'CLOSED',
        latencyLog: [
          { capability: 'analyze', durationMs: 45, isCacheHit: false, timestamp: Date.now() },
          { capability: 'analyze', durationMs: 5, isCacheHit: true, timestamp: Date.now() },
        ],
        activeProvider: 'code-graph-mcp',
      };

      const result = await source.getData();

      expect(result.providerAvailable).toBe(true);
      expect(result.cacheHits).toBe(89);
      expect(result.cacheMisses).toBe(11);
      expect(result.cacheHitRate).toBe(0.89);
      expect(result.circuitBreakerState).toBe('CLOSED');
      expect(result.latencyLog).toHaveLength(2);
      expect(result.activeProvider).toBe('code-graph-mcp');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle partial metrics (missing fields)', async () => {
      mockIsAvailable = true;
      mockMetricsResult = {};

      const result = await source.getData();

      expect(result.providerAvailable).toBe(true);
      expect(result.cacheHits).toBe(0);
      expect(result.cacheMisses).toBe(0);
      expect(result.cacheHitRate).toBe(0);
      expect(result.circuitBreakerState).toBe('CLOSED');
      expect(result.latencyLog).toEqual([]);
      expect(result.activeProvider).toBeNull();
    });
  });

  describe('getData - offline fallback', () => {
    it('should return offline metrics when code-intel is unavailable', async () => {
      mockIsAvailable = false;

      const result = await source.getData();

      expect(result.providerAvailable).toBe(false);
      expect(result.cacheHits).toBe(0);
      expect(result.cacheMisses).toBe(0);
      expect(result.cacheHitRate).toBe(0);
      expect(result.latencyLog).toEqual([]);
      expect(result.activeProvider).toBeNull();
    });

    it('should fall back to offline when getMetrics throws', async () => {
      mockIsAvailable = true;
      mockClient.getMetrics.mockImplementation(() => {
        throw new Error('Provider crashed');
      });

      const result = await source.getData();

      expect(result.providerAvailable).toBe(false);
      expect(result.cacheHits).toBe(0);
    });
  });

  describe('caching', () => {
    it('should return cached data when not stale', async () => {
      const cachedSource = new MetricsSource({ cacheTTL: 60000 });
      const first = await cachedSource.getData();
      const second = await cachedSource.getData();

      expect(first.timestamp).toBe(second.timestamp);
    });
  });

  describe('isStale / getLastUpdate', () => {
    it('should report stale when no data fetched', () => {
      expect(source.isStale()).toBe(true);
      expect(source.getLastUpdate()).toBe(0);
    });

    it('should report not stale after fresh fetch', async () => {
      const cachedSource = new MetricsSource({ cacheTTL: 60000 });
      await cachedSource.getData();

      expect(cachedSource.isStale()).toBe(false);
      expect(cachedSource.getLastUpdate()).toBeGreaterThan(0);
    });
  });
});
