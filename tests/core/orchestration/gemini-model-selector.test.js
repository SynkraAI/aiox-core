/**
 * Gemini Model Selector Tests
 * Story GEMINI-INT.16
 */

const {
  GeminiModelSelector,
  MODELS,
  AGENT_OVERRIDES,
} = require('../../../.aiox-core/core/orchestration/gemini-model-selector');

describe('GeminiModelSelector', () => {
  let selector;

  beforeEach(() => {
    selector = new GeminiModelSelector();
  });

  describe('MODELS configuration', () => {
    it('should have flash model configured', () => {
      expect(MODELS.flash).toBeDefined();
      expect(MODELS.flash.id).toBe('gemini-2.0-flash');
      expect(MODELS.flash.bestFor).toContain('simple');
    });

    it('should have pro model configured', () => {
      expect(MODELS.pro).toBeDefined();
      expect(MODELS.pro.id).toBe('gemini-2.0-pro');
      expect(MODELS.pro.bestFor).toContain('complex');
    });

    it('should have cost per token for each model', () => {
      expect(MODELS.flash.costPer1kTokens).toBeLessThan(MODELS.pro.costPer1kTokens);
    });
  });

  describe('AGENT_OVERRIDES', () => {
    it('should have overrides for key agents', () => {
      // Keys no longer have @ prefix (normalized)
      expect(AGENT_OVERRIDES['architect']).toBe('pro');
      expect(AGENT_OVERRIDES['qa']).toBe('flash');
      expect(AGENT_OVERRIDES['dev']).toBe('auto');
    });
  });

  describe('selectModel', () => {
    it('should select model based on task complexity', () => {
      const task = { description: 'Fix typo in readme' };

      const result = selector.selectModel(task);

      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('modelKey');
      expect(result).toHaveProperty('reason');
      expect(result).toHaveProperty('config');
    });

    it('should use agent override when specified', () => {
      const task = { description: 'Design system architecture' };

      const result = selector.selectModel(task, '@architect');

      expect(result.modelKey).toBe('pro');
      expect(result.reason).toBe('agent_override');
    });

    it('should select pro for complex tasks', () => {
      const task = {
        description: 'Design complex architecture with security optimization',
        files: Array(10).fill('file.js'),
        acceptanceCriteria: Array(10).fill('AC'),
      };

      const result = selector.selectModel(task);

      expect(result.modelKey).toBe('pro');
    });
  });

  describe('handleQualityFallback', () => {
    it('should recommend pro when flash quality is low', () => {
      const result = selector.handleQualityFallback('flash', 0.4);

      expect(result).not.toBeNull();
      expect(result.shouldRetry).toBe(true);
      expect(result.newModel).toBe('pro');
    });

    it('should return null when quality is acceptable', () => {
      const result = selector.handleQualityFallback('flash', 0.8);

      expect(result).toBeNull();
    });

    it('should return null for pro model regardless of quality', () => {
      const result = selector.handleQualityFallback('pro', 0.3);

      expect(result).toBeNull();
    });
  });

  describe('trackUsage', () => {
    it('should track flash usage', () => {
      selector.trackUsage('gemini-2.0-flash', 1000);

      const stats = selector.getUsageStats();

      expect(stats.flash.count).toBe(1);
      expect(stats.flash.tokens).toBe(1000);
    });

    it('should track pro usage', () => {
      selector.trackUsage('gemini-2.0-pro', 500);

      const stats = selector.getUsageStats();

      expect(stats.pro.count).toBe(1);
      expect(stats.pro.tokens).toBe(500);
    });

    it('should calculate cost correctly', () => {
      selector.trackUsage('gemini-2.0-flash', 1000);

      const stats = selector.getUsageStats();

      expect(stats.flash.cost).toBeCloseTo(MODELS.flash.costPer1kTokens);
    });
  });

  describe('getUsageStats', () => {
    it('should return complete stats object', () => {
      const stats = selector.getUsageStats();

      expect(stats).toHaveProperty('flash');
      expect(stats).toHaveProperty('pro');
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('flashRatio');
      expect(stats).toHaveProperty('costSavings');
    });

    it('should calculate flash ratio', () => {
      selector.trackUsage('gemini-2.0-flash', 1000);
      selector.trackUsage('gemini-2.0-flash', 1000);
      selector.trackUsage('gemini-2.0-pro', 1000);

      const stats = selector.getUsageStats();

      expect(stats.flashRatio).toBeCloseTo(0.666, 2);
    });
  });
});
