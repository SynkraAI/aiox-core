'use strict';

const {
  renderStatus,
  CB_FAILURE_THRESHOLD,
  _renderHeader,
  _renderProviderLine,
  _renderCircuitBreaker,
  _renderFailures,
  _renderCacheEntries,
  _renderUptime,
} = require('../../.aios-core/core/graph-dashboard/renderers/status-renderer');

const SAMPLE_METRICS_ACTIVE = {
  cacheHits: 89,
  cacheMisses: 11,
  cacheHitRate: 0.892,
  circuitBreakerState: 'CLOSED',
  circuitBreakerFailures: 2,
  latencyLog: [],
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

const SAMPLE_METRICS_ALL_ZEROS = {
  cacheHits: 0,
  cacheMisses: 0,
  cacheHitRate: 0,
  circuitBreakerState: 'CLOSED',
  latencyLog: [],
  providerAvailable: true,
  activeProvider: 'code-graph-mcp',
};

describe('status-renderer', () => {
  describe('renderStatus', () => {
    it('should return multiline string with all sections', () => {
      const output = renderStatus(SAMPLE_METRICS_ACTIVE, { isTTY: true });

      expect(output).toContain('Provider Status');
      expect(output).toContain('Code Graph MCP');
      expect(output).toContain('Circuit Breaker');
      expect(output).toContain('Failures');
      expect(output).toContain('Cache Entries');
      expect(output).toContain('Uptime');
    });

    it('should work in non-TTY mode without ANSI escapes', () => {
      const output = renderStatus(SAMPLE_METRICS_ACTIVE, { isTTY: false });

      expect(output).not.toContain('\x1b[');
      expect(output).toContain('[ACTIVE]');
      expect(output).toContain('Provider Status');
    });

    it('should handle offline provider', () => {
      const output = renderStatus(SAMPLE_METRICS_OFFLINE, { isTTY: false });

      expect(output).toContain('[OFFLINE]');
    });

    it('should handle all-zeros metrics', () => {
      const output = renderStatus(SAMPLE_METRICS_ALL_ZEROS, { isTTY: true });

      expect(output).toContain('Failures: 0/5');
      expect(output).toContain('Cache Entries: 0');
    });

    it('should default to TTY mode', () => {
      const output = renderStatus(SAMPLE_METRICS_ACTIVE);

      expect(output).toContain('\x1b[32m');
    });
  });

  describe('_renderHeader', () => {
    it('should use box-drawing chars for TTY', () => {
      const header = _renderHeader(true);

      expect(header).toContain('Provider Status');
      expect(header).toContain('\u2500');
    });

    it('should use dashes for non-TTY', () => {
      const header = _renderHeader(false);

      expect(header).toContain('-');
      expect(header).not.toContain('\u2500');
    });
  });

  describe('_renderProviderLine', () => {
    it('should show green bullet ACTIVE for TTY when online', () => {
      const line = _renderProviderLine(SAMPLE_METRICS_ACTIVE, true);

      expect(line).toContain('\x1b[32m');
      expect(line).toContain('\u25CF ACTIVE');
    });

    it('should show red bullet OFFLINE for TTY when offline', () => {
      const line = _renderProviderLine(SAMPLE_METRICS_OFFLINE, true);

      expect(line).toContain('\x1b[31m');
      expect(line).toContain('\u25CB OFFLINE');
    });

    it('should show [ACTIVE] badge for non-TTY when online', () => {
      const line = _renderProviderLine(SAMPLE_METRICS_ACTIVE, false);

      expect(line).toContain('[ACTIVE]');
      expect(line).not.toContain('\x1b[');
    });

    it('should show [OFFLINE] badge for non-TTY when offline', () => {
      const line = _renderProviderLine(SAMPLE_METRICS_OFFLINE, false);

      expect(line).toContain('[OFFLINE]');
    });
  });

  describe('_renderCircuitBreaker', () => {
    it('should render CLOSED state', () => {
      const line = _renderCircuitBreaker({ circuitBreakerState: 'CLOSED' }, true);

      expect(line).toContain('CLOSED');
    });

    it('should render OPEN state', () => {
      const line = _renderCircuitBreaker({ circuitBreakerState: 'OPEN' }, true);

      expect(line).toContain('OPEN');
    });

    it('should render HALF-OPEN with yellow color for TTY', () => {
      const line = _renderCircuitBreaker({ circuitBreakerState: 'HALF-OPEN' }, true);

      expect(line).toContain('\x1b[33m');
      expect(line).toContain('HALF-OPEN');
    });

    it('should render HALF-OPEN without color for non-TTY', () => {
      const line = _renderCircuitBreaker({ circuitBreakerState: 'HALF-OPEN' }, false);

      expect(line).toContain('HALF-OPEN');
      expect(line).not.toContain('\x1b[');
    });

    it('should default to CLOSED when state is missing', () => {
      const line = _renderCircuitBreaker({}, true);

      expect(line).toContain('CLOSED');
    });
  });

  describe('_renderFailures', () => {
    it('should show failure count with threshold', () => {
      const line = _renderFailures({ circuitBreakerFailures: 3 });

      expect(line).toBe(` Failures: 3/${CB_FAILURE_THRESHOLD}`);
    });

    it('should default to 0 when failures not available', () => {
      const line = _renderFailures({});

      expect(line).toBe(` Failures: 0/${CB_FAILURE_THRESHOLD}`);
    });
  });

  describe('_renderCacheEntries', () => {
    it('should show sum of hits and misses', () => {
      const line = _renderCacheEntries({ cacheHits: 89, cacheMisses: 11 });

      expect(line).toBe(' Cache Entries: 100');
    });

    it('should handle missing values', () => {
      const line = _renderCacheEntries({});

      expect(line).toBe(' Cache Entries: 0');
    });
  });

  describe('_renderUptime', () => {
    it('should return static session string', () => {
      expect(_renderUptime()).toBe(' Uptime: session');
    });
  });
});
