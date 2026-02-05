/**
 * Epic Executors Tests
 *
 * Story: 0.3 - Epic Executors
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Tests for all epic executor classes.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const {
  EpicExecutor,
  Epic3Executor,
  Epic4Executor,
  Epic5Executor,
  Epic6Executor,
  ExecutionStatus,
  RecoveryStrategy,
  QAVerdict,
  createExecutor,
  hasExecutor,
  getAvailableEpics,
  EXECUTOR_MAP,
} = require('../../.aios-core/core/orchestration/executors');

describe('Epic Executors (Story 0.3)', () => {
  let tempDir;
  let mockOrchestrator;

  beforeEach(async () => {
    // Create temp directory
    tempDir = path.join(os.tmpdir(), `epic-executors-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    // Create mock orchestrator
    mockOrchestrator = {
      projectRoot: tempDir,
      storyId: 'TEST-001',
      maxRetries: 3,
      _log: jest.fn(),
    };
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('EpicExecutor Base Class (AC1)', () => {
    it('should create instance with orchestrator and epic number', () => {
      const executor = new EpicExecutor(mockOrchestrator, 3);

      expect(executor.orchestrator).toBe(mockOrchestrator);
      expect(executor.epicNum).toBe(3);
      expect(executor.status).toBe(ExecutionStatus.PENDING);
    });

    it('should throw error on execute() - abstract method', async () => {
      const executor = new EpicExecutor(mockOrchestrator, 3);

      await expect(executor.execute({})).rejects.toThrow('must implement execute()');
    });

    it('should return standardized result (AC7)', () => {
      const executor = new EpicExecutor(mockOrchestrator, 3);
      executor.status = ExecutionStatus.SUCCESS;
      executor.startTime = new Date().toISOString();
      executor.endTime = new Date().toISOString();

      const result = executor.getResult();

      expect(result.epicNum).toBe(3);
      expect(result.status).toBe(ExecutionStatus.SUCCESS);
      expect(result.success).toBe(true);
      expect(result.artifacts).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should track artifacts', () => {
      const executor = new EpicExecutor(mockOrchestrator, 3);

      executor._addArtifact('file', '/path/to/file.md', { size: 100 });

      expect(executor.artifacts).toHaveLength(1);
      expect(executor.artifacts[0].type).toBe('file');
      expect(executor.artifacts[0].path).toBe('/path/to/file.md');
      expect(executor.artifacts[0].size).toBe(100);
    });

    it('should track logs', () => {
      const executor = new EpicExecutor(mockOrchestrator, 3);

      executor._log('Test message', 'info');
      executor._log('Error message', 'error');

      expect(executor.logs).toHaveLength(2);
      expect(executor.logs[0].message).toBe('Test message');
      expect(executor.logs[1].level).toBe('error');
    });

    it('should calculate duration', () => {
      const executor = new EpicExecutor(mockOrchestrator, 3);
      executor.startTime = new Date(Date.now() - 5000).toISOString();
      executor.endTime = new Date().toISOString();

      const duration = executor._getDuration();
      const durationMs = executor._getDurationMs();

      expect(duration).toBe('5s');
      expect(durationMs).toBeGreaterThanOrEqual(4900);
      expect(durationMs).toBeLessThanOrEqual(5100);
    });
  });

  describe('Epic3Executor - Spec Pipeline (AC2)', () => {
    let executor;

    beforeEach(() => {
      executor = new Epic3Executor(mockOrchestrator);
    });

    it('should create instance with epic number 3', () => {
      expect(executor.epicNum).toBe(3);
    });

    it('should execute and return spec path', async () => {
      const result = await executor.execute({
        storyId: 'TEST-001',
        source: 'story',
      });

      expect(result.success).toBe(true);
      expect(result.specPath).toBeDefined();
      expect(result.complexity).toBeDefined();
    });

    it('should fail without storyId', async () => {
      const result = await executor.execute({});

      expect(result.success).toBe(false);
      expect(result.error).toContain('storyId');
    });

    it('should reuse existing spec', async () => {
      // Create existing spec
      const specPath = path.join(tempDir, 'docs', 'stories', 'TEST-001', 'spec.md');
      await fs.ensureDir(path.dirname(specPath));
      await fs.writeFile(specPath, '# Existing Spec');

      const result = await executor.execute({
        storyId: 'TEST-001',
        source: 'story',
      });

      expect(result.success).toBe(true);
      expect(result.reused).toBe(true);
    });
  });

  describe('Epic4Executor - Execution Engine (AC3)', () => {
    let executor;

    beforeEach(() => {
      executor = new Epic4Executor(mockOrchestrator);
    });

    it('should create instance with epic number 4', () => {
      expect(executor.epicNum).toBe(4);
    });

    it('should execute and return progress', async () => {
      const result = await executor.execute({
        storyId: 'TEST-001',
        specPath: '/path/to/spec.md',
        complexity: 'STANDARD',
      });

      expect(result.success).toBe(true);
      expect(result.progress).toBeDefined();
      expect(result.planPath).toBeDefined();
    });

    it('should create stub plan if not exists', async () => {
      const result = await executor.execute({
        storyId: 'TEST-001',
        specPath: '/path/to/spec.md',
      });

      const planPath = path.join(
        tempDir,
        'docs',
        'stories',
        'TEST-001',
        'plan',
        'implementation.yaml',
      );
      expect(await fs.pathExists(planPath)).toBe(true);
    });
  });

  describe('Epic5Executor - Recovery System (AC4)', () => {
    let executor;

    beforeEach(() => {
      executor = new Epic5Executor(mockOrchestrator);
    });

    it('should create instance with epic number 5', () => {
      expect(executor.epicNum).toBe(5);
    });

    it('should execute recovery for failed epic', async () => {
      const result = await executor.execute({
        storyId: 'TEST-001',
        failedEpic: 4,
        error: new Error('Test failure'),
        attempts: 0,
      });

      expect(result.success).toBe(true);
      expect(result.strategy).toBeDefined();
      expect(result.shouldRetry).toBeDefined();
    });

    it('should escalate after max attempts', async () => {
      const result = await executor.execute({
        storyId: 'TEST-001',
        failedEpic: 4,
        error: new Error('Persistent failure'),
        attempts: 5,
      });

      expect(result.strategy).toBe(RecoveryStrategy.ESCALATE_TO_HUMAN);
      expect(result.escalated).toBe(true);
    });

    it('should create escalation report', async () => {
      const result = await executor.execute({
        storyId: 'TEST-001',
        failedEpic: 4,
        error: new Error('Critical failure'),
        attempts: 5,
      });

      expect(result.recoveryResult.reportPath).toBeDefined();
      expect(await fs.pathExists(result.recoveryResult.reportPath)).toBe(true);
    });
  });

  describe('Epic6Executor - QA Loop (AC5)', () => {
    let executor;

    beforeEach(() => {
      executor = new Epic6Executor(mockOrchestrator);
    });

    it('should create instance with epic number 6', () => {
      expect(executor.epicNum).toBe(6);
    });

    it('should execute QA loop and return verdict', async () => {
      const result = await executor.execute({
        storyId: 'TEST-001',
        buildResult: {},
        testResults: [],
      });

      expect(result.success).toBe(true);
      expect(result.verdict).toBeDefined();
      expect(result.iterations).toBeDefined();
    });

    it('should generate QA report', async () => {
      const result = await executor.execute({
        storyId: 'TEST-001',
        buildResult: {},
      });

      expect(result.reportPath).toBeDefined();
      expect(await fs.pathExists(result.reportPath)).toBe(true);
    });
  });

  describe('Factory Functions', () => {
    it('should create executor with createExecutor()', () => {
      const executor = createExecutor(3, mockOrchestrator);

      expect(executor).toBeInstanceOf(Epic3Executor);
      expect(executor.epicNum).toBe(3);
    });

    it('should throw for unknown epic number', () => {
      expect(() => createExecutor(99, mockOrchestrator)).toThrow('No executor found');
    });

    it('should check executor existence with hasExecutor()', () => {
      expect(hasExecutor(3)).toBe(true);
      expect(hasExecutor(6)).toBe(true);
      expect(hasExecutor(99)).toBe(false);
    });

    it('should return available epics', () => {
      const epics = getAvailableEpics();

      expect(epics).toContain(3);
      expect(epics).toContain(4);
      expect(epics).toContain(5);
      expect(epics).toContain(6);
    });
  });

  describe('Enums', () => {
    it('should export ExecutionStatus enum', () => {
      expect(ExecutionStatus.PENDING).toBe('pending');
      expect(ExecutionStatus.RUNNING).toBe('running');
      expect(ExecutionStatus.SUCCESS).toBe('success');
      expect(ExecutionStatus.FAILED).toBe('failed');
    });

    it('should export RecoveryStrategy enum', () => {
      expect(RecoveryStrategy.RETRY_SAME_APPROACH).toBe('retry_same_approach');
      expect(RecoveryStrategy.ESCALATE_TO_HUMAN).toBe('escalate_to_human');
    });

    it('should export QAVerdict enum', () => {
      expect(QAVerdict.APPROVED).toBe('approved');
      expect(QAVerdict.NEEDS_REVISION).toBe('needs_revision');
      expect(QAVerdict.BLOCKED).toBe('blocked');
    });
  });

  describe('EXECUTOR_MAP', () => {
    it('should map all epic numbers to executor classes', () => {
      expect(EXECUTOR_MAP[3]).toBe(Epic3Executor);
      expect(EXECUTOR_MAP[4]).toBe(Epic4Executor);
      expect(EXECUTOR_MAP[5]).toBe(Epic5Executor);
      expect(EXECUTOR_MAP[6]).toBe(Epic6Executor);
    });
  });
});

describe('Standardized Results (AC7)', () => {
  let tempDir;
  let mockOrchestrator;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `executor-results-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    mockOrchestrator = {
      projectRoot: tempDir,
      storyId: 'TEST-001',
      _log: jest.fn(),
    };
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('all executors should return consistent result structure', async () => {
    const executors = [
      new Epic3Executor(mockOrchestrator),
      new Epic4Executor(mockOrchestrator),
      new Epic5Executor(mockOrchestrator),
      new Epic6Executor(mockOrchestrator),
    ];

    const contexts = [
      { storyId: 'TEST-001', source: 'story' },
      { storyId: 'TEST-001', specPath: '/path' },
      { storyId: 'TEST-001', failedEpic: 3, error: 'test', attempts: 0 },
      { storyId: 'TEST-001', buildResult: {} },
    ];

    for (let i = 0; i < executors.length; i++) {
      const result = await executors[i].execute(contexts[i]);

      // All results should have these fields
      expect(result).toHaveProperty('epicNum');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('artifacts');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('duration');
    }
  });
});
