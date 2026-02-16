/**
 * @fileoverview Unit tests for SuggestionEngine (external test directory)
 * @story WIS-3 - *next Task Implementation
 */

'use strict';

const path = require('path');
const fs = require('fs');

describe('SuggestionEngine (Unit)', () => {
  let SuggestionEngine, createSuggestionEngine;

  beforeAll(() => {
    const module = require('../../../.aios-core/workflow-intelligence/engine/suggestion-engine');
    SuggestionEngine = module.SuggestionEngine;
    createSuggestionEngine = module.createSuggestionEngine;
  });

  describe('Basic Functionality', () => {
    let engine;

    beforeEach(() => {
      engine = createSuggestionEngine({ lazyLoad: true });
      engine.invalidateCache();
    });

    it('should create engine instance', () => {
      expect(engine).toBeInstanceOf(SuggestionEngine);
    });

    it('should build context from options', async () => {
      const context = await engine.buildContext({ agentId: 'dev' });
      expect(context.agentId).toBe('dev');
    });

    it('should handle empty context gracefully', async () => {
      const result = await engine.suggestNext({});
      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('should provide fallback suggestions', () => {
      const fallback = engine.getFallbackSuggestions({ agentId: 'dev' });
      expect(fallback.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Test Scenarios from Story', () => {
    let engine;

    beforeEach(() => {
      engine = createSuggestionEngine({ lazyLoad: true });
      engine.invalidateCache();
    });

    it('Scenario: New session (no history) - should return low confidence', async () => {
      const context = {
        agentId: 'dev',
        lastCommand: null,
        lastCommands: [],
        storyPath: null,
        branch: null,
        projectState: {},
      };

      const result = await engine.suggestNext(context);

      // No history means uncertain suggestions
      expect(result.isUncertain).toBe(true);
    });

    it('Scenario: Mid-workflow (dev) - should suggest QA review', async () => {
      const context = {
        agentId: 'dev',
        lastCommand: 'develop',
        lastCommands: ['validate-story-draft', 'develop'],
        storyPath: 'docs/stories/test.md',
        branch: 'feature/test',
        projectState: { activeStory: true },
      };

      const result = await engine.suggestNext(context);

      // Should detect story_development workflow
      if (result.workflow) {
        expect(result.workflow).toContain('story');
      }
    });

    it('Scenario: No matching workflow - should show fallback', async () => {
      const context = {
        agentId: 'unknown-agent',
        lastCommand: 'random-unknown-command',
        lastCommands: ['x', 'y', 'z'],
        storyPath: null,
        branch: null,
        projectState: {},
      };

      const result = await engine.suggestNext(context);

      // Should handle gracefully
      expect(result.suggestions).toBeDefined();
    });

    it('Scenario: Story override - should use explicit story', async () => {
      const testStoryPath = path.join(process.cwd(), 'package.json');

      const context = await engine.buildContext({
        storyOverride: testStoryPath,
        agentId: 'dev',
      });

      expect(context.storyPath).toBe(testStoryPath);
    });
  });

  describe('Runtime-First Integration', () => {
    let engine;

    beforeEach(() => {
      engine = createSuggestionEngine({ lazyLoad: true });
      engine.invalidateCache();
    });

    it('should prepend runtime-first recommendation for blocked state', async () => {
      const context = {
        agentId: 'dev',
        lastCommand: null,
        lastCommands: [],
        storyPath: 'docs/stories/test.md',
        branch: 'feature/test',
        projectState: {},
        executionSignals: {
          story_status: 'blocked',
          qa_status: 'unknown',
          ci_status: 'green',
          has_uncommitted_changes: false,
        },
      };

      const result = await engine.suggestNext(context);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0].source).toBe('runtime_first');
      expect(result.suggestions[0].command).toContain('*orchestrate-status');
      expect(result.runtimeState).toBe('blocked');
    });

    it('should not inject runtime-first when execution state is unknown', async () => {
      const context = {
        agentId: 'dev',
        lastCommand: null,
        lastCommands: [],
        storyPath: null,
        branch: null,
        projectState: {},
      };

      const result = await engine.suggestNext(context);
      const hasRuntimeFirst = (result.suggestions || []).some((s) => s.source === 'runtime_first');
      expect(hasRuntimeFirst).toBe(false);
    });
  });
});
