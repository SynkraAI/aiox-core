/**
 * Result Aggregator - Test Suite
 * Story EXC-1, AC6 - result-aggregator.js coverage
 *
 * Tests: constructor, aggregate, aggregateAll, conflict detection,
 * metrics, report generation, formatMarkdown, history
 */

const path = require('path');
const fs = require('fs');
const {
  createTempDir,
  cleanupTempDir,
  collectEvents,
} = require('./execution-test-helpers');

const { ResultAggregator } = require('../../.aios-core/core/execution/result-aggregator');

describe('ResultAggregator', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempDir('ra-test-');
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  // ── Constructor ─────────────────────────────────────────────────────

  describe('Constructor', () => {
    test('creates with defaults', () => {
      const ra = new ResultAggregator();
      expect(ra.detectConflicts).toBe(true);
      expect(ra.history).toEqual([]);
      expect(ra.maxHistory).toBe(50);
    });

    test('accepts custom config', () => {
      const ra = new ResultAggregator({ detectConflicts: false, maxHistory: 10 });
      expect(ra.detectConflicts).toBe(false);
      expect(ra.maxHistory).toBe(10);
    });

    test('extends EventEmitter', () => {
      const ra = new ResultAggregator();
      expect(typeof ra.on).toBe('function');
    });
  });

  // ── aggregate ─────────────────────────────────────────────────────────

  describe('aggregate()', () => {
    test('aggregates successful results', async () => {
      const ra = new ResultAggregator({ rootPath: tmpDir });
      const waveResults = {
        waveIndex: 1,
        results: [
          { taskId: 't1', success: true, duration: 1000, output: 'done', filesModified: ['a.js'] },
          { taskId: 't2', success: true, duration: 2000, output: 'done', filesModified: ['b.js'] },
        ],
      };

      const result = await ra.aggregate(waveResults);

      expect(result.tasks.length).toBe(2);
      expect(result.tasks[0].success).toBe(true);
      expect(result.metrics.totalTasks).toBe(2);
      expect(result.metrics.successful).toBe(2);
      expect(result.metrics.failed).toBe(0);
    });

    test('detects file conflicts', async () => {
      const ra = new ResultAggregator({ rootPath: tmpDir });
      const waveResults = {
        waveIndex: 1,
        results: [
          { taskId: 't1', success: true, filesModified: ['shared.js'] },
          { taskId: 't2', success: true, filesModified: ['shared.js'] },
        ],
      };

      const events = collectEvents(ra, ['conflicts_detected']);
      const result = await ra.aggregate(waveResults);

      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].file).toBe('shared.js');
      expect(result.conflicts[0].tasks).toEqual(['t1', 't2']);
      expect(events.count('conflicts_detected')).toBe(1);
    });

    test('skips conflict detection when disabled', async () => {
      const ra = new ResultAggregator({ rootPath: tmpDir, detectConflicts: false });
      const waveResults = {
        waveIndex: 1,
        results: [
          { taskId: 't1', success: true, filesModified: ['shared.js'] },
          { taskId: 't2', success: true, filesModified: ['shared.js'] },
        ],
      };

      const result = await ra.aggregate(waveResults);
      expect(result.conflicts).toEqual([]);
    });

    test('collects warnings for long duration tasks', async () => {
      const ra = new ResultAggregator({ rootPath: tmpDir });
      const waveResults = {
        waveIndex: 1,
        results: [
          { taskId: 't1', success: true, duration: 6 * 60 * 1000, filesModified: ['a.js'] },
        ],
      };

      const result = await ra.aggregate(waveResults);
      const longWarning = result.warnings.find(w => w.type === 'long_duration');
      expect(longWarning).toBeDefined();
    });

    test('collects warnings for no files modified', async () => {
      const ra = new ResultAggregator({ rootPath: tmpDir });
      const waveResults = {
        waveIndex: 1,
        results: [{ taskId: 't1', success: true, filesModified: [] }],
      };

      const result = await ra.aggregate(waveResults);
      const noFilesWarning = result.warnings.find(w => w.type === 'no_files_modified');
      expect(noFilesWarning).toBeDefined();
    });

    test('emits aggregation_complete event', async () => {
      const ra = new ResultAggregator({ rootPath: tmpDir });
      const events = collectEvents(ra, ['aggregation_complete']);

      await ra.aggregate({ waveIndex: 1, results: [] });

      expect(events.count('aggregation_complete')).toBe(1);
    });

    test('stores aggregation in history', async () => {
      const ra = new ResultAggregator({ rootPath: tmpDir });
      await ra.aggregate({ waveIndex: 1, results: [] });
      expect(ra.history.length).toBe(1);
    });

    test('trims history to maxHistory', async () => {
      const ra = new ResultAggregator({ rootPath: tmpDir, maxHistory: 2 });
      await ra.aggregate({ waveIndex: 1, results: [] });
      await ra.aggregate({ waveIndex: 2, results: [] });
      await ra.aggregate({ waveIndex: 3, results: [] });
      expect(ra.history.length).toBe(2);
    });
  });

  // ── aggregateAll ──────────────────────────────────────────────────────

  describe('aggregateAll()', () => {
    test('consolidates multiple waves', async () => {
      const ra = new ResultAggregator({ rootPath: tmpDir });
      const waves = [
        { waveIndex: 1, results: [{ taskId: 't1', success: true, filesModified: [] }] },
        { waveIndex: 2, results: [{ taskId: 't2', success: false, error: 'fail', filesModified: [] }] },
      ];

      const result = await ra.aggregateAll(waves);

      expect(result.waves.length).toBe(2);
      expect(result.allTasks.length).toBe(2);
      expect(result.overallMetrics.totalWaves).toBe(2);
      expect(result.overallMetrics.successful).toBe(1);
      expect(result.overallMetrics.failed).toBe(1);
    });
  });

  // ── Conflict detection ────────────────────────────────────────────────

  describe('Conflict detection', () => {
    test('assessConflictSeverity returns critical for package.json', () => {
      const ra = new ResultAggregator();
      expect(ra.assessConflictSeverity('package.json')).toBe('critical');
      expect(ra.assessConflictSeverity('src/index.ts')).toBe('critical');
    });

    test('assessConflictSeverity returns high for config files', () => {
      const ra = new ResultAggregator();
      expect(ra.assessConflictSeverity('app.config.js')).toBe('high');
    });

    test('assessConflictSeverity returns medium for regular files', () => {
      const ra = new ResultAggregator();
      expect(ra.assessConflictSeverity('src/utils/helper.js')).toBe('medium');
    });

    test('suggestResolution gives JSON-specific advice', () => {
      const ra = new ResultAggregator();
      expect(ra.suggestResolution('data.json', 't1', 't2')).toContain('JSON');
    });

    test('suggestResolution gives test file advice', () => {
      const ra = new ResultAggregator();
      expect(ra.suggestResolution('app.test.js', 't1', 't2')).toContain('automatically');
    });

    test('suggestResolution gives generic advice for other files', () => {
      const ra = new ResultAggregator();
      expect(ra.suggestResolution('app.js', 't1', 't2')).toContain('Review');
    });
  });

  // ── extractFilesFromOutput ────────────────────────────────────────────

  describe('extractFilesFromOutput', () => {
    test('returns empty for null', () => {
      const ra = new ResultAggregator();
      expect(ra.extractFilesFromOutput(null)).toEqual([]);
    });

    test('extracts file paths from output', () => {
      const ra = new ResultAggregator();
      const output = "Created `src/app.js` and modified 'lib/utils.ts'";
      const files = ra.extractFilesFromOutput(output);
      expect(files.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── summarizeOutput ───────────────────────────────────────────────────

  describe('summarizeOutput', () => {
    test('returns empty for null', () => {
      const ra = new ResultAggregator();
      expect(ra.summarizeOutput(null)).toBe('');
    });

    test('returns short output unchanged', () => {
      const ra = new ResultAggregator();
      expect(ra.summarizeOutput('short')).toBe('short');
    });

    test('truncates long output', () => {
      const ra = new ResultAggregator();
      const long = 'x'.repeat(600);
      const result = ra.summarizeOutput(long);
      expect(result.length).toBeLessThan(600);
      expect(result).toContain('truncated');
    });
  });

  // ── Metrics ───────────────────────────────────────────────────────────

  describe('calculateMetrics', () => {
    test('calculates success rate', () => {
      const ra = new ResultAggregator();
      const agg = {
        tasks: [
          { success: true, duration: 1000, filesModified: ['a.js'] },
          { success: false, duration: 500, filesModified: [] },
        ],
        conflicts: [],
        warnings: [],
      };
      const metrics = ra.calculateMetrics(agg, Date.now() - 1000);
      expect(metrics.totalTasks).toBe(2);
      expect(metrics.successful).toBe(1);
      expect(metrics.failed).toBe(1);
      expect(metrics.successRate).toBe(50);
    });

    test('counts unique files modified', () => {
      const ra = new ResultAggregator();
      const agg = {
        tasks: [
          { success: true, filesModified: ['a.js', 'b.js'] },
          { success: true, filesModified: ['b.js', 'c.js'] },
        ],
        conflicts: [],
        warnings: [],
      };
      const metrics = ra.calculateMetrics(agg, Date.now());
      expect(metrics.filesModified).toBe(3);
      expect(metrics.duplicateFileEdits).toBe(1);
    });
  });

  // ── Report generation ─────────────────────────────────────────────────

  describe('generateReport', () => {
    test('writes JSON and markdown files', async () => {
      const reportDir = path.join(tmpDir, 'plan');
      const ra = new ResultAggregator({ reportDir });

      const agg = {
        waveIndex: 1,
        completedAt: new Date().toISOString(),
        tasks: [{ taskId: 't1', agentId: '@dev', success: true, duration: 1000 }],
        conflicts: [],
        warnings: [],
        metrics: { totalTasks: 1, successful: 1, failed: 0, successRate: 100, totalDuration: 1000, conflictCount: 0, filesModified: 1 },
      };

      const reportPath = await ra.generateReport(agg);
      expect(fs.existsSync(reportPath)).toBe(true);
      expect(fs.existsSync(reportPath.replace('.json', '.md'))).toBe(true);
    });
  });

  // ── formatMarkdown ────────────────────────────────────────────────────

  describe('formatMarkdown', () => {
    test('generates markdown with metrics', () => {
      const ra = new ResultAggregator();
      const agg = {
        completedAt: new Date().toISOString(),
        tasks: [{ taskId: 't1', agentId: '@dev', success: true, duration: 1000 }],
        conflicts: [],
        warnings: [],
        metrics: { totalTasks: 1, successful: 1, failed: 0, successRate: 100, totalDuration: 1000, conflictCount: 0 },
      };
      const md = ra.formatMarkdown(agg);
      expect(md).toContain('Wave Results Report');
      expect(md).toContain('100');
    });

    test('includes conflicts section', () => {
      const ra = new ResultAggregator();
      const agg = {
        completedAt: new Date().toISOString(),
        tasks: [],
        conflicts: [{ file: 'app.js', type: 'concurrent', severity: 'high', tasks: ['t1', 't2'], resolution: 'merge' }],
        warnings: [],
        metrics: { totalTasks: 0, successful: 0, failed: 0, successRate: 100, totalDuration: 0 },
      };
      const md = ra.formatMarkdown(agg);
      expect(md).toContain('Conflicts');
      expect(md).toContain('app.js');
    });
  });

  // ── History ───────────────────────────────────────────────────────────

  describe('History', () => {
    test('getHistory returns limited entries', () => {
      const ra = new ResultAggregator();
      ra.history = [{ id: 1 }, { id: 2 }, { id: 3 }];
      expect(ra.getHistory(2).length).toBe(2);
    });
  });

  // ── formatStatus ──────────────────────────────────────────────────────

  describe('formatStatus', () => {
    test('returns status string', () => {
      const ra = new ResultAggregator();
      const status = ra.formatStatus();
      expect(status).toContain('Result Aggregator');
    });
  });
});
