/**
 * Tests for BrownfieldHandler - Story 12.8
 *
 * Epic 12: Bob Full Integration — Completando o PRD v2.0
 *
 * Test coverage:
 * - AC1: Detection of first execution (EXISTING_NO_DOCS state)
 * - AC2: Welcome conversation with time estimate
 * - AC3: Workflow execution via WorkflowExecutor
 * - AC4: Output generation (system-architecture.md, TECHNICAL-DEBT-REPORT.md)
 * - AC5: Post-discovery flow (resolve debts vs add feature)
 * - AC6: Idempotent re-execution
 *
 * @jest-environment node
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Module under test
const {
  BrownfieldHandler,
  BrownfieldPhase,
  PostDiscoveryChoice,
  PhaseFailureAction,
} = require('../../../.aiox-core/core/orchestration/brownfield-handler');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TEST SETUP
// ═══════════════════════════════════════════════════════════════════════════════════

const TEST_PROJECT_ROOT = '/tmp/test-brownfield-project';

// Mock fs module
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

// Mock dependencies
const mockWorkflowExecutor = {
  executeWorkflow: jest.fn(),
};

const mockSurfaceChecker = {
  shouldSurface: jest.fn(),
};

const mockSessionState = {
  exists: jest.fn(),
  loadSessionState: jest.fn(),
  recordPhaseChange: jest.fn(),
};

describe('BrownfieldHandler', () => {
  let handler;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('# Test content');
    mockSurfaceChecker.shouldSurface.mockReturnValue({ should_surface: true });
    mockSessionState.exists.mockResolvedValue(false);

    handler = new BrownfieldHandler(TEST_PROJECT_ROOT, {
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
      expect(() => new BrownfieldHandler()).toThrow('projectRoot is required');
    });

    test('should throw error if projectRoot is not a string', () => {
      expect(() => new BrownfieldHandler(123)).toThrow('projectRoot is required and must be a string');
    });

    test('should initialize with correct defaults', () => {
      const h = new BrownfieldHandler(TEST_PROJECT_ROOT);
      expect(h.projectRoot).toBe(TEST_PROJECT_ROOT);
      expect(h.options.debug).toBe(false);
    });

    test('should accept custom options', () => {
      const h = new BrownfieldHandler(TEST_PROJECT_ROOT, { debug: true });
      expect(h.options.debug).toBe(true);
    });

    test('should set correct workflow path', () => {
      expect(handler.workflowPath).toBe(
        path.join(TEST_PROJECT_ROOT, '.aiox-core/development/workflows/brownfield-discovery.yaml'),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              AC1: FIRST EXECUTION DETECTION
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('AC1: First execution detection', () => {
    test('handle() should present welcome message on first execution', async () => {
      const result = await handler.handle({});

      expect(result.action).toBe('brownfield_welcome');
      expect(result.phase).toBe(BrownfieldPhase.WELCOME);
      expect(result.data.message).toContain('primeira vez');
      expect(result.data.timeEstimate).toBe('4-8 horas');
    });

    test('handle() should include accept/decline options', async () => {
      const result = await handler.handle({});

      expect(result.data.options).toEqual(['accept', 'decline']);
    });

    test('handle() should use SurfaceChecker for decision surfacing', async () => {
      await handler.handle({});

      expect(mockSurfaceChecker.shouldSurface).toHaveBeenCalledWith({
        valid_options_count: 2,
        options_with_tradeoffs: expect.stringContaining('4-8 horas'),
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              AC2: WELCOME CONVERSATION
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('AC2: Welcome conversation', () => {
    test('welcome message should match PRD §3.2 format', async () => {
      const result = await handler.handle({});

      expect(result.data.message).toContain('Bem-vindo');
      expect(result.data.message).toContain('primeira vez');
      expect(result.data.message).toContain('4-8 horas');
    });

    test('handleUserDecision(true) should proceed to discovery', async () => {
      mockWorkflowExecutor.executeWorkflow.mockResolvedValue({ success: true });

      const result = await handler.handleUserDecision(true, {});

      expect(result.action).toBe('brownfield_complete');
    });

    test('handleUserDecision(false) should skip to defaults', async () => {
      const result = await handler.handleUserDecision(false, {});

      expect(result.action).toBe('brownfield_declined');
      expect(result.data.nextStep).toBe('existing_project_defaults');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              AC3: WORKFLOW EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('AC3: Workflow execution', () => {
    test('should execute brownfield-discovery.yaml via WorkflowExecutor', async () => {
      mockWorkflowExecutor.executeWorkflow.mockResolvedValue({ success: true });

      await handler.handleUserDecision(true, {});

      expect(mockWorkflowExecutor.executeWorkflow).toHaveBeenCalledWith(
        handler.workflowPath,
        expect.objectContaining({
          projectRoot: TEST_PROJECT_ROOT,
        }),
      );
    });

    test('should pass tech stack context to workflow', async () => {
      mockWorkflowExecutor.executeWorkflow.mockResolvedValue({ success: true });
      const techStack = { framework: 'React', database: 'Supabase' };

      await handler.handleUserDecision(true, { techStack });

      expect(mockWorkflowExecutor.executeWorkflow).toHaveBeenCalledWith(
        handler.workflowPath,
        expect.objectContaining({
          techStack,
        }),
      );
    });

    test('should handle workflow execution error', async () => {
      mockWorkflowExecutor.executeWorkflow.mockRejectedValue(new Error('Workflow failed'));

      const result = await handler.handleUserDecision(true, {});

      expect(result.action).toBe('brownfield_error');
      expect(result.error).toContain('Workflow failed');
    });

    test('should handle missing workflow file', async () => {
      fs.existsSync.mockReturnValue(false);

      const result = await handler.handleUserDecision(true, {});

      expect(result.action).toBe('brownfield_error');
      expect(result.error).toContain('Workflow file not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              AC3 Task 3.5: PHASE FAILURE HANDLING
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('AC3 Task 3.5: Phase failure handling', () => {
    test('handlePhaseFailureAction(RETRY) should return retry instruction', async () => {
      const result = await handler.handlePhaseFailureAction(
        'system_documentation',
        PhaseFailureAction.RETRY,
        {},
      );

      expect(result.action).toBe('retry_phase');
      expect(result.phase).toBe('system_documentation');
    });

    test('handlePhaseFailureAction(SKIP) should mark phase as skipped', async () => {
      const result = await handler.handlePhaseFailureAction(
        'database_documentation',
        PhaseFailureAction.SKIP,
        {},
      );

      expect(result.action).toBe('skip_phase');
      expect(handler.phaseProgress['database_documentation'].status).toBe('skipped');
    });

    test('handlePhaseFailureAction(ABORT) should cancel discovery', async () => {
      const result = await handler.handlePhaseFailureAction(
        'frontend_documentation',
        PhaseFailureAction.ABORT,
        {},
      );

      expect(result.action).toBe('brownfield_aborted');
      expect(result.data.lastPhase).toBe('frontend_documentation');
    });

    test('should reject invalid failure action', async () => {
      const result = await handler.handlePhaseFailureAction(
        'system_documentation',
        'invalid_action',
        {},
      );

      expect(result.action).toBe('invalid_action');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              AC4: OUTPUT VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('AC4: Output validation', () => {
    beforeEach(() => {
      mockWorkflowExecutor.executeWorkflow.mockResolvedValue({ success: true });
    });

    test('should reference system-architecture.md in outputs', async () => {
      const result = await handler.handleUserDecision(true, {});

      expect(result.data.outputs.systemArchitecture).toBe('docs/architecture/system-architecture.md');
    });

    test('should reference TECHNICAL-DEBT-REPORT.md in outputs', async () => {
      const result = await handler.handleUserDecision(true, {});

      expect(result.data.outputs.technicalDebtReport).toBe('docs/reports/TECHNICAL-DEBT-REPORT.md');
    });

    test('should build summary from generated files', async () => {
      fs.existsSync.mockImplementation((p) => {
        if (p.includes('system-architecture.md')) return true;
        if (p.includes('TECHNICAL-DEBT-REPORT.md')) return true;
        return true;
      });

      fs.readFileSync.mockImplementation((p) => {
        if (p.includes('TECHNICAL-DEBT-REPORT.md')) {
          return `
            # Technical Debt Report
            Custo Estimado: R$ 45.000
            Database: 3 issues
          `;
        }
        return '# System Architecture';
      });

      const result = await handler.handleUserDecision(true, {});

      expect(result.data.summary).toBeDefined();
      expect(result.data.summary.indicators.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              AC5: POST-DISCOVERY FLOW
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('AC5: Post-discovery flow', () => {
    beforeEach(() => {
      mockWorkflowExecutor.executeWorkflow.mockResolvedValue({ success: true });
    });

    test('discovery complete should present next step options', async () => {
      const result = await handler.handleUserDecision(true, {});

      expect(result.data.options).toEqual([
        { choice: PostDiscoveryChoice.RESOLVE_DEBTS, label: '1. Resolver débitos técnicos' },
        { choice: PostDiscoveryChoice.ADD_FEATURE, label: '2. Adicionar feature nova' },
      ]);
    });

    test('handle(RESOLVE_DEBTS) should route to debt resolution', async () => {
      const result = await handler.handle({ postDiscoveryChoice: PostDiscoveryChoice.RESOLVE_DEBTS });

      expect(result.action).toBe('route_to_debt_resolution');
      expect(result.data.taskPath).toContain('brownfield-create-epic.md');
    });

    test('handle(ADD_FEATURE) should route to enhancement workflow', async () => {
      const result = await handler.handle({ postDiscoveryChoice: PostDiscoveryChoice.ADD_FEATURE });

      expect(result.action).toBe('route_to_enhancement');
      expect(result.data.nextStep).toBe('existing_project_enhancement');
    });

    test('should reject invalid post-discovery choice', async () => {
      const result = await handler.handle({ postDiscoveryChoice: 'invalid_choice' });

      expect(result.action).toBe('invalid_choice');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              AC6: IDEMPOTENCY
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('AC6: Idempotency', () => {
    test('checkIdempotency should detect existing file', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('existing content');

      const result = handler.checkIdempotency('docs/architecture/system-architecture.md');

      expect(result.exists).toBe(true);
      expect(result.existingContent).toBe('existing content');
    });

    test('checkIdempotency should handle non-existing file', () => {
      fs.existsSync.mockReturnValue(false);

      const result = handler.checkIdempotency('docs/architecture/system-architecture.md');

      expect(result.exists).toBe(false);
      expect(result.existingContent).toBe(null);
    });

    test('writeOutputIdempotent should use writeFileSync (overwrite)', () => {
      fs.existsSync.mockReturnValue(true);

      handler.writeOutputIdempotent('docs/test.md', 'new content');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(TEST_PROJECT_ROOT, 'docs/test.md'),
        'new content',
        'utf8',
      );
    });

    test('writeOutputIdempotent should create directory if needed', () => {
      fs.existsSync.mockReturnValue(false);

      handler.writeOutputIdempotent('docs/new/test.md', 'content');

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(TEST_PROJECT_ROOT, 'docs/new'),
        { recursive: true },
      );
    });

    test('re-execution should update existing files, not duplicate', async () => {
      fs.existsSync.mockReturnValue(true);
      mockWorkflowExecutor.executeWorkflow.mockResolvedValue({ success: true });

      // First execution
      await handler.handleUserDecision(true, {});

      // Second execution (re-run)
      await handler.handleUserDecision(true, {});

      // Both executions should call the same workflow
      expect(mockWorkflowExecutor.executeWorkflow).toHaveBeenCalledTimes(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              SESSION STATE TRACKING (Task 3.4)
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('Task 3.4: Session state tracking', () => {
    test('should record phase progress in session state', async () => {
      mockSessionState.exists.mockResolvedValue(true);
      mockWorkflowExecutor.executeWorkflow.mockResolvedValue({ success: true });

      await handler.handleUserDecision(true, {});

      expect(mockSessionState.recordPhaseChange).toHaveBeenCalled();
    });

    test('should handle missing session state gracefully', async () => {
      mockSessionState.exists.mockResolvedValue(false);
      mockWorkflowExecutor.executeWorkflow.mockResolvedValue({ success: true });

      // Should not throw
      await expect(handler.handleUserDecision(true, {})).resolves.toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              EDGE CASES (Task 6.6)
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('Task 6.6: Edge cases', () => {
    test('should handle workflow cancelled by user', async () => {
      mockWorkflowExecutor.executeWorkflow.mockResolvedValue({
        success: false,
        cancelled: true,
      });

      const result = await handler.handleUserDecision(true, {});

      expect(result.action).toBe('brownfield_failed');
    });

    test('should handle session resume in middle of brownfield', async () => {
      // Simulate resuming with userAccepted already true
      mockWorkflowExecutor.executeWorkflow.mockResolvedValue({ success: true });

      const result = await handler.handle({ userAccepted: true });

      // Should skip welcome and go directly to discovery
      expect(result.action).toBe('brownfield_complete');
    });

    test('should emit events during phase execution', async () => {
      const phaseStartHandler = jest.fn();
      const phaseCompleteHandler = jest.fn();

      handler.on('phaseStart', phaseStartHandler);
      handler.on('phaseComplete', phaseCompleteHandler);

      // Simulate phase callbacks
      await handler._onPhaseStart('test_phase', {});
      await handler._onPhaseComplete('test_phase', { output: 'test' }, {});

      expect(phaseStartHandler).toHaveBeenCalled();
      expect(phaseCompleteHandler).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              ENUMS AND CONSTANTS
  // ═══════════════════════════════════════════════════════════════════════════════════

  describe('Enums and constants', () => {
    test('BrownfieldPhase should have all expected values', () => {
      expect(BrownfieldPhase.WELCOME).toBe('welcome');
      expect(BrownfieldPhase.SYSTEM_DOCUMENTATION).toBe('system_documentation');
      expect(BrownfieldPhase.DATABASE_DOCUMENTATION).toBe('database_documentation');
      expect(BrownfieldPhase.FRONTEND_DOCUMENTATION).toBe('frontend_documentation');
      expect(BrownfieldPhase.COMPLETE).toBe('complete');
    });

    test('PostDiscoveryChoice should have expected values', () => {
      expect(PostDiscoveryChoice.RESOLVE_DEBTS).toBe('resolve_debts');
      expect(PostDiscoveryChoice.ADD_FEATURE).toBe('add_feature');
    });

    test('PhaseFailureAction should have expected values', () => {
      expect(PhaseFailureAction.RETRY).toBe('retry');
      expect(PhaseFailureAction.SKIP).toBe('skip');
      expect(PhaseFailureAction.ABORT).toBe('abort');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              INTEGRATION WITH BOB-ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════════

describe('BrownfieldHandler integration with BobOrchestrator', () => {
  // These tests verify the handler integrates correctly with bob-orchestrator
  // by testing the expected interface and return values

  test('handle() return value should be compatible with BobOrchestrator routing', async () => {
    const handler = new BrownfieldHandler(TEST_PROJECT_ROOT, {
      surfaceChecker: mockSurfaceChecker,
    });

    const result = await handler.handle({});

    // BobOrchestrator expects { action, data } format
    expect(result).toHaveProperty('action');
    expect(result).toHaveProperty('data');
    expect(typeof result.action).toBe('string');
  });

  test('handleUserDecision() should return routing-compatible result', async () => {
    mockWorkflowExecutor.executeWorkflow.mockResolvedValue({ success: true });

    const handler = new BrownfieldHandler(TEST_PROJECT_ROOT, {
      workflowExecutor: mockWorkflowExecutor,
      surfaceChecker: mockSurfaceChecker,
    });

    const result = await handler.handleUserDecision(true, {});

    expect(result).toHaveProperty('action');
    expect(['brownfield_complete', 'brownfield_error', 'brownfield_failed']).toContain(result.action);
  });
});
