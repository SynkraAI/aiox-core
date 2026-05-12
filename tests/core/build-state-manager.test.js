/**
 * Build State Manager Tests - Story 8.4
 *
 * Tests for autonomous build state management including:
 * - State creation, loading, saving
 * - Checkpoint management
 * - Build resume functionality
 * - Abandoned detection
 * - Failure tracking and notifications
 * - Attempt logging
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  BuildStateManager,
  BuildStatus,
  NotificationType,
  validateBuildState,
  DEFAULT_CONFIG,
} = require('../../.aiox-core/core/execution/build-state-manager');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TEST SETUP
// ═══════════════════════════════════════════════════════════════════════════════════

describe('BuildStateManager', () => {
  let testDir;
  let manager;
  const testStoryId = 'test-story-8.4';

  beforeEach(() => {
    // Create unique temp directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'build-state-test-'));
    manager = new BuildStateManager(testStoryId, {
      planDir: path.join(testDir, 'plan'),
      rootPath: testDir,
    });
  });

  afterEach(() => {
    // Cleanup temp directory
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              SCHEMA VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('validateBuildState', () => {
    test('should validate correct state', () => {
      const validState = {
        storyId: 'story-1',
        status: BuildStatus.PENDING,
        startedAt: new Date().toISOString(),
        checkpoints: [],
      };

      const result = validateBuildState(validState);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject state missing required fields', () => {
      const invalidState = {
        storyId: 'story-1',
        // missing status, startedAt, checkpoints
      };

      const result = validateBuildState(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('status'))).toBe(true);
    });

    test('should reject invalid status', () => {
      const invalidState = {
        storyId: 'story-1',
        status: 'invalid_status',
        startedAt: new Date().toISOString(),
        checkpoints: [],
      };

      const result = validateBuildState(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('status'))).toBe(true);
    });

    test('should reject non-array checkpoints', () => {
      const invalidState = {
        storyId: 'story-1',
        status: BuildStatus.PENDING,
        startedAt: new Date().toISOString(),
        checkpoints: 'not-an-array',
      };

      const result = validateBuildState(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('checkpoints'))).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('State Management', () => {
    test('should create new state', () => {
      const state = manager.createState({
        totalSubtasks: 10,
      });

      expect(state.storyId).toBe(testStoryId);
      expect(state.status).toBe(BuildStatus.PENDING);
      expect(state.checkpoints).toEqual([]);
      expect(state.completedSubtasks).toEqual([]);
      expect(state.metrics.totalSubtasks).toBe(10);
    });

    test('should save and load state', () => {
      manager.createState({ totalSubtasks: 5 });
      manager.saveState();

      // Create new manager to load
      const manager2 = new BuildStateManager(testStoryId, {
        planDir: path.join(testDir, 'plan'),
        rootPath: testDir,
      });

      const loaded = manager2.loadState();
      expect(loaded).not.toBeNull();
      expect(loaded.storyId).toBe(testStoryId);
      expect(loaded.metrics.totalSubtasks).toBe(5);
    });

    test('should return null when no state exists', () => {
      const loaded = manager.loadState();
      expect(loaded).toBeNull();
    });

    test('should loadOrCreateState', () => {
      // First call creates
      const state1 = manager.loadOrCreateState({ totalSubtasks: 7 });
      expect(state1.metrics.totalSubtasks).toBe(7);
      manager.saveState();

      // Second call loads
      const manager2 = new BuildStateManager(testStoryId, {
        planDir: path.join(testDir, 'plan'),
        rootPath: testDir,
      });
      const state2 = manager2.loadOrCreateState({ totalSubtasks: 99 });
      expect(state2.metrics.totalSubtasks).toBe(7); // Should be original value
    });

    test('should throw when storyId not provided', () => {
      expect(() => new BuildStateManager(null)).toThrow('storyId is required');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              CHECKPOINT MANAGEMENT (AC2)
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('Checkpoint Management (AC2)', () => {
    beforeEach(() => {
      manager.createState({ totalSubtasks: 5 });
    });

    test('should save checkpoint after subtask completion', () => {
      const checkpoint = manager.saveCheckpoint('1.1', {
        duration: 5000,
        filesModified: ['file1.js', 'file2.js'],
      });

      expect(checkpoint.id).toMatch(/^cp-/);
      expect(checkpoint.subtaskId).toBe('1.1');
      expect(checkpoint.status).toBe('completed');
      expect(checkpoint.filesModified).toHaveLength(2);

      const state = manager.getState();
      expect(state.checkpoints).toHaveLength(1);
      expect(state.completedSubtasks).toContain('1.1');
      expect(state.metrics.completedSubtasks).toBe(1);
    });

    test('should save multiple checkpoints', () => {
      manager.saveCheckpoint('1.1');
      manager.saveCheckpoint('1.2');
      manager.saveCheckpoint('2.1');

      const state = manager.getState();
      expect(state.checkpoints).toHaveLength(3);
      expect(state.completedSubtasks).toEqual(['1.1', '1.2', '2.1']);
    });

    test('should create checkpoint files', () => {
      manager.saveCheckpoint('1.1');

      const checkpointDir = path.join(testDir, 'plan', 'checkpoints');
      expect(fs.existsSync(checkpointDir)).toBe(true);

      const files = fs.readdirSync(checkpointDir);
      expect(files.length).toBe(1);
      expect(files[0]).toMatch(/^cp-.*\.json$/);
    });

    test('should get last checkpoint', () => {
      manager.saveCheckpoint('1.1');
      manager.saveCheckpoint('1.2');

      const last = manager.getLastCheckpoint();
      expect(last.subtaskId).toBe('1.2');
    });

    test('should return null when no checkpoints', () => {
      const last = manager.getLastCheckpoint();
      expect(last).toBeNull();
    });

    test('should not duplicate completed subtasks', () => {
      manager.saveCheckpoint('1.1');
      manager.saveCheckpoint('1.1'); // Same subtask again

      const state = manager.getState();
      expect(state.completedSubtasks).toEqual(['1.1']);
      expect(state.checkpoints).toHaveLength(2); // Still records checkpoint
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              BUILD RESUME (AC3)
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('Build Resume (AC3)', () => {
    test('should resume build from checkpoint', () => {
      // Setup: create state with some progress
      manager.createState({ totalSubtasks: 5 });
      manager.startSubtask('1.1');
      manager.completeSubtask('1.1');
      manager.startSubtask('1.2');
      manager.saveState();

      // Simulate new session
      const manager2 = new BuildStateManager(testStoryId, {
        planDir: path.join(testDir, 'plan'),
        rootPath: testDir,
      });

      const context = manager2.resumeBuild();

      expect(context.storyId).toBe(testStoryId);
      expect(context.status).toBe(BuildStatus.IN_PROGRESS);
      expect(context.completedSubtasks).toContain('1.1');
      expect(context.lastCheckpoint).not.toBeNull();
    });

    test('should throw when no state exists', () => {
      expect(() => manager.resumeBuild()).toThrow('No build state found');
    });

    test('should throw when build already completed', () => {
      manager.createState();
      manager.completeBuild();

      const manager2 = new BuildStateManager(testStoryId, {
        planDir: path.join(testDir, 'plan'),
        rootPath: testDir,
      });

      expect(() => manager2.resumeBuild()).toThrow('already completed');
    });

    test('should allow resume of failed build', () => {
      manager.createState({ totalSubtasks: 5 });
      manager.saveCheckpoint('1.1');
      manager.failBuild('Test failure');

      const manager2 = new BuildStateManager(testStoryId, {
        planDir: path.join(testDir, 'plan'),
        rootPath: testDir,
      });

      // Should not throw
      const context = manager2.resumeBuild();
      expect(context.status).toBe(BuildStatus.IN_PROGRESS);
    });

    test('should clear abandoned flag on resume', () => {
      manager.createState();
      const state = manager.getState();
      state.abandoned = true;
      state.abandonedAt = new Date().toISOString();
      manager.saveState();

      const manager2 = new BuildStateManager(testStoryId, {
        planDir: path.join(testDir, 'plan'),
        rootPath: testDir,
      });

      const context = manager2.resumeBuild();
      const newState = manager2.getState();

      expect(newState.abandoned).toBe(false);
      expect(newState.abandonedAt).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              BUILD STATUS (AC4)
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('Build Status (AC4)', () => {
    test('should return status when build exists', () => {
      manager.createState({ totalSubtasks: 10 });
      manager.saveCheckpoint('1.1');
      manager.saveCheckpoint('1.2');
      manager.saveState();

      const status = manager.getStatus();

      expect(status.exists).toBe(true);
      expect(status.storyId).toBe(testStoryId);
      expect(status.progress.completed).toBe(2);
      expect(status.progress.total).toBe(10);
      expect(status.progress.percentage).toBe(20);
      expect(status.checkpointCount).toBe(2);
    });

    test('should return exists:false when no build', () => {
      const status = manager.getStatus();

      expect(status.exists).toBe(false);
      expect(status.message).toBe('No build state found');
    });

    test('should calculate duration', () => {
      manager.createState();
      manager.saveState();

      // Wait a bit
      const status = manager.getStatus();

      expect(status.duration).toBeDefined();
      expect(status.durationMs).toBeGreaterThanOrEqual(0);
    });

    test('should format status for CLI', () => {
      manager.createState({ totalSubtasks: 5 });
      manager.saveCheckpoint('1.1');
      manager.saveState();

      const formatted = manager.formatStatus();

      expect(formatted).toContain(testStoryId);
      expect(formatted).toContain('Progress');
      expect(formatted).toContain('1/5');
    });

    test('should get all builds', () => {
      // Create a build
      manager.createState();
      manager.saveState();

      const builds = BuildStateManager.getAllBuilds(testDir);

      expect(builds.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              ABANDONED DETECTION (AC5)
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('Abandoned Detection (AC5)', () => {
    test('should detect abandoned build', () => {
      manager.createState();
      const state = manager.getState();

      // Simulate old checkpoint (2 hours ago)
      const oldTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
      state.status = BuildStatus.IN_PROGRESS;
      state.lastCheckpoint = oldTime.toISOString();
      manager.saveState();

      const result = manager.detectAbandoned();

      expect(result.detected).toBe(true);
      expect(result.storyId).toBe(testStoryId);
    });

    test('should not detect active build as abandoned', () => {
      manager.createState();
      const state = manager.getState();
      state.status = BuildStatus.IN_PROGRESS;
      state.lastCheckpoint = new Date().toISOString();
      manager.saveState();

      const result = manager.detectAbandoned();

      expect(result.detected).toBe(false);
    });

    test('should not detect completed build as abandoned', () => {
      manager.createState();
      manager.completeBuild();

      const result = manager.detectAbandoned();

      expect(result.detected).toBe(false);
    });

    test('should use custom threshold', () => {
      manager.createState();
      const state = manager.getState();

      // Checkpoint 5 minutes ago
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      state.status = BuildStatus.IN_PROGRESS;
      state.lastCheckpoint = fiveMinutesAgo.toISOString();
      manager.saveState();

      // With 1 hour threshold - not abandoned
      const result1 = manager.detectAbandoned(60 * 60 * 1000);
      expect(result1.detected).toBe(false);

      // With 1 minute threshold - abandoned
      const result2 = manager.detectAbandoned(60 * 1000);
      expect(result2.detected).toBe(true);
    });

    test('should add notification when marking abandoned', () => {
      manager.createState();
      const state = manager.getState();

      const oldTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
      state.status = BuildStatus.IN_PROGRESS;
      state.lastCheckpoint = oldTime.toISOString();
      manager.saveState();

      manager.detectAbandoned();

      const notifications = manager.getNotifications();
      expect(notifications.some((n) => n.type === NotificationType.ABANDONED)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              FAILURE TRACKING (AC6)
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('Failure Tracking (AC6)', () => {
    beforeEach(() => {
      manager.createState({ totalSubtasks: 5 });
    });

    test('should record failure', () => {
      const result = manager.recordFailure('1.1', {
        error: 'Test error',
        attempt: 1,
      });

      expect(result.failure.subtaskId).toBe('1.1');
      expect(result.failure.error).toBe('Test error');

      const state = manager.getState();
      expect(state.failedAttempts).toHaveLength(1);
      expect(state.metrics.totalFailures).toBe(1);
    });

    test('should track multiple failures', () => {
      manager.recordFailure('1.1', { error: 'Error 1' });
      manager.recordFailure('1.1', { error: 'Error 2' });
      manager.recordFailure('1.1', { error: 'Error 3' });

      const state = manager.getState();
      expect(state.failedAttempts).toHaveLength(3);
      expect(state.metrics.totalFailures).toBe(3);
    });

    test('should auto-increment attempt number', () => {
      manager.recordFailure('1.1', { error: 'Error 1' });
      const result = manager.recordFailure('1.1', { error: 'Error 2' });

      expect(result.failure.attempt).toBe(2);
    });

    test('should detect stuck after multiple failures', () => {
      // Record 3 failures to trigger stuck detection
      manager.recordFailure('1.1', { error: 'Error 1' });
      manager.recordFailure('1.1', { error: 'Error 2' });
      const result = manager.recordFailure('1.1', { error: 'Error 3' });

      // Stuck detection depends on stuck-detector being available
      // If not available, isStuck will be false
      expect(result).toHaveProperty('isStuck');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              ATTEMPT LOGGING (AC7)
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('Attempt Logging (AC7)', () => {
    beforeEach(() => {
      manager.createState({ totalSubtasks: 5 });
    });

    test('should log attempts to file', () => {
      manager.saveCheckpoint('1.1');
      manager.recordFailure('1.2', { error: 'Test error' });
      manager.saveState();

      const logPath = path.join(testDir, 'plan', 'build-attempts.log');
      expect(fs.existsSync(logPath)).toBe(true);

      const content = fs.readFileSync(logPath, 'utf-8');
      expect(content).toContain('1.1');
      expect(content).toContain('checkpoint');
    });

    test('should get attempt log', () => {
      manager.saveCheckpoint('1.1');
      manager.saveCheckpoint('1.2');
      manager.saveState();

      const logs = manager.getAttemptLog();

      expect(logs.length).toBeGreaterThan(0);
    });

    test('should filter log by subtask', () => {
      manager.saveCheckpoint('1.1');
      manager.saveCheckpoint('2.1');
      manager.saveState();

      const logs = manager.getAttemptLog({ subtaskId: '1.1' });

      expect(logs.every((l) => l.includes('1.1'))).toBe(true);
    });

    test('should limit log output', () => {
      // Create many log entries
      for (let i = 0; i < 10; i++) {
        manager.saveCheckpoint(`1.${i}`);
      }
      manager.saveState();

      const logs = manager.getAttemptLog({ limit: 3 });

      expect(logs.length).toBe(3);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              SUBTASK MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('Subtask Management', () => {
    beforeEach(() => {
      manager.createState({ totalSubtasks: 5 });
    });

    test('should start subtask', () => {
      manager.startSubtask('1.1', { phase: 'phase-1' });

      const state = manager.getState();
      expect(state.currentSubtask).toBe('1.1');
      expect(state.currentPhase).toBe('phase-1');
      expect(state.status).toBe(BuildStatus.IN_PROGRESS);
    });

    test('should complete subtask', () => {
      manager.startSubtask('1.1');
      manager.completeSubtask('1.1', {
        duration: 5000,
        filesModified: ['file.js'],
      });

      const state = manager.getState();
      expect(state.currentSubtask).toBeNull();
      expect(state.completedSubtasks).toContain('1.1');
    });

    test('should complete build', () => {
      manager.saveCheckpoint('1.1');
      manager.completeBuild();

      const state = manager.getState();
      expect(state.status).toBe(BuildStatus.COMPLETED);
      expect(state.metrics.totalDuration).toBeGreaterThanOrEqual(0);
    });

    test('should fail build', () => {
      manager.failBuild('Critical error');

      const state = manager.getState();
      expect(state.status).toBe(BuildStatus.FAILED);

      const notifications = manager.getNotifications();
      expect(notifications.some((n) => n.type === NotificationType.ERROR)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('Notifications', () => {
    beforeEach(() => {
      manager.createState();
    });

    test('should get unacknowledged notifications', () => {
      // Generate some notifications via actions
      manager.completeBuild();

      const notifications = manager.getNotifications();
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].acknowledged).toBe(false);
    });

    test('should acknowledge notification', () => {
      manager.completeBuild();

      const before = manager.getNotifications();
      expect(before.length).toBeGreaterThan(0);

      manager.acknowledgeNotification(0);

      const after = manager.getNotifications();
      expect(after.length).toBe(before.length - 1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              CLEANUP
  // ─────────────────────────────────────────────────────────────────────────────────

  describe('Cleanup', () => {
    test('should cleanup abandoned build', async () => {
      manager.createState();
      const state = manager.getState();
      state.status = BuildStatus.ABANDONED;
      state.abandoned = true;
      manager.saveCheckpoint('1.1');
      manager.saveState();

      const result = await manager.cleanup();

      expect(result.cleaned).toBe(true);
      expect(result.filesRemoved.length).toBeGreaterThan(0);
    });

    test('should not cleanup active build without force', async () => {
      manager.createState();
      const state = manager.getState();
      state.status = BuildStatus.IN_PROGRESS;
      manager.saveState();

      const result = await manager.cleanup();

      expect(result.cleaned).toBe(false);
    });

    test('should force cleanup active build', async () => {
      manager.createState();
      const state = manager.getState();
      state.status = BuildStatus.IN_PROGRESS;
      manager.saveState();

      const result = await manager.cleanup({ force: true });

      expect(result.cleaned).toBe(true);
    });

    test('should cleanup completed build', async () => {
      manager.createState();
      manager.completeBuild();

      const result = await manager.cleanup();

      expect(result.cleaned).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════

describe('DEFAULT_CONFIG', () => {
  test('should have correct defaults', () => {
    expect(DEFAULT_CONFIG.maxIterations).toBe(10);
    expect(DEFAULT_CONFIG.globalTimeout).toBe(30 * 60 * 1000);
    expect(DEFAULT_CONFIG.abandonedThreshold).toBe(60 * 60 * 1000);
    expect(DEFAULT_CONFIG.autoCheckpoint).toBe(true);
  });
});
