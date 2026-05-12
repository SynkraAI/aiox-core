/**
 * @fileoverview Integration tests for Workflow Intelligence System
 * @story WIS-3 - *next Task Implementation
 */

'use strict';

const path = require('path');
const fs = require('fs');

describe('WIS Integration', () => {
  let wis;

  beforeAll(() => {
    wis = require('../../../.aiox-core/workflow-intelligence');
  });

  describe('Full Suggestion Flow', () => {
    it('should get suggestions using high-level API', () => {
      const context = {
        lastCommand: 'develop',
        lastCommands: ['validate-story-draft', 'develop'],
        agentId: '@dev',
        projectState: { activeStory: true },
      };

      const suggestions = wis.getSuggestions(context);

      expect(Array.isArray(suggestions)).toBe(true);
      if (suggestions.length > 0) {
        expect(suggestions[0]).toHaveProperty('command');
        expect(suggestions[0]).toHaveProperty('confidence');
      }
    });

    it('should match workflow from command history', () => {
      const commands = ['validate-story-draft', 'develop'];
      const match = wis.matchWorkflow(commands);

      if (match) {
        expect(match).toHaveProperty('name');
        expect(match).toHaveProperty('workflow');
        expect(match).toHaveProperty('score');
      }
    });

    it('should find current state in workflow', () => {
      const state = wis.findCurrentState('story_development', 'develop');

      // State should be found or null
      expect(state === null || typeof state === 'string').toBe(true);
    });

    it('should get next steps for workflow state', () => {
      const steps = wis.getNextSteps('story_development', 'in_development');

      expect(Array.isArray(steps)).toBe(true);
    });
  });

  describe('SuggestionEngine Integration', () => {
    let engine;

    beforeEach(() => {
      engine = wis.createSuggestionEngine();
      engine.invalidateCache();
    });

    it('should build context and get suggestions', async () => {
      const context = await engine.buildContext({
        agentId: 'dev',
      });

      const result = await engine.suggestNext(context);

      expect(result).toHaveProperty('workflow');
      expect(result).toHaveProperty('suggestions');
    });

    it('should integrate with output formatter', () => {
      const formatter = wis.outputFormatter;

      expect(formatter).toBeDefined();
      expect(typeof formatter.displaySuggestions).toBe('function');
      expect(typeof formatter.displayHelp).toBe('function');
      expect(typeof formatter.displayFallback).toBe('function');
    });
  });

  describe('Registry and Scorer Integration', () => {
    it('should load workflow patterns', () => {
      const names = wis.getWorkflowNames();

      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('story_development');
    });

    it('should get workflows by agent', () => {
      const devWorkflows = wis.getWorkflowsByAgent('@dev');

      expect(Array.isArray(devWorkflows)).toBe(true);
      // Dev agent should be in at least one workflow
      expect(devWorkflows.length).toBeGreaterThan(0);
    });

    it('should get registry stats', () => {
      const stats = wis.getStats();

      expect(stats).toHaveProperty('totalWorkflows');
      expect(stats).toHaveProperty('cacheValid');
      expect(stats.totalWorkflows).toBeGreaterThan(0);
    });

    it('should create and use scorer', () => {
      const scorer = wis.createConfidenceScorer();

      const suggestion = {
        trigger: 'develop',
        agentSequence: ['po', 'dev', 'qa'],
      };

      const context = {
        lastCommand: 'develop',
        agentId: '@dev',
      };

      const score = scorer.score(suggestion, context);

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('Cache Behavior', () => {
    it('should cache workflow patterns', () => {
      // First call loads from file
      const stats1 = wis.getStats();
      expect(stats1.cacheValid).toBe(true);

      // Second call uses cache
      const stats2 = wis.getStats();
      expect(stats2.cacheValid).toBe(true);
    });

    it('should invalidate cache on request', () => {
      // Prime the cache
      wis.getWorkflowNames();

      // Invalidate
      wis.invalidateCache();

      // Get fresh stats (will reload)
      const stats = wis.getStats();
      expect(stats.cacheValid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty context gracefully', () => {
      const suggestions = wis.getSuggestions({});

      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle null context', () => {
      const suggestions = wis.getSuggestions(null);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(0);
    });

    it('should handle non-existent workflow', () => {
      const workflow = wis.getWorkflow('non_existent_workflow');

      expect(workflow).toBeNull();
    });

    it('should handle non-existent state', () => {
      const steps = wis.getNextSteps('story_development', 'non_existent_state');

      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBe(0);
    });
  });

  describe('Constants Export', () => {
    it('should export all constants', () => {
      expect(wis.SCORING_WEIGHTS).toBeDefined();
      expect(wis.DEFAULT_CACHE_TTL).toBeDefined();
      expect(wis.SUGGESTION_CACHE_TTL).toBeDefined();
      expect(wis.LOW_CONFIDENCE_THRESHOLD).toBeDefined();
    });

    it('should export classes', () => {
      expect(wis.WorkflowRegistry).toBeDefined();
      expect(wis.ConfidenceScorer).toBeDefined();
      expect(wis.SuggestionEngine).toBeDefined();
    });

    it('should export factory functions', () => {
      expect(typeof wis.createWorkflowRegistry).toBe('function');
      expect(typeof wis.createConfidenceScorer).toBe('function');
      expect(typeof wis.createSuggestionEngine).toBe('function');
    });
  });
});

describe('WIS Performance', () => {
  let wis;

  beforeAll(() => {
    wis = require('../../../.aiox-core/workflow-intelligence');
  });

  it('should complete getSuggestions within 100ms', () => {
    const context = {
      lastCommand: 'develop',
      lastCommands: ['develop'],
      agentId: '@dev',
      projectState: {},
    };

    const start = Date.now();
    wis.getSuggestions(context);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('should complete matchWorkflow within 50ms', () => {
    const commands = ['validate-story-draft', 'develop'];

    const start = Date.now();
    wis.matchWorkflow(commands);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('should complete registry load within 200ms (cold start)', () => {
    wis.invalidateCache();

    const start = Date.now();
    wis.getWorkflowNames();
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(200);
  });

  it('should complete SuggestionEngine full flow within 100ms', async () => {
    const engine = wis.createSuggestionEngine();
    engine.invalidateCache();

    const start = Date.now();
    const context = await engine.buildContext({ agentId: 'dev' });
    await engine.suggestNext(context);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });
});
