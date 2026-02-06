/**
 * Wave Executor Tests - Story EXC-1 (AC1)
 *
 * Tests for parallel wave execution including:
 * - Constructor and configuration
 * - executeWaves() single/multiple/mixed scenarios
 * - executeWave() parallel chunking
 * - executeTaskWithTimeout() success and timeout
 * - chunkArray() utility
 * - calculateMetrics()
 * - Event emissions
 */

const {
  createMockTask,
  createMockTasks,
  createMockTaskExecutor,
  collectEvents,
} = require('./execution-test-helpers');

// Mock WaveAnalyzer module to prevent constructor error in WaveExecutor
// The wave-executor.js does try { require('../../workflow-intelligence/engine/wave-analyzer') }
// which succeeds but exports a non-constructor. We force it to null via jest.mock.
jest.mock('../../.aios-core/workflow-intelligence/engine/wave-analyzer', () => null);

const WaveExecutor = require('../../.aios-core/core/execution/wave-executor');

// Null-safe analyzer for tests that need one
const NOOP_ANALYZER = { analyze: jest.fn().mockReturnValue({ waves: [] }) };

// ═══════════════════════════════════════════════════════════════════════════════
//                              CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════

describe('WaveExecutor', () => {
  let executor;

  afterEach(() => {
    if (executor) {
      executor.removeAllListeners();
    }
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    test('should create with default config (WE-01)', () => {
      executor = new WaveExecutor();

      expect(executor.maxParallel).toBe(4);
      expect(executor.taskTimeout).toBe(10 * 60 * 1000);
      expect(executor.continueOnNonCriticalFailure).toBe(true);
      expect(executor.activeExecutions).toBeInstanceOf(Map);
      expect(executor.completedWaves).toEqual([]);
    });

    test('should create with custom config (WE-02)', () => {
      executor = new WaveExecutor({
        maxParallel: 8,
        taskTimeout: 5000,
        continueOnNonCriticalFailure: false,
      });

      expect(executor.maxParallel).toBe(8);
      expect(executor.taskTimeout).toBe(5000);
      expect(executor.continueOnNonCriticalFailure).toBe(false);
    });

    test('should accept custom waveAnalyzer and taskExecutor', () => {
      const mockAnalyzer = { analyze: jest.fn() };
      const mockExecutor = jest.fn();

      executor = new WaveExecutor({
        waveAnalyzer: mockAnalyzer,
        taskExecutor: mockExecutor,
      });

      expect(executor.waveAnalyzer).toBe(mockAnalyzer);
      expect(executor.taskExecutor).toBe(mockExecutor);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              executeWaves()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('executeWaves()', () => {
    test('should return success with no waves (WE-03)', async () => {
      const mockAnalyzer = {
        analyze: jest.fn().mockReturnValue({ waves: [] }),
      };
      executor = new WaveExecutor({ waveAnalyzer: mockAnalyzer });

      const result = await executor.executeWaves('wf-1');

      expect(result.success).toBe(true);
      expect(result.waves).toEqual([]);
      expect(result.totalDuration).toBe(0);
      expect(result.message).toBe('No waves to execute');
    });

    test('should execute single wave successfully (WE-04)', async () => {
      const tasks = createMockTasks(2);
      const mockAnalyzer = {
        analyze: jest.fn().mockReturnValue({
          waves: [{ index: 1, tasks }],
        }),
      };
      const mockTaskExec = createMockTaskExecutor({ success: true });

      executor = new WaveExecutor({
        waveAnalyzer: mockAnalyzer,
        taskExecutor: mockTaskExec,
      });

      const result = await executor.executeWaves('wf-1');

      expect(result.success).toBe(true);
      expect(result.waves).toHaveLength(1);
      expect(result.waves[0].allSucceeded).toBe(true);
      expect(result.aborted).toBe(false);
    });

    test('should execute multiple sequential waves (WE-05)', async () => {
      const tasks1 = createMockTasks(2);
      const tasks2 = [createMockTask({ id: 'task-3' })];
      const mockAnalyzer = {
        analyze: jest.fn().mockReturnValue({
          waves: [
            { index: 1, tasks: tasks1 },
            { index: 2, tasks: tasks2 },
          ],
        }),
      };
      const mockTaskExec = createMockTaskExecutor({ success: true });

      executor = new WaveExecutor({
        waveAnalyzer: mockAnalyzer,
        taskExecutor: mockTaskExec,
      });

      const result = await executor.executeWaves('wf-1');

      expect(result.success).toBe(true);
      expect(result.waves).toHaveLength(2);
      expect(result.metrics.totalWaves).toBe(2);
    });

    test('should handle mixed success/failure with non-critical tasks (WE-06)', async () => {
      let callCount = 0;
      const mockTaskExec = jest.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
          return { success: false, error: 'fail' };
        }
        return { success: true, output: 'ok' };
      });

      const tasks = createMockTasks(3);
      const mockAnalyzer = {
        analyze: jest.fn().mockReturnValue({
          waves: [{ index: 1, tasks }],
        }),
      };

      executor = new WaveExecutor({
        waveAnalyzer: mockAnalyzer,
        taskExecutor: mockTaskExec,
        continueOnNonCriticalFailure: true,
      });

      const result = await executor.executeWaves('wf-1');

      // Non-critical failure doesn't abort
      expect(result.aborted).toBe(false);
      expect(result.waves[0].allSucceeded).toBe(false);
    });

    test('should abort on critical task failure when configured (WE-07)', async () => {
      const mockTaskExec = jest.fn().mockImplementation(async () => {
        return { success: false, error: 'critical failure' };
      });

      const tasks = [createMockTask({ id: 'task-1', critical: true })];
      const mockAnalyzer = {
        analyze: jest.fn().mockReturnValue({
          waves: [
            { index: 1, tasks },
            { index: 2, tasks: createMockTasks(1) },
          ],
        }),
      };

      executor = new WaveExecutor({
        waveAnalyzer: mockAnalyzer,
        taskExecutor: mockTaskExec,
        continueOnNonCriticalFailure: false,
      });

      const result = await executor.executeWaves('wf-1');

      expect(result.aborted).toBe(true);
      expect(result.success).toBe(false);
      // Second wave should not execute
      expect(result.waves).toHaveLength(1);
    });

    test('should use fallback single wave without analyzer (WE-08)', async () => {
      const tasks = createMockTasks(2);
      const mockTaskExec = createMockTaskExecutor({ success: true });

      executor = new WaveExecutor({
        waveAnalyzer: null,
        taskExecutor: mockTaskExec,
      });

      const result = await executor.executeWaves('wf-1', { tasks });

      expect(result.success).toBe(true);
      expect(result.waves).toHaveLength(1);
    });

    test('should emit execution events (WE-08)', async () => {
      const tasks = createMockTasks(1);
      const mockAnalyzer = {
        analyze: jest.fn().mockReturnValue({
          waves: [{ index: 1, tasks }],
        }),
      };
      const mockTaskExec = createMockTaskExecutor({ success: true });

      executor = new WaveExecutor({
        waveAnalyzer: mockAnalyzer,
        taskExecutor: mockTaskExec,
      });

      const tracker = collectEvents(executor, [
        'execution_started',
        'wave_started',
        'wave_completed',
        'execution_completed',
        'task_started',
        'task_completed',
      ]);

      await executor.executeWaves('wf-1');

      expect(tracker.count('execution_started')).toBe(1);
      expect(tracker.count('wave_started')).toBe(1);
      expect(tracker.count('wave_completed')).toBe(1);
      expect(tracker.count('execution_completed')).toBe(1);
      expect(tracker.count('task_started')).toBe(1);
      expect(tracker.count('task_completed')).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              executeWave()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('executeWave()', () => {
    test('should return empty for wave with no tasks', async () => {
      executor = new WaveExecutor();

      const result = await executor.executeWave({ index: 1, tasks: [] }, {});

      expect(result).toEqual([]);
    });

    test('should respect maxParallel chunking (WE-09)', async () => {
      let concurrentCount = 0;
      let maxConcurrent = 0;

      const mockTaskExec = jest.fn().mockImplementation(async () => {
        concurrentCount++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCount);
        await new Promise((resolve) => setTimeout(resolve, 10));
        concurrentCount--;
        return { success: true, output: 'ok' };
      });

      executor = new WaveExecutor({
        maxParallel: 2,
        taskExecutor: mockTaskExec,
      });

      const tasks = createMockTasks(4);
      await executor.executeWave({ index: 1, tasks }, {});

      // With maxParallel=2 and 4 tasks, max concurrent should be 2
      expect(maxConcurrent).toBeLessThanOrEqual(2);
      expect(mockTaskExec).toHaveBeenCalledTimes(4);
    });

    test('should collect results from all tasks in wave', async () => {
      const mockTaskExec = createMockTaskExecutor({ success: true });
      executor = new WaveExecutor({ taskExecutor: mockTaskExec });

      const tasks = createMockTasks(3);
      const results = await executor.executeWave({ index: 1, tasks }, {});

      expect(results).toHaveLength(3);
      results.forEach((r) => {
        expect(r.success).toBe(true);
        expect(r).toHaveProperty('taskId');
        expect(r).toHaveProperty('duration');
      });
    });

    test('should handle rejected promises gracefully', async () => {
      const mockTaskExec = jest.fn().mockRejectedValue(new Error('Boom'));
      executor = new WaveExecutor({ taskExecutor: mockTaskExec });

      const tasks = createMockTasks(1);
      const results = await executor.executeWave({ index: 1, tasks }, {});

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      // executeTaskWithTimeout catches the error internally, so result is fulfilled
      // with success: false and error message
      expect(results[0].result.error).toBe('Boom');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                         executeTaskWithTimeout()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('executeTaskWithTimeout()', () => {
    test('should execute task successfully (WE-13)', async () => {
      const mockTaskExec = createMockTaskExecutor({ success: true, output: 'done' });
      executor = new WaveExecutor({ taskExecutor: mockTaskExec });

      const task = createMockTask({ id: 'task-1' });
      const result = await executor.executeTaskWithTimeout(task, {});

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    test('should timeout task that takes too long (WE-14)', async () => {
      jest.useFakeTimers();

      const neverResolves = jest.fn().mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      executor = new WaveExecutor({
        taskExecutor: neverResolves,
        taskTimeout: 5000,
      });

      const task = createMockTask({ id: 'slow-task' });
      const resultPromise = executor.executeTaskWithTimeout(task, {});

      jest.advanceTimersByTime(5001);

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
    });

    test('should track active executions', async () => {
      const mockTaskExec = createMockTaskExecutor({ success: true, delay: 10 });
      executor = new WaveExecutor({ taskExecutor: mockTaskExec });

      const task = createMockTask({ id: 'tracked-task' });
      const promise = executor.executeTaskWithTimeout(task, {});

      // During execution, task should be tracked
      expect(executor.activeExecutions.has('tracked-task')).toBe(true);

      await promise;

      // After execution, still tracked briefly for monitoring
      expect(executor.activeExecutions.get('tracked-task').status).toBe('completed');
    });

    test('should emit task_started event', async () => {
      const mockTaskExec = createMockTaskExecutor({ success: true });
      executor = new WaveExecutor({ taskExecutor: mockTaskExec });

      const tracker = collectEvents(executor, ['task_started']);
      const task = createMockTask({ id: 'emit-task' });

      await executor.executeTaskWithTimeout(task, {});

      expect(tracker.count('task_started')).toBe(1);
      expect(tracker.getByName('task_started')[0].data.taskId).toBe('emit-task');
    });

    test('should use default executor when no taskExecutor provided', async () => {
      executor = new WaveExecutor({ taskExecutor: null });

      const task = createMockTask({ id: 'default-task' });
      const result = await executor.executeTaskWithTimeout(task, {});

      expect(result.success).toBe(true);
    });

    test('should use rate limit manager when available', async () => {
      const mockRLM = {
        executeWithRetry: jest.fn().mockResolvedValue({ success: true, output: 'ok' }),
      };
      const mockTaskExec = createMockTaskExecutor({ success: true });

      executor = new WaveExecutor({
        taskExecutor: mockTaskExec,
        rateLimitManager: mockRLM,
      });

      const task = createMockTask({ id: 'rl-task' });
      await executor.executeTaskWithTimeout(task, {});

      expect(mockRLM.executeWithRetry).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              chunkArray()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('chunkArray()', () => {
    beforeEach(() => {
      executor = new WaveExecutor();
    });

    test('should chunk array evenly (WE-15)', () => {
      const result = executor.chunkArray([1, 2, 3, 4], 2);
      expect(result).toEqual([[1, 2], [3, 4]]);
    });

    test('should handle uneven chunks (WE-16)', () => {
      const result = executor.chunkArray([1, 2, 3, 4, 5], 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('should handle empty array', () => {
      const result = executor.chunkArray([], 3);
      expect(result).toEqual([]);
    });

    test('should handle chunk size larger than array', () => {
      const result = executor.chunkArray([1, 2], 5);
      expect(result).toEqual([[1, 2]]);
    });

    test('should handle single element', () => {
      const result = executor.chunkArray([1], 1);
      expect(result).toEqual([[1]]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              calculateMetrics()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('calculateMetrics()', () => {
    beforeEach(() => {
      executor = new WaveExecutor();
    });

    test('should calculate metrics for successful waves (WE-17)', () => {
      const waveResults = [
        {
          wave: 1,
          results: [
            { taskId: 't1', success: true, duration: 1000 },
            { taskId: 't2', success: true, duration: 2000 },
          ],
          allSucceeded: true,
        },
      ];

      const metrics = executor.calculateMetrics(waveResults);

      expect(metrics.totalTasks).toBe(2);
      expect(metrics.successful).toBe(2);
      expect(metrics.failed).toBe(0);
      expect(metrics.successRate).toBe(100);
      expect(metrics.totalDuration).toBe(3000);
      expect(metrics.wallTime).toBe(2000);
      expect(metrics.parallelEfficiency).toBe(1.5);
      expect(metrics.totalWaves).toBe(1);
    });

    test('should calculate metrics with failures', () => {
      const waveResults = [
        {
          wave: 1,
          results: [
            { taskId: 't1', success: true, duration: 1000 },
            { taskId: 't2', success: false, duration: 500 },
          ],
          allSucceeded: false,
        },
      ];

      const metrics = executor.calculateMetrics(waveResults);

      expect(metrics.totalTasks).toBe(2);
      expect(metrics.successful).toBe(1);
      expect(metrics.failed).toBe(1);
      expect(metrics.successRate).toBe(50);
    });

    test('should handle empty wave results', () => {
      const metrics = executor.calculateMetrics([]);

      expect(metrics.totalTasks).toBe(0);
      expect(metrics.successRate).toBe(100);
      expect(metrics.totalWaves).toBe(0);
    });

    test('should calculate across multiple waves', () => {
      const waveResults = [
        {
          wave: 1,
          results: [
            { taskId: 't1', success: true, duration: 1000 },
          ],
        },
        {
          wave: 2,
          results: [
            { taskId: 't2', success: true, duration: 2000 },
            { taskId: 't3', success: true, duration: 1500 },
          ],
        },
      ];

      const metrics = executor.calculateMetrics(waveResults);

      expect(metrics.totalTasks).toBe(3);
      expect(metrics.totalWaves).toBe(2);
      expect(metrics.wallTime).toBe(1000 + 2000); // max of each wave
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              OTHER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getStatus()', () => {
    test('should return current execution status', () => {
      executor = new WaveExecutor();

      const status = executor.getStatus();

      expect(status).toHaveProperty('currentWave');
      expect(status).toHaveProperty('activeExecutions');
      expect(status).toHaveProperty('completedWaves');
    });
  });

  describe('formatStatus()', () => {
    test('should return formatted string', () => {
      executor = new WaveExecutor();

      const output = executor.formatStatus();

      expect(output).toContain('Wave Executor Status');
      expect(typeof output).toBe('string');
    });
  });

  describe('cancelAll()', () => {
    test('should cancel active executions and emit events', async () => {
      executor = new WaveExecutor();

      const tracker = collectEvents(executor, ['task_cancelled', 'execution_cancelled']);

      // Simulate active execution
      executor.activeExecutions.set('task-1', { status: 'running' });

      executor.cancelAll();

      expect(tracker.count('task_cancelled')).toBe(1);
      expect(tracker.count('execution_cancelled')).toBe(1);
      expect(executor.activeExecutions.get('task-1').status).toBe('cancelled');
    });
  });
});
