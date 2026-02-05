/**
 * Master Orchestrator Tests
 *
 * Story: 0.1 - Master Orchestrator Core
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Tests the core functionality of the MasterOrchestrator class.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const MasterOrchestrator = require('../../.aios-core/core/orchestration/master-orchestrator');
const { OrchestratorState, EpicStatus, EPIC_CONFIG } = MasterOrchestrator;

describe('MasterOrchestrator', () => {
  let tempDir;
  let orchestrator;

  beforeEach(async () => {
    // Create temp directory for tests
    tempDir = path.join(os.tmpdir(), `master-orchestrator-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    // Create .aios/dashboard directory for dashboard integration
    await fs.ensureDir(path.join(tempDir, '.aios', 'dashboard'));

    // Create a minimal package.json for tech stack detection
    await fs.writeJson(path.join(tempDir, 'package.json'), {
      name: 'test-project',
      dependencies: {
        react: '^18.0.0',
      },
      devDependencies: {
        jest: '^29.0.0',
      },
    });

    orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
      maxRetries: 2,
      autoRecovery: false,
    });
  });

  afterEach(async () => {
    // Cleanup temp directory
    await fs.remove(tempDir);
  });

  describe('Constructor (AC2)', () => {
    it('should create instance with default options', () => {
      const orch = new MasterOrchestrator(tempDir);

      expect(orch.projectRoot).toBe(tempDir);
      expect(orch.storyId).toBeNull();
      expect(orch.maxRetries).toBe(3);
      expect(orch.autoRecovery).toBe(true);
      expect(orch.state).toBe(OrchestratorState.INITIALIZED);
    });

    it('should create instance with custom options', () => {
      expect(orchestrator.projectRoot).toBe(tempDir);
      expect(orchestrator.storyId).toBe('TEST-001');
      expect(orchestrator.maxRetries).toBe(2);
      expect(orchestrator.autoRecovery).toBe(false);
    });

    it('should initialize execution state', () => {
      expect(orchestrator.executionState).toBeDefined();
      expect(orchestrator.executionState.storyId).toBe('TEST-001');
      expect(orchestrator.executionState.epics).toBeDefined();
      expect(Object.keys(orchestrator.executionState.epics)).toHaveLength(4);
    });

    it('should have all epics in pending state initially', () => {
      for (const epicNum of [3, 4, 5, 6]) {
        expect(orchestrator.executionState.epics[epicNum]).toBeDefined();
        expect(orchestrator.executionState.epics[epicNum].status).toBe(EpicStatus.PENDING);
      }
    });
  });

  describe('State Machine (AC6)', () => {
    it('should start in INITIALIZED state', () => {
      expect(orchestrator.state).toBe(OrchestratorState.INITIALIZED);
    });

    it('should transition to READY after initialize()', async () => {
      await orchestrator.initialize();
      expect(orchestrator.state).toBe(OrchestratorState.READY);
    });

    it('should emit stateChange event on transition', async () => {
      const stateChanges = [];
      orchestrator.on('stateChange', (change) => {
        stateChanges.push(change);
      });

      await orchestrator.initialize();

      expect(stateChanges.length).toBeGreaterThan(0);
      expect(stateChanges[0].from).toBe(OrchestratorState.INITIALIZED);
      expect(stateChanges[0].to).toBe(OrchestratorState.READY);
    });

    it('should have all valid state enum values', () => {
      expect(OrchestratorState.INITIALIZED).toBe('initialized');
      expect(OrchestratorState.READY).toBe('ready');
      expect(OrchestratorState.IN_PROGRESS).toBe('in_progress');
      expect(OrchestratorState.BLOCKED).toBe('blocked');
      expect(OrchestratorState.COMPLETE).toBe('complete');
    });
  });

  describe('TechStackDetector Integration (AC7)', () => {
    it('should detect tech stack during initialize()', async () => {
      await orchestrator.initialize();

      expect(orchestrator.executionState.techStackProfile).toBeDefined();
      expect(orchestrator.executionState.techStackProfile.hasFrontend).toBe(true);
      expect(orchestrator.executionState.techStackProfile.frontend.framework).toBe('react');
      expect(orchestrator.executionState.techStackProfile.hasTests).toBe(true);
    });

    it('should store tech stack profile in state', async () => {
      await orchestrator.initialize();

      const profile = orchestrator.executionState.techStackProfile;
      expect(profile.detectedAt).toBeDefined();
      expect(profile.confidence).toBeGreaterThan(0);
    });
  });

  describe('executeEpic (AC4)', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    it('should execute a single epic', async () => {
      const result = await orchestrator.executeEpic(3);

      expect(result).toBeDefined();
      expect(result.epicNum).toBe(3);
      // Stub executor returns success
      expect(result.success).toBe(true);
    });

    it('should update epic state during execution', async () => {
      await orchestrator.executeEpic(3);

      expect(orchestrator.executionState.epics[3].status).toBe(EpicStatus.COMPLETED);
      expect(orchestrator.executionState.epics[3].startedAt).toBeDefined();
      expect(orchestrator.executionState.epics[3].completedAt).toBeDefined();
    });

    it('should emit epicStart and epicComplete events', async () => {
      const events = [];
      orchestrator.on('epicStart', (e) => events.push({ type: 'start', ...e }));
      orchestrator.on('epicComplete', (e) => events.push({ type: 'complete', ...e }));

      await orchestrator.executeEpic(4);

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('start');
      expect(events[0].epicNum).toBe(4);
      expect(events[1].type).toBe('complete');
      expect(events[1].epicNum).toBe(4);
    });

    it('should throw error for unknown epic', async () => {
      await expect(orchestrator.executeEpic(99)).rejects.toThrow('Unknown epic number');
    });
  });

  describe('executeFullPipeline (AC3)', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    it('should execute epics in sequence 3→4→6', async () => {
      const executedEpics = [];
      orchestrator.on('epicStart', (e) => executedEpics.push(e.epicNum));

      const result = await orchestrator.executeFullPipeline();

      // Epic 5 (Recovery) is on-demand, not in sequence
      expect(executedEpics).toEqual([3, 4, 6]);
      expect(result.epics.executed).toContain(3);
      expect(result.epics.executed).toContain(4);
      expect(result.epics.executed).toContain(6);
    });

    it('should transition to COMPLETE on success', async () => {
      await orchestrator.executeFullPipeline();
      expect(orchestrator.state).toBe(OrchestratorState.COMPLETE);
    });

    it('should return finalized result', async () => {
      const result = await orchestrator.executeFullPipeline();

      expect(result.workflowId).toBeDefined();
      expect(result.storyId).toBe('TEST-001');
      expect(result.success).toBe(true);
      expect(result.duration).toBeDefined();
      expect(result.techStack).toBeDefined();
    });
  });

  describe('resumeFromEpic (AC5)', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
      // Execute first two epics
      await orchestrator.executeEpic(3);
      await orchestrator.executeEpic(4);
    });

    it('should reset epics from specified point', async () => {
      // Mark epic 4 as we want to resume from there
      expect(orchestrator.executionState.epics[3].status).toBe(EpicStatus.COMPLETED);
      expect(orchestrator.executionState.epics[4].status).toBe(EpicStatus.COMPLETED);

      await orchestrator.resumeFromEpic(4);

      // Epic 3 should still be completed (before resume point)
      expect(orchestrator.executionState.epics[3].status).toBe(EpicStatus.COMPLETED);
      // Epic 4+ should be completed again after resume
      expect(orchestrator.executionState.epics[4].status).toBe(EpicStatus.COMPLETED);
    });

    it('should continue full pipeline from resume point', async () => {
      const executedEpics = [];
      orchestrator.on('epicStart', (e) => executedEpics.push(e.epicNum));

      await orchestrator.resumeFromEpic(6);

      // Should only execute 6 since 3,4 were already done
      // and reset happens for epics >= fromEpic
      expect(executedEpics).toContain(6);
    });
  });

  describe('State Persistence (Story 0.2)', () => {
    describe('saveState (AC1, AC3)', () => {
      it('should save state to correct path', async () => {
        await orchestrator.initialize();
        await orchestrator.executeEpic(3);

        const statePath = orchestrator.statePath;
        // Normalize path separators for cross-platform compatibility (Windows uses \, Unix uses /)
        const normalizedPath = statePath.replace(/\\/g, '/');
        expect(normalizedPath).toContain('.aios/master-orchestrator/TEST-001.json');
        expect(await fs.pathExists(statePath)).toBe(true);
      });

      it('should return success status', async () => {
        await orchestrator.initialize();
        const result = await orchestrator.saveState();
        expect(result).toBe(true);
      });
    });

    describe('State Schema (AC2, AC6, AC7)', () => {
      it('should include all required fields', async () => {
        await orchestrator.initialize();
        await orchestrator.executeEpic(3);

        const savedState = await fs.readJson(orchestrator.statePath);

        // AC2: currentEpic, completedEpics, failedEpics, context
        expect(savedState.currentEpic).toBeDefined();
        expect(savedState.completedEpics).toContain(3);
        expect(savedState.failedEpics).toBeDefined();
        expect(savedState.context).toBeDefined();

        // AC6: timestamps
        expect(savedState.timestamps).toBeDefined();
        expect(savedState.timestamps.startedAt).toBeDefined();
        expect(savedState.timestamps.updatedAt).toBeDefined();
        expect(savedState.timestamps.savedAt).toBeDefined();

        // AC7: techStackProfile
        expect(savedState.techStackProfile).toBeDefined();
        expect(savedState.techStackProfile.hasFrontend).toBe(true);
      });

      it('should include schema version', async () => {
        await orchestrator.initialize();
        const savedState = await fs.readJson(orchestrator.statePath);
        expect(savedState.schemaVersion).toBe('1.0');
      });

      it('should include context with options', async () => {
        await orchestrator.initialize();
        const savedState = await fs.readJson(orchestrator.statePath);

        expect(savedState.context.maxRetries).toBe(2);
        expect(savedState.context.autoRecovery).toBe(false);
      });
    });

    describe('loadState (AC4)', () => {
      it('should load state for current storyId', async () => {
        await orchestrator.initialize();
        await orchestrator.executeEpic(3);

        const loadedState = await orchestrator.loadState();
        expect(loadedState).not.toBeNull();
        expect(loadedState.storyId).toBe('TEST-001');
      });

      it('should load state for specific storyId', async () => {
        await orchestrator.initialize();
        await orchestrator.executeEpic(3);

        // Create another orchestrator with different ID
        const orch2 = new MasterOrchestrator(tempDir, { storyId: 'TEST-002' });

        // Load state from first orchestrator
        const loadedState = await orch2.loadState('TEST-001');
        expect(loadedState).not.toBeNull();
        expect(loadedState.storyId).toBe('TEST-001');
      });

      it('should return null for non-existent state', async () => {
        const state = await orchestrator.loadState('NON-EXISTENT');
        expect(state).toBeNull();
      });
    });

    describe('Resume Detection (AC5)', () => {
      it('should load existing state on initialize', async () => {
        await orchestrator.initialize();
        await orchestrator.executeEpic(3);

        const orchestrator2 = new MasterOrchestrator(tempDir, {
          storyId: 'TEST-001',
        });

        await orchestrator2.initialize();
        expect(orchestrator2.executionState.epics['3'].status).toBe(EpicStatus.COMPLETED);
      });

      it('should find latest valid state', async () => {
        await orchestrator.initialize();
        await orchestrator.executeEpic(3);

        // Create another orchestrator
        const orch2 = new MasterOrchestrator(tempDir, { storyId: 'TEST-002' });
        await orch2.initialize();

        // Find latest should return most recent
        const latestState = await orchestrator.findLatestValidState();
        expect(latestState).not.toBeNull();
        expect(['TEST-001', 'TEST-002']).toContain(latestState.storyId);
      });

      it('should not resume completed states', async () => {
        await orchestrator.initialize();
        await orchestrator.executeFullPipeline();

        // State should be complete
        const savedState = await fs.readJson(orchestrator.statePath);
        expect(savedState.status).toBe(OrchestratorState.COMPLETE);

        // New orchestrator should not load completed state
        const orch2 = new MasterOrchestrator(tempDir, { storyId: 'TEST-001' });
        await orch2.initialize();

        // Should start fresh since previous was complete
        expect(orch2.executionState.epics['3'].status).toBe(EpicStatus.PENDING);
      });
    });

    describe('State Management', () => {
      it('should clear state', async () => {
        await orchestrator.initialize();
        await orchestrator.saveState();

        expect(await fs.pathExists(orchestrator.statePath)).toBe(true);

        await orchestrator.clearState();
        expect(await fs.pathExists(orchestrator.statePath)).toBe(false);
      });

      it('should list saved states', async () => {
        await orchestrator.initialize();
        await orchestrator.executeEpic(3);

        const orch2 = new MasterOrchestrator(tempDir, { storyId: 'TEST-002' });
        await orch2.initialize();

        const states = await orchestrator.listSavedStates();
        expect(states.length).toBeGreaterThanOrEqual(2);
        expect(states[0].storyId).toBeDefined();
        expect(states[0].progress).toBeDefined();
        expect(states[0].resumable).toBeDefined();
      });

      it('should calculate progress from state', async () => {
        await orchestrator.initialize();
        await orchestrator.executeEpic(3);
        await orchestrator.executeEpic(4);

        const states = await orchestrator.listSavedStates();
        const testState = states.find((s) => s.storyId === 'TEST-001');

        expect(testState.progress).toBe(67); // 2 of 3 epics
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress percentage', async () => {
      await orchestrator.initialize();

      expect(orchestrator.getProgressPercentage()).toBe(0);

      await orchestrator.executeEpic(3);
      expect(orchestrator.getProgressPercentage()).toBe(33); // 1 of 3 non-on-demand epics

      await orchestrator.executeEpic(4);
      expect(orchestrator.getProgressPercentage()).toBe(67); // 2 of 3
    });

    it('should return status summary', async () => {
      await orchestrator.initialize();
      await orchestrator.executeEpic(3);

      const status = orchestrator.getStatus();

      expect(status.state).toBe(OrchestratorState.READY);
      expect(status.storyId).toBe('TEST-001');
      expect(status.progress).toBe(33);
      expect(status.epics['3'].status).toBe(EpicStatus.COMPLETED);
    });
  });

  describe('EPIC_CONFIG', () => {
    it('should have configuration for all epics', () => {
      expect(EPIC_CONFIG[3]).toBeDefined();
      expect(EPIC_CONFIG[4]).toBeDefined();
      expect(EPIC_CONFIG[5]).toBeDefined();
      expect(EPIC_CONFIG[6]).toBeDefined();
    });

    it('should mark Epic 5 as on-demand', () => {
      expect(EPIC_CONFIG[5].onDemand).toBe(true);
      expect(EPIC_CONFIG[3].onDemand).toBeUndefined();
    });

    it('should have correct epic names', () => {
      expect(EPIC_CONFIG[3].name).toBe('Spec Pipeline');
      expect(EPIC_CONFIG[4].name).toBe('Execution Engine');
      expect(EPIC_CONFIG[5].name).toBe('Recovery System');
      expect(EPIC_CONFIG[6].name).toBe('QA Loop');
    });
  });

  describe('Context Building (Story 0.4)', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    // AC1: Método _buildContextForEpic(epicNum) criado
    it('AC1: should have _buildContextForEpic method', () => {
      expect(typeof orchestrator._buildContextForEpic).toBe('function');
    });

    it('should build context with base properties for all epics', async () => {
      const context = orchestrator._buildContextForEpic(3);

      expect(context.storyId).toBe('TEST-001');
      expect(context.workflowId).toBeDefined();
      expect(context.techStack).toBeDefined();
      expect(context.projectRoot).toBe(tempDir);
    });

    // AC2: Epic 3 recebe: storyId, source, prdPath
    it('AC2: Epic 3 should receive storyId, source, prdPath', async () => {
      const orch = new MasterOrchestrator(tempDir, {
        storyId: 'TEST-001',
        source: 'prd',
        prdPath: '/path/to/prd.md',
      });
      await orch.initialize();

      const context = orch._buildContextForEpic(3);

      expect(context.storyId).toBe('TEST-001');
      expect(context.source).toBe('prd');
      expect(context.prdPath).toBe('/path/to/prd.md');
    });

    // AC3: Epic 4 recebe: specPath, complexity, requirements, techStack
    it('AC3: Epic 4 should receive specPath, complexity, requirements, techStack', async () => {
      // Simulate Epic 3 completion
      orchestrator.executionState.epics[3] = {
        status: EpicStatus.COMPLETED,
        result: {
          specPath: '/path/to/spec.md',
          complexity: 'STANDARD',
          requirements: ['REQ-1', 'REQ-2'],
        },
      };

      const context = orchestrator._buildContextForEpic(4);

      expect(context.spec).toBe('/path/to/spec.md');
      expect(context.complexity).toBe('STANDARD');
      expect(context.requirements).toEqual(['REQ-1', 'REQ-2']);
      expect(context.techStack).toBeDefined();
    });

    // AC4: Epic 5 recebe: implementationPath, errors, attempts
    it('AC4: Epic 5 should receive implementationPath, errors, attempts', async () => {
      // Simulate Epic 4 with errors
      orchestrator.executionState.epics[4] = {
        status: EpicStatus.FAILED,
        result: {
          implementationPath: '/path/to/impl',
        },
        attempts: 2,
      };
      orchestrator.executionState.errors = [{ epic: 4, error: 'Build failed' }];

      const context = orchestrator._buildContextForEpic(5);

      expect(context.implementationPath).toBe('/path/to/impl');
      expect(context.errors).toHaveLength(1);
      expect(context.errors[0].error).toBe('Build failed');
      expect(context.attempts).toBe(2);
    });

    // AC5: Epic 6 recebe: buildResult, testResults, codeChanges
    it('AC5: Epic 6 should receive buildResult, testResults, codeChanges', async () => {
      // Simulate Epic 4 completion
      orchestrator.executionState.epics[4] = {
        status: EpicStatus.COMPLETED,
        result: {
          success: true,
          testResults: [{ name: 'test1', passed: true }],
          codeChanges: ['/src/file.js'],
        },
      };

      const context = orchestrator._buildContextForEpic(6);

      expect(context.buildResult).toBeDefined();
      expect(context.buildResult.success).toBe(true);
      expect(context.testResults).toHaveLength(1);
      expect(context.codeChanges).toContain('/src/file.js');
    });


    // AC7: TechStackProfile injected em todos os contextos
    it('AC7: TechStackProfile should be injected in all contexts', async () => {
      const epics = [3, 4, 5, 6, 7];

      for (const epicNum of epics) {
        const context = orchestrator._buildContextForEpic(epicNum);
        expect(context.techStack).toBeDefined();
        expect(typeof context.techStack).toBe('object');
      }
    });

    it('should include previousGates in all contexts', async () => {
      // Complete Epic 3
      orchestrator.executionState.epics[3] = {
        status: EpicStatus.COMPLETED,
        result: {},
      };

      const context = orchestrator._buildContextForEpic(4);

      expect(context.previousGates).toBeDefined();
      expect(context.previousGates).toContain(3);
    });

    it('should collect session insights correctly', async () => {
      orchestrator.executionState.startedAt = new Date(Date.now() - 5000).toISOString();
      orchestrator.executionState.errors = [{ epic: 3, error: 'test' }];
      orchestrator.executionState.retryCount = { 3: 2, 4: 1 };
      orchestrator.executionState.epics[3] = { status: EpicStatus.COMPLETED };

      const insights = orchestrator._collectSessionInsights();

      expect(insights.duration).toBeGreaterThanOrEqual(4900);
      expect(insights.errorsEncountered).toBe(1);
      expect(insights.recoveryAttempts).toBe(3);
      expect(insights.completedEpics).toBe(1);
    });
  });
});

describe('EpicStatus Enum', () => {
  it('should have all required status values', () => {
    expect(EpicStatus.PENDING).toBe('pending');
    expect(EpicStatus.IN_PROGRESS).toBe('in_progress');
    expect(EpicStatus.COMPLETED).toBe('completed');
    expect(EpicStatus.FAILED).toBe('failed');
    expect(EpicStatus.SKIPPED).toBe('skipped');
  });
});

describe('Module Exports', () => {
  it('should export MasterOrchestrator class', () => {
    expect(MasterOrchestrator).toBeDefined();
    expect(typeof MasterOrchestrator).toBe('function');
  });

  it('should export OrchestratorState', () => {
    expect(OrchestratorState).toBeDefined();
    expect(typeof OrchestratorState).toBe('object');
  });

  it('should export EpicStatus', () => {
    expect(EpicStatus).toBeDefined();
    expect(typeof EpicStatus).toBe('object');
  });

  it('should export EPIC_CONFIG', () => {
    expect(EPIC_CONFIG).toBeDefined();
    expect(typeof EPIC_CONFIG).toBe('object');
  });
});
