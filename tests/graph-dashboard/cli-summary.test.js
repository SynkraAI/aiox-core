'use strict';

jest.mock('../../.aios-core/core/graph-dashboard/data-sources/code-intel-source', () => ({
  CodeIntelSource: jest.fn().mockImplementation(() => ({
    getData: jest.fn().mockResolvedValue({
      nodes: [
        { id: 'task-a', label: 'task-a', type: 'task', path: 'a.md', category: 'tasks' },
        { id: 'dev', label: 'dev', type: 'agent', path: 'dev.md', category: 'agents' },
      ],
      edges: [{ from: 'dev', to: 'task-a', type: 'depends' }],
      source: 'registry',
      isFallback: false,
      timestamp: Date.now(),
    }),
  })),
}));

jest.mock('../../.aios-core/core/graph-dashboard/data-sources/registry-source', () => ({
  RegistrySource: jest.fn().mockImplementation(() => ({
    getData: jest.fn().mockResolvedValue({
      totalEntities: 42,
      categories: { tasks: { count: 30, pct: 71.4 }, agents: { count: 12, pct: 28.6 } },
      lastUpdated: '2026-02-21T04:07:07.055Z',
      version: '1.0.0',
      timestamp: Date.now(),
    }),
  })),
}));

jest.mock('../../.aios-core/core/graph-dashboard/data-sources/metrics-source', () => ({
  MetricsSource: jest.fn().mockImplementation(() => ({
    getData: jest.fn().mockResolvedValue({
      cacheHits: 89,
      cacheMisses: 11,
      cacheHitRate: 0.892,
      circuitBreakerState: 'CLOSED',
      latencyLog: [],
      providerAvailable: true,
      activeProvider: 'code-graph-mcp',
      timestamp: Date.now(),
    }),
  })),
}));

const { handleSummary, handleDeps, FORMAT_MAP, VALID_FORMATS } = require('../../.aios-core/core/graph-dashboard/cli');

describe('cli-summary', () => {
  let stdoutWriteSpy;

  beforeEach(() => {
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
    console.log.mockRestore();
  });

  describe('handleSummary', () => {
    it('should render all three sections', async () => {
      await handleSummary({});
      const output = stdoutWriteSpy.mock.calls[0][0];

      expect(output).toContain('AIOS Graph Dashboard');
      expect(output).toContain('Dependency Graph');
      expect(output).toContain('Entity Statistics');
      expect(output).toContain('Provider Status');
    });

    it('should include provider status with ACTIVE', async () => {
      await handleSummary({});
      const output = stdoutWriteSpy.mock.calls[0][0];

      expect(output).toContain('Code Graph MCP');
      expect(output).toContain('Circuit Breaker');
      expect(output).toContain('Cache Entries');
    });
  });

  describe('handleDeps with --format', () => {
    it('should output JSON when format=json', async () => {
      await handleDeps({ format: 'json' });
      const output = stdoutWriteSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.nodes).toBeDefined();
      expect(parsed.edges).toBeDefined();
    });

    it('should output DOT when format=dot', async () => {
      await handleDeps({ format: 'dot' });
      const output = stdoutWriteSpy.mock.calls[0][0];

      expect(output).toContain('digraph G {');
    });

    it('should output Mermaid when format=mermaid', async () => {
      await handleDeps({ format: 'mermaid' });
      const output = stdoutWriteSpy.mock.calls[0][0];

      expect(output).toContain('graph TD');
    });

    it('should render ASCII tree when format=ascii', async () => {
      await handleDeps({ format: 'ascii' });
      const output = console.log.mock.calls[0][0];

      expect(output).toContain('Dependency Graph');
    });

    it('should exit with error for invalid format', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      await expect(handleDeps({ format: 'invalid' })).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown format'));
      consoleErrorSpy.mockRestore();
      mockExit.mockRestore();
    });
  });

  describe('FORMAT_MAP', () => {
    it('should have json, dot, mermaid formatters', () => {
      expect(FORMAT_MAP).toHaveProperty('json');
      expect(FORMAT_MAP).toHaveProperty('dot');
      expect(FORMAT_MAP).toHaveProperty('mermaid');
    });
  });

  describe('VALID_FORMATS', () => {
    it('should include ascii and all FORMAT_MAP keys', () => {
      expect(VALID_FORMATS).toContain('ascii');
      expect(VALID_FORMATS).toContain('json');
      expect(VALID_FORMATS).toContain('dot');
      expect(VALID_FORMATS).toContain('mermaid');
    });
  });
});
