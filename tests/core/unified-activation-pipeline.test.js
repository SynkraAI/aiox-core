/**
 * Integration Tests for UnifiedActivationPipeline
 *
 * Story ACT-6: Unified Activation Pipeline
 *
 * Tests:
 * - Each of 12 agents activates through unified pipeline
 * - Identical context structure for all agents
 * - Parallel loading of 4 loaders (NOG-18: projectStatus removed)
 * - Sequential steps with data dependencies
 * - Timeout protection and fallback behavior
 * - Backward compatibility (generate-greeting.js still works)
 * - Performance targets (<200ms total)
 * - Error isolation (one loader fails, others still work)
 */

'use strict';

// --- Mock Setup (BEFORE requiring modules) ---

const mockCoreConfig = {
  user_profile: 'advanced',
  agentIdentity: {
    greeting: {
      preference: 'auto',
      contextDetection: true,
      sessionDetection: 'hybrid',
    },
  },
  dataLocation: '.aios-core/data',
  devStoryLocation: 'docs/stories',
  projectStatus: { enabled: true },
};

const mockAgentDefinition = {
  agent: {
    id: 'dev',
    name: 'Dex',
    icon: '\uD83D\uDCBB',
    title: 'Full Stack Developer',
  },
  persona_profile: {
    archetype: 'Builder',
    communication: {
      greeting_levels: {
        minimal: '\uD83D\uDCBB dev Agent ready',
        named: '\uD83D\uDCBB Dex (Builder) ready. Let\'s build something great!',
        archetypal: '\uD83D\uDCBB Dex the Builder ready to innovate!',
      },
      signature_closing: '-- Dex, sempre construindo',
    },
    greeting_levels: {
      minimal: '\uD83D\uDCBB dev Agent ready',
      named: '\uD83D\uDCBB Dex (Builder) ready. Let\'s build something great!',
      archetypal: '\uD83D\uDCBB Dex the Builder ready to innovate!',
    },
  },
  persona: {
    role: 'Expert Senior Software Engineer',
  },
  commands: [
    { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show help' },
    { name: 'develop', visibility: ['full', 'quick'], description: 'Implement story' },
    { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit' },
  ],
};

const mockSessionContext = {
  sessionType: 'new',
  message: null,
  previousAgent: null,
  lastCommands: [],
  workflowActive: null,
  currentStory: null,
};

const mockProjectStatus = {
  branch: 'main',
  modifiedFiles: [],
  modifiedFilesTotalCount: 0,
  recentCommits: [],
  currentStory: null,
};

const mockGitConfig = {
  configured: true,
  type: 'github',
  branch: 'main',
};

// Mock fs.promises
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    promises: {
      ...actual.promises,
      readFile: jest.fn().mockImplementation((filePath) => {
        if (filePath.includes('core-config.yaml')) {
          const yaml = jest.requireActual('js-yaml');
          return Promise.resolve(yaml.dump(mockCoreConfig));
        }
        if (filePath.includes('.md')) {
          return Promise.resolve('```yaml\nagent:\n  id: dev\n  name: Dex\n  icon: "\uD83D\uDCBB"\n```');
        }
        return Promise.resolve('');
      }),
      access: jest.fn().mockResolvedValue(undefined),
    },
    existsSync: actual.existsSync,
    readFileSync: jest.fn().mockImplementation((filePath) => {
      if (filePath.includes('core-config.yaml')) {
        const yaml = jest.requireActual('js-yaml');
        return yaml.dump(mockCoreConfig);
      }
      if (filePath.includes('workflow-patterns.yaml')) {
        return 'workflows: {}';
      }
      if (filePath.includes('session-state.json')) {
        return JSON.stringify({});
      }
      return '';
    }),
  };
});

// Mock agent-config-loader
jest.mock('../../.aios-core/development/scripts/agent-config-loader', () => ({
  AgentConfigLoader: jest.fn().mockImplementation(() => ({
    loadComplete: jest.fn().mockResolvedValue({
      config: { dataLocation: '.aios-core/data' },
      definition: mockAgentDefinition,
      agent: mockAgentDefinition.agent,
      persona_profile: mockAgentDefinition.persona_profile,
      commands: mockAgentDefinition.commands,
    }),
  })),
}));

// Mock session context loader
jest.mock('../../.aios-core/core/session/context-loader', () => {
  return jest.fn().mockImplementation(() => ({
    loadContext: jest.fn().mockReturnValue(mockSessionContext),
  }));
});

// Mock project status loader
jest.mock('../../.aios-core/infrastructure/scripts/project-status-loader', () => ({
  loadProjectStatus: jest.fn().mockResolvedValue(mockProjectStatus),
}));

// Mock git config detector
jest.mock('../../.aios-core/infrastructure/scripts/git-config-detector', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue(mockGitConfig),
  }));
});

// Mock permission mode
jest.mock('../../.aios-core/core/permissions', () => ({
  PermissionMode: jest.fn().mockImplementation(() => ({
    currentMode: 'ask',
    load: jest.fn().mockResolvedValue('ask'),
    getBadge: jest.fn().mockReturnValue('[Ask]'),
    _loaded: false,
  })),
  OperationGuard: jest.fn(),
}));

// Mock config-resolver
jest.mock('../../.aios-core/core/config/config-resolver', () => ({
  resolveConfig: jest.fn().mockReturnValue({
    config: mockCoreConfig,
  }),
}));

// Mock validate-user-profile
jest.mock('../../.aios-core/infrastructure/scripts/validate-user-profile', () => ({
  validateUserProfile: jest.fn().mockReturnValue({
    valid: true,
    value: 'advanced',
    warning: null,
  }),
}));

// Mock greeting-preference-manager
jest.mock('../../.aios-core/development/scripts/greeting-preference-manager', () => {
  return jest.fn().mockImplementation(() => ({
    getPreference: jest.fn().mockReturnValue('auto'),
  }));
});

// Mock context-detector
jest.mock('../../.aios-core/core/session/context-detector', () => {
  return jest.fn().mockImplementation(() => ({
    detectSessionType: jest.fn().mockReturnValue('new'),
  }));
});

// Mock workflow-navigator
jest.mock('../../.aios-core/development/scripts/workflow-navigator', () => {
  return jest.fn().mockImplementation(() => ({
    detectWorkflowState: jest.fn().mockReturnValue(null),
    getNextSteps: jest.fn().mockReturnValue([]),
    suggestNextCommands: jest.fn().mockReturnValue([]),
    formatSuggestions: jest.fn().mockReturnValue(''),
    getGreetingMessage: jest.fn().mockReturnValue(''),
    extractContext: jest.fn().mockReturnValue({}),
    patterns: { workflows: {} },
  }));
});

// Mock config cache
jest.mock('../../.aios-core/core/config/config-cache', () => ({
  globalConfigCache: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    invalidate: jest.fn(),
  },
}));

// Mock performance tracker
jest.mock('../../.aios-core/infrastructure/scripts/performance-tracker', () => ({
  trackConfigLoad: jest.fn(),
}));

// --- Require modules AFTER mocks ---
const { UnifiedActivationPipeline, ALL_AGENT_IDS, LOADER_TIERS, DEFAULT_PIPELINE_TIMEOUT_MS, FALLBACK_PHRASE } = require('../../.aios-core/development/scripts/unified-activation-pipeline');
const { AgentConfigLoader } = require('../../.aios-core/development/scripts/agent-config-loader');
const SessionContextLoader = require('../../.aios-core/core/session/context-loader');
const { loadProjectStatus } = require('../../.aios-core/infrastructure/scripts/project-status-loader');
const GitConfigDetector = require('../../.aios-core/infrastructure/scripts/git-config-detector');
const { PermissionMode } = require('../../.aios-core/core/permissions');

// Track mock timers to prevent Jest worker exit warnings from orphaned setTimeout calls
const _pendingMockTimers = [];

// ============================================================
// Tests
// ============================================================

describe('UnifiedActivationPipeline', () => {
  let pipeline;

  beforeEach(() => {
    jest.clearAllMocks();

    // Restore default mock implementations that may have been overridden by prior tests.
    // jest.clearAllMocks() only clears call history, NOT implementations set via mockImplementation().
    AgentConfigLoader.mockImplementation(() => ({
      loadComplete: jest.fn().mockResolvedValue({
        config: { dataLocation: '.aios-core/data' },
        definition: mockAgentDefinition,
        agent: mockAgentDefinition.agent,
        persona_profile: mockAgentDefinition.persona_profile,
        commands: mockAgentDefinition.commands,
      }),
    }));

    SessionContextLoader.mockImplementation(() => ({
      loadContext: jest.fn().mockReturnValue(mockSessionContext),
    }));

    loadProjectStatus.mockImplementation(() => Promise.resolve(mockProjectStatus));

    GitConfigDetector.mockImplementation(() => ({
      get: jest.fn().mockReturnValue(mockGitConfig),
    }));

    PermissionMode.mockImplementation(() => ({
      currentMode: 'ask',
      load: jest.fn().mockResolvedValue('ask'),
      getBadge: jest.fn().mockReturnValue('[Ask]'),
      _loaded: false,
    }));

    const ContextDetector = require('../../.aios-core/core/session/context-detector');
    ContextDetector.mockImplementation(() => ({
      detectSessionType: jest.fn().mockReturnValue('new'),
    }));

    pipeline = new UnifiedActivationPipeline();
  });

  afterEach(() => {
    _pendingMockTimers.forEach(id => clearTimeout(id));
    _pendingMockTimers.length = 0;
  });

  // -----------------------------------------------------------
  // 1. Core Activation
  // -----------------------------------------------------------
  describe('activate()', () => {
    it('should activate an agent and return greeting + context + duration', async () => {
      const result = await pipeline.activate('dev');

      expect(result).toHaveProperty('greeting');
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('duration');
      expect(typeof result.greeting).toBe('string');
      expect(typeof result.duration).toBe('number');
      expect(result.greeting.length).toBeGreaterThan(0);
    });

    it('should return a non-empty greeting string', async () => {
      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      expect(result.greeting.length).toBeGreaterThan(5);
    });

    it('should include duration in response', async () => {
      const result = await pipeline.activate('dev');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  // -----------------------------------------------------------
  // 2. All 12 Agents - Identical Context Structure
  // -----------------------------------------------------------
  describe('all 12 agents produce identical context structure', () => {
    const expectedContextKeys = [
      'agent', 'config', 'session', 'projectStatus', 'gitConfig',
      'permissions', 'preference', 'sessionType', 'workflowState',
      'userProfile', 'conversationHistory', 'lastCommands',
      'previousAgent', 'sessionMessage', 'workflowActive', 'sessionStory',
    ];

    ALL_AGENT_IDS.forEach(agentId => {
      it(`should produce correct context structure for @${agentId}`, async () => {
        // Adjust mock to return the agent's ID
        AgentConfigLoader.mockImplementation(() => ({
          loadComplete: jest.fn().mockResolvedValue({
            config: { dataLocation: '.aios-core/data' },
            definition: {
              ...mockAgentDefinition,
              agent: { ...mockAgentDefinition.agent, id: agentId },
            },
            agent: { ...mockAgentDefinition.agent, id: agentId },
            persona_profile: mockAgentDefinition.persona_profile,
            commands: mockAgentDefinition.commands,
          }),
        }));

        const result = await pipeline.activate(agentId);

        // Verify all expected keys exist in context
        for (const key of expectedContextKeys) {
          expect(result.context).toHaveProperty(key);
        }

        // Verify context has the correct agent ID
        expect(result.context.agent.id).toBe(agentId);

        // Verify greeting is a non-empty string
        expect(typeof result.greeting).toBe('string');
        expect(result.greeting.length).toBeGreaterThan(0);
      });
    });

    it('should produce contexts with the exact same keys for all agents', async () => {
      const contextKeys = [];

      for (const agentId of ALL_AGENT_IDS) {
        AgentConfigLoader.mockImplementation(() => ({
          loadComplete: jest.fn().mockResolvedValue({
            config: {},
            definition: {
              ...mockAgentDefinition,
              agent: { ...mockAgentDefinition.agent, id: agentId },
            },
            agent: { ...mockAgentDefinition.agent, id: agentId },
            persona_profile: mockAgentDefinition.persona_profile,
            commands: mockAgentDefinition.commands,
          }),
        }));

        const result = await pipeline.activate(agentId);
        contextKeys.push(Object.keys(result.context).sort().join(','));
      }

      // All contexts should have the same key set
      const uniqueKeyPatterns = new Set(contextKeys);
      expect(uniqueKeyPatterns.size).toBe(1);
    });
  });

  // -----------------------------------------------------------
  // 3. Parallel Loading
  // -----------------------------------------------------------
  describe('parallel loading', () => {
    it('should call all 4 loaders (NOG-18: projectStatus removed)', async () => {
      await pipeline.activate('dev');

      // AgentConfigLoader called
      expect(AgentConfigLoader).toHaveBeenCalled();

      // SessionContextLoader called
      expect(SessionContextLoader).toHaveBeenCalled();

      // NOG-18: ProjectStatusLoader no longer called — gitStatus is native in Claude Code
      // expect(loadProjectStatus).toHaveBeenCalled();

      // GitConfigDetector called
      expect(GitConfigDetector).toHaveBeenCalled();

      // PermissionMode called
      expect(PermissionMode).toHaveBeenCalled();
    });

    it('should load all 4 loaders even if one is slow (NOG-18: projectStatus removed)', async () => {
      // Make sessionContext loader slow but still within timeout
      SessionContextLoader.mockImplementation(() => ({
        loadContext: jest.fn().mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve(mockSessionContext), 50)),
        ),
      }));

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      expect(result.context.session).toBeDefined();
    });
  });

  // -----------------------------------------------------------
  // 4. Error Isolation (one loader fails, others still work)
  // -----------------------------------------------------------
  describe('error isolation', () => {
    it('should still produce greeting when AgentConfigLoader fails', async () => {
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockRejectedValue(new Error('Agent config error')),
      }));

      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      expect(typeof result.greeting).toBe('string');
    });

    it('should still produce greeting when SessionContextLoader fails', async () => {
      SessionContextLoader.mockImplementation(() => ({
        loadContext: jest.fn().mockImplementation(() => { throw new Error('Session error'); }),
      }));

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
    });

    it('should still produce greeting when ProjectStatusLoader fails', async () => {
      loadProjectStatus.mockRejectedValue(new Error('Project status error'));

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      expect(result.context.projectStatus).toBeNull();
    });

    it('should still produce greeting when GitConfigDetector fails', async () => {
      GitConfigDetector.mockImplementation(() => ({
        get: jest.fn().mockImplementation(() => { throw new Error('Git config error'); }),
      }));

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
    });

    it('should still produce greeting when PermissionMode fails', async () => {
      PermissionMode.mockImplementation(() => ({
        currentMode: 'ask',
        load: jest.fn().mockRejectedValue(new Error('Permission error')),
        getBadge: jest.fn().mockReturnValue('[Ask]'),
      }));

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
    });

    it('should use fallback when ALL loaders fail', async () => {
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockRejectedValue(new Error('fail')),
      }));
      SessionContextLoader.mockImplementation(() => ({
        loadContext: jest.fn().mockImplementation(() => { throw new Error('fail'); }),
      }));
      loadProjectStatus.mockRejectedValue(new Error('fail'));
      GitConfigDetector.mockImplementation(() => ({
        get: jest.fn().mockImplementation(() => { throw new Error('fail'); }),
      }));
      PermissionMode.mockImplementation(() => ({
        load: jest.fn().mockRejectedValue(new Error('fail')),
        getBadge: jest.fn().mockReturnValue(''),
      }));

      // Recreate pipeline to pick up new mocks
      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      expect(result.greeting).toContain('dev');
    });
  });

  // -----------------------------------------------------------
  // 5. Timeout Protection
  // -----------------------------------------------------------
  describe('timeout protection', () => {
    it('should return fallback greeting if pipeline exceeds timeout', async () => {
      // Make all loaders very slow
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve(null), 500)),
        ),
      }));
      loadProjectStatus.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(null), 500)),
      );

      const result = await pipeline.activate('dev');
      // Should still return something (either from pipeline or timeout fallback)
      expect(result.greeting).toBeTruthy();
      expect(typeof result.greeting).toBe('string');
      expect(result.fallback).toBe(true);
    });
  });

  // -----------------------------------------------------------
  // 6. Enriched Context Shape
  // -----------------------------------------------------------
  describe('enriched context shape', () => {
    it('should include agent definition in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.agent).toBeDefined();
      expect(result.context.agent.id).toBe('dev');
    });

    it('should include session info in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.session).toBeDefined();
      expect(result.context.sessionType).toBe('new');
    });

    it('should include project status as null in context (NOG-18: removed)', async () => {
      const result = await pipeline.activate('dev');
      // NOG-18: projectStatus loader removed — always null (gitStatus is native in Claude Code)
      expect(result.context.projectStatus).toBeNull();
    });

    it('should include git config in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.gitConfig).toEqual(mockGitConfig);
    });

    it('should include permission data in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.permissions).toBeDefined();
      expect(result.context.permissions.mode).toBe('ask');
      expect(result.context.permissions.badge).toBe('[Ask]');
    });

    it('should include user profile in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.userProfile).toBe('advanced');
    });

    it('should include preference in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.preference).toBe('auto');
    });

    it('should include workflow state (null for new session)', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.workflowState).toBeNull();
    });

    it('should include backward-compatible legacy fields', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context).toHaveProperty('conversationHistory');
      expect(result.context).toHaveProperty('lastCommands');
      expect(result.context).toHaveProperty('previousAgent');
      expect(result.context).toHaveProperty('sessionMessage');
      expect(result.context).toHaveProperty('workflowActive');
      expect(result.context).toHaveProperty('sessionStory');
    });
  });

  // -----------------------------------------------------------
  // 7. Session Type Detection
  // -----------------------------------------------------------
  describe('session type detection', () => {
    it('should detect new session type', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.sessionType).toBe('new');
    });

    it('should use session type from SessionContextLoader when available', async () => {
      SessionContextLoader.mockImplementation(() => ({
        loadContext: jest.fn().mockReturnValue({
          ...mockSessionContext,
          sessionType: 'existing',
          lastCommands: ['develop'],
        }),
      }));

      const result = await pipeline.activate('dev');
      expect(result.context.sessionType).toBe('existing');
    });

    it('should prefer conversation history over session context for detection', async () => {
      const ContextDetector = require('../../.aios-core/core/session/context-detector');
      ContextDetector.mockImplementation(() => ({
        detectSessionType: jest.fn().mockReturnValue('workflow'),
      }));

      // Recreate pipeline to pick up new mock
      const freshPipeline = new UnifiedActivationPipeline();

      const result = await freshPipeline.activate('dev', {
        conversationHistory: [{ content: '*develop story-1' }, { content: '*run-tests' }],
      });
      expect(result.context.sessionType).toBe('workflow');
    });
  });

  // -----------------------------------------------------------
  // 8. Fallback Greeting
  // -----------------------------------------------------------
  describe('fallback greeting', () => {
    it('should produce a valid fallback for unknown agents', async () => {
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockRejectedValue(new Error('Agent not found')),
      }));

      // Recreate pipeline to pick up new mock
      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('unknown-agent');
      expect(result.greeting).toBeTruthy();
      expect(typeof result.greeting).toBe('string');
      // The greeting should contain the agent ID somewhere
      expect(result.greeting).toContain('unknown-agent');
    });

    it('should include the agent ID in fallback greeting', async () => {
      const greeting = pipeline._generateFallbackGreeting('test-agent');
      expect(greeting).toContain('test-agent');
    });
  });

  // -----------------------------------------------------------
  // 9. Static Methods
  // -----------------------------------------------------------
  describe('static methods', () => {
    it('getAllAgentIds() should return all 12 agent IDs', () => {
      const ids = UnifiedActivationPipeline.getAllAgentIds();
      expect(ids).toHaveLength(12);
      expect(ids).toContain('dev');
      expect(ids).toContain('qa');
      expect(ids).toContain('architect');
      expect(ids).toContain('pm');
      expect(ids).toContain('po');
      expect(ids).toContain('sm');
      expect(ids).toContain('analyst');
      expect(ids).toContain('data-engineer');
      expect(ids).toContain('ux-design-expert');
      expect(ids).toContain('devops');
      expect(ids).toContain('aios-master');
      expect(ids).toContain('squad-creator');
    });

    it('isValidAgentId() should return true for valid IDs', () => {
      expect(UnifiedActivationPipeline.isValidAgentId('dev')).toBe(true);
      expect(UnifiedActivationPipeline.isValidAgentId('qa')).toBe(true);
      expect(UnifiedActivationPipeline.isValidAgentId('aios-master')).toBe(true);
    });

    it('isValidAgentId() should return false for invalid IDs', () => {
      expect(UnifiedActivationPipeline.isValidAgentId('invalid')).toBe(false);
      expect(UnifiedActivationPipeline.isValidAgentId('')).toBe(false);
      expect(UnifiedActivationPipeline.isValidAgentId('DEV')).toBe(false);
    });
  });

  // -----------------------------------------------------------
  // 10. Default Icon Mapping
  // -----------------------------------------------------------
  describe('default icon mapping', () => {
    it('should return correct icons for known agents', () => {
      expect(pipeline._getDefaultIcon('dev')).toBe('\uD83D\uDCBB');
      expect(pipeline._getDefaultIcon('aios-master')).toBe('\uD83D\uDC51');
    });

    it('should return default robot icon for unknown agents', () => {
      expect(pipeline._getDefaultIcon('unknown')).toBe('\uD83E\uDD16');
    });
  });

  // -----------------------------------------------------------
  // 11. Default Context
  // -----------------------------------------------------------
  describe('default context', () => {
    it('_getDefaultContext should return complete structure', () => {
      const ctx = pipeline._getDefaultContext('dev');
      expect(ctx.agent.id).toBe('dev');
      expect(ctx.sessionType).toBe('new');
      expect(ctx.permissions.mode).toBe('ask');
      expect(ctx.preference).toBe('auto');
      expect(ctx.userProfile).toBe('advanced');
    });

    it('_getDefaultSessionContext should return new session defaults', () => {
      const session = pipeline._getDefaultSessionContext();
      expect(session.sessionType).toBe('new');
      expect(session.previousAgent).toBeNull();
      expect(session.lastCommands).toEqual([]);
    });
  });

  // -----------------------------------------------------------
  // 12. Agent Definition Building
  // -----------------------------------------------------------
  describe('agent definition building', () => {
    it('should build from loaded config data', () => {
      const agentComplete = {
        agent: { id: 'dev', name: 'Dex', icon: '\uD83D\uDCBB' },
        persona_profile: mockAgentDefinition.persona_profile,
        definition: { persona: { role: 'Developer' }, commands: [] },
        commands: [{ name: 'help' }],
      };

      const def = pipeline._buildAgentDefinition('dev', agentComplete);
      expect(def.id).toBe('dev');
      expect(def.name).toBe('Dex');
      expect(def.persona_profile).toBeDefined();
      expect(def.commands).toHaveLength(1);
    });

    it('should return fallback definition when loader returns null', () => {
      const def = pipeline._buildAgentDefinition('dev', null);
      expect(def.id).toBe('dev');
      expect(def.name).toBe('dev');
      expect(def.persona_profile).toBeDefined();
      expect(def.persona_profile.greeting_levels).toBeDefined();
      expect(def.commands).toEqual([]);
    });
  });

  // -----------------------------------------------------------
  // 13. Preference Resolution
  // -----------------------------------------------------------
  describe('preference resolution', () => {
    it('should bypass bob mode restriction for PM agent', () => {
      const pmAgent = { id: 'pm' };
      const pref = pipeline._resolvePreference(pmAgent, 'bob');
      // PM bypasses bob mode, should call getPreference with 'advanced'
      expect(pipeline.preferenceManager.getPreference).toHaveBeenCalledWith('advanced');
    });

    it('should apply bob mode restriction for non-PM agents', () => {
      const devAgent = { id: 'dev' };
      pipeline._resolvePreference(devAgent, 'bob');
      expect(pipeline.preferenceManager.getPreference).toHaveBeenCalledWith('bob');
    });

    it('should pass through advanced profile without changes', () => {
      const devAgent = { id: 'dev' };
      pipeline._resolvePreference(devAgent, 'advanced');
      expect(pipeline.preferenceManager.getPreference).toHaveBeenCalledWith('advanced');
    });
  });

  // -----------------------------------------------------------
  // 14. Workflow State Detection
  // -----------------------------------------------------------
  describe('workflow state detection', () => {
    it('should return null for non-workflow sessions', () => {
      const result = pipeline._detectWorkflowState(mockSessionContext, 'new');
      expect(result).toBeNull();
    });

    it('should return null when session context is null', () => {
      const result = pipeline._detectWorkflowState(null, 'workflow');
      expect(result).toBeNull();
    });

    it('should return null when no command history', () => {
      const result = pipeline._detectWorkflowState(
        { lastCommands: [] },
        'workflow',
      );
      expect(result).toBeNull();
    });

    it('should attempt detection for workflow sessions with commands', () => {
      const sessionWithCommands = {
        lastCommands: ['develop', 'run-tests'],
      };
      pipeline._detectWorkflowState(sessionWithCommands, 'workflow');
      expect(pipeline.workflowNavigator.detectWorkflowState).toHaveBeenCalledWith(
        ['develop', 'run-tests'],
        sessionWithCommands,
      );
    });
  });

  // -----------------------------------------------------------
  // 15. generate-greeting.js Backward Compatibility
  // -----------------------------------------------------------
  describe('generate-greeting.js backward compatibility', () => {
    it('should export generateGreeting function', () => {
      const { generateGreeting } = require('../../.aios-core/development/scripts/generate-greeting');
      expect(typeof generateGreeting).toBe('function');
    });
  });

  // -----------------------------------------------------------
  // 16. Performance
  // -----------------------------------------------------------
  describe('performance', () => {
    it('should complete activation within 500ms (mocked loaders)', async () => {
      const startTime = Date.now();
      await pipeline.activate('dev');
      const duration = Date.now() - startTime;
      // With mocked loaders, should be well under 500ms
      // Real-world target is <200ms; CI environments have variable timing
      expect(duration).toBeLessThan(500);
    });

    it('should report duration in result', async () => {
      const result = await pipeline.activate('dev');
      expect(result.duration).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  // -----------------------------------------------------------
  // 17. Profile Loader Wrapper (ACT-11: replaces _safeLoad)
  // -----------------------------------------------------------
  describe('_profileLoader', () => {
    it('should return result on success and record metrics', async () => {
      const metrics = { loaders: {} };
      const result = await pipeline._profileLoader('test', metrics, 1000, () => Promise.resolve({ data: 'test' }));
      expect(result).toEqual({ data: 'test' });
      expect(metrics.loaders.test.status).toBe('ok');
      expect(metrics.loaders.test.duration).toBeGreaterThanOrEqual(0);
    });

    it('should return null on error and record error status', async () => {
      const metrics = { loaders: {} };
      const result = await pipeline._profileLoader('test', metrics, 1000, () => Promise.reject(new Error('fail')));
      expect(result).toBeNull();
      expect(metrics.loaders.test.status).toBe('error');
      expect(metrics.loaders.test.error).toContain('fail');
    });

    it('should return null on timeout and record timeout status', async () => {
      const metrics = { loaders: {} };
      const result = await pipeline._profileLoader('test', metrics, 10, () =>
        new Promise(resolve => setTimeout(() => resolve('late'), 500)),
      );
      expect(result).toBeNull();
      expect(metrics.loaders.test.status).toBe('timeout');
    });
  });

  // -----------------------------------------------------------
  // 18. Constructor Options
  // -----------------------------------------------------------
  describe('constructor options', () => {
    it('should accept custom projectRoot', () => {
      const customPipeline = new UnifiedActivationPipeline({ projectRoot: '/custom/path' });
      expect(customPipeline.projectRoot).toBe('/custom/path');
    });

    it('should use cwd as default projectRoot', () => {
      const defaultPipeline = new UnifiedActivationPipeline();
      expect(defaultPipeline.projectRoot).toBe(process.cwd());
    });

    it('should accept custom greetingBuilder', () => {
      const mockBuilder = { buildGreeting: jest.fn() };
      const customPipeline = new UnifiedActivationPipeline({ greetingBuilder: mockBuilder });
      expect(customPipeline.greetingBuilder).toBe(mockBuilder);
    });
  });

  // -----------------------------------------------------------
  // 19. ALL_AGENT_IDS constant
  // -----------------------------------------------------------
  describe('ALL_AGENT_IDS', () => {
    it('should contain exactly 12 agents', () => {
      expect(ALL_AGENT_IDS).toHaveLength(12);
    });

    it('should not have duplicates', () => {
      const unique = new Set(ALL_AGENT_IDS);
      expect(unique.size).toBe(ALL_AGENT_IDS.length);
    });

    it('should include the formerly Path-B agents', () => {
      expect(ALL_AGENT_IDS).toContain('devops');
      expect(ALL_AGENT_IDS).toContain('data-engineer');
      expect(ALL_AGENT_IDS).toContain('ux-design-expert');
    });
  });

  // ===========================================================
  // ACT-11: Pipeline Performance Optimization Tests
  // ===========================================================

  // -----------------------------------------------------------
  // 20. Tiered Loading Architecture (AC: 5, 6, 7)
  // -----------------------------------------------------------
  describe('ACT-11: tiered loading', () => {
    it('should export LOADER_TIERS with correct tier structure', () => {
      expect(LOADER_TIERS).toBeDefined();
      expect(LOADER_TIERS.critical).toBeDefined();
      expect(LOADER_TIERS.high).toBeDefined();
      expect(LOADER_TIERS.bestEffort).toBeDefined();
      expect(LOADER_TIERS.critical.loaders).toContain('agentConfig');
      expect(LOADER_TIERS.high.loaders).toContain('permissionMode');
      expect(LOADER_TIERS.high.loaders).toContain('gitConfig');
      expect(LOADER_TIERS.bestEffort.loaders).toContain('sessionContext');
      // NOG-18: projectStatus removed from bestEffort tier
      expect(LOADER_TIERS.bestEffort.loaders).not.toContain('projectStatus');
    });

    it('should return quality "full" when all loaders succeed', async () => {
      const result = await pipeline.activate('dev');
      expect(result.quality).toBe('full');
      expect(result.fallback).toBe(false);
    });

    it('should return quality "fallback" when Tier 1 (agentConfig) fails', async () => {
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockRejectedValue(new Error('Agent config error')),
      }));

      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.quality).toBe('fallback');
      expect(result.fallback).toBe(true);
    });

    it('should return quality "partial" when Tier 2/3 loaders fail but Tier 1 succeeds', async () => {
      loadProjectStatus.mockRejectedValue(new Error('git timeout'));
      GitConfigDetector.mockImplementation(() => ({
        get: jest.fn().mockImplementation(() => { throw new Error('git error'); }),
      }));

      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.quality).toBe('partial');
      expect(result.fallback).toBe(false);
      // Greeting should still be rich (agent identity present)
      expect(result.greeting).toBeTruthy();
      expect(result.greeting.length).toBeGreaterThan(10);
    });

    it('should still return greeting when only ProjectStatus times out', async () => {
      loadProjectStatus.mockImplementation(() =>
        new Promise(resolve => {
          const id = setTimeout(() => resolve(mockProjectStatus), 300);
          _pendingMockTimers.push(id);
        }),
      );

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      // ProjectStatus may or may not have loaded depending on timing
      expect(['full', 'partial']).toContain(result.quality);
    });
  });

  // -----------------------------------------------------------
  // 21. Loader Profiling / Metrics (AC: 1, 9)
  // -----------------------------------------------------------
  describe('ACT-11: loader profiling', () => {
    it('should include metrics in activation result', async () => {
      const result = await pipeline.activate('dev');
      expect(result.metrics).toBeDefined();
      expect(result.metrics.loaders).toBeDefined();
    });

    it('should record timing data for all 4 loaders (NOG-18: projectStatus removed)', async () => {
      const result = await pipeline.activate('dev');
      const loaderNames = Object.keys(result.metrics.loaders);
      expect(loaderNames).toContain('agentConfig');
      expect(loaderNames).toContain('permissionMode');
      expect(loaderNames).toContain('gitConfig');
      expect(loaderNames).toContain('sessionContext');
      // NOG-18: projectStatus no longer profiled
      expect(loaderNames).not.toContain('projectStatus');
    });

    it('should record duration and status for each loader', async () => {
      const result = await pipeline.activate('dev');
      for (const [name, data] of Object.entries(result.metrics.loaders)) {
        expect(data).toHaveProperty('duration');
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('start');
        expect(data).toHaveProperty('end');
        expect(typeof data.duration).toBe('number');
        expect(['ok', 'timeout', 'error']).toContain(data.status);
      }
    });

    it('should record error message on loader failure', async () => {
      // NOG-18: Use gitConfig loader instead of removed projectStatus
      GitConfigDetector.mockImplementation(() => ({
        get: jest.fn().mockImplementation(() => { throw new Error('git config failed'); }),
      }));
      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.metrics.loaders.gitConfig.status).toBe('error');
      expect(result.metrics.loaders.gitConfig.error).toContain('git config failed');
    });
  });

  // -----------------------------------------------------------
  // 22. Fallback Phrase (ACT-12: Language delegated to Claude Code settings.json)
  // -----------------------------------------------------------
  describe('ACT-12: fallback phrase', () => {
    it('should export FALLBACK_PHRASE as a string', () => {
      expect(FALLBACK_PHRASE).toBeDefined();
      expect(typeof FALLBACK_PHRASE).toBe('string');
      expect(FALLBACK_PHRASE).toContain('*help');
    });

    it('should generate English fallback greeting', () => {
      const greeting = pipeline._generateFallbackGreeting('dev');
      expect(greeting).toContain('Type');
      expect(greeting).toContain('*help');
      expect(greeting).toContain('dev');
    });
  });

  // -----------------------------------------------------------
  // 23. Configurable Pipeline Timeout (AC: 2, 4)
  // -----------------------------------------------------------
  describe('ACT-11: configurable timeout', () => {
    it('should export DEFAULT_PIPELINE_TIMEOUT_MS', () => {
      expect(DEFAULT_PIPELINE_TIMEOUT_MS).toBeDefined();
      expect(typeof DEFAULT_PIPELINE_TIMEOUT_MS).toBe('number');
      expect(DEFAULT_PIPELINE_TIMEOUT_MS).toBe(500);
    });

    it('should use default timeout when no config or env override', () => {
      const timeout = pipeline._resolvePipelineTimeout({});
      expect(timeout).toBe(DEFAULT_PIPELINE_TIMEOUT_MS);
    });

    it('should use config timeout when specified', () => {
      const timeout = pipeline._resolvePipelineTimeout({ pipeline: { timeout_ms: 300 } });
      expect(timeout).toBe(300);
    });

    it('should use env var over config value', () => {
      const originalEnv = process.env.AIOS_PIPELINE_TIMEOUT;
      process.env.AIOS_PIPELINE_TIMEOUT = '800';
      try {
        const timeout = pipeline._resolvePipelineTimeout({ pipeline: { timeout_ms: 300 } });
        expect(timeout).toBe(800);
      } finally {
        if (originalEnv !== undefined) {
          process.env.AIOS_PIPELINE_TIMEOUT = originalEnv;
        } else {
          delete process.env.AIOS_PIPELINE_TIMEOUT;
        }
      }
    });

    it('should ignore invalid env var values', () => {
      const originalEnv = process.env.AIOS_PIPELINE_TIMEOUT;
      process.env.AIOS_PIPELINE_TIMEOUT = 'not-a-number';
      try {
        const timeout = pipeline._resolvePipelineTimeout({});
        expect(timeout).toBe(DEFAULT_PIPELINE_TIMEOUT_MS);
      } finally {
        if (originalEnv !== undefined) {
          process.env.AIOS_PIPELINE_TIMEOUT = originalEnv;
        } else {
          delete process.env.AIOS_PIPELINE_TIMEOUT;
        }
      }
    });
  });

  // -----------------------------------------------------------
  // 24. Quality Determination (ACT-11)
  // -----------------------------------------------------------
  describe('ACT-11: quality determination', () => {
    it('should return "full" when all loaders are ok', () => {
      const metrics = {
        loaders: {
          agentConfig: { status: 'ok', duration: 50 },
          permissionMode: { status: 'ok', duration: 30 },
          gitConfig: { status: 'ok', duration: 40 },
          sessionContext: { status: 'ok', duration: 20 },
          projectStatus: { status: 'ok', duration: 80 },
        },
      };
      expect(pipeline._determineQuality(metrics)).toBe('full');
    });

    it('should return "fallback" when agentConfig failed', () => {
      const metrics = {
        loaders: {
          agentConfig: { status: 'error', duration: 80 },
        },
      };
      expect(pipeline._determineQuality(metrics)).toBe('fallback');
    });

    it('should return "partial" when agentConfig ok but others failed', () => {
      const metrics = {
        loaders: {
          agentConfig: { status: 'ok', duration: 50 },
          permissionMode: { status: 'ok', duration: 30 },
          gitConfig: { status: 'timeout', duration: 120 },
          sessionContext: { status: 'ok', duration: 20 },
          projectStatus: { status: 'timeout', duration: 180 },
        },
      };
      expect(pipeline._determineQuality(metrics)).toBe('partial');
    });
  });

  // -----------------------------------------------------------
  // 25. Timeout Simulation Tests (AC: 11)
  // -----------------------------------------------------------
  describe('ACT-11: timeout simulation', () => {
    it('all loaders fast → full greeting', async () => {
      // Default mocks are instant — should produce full quality
      const result = await pipeline.activate('dev');
      expect(result.quality).toBe('full');
      expect(result.fallback).toBe(false);
    });

    it('GitConfig slow → partial greeting (everything else present, NOG-18)', async () => {
      // NOG-18: projectStatus removed; use gitConfig to trigger partial quality
      GitConfigDetector.mockImplementation(() => ({
        get: jest.fn().mockImplementation(() => { throw new Error('slow'); }),
      }));

      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.quality).toBe('partial');
      expect(result.context.projectStatus).toBeNull();
      // Agent identity should still be present
      expect(result.context.agent.id).toBe('dev');
      expect(result.context.permissions).toBeDefined();
    });

    it('AgentConfig slow → fallback greeting (Tier 1 failure)', async () => {
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockImplementation(() =>
          new Promise((_, reject) => {
            const id = setTimeout(() => reject(new Error('slow')), 200);
            _pendingMockTimers.push(id);
          }),
        ),
      }));

      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.quality).toBe('fallback');
      expect(result.fallback).toBe(true);
      expect(result.greeting).toContain('dev');
    });

    it('all loaders slow → fallback via pipeline timeout', async () => {
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockImplementation(() =>
          new Promise(resolve => {
            const id = setTimeout(() => resolve(null), 800);
            _pendingMockTimers.push(id);
          }),
        ),
      }));
      loadProjectStatus.mockImplementation(() =>
        new Promise(resolve => {
          const id = setTimeout(() => resolve(null), 800);
          _pendingMockTimers.push(id);
        }),
      );
      SessionContextLoader.mockImplementation(() => ({
        loadContext: jest.fn().mockImplementation(() =>
          new Promise(resolve => {
            const id = setTimeout(() => resolve(null), 800);
            _pendingMockTimers.push(id);
          }),
        ),
      }));

      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.fallback).toBe(true);
      expect(result.greeting).toContain('dev');
    });
  });

  // -----------------------------------------------------------
  // 26. Backward Compatibility (ACT-11)
  // -----------------------------------------------------------
  describe('ACT-11: backward compatibility', () => {
    it('should still return fallback boolean field', async () => {
      const result = await pipeline.activate('dev');
      expect(typeof result.fallback).toBe('boolean');
    });

    it('fallback=false when quality is full or partial', async () => {
      const result = await pipeline.activate('dev');
      expect(result.quality).toBe('full');
      expect(result.fallback).toBe(false);
    });

    it('fallback=true only when quality is fallback', async () => {
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockRejectedValue(new Error('fail')),
      }));
      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.quality).toBe('fallback');
      expect(result.fallback).toBe(true);
    });
  });

  // -----------------------------------------------------------
  // 27. All 12 Agents Verified — No Fallback (AC: 12)
  // -----------------------------------------------------------
  describe('ACT-11: all 12 agents non-fallback', () => {
    ALL_AGENT_IDS.forEach(agentId => {
      it(`@${agentId} should not produce fallback greeting`, async () => {
        AgentConfigLoader.mockImplementation(() => ({
          loadComplete: jest.fn().mockResolvedValue({
            config: { dataLocation: '.aios-core/data' },
            definition: {
              ...mockAgentDefinition,
              agent: { ...mockAgentDefinition.agent, id: agentId },
            },
            agent: { ...mockAgentDefinition.agent, id: agentId },
            persona_profile: mockAgentDefinition.persona_profile,
            commands: mockAgentDefinition.commands,
          }),
        }));

        const result = await pipeline.activate(agentId);
        expect(result.fallback).toBe(false);
        expect(result.quality).toBe('full');
        expect(result.metrics).toBeDefined();
        expect(result.metrics.loaders.agentConfig).toBeDefined();
        expect(result.metrics.loaders.agentConfig.status).toBe('ok');
      });
    });
  });
});
