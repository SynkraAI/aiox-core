'use strict';

/**
 * Unit tests for WaveExecutor
 *
 * Covers wave-based parallel task execution: single/multi-wave workflows,
 * task chunking, timeout handling, critical task failure abort,
 * EventEmitter lifecycle, metrics calculation, status reporting, and cancelAll.
 *
 * Refs #52
 */

jest.mock('../../../.aios-core/workflow-intelligence/engine/wave-analyzer', () => null);
jest.mock('../../../.aios-core/core/execution/rate-limit-manager', () => null);

const WaveExecutor = require('../../../.aios-core/core/execution/wave-executor');

describe('WaveExecutor', () => {
  let executor;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    executor = new WaveExecutor({
      taskExecutor: (task) => Promise.resolve({ success: true, output: `done-${task.id}` }),
      waveAnalyzer: null,
      rateLimitManager: null,
      taskTimeout: 5000,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Constructor ──────────────────────────────────────────────────

  describe('constructor', () => {
    test('defaults maxParallel to 4', () => {
      const ex = new WaveExecutor();
      expect(ex.maxParallel).toBe(4);
    });

    test('defaults taskTimeout to 10 minutes', () => {
      const ex = new WaveExecutor();
      expect(ex.taskTimeout).toBe(10 * 60 * 1000);
    });

    test('defaults continueOnNonCriticalFailure to true', () => {
      const ex = new WaveExecutor();
      expect(ex.continueOnNonCriticalFailure).toBe(true);
    });

    test('accepts custom config', () => {
      const ex = new WaveExecutor({ maxParallel: 2, taskTimeout: 1000 });
      expect(ex.maxParallel).toBe(2);
      expect(ex.taskTimeout).toBe(1000);
    });

    test('extends EventEmitter', () => {
      expect(typeof executor.on).toBe('function');
      expect(typeof executor.emit).toBe('function');
    });

    test('initializes empty state', () => {
      expect(executor.activeExecutions.size).toBe(0);
      expect(executor.completedWaves).toEqual([]);
      expect(executor.currentWaveIndex).toBe(0);
    });
  });

  // ── executeWaves ─────────────────────────────────────────────────

  describe('executeWaves', () => {
    test('returns success with empty waves', async () => {
      jest.useRealTimers();
      const ex = new WaveExecutor({ waveAnalyzer: { analyze: () => ({ waves: [] }) } });

      const result = await ex.executeWaves('wf-1');

      expect(result.success).toBe(true);
      expect(result.waves).toEqual([]);
      expect(result.message).toBe('No waves to execute');
    });

    test('executes single wave with tasks', async () => {
      jest.useRealTimers();
      const ex = new WaveExecutor({
        taskExecutor: (task) => Promise.resolve({ success: true, output: task.id }),
      });

      const tasks = [
        { id: 'task-1', description: 'First' },
        { id: 'task-2', description: 'Second' },
      ];
      const result = await ex.executeWaves('wf-1', { tasks });

      expect(result.success).toBe(true);
      expect(result.workflowId).toBe('wf-1');
      expect(result.waves).toHaveLength(1);
      expect(result.waves[0].results).toHaveLength(2);
      expect(result.waves[0].allSucceeded).toBe(true);
    });

    test('executes multiple waves from analyzer', async () => {
      jest.useRealTimers();
      const ex = new WaveExecutor({
        taskExecutor: () => Promise.resolve({ success: true }),
        waveAnalyzer: {
          analyze: () => ({
            waves: [
              { index: 1, tasks: [{ id: 't1', description: 'a' }] },
              { index: 2, tasks: [{ id: 't2', description: 'b' }] },
            ],
          }),
        },
      });

      const result = await ex.executeWaves('wf-2');

      expect(result.waves).toHaveLength(2);
      expect(result.success).toBe(true);
      expect(result.metrics).toBeDefined();
    });
  });

  // ── Critical task failure ────────────────────────────────────────

  describe('critical task failure', () => {
    test('aborts when critical task fails and continueOnNonCriticalFailure is false', async () => {
      jest.useRealTimers();
      const ex = new WaveExecutor({
        taskExecutor: (task) => {
          if (task.id === 'critical-fail') return Promise.resolve({ success: false });
          return Promise.resolve({ success: true });
        },
        continueOnNonCriticalFailure: false,
        waveAnalyzer: {
          analyze: () => ({
            waves: [
              { index: 1, tasks: [{ id: 'critical-fail', description: 'will fail', critical: true }] },
              { index: 2, tasks: [{ id: 'should-skip', description: 'skipped' }] },
            ],
          }),
        },
      });

      const result = await ex.executeWaves('wf-abort');

      expect(result.aborted).toBe(true);
      expect(result.success).toBe(false);
      expect(result.waves).toHaveLength(1);
    });

    test('continues when non-critical task fails', async () => {
      jest.useRealTimers();
      const ex = new WaveExecutor({
        taskExecutor: (task) => {
          if (task.id === 'noncrit-fail') return Promise.resolve({ success: false });
          return Promise.resolve({ success: true });
        },
        waveAnalyzer: {
          analyze: () => ({
            waves: [
              { index: 1, tasks: [{ id: 'noncrit-fail', description: 'fails', critical: false }] },
              { index: 2, tasks: [{ id: 'runs', description: 'runs' }] },
            ],
          }),
        },
      });

      const result = await ex.executeWaves('wf-continue');

      expect(result.aborted).toBe(false);
      expect(result.waves).toHaveLength(2);
    });
  });

  // ── executeWave ──────────────────────────────────────────────────

  describe('executeWave', () => {
    test('returns empty array for wave with no tasks', async () => {
      jest.useRealTimers();
      const result = await executor.executeWave({ tasks: [], index: 1 }, {});
      expect(result).toEqual([]);
    });

    test('handles task executor rejection', async () => {
      jest.useRealTimers();
      const ex = new WaveExecutor({
        taskExecutor: () => Promise.reject(new Error('boom')),
      });

      const result = await ex.executeWave(
        { tasks: [{ id: 'fail-task', description: 'will fail' }], index: 1 },
        {},
      );

      expect(result).toHaveLength(1);
      expect(result[0].success).toBe(false);
    });
  });

  // ── chunkArray ───────────────────────────────────────────────────

  describe('chunkArray', () => {
    test('splits array into chunks of given size', () => {
      const result = executor.chunkArray([1, 2, 3, 4, 5], 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('returns single chunk when array is smaller than size', () => {
      const result = executor.chunkArray([1, 2], 5);
      expect(result).toEqual([[1, 2]]);
    });

    test('returns empty array for empty input', () => {
      const result = executor.chunkArray([], 3);
      expect(result).toEqual([]);
    });
  });

  // ── calculateMetrics ─────────────────────────────────────────────

  describe('calculateMetrics', () => {
    test('computes correct metrics', () => {
      const waveResults = [
        {
          results: [
            { success: true, duration: 100 },
            { success: true, duration: 200 },
            { success: false, duration: 50 },
          ],
        },
      ];

      const metrics = executor.calculateMetrics(waveResults);

      expect(metrics.totalTasks).toBe(3);
      expect(metrics.successful).toBe(2);
      expect(metrics.failed).toBe(1);
      expect(metrics.successRate).toBeCloseTo(66.67, 1);
      expect(metrics.totalDuration).toBe(350);
      expect(metrics.wallTime).toBe(200);
      expect(metrics.totalWaves).toBe(1);
    });

    test('returns 100% success rate for empty results', () => {
      const metrics = executor.calculateMetrics([]);
      expect(metrics.successRate).toBe(100);
      expect(metrics.totalTasks).toBe(0);
    });
  });

  // ── getStatus / formatStatus ─────────────────────────────────────

  describe('getStatus', () => {
    test('returns current state', () => {
      executor.currentWaveIndex = 3;
      const status = executor.getStatus();

      expect(status.currentWave).toBe(3);
      expect(status.activeExecutions).toEqual([]);
      expect(status.completedWaves).toBe(0);
    });
  });

  describe('formatStatus', () => {
    test('returns formatted string', () => {
      const output = executor.formatStatus();

      expect(output).toContain('Wave Executor Status');
      expect(output).toContain('Current Wave');
      expect(output).toContain('Active Executions');
    });
  });

  // ── cancelAll ────────────────────────────────────────────────────

  describe('cancelAll', () => {
    test('marks all active executions as cancelled', () => {
      executor.activeExecutions.set('t1', { task: { id: 't1' }, status: 'running', startTime: Date.now() });
      executor.activeExecutions.set('t2', { task: { id: 't2' }, status: 'running', startTime: Date.now() });

      const events = [];
      executor.on('task_cancelled', (data) => events.push(data));
      executor.on('execution_cancelled', (data) => events.push(data));

      executor.cancelAll();

      expect(executor.activeExecutions.get('t1').status).toBe('cancelled');
      expect(executor.activeExecutions.get('t2').status).toBe('cancelled');
      // 2 x task_cancelled (one per task) + 1 x execution_cancelled
      expect(events).toHaveLength(3);
    });
  });

  // ── Events ───────────────────────────────────────────────────────

  describe('events', () => {
    test('emits execution_started with workflow info', async () => {
      jest.useRealTimers();
      const events = [];
      const ex = new WaveExecutor({
        taskExecutor: () => Promise.resolve({ success: true }),
      });
      ex.on('execution_started', (data) => events.push(data));

      await ex.executeWaves('wf-events', { tasks: [{ id: 't1', description: 'a' }] });

      expect(events).toHaveLength(1);
      expect(events[0].workflowId).toBe('wf-events');
      expect(events[0].totalWaves).toBe(1);
    });

    test('emits wave_started and wave_completed', async () => {
      jest.useRealTimers();
      const started = [];
      const completed = [];
      const ex = new WaveExecutor({
        taskExecutor: () => Promise.resolve({ success: true }),
      });
      ex.on('wave_started', (data) => started.push(data));
      ex.on('wave_completed', (data) => completed.push(data));

      await ex.executeWaves('wf-wave', { tasks: [{ id: 't1', description: 'a' }] });

      expect(started).toHaveLength(1);
      expect(completed).toHaveLength(1);
      expect(completed[0].success).toBe(true);
    });

    test('emits task_completed for each task', async () => {
      jest.useRealTimers();
      const events = [];
      const ex = new WaveExecutor({
        taskExecutor: () => Promise.resolve({ success: true }),
      });
      ex.on('task_completed', (data) => events.push(data));

      await ex.executeWaves('wf-tc', {
        tasks: [
          { id: 't1', description: 'a' },
          { id: 't2', description: 'b' },
        ],
      });

      expect(events).toHaveLength(2);
    });

    test('emits wave_failed on critical failure', async () => {
      jest.useRealTimers();
      const events = [];
      const ex = new WaveExecutor({
        taskExecutor: () => Promise.resolve({ success: false }),
        waveAnalyzer: {
          analyze: () => ({
            waves: [{ index: 1, tasks: [{ id: 'crit', description: 'x', critical: true }] }],
          }),
        },
      });
      ex.on('wave_failed', (data) => events.push(data));

      await ex.executeWaves('wf-fail');

      expect(events).toHaveLength(1);
      expect(events[0].reason).toBe('critical_task_failed');
    });
  });

  // ── defaultExecutor ──────────────────────────────────────────────

  describe('defaultExecutor', () => {
    test('returns success with default message', async () => {
      jest.useRealTimers();
      const ex = new WaveExecutor();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      try {
        const result = await ex.defaultExecutor({ id: 'test-task' }, {});

        expect(result.success).toBe(true);
        expect(result.output).toContain('Default executor');
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });
});
