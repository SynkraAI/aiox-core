'use strict';

const fs = require('fs');
const path = require('path');

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

const { parseArgs, handleWatch, WATCH_FORMAT_MAP } = require('../../.aios-core/core/graph-dashboard/cli');

describe('watch-mode', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let watchState;
  const testOutputDir = path.resolve(process.cwd(), '.aios');

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.useFakeTimers();
  });

  afterEach(async () => {
    if (watchState) {
      watchState.cleanup();
      watchState = null;
    }
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();

    // Cleanup generated files
    try {
      const dotPath = path.join(testOutputDir, 'graph.dot');
      const mmdPath = path.join(testOutputDir, 'graph.mmd');
      if (fs.existsSync(dotPath)) {
        fs.unlinkSync(dotPath);
      }
      if (fs.existsSync(mmdPath)) {
        fs.unlinkSync(mmdPath);
      }
    } catch (_err) {
      // cleanup best-effort
    }
  });

  describe('parseArgs --watch', () => {
    it('should parse --watch flag', () => {
      const args = parseArgs(['--deps', '--watch']);

      expect(args.watch).toBe(true);
      expect(args.command).toBe('--deps');
    });

    it('should parse --watch with --interval', () => {
      const args = parseArgs(['--deps', '--watch', '--interval', '10']);

      expect(args.watch).toBe(true);
      expect(args.interval).toBe(10);
    });

    it('should parse --interval=N syntax', () => {
      const args = parseArgs(['--deps', '--watch', '--interval=15']);

      expect(args.interval).toBe(15);
    });

    it('should default watch to false', () => {
      const args = parseArgs(['--deps']);

      expect(args.watch).toBe(false);
    });
  });

  describe('handleWatch lifecycle', () => {
    it('should generate DOT file on start', async () => {
      watchState = await handleWatch({ format: 'dot', interval: 5 });

      expect(fs.existsSync(watchState.outputPath)).toBe(true);
      const content = fs.readFileSync(watchState.outputPath, 'utf8');
      expect(content).toContain('digraph G {');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[watch] graph.dot updated'),
      );
    });

    it('should generate Mermaid file when format is mermaid', async () => {
      watchState = await handleWatch({ format: 'mermaid', interval: 5 });

      expect(fs.existsSync(watchState.outputPath)).toBe(true);
      expect(watchState.outputPath).toContain('graph.mmd');
      const content = fs.readFileSync(watchState.outputPath, 'utf8');
      expect(content).toContain('graph TD');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[watch] graph.mmd updated'),
      );
    });

    it('should regenerate on interval tick', async () => {
      watchState = await handleWatch({ format: 'dot', interval: 2 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(2000);
      await Promise.resolve();

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });

    it('should stop on cleanup', async () => {
      watchState = await handleWatch({ format: 'dot', interval: 1 });

      watchState.cleanup();

      expect(consoleLogSpy).toHaveBeenCalledWith('[watch] stopped');

      // After cleanup, interval should not fire
      const callCount = consoleLogSpy.mock.calls.length;
      jest.advanceTimersByTime(5000);
      expect(consoleLogSpy.mock.calls.length).toBe(callCount);
      watchState = null; // prevent double cleanup in afterEach
    });

    it('should use configurable interval', async () => {
      watchState = await handleWatch({ format: 'dot', interval: 10 });

      jest.advanceTimersByTime(9000);
      await Promise.resolve();
      expect(consoleLogSpy).toHaveBeenCalledTimes(1); // only initial

      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      expect(consoleLogSpy).toHaveBeenCalledTimes(2); // initial + 1 tick
    });

    it('should create .aios directory if it does not exist', async () => {
      // .aios should be created by handleWatch
      watchState = await handleWatch({ format: 'dot', interval: 5 });

      expect(fs.existsSync(testOutputDir)).toBe(true);
    });

    it('should report entity count in log message', async () => {
      watchState = await handleWatch({ format: 'dot', interval: 5 });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('2 entities'),
      );
    });
  });

  describe('DOT output validity', () => {
    it('should produce valid DOT that starts with digraph G { and ends with }', async () => {
      watchState = await handleWatch({ format: 'dot', interval: 5 });

      const content = fs.readFileSync(watchState.outputPath, 'utf8');
      expect(content.trimStart()).toMatch(/^digraph G \{/);
      expect(content.trimEnd()).toMatch(/\}$/);
    });
  });

  describe('WATCH_FORMAT_MAP', () => {
    it('should map dot to graph.dot filename', () => {
      expect(WATCH_FORMAT_MAP.dot.filename).toBe('graph.dot');
    });

    it('should map mermaid to graph.mmd filename', () => {
      expect(WATCH_FORMAT_MAP.mermaid.filename).toBe('graph.mmd');
    });
  });
});
