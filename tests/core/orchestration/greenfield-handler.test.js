/**
 * Tests for GreenfieldHandler - Story 12.13
 *
 * Epic 12: Bob Full Integration — Completando o PRD v2.0
 *
 * Test coverage:
 * - AC1: Greenfield detection (no package.json, .git, docs/)
 * - AC2-5: 4-phase orchestration
 * - AC6-10: Epic 11 module integration
 * - AC11-14: Surface decisions between phases with PAUSE/resume
 * - AC15-17: Error handling and idempotency
 *
 * @jest-environment node
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Module under test
const {
  GreenfieldHandler,
  GreenfieldPhase,
  PhaseFailureAction,
  DEFAULT_GREENFIELD_INDICATORS,
  PHASE_1_SEQUENCE,
} = require('../../../.aiox-core/core/orchestration/greenfield-handler');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TEST SETUP
// ═══════════════════════════════════════════════════════════════════════════════════

const TEST_PROJECT_ROOT = '/tmp/test-greenfield-project';

// Mock fs module
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

// Mock terminal-spawner
const mockTerminalSpawner = {
  isSpawnerAvailable: jest.fn().mockReturnValue(false),
  spawnAgent: jest.fn().mockResolvedValue({ success: true, pid: 1234 }),
};
jest.mock('../../../.aiox-core/core/orchestration/terminal-spawner', () => mockTerminalSpawner);

// Mock dependencies
const mockWorkflowExecutor = {
  executeWorkflow: jest.fn(),
  execute: jest.fn(),
};

const mockSurfaceChecker = {
  shouldSurface: jest.fn(),
};

const mockSessionState = {
  exists: jest.fn(),
  loadSessionState: jest.fn(),
  recordPhaseChange: jest.fn(),
  updateSessionState: jest.fn(),
};

describe('GreenfieldHandler', () => {
  let handler;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    fs.existsSync.mockReturnValue(false); // Greenfield = nothing exists
    mockSurfaceChecker.shouldSurface.mockReturnValue({ should_surface: true });
    mockSessionState.exists.mockResolvedValue(false);

    // Reset terminal spawner mock to defaults
    mockTerminalSpawner.isSpawnerAvailable.mockReturnValue(false);
    mockTerminalSpawner.spawnAgent.mockResolvedValue({ success: true, pid: 1234 });

    handler = new GreenfieldHandler(TEST_PROJECT_ROOT, {
      debug: false,
      workflowExecutor: mockWorkflowExecutor,
      surfaceChecker: mockSurfaceChecker,
      sessionState: mockSessionState,
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              CONSTRUCTOR TESTS
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('constructor', () => {
    test('should throw error if projectRoot is not provided', () => {
      expect(() => new GreenfieldHandler()).toThrow('projectRoot is required');
    });

    test('should throw error if projectRoot is not a string', () => {
      expect(() => new GreenfieldHandler(123)).toThrow('projectRoot is required and must be a string');
    });

    test('should initialize with correct defaults', () => {
      const h = new GreenfieldHandler(TEST_PROJECT_ROOT);
      expect(h.projectRoot).toBe(TEST_PROJECT_ROOT);
      expect(h.options.debug).toBe(false);
      expect(h.indicators).toEqual(DEFAULT_GREENFIELD_INDICATORS);
    });

    test('should accept custom indicators', () => {
      const customIndicators = ['package.json', '.git'];
      const h = new GreenfieldHandler(TEST_PROJECT_ROOT, { indicators: customIndicators });
      expect(h.indicators).toEqual(customIndicators);
    });

    test('should accept injected dependencies', () => {
      const h = new GreenfieldHandler(TEST_PROJECT_ROOT, {
        workflowExecutor: mockWorkflowExecutor,
        surfaceChecker: mockSurfaceChecker,
        sessionState: mockSessionState,
      });
      expect(h._workflowExecutor).toBe(mockWorkflowExecutor);
      expect(h._surfaceChecker).toBe(mockSurfaceChecker);
      expect(h._sessionState).toBe(mockSessionState);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              GREENFIELD DETECTION (AC1, AC16)
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('isGreenfield (AC1)', () => {
    test('should return true when NO indicators exist', () => {
      fs.existsSync.mockReturnValue(false);
      expect(handler.isGreenfield()).toBe(true);
    });

    test('should return false when package.json exists', () => {
      fs.existsSync.mockImplementation((p) => {
        return p.endsWith('package.json');
      });
      expect(handler.isGreenfield()).toBe(false);
    });

    test('should return false when .git exists', () => {
      fs.existsSync.mockImplementation((p) => {
        return p.endsWith('.git');
      });
      expect(handler.isGreenfield()).toBe(false);
    });

    test('should return false when docs/ exists', () => {
      fs.existsSync.mockImplementation((p) => {
        // Handle both Unix (docs/) and Windows (docs\) path separators
        return p.endsWith(`docs${path.sep}`);
      });
      expect(handler.isGreenfield()).toBe(false);
    });

    test('should return false when ALL indicators exist', () => {
      fs.existsSync.mockReturnValue(true);
      expect(handler.isGreenfield()).toBe(false);
    });

    test('should accept custom project path', () => {
      fs.existsSync.mockReturnValue(false);
      const customPath = path.join('/custom', 'path');
      expect(handler.isGreenfield(customPath)).toBe(true);
      // Verify existsSync was called with the custom path (platform-agnostic)
      expect(fs.existsSync).toHaveBeenCalled();
      const calls = fs.existsSync.mock.calls.map(c => c[0]);
      const hasCustomPath = calls.some(c => c.includes('custom') && c.includes('path'));
      expect(hasCustomPath).toBe(true);
    });

    test('should use custom indicators when configured', () => {
      const h = new GreenfieldHandler(TEST_PROJECT_ROOT, {
        indicators: ['custom-file.txt'],
      });
      fs.existsSync.mockReturnValue(false);
      expect(h.isGreenfield()).toBe(true);
    });
  });

  describe('shouldSkipBootstrap (AC16)', () => {
    test('should return true when both package.json and .git exist', () => {
      fs.existsSync.mockImplementation((p) => {
        return p.endsWith('package.json') || p.endsWith('.git');
      });
      expect(handler.shouldSkipBootstrap()).toBe(true);
    });

    test('should return false when only package.json exists', () => {
      fs.existsSync.mockImplementation((p) => {
        return p.endsWith('package.json');
      });
      expect(handler.shouldSkipBootstrap()).toBe(false);
    });

    test('should return false when only .git exists', () => {
      fs.existsSync.mockImplementation((p) => {
        return p.endsWith('.git');
      });
      expect(handler.shouldSkipBootstrap()).toBe(false);
    });

    test('should return false when neither exists', () => {
      fs.existsSync.mockReturnValue(false);
      expect(handler.shouldSkipBootstrap()).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              PHASE ORCHESTRATION (AC2-5)
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('handle (main entry)', () => {
    test('should start from Phase 0 when nothing exists (not skippable)', async () => {
      fs.existsSync.mockReturnValue(false); // Nothing exists
      const result = await handler.handle({});

      // Should surface between Phase 0 → 1 (after bootstrap succeeds or returns manual)
      expect(result.action).toBe('greenfield_surface');
      expect(result.phase).toBe(GreenfieldPhase.BOOTSTRAP);
      expect(result.nextPhase).toBe(1);
    });

    test('should skip Phase 0 when package.json + .git exist (AC16)', async () => {
      fs.existsSync.mockImplementation((p) => {
        return p.endsWith('package.json') || p.endsWith('.git');
      });

      const result = await handler.handle({});

      // Should start Phase 1 (Discovery) directly
      expect(result.action).toBe('greenfield_surface');
      expect(result.phase).toBe(GreenfieldPhase.DISCOVERY);
    });

    test('should resume from specified phase', async () => {
      const result = await handler.handle({ resumeFromPhase: 2 });

      // Should start Phase 2 (Sharding)
      expect(result.action).toBe('greenfield_surface');
      expect(result.phase).toBe(GreenfieldPhase.SHARDING);
    });
  });

  describe('Phase 0: Bootstrap (AC2)', () => {
    test('should return surface prompt after bootstrap', async () => {
      const result = await handler._executePhase0({});

      expect(result.action).toBe('greenfield_surface');
      expect(result.phase).toBe(GreenfieldPhase.BOOTSTRAP);
      expect(result.nextPhase).toBe(1);
      expect(result.data.message).toContain('Descreva o que quer construir');
      expect(result.data.promptType).toBe('text_input');
    });

    test('should emit phaseStart and phaseComplete events', async () => {
      const events = [];
      handler.on('phaseStart', (e) => events.push({ type: 'start', ...e }));
      handler.on('phaseComplete', (e) => events.push({ type: 'complete', ...e }));

      await handler._executePhase0({});

      expect(events.some((e) => e.type === 'start' && e.phase === GreenfieldPhase.BOOTSTRAP)).toBe(true);
      expect(events.some((e) => e.type === 'complete' && e.phase === GreenfieldPhase.BOOTSTRAP)).toBe(true);
    });
  });

  describe('Phase 1: Discovery (AC3)', () => {
    test('should return surface prompt after discovery', async () => {
      const result = await handler._executePhase1({});

      expect(result.action).toBe('greenfield_surface');
      expect(result.phase).toBe(GreenfieldPhase.DISCOVERY);
      expect(result.nextPhase).toBe(2);
      expect(result.data.promptType).toBe('go_pause');
    });

    test('should include artifacts summary in surface message', async () => {
      const result = await handler._executePhase1({});

      expect(result.data.message).toContain('Artefatos de planejamento criados');
    });

    test('should return failure on agent error', async () => {
      // Make terminal spawner fail for first agent
      mockTerminalSpawner.isSpawnerAvailable.mockReturnValue(true);
      mockTerminalSpawner.spawnAgent.mockResolvedValue({ success: false, error: 'Agent failed' });

      const result = await handler._executePhase1({});

      expect(result.action).toBe('greenfield_phase_failure');
      expect(result.options).toHaveLength(3);
      expect(result.options[0].action).toBe('retry');
    });
  });

  describe('Phase 2: Sharding (AC4)', () => {
    test('should return surface prompt after sharding', async () => {
      const result = await handler._executePhase2({});

      expect(result.action).toBe('greenfield_surface');
      expect(result.phase).toBe(GreenfieldPhase.SHARDING);
      expect(result.nextPhase).toBe(3);
      expect(result.data.promptType).toBe('go_pause');
    });
  });

  describe('Phase 3: Dev Cycle (AC5)', () => {
    test('should return dev cycle handoff', async () => {
      const result = await handler._executePhase3({});

      expect(result.action).toBe('greenfield_dev_cycle');
      expect(result.phase).toBe(GreenfieldPhase.DEV_CYCLE);
      expect(result.data.nextStep).toBe('development_cycle');
      expect(result.data.handoff).toContain('@sm');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              SURFACE DECISIONS (AC11-14)
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('handleSurfaceDecision (AC11-14)', () => {
    test('should continue to next phase on GO', async () => {
      const result = await handler.handleSurfaceDecision('GO', 2, {});

      expect(result.action).toBe('greenfield_surface');
      expect(result.phase).toBe(GreenfieldPhase.SHARDING);
    });

    test('should save state on PAUSE (AC14)', async () => {
      mockSessionState.exists.mockResolvedValue(true);
      mockSessionState.loadSessionState.mockResolvedValue({});

      const result = await handler.handleSurfaceDecision('PAUSE', 2, {});

      expect(result.action).toBe('greenfield_paused');
      expect(result.data.savedPhase).toBe(2);
    });

    test('should pass text input as userGoal', async () => {
      const result = await handler.handleSurfaceDecision(
        'Quero um app de e-commerce',
        1,
        {},
      );

      // Should proceed to Phase 1 with userGoal in context
      expect(result.action).toBe('greenfield_surface');
    });

    test('should handle case-insensitive decisions', async () => {
      const result = await handler.handleSurfaceDecision('go', 3, {});

      expect(result.action).toBe('greenfield_dev_cycle');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              ERROR HANDLING (AC15)
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('handlePhaseFailureAction (AC15)', () => {
    test('should retry phase on RETRY', async () => {
      const result = await handler.handlePhaseFailureAction(
        GreenfieldPhase.BOOTSTRAP,
        PhaseFailureAction.RETRY,
        {},
      );

      // Should re-execute Phase 0
      expect(result.action).toBe('greenfield_surface');
      expect(result.phase).toBe(GreenfieldPhase.BOOTSTRAP);
    });

    test('should skip to next phase on SKIP', async () => {
      const result = await handler.handlePhaseFailureAction(
        GreenfieldPhase.BOOTSTRAP,
        PhaseFailureAction.SKIP,
        {},
      );

      // Should skip to Phase 1
      expect(result.action).toBe('greenfield_surface');
      expect(result.phase).toBe(GreenfieldPhase.DISCOVERY);
    });

    test('should abort workflow on ABORT', async () => {
      const result = await handler.handlePhaseFailureAction(
        GreenfieldPhase.BOOTSTRAP,
        PhaseFailureAction.ABORT,
        {},
      );

      expect(result.action).toBe('greenfield_aborted');
      expect(result.data.lastPhase).toBe(GreenfieldPhase.BOOTSTRAP);
    });

    test('should handle invalid action', async () => {
      const result = await handler.handlePhaseFailureAction(
        GreenfieldPhase.BOOTSTRAP,
        'invalid',
        {},
      );

      expect(result.action).toBe('invalid_action');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              IDEMPOTENCY (AC17)
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('checkIdempotency (AC17)', () => {
    test('should detect existing artifact', () => {
      fs.existsSync.mockReturnValue(true);

      const result = handler.checkIdempotency('docs/prd.md');

      expect(result.exists).toBe(true);
      expect(result.action).toBe('update');
    });

    test('should detect new artifact', () => {
      fs.existsSync.mockReturnValue(false);

      const result = handler.checkIdempotency('docs/prd.md');

      expect(result.exists).toBe(false);
      expect(result.action).toBe('create');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              CONSTANTS
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('Constants', () => {
    test('should export correct phases', () => {
      expect(GreenfieldPhase.DETECTION).toBe('detection');
      expect(GreenfieldPhase.BOOTSTRAP).toBe('phase_0_bootstrap');
      expect(GreenfieldPhase.DISCOVERY).toBe('phase_1_discovery');
      expect(GreenfieldPhase.SHARDING).toBe('phase_2_sharding');
      expect(GreenfieldPhase.DEV_CYCLE).toBe('phase_3_dev_cycle');
      expect(GreenfieldPhase.COMPLETE).toBe('complete');
    });

    test('should export correct failure actions', () => {
      expect(PhaseFailureAction.RETRY).toBe('retry');
      expect(PhaseFailureAction.SKIP).toBe('skip');
      expect(PhaseFailureAction.ABORT).toBe('abort');
    });

    test('should have 5 default indicators', () => {
      expect(DEFAULT_GREENFIELD_INDICATORS).toHaveLength(5);
      expect(DEFAULT_GREENFIELD_INDICATORS).toContain('package.json');
      expect(DEFAULT_GREENFIELD_INDICATORS).toContain('.git');
      expect(DEFAULT_GREENFIELD_INDICATORS).toContain('docs/');
    });

    test('should have 5 agents in Phase 1 sequence', () => {
      expect(PHASE_1_SEQUENCE).toHaveLength(5);
      expect(PHASE_1_SEQUENCE[0].agent).toBe('@analyst');
      expect(PHASE_1_SEQUENCE[4].agent).toBe('@po');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              SESSION STATE (AC9)
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('Session state recording (AC9)', () => {
    test('should record phase when session exists', async () => {
      mockSessionState.exists.mockResolvedValue(true);
      mockSessionState.loadSessionState.mockResolvedValue({});

      await handler._recordPhase(GreenfieldPhase.BOOTSTRAP, {});

      expect(mockSessionState.recordPhaseChange).toHaveBeenCalledWith(
        'greenfield_phase_0_bootstrap',
        'greenfield-fullstack',
        '@pm',
      );
    });

    test('should not fail when session does not exist', async () => {
      mockSessionState.exists.mockResolvedValue(false);

      // Should not throw
      await handler._recordPhase(GreenfieldPhase.BOOTSTRAP, {});
      expect(mockSessionState.recordPhaseChange).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('Helper methods', () => {
    test('_getPhaseEnum should map phase numbers', () => {
      expect(handler._getPhaseEnum(0)).toBe(GreenfieldPhase.BOOTSTRAP);
      expect(handler._getPhaseEnum(1)).toBe(GreenfieldPhase.DISCOVERY);
      expect(handler._getPhaseEnum(2)).toBe(GreenfieldPhase.SHARDING);
      expect(handler._getPhaseEnum(3)).toBe(GreenfieldPhase.DEV_CYCLE);
      expect(handler._getPhaseEnum(99)).toBe(GreenfieldPhase.DETECTION);
    });

    test('_getPhaseNumber should parse phase strings', () => {
      expect(handler._getPhaseNumber('phase_0_bootstrap')).toBe(0);
      expect(handler._getPhaseNumber('phase_1_discovery')).toBe(1);
      expect(handler._getPhaseNumber('phase_2_sharding')).toBe(2);
      expect(handler._getPhaseNumber('phase_3_dev_cycle')).toBe(3);
      expect(handler._getPhaseNumber('unknown')).toBe(-1);
    });

    test('_buildArtifactsSummary should format step results', () => {
      const steps = [
        { agent: '@analyst', creates: 'docs/brief.md', success: true },
        { agent: '@pm', creates: 'docs/prd.md', success: true },
        { agent: '@po', creates: null, success: true },
      ];

      const summary = handler._buildArtifactsSummary(steps);

      expect(summary).toContain('docs/brief.md');
      expect(summary).toContain('@analyst');
      expect(summary).toContain('docs/prd.md');
      expect(summary).not.toContain('@po'); // null creates filtered out
    });
  });
});
