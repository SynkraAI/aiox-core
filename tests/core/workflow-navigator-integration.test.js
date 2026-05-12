/**
 * Integration Tests for WorkflowNavigator + GreetingBuilder
 *
 * Story ACT-5: WorkflowNavigator + Bob Integration
 *
 * Test Coverage:
 * - AC1: Method call fixed (suggestNextCommands, not getNextSteps)
 * - AC2: Relaxed trigger conditions (sessionType !== 'new')
 * - AC3: SessionState integration for workflow detection
 * - AC4: SurfaceChecker connection for proactive suggestions
 * - AC5: workflow-patterns.yaml Bob orchestration patterns
 * - AC6: Cross-terminal workflow continuity via session state
 * - AC7: Unit tests with various session states
 * - AC8: Workflow suggestions are contextually relevant
 */

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// Mock all external dependencies before requiring modules
jest.mock('../../.aiox-core/core/session/context-detector');
jest.mock('../../.aiox-core/infrastructure/scripts/git-config-detector');
jest.mock('../../.aiox-core/infrastructure/scripts/project-status-loader', () => ({
  loadProjectStatus: jest.fn(),
  formatStatusDisplay: jest.fn(),
}));
jest.mock('../../.aiox-core/core/config/config-resolver', () => ({
  resolveConfig: jest.fn(() => ({
    config: { user_profile: 'advanced' },
    warnings: [],
    legacy: false,
  })),
}));
jest.mock('../../.aiox-core/development/scripts/greeting-preference-manager', () => {
  return jest.fn().mockImplementation(() => ({
    getPreference: jest.fn().mockReturnValue('auto'),
    setPreference: jest.fn(),
    getConfig: jest.fn().mockReturnValue({}),
  }));
});
jest.mock('../../.aiox-core/core/permissions', () => ({
  PermissionMode: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue(undefined),
    getBadge: jest.fn().mockReturnValue('[Ask]'),
    currentMode: 'ask',
  })),
}));

// Mock SessionState
jest.mock('../../.aiox-core/core/orchestration/session-state', () => ({
  SessionState: jest.fn().mockImplementation(() => ({
    getStateFilePath: jest.fn().mockReturnValue('/mock/path/.session-state.yaml'),
    exists: jest.fn().mockResolvedValue(false),
    loadSessionState: jest.fn().mockResolvedValue(null),
  })),
  sessionStateExists: jest.fn().mockResolvedValue(false),
  createSessionState: jest.fn(),
  loadSessionState: jest.fn().mockResolvedValue(null),
}));

// Mock SurfaceChecker
jest.mock('../../.aiox-core/core/orchestration/surface-checker', () => ({
  SurfaceChecker: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockReturnValue(false),
    shouldSurface: jest.fn().mockReturnValue({
      should_surface: false,
      criterion_id: null,
      message: null,
      severity: null,
      can_bypass: true,
    }),
  })),
  createSurfaceChecker: jest.fn(),
  shouldSurface: jest.fn(),
}));

const ContextDetector = require('../../.aiox-core/core/session/context-detector');
const GitConfigDetector = require('../../.aiox-core/infrastructure/scripts/git-config-detector');
const GreetingBuilder = require('../../.aiox-core/development/scripts/greeting-builder');
const WorkflowNavigator = require('../../.aiox-core/development/scripts/workflow-navigator');
const { SessionState } = require('../../.aiox-core/core/orchestration/session-state');
const { SurfaceChecker } = require('../../.aiox-core/core/orchestration/surface-checker');

describe('WorkflowNavigator Integration (Story ACT-5)', () => {
  let builder;
  let mockAgent;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    ContextDetector.mockImplementation(() => ({
      detectSessionType: jest.fn().mockReturnValue('existing'),
    }));

    GitConfigDetector.mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({ configured: true, type: 'local', branch: 'main' }),
    }));

    // Mock fs for SessionState detection
    SessionState.mockImplementation(() => ({
      getStateFilePath: jest.fn().mockReturnValue('/mock/path/.session-state.yaml'),
      exists: jest.fn().mockResolvedValue(false),
      loadSessionState: jest.fn().mockResolvedValue(null),
    }));

    SurfaceChecker.mockImplementation(() => ({
      load: jest.fn().mockReturnValue(false),
      shouldSurface: jest.fn().mockReturnValue({
        should_surface: false,
        criterion_id: null,
        message: null,
        severity: null,
        can_bypass: true,
      }),
    }));

    mockAgent = {
      id: 'dev',
      name: 'Dex',
      icon: '\uD83D\uDCBB',
      persona_profile: {
        greeting_levels: {
          minimal: '\uD83D\uDCBB dev Agent ready',
          named: '\uD83D\uDCBB Dex (Builder) ready',
          archetypal: '\uD83D\uDCBB Dex the Builder ready!',
        },
        communication: {
          signature_closing: '-- Dex, always building',
        },
      },
      persona: {
        role: 'Expert Senior Software Engineer',
      },
      commands: [
        { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show help' },
        { name: 'develop', visibility: ['full', 'quick'], description: 'Implement story' },
        { name: 'run-tests', visibility: ['quick', 'key'], description: 'Run tests' },
      ],
    };

    builder = new GreetingBuilder();
  });

  // =========================================================================
  // AC1: Method call fixed - suggestNextCommands, not getNextSteps
  // =========================================================================
  describe('AC1: Fixed method call', () => {
    test('calls suggestNextCommands on WorkflowNavigator, not getNextSteps', () => {
      const navigator = new WorkflowNavigator();

      // Verify suggestNextCommands exists
      expect(typeof navigator.suggestNextCommands).toBe('function');

      // Verify getNextSteps does NOT exist
      expect(navigator.getNextSteps).toBeUndefined();
    });

    test('buildWorkflowSuggestions calls detectWorkflowState + suggestNextCommands', () => {
      // Spy on the navigator methods
      const detectSpy = jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue({
          workflow: 'story_development',
          state: 'validated',
          context: { story_path: 'docs/stories/test.md' },
        });
      const suggestSpy = jest.spyOn(builder.workflowNavigator, 'suggestNextCommands')
        .mockReturnValue([
          { command: '*develop-yolo docs/stories/test.md', description: 'YOLO mode' },
        ]);
      jest.spyOn(builder.workflowNavigator, 'getGreetingMessage')
        .mockReturnValue('Story validated!');
      jest.spyOn(builder.workflowNavigator, 'formatSuggestions')
        .mockReturnValue('Story validated!\n\n1. `*develop-yolo docs/stories/test.md` - YOLO mode');

      const result = builder.buildWorkflowSuggestions({
        lastCommands: ['validate-story-draft completed'],
      });

      expect(detectSpy).toHaveBeenCalledWith(
        ['validate-story-draft completed'],
        expect.any(Object),
      );
      expect(suggestSpy).toHaveBeenCalledWith({
        workflow: 'story_development',
        state: 'validated',
        context: { story_path: 'docs/stories/test.md' },
      });
      expect(result).toContain('develop-yolo');
    });
  });

  // =========================================================================
  // AC2: Relaxed trigger conditions
  // =========================================================================
  describe('AC2: Relaxed trigger conditions', () => {
    test('workflow suggestions shown for existing sessions with workflow state', async () => {
      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue({
          workflow: 'story_development',
          state: 'in_development',
          context: {},
        });
      jest.spyOn(builder.workflowNavigator, 'suggestNextCommands')
        .mockReturnValue([
          { command: '*review-qa', description: 'Run QA review' },
        ]);
      jest.spyOn(builder.workflowNavigator, 'getGreetingMessage')
        .mockReturnValue('Development complete!');
      jest.spyOn(builder.workflowNavigator, 'formatSuggestions')
        .mockReturnValue('Development complete!\n\n1. `*review-qa` - Run QA review');

      const context = {
        sessionType: 'existing',
        lastCommands: ['develop completed'],
        projectStatus: { branch: 'feat/test', modifiedFilesTotalCount: 3 },
        gitConfig: { configured: true },
        permissions: { badge: '[Ask]' },
      };

      const greeting = await builder.buildGreeting(mockAgent, context);

      // Should contain workflow suggestions since sessionType is 'existing' (not 'new')
      expect(greeting).toContain('review-qa');
    });

    test('no workflow suggestions for new sessions', async () => {
      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue({
          workflow: 'story_development',
          state: 'validated',
          context: {},
        });

      const context = {
        sessionType: 'new',
        lastCommands: ['validate-story-draft completed'],
        projectStatus: null,
        gitConfig: { configured: true },
        permissions: { badge: '[Ask]' },
      };

      const greeting = await builder.buildGreeting(mockAgent, context);

      // New sessions should NOT show workflow suggestions
      // The greeting should contain the normal presentation but not workflow nav items
      expect(greeting).not.toContain('Development complete');
    });

    test('workflow suggestions shown for workflow session type', async () => {
      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue({
          workflow: 'story_development',
          state: 'qa_reviewed',
          context: {},
        });
      jest.spyOn(builder.workflowNavigator, 'suggestNextCommands')
        .mockReturnValue([
          { command: '*apply-qa-fixes', description: 'Apply QA feedback' },
        ]);
      jest.spyOn(builder.workflowNavigator, 'getGreetingMessage')
        .mockReturnValue('QA review complete!');
      jest.spyOn(builder.workflowNavigator, 'formatSuggestions')
        .mockReturnValue('QA review complete!\n\n1. `*apply-qa-fixes` - Apply QA feedback');

      const context = {
        sessionType: 'workflow',
        lastCommands: ['review-qa completed'],
        projectStatus: { branch: 'feat/test', modifiedFilesTotalCount: 2 },
        gitConfig: { configured: true },
        permissions: { badge: '[Auto]' },
      };

      const greeting = await builder.buildGreeting(mockAgent, context);

      expect(greeting).toContain('apply-qa-fixes');
    });
  });

  // =========================================================================
  // AC3 + AC6: SessionState integration for cross-terminal workflow continuity
  // =========================================================================
  describe('AC3/AC6: SessionState integration', () => {
    test('detects active workflow from session state file', () => {
      // Mock fs.existsSync and fs.readFileSync for the session state check
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;

      const sessionStateData = {
        session_state: {
          version: '1.2',
          epic: { id: 'EPIC-ACT', title: 'Activation Pipeline', total_stories: 5 },
          progress: {
            current_story: 'ACT-5',
            stories_done: ['ACT-1', 'ACT-2'],
            stories_pending: ['ACT-5', 'ACT-6', 'ACT-7'],
          },
          workflow: {
            current_phase: 'development',
            attempt_count: 1,
          },
          last_action: {
            type: 'PHASE_CHANGE',
            story: 'ACT-5',
            phase: 'development',
          },
        },
      };

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.readFileSync = jest.fn().mockReturnValue(yaml.dump(sessionStateData));

      const result = builder.buildWorkflowSuggestions({});

      // Should detect workflow from session state and return suggestions
      expect(result).not.toBeNull();
      expect(result).toContain('ACT-5');
      expect(result).toContain('Activation Pipeline');
      expect(result).toContain('2/5');

      // Restore
      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
    });

    test('falls back to command history when no session state file', () => {
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn().mockReturnValue(false);

      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue({
          workflow: 'story_development',
          state: 'validated',
          context: {},
        });
      jest.spyOn(builder.workflowNavigator, 'suggestNextCommands')
        .mockReturnValue([
          { command: '*develop-yolo', description: 'YOLO mode' },
        ]);
      jest.spyOn(builder.workflowNavigator, 'getGreetingMessage')
        .mockReturnValue('Ready to develop!');
      jest.spyOn(builder.workflowNavigator, 'formatSuggestions')
        .mockReturnValue('Ready to develop!\n\n1. `*develop-yolo` - YOLO mode');

      const result = builder.buildWorkflowSuggestions({
        lastCommands: ['validate-story-draft completed'],
      });

      expect(result).toContain('develop-yolo');

      fs.existsSync = originalExistsSync;
    });

    test('graceful degradation when session state file is malformed', () => {
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.readFileSync = jest.fn().mockReturnValue('invalid yaml %%% not parseable');

      // Should not throw, should return null from _detectWorkflowFromSessionState
      // and fall back to command history detection
      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue(null);

      const result = builder.buildWorkflowSuggestions({ lastCommands: [] });

      // Should gracefully return null (no crash)
      expect(result).toBeNull();

      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
    });

    test('ignores session state without active workflow phase', () => {
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;

      const sessionStateData = {
        session_state: {
          version: '1.2',
          epic: { id: 'EPIC-X', title: 'Some Epic', total_stories: 3 },
          progress: {
            current_story: 'X-1',
            stories_done: [],
            stories_pending: ['X-1', 'X-2', 'X-3'],
          },
          workflow: {
            current_phase: null, // No active phase
            attempt_count: 0,
          },
        },
      };

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.readFileSync = jest.fn().mockReturnValue(yaml.dump(sessionStateData));

      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue(null);

      const result = builder.buildWorkflowSuggestions({ lastCommands: [] });

      // Should skip session state (no active phase) and fall through to command history
      // Command history also returns null, so result should be null
      expect(result).toBeNull();

      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
    });
  });

  // =========================================================================
  // AC4: SurfaceChecker proactive suggestions
  // =========================================================================
  describe('AC4: SurfaceChecker proactive suggestions', () => {
    test('enhances suggestions when surface checker detects high risk', () => {
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn().mockReturnValue(false); // No session state

      SurfaceChecker.mockImplementation(() => ({
        load: jest.fn().mockReturnValue(true),
        shouldSurface: jest.fn().mockReturnValue({
          should_surface: true,
          criterion_id: 'high_risk',
          criterion_name: 'High Risk Operation',
          message: 'This operation modifies critical files',
          severity: 'warning',
          can_bypass: true,
        }),
      }));

      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue({
          workflow: 'story_development',
          state: 'in_development',
          context: {},
        });
      jest.spyOn(builder.workflowNavigator, 'suggestNextCommands')
        .mockReturnValue([
          { command: '*review-qa', description: 'Run QA review', raw_command: 'review-qa', args: '' },
        ]);
      jest.spyOn(builder.workflowNavigator, 'getGreetingMessage')
        .mockReturnValue('Development complete!');

      // The formatSuggestions call should receive enhanced suggestions (with warning prepended)
      const formatSpy = jest.spyOn(builder.workflowNavigator, 'formatSuggestions')
        .mockImplementation((suggestions, header) => {
          return `${header}\n\n${suggestions.map((s, i) => `${i + 1}. \`${s.command}\` - ${s.description}`).join('\n')}`;
        });

      const result = builder.buildWorkflowSuggestions({
        lastCommands: ['develop completed'],
        riskLevel: 'HIGH',
      });

      // Should have called formatSuggestions with enhanced array (warning + original)
      expect(formatSpy).toHaveBeenCalled();
      const suggestionsArg = formatSpy.mock.calls[0][0];
      expect(suggestionsArg.length).toBe(2); // warning + original
      expect(suggestionsArg[0].description).toContain('warning');
      expect(suggestionsArg[1].command).toBe('*review-qa');

      fs.existsSync = originalExistsSync;
    });

    test('returns original suggestions when SurfaceChecker is unavailable', () => {
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn().mockReturnValue(false); // No session state

      // SurfaceChecker.load() returns false (criteria file not found)
      SurfaceChecker.mockImplementation(() => ({
        load: jest.fn().mockReturnValue(false),
        shouldSurface: jest.fn(),
      }));

      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue({
          workflow: 'story_development',
          state: 'validated',
          context: {},
        });
      jest.spyOn(builder.workflowNavigator, 'suggestNextCommands')
        .mockReturnValue([
          { command: '*develop-yolo', description: 'YOLO mode', raw_command: 'develop-yolo', args: '' },
        ]);
      jest.spyOn(builder.workflowNavigator, 'getGreetingMessage')
        .mockReturnValue('Ready!');
      const formatSpy = jest.spyOn(builder.workflowNavigator, 'formatSuggestions')
        .mockReturnValue('Ready!\n\n1. `*develop-yolo` - YOLO mode');

      const result = builder.buildWorkflowSuggestions({
        lastCommands: ['validate-story-draft completed'],
      });

      // Should still work without SurfaceChecker
      expect(result).toContain('develop-yolo');
      // formatSuggestions should be called with original (unenhanced) suggestions
      const suggestionsArg = formatSpy.mock.calls[0][0];
      expect(suggestionsArg.length).toBe(1);

      fs.existsSync = originalExistsSync;
    });
  });

  // =========================================================================
  // AC5: workflow-patterns.yaml Bob orchestration patterns
  // =========================================================================
  describe('AC5: Bob orchestration patterns in workflow-patterns.yaml', () => {
    let patterns;

    beforeAll(() => {
      const patternsPath = path.join(
        __dirname,
        '../../.aiox-core/data/workflow-patterns.yaml',
      );
      const content = fs.readFileSync(patternsPath, 'utf8');
      patterns = yaml.load(content);
    });

    test('bob_orchestration workflow exists with correct structure', () => {
      expect(patterns.workflows.bob_orchestration).toBeDefined();

      const bobWorkflow = patterns.workflows.bob_orchestration;
      expect(bobWorkflow.description).toContain('Bob');
      expect(bobWorkflow.agent_sequence).toContain('pm');
      expect(bobWorkflow.agent_sequence).toContain('dev');
      expect(bobWorkflow.key_commands).toContain('execute-epic');
      expect(bobWorkflow.key_commands).toContain('wave-execute');
      expect(bobWorkflow.key_commands).toContain('build-autonomous');
    });

    test('bob_orchestration has transitions for executor-assignment and wave-execution', () => {
      const transitions = patterns.workflows.bob_orchestration.transitions;

      expect(transitions.epic_started).toBeDefined();
      expect(transitions.executor_assigned).toBeDefined();
      expect(transitions.wave_completed).toBeDefined();
      expect(transitions.story_completed).toBeDefined();
    });

    test('bob_orchestration transitions have valid next_steps', () => {
      const transitions = patterns.workflows.bob_orchestration.transitions;

      // Each transition should have next_steps with command and description
      for (const [name, transition] of Object.entries(transitions)) {
        expect(transition.next_steps).toBeDefined();
        expect(transition.next_steps.length).toBeGreaterThan(0);

        for (const step of transition.next_steps) {
          expect(step.command).toBeDefined();
          expect(step.description).toBeDefined();
          expect(step.priority).toBeDefined();
        }
      }
    });

    test('agent_handoff workflow exists for cross-agent transitions', () => {
      expect(patterns.workflows.agent_handoff).toBeDefined();

      const handoffWorkflow = patterns.workflows.agent_handoff;
      expect(handoffWorkflow.agent_sequence).toContain('dev');
      expect(handoffWorkflow.agent_sequence).toContain('qa');
      expect(handoffWorkflow.key_commands).toContain('fix-qa-issues');
      expect(handoffWorkflow.key_commands).toContain('apply-qa-fixes');
    });

    test('agent_handoff has dev_complete and qa_issues_found transitions', () => {
      const transitions = patterns.workflows.agent_handoff.transitions;

      expect(transitions.dev_complete).toBeDefined();
      expect(transitions.qa_issues_found).toBeDefined();
      expect(transitions.fixes_applied).toBeDefined();
    });
  });

  // =========================================================================
  // AC7: Various session states
  // =========================================================================
  describe('AC7: Various session states', () => {
    test('returns null when no workflow state is detected', () => {
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn().mockReturnValue(false);

      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue(null);

      const result = builder.buildWorkflowSuggestions({
        lastCommands: ['some-random-command'],
      });

      expect(result).toBeNull();

      fs.existsSync = originalExistsSync;
    });

    test('returns null when suggestNextCommands returns empty array', () => {
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn().mockReturnValue(false);

      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue({ workflow: 'test', state: 'unknown', context: {} });
      jest.spyOn(builder.workflowNavigator, 'suggestNextCommands')
        .mockReturnValue([]);

      const result = builder.buildWorkflowSuggestions({
        lastCommands: ['test-command completed'],
      });

      expect(result).toBeNull();

      fs.existsSync = originalExistsSync;
    });

    test('handles context with empty lastCommands gracefully', () => {
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn().mockReturnValue(false);

      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockReturnValue(null);

      const result = builder.buildWorkflowSuggestions({
        lastCommands: [],
        commandHistory: [],
      });

      expect(result).toBeNull();

      fs.existsSync = originalExistsSync;
    });

    test('handles exception in workflowNavigator gracefully', () => {
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn().mockReturnValue(false);

      jest.spyOn(builder.workflowNavigator, 'detectWorkflowState')
        .mockImplementation(() => {
          throw new Error('Unexpected error in navigator');
        });

      // Should not throw
      const result = builder.buildWorkflowSuggestions({
        lastCommands: ['some-command'],
      });

      expect(result).toBeNull();

      fs.existsSync = originalExistsSync;
    });
  });

  // =========================================================================
  // AC8: Suggestions are contextually relevant
  // =========================================================================
  describe('AC8: Contextually relevant suggestions', () => {
    test('story_development validated state suggests develop commands', () => {
      const navigator = new WorkflowNavigator();

      const state = {
        workflow: 'story_development',
        state: 'validated',
        context: { story_path: 'docs/stories/test.md' },
      };

      const suggestions = navigator.suggestNextCommands(state);

      // Should suggest development commands after validation
      expect(suggestions.length).toBeGreaterThan(0);
      const commands = suggestions.map((s) => s.raw_command);
      expect(commands).toContain('develop-yolo');
    });

    test('story_development in_development state suggests QA review', () => {
      const navigator = new WorkflowNavigator();

      const state = {
        workflow: 'story_development',
        state: 'in_development',
        context: { story_path: 'docs/stories/test.md' },
      };

      const suggestions = navigator.suggestNextCommands(state);

      expect(suggestions.length).toBeGreaterThan(0);
      const commands = suggestions.map((s) => s.raw_command);
      expect(commands).toContain('review-qa');
    });

    test('story_development qa_reviewed state suggests fix or push', () => {
      const navigator = new WorkflowNavigator();

      const state = {
        workflow: 'story_development',
        state: 'qa_reviewed',
        context: {},
      };

      const suggestions = navigator.suggestNextCommands(state);

      expect(suggestions.length).toBeGreaterThan(0);
      const commands = suggestions.map((s) => s.raw_command);
      expect(commands).toContain('apply-qa-fixes');
    });

    test('bob_orchestration epic_started suggests build or develop', () => {
      const navigator = new WorkflowNavigator();

      const state = {
        workflow: 'bob_orchestration',
        state: 'epic_started',
        context: { story_path: 'docs/stories/ACT-5.md' },
      };

      const suggestions = navigator.suggestNextCommands(state);

      expect(suggestions.length).toBeGreaterThan(0);
      const commands = suggestions.map((s) => s.raw_command);
      expect(commands).toContain('build-autonomous');
    });

    test('unknown workflow returns empty suggestions', () => {
      const navigator = new WorkflowNavigator();

      const state = {
        workflow: 'nonexistent_workflow',
        state: 'some_state',
        context: {},
      };

      const suggestions = navigator.suggestNextCommands(state);

      expect(suggestions).toEqual([]);
    });

    test('populateTemplate replaces context variables correctly', () => {
      const navigator = new WorkflowNavigator();

      const result = navigator.populateTemplate('${story_path}', {
        story_path: 'docs/stories/test.md',
      });

      expect(result).toBe('docs/stories/test.md');
    });

    test('populateTemplate handles missing context variables', () => {
      const navigator = new WorkflowNavigator();

      const result = navigator.populateTemplate('${story_path}', {});

      expect(result).toBe('');
    });
  });

  // =========================================================================
  // AC5 (continued): WorkflowNavigator detects bob_orchestration from commands
  // =========================================================================
  describe('WorkflowNavigator pattern detection', () => {
    test('detects bob_orchestration from execute-epic command', () => {
      const navigator = new WorkflowNavigator();

      const state = navigator.detectWorkflowState(
        ['execute-epic started'],
        { story_path: 'docs/stories/epic-test.md' },
      );

      expect(state).not.toBeNull();
      expect(state.workflow).toBe('bob_orchestration');
      expect(state.state).toBe('epic_started');
    });

    test('detects agent_handoff from develop completed', () => {
      const navigator = new WorkflowNavigator();

      const state = navigator.detectWorkflowState(
        ['develop completed'],
        {},
      );

      expect(state).not.toBeNull();
      // Could match story_development in_development OR agent_handoff dev_complete
      // The first matching workflow wins
      expect(state).toHaveProperty('workflow');
      expect(state).toHaveProperty('state');
    });

    test('returns null for unrecognized commands', () => {
      const navigator = new WorkflowNavigator();

      const state = navigator.detectWorkflowState(
        ['random-unmatched-command'],
        {},
      );

      expect(state).toBeNull();
    });

    test('returns null for empty command history', () => {
      const navigator = new WorkflowNavigator();

      const state = navigator.detectWorkflowState([], {});
      expect(state).toBeNull();
    });

    test('getGreetingMessage returns message for known state', () => {
      const navigator = new WorkflowNavigator();

      const message = navigator.getGreetingMessage({
        workflow: 'story_development',
        state: 'validated',
      });

      expect(message).toBe('Story validated! Ready to implement.');
    });

    test('getGreetingMessage returns empty string for unknown state', () => {
      const navigator = new WorkflowNavigator();

      const message = navigator.getGreetingMessage({
        workflow: 'nonexistent',
        state: 'nonexistent',
      });

      expect(message).toBe('');
    });
  });

  // =========================================================================
  // UnifiedActivationPipeline workflow detection relaxation
  // =========================================================================
  describe('UnifiedActivationPipeline _detectWorkflowState relaxation', () => {
    // This tests that the pipeline also relaxed its workflow detection
    // (ACT-5 changed from sessionType !== 'workflow' to sessionType === 'new')
    let pipeline;

    beforeEach(() => {
      // Require fresh to get the updated code
      jest.resetModules();

      // Re-mock everything needed for the pipeline
      jest.mock('../../.aiox-core/development/scripts/greeting-builder');
      jest.mock('../../.aiox-core/development/scripts/agent-config-loader', () => ({
        AgentConfigLoader: jest.fn().mockImplementation(() => ({
          loadComplete: jest.fn().mockResolvedValue(null),
        })),
      }));
      jest.mock('../../.aiox-core/core/session/context-loader', () => {
        return jest.fn().mockImplementation(() => ({
          loadContext: jest.fn().mockResolvedValue(null),
        }));
      });
      jest.mock('../../.aiox-core/infrastructure/scripts/project-status-loader', () => ({
        loadProjectStatus: jest.fn().mockResolvedValue(null),
      }));
      jest.mock('../../.aiox-core/infrastructure/scripts/git-config-detector');
      jest.mock('../../.aiox-core/core/permissions', () => ({
        PermissionMode: jest.fn().mockImplementation(() => ({
          load: jest.fn().mockResolvedValue(undefined),
          getBadge: jest.fn().mockReturnValue('[Ask]'),
          currentMode: 'ask',
        })),
      }));
      jest.mock('../../.aiox-core/development/scripts/greeting-preference-manager', () => {
        return jest.fn().mockImplementation(() => ({
          getPreference: jest.fn().mockReturnValue('auto'),
        }));
      });
      jest.mock('../../.aiox-core/core/session/context-detector');
      jest.mock('../../.aiox-core/development/scripts/workflow-navigator');

      const { UnifiedActivationPipeline } = require('../../.aiox-core/development/scripts/unified-activation-pipeline');
      const MockWorkflowNavigator = require('../../.aiox-core/development/scripts/workflow-navigator');

      MockWorkflowNavigator.mockImplementation(() => ({
        detectWorkflowState: jest.fn().mockReturnValue({
          workflow: 'story_development',
          state: 'validated',
          context: {},
        }),
      }));

      pipeline = new UnifiedActivationPipeline();
    });

    test('detects workflow state for existing sessions (not just workflow)', () => {
      const sessionContext = {
        lastCommands: ['validate-story-draft completed'],
      };

      const result = pipeline._detectWorkflowState(sessionContext, 'existing');

      // Should NOT return null for 'existing' sessions (ACT-5 relaxation)
      expect(result).not.toBeNull();
      expect(result.workflow).toBe('story_development');
    });

    test('returns null for new sessions', () => {
      const sessionContext = {
        lastCommands: ['validate-story-draft completed'],
      };

      const result = pipeline._detectWorkflowState(sessionContext, 'new');

      expect(result).toBeNull();
    });

    test('returns null when no session context', () => {
      const result = pipeline._detectWorkflowState(null, 'existing');

      expect(result).toBeNull();
    });
  });
});
