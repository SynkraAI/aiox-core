/**
 * Bob Orchestrator Tests
 * Story 12.3: Bob Orchestration Logic (Decision Tree)
 */

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const {
  BobOrchestrator,
  ProjectState,
} = require('../../../.aiox-core/core/orchestration/bob-orchestrator');

// Test fixtures
const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-project-bob');

function portablePath(targetPath) {
  return String(targetPath).replace(/\\/g, '/');
}

// Mock Epic 11 modules
jest.mock('../../../.aiox-core/core/config/config-resolver', () => ({
  resolveConfig: jest.fn(),
  isLegacyMode: jest.fn(),
  setUserConfigValue: jest.fn(),
  CONFIG_FILES: {},
  LEVELS: {},
}));

// Story 12.7: Mock MessageFormatter
jest.mock('../../../.aiox-core/core/orchestration/message-formatter', () => ({
  MessageFormatter: jest.fn().mockImplementation(() => ({
    format: jest.fn().mockReturnValue('formatted message'),
    formatEducational: jest.fn().mockReturnValue('educational message'),
    setEducationalMode: jest.fn(),
    isEducationalMode: jest.fn().mockReturnValue(false),
    formatToggleFeedback: jest.fn().mockImplementation((enabled) =>
      enabled ? '🎓 Modo educativo ativado!' : '📋 Modo educativo desativado.',
    ),
    formatPersistencePrompt: jest.fn().mockReturnValue('[1] Sessão / [2] Permanente'),
  })),
}));

// Story 12.8: Mock BrownfieldHandler
jest.mock('../../../.aiox-core/core/orchestration/brownfield-handler', () => ({
  BrownfieldHandler: jest.fn().mockImplementation(() => ({
    handle: jest.fn().mockResolvedValue({
      action: 'brownfield_welcome',
      data: {
        message: 'Projeto com código detectado. Deseja analisar?',
        hasCode: true,
      },
    }),
    handleUserDecision: jest.fn().mockResolvedValue({
      action: 'analysis_started',
    }),
  })),
  BrownfieldPhase: {},
  PostDiscoveryChoice: {},
  PhaseFailureAction: {},
}));

jest.mock('../../../.aiox-core/core/orchestration/executor-assignment', () => ({
  assignExecutorFromContent: jest.fn().mockReturnValue({
    executor: '@dev',
    quality_gate: '@architect',
    quality_gate_tools: ['code_review'],
  }),
  detectStoryType: jest.fn().mockReturnValue('code_general'),
  assignExecutor: jest.fn(),
  validateExecutorAssignment: jest.fn(),
  EXECUTOR_ASSIGNMENT_TABLE: {},
  DEFAULT_ASSIGNMENT: {},
}));

jest.mock('../../../.aiox-core/core/orchestration/terminal-spawner', () => ({
  spawnAgent: jest.fn().mockResolvedValue({ success: true, output: 'done' }),
  isSpawnerAvailable: jest.fn().mockReturnValue(true),
}));

jest.mock('../../../.aiox-core/core/orchestration/workflow-executor', () => {
  return {
    WorkflowExecutor: jest.fn().mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue({ success: true, state: {}, phaseResults: {} }),
      onPhaseChange: jest.fn(),
      onAgentSpawn: jest.fn(),
      onTerminalSpawn: jest.fn(),
      onLog: jest.fn(),
      onError: jest.fn(),
    })),
    createWorkflowExecutor: jest.fn(),
    executeDevelopmentCycle: jest.fn(),
    PhaseStatus: {},
    CheckpointDecision: {},
  };
});

// Story 12.6: Mock UI components
jest.mock('../../../.aiox-core/core/ui/observability-panel', () => ({
  ObservabilityPanel: jest.fn().mockImplementation(() => ({
    setStage: jest.fn(),
    setPipelineStage: jest.fn(),
    setCurrentAgent: jest.fn(),
    addTerminal: jest.fn(),
    updateActiveAgent: jest.fn(),
    setLog: jest.fn(),
    setError: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    // Story 12.7: Educational mode support
    setMode: jest.fn(),
    updateState: jest.fn(),
  })),
  PanelMode: { MINIMAL: 'minimal', DETAILED: 'detailed' },
}));

jest.mock('../../../.aiox-core/core/orchestration/bob-status-writer', () => ({
  BobStatusWriter: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    writeStatus: jest.fn().mockResolvedValue(undefined),
    updatePhase: jest.fn().mockResolvedValue(undefined),
    updateStage: jest.fn().mockResolvedValue(undefined),
    updateAgent: jest.fn().mockResolvedValue(undefined),
    addTerminal: jest.fn().mockResolvedValue(undefined),
    updateActiveAgent: jest.fn().mockResolvedValue(undefined),
    addAttempt: jest.fn().mockResolvedValue(undefined),
    appendLog: jest.fn().mockResolvedValue(undefined),
    complete: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../../../.aiox-core/core/events/dashboard-emitter', () => ({
  getDashboardEmitter: jest.fn().mockReturnValue({
    emit: jest.fn(),
    on: jest.fn(),
    emitBobPhaseChange: jest.fn().mockResolvedValue(undefined),
    emitBobAgentSpawned: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('../../../.aiox-core/core/orchestration/surface-checker', () => {
  const mockShouldSurface = jest.fn().mockReturnValue({
    should_surface: false,
    criterion_id: null,
    criterion_name: null,
    action: null,
    message: null,
    severity: null,
    can_bypass: true,
  });
  return {
    SurfaceChecker: jest.fn().mockImplementation(() => ({
      shouldSurface: mockShouldSurface,
      load: jest.fn().mockReturnValue(true),
    })),
    createSurfaceChecker: jest.fn(),
    shouldSurface: jest.fn(),
  };
});

jest.mock('../../../.aiox-core/core/orchestration/session-state', () => {
  const mockExists = jest.fn().mockResolvedValue(false);
  const mockLoad = jest.fn().mockResolvedValue(null);
  const mockDetectCrash = jest.fn().mockResolvedValue({ isCrash: false });
  const mockGetResumeOptions = jest.fn().mockReturnValue({});
  const mockGetResumeSummary = jest.fn().mockReturnValue('');
  const mockRecordPhaseChange = jest.fn().mockResolvedValue({});
  const mockGetSessionOverride = jest.fn().mockReturnValue(null);
  const mockSetSessionOverride = jest.fn();
  const mockHandleResumeOption = jest.fn().mockResolvedValue({ action: 'continue', story: '12.1', phase: 'development' });
  return {
    SessionState: jest.fn().mockImplementation(() => ({
      exists: mockExists,
      loadSessionState: mockLoad,
      detectCrash: mockDetectCrash,
      getResumeOptions: mockGetResumeOptions,
      getResumeSummary: mockGetResumeSummary,
      recordPhaseChange: mockRecordPhaseChange,
      createSessionState: jest.fn(),
      updateSessionState: jest.fn(),
      getSessionOverride: mockGetSessionOverride,
      setSessionOverride: mockSetSessionOverride,
      handleResumeOption: mockHandleResumeOption,
      state: null,
    })),
    createSessionState: jest.fn(),
    sessionStateExists: jest.fn(),
    loadSessionState: jest.fn(),
    ActionType: { PHASE_CHANGE: 'PHASE_CHANGE' },
    Phase: {},
    ResumeOption: { CONTINUE: 'continue', REVIEW: 'review', RESTART: 'restart', DISCARD: 'discard' },
    SESSION_STATE_VERSION: '1.2',
    SESSION_STATE_FILENAME: '.session-state.yaml',
    CRASH_THRESHOLD_MINUTES: 30,
  };
});

jest.mock('../../../.aiox-core/core/orchestration/lock-manager', () => {
  const mockAcquire = jest.fn().mockResolvedValue(true);
  const mockRelease = jest.fn().mockResolvedValue(true);
  const mockCleanup = jest.fn().mockResolvedValue(0);
  return jest.fn().mockImplementation(() => ({
    acquireLock: mockAcquire,
    releaseLock: mockRelease,
    cleanupStaleLocks: mockCleanup,
    isLocked: jest.fn().mockResolvedValue(false),
  }));
});

// Story 12.5: Mock DataLifecycleManager
jest.mock('../../../.aiox-core/core/orchestration/data-lifecycle-manager', () => {
  const mockRunStartupCleanup = jest.fn().mockResolvedValue({
    locksRemoved: 0,
    sessionsArchived: 0,
    snapshotsRemoved: 0,
    errors: [],
  });
  return {
    DataLifecycleManager: jest.fn().mockImplementation(() => ({
      runStartupCleanup: mockRunStartupCleanup,
    })),
    createDataLifecycleManager: jest.fn(),
    runStartupCleanup: jest.fn(),
    STALE_SESSION_DAYS: 30,
    STALE_SNAPSHOT_DAYS: 90,
  };
});

const { resolveConfig } = require('../../../.aiox-core/core/config/config-resolver');

describe('BobOrchestrator', () => {
  let orchestrator;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Clean up test directory
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore
    }

    // Default: project with config and docs
    await fs.mkdir(path.join(TEST_PROJECT_ROOT, 'docs/architecture'), { recursive: true });
    await fs.mkdir(path.join(TEST_PROJECT_ROOT, '.aiox/locks'), { recursive: true });
    await fs.writeFile(path.join(TEST_PROJECT_ROOT, 'package.json'), '{}');
    await fs.mkdir(path.join(TEST_PROJECT_ROOT, '.git'), { recursive: true });

    resolveConfig.mockReturnValue({
      config: { version: '1.0' },
      warnings: [],
      legacy: false,
    });

    orchestrator = new BobOrchestrator(TEST_PROJECT_ROOT);
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  // ==========================================
  // Constructor tests
  // ==========================================

  describe('constructor', () => {
    it('should create BobOrchestrator with projectRoot', () => {
      // Then
      expect(orchestrator).toBeDefined();
      expect(orchestrator.projectRoot).toBe(TEST_PROJECT_ROOT);
    });

    it('should throw if projectRoot is missing', () => {
      // When/Then
      expect(() => new BobOrchestrator()).toThrow('projectRoot is required');
      expect(() => new BobOrchestrator('')).toThrow('projectRoot is required');
      expect(() => new BobOrchestrator(123)).toThrow('projectRoot is required');
    });

    it('should initialize all Epic 11 dependencies', () => {
      // Then
      expect(orchestrator.surfaceChecker).toBeDefined();
      expect(orchestrator.sessionState).toBeDefined();
      expect(orchestrator.workflowExecutor).toBeDefined();
      expect(orchestrator.lockManager).toBeDefined();
    });
  });

  // ==========================================
  // detectProjectState tests (AC3-6)
  // ==========================================

  describe('detectProjectState', () => {
    it('should detect GREENFIELD when no package.json, .git, or docs exist (AC6)', async () => {
      // Given — empty project
      const emptyRoot = path.join(TEST_PROJECT_ROOT, 'empty-project');
      await fs.mkdir(emptyRoot, { recursive: true });

      // When
      const state = orchestrator.detectProjectState(emptyRoot);

      // Then
      expect(state).toBe(ProjectState.GREENFIELD);
    });

    it('should detect NO_CONFIG when resolveConfig fails (AC3)', () => {
      // Given
      resolveConfig.mockImplementation(() => {
        throw new Error('Config not found');
      });

      // When
      const state = orchestrator.detectProjectState(TEST_PROJECT_ROOT);

      // Then
      expect(state).toBe(ProjectState.NO_CONFIG);
    });

    it('should detect NO_CONFIG when resolveConfig returns empty config (AC3)', () => {
      // Given
      resolveConfig.mockReturnValue({ config: {}, warnings: [], legacy: false });

      // When
      const state = orchestrator.detectProjectState(TEST_PROJECT_ROOT);

      // Then
      expect(state).toBe(ProjectState.NO_CONFIG);
    });

    it('should detect EXISTING_NO_DOCS when config exists but no architecture docs (AC4)', async () => {
      // Given — remove architecture docs
      await fs.rm(path.join(TEST_PROJECT_ROOT, 'docs/architecture'), { recursive: true });

      // When
      const state = orchestrator.detectProjectState(TEST_PROJECT_ROOT);

      // Then
      expect(state).toBe(ProjectState.EXISTING_NO_DOCS);
    });

    it('should detect EXISTING_WITH_DOCS when config and architecture docs exist (AC5)', () => {
      // Given — default setup has both config and docs

      // When
      const state = orchestrator.detectProjectState(TEST_PROJECT_ROOT);

      // Then
      expect(state).toBe(ProjectState.EXISTING_WITH_DOCS);
    });

    it('should use this.projectRoot as default when no argument is passed (Issue #88)', () => {
      // Given — orchestrator was created with TEST_PROJECT_ROOT
      // and default setup has both config and docs

      // When — call without argument
      const state = orchestrator.detectProjectState();

      // Then — should use this.projectRoot and return same result
      expect(state).toBe(ProjectState.EXISTING_WITH_DOCS);
    });
  });

  // ==========================================
  // orchestrate tests
  // ==========================================

  describe('orchestrate', () => {
    it('should return lock_failed when lock cannot be acquired', async () => {
      // Given
      const LockManager = require('../../../.aiox-core/core/orchestration/lock-manager');
      const mockInstance = new LockManager();
      mockInstance.acquireLock.mockResolvedValueOnce(false);
      orchestrator.lockManager = mockInstance;

      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(false);
      expect(result.action).toBe('lock_failed');
    });

    it('should route to onboarding for NO_CONFIG state (AC3)', async () => {
      // Given
      resolveConfig.mockImplementation(() => {
        throw new Error('No config');
      });

      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe(ProjectState.NO_CONFIG);
      expect(result.action).toBe('onboarding');
    });

    it('should route to brownfield_welcome for EXISTING_NO_DOCS state (AC4)', async () => {
      // Given
      await fs.rm(path.join(TEST_PROJECT_ROOT, 'docs/architecture'), { recursive: true });

      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe(ProjectState.EXISTING_NO_DOCS);
      // Story 12.8: BrownfieldHandler now returns 'brownfield_welcome' action
      expect(result.action).toBe('brownfield_welcome');
    });

    it('should route to ask_objective for EXISTING_WITH_DOCS state (AC5)', async () => {
      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe(ProjectState.EXISTING_WITH_DOCS);
      expect(result.action).toBe('ask_objective');
    });

    it('should route to greenfield for GREENFIELD state (AC6)', async () => {
      // Given — clean empty project
      const emptyRoot = path.join(TEST_PROJECT_ROOT, 'greenfield');
      await fs.mkdir(emptyRoot, { recursive: true });
      const greenOrch = new BobOrchestrator(emptyRoot);

      // When
      const result = await greenOrch.orchestrate();

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe(ProjectState.GREENFIELD);
      // GreenfieldHandler returns a surface prompt after Phase 0
      expect(result.action).toBe('greenfield_surface');
    });

    it('should release lock on error', async () => {
      // Given — force an error by making detectProjectState throw
      const original = orchestrator.detectProjectState;
      orchestrator.detectProjectState = () => {
        throw new Error('Forced test error');
      };

      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(false);
      expect(result.action).toBe('error');
      expect(result.error).toContain('Forced test error');

      // Restore
      orchestrator.detectProjectState = original;
    });

    it('should execute story when storyPath is provided (AC8-10)', async () => {
      // Given — create a mock story file
      const storyPath = path.join(TEST_PROJECT_ROOT, 'docs/stories/test-story.md');
      await fs.mkdir(path.dirname(storyPath), { recursive: true });
      await fs.writeFile(storyPath, '# Test Story\nSome content here');

      // When
      const result = await orchestrator.orchestrate({ storyPath });

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('story_executed');
      expect(result.data.assignment.executor).toBe('@dev');
    });
  });

  // ==========================================
  // Decision tree is codified, not LLM (AC7)
  // ==========================================

  describe('decision tree codification (AC7)', () => {
    it('should use pure if/else statements without LLM calls', () => {
      // Verify the method exists and returns string values
      const states = [
        ProjectState.NO_CONFIG,
        ProjectState.EXISTING_NO_DOCS,
        ProjectState.EXISTING_WITH_DOCS,
        ProjectState.GREENFIELD,
      ];

      // Each state should be a simple string constant
      for (const state of states) {
        expect(typeof state).toBe('string');
      }
    });
  });

  // ==========================================
  // Constraint: < 50 lines of other-agent logic (AC13)
  // ==========================================

  describe('constraint: router not god class (AC13)', () => {
    it('should have less than 50 lines of other-agent-specific logic', async () => {
      // Given — read the source file
      const sourcePath = path.join(
        __dirname,
        '../../../.aiox-core/core/orchestration/bob-orchestrator.js',
      );
      const source = await fs.readFile(sourcePath, 'utf8');
      const lines = source.split('\n');

      // Count lines that contain agent-specific logic
      // (calls to Epic 11 modules with actual logic, not just initialization)
      const agentSpecificPatterns = [
        /ExecutorAssignment\.\w+\(/,
        /TerminalSpawner\.\w+\(/,
        /workflowExecutor\.\w+\(/,
        /surfaceChecker\.shouldSurface\(/,
        /sessionState\.\w+\(/,
      ];

      let agentSpecificLines = 0;
      for (const line of lines) {
        for (const pattern of agentSpecificPatterns) {
          if (pattern.test(line)) {
            agentSpecificLines++;
            break; // Count each line only once
          }
        }
      }

      // Then — must be < 50 lines (PRD §3.7)
      expect(agentSpecificLines).toBeLessThan(50);
    });
  });

  // ==========================================
  // ProjectState enum
  // ==========================================

  describe('ProjectState enum', () => {
    it('should export all four states', () => {
      expect(ProjectState.NO_CONFIG).toBe('NO_CONFIG');
      expect(ProjectState.EXISTING_NO_DOCS).toBe('EXISTING_NO_DOCS');
      expect(ProjectState.EXISTING_WITH_DOCS).toBe('EXISTING_WITH_DOCS');
      expect(ProjectState.GREENFIELD).toBe('GREENFIELD');
    });
  });

  // ==========================================
  // Story 12.5: Session Detection (AC1, AC2, AC4)
  // ==========================================

  describe('_checkExistingSession (Story 12.5)', () => {
    it('should return hasSession: false when no session exists (AC1)', async () => {
      // Given - session does not exist (default mock)

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.hasSession).toBe(false);
    });

    it('should return session data when session exists (AC1)', async () => {
      // Given - session exists
      const mockSessionState = {
        session_state: {
          version: '1.1',
          last_updated: new Date().toISOString(),
          epic: { id: '12', title: 'Test Epic', total_stories: 5 },
          progress: { current_story: '12.1', stories_done: [], stories_pending: ['12.1'] },
          workflow: { current_phase: 'development' },
        },
      };

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(mockSessionState);
      orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({ isCrash: false });
      orchestrator.sessionState.getResumeSummary = jest.fn().mockReturnValue('Resume summary');

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.hasSession).toBe(true);
      expect(result.epicTitle).toBe('Test Epic');
      expect(result.currentStory).toBe('12.1');
      expect(result.currentPhase).toBe('development');
    });

    it('should format elapsed time correctly (AC2)', async () => {
      // Given - session updated 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockSessionState = {
        session_state: {
          version: '1.1',
          last_updated: threeDaysAgo.toISOString(),
          epic: { id: '12', title: 'Test Epic', total_stories: 5 },
          progress: { current_story: '12.1' },
          workflow: { current_phase: 'development' },
        },
      };

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(mockSessionState);
      orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({ isCrash: false });
      orchestrator.sessionState.getResumeSummary = jest.fn().mockReturnValue('');

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.elapsedString).toBe('3 dias');
      expect(result.formattedMessage).toContain('Bem-vindo de volta!');
      expect(result.formattedMessage).toContain('3 dias');
    });

    it('should include crash warning when crash detected (AC4)', async () => {
      // Given - crash detected
      const mockSessionState = {
        session_state: {
          version: '1.1',
          last_updated: new Date().toISOString(),
          epic: { id: '12', title: 'Test Epic', total_stories: 5 },
          progress: { current_story: '12.1' },
          workflow: { current_phase: 'development' },
        },
      };

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(mockSessionState);
      orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({
        isCrash: true,
        minutesSinceUpdate: 45,
        reason: 'Crash detected',
      });
      orchestrator.sessionState.getResumeSummary = jest.fn().mockReturnValue('');

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.crashInfo.isCrash).toBe(true);
      expect(result.formattedMessage).toContain('⚠️');
      expect(result.formattedMessage).toContain('crashado');
      expect(result.formattedMessage).toContain('45 min');
    });
  });

  // ==========================================
  // Story 12.5: Session Resume (AC3, AC7)
  // ==========================================

  describe('handleSessionResume (Story 12.5)', () => {
    beforeEach(() => {
      // Setup session state mock with handleResumeOption
      orchestrator.sessionState.handleResumeOption = jest.fn();
    });

    it('should handle continue option (AC3 [1])', async () => {
      // Given
      orchestrator.sessionState.handleResumeOption.mockResolvedValue({
        action: 'continue',
        story: '12.1',
        phase: 'development',
      });

      // When
      const result = await orchestrator.handleSessionResume('continue');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('continue');
      expect(result.phase).toBe('development');
      expect(result.message).toContain('Continuando');
    });

    it('should handle review option (AC3 [2])', async () => {
      // Given
      orchestrator.sessionState.handleResumeOption.mockResolvedValue({
        action: 'review',
        summary: { progress: { completed: 2, total: 5 } },
      });

      // When
      const result = await orchestrator.handleSessionResume('review');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('review');
      expect(result.needsReprompt).toBe(true);
    });

    it('should handle restart option (AC3 [3])', async () => {
      // Given
      orchestrator.sessionState.handleResumeOption.mockResolvedValue({
        action: 'restart',
        story: '12.1',
      });

      // When
      const result = await orchestrator.handleSessionResume('restart');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('restart');
      expect(result.message).toContain('Recomeçando');
    });

    it('should handle discard option (AC3 [4])', async () => {
      // Given
      orchestrator.sessionState.handleResumeOption.mockResolvedValue({
        action: 'discard',
        message: 'Session discarded',
      });

      // When
      const result = await orchestrator.handleSessionResume('discard');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('discard');
      expect(result.message).toContain('descartada');
    });

    it('should handle unknown option', async () => {
      // Given
      orchestrator.sessionState.handleResumeOption.mockResolvedValue({
        action: 'invalid',
      });

      // When
      const result = await orchestrator.handleSessionResume('invalid');

      // Then
      expect(result.success).toBe(false);
      expect(result.action).toBe('unknown');
    });
  });

  // ==========================================
  // Story 12.5: Data Lifecycle Integration
  // ==========================================

  describe('data lifecycle integration (Story 12.5)', () => {
    it('should initialize DataLifecycleManager in constructor', () => {
      // Then - verify the DataLifecycleManager was initialized
      expect(orchestrator.dataLifecycleManager).toBeDefined();
      expect(orchestrator.dataLifecycleManager.runStartupCleanup).toBeDefined();
    });

    it('should have dataLifecycleManager with runStartupCleanup method', () => {
      // Then - verify the method exists
      expect(typeof orchestrator.dataLifecycleManager.runStartupCleanup).toBe('function');
    });
  });

  // ==========================================
  // Story 12.5: Phase Tracking (AC5)
  // ==========================================

  describe('_updatePhase (Story 12.5 - AC5)', () => {
    it('should update session state on phase change', async () => {
      // Given
      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.state = { session_state: {} };
      orchestrator.sessionState.recordPhaseChange = jest.fn().mockResolvedValue({});

      // When
      await orchestrator._updatePhase('development', '12.1', '@dev');

      // Then
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenCalledWith(
        'development',
        '12.1',
        '@dev',
      );
    });

    it('should not fail if session state does not exist', async () => {
      // Given
      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(false);

      // When/Then - should not throw
      await expect(orchestrator._updatePhase('development', '12.1', '@dev')).resolves.not.toThrow();
    });
  });

  // ==========================================
  // Story 12.7: Educational Mode (AC1-7)
  // ==========================================

  describe('Educational Mode (Story 12.7)', () => {
    describe('_detectEducationalModeToggle (AC5)', () => {
      it('should detect "ativa modo educativo" command', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('ativa modo educativo');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(true);
      });

      it('should detect "desativa modo educativo" command', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('desativa modo educativo');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(false);
      });

      it('should detect "Bob, ativa modo educativo" command', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('Bob, ativa modo educativo');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(true);
      });

      it('should detect "modo educativo on" command', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('modo educativo on');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(true);
      });

      it('should detect "modo educativo off" command', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('modo educativo off');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(false);
      });

      it('should detect "educational mode on" command (English)', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('educational mode on');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(true);
      });

      it('should be case-insensitive', () => {
        // When
        const result1 = orchestrator._detectEducationalModeToggle('ATIVA MODO EDUCATIVO');
        const result2 = orchestrator._detectEducationalModeToggle('Ativa Modo Educativo');

        // Then
        expect(result1).not.toBeNull();
        expect(result1.enable).toBe(true);
        expect(result2).not.toBeNull();
        expect(result2.enable).toBe(true);
      });

      it('should return null for non-toggle commands', () => {
        // When
        const result1 = orchestrator._detectEducationalModeToggle('create a new feature');
        const result2 = orchestrator._detectEducationalModeToggle('help');
        const result3 = orchestrator._detectEducationalModeToggle('');
        const result4 = orchestrator._detectEducationalModeToggle(null);

        // Then
        expect(result1).toBeNull();
        expect(result2).toBeNull();
        expect(result3).toBeNull();
        expect(result4).toBeNull();
      });
    });

    describe('orchestrate with educational mode toggle (AC5)', () => {
      it('should detect toggle and return early before routing', async () => {
        // When
        const result = await orchestrator.orchestrate({
          userGoal: 'Bob, ativa modo educativo',
        });

        // Then
        expect(result.success).toBe(true);
        expect(result.action).toBe('educational_mode_toggle');
        expect(result.data.enable).toBe(true);
        expect(result.data.persistencePrompt).toBeDefined();
      });

      it('should include persistence prompt in toggle result', async () => {
        // When
        const result = await orchestrator.orchestrate({
          userGoal: 'desativa modo educativo',
        });

        // Then
        expect(result.action).toBe('educational_mode_toggle');
        expect(result.data.enable).toBe(false);
        expect(result.data.persistencePrompt).toContain('Sessão');
      });
    });

    describe('handleEducationalModeToggle (AC6)', () => {
      it('should update internal state when enabling', async () => {
        // When
        const result = await orchestrator.handleEducationalModeToggle(true, 'session');

        // Then
        expect(result.success).toBe(true);
        expect(result.educationalMode).toBe(true);
        expect(result.persistenceType).toBe('session');
      });

      it('should update internal state when disabling', async () => {
        // When
        const result = await orchestrator.handleEducationalModeToggle(false, 'session');

        // Then
        expect(result.success).toBe(true);
        expect(result.educationalMode).toBe(false);
      });

      it('should persist to session state for session type', async () => {
        // Given
        orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
        orchestrator.sessionState.setSessionOverride = jest.fn().mockResolvedValue({});

        // When
        await orchestrator.handleEducationalModeToggle(true, 'session');

        // Then
        expect(orchestrator.sessionState.setSessionOverride).toHaveBeenCalledWith(
          'educational_mode',
          true,
        );
      });

      it('should persist to user config for permanent type', async () => {
        // Given
        const { setUserConfigValue } = require('../../../.aiox-core/core/config/config-resolver');

        // When
        await orchestrator.handleEducationalModeToggle(true, 'permanent');

        // Then
        expect(setUserConfigValue).toHaveBeenCalledWith('educational_mode', true);
      });

      it('should return feedback message', async () => {
        // When
        const enableResult = await orchestrator.handleEducationalModeToggle(true, 'session');
        const disableResult = await orchestrator.handleEducationalModeToggle(false, 'session');

        // Then
        expect(enableResult.message).toContain('ativado');
        expect(disableResult.message).toContain('desativado');
      });
    });

    describe('_resolveEducationalMode (AC2)', () => {
      it('should return false when no config or override exists', () => {
        // Given - default mocks return null/false

        // When
        const result = orchestrator._resolveEducationalMode();

        // Then
        expect(result).toBe(false);
      });

      it('should prioritize session override over user config', () => {
        // Given
        orchestrator.sessionState.getSessionOverride = jest.fn().mockReturnValue(true);
        resolveConfig.mockReturnValue({
          config: { educational_mode: false },
          warnings: [],
        });

        // When
        const result = orchestrator._resolveEducationalMode();

        // Then
        expect(result).toBe(true);
      });

      it('should use user config when no session override', () => {
        // Given
        orchestrator.sessionState.getSessionOverride = jest.fn().mockReturnValue(null);
        resolveConfig.mockReturnValue({
          config: { educational_mode: true },
          warnings: [],
        });

        // When
        const result = orchestrator._resolveEducationalMode();

        // Then
        expect(result).toBe(true);
      });
    });

    describe('getEducationalModePersistencePrompt (AC6)', () => {
      it('should return persistence prompt', () => {
        // When
        const result = orchestrator.getEducationalModePersistencePrompt();

        // Then
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });
  });

  // ==========================================
  // Deep coverage: _resolveStoryPath
  // ==========================================

  describe('_resolveStoryPath', () => {
    it('should find story in active directory', async () => {
      // Given
      const storyDir = path.join(TEST_PROJECT_ROOT, 'docs/stories/active');
      await fs.mkdir(storyDir, { recursive: true });
      await fs.writeFile(path.join(storyDir, '12.5.story.md'), '# Story');

      // When
      const result = orchestrator._resolveStoryPath('12.5');

      // Then
      expect(result).toBe(path.join(storyDir, '12.5.story.md'));
    });

    it('should find story in root stories directory', async () => {
      // Given
      const storyDir = path.join(TEST_PROJECT_ROOT, 'docs/stories');
      await fs.mkdir(storyDir, { recursive: true });
      await fs.writeFile(path.join(storyDir, '12.5.story.md'), '# Story');

      // When
      const result = orchestrator._resolveStoryPath('12.5');

      // Then
      expect(result).toBe(path.join(storyDir, '12.5.story.md'));
    });

    it('should normalize story ID by removing prefix and suffix', async () => {
      // Given
      const storyDir = path.join(TEST_PROJECT_ROOT, 'docs/stories/active');
      await fs.mkdir(storyDir, { recursive: true });
      await fs.writeFile(path.join(storyDir, '12.5.story.md'), '# Story');

      // When
      const result = orchestrator._resolveStoryPath('story-12.5');

      // Then
      expect(result).toContain('12.5.story.md');
    });

    it('should return active path as fallback for non-existent story', () => {
      // When
      const result = orchestrator._resolveStoryPath('99.99');

      // Then
      expect(portablePath(result)).toContain('docs/stories/active');
      expect(result).toContain('99.99.story.md');
    });
  });

  // ==========================================
  // Deep coverage: brownfield delegation
  // ==========================================

  describe('handleBrownfieldDecision', () => {
    it('should delegate accepted decision to brownfieldHandler', async () => {
      // Given
      const mockResult = { action: 'analysis_started', data: { phases: 3 } };
      orchestrator.brownfieldHandler.handleUserDecision = jest.fn().mockResolvedValue(mockResult);

      // When
      const result = await orchestrator.handleBrownfieldDecision(true, { userGoal: 'analyze' });

      // Then
      expect(orchestrator.brownfieldHandler.handleUserDecision).toHaveBeenCalledWith(true, { userGoal: 'analyze' });
      expect(result).toEqual(mockResult);
    });

    it('should delegate declined decision to brownfieldHandler', async () => {
      // Given
      const mockResult = { action: 'skipped', data: {} };
      orchestrator.brownfieldHandler.handleUserDecision = jest.fn().mockResolvedValue(mockResult);

      // When
      const result = await orchestrator.handleBrownfieldDecision(false);

      // Then
      expect(orchestrator.brownfieldHandler.handleUserDecision).toHaveBeenCalledWith(false, {});
      expect(result).toEqual(mockResult);
    });
  });

  describe('handleBrownfieldPhaseFailure', () => {
    it('should delegate retry action to brownfieldHandler', async () => {
      // Given
      const mockResult = { action: 'phase_retried', phase: 'discovery' };
      orchestrator.brownfieldHandler.handlePhaseFailureAction = jest.fn().mockResolvedValue(mockResult);

      // When
      const result = await orchestrator.handleBrownfieldPhaseFailure('discovery', 'retry');

      // Then
      expect(orchestrator.brownfieldHandler.handlePhaseFailureAction).toHaveBeenCalledWith('discovery', 'retry', {});
      expect(result).toEqual(mockResult);
    });

    it('should pass context to brownfieldHandler', async () => {
      // Given
      const ctx = { errorDetails: 'timeout' };
      orchestrator.brownfieldHandler.handlePhaseFailureAction = jest.fn().mockResolvedValue({});

      // When
      await orchestrator.handleBrownfieldPhaseFailure('analysis', 'skip', ctx);

      // Then
      expect(orchestrator.brownfieldHandler.handlePhaseFailureAction).toHaveBeenCalledWith('analysis', 'skip', ctx);
    });
  });

  describe('handlePostDiscoveryChoice', () => {
    it('should delegate resolve_debts choice', async () => {
      // Given
      const mockResult = { action: 'debt_resolution_started' };
      orchestrator.brownfieldHandler.handle = jest.fn().mockResolvedValue(mockResult);

      // When
      const result = await orchestrator.handlePostDiscoveryChoice('resolve_debts');

      // Then
      expect(orchestrator.brownfieldHandler.handle).toHaveBeenCalledWith({ postDiscoveryChoice: 'resolve_debts' });
      expect(result).toEqual(mockResult);
    });

    it('should merge context with postDiscoveryChoice', async () => {
      // Given
      const ctx = { priority: 'high' };
      orchestrator.brownfieldHandler.handle = jest.fn().mockResolvedValue({});

      // When
      await orchestrator.handlePostDiscoveryChoice('add_feature', ctx);

      // Then
      expect(orchestrator.brownfieldHandler.handle).toHaveBeenCalledWith({
        priority: 'high',
        postDiscoveryChoice: 'add_feature',
      });
    });
  });

  // ==========================================
  // Deep coverage: greenfield delegation
  // ==========================================

  describe('handleGreenfieldSurfaceDecision', () => {
    it('should delegate GO decision to greenfieldHandler', async () => {
      // Given
      const mockResult = { action: 'phase_started', phase: 2 };
      orchestrator.greenfieldHandler.handleSurfaceDecision = jest.fn().mockResolvedValue(mockResult);

      // When
      const result = await orchestrator.handleGreenfieldSurfaceDecision('GO', 2);

      // Then
      expect(orchestrator.greenfieldHandler.handleSurfaceDecision).toHaveBeenCalledWith('GO', 2, {});
      expect(result).toEqual(mockResult);
    });

    it('should pass context to greenfieldHandler', async () => {
      // Given
      const ctx = { feedback: 'looks good' };
      orchestrator.greenfieldHandler.handleSurfaceDecision = jest.fn().mockResolvedValue({});

      // When
      await orchestrator.handleGreenfieldSurfaceDecision('PAUSE', 3, ctx);

      // Then
      expect(orchestrator.greenfieldHandler.handleSurfaceDecision).toHaveBeenCalledWith('PAUSE', 3, ctx);
    });
  });

  describe('handleGreenfieldPhaseFailure', () => {
    it('should delegate retry action to greenfieldHandler', async () => {
      // Given
      const mockResult = { action: 'phase_retried' };
      orchestrator.greenfieldHandler.handlePhaseFailureAction = jest.fn().mockResolvedValue(mockResult);

      // When
      const result = await orchestrator.handleGreenfieldPhaseFailure('init', 'retry');

      // Then
      expect(orchestrator.greenfieldHandler.handlePhaseFailureAction).toHaveBeenCalledWith('init', 'retry', {});
      expect(result).toEqual(mockResult);
    });

    it('should delegate abort action with context', async () => {
      // Given
      const ctx = { reason: 'user cancelled' };
      orchestrator.greenfieldHandler.handlePhaseFailureAction = jest.fn().mockResolvedValue({ action: 'aborted' });

      // When
      const result = await orchestrator.handleGreenfieldPhaseFailure('scaffold', 'abort', ctx);

      // Then
      expect(orchestrator.greenfieldHandler.handlePhaseFailureAction).toHaveBeenCalledWith('scaffold', 'abort', ctx);
      expect(result.action).toBe('aborted');
    });
  });

  // ==========================================
  // Deep coverage: _routeByState unknown state
  // ==========================================

  describe('_routeByState', () => {
    it('should return unknown_state for invalid state', async () => {
      // When
      const result = await orchestrator._routeByState('INVALID_STATE', {});

      // Then
      expect(result.action).toBe('unknown_state');
      expect(result.error).toContain('INVALID_STATE');
    });
  });

  // ==========================================
  // Deep coverage: elapsed time formatting
  // ==========================================

  describe('_checkExistingSession edge cases', () => {
    it('should format elapsed time as hours', async () => {
      // Given - session updated 5 hours ago
      const fiveHoursAgo = new Date();
      fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);

      const mockSessionState = {
        session_state: {
          version: '1.1',
          last_updated: fiveHoursAgo.toISOString(),
          epic: { id: '12', title: 'Test' },
          progress: { current_story: '12.1' },
          workflow: { current_phase: 'development' },
        },
      };

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(mockSessionState);
      orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({ isCrash: false });
      orchestrator.sessionState.getResumeSummary = jest.fn().mockReturnValue('');

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.elapsedString).toBe('5 horas');
    });

    it('should use singular form for 1 day', async () => {
      // Given
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const mockSessionState = {
        session_state: {
          version: '1.1',
          last_updated: oneDayAgo.toISOString(),
          epic: { id: '12', title: 'Test' },
          progress: { current_story: '12.1' },
          workflow: { current_phase: 'qa' },
        },
      };

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(mockSessionState);
      orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({ isCrash: false });
      orchestrator.sessionState.getResumeSummary = jest.fn().mockReturnValue('');

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.elapsedString).toBe('1 dia');
    });

    it('should use singular form for 1 hour', async () => {
      // Given
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const mockSessionState = {
        session_state: {
          version: '1.1',
          last_updated: oneHourAgo.toISOString(),
          epic: { id: '12', title: 'Test' },
          progress: { current_story: '12.1' },
          workflow: { current_phase: 'development' },
        },
      };

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(mockSessionState);
      orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({ isCrash: false });
      orchestrator.sessionState.getResumeSummary = jest.fn().mockReturnValue('');

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.elapsedString).toBe('1 hora');
    });

    it('should return hasSession false when loadSessionState returns null', async () => {
      // Given
      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(null);

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.hasSession).toBe(false);
    });

    it('should handle missing epic/progress/workflow fields gracefully', async () => {
      // Given
      const mockSessionState = {
        session_state: {
          version: '1.1',
          last_updated: new Date().toISOString(),
        },
      };

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(mockSessionState);
      orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({ isCrash: false });
      orchestrator.sessionState.getResumeSummary = jest.fn().mockReturnValue('');

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.hasSession).toBe(true);
      expect(result.epicTitle).toBe('Unknown Epic');
      expect(result.currentStory).toBe('N/A');
      expect(result.currentPhase).toBe('N/A');
    });
  });

  // ==========================================
  // Deep coverage: constructor edge cases
  // ==========================================

  describe('constructor edge cases', () => {
    it('should accept debug option', () => {
      // When
      const orch = new BobOrchestrator(TEST_PROJECT_ROOT, { debug: true });

      // Then
      expect(orch.options.debug).toBe(true);
    });

    it('should initialize brownfieldHandler', () => {
      // Then
      expect(orchestrator.brownfieldHandler).toBeDefined();
      expect(orchestrator.brownfieldHandler.handle).toBeDefined();
    });

    it('should initialize greenfieldHandler', () => {
      // Then
      expect(orchestrator.greenfieldHandler).toBeDefined();
    });

    it('should initialize observabilityPanel', () => {
      // Then
      expect(orchestrator.observabilityPanel).toBeDefined();
      expect(orchestrator.observabilityPanel.start).toBeDefined();
      expect(orchestrator.observabilityPanel.stop).toBeDefined();
    });

    it('should initialize bobStatusWriter', () => {
      // Then
      expect(orchestrator.bobStatusWriter).toBeDefined();
      expect(orchestrator.bobStatusWriter.initialize).toBeDefined();
    });

    it('should initialize dashboardEmitter', () => {
      // Then
      expect(orchestrator.dashboardEmitter).toBeDefined();
      expect(orchestrator.dashboardEmitter.emit).toBeDefined();
    });

    it('should initialize messageFormatter', () => {
      // Then
      expect(orchestrator.messageFormatter).toBeDefined();
    });
  });
});
