/**
 * @fileoverview Integration tests for Workflow Intelligence System
 * @story WIS-2 - Workflow Registry Enhancement
 */

'use strict';

const wis = require('../index');

describe('Workflow Intelligence System Integration', () => {
  beforeEach(() => {
    wis.reset();
  });

  afterEach(() => {
    wis.invalidateCache();
  });

  describe('Context → Workflow Match → Scored Suggestions flow', () => {
    it('should provide scored suggestions for epic creation context', () => {
      // Need 2 matching commands to meet trigger_threshold
      const context = {
        lastCommand: 'create-story',
        lastCommands: ['create-epic', 'create-story'],
        agentId: '@po',
        projectState: {},
      };

      const suggestions = wis.getSuggestions(context);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('command');
      expect(suggestions[0]).toHaveProperty('confidence');
      expect(suggestions[0].workflow).toBe('epic_creation');
    });

    it('should provide scored suggestions for story development context', () => {
      const context = {
        lastCommand: 'validate-story-draft',
        lastCommands: ['validate-story-draft', 'develop'],
        agentId: '@po',
        projectState: {},
      };

      const suggestions = wis.getSuggestions(context);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].workflow).toBe('story_development');
    });

    it('should return empty array for unrecognized context', () => {
      const context = {
        lastCommand: 'random-unknown-command',
        lastCommands: ['random-unknown-command'],
        agentId: '@unknown',
        projectState: {},
      };

      const suggestions = wis.getSuggestions(context);
      expect(suggestions).toEqual([]);
    });

    it('should rank suggestions by confidence', () => {
      const context = {
        lastCommand: 'create-story',
        lastCommands: ['create-epic', 'create-story'],
        agentId: '@sm',
        projectState: {},
      };

      const suggestions = wis.getSuggestions(context);

      if (suggestions.length > 1) {
        expect(suggestions[0].confidence).toBeGreaterThanOrEqual(suggestions[1].confidence);
      }
    });

    it('should include workflow and state information', () => {
      // Need 2 matching commands to meet trigger_threshold
      const context = {
        lastCommand: 'create-story',
        lastCommands: ['create-epic', 'create-story'],
        agentId: '@po',
        projectState: {},
      };

      const suggestions = wis.getSuggestions(context);

      expect(suggestions[0].workflow).toBe('epic_creation');
      expect(suggestions[0].state).toBeDefined();
    });
  });

  describe('End-to-end workflow navigation', () => {
    it('should navigate through epic creation workflow', () => {
      // Need 2 commands to meet trigger_threshold
      const context1 = {
        lastCommand: 'create-story',
        lastCommands: ['create-epic', 'create-story'],
        agentId: '@po',
        projectState: {},
      };

      const suggestions1 = wis.getSuggestions(context1);
      // Should suggest validation after stories created
      expect(
        suggestions1.some(
          (s) => s.command === 'validate-story-draft' || s.command === 'create-next-story',
        ),
      ).toBe(true);

      // Step 2: After validation
      const context2 = {
        lastCommand: 'validate-story-draft',
        lastCommands: ['create-epic', 'create-story', 'validate-story-draft'],
        agentId: '@sm',
        projectState: {},
      };

      const suggestions2 = wis.getSuggestions(context2);
      expect(
        suggestions2.some((s) => s.command === 'analyze-impact' || s.command === 'develop'),
      ).toBe(true);
    });

    it('should navigate through story development workflow', () => {
      // Step 1: Story validated - need 2 commands to meet trigger threshold
      const context1 = {
        lastCommand: 'validate-story-draft',
        lastCommands: ['validate-story-draft', 'develop'],
        agentId: '@po',
        projectState: {},
      };

      const suggestions1 = wis.getSuggestions(context1);
      if (suggestions1.length > 0) {
        const hasDevelopCommand = suggestions1.some(
          (s) => s.command.includes('develop') || s.command.includes('review'),
        );
        expect(hasDevelopCommand).toBe(true);
      }
    });

    it('should navigate through database workflow', () => {
      // Need 2 commands to meet trigger threshold
      const context = {
        lastCommand: 'db-schema-audit',
        lastCommands: ['db-domain-modeling', 'db-schema-audit'],
        agentId: '@data-engineer',
        projectState: {},
      };

      const suggestions = wis.getSuggestions(context);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].workflow).toBe('database_workflow');
    });
  });

  describe('Multi-agent workflow support', () => {
    it('should support multiple agents in epic creation', () => {
      const poWorkflows = wis.getWorkflowsByAgent('@po');
      const smWorkflows = wis.getWorkflowsByAgent('@sm');

      const epicInPo = poWorkflows.some((w) => w.name === 'epic_creation');
      const epicInSm = smWorkflows.some((w) => w.name === 'epic_creation');

      expect(epicInPo).toBe(true);
      expect(epicInSm).toBe(true);
    });

    it('should support agent transitions within workflow', () => {
      // PO validates story - need 2 matching commands
      const poContext = {
        lastCommand: 'validate-story-draft',
        lastCommands: ['validate-story-draft', 'develop'],
        agentId: '@po',
        projectState: {},
      };

      const poSuggestions = wis.getSuggestions(poContext);
      expect(poSuggestions.length).toBeGreaterThan(0);

      // Dev implements
      const devContext = {
        lastCommand: 'develop',
        lastCommands: ['validate-story-draft', 'develop'],
        agentId: '@dev',
        projectState: {},
      };

      const devSuggestions = wis.getSuggestions(devContext);
      expect(devSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Public API completeness', () => {
    it('should expose matchWorkflow function', () => {
      const match = wis.matchWorkflow(['create-epic', 'create-story']);
      expect(match).not.toBeNull();
      expect(match.name).toBe('epic_creation');
    });

    it('should expose getNextSteps function', () => {
      const steps = wis.getNextSteps('epic_creation', 'epic_drafted');
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
    });

    it('should expose getTransitions function', () => {
      const transition = wis.getTransitions('epic_creation', 'epic_drafted');
      expect(transition).not.toBeNull();
      expect(transition.trigger).toBeDefined();
    });

    it('should expose getWorkflow function', () => {
      const workflow = wis.getWorkflow('epic_creation');
      expect(workflow).not.toBeNull();
      expect(workflow.description).toBeDefined();
    });

    it('should expose getWorkflowNames function', () => {
      const names = wis.getWorkflowNames();
      expect(names.length).toBe(10);
    });

    it('should expose getWorkflowsByAgent function', () => {
      const workflows = wis.getWorkflowsByAgent('@po');
      expect(workflows.length).toBeGreaterThan(0);
    });

    it('should expose findCurrentState function', () => {
      const state = wis.findCurrentState('epic_creation', 'create-epic');
      expect(state).toBe('epic_drafted');
    });

    it('should expose getStats function', () => {
      const stats = wis.getStats();
      expect(stats.totalWorkflows).toBe(10);
      expect(stats.workflowsWithTransitions).toBe(10);
    });

    it('should expose factory functions', () => {
      expect(typeof wis.createWorkflowRegistry).toBe('function');
      expect(typeof wis.createConfidenceScorer).toBe('function');
    });

    it('should expose class constructors', () => {
      expect(wis.WorkflowRegistry).toBeDefined();
      expect(wis.ConfidenceScorer).toBeDefined();
    });

    it('should expose constants', () => {
      expect(wis.SCORING_WEIGHTS).toBeDefined();
      expect(wis.DEFAULT_CACHE_TTL).toBeDefined();
    });
  });

  describe('Cache behavior', () => {
    it('should use cache for repeated calls', () => {
      const stats1 = wis.getStats();
      expect(stats1.cacheValid).toBe(true);

      const stats2 = wis.getStats();
      expect(stats2.cacheValid).toBe(true);
      expect(stats2.cacheAge).toBeGreaterThanOrEqual(stats1.cacheAge);
    });

    it('should invalidate cache when requested', () => {
      wis.getStats(); // Populate cache
      wis.invalidateCache();

      // Force reload
      wis.reset();
      const stats = wis.getStats();
      expect(stats.cacheAge).toBeLessThan(100); // Fresh cache
    });
  });

  describe('Error handling', () => {
    it('should handle missing context gracefully', () => {
      const suggestions = wis.getSuggestions({});
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle null context', () => {
      // This should not throw and return empty array
      const result = wis.getSuggestions(null);
      expect(result).toEqual([]);
    });

    it('should return empty for invalid workflow name', () => {
      const steps = wis.getNextSteps('invalid_workflow', 'any_state');
      expect(steps).toEqual([]);
    });
  });

  describe('All 10 workflows have transitions', () => {
    const workflows = [
      'story_development',
      'epic_creation',
      'backlog_management',
      'architecture_review',
      'git_workflow',
      'database_workflow',
      'code_quality_workflow',
      'documentation_workflow',
      'ux_workflow',
      'research_workflow',
    ];

    workflows.forEach((workflowName) => {
      it(`${workflowName} should have transitions defined`, () => {
        const workflow = wis.getWorkflow(workflowName);
        expect(workflow.transitions).toBeDefined();
        expect(Object.keys(workflow.transitions).length).toBeGreaterThanOrEqual(2);
      });

      it(`${workflowName} should have at least 2 states`, () => {
        const workflow = wis.getWorkflow(workflowName);
        const stateCount = Object.keys(workflow.transitions).length;
        expect(stateCount).toBeGreaterThanOrEqual(2);
      });

      it(`${workflowName} transitions should have required fields`, () => {
        const workflow = wis.getWorkflow(workflowName);

        Object.entries(workflow.transitions).forEach(([state, transition]) => {
          expect(transition.trigger).toBeDefined();
          expect(transition.confidence).toBeDefined();
          expect(transition.confidence).toBeGreaterThanOrEqual(0);
          expect(transition.confidence).toBeLessThanOrEqual(1);
          expect(transition.next_steps).toBeDefined();
          expect(Array.isArray(transition.next_steps)).toBe(true);
        });
      });
    });
  });
});
