/**
 * Tests for Story ACT-7: Context-Aware Greeting Sections
 *
 * Validates that greeting sections adapt intelligently to session context
 * instead of showing static templates every time.
 *
 * Test Coverage:
 * - AC1: Section builders receive full enriched context object
 * - AC2: Presentation adapts: new=full, existing=brief, workflow=focused
 * - AC3: Role description references current story and branch
 * - AC4: Project status uses natural language narrative
 * - AC5: Context section references previous agent handoff
 * - AC6: Footer varies by session context
 * - AC7: Parallelizable sections with Promise.all()
 * - AC8: Fallback to static templates on failure (150ms timeout)
 * - AC9: Performance within 200ms total
 * - AC10: A/B comparison: static vs context-aware
 */

const GreetingBuilder = require('../../.aiox-core/development/scripts/greeting-builder');
const ContextDetector = require('../../.aiox-core/core/session/context-detector');
const GitConfigDetector = require('../../.aiox-core/infrastructure/scripts/git-config-detector');

// Mock dependencies
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
// Story ACT-5: Mock SessionState and SurfaceChecker
jest.mock('../../.aiox-core/core/orchestration/session-state', () => ({
  SessionState: jest.fn().mockImplementation(() => ({
    getStateFilePath: jest.fn().mockReturnValue('/tmp/nonexistent-state.yaml'),
  })),
  sessionStateExists: jest.fn().mockReturnValue(false),
}));
jest.mock('../../.aiox-core/core/orchestration/surface-checker', () => ({
  SurfaceChecker: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockReturnValue(false),
    shouldSurface: jest.fn().mockReturnValue({ should_surface: false }),
  })),
}));

const { loadProjectStatus } = require('../../.aiox-core/infrastructure/scripts/project-status-loader');

describe('Story ACT-7: Context-Aware Greeting Sections', () => {
  let builder;
  let mockAgent;

  // Enriched context template matching UnifiedActivationPipeline output shape
  const baseEnrichedContext = {
    sessionType: 'new',
    projectStatus: {
      branch: 'feat/act-7',
      modifiedFiles: ['greeting-builder.js', 'unified-activation-pipeline.js'],
      modifiedFilesTotalCount: 2,
      recentCommits: ['feat: implement context-aware greetings'],
      currentStory: 'ACT-7',
      isGitRepo: true,
    },
    gitConfig: { configured: true, type: 'github', branch: 'feat/act-7' },
    permissions: { mode: 'ask', badge: '[Ask]' },
    preference: 'auto',
    workflowState: null,
    userProfile: 'advanced',
    conversationHistory: [],
    lastCommands: [],
    previousAgent: null,
    sessionMessage: null,
    workflowActive: null,
    sessionStory: 'ACT-7',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockAgent = {
      id: 'dev',
      name: 'Dex',
      icon: '\uD83D\uDCBB',
      persona_profile: {
        archetype: 'Builder',
        greeting_levels: {
          minimal: '\uD83D\uDCBB dev Agent ready',
          named: "\uD83D\uDCBB Dex (Builder) ready. Let's build something great!",
          archetypal: '\uD83D\uDCBB Dex the Builder ready to innovate!',
        },
        communication: {
          signature_closing: '-- Dex, sempre construindo',
        },
      },
      persona: {
        role: 'Expert Senior Software Engineer & Implementation Specialist',
      },
      commands: [
        { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show help' },
        { name: 'develop', visibility: ['full', 'quick'], description: 'Implement story tasks' },
        { name: 'run-tests', visibility: ['quick', 'key'], description: 'Execute tests' },
        { name: 'build', visibility: ['full'], description: 'Build project' },
      ],
    };

    ContextDetector.mockImplementation(() => ({
      detectSessionType: jest.fn().mockReturnValue('new'),
    }));

    GitConfigDetector.mockImplementation(() => ({
      get: jest.fn().mockReturnValue({
        configured: true,
        type: 'github',
        branch: 'feat/act-7',
      }),
    }));

    loadProjectStatus.mockResolvedValue(baseEnrichedContext.projectStatus);

    builder = new GreetingBuilder();
  });

  // ========================================================================
  // AC1: Section builders receive full enriched context
  // ========================================================================
  describe('AC1: Enriched context passing', () => {
    test('buildPresentation accepts sectionContext parameter', () => {
      const result = builder.buildPresentation(mockAgent, 'new', '', {
        sessionType: 'new',
        projectStatus: baseEnrichedContext.projectStatus,
      });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    test('buildRoleDescription accepts sectionContext parameter', () => {
      const result = builder.buildRoleDescription(mockAgent, {
        sessionStory: 'ACT-7',
        projectStatus: { branch: 'feat/act-7', currentStory: 'ACT-7' },
        gitConfig: { branch: 'feat/act-7' },
      });
      expect(result).toContain('Role:');
    });

    test('buildProjectStatus accepts sectionContext parameter', () => {
      const result = builder.buildProjectStatus(
        baseEnrichedContext.projectStatus,
        'new',
        { sessionType: 'new' },
      );
      expect(result).toContain('Project Status');
    });

    test('buildFooter accepts sectionContext parameter', () => {
      const result = builder.buildFooter(mockAgent, { sessionType: 'new' });
      expect(result).toBeTruthy();
    });

    test('buildContextSection accepts sectionContext parameter', () => {
      const result = builder.buildContextSection(
        mockAgent,
        { ...baseEnrichedContext, previousAgent: 'qa' },
        'existing',
        baseEnrichedContext.projectStatus,
        { previousAgent: 'qa' },
      );
      // Should produce a context section for existing session with previous agent
      expect(result).toBeTruthy();
    });

    test('backward compatible: all section builders work without sectionContext', () => {
      // All methods should still work with their original signatures
      expect(builder.buildPresentation(mockAgent, 'new', '')).toBeTruthy();
      expect(builder.buildRoleDescription(mockAgent)).toContain('Role:');
      expect(builder.buildProjectStatus(baseEnrichedContext.projectStatus, 'new')).toContain('Project Status');
      expect(builder.buildFooter(mockAgent)).toBeTruthy();
      expect(builder.buildContextSection(mockAgent, {}, 'existing', baseEnrichedContext.projectStatus)).toBeDefined();
    });
  });

  // ========================================================================
  // AC2: Presentation adapts to session type
  // ========================================================================
  describe('AC2: Adaptive presentation', () => {
    test('new session: uses full archetypal greeting', () => {
      const result = builder.buildPresentation(mockAgent, 'new', '', {
        sessionType: 'new',
      });
      expect(result).toContain('Dex the Builder ready to innovate!');
    });

    test('existing session: brief welcome back with story reference', () => {
      const result = builder.buildPresentation(mockAgent, 'existing', '', {
        sessionType: 'existing',
        sessionStory: 'ACT-7',
        projectStatus: { currentStory: 'ACT-7' },
      });
      expect(result).toContain('Dex (Builder) ready');
      expect(result).toContain('continuing ACT-7');
    });

    test('existing session: welcome back without story', () => {
      const result = builder.buildPresentation(mockAgent, 'existing', '', {
        sessionType: 'existing',
        sessionStory: null,
        projectStatus: null,
      });
      expect(result).toContain('welcome back');
    });

    test('workflow session: focused greeting with workflow active', () => {
      const result = builder.buildPresentation(mockAgent, 'workflow', '', {
        sessionType: 'workflow',
        workflowState: { currentPhase: 'development' },
      });
      expect(result).toContain('Dex (Builder) ready');
      expect(result).toContain('workflow active');
    });

    test('workflow session: named greeting when no workflow state', () => {
      const result = builder.buildPresentation(mockAgent, 'workflow', '', {
        sessionType: 'workflow',
        workflowState: null,
        workflowActive: null,
      });
      expect(result).toContain('Dex (Builder) ready');
      expect(result).not.toContain('workflow active');
    });

    test('permission badge is appended in all session types', () => {
      const badge = '[Auto]';

      const newResult = builder.buildPresentation(mockAgent, 'new', badge, { sessionType: 'new' });
      expect(newResult).toContain('[Auto]');

      const existingResult = builder.buildPresentation(mockAgent, 'existing', badge, {
        sessionType: 'existing',
      });
      expect(existingResult).toContain('[Auto]');

      const workflowResult = builder.buildPresentation(mockAgent, 'workflow', badge, {
        sessionType: 'workflow',
      });
      expect(workflowResult).toContain('[Auto]');
    });

    test('no sectionContext: falls back to archetypal (backward compatible)', () => {
      const result = builder.buildPresentation(mockAgent, 'existing', '');
      // Without sectionContext, even existing session uses archetypal
      expect(result).toContain('Dex the Builder ready to innovate!');
    });
  });

  // ========================================================================
  // AC3: Role description references story and branch
  // ========================================================================
  describe('AC3: Context-aware role description', () => {
    test('includes story reference when available', () => {
      const result = builder.buildRoleDescription(mockAgent, {
        sessionStory: 'ACT-7',
        projectStatus: { branch: 'main' },
        gitConfig: { branch: 'main' },
      });
      expect(result).toContain('Role:');
      expect(result).toContain('Story: ACT-7');
    });

    test('includes branch reference when not main/master', () => {
      const result = builder.buildRoleDescription(mockAgent, {
        sessionStory: null,
        projectStatus: { branch: 'feat/act-7' },
        gitConfig: { branch: 'feat/act-7' },
      });
      expect(result).toContain('Branch: `feat/act-7`');
    });

    test('skips branch reference for main', () => {
      const result = builder.buildRoleDescription(mockAgent, {
        sessionStory: null,
        projectStatus: { branch: 'main' },
        gitConfig: { branch: 'main' },
      });
      expect(result).not.toContain('Branch:');
    });

    test('skips branch reference for master', () => {
      const result = builder.buildRoleDescription(mockAgent, {
        sessionStory: null,
        projectStatus: { branch: 'master' },
        gitConfig: { branch: 'master' },
      });
      expect(result).not.toContain('Branch:');
    });

    test('includes both story and branch when both available', () => {
      const result = builder.buildRoleDescription(mockAgent, {
        sessionStory: 'ACT-7',
        projectStatus: { branch: 'feat/act-7', currentStory: 'ACT-7' },
        gitConfig: { branch: 'feat/act-7' },
      });
      expect(result).toContain('Story: ACT-7');
      expect(result).toContain('Branch: `feat/act-7`');
      expect(result).toContain('|'); // separator
    });

    test('no sectionContext: returns plain role (backward compatible)', () => {
      const result = builder.buildRoleDescription(mockAgent);
      expect(result).toBe('**Role:** Expert Senior Software Engineer & Implementation Specialist');
      expect(result).not.toContain('Story:');
      expect(result).not.toContain('Branch:');
    });

    test('returns empty for agent without role', () => {
      const agentNoRole = { ...mockAgent, persona: {} };
      expect(builder.buildRoleDescription(agentNoRole)).toBe('');
    });
  });

  // ========================================================================
  // AC4: Natural language project status narrative
  // ========================================================================
  describe('AC4: Natural language project status', () => {
    test('narrative format with branch and file count', () => {
      const result = builder.buildProjectStatus(
        baseEnrichedContext.projectStatus,
        'new',
        { sessionType: 'new' },
      );
      expect(result).toContain("You're on branch `feat/act-7`");
      expect(result).toContain('2 modified files');
    });

    test('narrative format with story reference', () => {
      const result = builder.buildProjectStatus(
        baseEnrichedContext.projectStatus,
        'new',
        { sessionType: 'new' },
      );
      expect(result).toContain('Story **ACT-7** is in progress');
    });

    test('narrative format with recent commit', () => {
      const result = builder.buildProjectStatus(
        baseEnrichedContext.projectStatus,
        'new',
        { sessionType: 'new' },
      );
      expect(result).toContain('Last commit:');
      expect(result).toContain('implement context-aware greetings');
    });

    test('workflow session still uses condensed format', () => {
      const result = builder.buildProjectStatus(
        baseEnrichedContext.projectStatus,
        'workflow',
        { sessionType: 'workflow' },
      );
      expect(result).toContain('🌿 feat/act-7');
      expect(result).toContain('📝 2 modified');
    });

    test('singular file count uses correct grammar', () => {
      const singleFileStatus = {
        ...baseEnrichedContext.projectStatus,
        modifiedFilesTotalCount: 1,
      };
      const result = builder.buildProjectStatus(singleFileStatus, 'new', { sessionType: 'new' });
      expect(result).toContain('1 modified file.');
      expect(result).not.toContain('1 modified files');
    });

    test('no sectionContext: uses legacy bullet-point format', () => {
      const result = builder.buildProjectStatus(baseEnrichedContext.projectStatus, 'new');
      expect(result).toContain('**Branch:**');
      expect(result).toContain('**Modified:**');
    });

    test('empty status returns empty string', () => {
      expect(builder.buildProjectStatus(null, 'new', {})).toBe('');
    });

    test('status with no data returns empty string', () => {
      const result = builder.buildProjectStatus({}, 'new', { sessionType: 'new' });
      expect(result).toBe('');
    });
  });

  // ========================================================================
  // AC5: Context section references previous agent handoff
  // ========================================================================
  describe('AC5: Intelligent agent handoff context', () => {
    test('detects previous agent transition with story context', () => {
      const context = {
        ...baseEnrichedContext,
        sessionType: 'existing',
        previousAgent: { agentId: 'qa', agentName: 'Quinn' },
      };
      const result = builder.buildContextSection(
        mockAgent,
        context,
        'existing',
        baseEnrichedContext.projectStatus,
        { previousAgent: context.previousAgent },
      );
      expect(result).toBeTruthy();
      expect(result).toContain('@Quinn');
    });

    test('handles string previousAgent format', () => {
      const context = {
        ...baseEnrichedContext,
        sessionType: 'existing',
        previousAgent: 'qa',
      };
      const result = builder.buildContextSection(
        mockAgent,
        context,
        'existing',
        baseEnrichedContext.projectStatus,
        { previousAgent: 'qa' },
      );
      expect(result).toBeTruthy();
      expect(result).toContain('@qa');
    });

    test('handoff fallback when narrative has no description', () => {
      const context = {
        sessionType: 'existing',
        previousAgent: { agentId: 'po', agentName: 'Pax' },
        // No lastCommands, no sessionStory, no projectStatus fields
      };
      const result = builder.buildContextSection(
        mockAgent,
        context,
        'existing',
        null, // no projectStatus
        { previousAgent: context.previousAgent },
      );
      expect(result).toBeTruthy();
      expect(result).toContain('@Pax');
    });

    test('skips context for new sessions', () => {
      const result = builder.buildContextSection(
        mockAgent,
        baseEnrichedContext,
        'new',
        baseEnrichedContext.projectStatus,
        {},
      );
      expect(result).toBeNull();
    });

    test('suggests correct command for dev->qa transition', () => {
      const context = {
        ...baseEnrichedContext,
        sessionType: 'existing',
        previousAgent: { agentId: 'dev', agentName: 'Dex' },
      };
      const qaAgent = { ...mockAgent, id: 'qa', name: 'Quinn' };
      const result = builder.buildContextSection(
        qaAgent,
        context,
        'existing',
        baseEnrichedContext.projectStatus,
        { previousAgent: context.previousAgent },
      );
      expect(result).toContain('*review');
    });
  });

  // ========================================================================
  // AC6: Footer varies by session context
  // ========================================================================
  describe('AC6: Adaptive footer', () => {
    test('new session: full guide prompt', () => {
      const result = builder.buildFooter(mockAgent, { sessionType: 'new' });
      expect(result).toContain('*guide');
      expect(result).toContain('comprehensive usage instructions');
    });

    test('existing session: brief tip', () => {
      const result = builder.buildFooter(mockAgent, { sessionType: 'existing' });
      expect(result).toContain('*help');
      expect(result).toContain('*session-info');
      expect(result).not.toContain('*guide');
    });

    test('workflow session: progress note with story', () => {
      const result = builder.buildFooter(mockAgent, {
        sessionType: 'workflow',
        sessionStory: 'ACT-7',
      });
      expect(result).toContain('Focused on **ACT-7**');
      expect(result).toContain('*help');
    });

    test('workflow session: generic message without story', () => {
      const result = builder.buildFooter(mockAgent, {
        sessionType: 'workflow',
        sessionStory: null,
        projectStatus: null,
      });
      expect(result).toContain('Workflow active');
    });

    test('signature is always appended when available', () => {
      const newFooter = builder.buildFooter(mockAgent, { sessionType: 'new' });
      const existingFooter = builder.buildFooter(mockAgent, { sessionType: 'existing' });
      const workflowFooter = builder.buildFooter(mockAgent, { sessionType: 'workflow' });

      expect(newFooter).toContain('Dex, sempre construindo');
      expect(existingFooter).toContain('Dex, sempre construindo');
      expect(workflowFooter).toContain('Dex, sempre construindo');
    });

    test('no sectionContext: defaults to new session footer (backward compatible)', () => {
      const result = builder.buildFooter(mockAgent);
      expect(result).toContain('*guide');
      expect(result).toContain('Dex, sempre construindo');
    });

    test('agent without signature: footer still renders', () => {
      const agentNoSig = {
        ...mockAgent,
        persona_profile: {
          ...mockAgent.persona_profile,
          communication: {},
        },
      };
      const result = builder.buildFooter(agentNoSig, { sessionType: 'existing' });
      expect(result).toContain('*help');
      expect(result).not.toContain('Dex');
    });
  });

  // ========================================================================
  // AC7: Parallelizable sections with Promise.all()
  // ========================================================================
  describe('AC7: Parallelization', () => {
    test('_safeBuildSection resolves sync builders', async () => {
      const result = await builder._safeBuildSection(() => 'sync result');
      expect(result).toBe('sync result');
    });

    test('_safeBuildSection resolves async builders', async () => {
      const result = await builder._safeBuildSection(() => Promise.resolve('async result'));
      expect(result).toBe('async result');
    });

    test('_safeBuildSection returns null on error', async () => {
      const result = await builder._safeBuildSection(() => {
        throw new Error('test error');
      });
      expect(result).toBeNull();
    });

    test('_safeBuildSection returns null on timeout', async () => {
      const slowBuilder = () => new Promise((resolve) => setTimeout(() => resolve('too late'), 300));
      const result = await builder._safeBuildSection(slowBuilder);
      expect(result).toBeNull();
    }, 1000);

    test('_safeBuildSection handles null return', async () => {
      const result = await builder._safeBuildSection(() => null);
      expect(result).toBeNull();
    });

    test('full greeting with enriched context uses parallel execution', async () => {
      const context = {
        ...baseEnrichedContext,
        sessionType: 'existing',
        previousAgent: { agentId: 'qa', agentName: 'Quinn' },
      };

      const greeting = await builder.buildGreeting(mockAgent, context);

      // Should contain sections that were built in parallel
      expect(greeting).toBeTruthy();
      expect(greeting).toContain('Dex');
    });
  });

  // ========================================================================
  // AC8: Fallback to static templates on failure
  // ========================================================================
  describe('AC8: Fallback and timeout protection', () => {
    test('falls back to simple greeting when _buildContextualGreeting throws', async () => {
      // Force an error in the contextual greeting path
      builder.contextDetector.detectSessionType.mockImplementation(() => {
        throw new Error('Total failure');
      });

      const greeting = await builder.buildGreeting(mockAgent, {});

      // Should fall back gracefully
      expect(greeting).toBeTruthy();
      expect(greeting).toContain('Dex');
      expect(greeting).toContain('*help');
    });

    test('section timeout produces null, not crash', async () => {
      const result = await builder._safeBuildSection(() =>
        new Promise((resolve) => setTimeout(() => resolve('too late'), 500)),
      );
      expect(result).toBeNull();
    }, 1000);

    test('greeting still renders when project status load fails', async () => {
      const context = {
        ...baseEnrichedContext,
        projectStatus: null,
        gitConfig: { configured: false },
      };

      const greeting = await builder.buildGreeting(mockAgent, context);

      expect(greeting).toBeTruthy();
      expect(greeting).toContain('Dex');
    });
  });

  // ========================================================================
  // AC9: Performance within 200ms
  // ========================================================================
  describe('AC9: Performance', () => {
    test('context-aware greeting completes within 200ms', async () => {
      const startTime = Date.now();
      await builder.buildGreeting(mockAgent, baseEnrichedContext);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(200);
    });

    test('greeting with all sections completes within 200ms', async () => {
      const context = {
        ...baseEnrichedContext,
        sessionType: 'existing',
        previousAgent: { agentId: 'qa', agentName: 'Quinn' },
        lastCommands: ['develop-story'],
      };

      const startTime = Date.now();
      await builder.buildGreeting(mockAgent, context);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(200);
    });
  });

  // ========================================================================
  // AC10: A/B comparison - static vs context-aware
  // ========================================================================
  describe('AC10: A/B comparison', () => {
    test('static greeting is shorter than context-aware greeting', async () => {
      const staticGreeting = builder.buildSimpleGreeting(mockAgent);

      const contextGreeting = await builder.buildGreeting(mockAgent, baseEnrichedContext);

      // Context-aware should be richer (longer) than simple fallback
      expect(contextGreeting.length).toBeGreaterThan(staticGreeting.length);
    });

    test('context-aware greeting includes more sections than static', async () => {
      const staticGreeting = builder.buildSimpleGreeting(mockAgent);
      const contextGreeting = await builder.buildGreeting(mockAgent, baseEnrichedContext);

      // Static: just greeting + help prompt
      expect(staticGreeting).toContain('*help');
      expect(staticGreeting).not.toContain('Role:');
      expect(staticGreeting).not.toContain('Project Status');

      // Context-aware: includes role, project status, commands, footer
      expect(contextGreeting).toContain('Role:');
      expect(contextGreeting).toContain('Project Status');
      expect(contextGreeting).toContain('Commands');
    });

    test('existing session greeting differs from new session greeting', async () => {
      const newContext = { ...baseEnrichedContext, sessionType: 'new' };
      const existingContext = { ...baseEnrichedContext, sessionType: 'existing' };

      const newGreeting = await builder.buildGreeting(mockAgent, newContext);
      const existingGreeting = await builder.buildGreeting(mockAgent, existingContext);

      // New session should have full intro; existing should be brief
      expect(newGreeting).toContain('Available Commands');
      expect(existingGreeting).toContain('Quick Commands');

      // New session should have role description; existing should not
      expect(newGreeting).toContain('Role:');
      expect(existingGreeting).not.toContain('Role:');
    });

    test('workflow session greeting is focused', async () => {
      const workflowContext = { ...baseEnrichedContext, sessionType: 'workflow' };

      const workflowGreeting = await builder.buildGreeting(mockAgent, workflowContext);

      expect(workflowGreeting).toContain('Key Commands');
      expect(workflowGreeting).not.toContain('Role:');
      // Condensed project status for workflow
      expect(workflowGreeting).toContain('🌿');
    });
  });

  // ========================================================================
  // Regression: Backward compatibility
  // ========================================================================
  describe('Backward compatibility', () => {
    test('buildGreeting(agent, {}) still works (no enriched context)', async () => {
      const greeting = await builder.buildGreeting(mockAgent, {});
      expect(greeting).toBeTruthy();
      expect(greeting).toContain('Dex');
    });

    test('buildGreeting(agent) still works (no context at all)', async () => {
      const greeting = await builder.buildGreeting(mockAgent);
      expect(greeting).toBeTruthy();
      expect(greeting).toContain('Dex');
    });

    test('old format without visibility metadata still works', async () => {
      const oldAgent = {
        ...mockAgent,
        commands: [
          { name: 'help' },
          { name: 'develop' },
        ],
      };
      const greeting = await builder.buildGreeting(oldAgent, baseEnrichedContext);
      expect(greeting).toContain('help');
      expect(greeting).toContain('develop');
    });
  });
});
