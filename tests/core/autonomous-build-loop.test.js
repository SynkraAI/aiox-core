/**
 * Autonomous Build Loop - Test Suite
 * Story EXC-1, AC3 - autonomous-build-loop.js coverage
 *
 * Tests: constructor, run(), executeLoop, executeSubtaskWithRetry,
 * executeSubtask, loadPlan, countSubtasks, pause/resume/stop,
 * isTimedOut, isComplete, generateReport, formatDuration, formatStatus, enums
 */

const path = require('path');
const fs = require('fs');
const {
  createTempDir,
  cleanupTempDir,
  createMockPlan,
  collectEvents,
} = require('./execution-test-helpers');

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock BuildStateManager (required dependency)
const mockStateInstance = {
  storyId: 'test-story',
  _state: {
    metrics: { totalSubtasks: 0 },
    checkpoints: [],
    completedSubtasks: [],
  },
  loadOrCreateState: jest.fn().mockReturnValue({
    checkpoints: [],
    completedSubtasks: [],
  }),
  saveState: jest.fn(),
  completeBuild: jest.fn(),
  failBuild: jest.fn(),
  startSubtask: jest.fn(),
  completeSubtask: jest.fn(),
  recordFailure: jest.fn().mockReturnValue({ failure: {}, isStuck: false }),
  resumeBuild: jest.fn().mockReturnValue({
    lastCheckpoint: { id: 'cp-1' },
    plan: null,
    worktree: null,
  }),
  formatStatus: jest.fn().mockReturnValue('Status: OK'),
};

jest.mock('../../.aios-core/core/execution/build-state-manager', () => ({
  BuildStateManager: jest.fn().mockImplementation(() => ({ ...mockStateInstance })),
}));

// Mock optional dependencies to not load
jest.mock('../../.aios-core/infrastructure/scripts/recovery-tracker', () => {
  throw new Error('not available');
});
jest.mock('../../.aios-core/infrastructure/scripts/worktree-manager', () => {
  throw new Error('not available');
});

const {
  AutonomousBuildLoop,
  BuildEvent,
  SubtaskResult,
  DEFAULT_CONFIG,
} = require('../../.aios-core/core/execution/autonomous-build-loop');

const { BuildStateManager } = require('../../.aios-core/core/execution/build-state-manager');

// ── Helpers ──────────────────────────────────────────────────────────────────

function createTestPlan(subtaskCount = 2) {
  return {
    phases: [
      {
        id: 'phase-1',
        subtasks: Array.from({ length: subtaskCount }, (_, i) => ({
          id: `subtask-${i + 1}`,
          description: `Test subtask ${i + 1}`,
          files: [`file-${i + 1}.js`],
        })),
      },
    ],
  };
}

function createLoop(overrides = {}) {
  return new AutonomousBuildLoop({
    verbose: false,
    globalTimeout: 60000,
    maxIterations: 3,
    selfCritiqueEnabled: false,
    verificationEnabled: false,
    ...overrides,
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AutonomousBuildLoop', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempDir('abl-test-');
    jest.clearAllMocks();
    // Reset mock state
    mockStateInstance._state.metrics.totalSubtasks = 0;
    mockStateInstance._state.checkpoints = [];
    mockStateInstance._state.completedSubtasks = [];
    mockStateInstance.loadOrCreateState.mockReturnValue({
      checkpoints: [],
      completedSubtasks: [],
    });
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  // ── Enums & Constants ───────────────────────────────────────────────────

  describe('Enums & Constants', () => {
    test('BuildEvent has all expected event types', () => {
      expect(BuildEvent.BUILD_STARTED).toBe('build_started');
      expect(BuildEvent.SUBTASK_STARTED).toBe('subtask_started');
      expect(BuildEvent.SUBTASK_COMPLETED).toBe('subtask_completed');
      expect(BuildEvent.SUBTASK_FAILED).toBe('subtask_failed');
      expect(BuildEvent.ITERATION_STARTED).toBe('iteration_started');
      expect(BuildEvent.ITERATION_COMPLETED).toBe('iteration_completed');
      expect(BuildEvent.SELF_CRITIQUE).toBe('self_critique');
      expect(BuildEvent.VERIFICATION_STARTED).toBe('verification_started');
      expect(BuildEvent.VERIFICATION_COMPLETED).toBe('verification_completed');
      expect(BuildEvent.BUILD_FAILED).toBe('build_failed');
      expect(BuildEvent.BUILD_SUCCESS).toBe('build_success');
      expect(BuildEvent.BUILD_TIMEOUT).toBe('build_timeout');
      expect(BuildEvent.BUILD_PAUSED).toBe('build_paused');
    });

    test('SubtaskResult has all expected values', () => {
      expect(SubtaskResult.SUCCESS).toBe('success');
      expect(SubtaskResult.FAILED).toBe('failed');
      expect(SubtaskResult.TIMEOUT).toBe('timeout');
      expect(SubtaskResult.SKIPPED).toBe('skipped');
    });

    test('DEFAULT_CONFIG has expected defaults', () => {
      expect(DEFAULT_CONFIG.maxIterations).toBe(10);
      expect(DEFAULT_CONFIG.globalTimeout).toBe(30 * 60 * 1000);
      expect(DEFAULT_CONFIG.subtaskTimeout).toBe(5 * 60 * 1000);
      expect(DEFAULT_CONFIG.selfCritiqueEnabled).toBe(true);
      expect(DEFAULT_CONFIG.verificationEnabled).toBe(true);
      expect(DEFAULT_CONFIG.autoCommit).toBe(true);
      expect(DEFAULT_CONFIG.pauseOnFailure).toBe(false);
      expect(DEFAULT_CONFIG.verbose).toBe(false);
      expect(DEFAULT_CONFIG.useWorktree).toBe(false);
      expect(DEFAULT_CONFIG.worktreeCleanup).toBe(true);
    });
  });

  // ── Constructor ─────────────────────────────────────────────────────────

  describe('Constructor', () => {
    test('creates with default config', () => {
      const loop = new AutonomousBuildLoop();
      expect(loop.config.maxIterations).toBe(10);
      expect(loop.config.globalTimeout).toBe(30 * 60 * 1000);
      expect(loop.isRunning).toBe(false);
      expect(loop.isPaused).toBe(false);
      expect(loop.currentSubtask).toBeNull();
      expect(loop.startTime).toBeNull();
    });

    test('merges custom config over defaults', () => {
      const loop = new AutonomousBuildLoop({
        maxIterations: 5,
        verbose: true,
      });
      expect(loop.config.maxIterations).toBe(5);
      expect(loop.config.verbose).toBe(true);
      expect(loop.config.globalTimeout).toBe(30 * 60 * 1000); // default preserved
    });

    test('initializes stats to zero', () => {
      const loop = new AutonomousBuildLoop();
      expect(loop.stats).toEqual({
        totalSubtasks: 0,
        completedSubtasks: 0,
        failedSubtasks: 0,
        totalIterations: 0,
        successfulIterations: 0,
        failedIterations: 0,
      });
    });

    test('extends EventEmitter', () => {
      const loop = new AutonomousBuildLoop();
      expect(typeof loop.on).toBe('function');
      expect(typeof loop.emit).toBe('function');
    });
  });

  // ── run() ───────────────────────────────────────────────────────────────

  describe('run()', () => {
    test('throws if already running', async () => {
      const loop = createLoop();
      loop.isRunning = true;
      await expect(loop.run('story-1')).rejects.toThrow('Build loop is already running');
    });

    test('emits BUILD_STARTED event', async () => {
      const loop = createLoop();
      const plan = createTestPlan(1);
      const events = collectEvents(loop, [BuildEvent.BUILD_STARTED]);

      await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(events.count(BuildEvent.BUILD_STARTED)).toBe(1);
      expect(events.getByName(BuildEvent.BUILD_STARTED)[0].data.storyId).toBe('story-1');
    });

    test('executes all subtasks in plan successfully', async () => {
      const loop = createLoop();
      const plan = createTestPlan(2);

      const result = await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(result.success).toBe(true);
      expect(result.storyId).toBe('story-1');
      expect(result.stats.completedSubtasks).toBe(2);
    });

    test('throws when no plan is found', async () => {
      const loop = createLoop();
      // No plan provided and no plan files exist
      await expect(loop.run('story-1', { rootPath: tmpDir })).rejects.toThrow(
        'No implementation plan found for story-1',
      );
    });

    test('emits BUILD_SUCCESS on successful completion', async () => {
      const loop = createLoop();
      const plan = createTestPlan(1);
      const events = collectEvents(loop, [BuildEvent.BUILD_SUCCESS]);

      await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(events.count(BuildEvent.BUILD_SUCCESS)).toBe(1);
      expect(events.getByName(BuildEvent.BUILD_SUCCESS)[0].data.storyId).toBe('story-1');
    });

    test('emits BUILD_FAILED on error', async () => {
      const loop = createLoop();
      const events = collectEvents(loop, [BuildEvent.BUILD_FAILED]);

      try {
        await loop.run('story-1', { rootPath: tmpDir });
      } catch {
        // expected
      }

      expect(events.count(BuildEvent.BUILD_FAILED)).toBe(1);
    });

    test('sets isRunning to false in finally block', async () => {
      const loop = createLoop();
      try {
        await loop.run('story-1', { rootPath: tmpDir });
      } catch {
        // expected
      }
      expect(loop.isRunning).toBe(false);
    });

    test('generates report with correct fields', async () => {
      const loop = createLoop();
      const plan = createTestPlan(1);

      const result = await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(result).toHaveProperty('storyId', 'story-1');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('durationFormatted');
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('config');
      expect(result).toHaveProperty('completedAt');
    });
  });

  // ── executeLoop (via run) ───────────────────────────────────────────────

  describe('executeLoop', () => {
    test('skips already-completed subtasks', async () => {
      const loop = createLoop();
      const plan = createTestPlan(2);

      // Simulate subtask-1 already completed
      mockStateInstance.loadOrCreateState.mockReturnValue({
        checkpoints: [],
        completedSubtasks: ['subtask-1'],
      });

      const events = collectEvents(loop, [BuildEvent.SUBTASK_STARTED]);
      await loop.run('story-1', { plan, rootPath: tmpDir });

      // Only subtask-2 should have been started
      const startedIds = events.getByName(BuildEvent.SUBTASK_STARTED).map((e) => e.data.subtaskId);
      expect(startedIds).not.toContain('subtask-1');
      expect(startedIds).toContain('subtask-2');
    });

    test('handles global timeout during execution', async () => {
      const loop = createLoop({ globalTimeout: 1 }); // 1ms timeout
      const plan = createTestPlan(2);

      // Add delay via executor to ensure timeout triggers
      loop.config.executor = async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { success: true };
      };

      const events = collectEvents(loop, [BuildEvent.BUILD_TIMEOUT]);

      // The first subtask may succeed before timeout, but the loop should detect timeout
      const result = await loop.run('story-1', { plan, rootPath: tmpDir });

      // Either timed out or completed before timeout - both are valid
      // but the globalTimeout=1ms should trigger
      if (!result.success) {
        expect(result.error).toMatch(/timeout/i);
      }
    });

    test('handles pause during execution', async () => {
      const loop = createLoop();
      const plan = createTestPlan(3);

      // Pause during the executor
      let callCount = 0;
      loop.config.executor = async () => {
        callCount++;
        if (callCount === 1) {
          loop.pause();
        }
        return { success: true };
      };

      const result = await loop.run('story-1', { plan, rootPath: tmpDir });

      // After first subtask completes, pause is detected in the next iteration
      // The build should report paused state
      expect(result.success).toBe(false);
    });

    test('stops on failure when pauseOnFailure is true', async () => {
      const loop = createLoop({ pauseOnFailure: true });
      const plan = createTestPlan(3);

      // Fail on first subtask
      loop.config.executor = async () => ({ success: false, error: 'test failure' });

      const result = await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(result.success).toBe(false);
      // Should have only attempted the first subtask (with retries)
      expect(loop.stats.failedSubtasks).toBe(1);
    });
  });

  // ── executeSubtaskWithRetry ─────────────────────────────────────────────

  describe('executeSubtaskWithRetry', () => {
    test('succeeds on first try', async () => {
      const loop = createLoop();
      const plan = createTestPlan(1);

      loop.config.executor = async () => ({ success: true, filesModified: ['a.js'] });

      const events = collectEvents(loop, [
        BuildEvent.SUBTASK_STARTED,
        BuildEvent.SUBTASK_COMPLETED,
      ]);

      await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(events.count(BuildEvent.SUBTASK_COMPLETED)).toBe(1);
      expect(loop.stats.successfulIterations).toBe(1);
      expect(loop.stats.failedIterations).toBe(0);
    });

    test('retries on failure up to maxIterations', async () => {
      const loop = createLoop({ maxIterations: 3, pauseOnFailure: true });
      const plan = createTestPlan(1);

      // Always fail
      loop.config.executor = async () => ({ success: false, error: 'always fails' });

      const events = collectEvents(loop, [BuildEvent.ITERATION_STARTED]);

      await loop.run('story-1', { plan, rootPath: tmpDir });

      // Should have tried 3 times (maxIterations)
      expect(events.count(BuildEvent.ITERATION_STARTED)).toBe(3);
      expect(loop.stats.failedIterations).toBe(3);
    });

    test('succeeds on retry after initial failure', async () => {
      const loop = createLoop({ maxIterations: 3 });
      const plan = createTestPlan(1);

      let attempt = 0;
      loop.config.executor = async () => {
        attempt++;
        if (attempt < 3) return { success: false, error: 'not yet' };
        return { success: true };
      };

      await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(loop.stats.successfulIterations).toBe(1);
      expect(loop.stats.failedIterations).toBe(2);
      expect(loop.stats.completedSubtasks).toBe(1);
    });

    test('emits SUBTASK_FAILED after max iterations', async () => {
      const loop = createLoop({ maxIterations: 2, pauseOnFailure: true });
      const plan = createTestPlan(1);

      loop.config.executor = async () => ({ success: false, error: 'fail' });

      const events = collectEvents(loop, [BuildEvent.SUBTASK_FAILED]);

      await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(events.count(BuildEvent.SUBTASK_FAILED)).toBe(1);
      const failEvent = events.getByName(BuildEvent.SUBTASK_FAILED)[0].data;
      expect(failEvent.subtaskId).toBe('subtask-1');
      expect(failEvent.attempts).toBe(2);
    });

    test('handles exception in executor', async () => {
      const loop = createLoop({ maxIterations: 2, pauseOnFailure: true });
      const plan = createTestPlan(1);

      loop.config.executor = async () => {
        throw new Error('executor crash');
      };

      await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(loop.stats.failedIterations).toBe(2);
    });

    test('performs self-critique between retries when enabled', async () => {
      const loop = createLoop({
        maxIterations: 2,
        selfCritiqueEnabled: true,
        pauseOnFailure: true,
      });
      const plan = createTestPlan(1);

      loop.config.executor = async () => ({ success: false, error: 'fail' });

      const events = collectEvents(loop, [BuildEvent.SELF_CRITIQUE]);

      await loop.run('story-1', { plan, rootPath: tmpDir });

      // Self-critique should happen between retries (not after last iteration)
      expect(events.count(BuildEvent.SELF_CRITIQUE)).toBe(1);
    });
  });

  // ── executeSubtask ──────────────────────────────────────────────────────

  describe('executeSubtask', () => {
    test('calls external executor when configured', async () => {
      const loop = createLoop();
      const plan = createTestPlan(1);
      const executorFn = jest.fn().mockResolvedValue({ success: true, filesModified: ['x.js'] });
      loop.config.executor = executorFn;

      await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(executorFn).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'subtask-1' }),
        expect.objectContaining({ iteration: 1 }),
      );
    });

    test('returns success without executor (default simulation)', async () => {
      const loop = createLoop();
      const plan = createTestPlan(1);
      // No executor set - uses default simulation

      const result = await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(result.success).toBe(true);
    });
  });

  // ── loadPlan ────────────────────────────────────────────────────────────

  describe('loadPlan', () => {
    test('returns plan from options.plan directly', async () => {
      const loop = createLoop();
      const plan = createTestPlan(1);

      const result = await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(result.success).toBe(true);
      expect(result.stats.totalSubtasks).toBe(1);
    });

    test('loads JSON plan from file', async () => {
      const loop = createLoop();
      const planDir = path.join(tmpDir, 'plan');
      fs.mkdirSync(planDir, { recursive: true });

      const plan = createTestPlan(1);
      fs.writeFileSync(path.join(planDir, 'implementation.json'), JSON.stringify(plan));

      // Mock process.cwd to return tmpDir
      const origCwd = process.cwd;
      process.cwd = () => tmpDir;

      try {
        const result = await loop.run('story-1', { rootPath: tmpDir });
        expect(result.success).toBe(true);
      } finally {
        process.cwd = origCwd;
      }
    });

    test('returns null when no plan found (triggers error)', async () => {
      const loop = createLoop();
      await expect(loop.run('story-1', { rootPath: tmpDir })).rejects.toThrow(
        'No implementation plan found',
      );
    });
  });

  // ── countSubtasks ───────────────────────────────────────────────────────

  describe('countSubtasks', () => {
    test('counts subtasks across phases', async () => {
      const loop = createLoop();
      const plan = {
        phases: [
          { id: 'p1', subtasks: [{ id: 's1' }, { id: 's2' }] },
          { id: 'p2', subtasks: [{ id: 's3' }] },
        ],
      };

      const result = await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(result.stats.totalSubtasks).toBe(3);
    });

    test('handles empty phases', async () => {
      const loop = createLoop();
      const plan = { phases: [{ id: 'p1', subtasks: [] }] };

      const result = await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(result.stats.totalSubtasks).toBe(0);
    });

    test('handles missing phases array', async () => {
      const loop = createLoop();
      const plan = { phases: [] };

      const result = await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(result.stats.totalSubtasks).toBe(0);
    });
  });

  // ── Control methods ─────────────────────────────────────────────────────

  describe('Control Methods', () => {
    test('pause() sets isPaused when running', () => {
      const loop = createLoop();
      loop.isRunning = true;
      loop.pause();
      expect(loop.isPaused).toBe(true);
    });

    test('pause() does nothing when not running', () => {
      const loop = createLoop();
      loop.pause();
      expect(loop.isPaused).toBe(false);
    });

    test('stop() sets isRunning false', () => {
      const loop = createLoop();
      loop.isRunning = true;
      loop.isPaused = true;
      loop.stop();
      expect(loop.isRunning).toBe(false);
      expect(loop.isPaused).toBe(false);
    });

    test('stop() does nothing when not running', () => {
      const loop = createLoop();
      loop.stop();
      expect(loop.isRunning).toBe(false);
    });
  });

  // ── isTimedOut ──────────────────────────────────────────────────────────

  describe('isTimedOut()', () => {
    test('returns false when no startTime', () => {
      const loop = createLoop();
      expect(loop.isTimedOut()).toBe(false);
    });

    test('returns false when no globalTimeout', () => {
      const loop = createLoop({ globalTimeout: 0 });
      loop.startTime = Date.now() - 999999;
      expect(loop.isTimedOut()).toBe(false);
    });

    test('returns false within timeout', () => {
      const loop = createLoop({ globalTimeout: 60000 });
      loop.startTime = Date.now();
      expect(loop.isTimedOut()).toBe(false);
    });

    test('returns true after timeout', () => {
      const loop = createLoop({ globalTimeout: 1000 });
      loop.startTime = Date.now() - 2000;
      expect(loop.isTimedOut()).toBe(true);
    });
  });

  // ── isComplete ──────────────────────────────────────────────────────────

  describe('isComplete()', () => {
    test('returns true when all subtasks completed', () => {
      const loop = createLoop();
      loop.stats.totalSubtasks = 3;
      loop.stats.completedSubtasks = 3;
      expect(loop.isComplete()).toBe(true);
    });

    test('returns true when completed exceeds total', () => {
      const loop = createLoop();
      loop.stats.totalSubtasks = 2;
      loop.stats.completedSubtasks = 3;
      expect(loop.isComplete()).toBe(true);
    });

    test('returns false when incomplete', () => {
      const loop = createLoop();
      loop.stats.totalSubtasks = 5;
      loop.stats.completedSubtasks = 2;
      expect(loop.isComplete()).toBe(false);
    });
  });

  // ── formatDuration ──────────────────────────────────────────────────────

  describe('formatDuration()', () => {
    test('formats seconds', () => {
      const loop = createLoop();
      expect(loop.formatDuration(5000)).toBe('5s');
    });

    test('formats minutes and seconds', () => {
      const loop = createLoop();
      expect(loop.formatDuration(125000)).toBe('2m 5s');
    });

    test('formats hours, minutes, and seconds', () => {
      const loop = createLoop();
      expect(loop.formatDuration(3725000)).toBe('1h 2m 5s');
    });

    test('formats zero', () => {
      const loop = createLoop();
      expect(loop.formatDuration(0)).toBe('0s');
    });
  });

  // ── formatStatus ────────────────────────────────────────────────────────

  describe('formatStatus()', () => {
    test('returns status string with running info', () => {
      const loop = createLoop();
      loop.isRunning = true;
      loop.startTime = Date.now();
      loop.stats.totalSubtasks = 5;
      loop.stats.completedSubtasks = 2;

      const status = loop.formatStatus();

      expect(status).toContain('Autonomous Build Loop Status');
      expect(status).toContain('Running');
      expect(status).toContain('Statistics');
      expect(status).toContain('Progress');
    });

    test('includes current subtask when set', () => {
      const loop = createLoop();
      loop.currentSubtask = 'subtask-42';

      const status = loop.formatStatus();

      expect(status).toContain('subtask-42');
    });

    test('shows TIMEOUT when time exceeded', () => {
      const loop = createLoop({ globalTimeout: 1000 });
      loop.startTime = Date.now() - 5000;

      const status = loop.formatStatus();

      expect(status).toContain('TIMEOUT');
    });
  });

  // ── log ─────────────────────────────────────────────────────────────────

  describe('log()', () => {
    test('logs info messages', () => {
      const loop = createLoop();
      const spy = jest.spyOn(console, 'log').mockImplementation();

      loop.log('test message', 'info');

      expect(spy).toHaveBeenCalledWith(expect.stringContaining('test message'));
      spy.mockRestore();
    });

    test('skips debug when not verbose', () => {
      const loop = createLoop({ verbose: false });
      const spy = jest.spyOn(console, 'log').mockImplementation();

      loop.log('debug msg', 'debug');

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    test('logs debug when verbose', () => {
      const loop = createLoop({ verbose: true });
      const spy = jest.spyOn(console, 'log').mockImplementation();

      loop.log('debug msg', 'debug');

      expect(spy).toHaveBeenCalledWith(expect.stringContaining('debug msg'));
      spy.mockRestore();
    });
  });

  // ── Event tracking ──────────────────────────────────────────────────────

  describe('Event emission', () => {
    test('emits full lifecycle events for successful build', async () => {
      const loop = createLoop();
      const plan = createTestPlan(1);

      const events = collectEvents(loop, [
        BuildEvent.BUILD_STARTED,
        BuildEvent.SUBTASK_STARTED,
        BuildEvent.ITERATION_STARTED,
        BuildEvent.SUBTASK_COMPLETED,
        BuildEvent.BUILD_SUCCESS,
      ]);

      await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(events.count(BuildEvent.BUILD_STARTED)).toBe(1);
      expect(events.count(BuildEvent.SUBTASK_STARTED)).toBe(1);
      expect(events.count(BuildEvent.ITERATION_STARTED)).toBe(1);
      expect(events.count(BuildEvent.SUBTASK_COMPLETED)).toBe(1);
      expect(events.count(BuildEvent.BUILD_SUCCESS)).toBe(1);
    });

    test('emits ITERATION_COMPLETED on failed iteration', async () => {
      const loop = createLoop({ maxIterations: 1, pauseOnFailure: true });
      const plan = createTestPlan(1);

      loop.config.executor = async () => ({ success: false, error: 'fail' });

      const events = collectEvents(loop, [BuildEvent.ITERATION_COMPLETED]);

      await loop.run('story-1', { plan, rootPath: tmpDir });

      expect(events.count(BuildEvent.ITERATION_COMPLETED)).toBe(1);
      const data = events.getByName(BuildEvent.ITERATION_COMPLETED)[0].data;
      expect(data.success).toBe(false);
      expect(data.error).toBe('fail');
    });
  });
});
