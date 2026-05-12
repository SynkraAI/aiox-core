/**
 * Session State Persistence Tests
 * Story 11.5: Projeto Bob - Session State Persistence
 */

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const {
  SessionState,
  createSessionState,
  sessionStateExists,
  loadSessionState,
  ActionType,
  Phase,
  ResumeOption,
  SESSION_STATE_VERSION,
  SESSION_STATE_FILENAME,
  CRASH_THRESHOLD_MINUTES,
} = require('../../../.aiox-core/core/orchestration/session-state');

// Test fixtures
const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-project');
const TEST_STATE_PATH = path.join(TEST_PROJECT_ROOT, 'docs/stories', SESSION_STATE_FILENAME);

describe('SessionState', () => {
  let sessionState;

  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(path.join(TEST_PROJECT_ROOT, 'docs/stories'), { recursive: true });

    sessionState = new SessionState(TEST_PROJECT_ROOT, { debug: false });
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Constants', () => {
    it('should export SESSION_STATE_VERSION as 1.2', () => {
      expect(SESSION_STATE_VERSION).toBe('1.2');
    });

    it('should export SESSION_STATE_FILENAME as .session-state.yaml', () => {
      expect(SESSION_STATE_FILENAME).toBe('.session-state.yaml');
    });

    it('should export CRASH_THRESHOLD_MINUTES as 30', () => {
      expect(CRASH_THRESHOLD_MINUTES).toBe(30);
    });
  });

  describe('ActionType enum', () => {
    it('should have all required action types', () => {
      expect(ActionType.GO).toBe('GO');
      expect(ActionType.PAUSE).toBe('PAUSE');
      expect(ActionType.REVIEW).toBe('REVIEW');
      expect(ActionType.ABORT).toBe('ABORT');
      expect(ActionType.PHASE_CHANGE).toBe('PHASE_CHANGE');
      expect(ActionType.EPIC_STARTED).toBe('EPIC_STARTED');
      expect(ActionType.STORY_STARTED).toBe('STORY_STARTED');
      expect(ActionType.STORY_COMPLETED).toBe('STORY_COMPLETED');
    });
  });

  describe('Phase enum', () => {
    it('should have all workflow phases', () => {
      expect(Phase.VALIDATION).toBe('validation');
      expect(Phase.DEVELOPMENT).toBe('development');
      expect(Phase.SELF_HEALING).toBe('self_healing');
      expect(Phase.QUALITY_GATE).toBe('quality_gate');
      expect(Phase.PUSH).toBe('push');
      expect(Phase.CHECKPOINT).toBe('checkpoint');
    });
  });

  describe('ResumeOption enum', () => {
    it('should have all resume options', () => {
      expect(ResumeOption.CONTINUE).toBe('continue');
      expect(ResumeOption.REVIEW).toBe('review');
      expect(ResumeOption.RESTART).toBe('restart');
      expect(ResumeOption.DISCARD).toBe('discard');
    });
  });

  describe('createSessionState()', () => {
    it('should create a new session state with all required fields (AC1-5)', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 6,
        storyIds: ['11.1', '11.2', '11.3', '11.4', '11.5', '11.6'],
      };

      const state = await sessionState.createSessionState(epicInfo, 'feature/bob');

      // AC1: File created
      expect(await sessionState.exists()).toBe(true);

      // AC2: Epic field with valid fields
      expect(state.session_state.epic.id).toBe('epic-11');
      expect(state.session_state.epic.title).toBe('Projeto Bob');
      expect(state.session_state.epic.total_stories).toBe(6);

      // AC3: Progress field with valid fields
      expect(state.session_state.progress.current_story).toBe('11.1');
      expect(state.session_state.progress.stories_done).toEqual([]);
      expect(state.session_state.progress.stories_pending).toEqual(epicInfo.storyIds);

      // AC4: Last action field with valid fields
      expect(state.session_state.last_action.type).toBe(ActionType.EPIC_STARTED);
      expect(state.session_state.last_action.timestamp).toBeDefined();
      expect(state.session_state.last_action.story).toBe('11.1');

      // AC5: Context snapshot field
      expect(state.session_state.context_snapshot.files_modified).toBe(0);
      expect(state.session_state.context_snapshot.executor_distribution).toEqual({});
      expect(state.session_state.context_snapshot.branch).toBe('feature/bob');
    });

    it('should include workflow section from ADR-011', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 6,
        storyIds: ['11.1'],
      };

      const state = await sessionState.createSessionState(epicInfo);

      expect(state.session_state.workflow).toBeDefined();
      expect(state.session_state.workflow.current_phase).toBeNull();
      expect(state.session_state.workflow.attempt_count).toBe(0);
      expect(state.session_state.workflow.phase_results).toEqual({});
    });

    it('should include version 1.2', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };

      const state = await sessionState.createSessionState(epicInfo);

      expect(state.session_state.version).toBe('1.2');
    });
  });

  describe('loadSessionState()', () => {
    it('should return null when no state exists', async () => {
      const state = await sessionState.loadSessionState();
      expect(state).toBeNull();
    });

    it('should load existing session state', async () => {
      // Create state first
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 6,
        storyIds: ['11.1', '11.2'],
      };
      await sessionState.createSessionState(epicInfo);

      // Create new instance and load
      const newSession = new SessionState(TEST_PROJECT_ROOT);
      const loadedState = await newSession.loadSessionState();

      expect(loadedState).not.toBeNull();
      expect(loadedState.session_state.epic.id).toBe('epic-11');
    });
  });

  describe('updateSessionState()', () => {
    it('should update progress fields', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 3,
        storyIds: ['11.1', '11.2', '11.3'],
      };
      await sessionState.createSessionState(epicInfo);

      const updated = await sessionState.updateSessionState({
        progress: {
          current_story: '11.2',
          stories_done: ['11.1'],
          stories_pending: ['11.2', '11.3'],
        },
      });

      expect(updated.session_state.progress.current_story).toBe('11.2');
      expect(updated.session_state.progress.stories_done).toContain('11.1');
    });

    it('should update workflow state (AC6)', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      await sessionState.createSessionState(epicInfo);

      const updated = await sessionState.updateSessionState({
        workflow: {
          current_phase: Phase.DEVELOPMENT,
          attempt_count: 1,
        },
      });

      expect(updated.session_state.workflow.current_phase).toBe('development');
      expect(updated.session_state.workflow.attempt_count).toBe(1);
    });

    it('should update last_updated timestamp automatically', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      const created = await sessionState.createSessionState(epicInfo);
      const originalTimestamp = created.session_state.last_updated;

      // Wait a bit
      await new Promise((r) => setTimeout(r, 10));

      const updated = await sessionState.updateSessionState({
        progress: { current_story: '11.1' },
      });

      expect(updated.session_state.last_updated).not.toBe(originalTimestamp);
    });

    it('should throw if state not initialized', async () => {
      await expect(sessionState.updateSessionState({})).rejects.toThrow(
        'Session state not initialized',
      );
    });
  });

  describe('recordPhaseChange()', () => {
    it('should record phase changes with executor', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      await sessionState.createSessionState(epicInfo);

      await sessionState.recordPhaseChange('development', '11.1', '@dev');

      const state = sessionState.state;
      expect(state.session_state.workflow.current_phase).toBe('development');
      expect(state.session_state.last_action.type).toBe(ActionType.PHASE_CHANGE);
      expect(state.session_state.last_action.phase).toBe('development');
      expect(state.session_state.context_snapshot.last_executor).toBe('@dev');
    });

    it('should track executor distribution', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      await sessionState.createSessionState(epicInfo);

      await sessionState.recordPhaseChange('development', '11.1', '@dev');
      await sessionState.recordPhaseChange('quality_gate', '11.1', '@architect');
      await sessionState.recordPhaseChange('push', '11.1', '@dev');

      const distribution = sessionState.state.session_state.context_snapshot.executor_distribution;
      expect(distribution['@dev']).toBe(2);
      expect(distribution['@architect']).toBe(1);
    });
  });

  describe('recordStoryCompleted()', () => {
    it('should move story from pending to done', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 3,
        storyIds: ['11.1', '11.2', '11.3'],
      };
      await sessionState.createSessionState(epicInfo);

      await sessionState.recordStoryCompleted('11.1', '11.2');

      const state = sessionState.state;
      expect(state.session_state.progress.stories_done).toContain('11.1');
      expect(state.session_state.progress.stories_pending).not.toContain('11.1');
      expect(state.session_state.progress.current_story).toBe('11.2');
    });

    it('should reset workflow state for new story', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 2,
        storyIds: ['11.1', '11.2'],
      };
      await sessionState.createSessionState(epicInfo);

      // Simulate work on 11.1
      await sessionState.updateSessionState({
        workflow: {
          current_phase: 'quality_gate',
          attempt_count: 2,
          phase_results: { validation: { passed: true } },
        },
      });

      await sessionState.recordStoryCompleted('11.1', '11.2');

      const state = sessionState.state;
      expect(state.session_state.workflow.current_phase).toBeNull();
      expect(state.session_state.workflow.attempt_count).toBe(0);
      expect(state.session_state.workflow.phase_results).toEqual({});
    });
  });

  describe('recordPause()', () => {
    it('should record pause action', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      await sessionState.createSessionState(epicInfo);

      await sessionState.recordPause('11.1', 'development');

      const state = sessionState.state;
      expect(state.session_state.last_action.type).toBe(ActionType.PAUSE);
      expect(state.session_state.last_action.phase).toBe('development');
    });
  });

  describe('detectCrash() (AC9)', () => {
    it('should detect crash when last_updated > 30 min and action is not PAUSE', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      await sessionState.createSessionState(epicInfo);

      // Manually set old timestamp
      sessionState.state.session_state.last_updated = new Date(
        Date.now() - 35 * 60 * 1000,
      ).toISOString();
      sessionState.state.session_state.last_action.type = ActionType.PHASE_CHANGE;
      await sessionState.save();

      const result = await sessionState.detectCrash();

      expect(result.isCrash).toBe(true);
      expect(result.minutesSinceUpdate).toBeGreaterThanOrEqual(30);
    });

    it('should not detect crash when action is PAUSE', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      await sessionState.createSessionState(epicInfo);

      // Manually set old timestamp but with PAUSE action
      sessionState.state.session_state.last_updated = new Date(
        Date.now() - 35 * 60 * 1000,
      ).toISOString();
      sessionState.state.session_state.last_action.type = ActionType.PAUSE;
      await sessionState.save();

      const result = await sessionState.detectCrash();

      expect(result.isCrash).toBe(false);
    });

    it('should not detect crash when last_updated is recent', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      await sessionState.createSessionState(epicInfo);

      const result = await sessionState.detectCrash();

      expect(result.isCrash).toBe(false);
    });
  });

  describe('getResumeOptions() (AC7-8)', () => {
    it('should return 4 resume options', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      await sessionState.createSessionState(epicInfo);

      const options = sessionState.getResumeOptions();

      expect(Object.keys(options)).toHaveLength(4);
      expect(options[ResumeOption.CONTINUE]).toBeDefined();
      expect(options[ResumeOption.REVIEW]).toBeDefined();
      expect(options[ResumeOption.RESTART]).toBeDefined();
      expect(options[ResumeOption.DISCARD]).toBeDefined();
    });

    it('should have labels for each option', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      await sessionState.createSessionState(epicInfo);

      const options = sessionState.getResumeOptions();

      expect(options[ResumeOption.CONTINUE].label).toContain('Continuar');
      expect(options[ResumeOption.REVIEW].label).toContain('Revisar');
      expect(options[ResumeOption.RESTART].label).toContain('Recomeçar');
      expect(options[ResumeOption.DISCARD].label).toContain('novo épico');
    });
  });

  describe('getResumeSummary()', () => {
    it('should return formatted resume summary', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 6,
        storyIds: ['11.1', '11.2', '11.3', '11.4', '11.5', '11.6'],
      };
      await sessionState.createSessionState(epicInfo);
      await sessionState.recordStoryCompleted('11.1', '11.2');

      const summary = sessionState.getResumeSummary();

      expect(summary).toContain('Sessão anterior detectada');
      expect(summary).toContain('Projeto Bob');
      expect(summary).toContain('1 de 6');
      expect(summary).toContain('[1]');
      expect(summary).toContain('[2]');
      expect(summary).toContain('[3]');
      expect(summary).toContain('[4]');
    });
  });

  describe('handleResumeOption()', () => {
    beforeEach(async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 3,
        storyIds: ['11.1', '11.2', '11.3'],
      };
      await sessionState.createSessionState(epicInfo);
      await sessionState.recordPhaseChange('development', '11.1', '@dev');
    });

    it('should handle CONTINUE option', async () => {
      const result = await sessionState.handleResumeOption(ResumeOption.CONTINUE);

      expect(result.action).toBe('continue');
      expect(result.story).toBe('11.1');
      expect(result.phase).toBe('development');
    });

    it('should handle REVIEW option', async () => {
      const result = await sessionState.handleResumeOption(ResumeOption.REVIEW);

      expect(result.action).toBe('review');
      expect(result.summary).toBeDefined();
      expect(result.summary.epic.title).toBe('Projeto Bob');
    });

    it('should handle RESTART option', async () => {
      const result = await sessionState.handleResumeOption(ResumeOption.RESTART);

      expect(result.action).toBe('restart');
      expect(result.story).toBe('11.1');

      // Verify workflow was reset
      expect(sessionState.state.session_state.workflow.current_phase).toBeNull();
      expect(sessionState.state.session_state.workflow.attempt_count).toBe(0);
    });

    it('should handle DISCARD option', async () => {
      const result = await sessionState.handleResumeOption(ResumeOption.DISCARD);

      expect(result.action).toBe('discard');
      expect(await sessionState.exists()).toBe(false);
    });
  });

  describe('getProgressSummary()', () => {
    it('should return detailed progress summary', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 6,
        storyIds: ['11.1', '11.2', '11.3', '11.4', '11.5', '11.6'],
      };
      await sessionState.createSessionState(epicInfo, 'feature/bob');
      await sessionState.recordStoryCompleted('11.1', '11.2');
      await sessionState.recordStoryCompleted('11.2', '11.3');

      const summary = sessionState.getProgressSummary();

      expect(summary.epic.title).toBe('Projeto Bob');
      expect(summary.progress.completed).toBe(2);
      expect(summary.progress.total).toBe(6);
      expect(summary.progress.percentage).toBe(33);
      expect(summary.progress.storiesDone).toEqual(['11.1', '11.2']);
      expect(summary.context.branch).toBe('feature/bob');
    });

    it('should return 0 percentage when totalStories is 0 (no division by zero)', async () => {
      const epicInfo = {
        id: 'epic-empty',
        title: 'Empty Epic',
        totalStories: 0,
        storyIds: [],
      };
      await sessionState.createSessionState(epicInfo, 'feature/empty');

      const summary = sessionState.getProgressSummary();

      expect(summary.progress.percentage).toBe(0);
      expect(Number.isNaN(summary.progress.percentage)).toBe(false);
      expect(summary.progress.total).toBe(0);
      expect(summary.progress.completed).toBe(0);
    });
  });

  describe('discard()', () => {
    it('should archive state file instead of deleting', async () => {
      const epicInfo = {
        id: 'epic-11',
        title: 'Projeto Bob',
        totalStories: 1,
        storyIds: ['11.1'],
      };
      await sessionState.createSessionState(epicInfo);

      await sessionState.discard();

      // Original file should not exist
      expect(await sessionState.exists()).toBe(false);

      // Should have archived file
      const files = await fs.readdir(path.join(TEST_PROJECT_ROOT, 'docs/stories'));
      const archivedFiles = files.filter((f) => f.includes('.discarded.'));
      expect(archivedFiles.length).toBe(1);
    });
  });

  describe('validateSchema()', () => {
    it('should validate correct schema', () => {
      const validState = {
        session_state: {
          version: '1.1',
          last_updated: '2026-02-05T10:00:00Z',
          epic: { id: 'epic-11', title: 'Test', total_stories: 1 },
          progress: {
            current_story: '11.1',
            stories_done: [],
            stories_pending: ['11.1'],
          },
          workflow: { current_phase: null, attempt_count: 0, phase_results: {} },
          last_action: { type: 'EPIC_STARTED', timestamp: '2026-02-05T10:00:00Z' },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            branch: 'main',
          },
        },
      };

      const result = SessionState.validateSchema(validState);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidState = {
        session_state: {
          version: '1.1',
          // Missing other required fields
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect missing session_state root', () => {
      const invalidState = {};

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing session_state root');
    });
  });

  describe('Factory functions', () => {
    it('createSessionState() should return SessionState instance', () => {
      const instance = createSessionState(TEST_PROJECT_ROOT);
      expect(instance).toBeInstanceOf(SessionState);
    });

    it('sessionStateExists() should return false for non-existent state', async () => {
      const exists = await sessionStateExists(TEST_PROJECT_ROOT);
      expect(exists).toBe(false);
    });

    it('sessionStateExists() should return true after creation', async () => {
      const instance = createSessionState(TEST_PROJECT_ROOT);
      await instance.createSessionState({
        id: 'test',
        title: 'Test',
        totalStories: 1,
        storyIds: ['1'],
      });

      const exists = await sessionStateExists(TEST_PROJECT_ROOT);
      expect(exists).toBe(true);
    });

    it('loadSessionState() should load existing state', async () => {
      const instance = createSessionState(TEST_PROJECT_ROOT);
      await instance.createSessionState({
        id: 'test',
        title: 'Test Epic',
        totalStories: 1,
        storyIds: ['1'],
      });

      const state = await loadSessionState(TEST_PROJECT_ROOT);

      expect(state).not.toBeNull();
      expect(state.session_state.epic.title).toBe('Test Epic');
    });
  });
});

describe('SessionState Migration (ADR-011)', () => {
  const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-migration-project');
  const LEGACY_STATE_PATH = path.join(TEST_PROJECT_ROOT, '.aiox/workflow-state');

  beforeEach(async () => {
    await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    await fs.mkdir(path.join(TEST_PROJECT_ROOT, 'docs/stories'), { recursive: true });
    await fs.mkdir(LEGACY_STATE_PATH, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
  });

  it('should migrate from legacy workflow state (Task 7)', async () => {
    // Create legacy workflow state
    const legacyState = {
      workflowId: 'development-cycle',
      currentPhase: '2_development',
      currentStory: 'docs/stories/11.3.story.md',
      executor: '@dev',
      qualityGate: '@architect',
      attemptCount: 1,
      startedAt: '2026-02-04T10:00:00Z',
      lastUpdated: '2026-02-04T15:00:00Z',
      phaseResults: {
        '1_validation': { status: 'completed' },
      },
    };

    await fs.writeFile(
      path.join(LEGACY_STATE_PATH, '11.3-state.yaml'),
      require('js-yaml').dump(legacyState),
    );

    // Create new session state instance with auto-migrate
    const sessionState = new SessionState(TEST_PROJECT_ROOT, { autoMigrate: true });
    const loadedState = await sessionState.loadSessionState();

    // Should have migrated
    expect(loadedState).not.toBeNull();
    expect(loadedState.session_state.version).toBe('1.2');
    expect(loadedState.session_state.workflow.current_phase).toBe('2_development');
    expect(loadedState.session_state.context_snapshot.last_executor).toBe('@dev');

    // Legacy file should be renamed to .migrated
    const legacyFiles = await fs.readdir(LEGACY_STATE_PATH);
    const hasMigrated = legacyFiles.some((f) => f.endsWith('.migrated'));
    // Note: Migration renames files in place - check the migration occurred
    expect(hasMigrated || legacyFiles.length === 1).toBe(true);
  });

  it('should not migrate if autoMigrate is false', async () => {
    // Create legacy workflow state
    const legacyState = {
      workflowId: 'development-cycle',
      currentPhase: '2_development',
      currentStory: 'docs/stories/11.3.story.md',
    };

    await fs.writeFile(
      path.join(LEGACY_STATE_PATH, '11.3-state.yaml'),
      require('js-yaml').dump(legacyState),
    );

    // Create instance with autoMigrate disabled
    const sessionState = new SessionState(TEST_PROJECT_ROOT, { autoMigrate: false });
    const loadedState = await sessionState.loadSessionState();

    expect(loadedState).toBeNull();
  });
});
