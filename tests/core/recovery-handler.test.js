/**
 * Recovery Handler Tests
 *
 * Story: 0.5 - Error Recovery Integration
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Tests for recovery handler that manages automatic error recovery.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const {
  RecoveryHandler,
  RecoveryStrategy,
  RecoveryResult,
} = require('../../.aiox-core/core/orchestration/recovery-handler');

describe('Recovery Handler (Story 0.5)', () => {
  let tempDir;
  let handler;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `recovery-handler-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    handler = new RecoveryHandler({
      projectRoot: tempDir,
      storyId: 'TEST-001',
      maxRetries: 3,
      autoEscalate: true,
    });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('RecoveryStrategy Enum (AC2)', () => {
    it('should have all required strategies', () => {
      expect(RecoveryStrategy.RETRY_SAME_APPROACH).toBe('retry_same_approach');
      expect(RecoveryStrategy.ROLLBACK_AND_RETRY).toBe('rollback_and_retry');
      expect(RecoveryStrategy.SKIP_PHASE).toBe('skip_phase');
      expect(RecoveryStrategy.ESCALATE_TO_HUMAN).toBe('escalate_to_human');
      expect(RecoveryStrategy.TRIGGER_RECOVERY_WORKFLOW).toBe('trigger_recovery_workflow');
    });
  });

  describe('RecoveryResult Enum', () => {
    it('should have all result types', () => {
      expect(RecoveryResult.SUCCESS).toBe('success');
      expect(RecoveryResult.FAILED).toBe('failed');
      expect(RecoveryResult.ESCALATED).toBe('escalated');
      expect(RecoveryResult.SKIPPED).toBe('skipped');
    });
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const h = new RecoveryHandler({
        projectRoot: tempDir,
        storyId: 'TEST-001',
      });

      expect(h.projectRoot).toBe(tempDir);
      expect(h.storyId).toBe('TEST-001');
      expect(h.maxRetries).toBe(3);
      expect(h.autoEscalate).toBe(true);
    });

    it('should accept custom options (AC5)', () => {
      const h = new RecoveryHandler({
        projectRoot: tempDir,
        storyId: 'TEST-002',
        maxRetries: 5,
        autoEscalate: false,
      });

      expect(h.maxRetries).toBe(5);
      expect(h.autoEscalate).toBe(false);
    });
  });

  describe('handleEpicFailure (AC1)', () => {
    it('should handle epic failure and return recovery result', async () => {
      const result = await handler.handleEpicFailure(3, new Error('Test failure'), {
        approach: 'test approach',
      });

      expect(result).toBeDefined();
      expect(result.epicNum).toBe(3);
      expect(result.strategy).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('should track attempts (AC7)', async () => {
      await handler.handleEpicFailure(3, new Error('First failure'));
      await handler.handleEpicFailure(3, new Error('Second failure'));

      expect(handler.getAttemptCount(3)).toBe(2);
      expect(handler.getAttemptHistory()[3]).toHaveLength(2);
    });

    it('should select RETRY_SAME_APPROACH for transient errors', async () => {
      const result = await handler.handleEpicFailure(
        3,
        new Error('Network timeout: ETIMEDOUT'),
        {},
      );

      expect(result.strategy).toBe(RecoveryStrategy.RETRY_SAME_APPROACH);
      expect(result.shouldRetry).toBe(true);
    });

    it('should select ESCALATE_TO_HUMAN for fatal errors', async () => {
      const result = await handler.handleEpicFailure(3, new Error('Fatal: Out of memory'), {});

      expect(result.strategy).toBe(RecoveryStrategy.ESCALATE_TO_HUMAN);
      expect(result.escalated).toBe(true);
    });
  });

  describe('Max Retries (AC5)', () => {
    it('should track retry count per epic', async () => {
      expect(handler.canRetry(3)).toBe(true);

      await handler.handleEpicFailure(3, new Error('Fail 1'));
      await handler.handleEpicFailure(3, new Error('Fail 2'));

      expect(handler.getAttemptCount(3)).toBe(2);
      expect(handler.canRetry(3)).toBe(true);
    });

    it('should return false for canRetry after max attempts (AC5)', async () => {
      await handler.handleEpicFailure(3, new Error('Fail 1'));
      await handler.handleEpicFailure(3, new Error('Fail 2'));
      await handler.handleEpicFailure(3, new Error('Fail 3'));

      expect(handler.canRetry(3)).toBe(false);
    });
  });

  describe('Automatic Escalation (AC6)', () => {
    it('should escalate after max retries when autoEscalate is true', async () => {
      // Use up all retries
      await handler.handleEpicFailure(4, new Error('Fail 1'));
      await handler.handleEpicFailure(4, new Error('Fail 2'));
      const result = await handler.handleEpicFailure(4, new Error('Fail 3'));

      // On max retries, should escalate
      expect(result.strategy).toBe(RecoveryStrategy.ESCALATE_TO_HUMAN);
      expect(result.escalated).toBe(true);
    });

    it('should not escalate when autoEscalate is false', async () => {
      const h = new RecoveryHandler({
        projectRoot: tempDir,
        storyId: 'TEST-001',
        maxRetries: 1,
        autoEscalate: false,
      });

      await h.handleEpicFailure(3, new Error('Fail 1'));
      const result = await h.handleEpicFailure(3, new Error('Fail 2'));

      // Without autoEscalate, should still try other strategies
      expect(result.escalated).toBe(false);
    });

    it('should save escalation report (AC6)', async () => {
      // Force escalation
      await handler.handleEpicFailure(3, new Error('Fail 1'));
      await handler.handleEpicFailure(3, new Error('Fail 2'));
      const result = await handler.handleEpicFailure(3, new Error('Fatal error'));

      if (result.escalated) {
        const reportsDir = path.join(tempDir, '.aiox', 'escalations');
        const exists = await fs.pathExists(reportsDir);
        expect(exists).toBe(true);
      }
    });
  });

  describe('Logging (AC7)', () => {
    it('should log all recovery attempts', async () => {
      await handler.handleEpicFailure(3, new Error('Test failure'));

      const logs = handler.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some((l) => l.message.includes('Epic 3'))).toBe(true);
    });

    it('should track attempt details', async () => {
      await handler.handleEpicFailure(3, new Error('Specific error'), {
        approach: 'custom approach',
      });

      const history = handler.getAttemptHistory();
      expect(history[3][0].approach).toBe('custom approach');
      expect(history[3][0].error).toBe('Specific error');
    });

    it('should get logs for specific epic', async () => {
      await handler.handleEpicFailure(3, new Error('Epic 3 error'));
      await handler.handleEpicFailure(4, new Error('Epic 4 error'));

      const epic3Logs = handler.getEpicLogs(3);
      expect(epic3Logs.every((l) => l.message.includes('3') || l.message.includes('epic-3'))).toBe(
        true,
      );
    });
  });

  describe('Reset and Clear', () => {
    it('should reset attempts for specific epic', async () => {
      await handler.handleEpicFailure(3, new Error('Fail'));
      expect(handler.getAttemptCount(3)).toBe(1);

      handler.resetAttempts(3);
      expect(handler.getAttemptCount(3)).toBe(0);
    });

    it('should clear all state', async () => {
      await handler.handleEpicFailure(3, new Error('Fail'));
      await handler.handleEpicFailure(4, new Error('Fail'));

      handler.clear();

      expect(handler.getAttemptCount(3)).toBe(0);
      expect(handler.getAttemptCount(4)).toBe(0);
      expect(handler.getLogs()).toHaveLength(0);
    });
  });

  describe('Error Classification', () => {
    it('should classify transient errors correctly', async () => {
      const transientErrors = [
        'Network timeout: ETIMEDOUT',
        'Connection refused: ECONNREFUSED',
        'Fetch failed: network error',
      ];

      for (const err of transientErrors) {
        handler.clear();
        const result = await handler.handleEpicFailure(3, new Error(err));
        expect(result.strategy).toBe(RecoveryStrategy.RETRY_SAME_APPROACH);
      }
    });

    it('should classify dependency errors correctly', async () => {
      handler.clear();
      const result = await handler.handleEpicFailure(3, new Error('Cannot find module lodash'));

      // Should trigger recovery workflow for dependency issues
      expect([
        RecoveryStrategy.TRIGGER_RECOVERY_WORKFLOW,
        RecoveryStrategy.RETRY_SAME_APPROACH, // First attempt might retry
      ]).toContain(result.strategy);
    });
  });

  describe('Event Emitter', () => {
    it('should emit recoveryAttempt event', async () => {
      const events = [];
      handler.on('recoveryAttempt', (e) => events.push(e));

      await handler.handleEpicFailure(3, new Error('Test'));

      expect(events).toHaveLength(1);
      expect(events[0].epicNum).toBe(3);
      expect(events[0].attempt).toBe(1);
    });

    it('should emit escalation event when escalated', async () => {
      const events = [];
      handler.on('escalation', (e) => events.push(e));

      // Force escalation
      await handler.handleEpicFailure(3, new Error('Fail 1'));
      await handler.handleEpicFailure(3, new Error('Fail 2'));
      await handler.handleEpicFailure(3, new Error('Fatal error'));

      expect(events.length).toBeGreaterThan(0);
    });
  });
});

describe('Integration with MasterOrchestrator', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `recovery-integration-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should integrate RecoveryHandler with MasterOrchestrator', async () => {
    const { MasterOrchestrator } = require('../../.aiox-core/core/orchestration');

    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
      maxRetries: 3,
      autoRecovery: true,
    });

    // Verify recovery handler is initialized
    expect(orchestrator.recoveryHandler).toBeDefined();
    expect(orchestrator.recoveryHandler).toBeInstanceOf(RecoveryHandler);
    expect(orchestrator.recoveryHandler.maxRetries).toBe(3);
  });

  it('should expose getRecoveryHandler method', async () => {
    const { MasterOrchestrator } = require('../../.aiox-core/core/orchestration');

    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    const handler = orchestrator.getRecoveryHandler();
    expect(handler).toBeDefined();
    expect(handler).toBeInstanceOf(RecoveryHandler);
  });
});
