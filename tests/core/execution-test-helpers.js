/**
 * Execution System - Shared Test Helpers
 * Story EXC-1 - Test Coverage for .aios-core/core/execution/
 *
 * Mock factories and utilities shared across all 9 execution test files.
 * Follows patterns from build-state-manager.test.js.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// ═══════════════════════════════════════════════════════════════════════════════
//                           TEMP DIRECTORY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a unique temp directory for test isolation.
 * @param {string} prefix - Directory prefix
 * @returns {string} - Absolute path to temp directory
 */
function createTempDir(prefix = 'exec-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/**
 * Remove a temp directory and all contents.
 * @param {string} dirPath - Directory to remove
 */
function cleanupTempDir(dirPath) {
  if (dirPath && fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                           CHILD_PROCESS MOCK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a mock child_process.spawn that simulates stdout/stderr/exit.
 * @param {string} stdout - Simulated stdout data
 * @param {string} stderr - Simulated stderr data
 * @param {number} exitCode - Simulated exit code (0 = success)
 * @returns {Object} - Mock spawn function and helpers
 */
function mockChildProcess(stdout = '', stderr = '', exitCode = 0) {
  const EventEmitter = require('events');

  const mockProcess = new EventEmitter();
  mockProcess.stdout = new EventEmitter();
  mockProcess.stderr = new EventEmitter();
  mockProcess.pid = Math.floor(Math.random() * 10000) + 1000;
  mockProcess.kill = jest.fn();

  const spawnFn = jest.fn().mockReturnValue(mockProcess);

  // Schedule data emission after spawn is called
  const emitData = () => {
    process.nextTick(() => {
      if (stdout) {
        mockProcess.stdout.emit('data', Buffer.from(stdout));
      }
      if (stderr) {
        mockProcess.stderr.emit('data', Buffer.from(stderr));
      }
      process.nextTick(() => {
        mockProcess.emit('close', exitCode);
      });
    });
  };

  return {
    spawn: spawnFn,
    process: mockProcess,
    emitData,
    /**
     * Configure spawn to emit data automatically on next call.
     */
    autoEmit() {
      spawnFn.mockImplementation(() => {
        emitData();
        return mockProcess;
      });
      return this;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//                           TASK MOCK FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a mock task object for wave/build testing.
 * @param {Object} overrides - Fields to override
 * @returns {Object} - Mock task
 */
function createMockTask(overrides = {}) {
  const id = overrides.id || `task-${Math.floor(Math.random() * 1000)}`;
  return {
    id,
    description: `Test task ${id}`,
    agent: 'dev',
    critical: false,
    dependencies: [],
    subtasks: [],
    ...overrides,
  };
}

/**
 * Create an array of mock tasks.
 * @param {number} count - Number of tasks to create
 * @param {Object} overrides - Shared overrides for all tasks
 * @returns {Array} - Array of mock tasks
 */
function createMockTasks(count, overrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    createMockTask({ id: `task-${i + 1}`, ...overrides }),
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//                           WAVE RESULTS MOCK FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create mock wave results for aggregation testing.
 * @param {number} taskCount - Number of task results
 * @param {number} successRate - Success rate (0-1)
 * @returns {Array} - Array of mock task results
 */
function createMockWaveResults(taskCount = 3, successRate = 1.0) {
  const results = [];
  for (let i = 0; i < taskCount; i++) {
    const success = Math.random() < successRate;
    results.push({
      taskId: `task-${i + 1}`,
      success,
      critical: false,
      duration: Math.floor(Math.random() * 5000) + 100,
      result: success
        ? { success: true, output: `Output for task-${i + 1}` }
        : undefined,
      error: success ? undefined : 'Simulated task failure',
    });
  }
  return results;
}

/**
 * Create deterministic wave results (no randomness).
 * @param {Array<boolean>} outcomes - Array of success/failure booleans
 * @returns {Array} - Array of mock task results
 */
function createDeterministicWaveResults(outcomes) {
  return outcomes.map((success, i) => ({
    taskId: `task-${i + 1}`,
    success,
    critical: false,
    duration: (i + 1) * 1000,
    result: success
      ? { success: true, output: `Output for task-${i + 1}` }
      : undefined,
    error: success ? undefined : `Task task-${i + 1} failed`,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
//                           MEMORY DEPENDENCY MOCKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a mock MemoryQuery instance.
 * @param {Object} overrides - Method overrides
 * @returns {Object} - Mock MemoryQuery
 */
function createMockMemoryQuery(overrides = {}) {
  return {
    query: jest.fn().mockResolvedValue([]),
    getRelevantContext: jest.fn().mockResolvedValue(''),
    search: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

/**
 * Create a mock GotchasMemory instance.
 * @param {Object} overrides - Method overrides
 * @returns {Object} - Mock GotchasMemory
 */
function createMockGotchasMemory(overrides = {}) {
  return {
    getRelevantGotchas: jest.fn().mockResolvedValue([]),
    addGotcha: jest.fn().mockResolvedValue(true),
    getAll: jest.fn().mockReturnValue([]),
    search: jest.fn().mockReturnValue([]),
    ...overrides,
  };
}

/**
 * Create a mock SessionMemory instance.
 * @param {Object} overrides - Method overrides
 * @returns {Object} - Mock SessionMemory
 */
function createMockSessionMemory(overrides = {}) {
  return {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    getAll: jest.fn().mockReturnValue({}),
    clear: jest.fn(),
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//                           BUILD STATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a mock plan object for AutonomousBuildLoop.
 * @param {Object} overrides - Fields to override
 * @returns {Object} - Mock plan
 */
function createMockPlan(overrides = {}) {
  return {
    storyId: 'test-story-1',
    tasks: [
      {
        id: 'task-1',
        subtasks: [
          { id: '1.1', description: 'Subtask 1.1' },
          { id: '1.2', description: 'Subtask 1.2' },
        ],
      },
      {
        id: 'task-2',
        subtasks: [
          { id: '2.1', description: 'Subtask 2.1' },
        ],
      },
    ],
    ...overrides,
  };
}

/**
 * Create a mock BuildStateManager.
 * @param {Object} overrides - Method overrides
 * @returns {Object} - Mock BuildStateManager
 */
function createMockBuildStateManager(overrides = {}) {
  const state = {
    storyId: 'test-story-1',
    status: 'pending',
    checkpoints: [],
    completedSubtasks: [],
    currentSubtask: null,
    metrics: { totalSubtasks: 3, completedSubtasks: 0, totalFailures: 0 },
  };

  return {
    createState: jest.fn().mockReturnValue(state),
    loadState: jest.fn().mockReturnValue(state),
    loadOrCreateState: jest.fn().mockReturnValue(state),
    saveState: jest.fn(),
    getState: jest.fn().mockReturnValue(state),
    saveCheckpoint: jest.fn().mockReturnValue({ id: 'cp-1', subtaskId: '1.1' }),
    startSubtask: jest.fn(),
    completeSubtask: jest.fn(),
    completeBuild: jest.fn(),
    failBuild: jest.fn(),
    recordFailure: jest.fn().mockReturnValue({ failure: {}, isStuck: false }),
    getLastCheckpoint: jest.fn().mockReturnValue(null),
    getStatus: jest.fn().mockReturnValue({ exists: true }),
    _state: state,
    ...overrides,
  };
}

/**
 * Create a mock RecoveryTracker.
 * @param {Object} overrides - Method overrides
 * @returns {Object} - Mock RecoveryTracker
 */
function createMockRecoveryTracker(overrides = {}) {
  return {
    trackAttempt: jest.fn(),
    getAttempts: jest.fn().mockReturnValue([]),
    isStuck: jest.fn().mockReturnValue(false),
    reset: jest.fn(),
    ...overrides,
  };
}

/**
 * Create a mock WorktreeManager.
 * @param {Object} overrides - Method overrides
 * @returns {Object} - Mock WorktreeManager
 */
function createMockWorktreeManager(overrides = {}) {
  return {
    create: jest.fn().mockResolvedValue({ path: '/tmp/worktree', branch: 'feat/test' }),
    remove: jest.fn().mockResolvedValue(true),
    list: jest.fn().mockResolvedValue([]),
    getWorktreePath: jest.fn().mockReturnValue('/tmp/worktree'),
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//                           EVENT EMITTER HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Collect all events emitted by an EventEmitter.
 * @param {EventEmitter} emitter - The emitter to monitor
 * @param {Array<string>} eventNames - Event names to listen for
 * @returns {Object} - Object with events array and helper methods
 */
function collectEvents(emitter, eventNames) {
  const events = [];

  for (const name of eventNames) {
    emitter.on(name, (data) => {
      events.push({ name, data, timestamp: Date.now() });
    });
  }

  return {
    events,
    getByName(name) {
      return events.filter((e) => e.name === name);
    },
    count(name) {
      return name ? events.filter((e) => e.name === name).length : events.length;
    },
    clear() {
      events.length = 0;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//                           TASK EXECUTOR HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a mock task executor that resolves/rejects based on config.
 * @param {Object} options - Configuration
 * @param {boolean} options.success - Whether to succeed
 * @param {number} options.delay - Simulated delay in ms
 * @param {string} options.output - Output text
 * @returns {Function} - Async task executor function
 */
function createMockTaskExecutor(options = {}) {
  const { success = true, delay = 0, output = 'mock output' } = options;

  return jest.fn().mockImplementation(async () => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    if (success) {
      return { success: true, output };
    }
    throw new Error(options.error || 'Mock task execution failed');
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//                           EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Temp directory
  createTempDir,
  cleanupTempDir,

  // Child process
  mockChildProcess,

  // Task factories
  createMockTask,
  createMockTasks,
  createMockTaskExecutor,

  // Wave results
  createMockWaveResults,
  createDeterministicWaveResults,

  // Memory mocks
  createMockMemoryQuery,
  createMockGotchasMemory,
  createMockSessionMemory,

  // Build system mocks
  createMockPlan,
  createMockBuildStateManager,
  createMockRecoveryTracker,
  createMockWorktreeManager,

  // Event helpers
  collectEvents,
};
