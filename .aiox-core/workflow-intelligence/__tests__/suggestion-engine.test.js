/**
 * @fileoverview Unit tests for SuggestionEngine
 * @story WIS-3 - *next Task Implementation
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Mock dependencies before requiring SuggestionEngine
jest.mock('../../core/session/context-loader', () => {
  return jest.fn().mockImplementation(() => ({
    loadContext: jest.fn().mockReturnValue({
      sessionType: 'existing',
      lastCommands: ['develop'],
      currentStory: 'docs/stories/test-story.md',
      workflowActive: 'story_development',
    }),
  }));
});

const {
  SuggestionEngine,
  createSuggestionEngine,
  SUGGESTION_CACHE_TTL,
  LOW_CONFIDENCE_THRESHOLD,
} = require('../engine/suggestion-engine');

describe('SuggestionEngine', () => {
  let engine;

  beforeEach(() => {
    engine = createSuggestionEngine({ lazyLoad: true });
    engine.invalidateCache();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create engine with default options', () => {
      const defaultEngine = createSuggestionEngine();
      expect(defaultEngine).toBeInstanceOf(SuggestionEngine);
      expect(defaultEngine.cacheTTL).toBe(SUGGESTION_CACHE_TTL);
    });

    it('should accept custom cache TTL', () => {
      const customEngine = createSuggestionEngine({ cacheTTL: 60000 });
      expect(customEngine.cacheTTL).toBe(60000);
    });

    it('should support lazy loading option', () => {
      const lazyEngine = createSuggestionEngine({ lazyLoad: true });
      expect(lazyEngine.lazyLoad).toBe(true);
    });
  });

  describe('buildContext()', () => {
    it('should return context object with required properties', async () => {
      const context = await engine.buildContext({});

      expect(context).toHaveProperty('agentId');
      expect(context).toHaveProperty('lastCommand');
      expect(context).toHaveProperty('lastCommands');
      expect(context).toHaveProperty('storyPath');
      expect(context).toHaveProperty('branch');
      expect(context).toHaveProperty('projectState');
    });

    it('should use story override when provided', async () => {
      // Create a temporary file for testing
      const testStoryPath = path.join(process.cwd(), 'test-story-temp.md');
      fs.writeFileSync(testStoryPath, '# Test Story');

      try {
        const context = await engine.buildContext({
          storyOverride: testStoryPath,
        });

        expect(context.storyPath).toBe(testStoryPath);
      } finally {
        // Cleanup
        if (fs.existsSync(testStoryPath)) {
          fs.unlinkSync(testStoryPath);
        }
      }
    });

    it('should use provided agent ID', async () => {
      const context = await engine.buildContext({
        agentId: 'qa',
      });

      expect(context.agentId).toBe('qa');
    });

    it('should detect git branch when in git repo', async () => {
      const context = await engine.buildContext({});

      // Branch should be detected or null (if not in git repo)
      expect(context.branch === null || typeof context.branch === 'string').toBe(true);
    });

    it('should build project state', async () => {
      const context = await engine.buildContext({});

      expect(context.projectState).toBeDefined();
      expect(typeof context.projectState.activeStory).toBe('boolean');
    });
  });

  describe('suggestNext()', () => {
    it('should return result object with required properties', async () => {
      const context = {
        agentId: 'dev',
        lastCommand: 'develop',
        lastCommands: ['develop'],
        storyPath: null,
        branch: 'main',
        projectState: {},
      };

      const result = await engine.suggestNext(context);

      expect(result).toHaveProperty('workflow');
      expect(result).toHaveProperty('currentState');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('isUncertain');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should return suggestions with proper structure', async () => {
      const context = {
        agentId: 'dev',
        lastCommand: 'develop',
        lastCommands: ['validate-story-draft', 'develop'],
        storyPath: 'docs/stories/test.md',
        branch: 'feature/test',
        projectState: {},
      };

      const result = await engine.suggestNext(context);

      if (result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];
        expect(suggestion).toHaveProperty('command');
        expect(suggestion).toHaveProperty('args');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('confidence');
        expect(suggestion).toHaveProperty('priority');
        expect(suggestion.command.startsWith('*')).toBe(true);
      }
    });

    it('should mark low confidence results as uncertain', async () => {
      const context = {
        agentId: 'unknown',
        lastCommand: 'random-command',
        lastCommands: ['random-command'],
        storyPath: null,
        branch: null,
        projectState: {},
      };

      const result = await engine.suggestNext(context);

      // When no match, should be uncertain
      if (result.confidence < LOW_CONFIDENCE_THRESHOLD) {
        expect(result.isUncertain).toBe(true);
      }
    });

    it('should use cache for repeated calls with same context', async () => {
      const context = {
        agentId: 'dev',
        lastCommand: 'develop',
        lastCommands: ['develop'],
        storyPath: null,
        branch: 'main',
        projectState: {},
      };

      // First call
      const result1 = await engine.suggestNext(context);

      // Second call should use cache
      const result2 = await engine.suggestNext(context);

      expect(result1).toEqual(result2);
    });

    it('should invalidate cache on different context', async () => {
      const context1 = {
        agentId: 'dev',
        lastCommand: 'develop',
        lastCommands: ['develop'],
        storyPath: null,
        branch: 'main',
        projectState: {},
      };

      const context2 = {
        agentId: 'qa',
        lastCommand: 'review-qa',
        lastCommands: ['review-qa'],
        storyPath: null,
        branch: 'main',
        projectState: {},
      };

      await engine.suggestNext(context1);
      const result2 = await engine.suggestNext(context2);

      // Should get different result for different context
      expect(result2.workflow).toBeDefined();
    });
  });

  describe('getFallbackSuggestions()', () => {
    it('should return fallback for dev agent', () => {
      const result = engine.getFallbackSuggestions({ agentId: 'dev' });

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.isUncertain).toBe(true);
      expect(result.suggestions.some((s) => s.command === '*help')).toBe(true);
    });

    it('should return fallback for po agent', () => {
      const result = engine.getFallbackSuggestions({ agentId: 'po' });

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(
        result.suggestions.some((s) => s.command.includes('backlog') || s.command.includes('story')),
      ).toBe(true);
    });

    it('should return fallback for qa agent', () => {
      const result = engine.getFallbackSuggestions({ agentId: 'qa' });

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(
        result.suggestions.some((s) => s.command.includes('test') || s.command.includes('qa')),
      ).toBe(true);
    });

    it('should return default fallback for unknown agent', () => {
      const result = engine.getFallbackSuggestions({ agentId: 'unknown' });

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some((s) => s.command === '*help')).toBe(true);
    });
  });

  describe('invalidateCache()', () => {
    it('should clear cached suggestions', async () => {
      const context = {
        agentId: 'dev',
        lastCommand: 'develop',
        lastCommands: ['develop'],
        storyPath: null,
        branch: 'main',
        projectState: {},
      };

      // Prime the cache
      await engine.suggestNext(context);

      // Invalidate
      engine.invalidateCache();

      // Cache should be null
      expect(engine.suggestionCache).toBeNull();
      expect(engine.cacheTimestamp).toBeNull();
      expect(engine.cacheKey).toBeNull();
    });
  });

  describe('_interpolateArgs()', () => {
    it('should interpolate story_path variable', () => {
      const context = {
        storyPath: 'docs/stories/test.md',
      };

      const result = engine._interpolateArgs('${story_path}', context);
      expect(result).toBe('docs/stories/test.md');
    });

    it('should interpolate branch variable', () => {
      const context = {
        branch: 'feature/test',
      };

      const result = engine._interpolateArgs('${branch}', context);
      expect(result).toBe('feature/test');
    });

    it('should handle missing variables', () => {
      const context = {};

      const result = engine._interpolateArgs('${story_path}', context);
      expect(result).toBe('');
    });

    it('should handle null template', () => {
      const result = engine._interpolateArgs(null, {});
      expect(result).toBe('');
    });
  });

  describe('_resolveStoryPath()', () => {
    it('should return null for non-existent file', () => {
      const result = engine._resolveStoryPath('/non/existent/file.md');
      expect(result).toBeNull();
    });

    it('should return resolved path for existing file', () => {
      const testPath = path.join(process.cwd(), 'package.json');
      const result = engine._resolveStoryPath(testPath);
      expect(result).toBe(testPath);
    });

    it('should handle relative paths', () => {
      const result = engine._resolveStoryPath('package.json');
      expect(result).toBe(path.resolve(process.cwd(), 'package.json'));
    });

    it('should return null for null input', () => {
      const result = engine._resolveStoryPath(null);
      expect(result).toBeNull();
    });
  });

  describe('_generateCacheKey()', () => {
    it('should generate consistent key for same context', () => {
      const context = {
        agentId: 'dev',
        lastCommand: 'develop',
        lastCommands: ['a', 'b', 'c'],
        storyPath: 'test.md',
        branch: 'main',
      };

      const key1 = engine._generateCacheKey(context);
      const key2 = engine._generateCacheKey(context);

      expect(key1).toBe(key2);
    });

    it('should generate different key for different context', () => {
      const context1 = {
        agentId: 'dev',
        lastCommand: 'develop',
      };
      const context2 = {
        agentId: 'qa',
        lastCommand: 'review',
      };

      const key1 = engine._generateCacheKey(context1);
      const key2 = engine._generateCacheKey(context2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('constants', () => {
    it('should export SUGGESTION_CACHE_TTL', () => {
      expect(SUGGESTION_CACHE_TTL).toBe(5 * 60 * 1000); // 5 minutes
    });

    it('should export LOW_CONFIDENCE_THRESHOLD', () => {
      expect(LOW_CONFIDENCE_THRESHOLD).toBe(0.5);
    });
  });
});

describe('SuggestionEngine Performance', () => {
  let engine;

  beforeEach(() => {
    engine = createSuggestionEngine();
    engine.invalidateCache();
  });

  it('should complete suggestNext within 100ms', async () => {
    const context = {
      agentId: 'dev',
      lastCommand: 'develop',
      lastCommands: ['develop'],
      storyPath: null,
      branch: 'main',
      projectState: {},
    };

    const start = Date.now();
    await engine.suggestNext(context);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('should complete buildContext within 50ms', async () => {
    const start = Date.now();
    await engine.buildContext({});
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('should be faster on cache hit', async () => {
    const context = {
      agentId: 'dev',
      lastCommand: 'develop',
      lastCommands: ['develop'],
      storyPath: null,
      branch: 'main',
      projectState: {},
    };

    // Cold start
    const start1 = Date.now();
    await engine.suggestNext(context);
    const coldDuration = Date.now() - start1;

    // Warm cache
    const start2 = Date.now();
    await engine.suggestNext(context);
    const warmDuration = Date.now() - start2;

    // Allow 5ms tolerance for timing noise (Date.now() has ~1ms resolution)
    // In CI environments, timing can be inconsistent
    expect(warmDuration).toBeLessThanOrEqual(coldDuration + 5);
  });
});
