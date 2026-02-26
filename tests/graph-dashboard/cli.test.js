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
      isFallback: true,
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
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      circuitBreakerState: 'CLOSED',
      latencyLog: [],
      providerAvailable: false,
      activeProvider: null,
      timestamp: Date.now(),
    }),
  })),
}));

const { parseArgs, handleHelp, run } = require('../../.aios-core/core/graph-dashboard/cli');

describe('cli', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('parseArgs', () => {
    it('should parse --deps command', () => {
      const args = parseArgs(['--deps']);

      expect(args.command).toBe('--deps');
      expect(args.format).toBe('ascii');
    });

    it('should parse --help flag', () => {
      const args = parseArgs(['--help']);

      expect(args.help).toBe(true);
      expect(args.command).toBe('--help');
    });

    it('should parse -h shorthand', () => {
      const args = parseArgs(['-h']);

      expect(args.help).toBe(true);
    });

    it('should parse --format=json', () => {
      const args = parseArgs(['--deps', '--format=json']);

      expect(args.command).toBe('--deps');
      expect(args.format).toBe('json');
    });

    it('should parse --format json (space-separated)', () => {
      const args = parseArgs(['--deps', '--format', 'json']);

      expect(args.format).toBe('json');
    });

    it('should parse --interval', () => {
      const args = parseArgs(['--deps', '--interval', '10']);

      expect(args.interval).toBe(10);
    });

    it('should return null command when no command given', () => {
      const args = parseArgs([]);

      expect(args.command).toBeNull();
    });

    it('should default format to ascii', () => {
      const args = parseArgs(['--deps']);

      expect(args.format).toBe('ascii');
    });

    it('should parse --stats command', () => {
      const args = parseArgs(['--stats']);

      expect(args.command).toBe('--stats');
    });
  });

  describe('handleHelp', () => {
    it('should output usage text', () => {
      handleHelp();

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = consoleLogSpy.mock.calls[0][0];

      expect(output).toContain('Usage:');
      expect(output).toContain('--deps');
      expect(output).toContain('--help');
      expect(output).toContain('--format');
    });
  });

  describe('run', () => {
    it('should show help when --help is passed', async () => {
      await run(['--help']);

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('Usage:');
    });

    it('should render dependency tree for --deps', async () => {
      await run(['--deps']);

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('Dependency Graph');
      expect(output).toContain('task-a');
    });

    it('should render summary (default) when no command', async () => {
      const stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation();

      await run([]);

      const output = stdoutWriteSpy.mock.calls[0][0];
      expect(output).toContain('AIOS Graph Dashboard');
      expect(output).toContain('Dependency Graph');
      expect(output).toContain('Provider Status');
      stdoutWriteSpy.mockRestore();
    });

    it('should render stats for --stats', async () => {
      const stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation();

      await run(['--stats']);

      const output = stdoutWriteSpy.mock.calls[0][0];
      expect(output).toContain('Entity Statistics');
      expect(output).toContain('tasks');
      expect(output).toContain('42');
      expect(output).toContain('[OFFLINE]');
      stdoutWriteSpy.mockRestore();
    });

    it('should exit with error for unknown command', async () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      await expect(run(['--unknown'])).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown command: --unknown');
      mockExit.mockRestore();
    });
  });
});
