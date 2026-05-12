/**
 * @fileoverview Unit tests for WorkflowRegistry
 * @story WIS-2 - Workflow Registry Enhancement
 */

'use strict';

const path = require('path');
const {
  WorkflowRegistry,
  createWorkflowRegistry,
  DEFAULT_CACHE_TTL,
} = require('../registry/workflow-registry');

describe('WorkflowRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = createWorkflowRegistry();
  });

  afterEach(() => {
    registry.invalidateCache();
  });

  describe('constructor', () => {
    it('should create registry with default options', () => {
      expect(registry.cacheTTL).toBe(DEFAULT_CACHE_TTL);
      expect(registry.cache).toBeNull();
    });

    it('should accept custom cache TTL', () => {
      const customRegistry = createWorkflowRegistry({ cacheTTL: 1000 });
      expect(customRegistry.cacheTTL).toBe(1000);
    });

    it('should accept custom patterns path', () => {
      const customPath = '/custom/path.yaml';
      const customRegistry = createWorkflowRegistry({ patternsPath: customPath });
      expect(customRegistry.patternsPath).toBe(customPath);
    });
  });

  describe('loadWorkflows()', () => {
    it('should load workflow patterns from file', () => {
      const workflows = registry.loadWorkflows();
      expect(workflows).toBeDefined();
      expect(typeof workflows).toBe('object');
    });

    it('should return 10 workflows', () => {
      const workflows = registry.loadWorkflows();
      const names = Object.keys(workflows);
      expect(names.length).toBe(10);
    });

    it('should include story_development workflow', () => {
      const workflows = registry.loadWorkflows();
      expect(workflows.story_development).toBeDefined();
    });

    it('should include epic_creation workflow', () => {
      const workflows = registry.loadWorkflows();
      expect(workflows.epic_creation).toBeDefined();
    });

    it('should cache loaded workflows', () => {
      const workflows1 = registry.loadWorkflows();
      const workflows2 = registry.loadWorkflows();
      expect(workflows1).toBe(workflows2);
    });

    it('should throw error for invalid file path', () => {
      const badRegistry = createWorkflowRegistry({
        patternsPath: '/nonexistent/path.yaml',
      });
      expect(() => badRegistry.loadWorkflows()).toThrow('Workflow patterns file not found');
    });
  });

  describe('isCacheValid()', () => {
    it('should return false when cache is null', () => {
      expect(registry.isCacheValid()).toBe(false);
    });

    it('should return true after loading workflows', () => {
      registry.loadWorkflows();
      expect(registry.isCacheValid()).toBe(true);
    });

    it('should return false after invalidation', () => {
      registry.loadWorkflows();
      registry.invalidateCache();
      expect(registry.isCacheValid()).toBe(false);
    });
  });

  describe('getWorkflowNames()', () => {
    it('should return array of workflow names', () => {
      const names = registry.getWorkflowNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBe(10);
    });

    it('should include expected workflows', () => {
      const names = registry.getWorkflowNames();
      expect(names).toContain('story_development');
      expect(names).toContain('epic_creation');
      expect(names).toContain('backlog_management');
      expect(names).toContain('architecture_review');
      expect(names).toContain('git_workflow');
      expect(names).toContain('database_workflow');
      expect(names).toContain('code_quality_workflow');
      expect(names).toContain('documentation_workflow');
      expect(names).toContain('ux_workflow');
      expect(names).toContain('research_workflow');
    });
  });

  describe('getWorkflow()', () => {
    it('should return workflow by name', () => {
      const workflow = registry.getWorkflow('epic_creation');
      expect(workflow).toBeDefined();
      expect(workflow.description).toBeDefined();
    });

    it('should return null for unknown workflow', () => {
      const workflow = registry.getWorkflow('nonexistent');
      expect(workflow).toBeNull();
    });

    it('should include transitions in workflow', () => {
      const workflow = registry.getWorkflow('epic_creation');
      expect(workflow.transitions).toBeDefined();
      expect(typeof workflow.transitions).toBe('object');
    });
  });

  describe('matchWorkflow()', () => {
    it('should match workflow from command history', () => {
      const commands = ['create-epic', 'create-story'];
      const match = registry.matchWorkflow(commands);

      expect(match).not.toBeNull();
      expect(match.name).toBe('epic_creation');
    });

    it('should return best matching workflow', () => {
      const commands = ['validate-story-draft', 'develop', 'review-qa'];
      const match = registry.matchWorkflow(commands);

      expect(match).not.toBeNull();
      expect(match.name).toBe('story_development');
    });

    it('should return null for empty commands', () => {
      const match = registry.matchWorkflow([]);
      expect(match).toBeNull();
    });

    it('should return null for unmatched commands', () => {
      const match = registry.matchWorkflow(['random-cmd', 'another-random']);
      expect(match).toBeNull();
    });

    it('should include score in match result', () => {
      const match = registry.matchWorkflow(['create-epic', 'create-story']);
      expect(match.score).toBeGreaterThanOrEqual(2);
    });

    it('should include matched commands', () => {
      const match = registry.matchWorkflow(['create-epic', 'create-story']);
      expect(match.matchedCommands).toBeDefined();
      expect(Array.isArray(match.matchedCommands)).toBe(true);
    });
  });

  describe('getTransitions()', () => {
    it('should return transitions for valid state', () => {
      const transition = registry.getTransitions('epic_creation', 'epic_drafted');

      expect(transition).not.toBeNull();
      expect(transition.trigger).toBeDefined();
      expect(transition.confidence).toBeDefined();
      expect(transition.next_steps).toBeDefined();
    });

    it('should return null for unknown state', () => {
      const transition = registry.getTransitions('epic_creation', 'unknown_state');
      expect(transition).toBeNull();
    });

    it('should return null for unknown workflow', () => {
      const transition = registry.getTransitions('unknown_workflow', 'any_state');
      expect(transition).toBeNull();
    });

    it('should return empty array for workflow without transitions', () => {
      const result = registry.getAllTransitions('nonexistent');
      expect(result).toEqual({});
    });
  });

  describe('getNextSteps()', () => {
    it('should return sorted next steps', () => {
      const steps = registry.getNextSteps('epic_creation', 'epic_drafted');

      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].priority).toBeLessThanOrEqual(steps[1]?.priority || 99);
    });

    it('should include command and description', () => {
      const steps = registry.getNextSteps('epic_creation', 'epic_drafted');

      expect(steps[0].command).toBeDefined();
      expect(steps[0].description).toBeDefined();
    });

    it('should return empty array for unknown state', () => {
      const steps = registry.getNextSteps('epic_creation', 'unknown_state');
      expect(steps).toEqual([]);
    });
  });

  describe('findCurrentState()', () => {
    it('should find state from command', () => {
      const state = registry.findCurrentState('epic_creation', 'create-epic completed');
      expect(state).toBe('epic_drafted');
    });

    it('should find state without "completed" suffix', () => {
      const state = registry.findCurrentState('epic_creation', 'create-epic');
      expect(state).toBe('epic_drafted');
    });

    it('should return null for unknown command', () => {
      const state = registry.findCurrentState('epic_creation', 'random-command');
      expect(state).toBeNull();
    });

    it('should return null for unknown workflow', () => {
      const state = registry.findCurrentState('unknown', 'create-epic');
      expect(state).toBeNull();
    });
  });

  describe('getWorkflowsByAgent()', () => {
    it('should return workflows for agent', () => {
      const workflows = registry.getWorkflowsByAgent('@po');

      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThan(0);
    });

    it('should handle agent without @ prefix', () => {
      const workflows = registry.getWorkflowsByAgent('po');
      expect(workflows.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown agent', () => {
      const workflows = registry.getWorkflowsByAgent('@unknown');
      expect(workflows).toEqual([]);
    });
  });

  describe('getStats()', () => {
    it('should return registry statistics', () => {
      const stats = registry.getStats();

      expect(stats.totalWorkflows).toBe(10);
      expect(stats.workflowsWithTransitions).toBe(10);
      expect(stats.totalTransitions).toBeGreaterThan(0);
    });

    it('should report cache status', () => {
      registry.loadWorkflows();
      const stats = registry.getStats();

      expect(stats.cacheValid).toBe(true);
      expect(stats.cacheAge).toBeGreaterThanOrEqual(0);
    });
  });

  describe('normalizeCommand()', () => {
    it('should normalize command strings', () => {
      expect(registry.normalizeCommand('CREATE-EPIC')).toBe('create-epic');
      expect(registry.normalizeCommand('*create-epic')).toBe('create-epic');
      expect(registry.normalizeCommand('create-epic completed')).toBe('create-epic');
    });

    it('should handle null input', () => {
      expect(registry.normalizeCommand(null)).toBe('');
    });
  });

  describe('DEFAULT_CACHE_TTL', () => {
    it('should be 5 minutes', () => {
      expect(DEFAULT_CACHE_TTL).toBe(5 * 60 * 1000);
    });
  });
});
