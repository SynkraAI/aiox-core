/**
 * Build Orchestrator Tests - Story EXC-1 (AC2)
 *
 * Tests for the 8-phase build pipeline including:
 * - Constructor and config defaults
 * - runPhase() wrapping and event emission
 * - build() with phase failure handling
 * - buildSubtaskPrompt() formatting
 * - validateSubtaskResult() success and rejection
 * - extractModifiedFiles()
 * - formatDuration()
 * - Enum values
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  createTempDir,
  cleanupTempDir,
  collectEvents,
} = require('./execution-test-helpers');

// Mock optional modules to prevent constructor errors
jest.mock('../../.aios-core/workflow-intelligence/engine/wave-analyzer', () => null);
jest.mock('../../.aios-core/infrastructure/scripts/worktree-manager', () => { throw new Error('not available'); });
jest.mock('../../.aios-core/core/memory/gotchas-memory', () => { throw new Error('not available'); });

const {
  BuildOrchestrator,
  OrchestratorEvent,
  Phase,
  DEFAULT_CONFIG,
} = require('../../.aios-core/core/execution/build-orchestrator');

// ═══════════════════════════════════════════════════════════════════════════════
//                              ENUMS & CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

describe('Build Orchestrator Enums', () => {
  test('OrchestratorEvent should have all expected events (BO-04)', () => {
    expect(OrchestratorEvent.BUILD_QUEUED).toBe('build_queued');
    expect(OrchestratorEvent.PHASE_STARTED).toBe('phase_started');
    expect(OrchestratorEvent.PHASE_COMPLETED).toBe('phase_completed');
    expect(OrchestratorEvent.PHASE_FAILED).toBe('phase_failed');
    expect(OrchestratorEvent.SUBTASK_EXECUTING).toBe('subtask_executing');
    expect(OrchestratorEvent.QA_STARTED).toBe('qa_started');
    expect(OrchestratorEvent.QA_COMPLETED).toBe('qa_completed');
    expect(OrchestratorEvent.MERGE_STARTED).toBe('merge_started');
    expect(OrchestratorEvent.MERGE_COMPLETED).toBe('merge_completed');
    expect(OrchestratorEvent.BUILD_COMPLETED).toBe('build_completed');
    expect(OrchestratorEvent.BUILD_FAILED).toBe('build_failed');
    expect(OrchestratorEvent.REPORT_GENERATED).toBe('report_generated');
  });

  test('Phase should have all 8 phases (BO-05)', () => {
    expect(Phase.INIT).toBe('init');
    expect(Phase.WORKTREE).toBe('worktree');
    expect(Phase.PLAN).toBe('plan');
    expect(Phase.EXECUTE).toBe('execute');
    expect(Phase.QA).toBe('qa');
    expect(Phase.MERGE).toBe('merge');
    expect(Phase.CLEANUP).toBe('cleanup');
    expect(Phase.REPORT).toBe('report');
  });

  test('DEFAULT_CONFIG should have expected defaults (BO-03)', () => {
    expect(DEFAULT_CONFIG.useWorktree).toBe(true);
    expect(DEFAULT_CONFIG.runQA).toBe(true);
    expect(DEFAULT_CONFIG.autoMerge).toBe(true);
    expect(DEFAULT_CONFIG.maxIterations).toBe(10);
    expect(DEFAULT_CONFIG.globalTimeout).toBe(45 * 60 * 1000);
    expect(DEFAULT_CONFIG.subtaskTimeout).toBe(10 * 60 * 1000);
    expect(DEFAULT_CONFIG.dryRun).toBe(false);
    expect(DEFAULT_CONFIG.verbose).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//                              CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════

describe('BuildOrchestrator', () => {
  let orchestrator;
  let testDir;

  beforeEach(() => {
    testDir = createTempDir('build-orch-test-');
    orchestrator = new BuildOrchestrator({ rootPath: testDir });
  });

  afterEach(() => {
    if (orchestrator) {
      orchestrator.removeAllListeners();
    }
    cleanupTempDir(testDir);
  });

  describe('Constructor', () => {
    test('should create with default config (BO-01)', () => {
      const orch = new BuildOrchestrator();

      expect(orch.config.useWorktree).toBe(true);
      expect(orch.config.maxIterations).toBe(10);
      expect(orch.config.dryRun).toBe(false);
      expect(orch.activeBuilds).toBeInstanceOf(Map);
      expect(orch.activeBuilds.size).toBe(0);
    });

    test('should merge custom config with defaults (BO-02)', () => {
      const orch = new BuildOrchestrator({
        maxIterations: 5,
        dryRun: true,
        rootPath: '/custom/path',
      });

      expect(orch.config.maxIterations).toBe(5);
      expect(orch.config.dryRun).toBe(true);
      expect(orch.rootPath).toBe('/custom/path');
      // Defaults preserved
      expect(orch.config.useWorktree).toBe(true);
      expect(orch.config.globalTimeout).toBe(45 * 60 * 1000);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              runPhase()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('runPhase()', () => {
    test('should emit phase events on success (BO-28)', async () => {
      const tracker = collectEvents(orchestrator, [
        OrchestratorEvent.PHASE_STARTED,
        OrchestratorEvent.PHASE_COMPLETED,
      ]);

      const ctx = { storyId: 'test-story', phases: {} };
      const result = await orchestrator.runPhase(ctx, Phase.INIT, async () => 'done');

      expect(result).toBe('done');
      expect(tracker.count(OrchestratorEvent.PHASE_STARTED)).toBe(1);
      expect(tracker.count(OrchestratorEvent.PHASE_COMPLETED)).toBe(1);
      expect(ctx.phases[Phase.INIT].status).toBe('completed');
      expect(ctx.phases[Phase.INIT].duration).toBeGreaterThanOrEqual(0);
    });

    test('should emit phase_failed on error (BO-28)', async () => {
      const tracker = collectEvents(orchestrator, [
        OrchestratorEvent.PHASE_FAILED,
      ]);

      const ctx = { storyId: 'test-story', phases: {} };

      await expect(
        orchestrator.runPhase(ctx, Phase.PLAN, async () => {
          throw new Error('plan failed');
        }),
      ).rejects.toThrow('plan failed');

      expect(tracker.count(OrchestratorEvent.PHASE_FAILED)).toBe(1);
      expect(ctx.phases[Phase.PLAN].status).toBe('failed');
      expect(ctx.phases[Phase.PLAN].error).toBe('plan failed');
    });

    test('should set currentPhase on context', async () => {
      const ctx = { storyId: 'test-story', phases: {} };

      await orchestrator.runPhase(ctx, Phase.EXECUTE, async () => 'ok');

      expect(ctx.currentPhase).toBe(Phase.EXECUTE);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              build()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('build()', () => {
    test('should reject duplicate builds for same story (BO-07)', async () => {
      // Simulate an active build by directly setting the map
      orchestrator.activeBuilds.set('story-1', { storyId: 'story-1' });

      await expect(orchestrator.build('story-1')).rejects.toThrow(
        'Build already in progress for story-1',
      );
    });

    test('should fail at init phase if story not found (BO-08)', async () => {
      const result = await orchestrator.build('nonexistent-story', {
        useWorktree: false,
        runQA: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Story not found');
      expect(result.phase).toBe(Phase.INIT);
    });

    test('should emit BUILD_QUEUED event', async () => {
      const tracker = collectEvents(orchestrator, [OrchestratorEvent.BUILD_QUEUED]);

      // Will fail at init (no story file) but should still emit queued
      await orchestrator.build('some-story', { useWorktree: false, runQA: false });

      expect(tracker.count(OrchestratorEvent.BUILD_QUEUED)).toBe(1);
    });

    test('should cleanup activeBuilds after completion', async () => {
      await orchestrator.build('some-story', { useWorktree: false, runQA: false });

      expect(orchestrator.activeBuilds.has('some-story')).toBe(false);
    });

    test('should emit BUILD_FAILED on error', async () => {
      const tracker = collectEvents(orchestrator, [OrchestratorEvent.BUILD_FAILED]);

      await orchestrator.build('missing-story', { useWorktree: false, runQA: false });

      expect(tracker.count(OrchestratorEvent.BUILD_FAILED)).toBe(1);
      expect(tracker.getByName(OrchestratorEvent.BUILD_FAILED)[0].data.storyId).toBe('missing-story');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              phaseInit()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('phaseInit()', () => {
    test('should find story file and set storyPath (BO-12)', async () => {
      // Create a story file in the temp directory
      const storiesDir = path.join(testDir, 'docs', 'stories');
      fs.mkdirSync(storiesDir, { recursive: true });
      fs.writeFileSync(path.join(storiesDir, 'test-story.md'), '# Test Story');

      const ctx = { storyId: 'test-story', config: orchestrator.config };
      const result = await orchestrator.phaseInit(ctx);

      expect(result.storyPath).toContain('test-story.md');
      expect(ctx.storyPath).toBeDefined();
    });

    test('should throw if story not found (BO-13)', async () => {
      const ctx = { storyId: 'nonexistent', config: orchestrator.config };

      await expect(orchestrator.phaseInit(ctx)).rejects.toThrow('Story not found');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                        Phase dry-run paths
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Phase dry-run paths', () => {
    test('phaseWorktree returns dryRun when config.dryRun is true', async () => {
      const ctx = { storyId: 'test', config: { ...orchestrator.config, dryRun: true } };
      const result = await orchestrator.phaseWorktree(ctx);
      expect(result.dryRun).toBe(true);
    });

    test('phasePlan returns dryRun and uses existing plan file', async () => {
      // Create plan dir and file
      const planDir = path.join(testDir, 'plan');
      fs.mkdirSync(planDir, { recursive: true });
      fs.writeFileSync(
        path.join(planDir, 'implementation.yaml'),
        'storyId: test\nphases: []',
      );

      const ctx = {
        storyId: 'test',
        config: { ...orchestrator.config, planDir: 'plan' },
        worktree: null,
      };
      const result = await orchestrator.phasePlan(ctx);
      expect(result.source).toBe('existing');
      expect(ctx.plan).toBeDefined();
    });

    test('phasePlan returns dryRun when no plan and dryRun enabled', async () => {
      const ctx = {
        storyId: 'test',
        config: { ...orchestrator.config, planDir: 'plan', dryRun: true },
        worktree: null,
      };
      const result = await orchestrator.phasePlan(ctx);
      expect(result.dryRun).toBe(true);
    });

    test('phaseExecute returns dryRun when config.dryRun is true', async () => {
      const ctx = {
        storyId: 'test',
        config: { ...orchestrator.config, dryRun: true },
      };
      const result = await orchestrator.phaseExecute(ctx);
      expect(result.dryRun).toBe(true);
    });

    test('phaseQA returns dryRun when config.dryRun is true', async () => {
      const ctx = {
        storyId: 'test',
        config: { ...orchestrator.config, dryRun: true },
      };
      const result = await orchestrator.phaseQA(ctx);
      expect(result.dryRun).toBe(true);
    });

    test('phaseMerge returns dryRun when config.dryRun is true', async () => {
      const ctx = {
        storyId: 'test',
        config: { ...orchestrator.config, dryRun: true },
      };
      const result = await orchestrator.phaseMerge(ctx);
      expect(result.dryRun).toBe(true);
    });

    test('phaseMerge returns skipped when no worktree', async () => {
      const ctx = {
        storyId: 'test',
        config: { ...orchestrator.config },
        worktree: null,
      };
      const result = await orchestrator.phaseMerge(ctx);
      expect(result.skipped).toBe(true);
    });

    test('phaseCleanup returns dryRun when config.dryRun is true', async () => {
      const ctx = {
        storyId: 'test',
        config: { ...orchestrator.config, dryRun: true },
      };
      const result = await orchestrator.phaseCleanup(ctx);
      expect(result.dryRun).toBe(true);
    });

    test('phaseCleanup returns skipped when no worktree', async () => {
      const ctx = {
        storyId: 'test',
        config: { ...orchestrator.config },
        worktree: null,
      };
      const result = await orchestrator.phaseCleanup(ctx);
      expect(result.skipped).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              generatePlan()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('generatePlan()', () => {
    test('should generate plan from story file', async () => {
      const storiesDir = path.join(testDir, 'docs', 'stories');
      fs.mkdirSync(storiesDir, { recursive: true });
      fs.writeFileSync(
        path.join(storiesDir, 'gen-plan-story.md'),
        '# Story\n\n- [ ] AC1: First criteria\n- [ ] AC2: Second criteria\n',
      );

      const ctx = {
        storyId: 'gen-plan-story',
        storyPath: path.join(storiesDir, 'gen-plan-story.md'),
        config: orchestrator.config,
      };

      const plan = await orchestrator.generatePlan(ctx);
      expect(plan.storyId).toBe('gen-plan-story');
      expect(plan.phases[0].subtasks.length).toBe(2);
      expect(plan.phases[0].subtasks[0].description).toContain('First criteria');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              log()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('log()', () => {
    test('should log at different levels', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation();
      orchestrator.log('test info message', 'info');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    test('should skip debug messages when not verbose', () => {
      orchestrator.config.verbose = false;
      const spy = jest.spyOn(console, 'log').mockImplementation();
      orchestrator.log('debug message', 'debug');
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    test('should show debug messages when verbose', () => {
      orchestrator.config.verbose = true;
      const spy = jest.spyOn(console, 'log').mockImplementation();
      orchestrator.log('debug message', 'debug');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                         buildSubtaskPrompt()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('buildSubtaskPrompt()', () => {
    test('should format prompt with subtask details (BO-21)', () => {
      const subtask = {
        id: '1.1',
        description: 'Implement auth module',
        files: ['src/auth.js', 'src/auth.test.js'],
        acceptanceCriteria: ['User can log in', 'Token is generated'],
      };
      const execCtx = { iteration: 1, config: { maxIterations: 10 } };
      const buildCtx = { storyId: 'story-1' };

      const prompt = orchestrator.buildSubtaskPrompt(subtask, execCtx, buildCtx);

      expect(prompt).toContain('Story story-1');
      expect(prompt).toContain('1.1');
      expect(prompt).toContain('Implement auth module');
      expect(prompt).toContain('src/auth.js');
      expect(prompt).toContain('User can log in');
      expect(prompt).toContain('Token is generated');
      expect(prompt).toContain('attempt 1 of 10');
    });

    test('should include retry message on subsequent attempts', () => {
      const subtask = { id: '1.1', description: 'Test' };
      const execCtx = { iteration: 3, config: { maxIterations: 10 } };
      const buildCtx = { storyId: 'story-1' };

      const prompt = orchestrator.buildSubtaskPrompt(subtask, execCtx, buildCtx);

      expect(prompt).toContain('attempt 3 of 10');
      expect(prompt).toContain('Previous attempt failed');
    });

    test('should include gotchas context when available', () => {
      const subtask = { id: '1.1', description: 'Test' };
      const execCtx = { iteration: 1, config: { maxIterations: 10 } };
      const buildCtx = {
        storyId: 'story-1',
        relevantGotchas: [
          { title: 'ESM import issue', description: 'Use require() not import', workaround: 'Use CommonJS' },
        ],
      };

      const prompt = orchestrator.buildSubtaskPrompt(subtask, execCtx, buildCtx);

      expect(prompt).toContain('Known Gotchas');
      expect(prompt).toContain('ESM import issue');
      expect(prompt).toContain('Use CommonJS');
    });

    test('should include verification command when specified', () => {
      const subtask = {
        id: '1.1',
        description: 'Test',
        verification: { command: 'npm test' },
      };
      const execCtx = { iteration: 1, config: { maxIterations: 10 } };
      const buildCtx = { storyId: 'story-1' };

      const prompt = orchestrator.buildSubtaskPrompt(subtask, execCtx, buildCtx);

      expect(prompt).toContain('Verification');
      expect(prompt).toContain('npm test');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                         validateSubtaskResult()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('validateSubtaskResult()', () => {
    test('should return true for clean output (BO-22)', () => {
      const result = { stdout: 'All good, implementation complete.' };
      const subtask = { id: '1.1' };

      expect(orchestrator.validateSubtaskResult(result, subtask)).toBe(true);
    });

    test('should return false for output with error and failed (BO-23)', () => {
      const result = { stdout: 'Error: something went wrong and the build failed' };
      const subtask = { id: '1.1' };

      expect(orchestrator.validateSubtaskResult(result, subtask)).toBe(false);
    });

    test('should return false for test failed output', () => {
      const result = { stdout: 'Running tests...\nTest failed: 2 of 5' };
      const subtask = { id: '1.1' };

      expect(orchestrator.validateSubtaskResult(result, subtask)).toBe(false);
    });

    test('should return true when output contains verification passed', () => {
      const result = { stdout: 'verification passed for all checks' };
      const subtask = { id: '1.1', verification: { command: 'npm test' } };

      expect(orchestrator.validateSubtaskResult(result, subtask)).toBe(true);
    });

    test('should return true when output contains check mark', () => {
      const result = { stdout: 'All checks ✓ complete' };
      const subtask = { id: '1.1', verification: 'npm test' };

      expect(orchestrator.validateSubtaskResult(result, subtask)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                         extractModifiedFiles()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('extractModifiedFiles()', () => {
    test('should extract files from wrote/created patterns (BO-24)', () => {
      const output = 'wrote src/auth.js\ncreated src/auth.test.js\nmodified package.json';

      const files = orchestrator.extractModifiedFiles(output);

      expect(files).toContain('src/auth.js');
      expect(files).toContain('src/auth.test.js');
      expect(files).toContain('package.json');
    });

    test('should extract files from file: pattern', () => {
      const output = 'file: src/index.js\nfile: README.md';

      const files = orchestrator.extractModifiedFiles(output);

      expect(files).toContain('src/index.js');
      expect(files).toContain('README.md');
    });

    test('should deduplicate files', () => {
      const output = 'wrote src/auth.js\nmodified src/auth.js';

      const files = orchestrator.extractModifiedFiles(output);

      expect(files.filter((f) => f === 'src/auth.js')).toHaveLength(1);
    });

    test('should return empty array for no matches', () => {
      const output = 'No files were changed.';

      const files = orchestrator.extractModifiedFiles(output);

      expect(files).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              formatDuration()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('formatDuration()', () => {
    test('should format seconds only (BO-27)', () => {
      expect(orchestrator.formatDuration(5000)).toBe('5s');
      expect(orchestrator.formatDuration(30000)).toBe('30s');
    });

    test('should format minutes and seconds', () => {
      expect(orchestrator.formatDuration(90000)).toBe('1m 30s');
      expect(orchestrator.formatDuration(300000)).toBe('5m 0s');
    });

    test('should handle zero', () => {
      expect(orchestrator.formatDuration(0)).toBe('0s');
    });

    test('should handle sub-second values', () => {
      expect(orchestrator.formatDuration(500)).toBe('0s');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              findStoryFile()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('findStoryFile()', () => {
    test('should find story in stories root', () => {
      const storiesDir = path.join(testDir, 'docs', 'stories');
      fs.mkdirSync(storiesDir, { recursive: true });
      fs.writeFileSync(path.join(storiesDir, 'my-story.md'), '# Story');

      const result = orchestrator.findStoryFile('my-story');

      expect(result).toContain('my-story.md');
    });

    test('should find story in subdirectory', () => {
      const subDir = path.join(testDir, 'docs', 'stories', 'v2.1');
      fs.mkdirSync(subDir, { recursive: true });
      fs.writeFileSync(path.join(subDir, 'sprint-story.md'), '# Story');

      const result = orchestrator.findStoryFile('sprint-story');

      expect(result).toContain('sprint-story.md');
    });

    test('should return null for nonexistent story', () => {
      const storiesDir = path.join(testDir, 'docs', 'stories');
      fs.mkdirSync(storiesDir, { recursive: true });

      const result = orchestrator.findStoryFile('missing-story');

      expect(result).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              getActiveBuilds()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getActiveBuilds()', () => {
    test('should return empty array when no builds active', () => {
      expect(orchestrator.getActiveBuilds()).toEqual([]);
    });

    test('should return active build info', () => {
      orchestrator.activeBuilds.set('story-1', {
        storyId: 'story-1',
        currentPhase: Phase.EXECUTE,
        startTime: Date.now() - 5000,
      });

      const builds = orchestrator.getActiveBuilds();

      expect(builds).toHaveLength(1);
      expect(builds[0].storyId).toBe('story-1');
      expect(builds[0].phase).toBe(Phase.EXECUTE);
      expect(builds[0].duration).toBeGreaterThanOrEqual(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              generateReport()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('generateReport()', () => {
    test('should generate success report', () => {
      const ctx = {
        storyId: 'story-1',
        worktree: null,
        qaResult: { success: true },
        mergeResult: null,
        phases: {
          init: { status: 'completed', duration: 100 },
          plan: { status: 'completed', duration: 200 },
        },
        errors: [],
        result: { stats: { completedSubtasks: 5, failedSubtasks: 0, totalIterations: 5 } },
      };

      const report = orchestrator.generateReport(ctx, 5000, false);

      expect(report).toContain('SUCCESS');
      expect(report).toContain('story-1');
      expect(report).toContain('init');
      expect(report).toContain('plan');
      expect(report).toContain('Completed Subtasks: 5');
    });

    test('should generate failure report with errors', () => {
      const ctx = {
        storyId: 'story-1',
        worktree: null,
        qaResult: { success: false },
        mergeResult: null,
        phases: {
          init: { status: 'completed', duration: 100 },
          execute: { status: 'failed', duration: 300, error: 'Build failed' },
        },
        errors: [new Error('Build loop failed')],
        result: null,
      };

      const report = orchestrator.generateReport(ctx, 3000, true);

      expect(report).toContain('FAILED');
      expect(report).toContain('Build loop failed');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              phaseReport()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('phaseReport()', () => {
    test('should write report to file', async () => {
      const ctx = {
        storyId: 'test-report',
        startTime: Date.now() - 5000,
        config: { ...orchestrator.config, reportDir: 'plan' },
        worktree: null,
        qaResult: null,
        mergeResult: null,
        phases: {},
        errors: [],
        result: null,
      };

      const result = await orchestrator.phaseReport(ctx);

      expect(result.path).toContain('build-report-test-report.md');
      expect(fs.existsSync(result.path)).toBe(true);
      expect(ctx.reportPath).toBe(result.path);
    });

    test('should emit REPORT_GENERATED event', async () => {
      const tracker = collectEvents(orchestrator, [OrchestratorEvent.REPORT_GENERATED]);

      const ctx = {
        storyId: 'test-report',
        startTime: Date.now(),
        config: { ...orchestrator.config, reportDir: 'plan' },
        worktree: null,
        qaResult: null,
        mergeResult: null,
        phases: {},
        errors: [],
        result: null,
      };

      await orchestrator.phaseReport(ctx);

      expect(tracker.count(OrchestratorEvent.REPORT_GENERATED)).toBe(1);
    });
  });
});
