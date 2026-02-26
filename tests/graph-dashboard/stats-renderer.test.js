'use strict';

const {
  renderStats,
  _renderEntityTable,
  _renderCachePerformance,
  _renderLatencyChart,
  _generateSparkline,
  _timeAgo,
} = require('../../.aios-core/core/graph-dashboard/renderers/stats-renderer');

const SAMPLE_REGISTRY = {
  totalEntities: 142,
  categories: {
    tasks: { count: 67, pct: 47.2 },
    templates: { count: 34, pct: 23.9 },
    scripts: { count: 29, pct: 20.4 },
    agents: { count: 12, pct: 8.5 },
  },
  lastUpdated: new Date().toISOString(),
  version: '1.0.0',
};

const SAMPLE_METRICS_ONLINE = {
  cacheHits: 89,
  cacheMisses: 11,
  cacheHitRate: 0.892,
  circuitBreakerState: 'CLOSED',
  latencyLog: [
    { capability: 'analyze', durationMs: 45, isCacheHit: false, timestamp: Date.now() },
    { capability: 'analyze', durationMs: 5, isCacheHit: true, timestamp: Date.now() },
    { capability: 'analyze', durationMs: 30, isCacheHit: false, timestamp: Date.now() },
    { capability: 'analyze', durationMs: 3, isCacheHit: true, timestamp: Date.now() },
    { capability: 'analyze', durationMs: 15, isCacheHit: false, timestamp: Date.now() },
  ],
  providerAvailable: true,
  activeProvider: 'code-graph-mcp',
};

const SAMPLE_METRICS_OFFLINE = {
  cacheHits: 0,
  cacheMisses: 0,
  cacheHitRate: 0,
  circuitBreakerState: 'CLOSED',
  latencyLog: [],
  providerAvailable: false,
  activeProvider: null,
};

describe('stats-renderer', () => {
  describe('renderStats', () => {
    it('should return a multiline string with all sections', () => {
      const output = renderStats(SAMPLE_REGISTRY, SAMPLE_METRICS_ONLINE, { isTTY: true });

      expect(output).toContain('Entity Statistics');
      expect(output).toContain('Cache Performance');
      expect(output).toContain('Latency');
      expect(output).toContain('Last updated:');
    });

    it('should work in non-TTY mode', () => {
      const output = renderStats(SAMPLE_REGISTRY, SAMPLE_METRICS_ONLINE, { isTTY: false });

      expect(output).toContain('Entity Statistics');
      expect(output).toContain('Cache Performance');
      expect(output).not.toContain('\u2500'); // No box-drawing chars
    });

    it('should handle offline metrics gracefully', () => {
      const output = renderStats(SAMPLE_REGISTRY, SAMPLE_METRICS_OFFLINE, { isTTY: true });

      expect(output).toContain('[OFFLINE]');
      expect(output).toContain('Entity Statistics');
    });

    it('should handle missing lastUpdated', () => {
      const registry = { ...SAMPLE_REGISTRY, lastUpdated: null };
      const output = renderStats(registry, SAMPLE_METRICS_ONLINE, { isTTY: true });

      expect(output).not.toContain('Last updated:');
    });
  });

  describe('_renderEntityTable', () => {
    it('should render TTY table with box-drawing chars', () => {
      const lines = _renderEntityTable(SAMPLE_REGISTRY, true);
      const text = lines.join('\n');

      expect(text).toContain('Entity Statistics');
      expect(text).toContain('\u2500'); // ─
      expect(text).toContain('\u2502'); // │
      expect(text).toContain('tasks');
      expect(text).toContain('142');
      expect(text).toContain('TOTAL');
      expect(text).toContain('47.2%');
    });

    it('should render non-TTY table with ASCII chars', () => {
      const lines = _renderEntityTable(SAMPLE_REGISTRY, false);
      const text = lines.join('\n');

      expect(text).toContain('-');
      expect(text).toContain('|');
      expect(text).toContain('+');
      expect(text).not.toContain('\u2500');
    });

    it('should sort categories by count descending', () => {
      const lines = _renderEntityTable(SAMPLE_REGISTRY, true);
      const text = lines.join('\n');
      const tasksIdx = text.indexOf('tasks');
      const agentsIdx = text.indexOf('agents');

      expect(tasksIdx).toBeLessThan(agentsIdx);
    });

    it('should handle empty categories', () => {
      const data = { totalEntities: 0, categories: {} };
      const lines = _renderEntityTable(data, true);
      const text = lines.join('\n');

      expect(text).toContain('TOTAL');
      expect(text).toContain('0');
    });
  });

  describe('_renderCachePerformance', () => {
    it('should render hit/miss percentages with sparkline when TTY', () => {
      const lines = _renderCachePerformance(SAMPLE_METRICS_ONLINE, true);
      const text = lines.join('\n');

      expect(text).toContain('Cache Performance');
      expect(text).toContain('Hit Rate:');
      expect(text).toContain('Misses:');
      expect(text).toContain('89.2%');
    });

    it('should render without sparkline when non-TTY', () => {
      const lines = _renderCachePerformance(SAMPLE_METRICS_ONLINE, false);
      const text = lines.join('\n');

      expect(text).toContain('89.2%');
      // No sparkline chars in non-TTY
      expect(text).not.toContain('\u2581');
    });

    it('should show OFFLINE badge when provider unavailable', () => {
      const lines = _renderCachePerformance(SAMPLE_METRICS_OFFLINE, true);
      const text = lines.join('\n');

      expect(text).toContain('[OFFLINE]');
    });
  });

  describe('_renderLatencyChart', () => {
    it('should render latency chart with operation count', () => {
      const lines = _renderLatencyChart(SAMPLE_METRICS_ONLINE, true);
      const text = lines.join('\n');

      expect(text).toContain('Latency (last 5 operations)');
    });

    it('should show OFFLINE when provider unavailable', () => {
      const lines = _renderLatencyChart(SAMPLE_METRICS_OFFLINE, true);
      const text = lines.join('\n');

      expect(text).toContain('[OFFLINE]');
    });

    it('should handle empty latency log', () => {
      const data = { ...SAMPLE_METRICS_ONLINE, latencyLog: [] };
      const lines = _renderLatencyChart(data, true);
      const text = lines.join('\n');

      expect(text).toContain('No operations recorded');
    });
  });

  describe('_generateSparkline', () => {
    it('should generate sparkline for hits', () => {
      const log = [
        { isCacheHit: true, durationMs: 5 },
        { isCacheHit: false, durationMs: 45 },
        { isCacheHit: true, durationMs: 10 },
      ];
      const result = _generateSparkline(log, true);

      expect(result).toHaveLength(3);
    });

    it('should generate sparkline for misses', () => {
      const log = [
        { isCacheHit: true, durationMs: 5 },
        { isCacheHit: false, durationMs: 45 },
      ];
      const result = _generateSparkline(log, false);

      expect(result).toHaveLength(2);
    });

    it('should return empty string for empty log', () => {
      expect(_generateSparkline([], true)).toBe('');
      expect(_generateSparkline(null, true)).toBe('');
      expect(_generateSparkline(undefined, false)).toBe('');
    });

    it('should limit to MAX_LATENCY_POINTS entries', () => {
      const log = Array.from({ length: 20 }, (_, i) => ({
        isCacheHit: i % 2 === 0,
        durationMs: i * 5,
      }));
      const result = _generateSparkline(log, true);

      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('_timeAgo', () => {
    it('should return seconds ago for recent timestamps', () => {
      const now = new Date();
      now.setSeconds(now.getSeconds() - 30);
      expect(_timeAgo(now.toISOString())).toBe('30s ago');
    });

    it('should return minutes ago', () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - 5);
      expect(_timeAgo(now.toISOString())).toBe('5m ago');
    });

    it('should return hours ago', () => {
      const now = new Date();
      now.setHours(now.getHours() - 3);
      expect(_timeAgo(now.toISOString())).toBe('3h ago');
    });

    it('should return days ago', () => {
      const now = new Date();
      now.setDate(now.getDate() - 7);
      expect(_timeAgo(now.toISOString())).toBe('7d ago');
    });

    it('should return unknown for invalid dates', () => {
      expect(_timeAgo('invalid')).toBe('unknown');
    });

    it('should return unknown for future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      expect(_timeAgo(future.toISOString())).toBe('unknown');
    });
  });
});
