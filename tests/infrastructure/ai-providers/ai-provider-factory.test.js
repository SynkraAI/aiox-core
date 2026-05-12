/**
 * AI Provider Factory Tests
 * Story GEMINI-INT.2
 */

const {
  getProvider,
  getPrimaryProvider,
  getFallbackProvider,
  getProviderForTask,
  executeWithFallback,
  getAvailableProviders,
  getProvidersStatus,
  ClaudeProvider,
  GeminiProvider,
} = require('../../../.aiox-core/infrastructure/integrations/ai-providers/ai-provider-factory');

describe('AI Provider Factory', () => {
  describe('Provider Classes', () => {
    it('should export ClaudeProvider class', () => {
      expect(ClaudeProvider).toBeDefined();
      const provider = new ClaudeProvider();
      expect(provider.name).toBe('claude');
    });

    it('should export GeminiProvider class', () => {
      expect(GeminiProvider).toBeDefined();
      const provider = new GeminiProvider();
      expect(provider.name).toBe('gemini');
    });
  });

  describe('getProvider', () => {
    it('should return claude provider', () => {
      const provider = getProvider('claude');
      expect(provider).toBeDefined();
      expect(provider.name).toBe('claude');
    });

    it('should return gemini provider', () => {
      const provider = getProvider('gemini');
      expect(provider).toBeDefined();
      expect(provider.name).toBe('gemini');
    });

    it('should throw error for unknown provider', () => {
      expect(() => getProvider('unknown')).toThrow('Unknown AI provider');
    });
  });

  describe('getPrimaryProvider', () => {
    it('should return the primary provider', () => {
      const provider = getPrimaryProvider();
      expect(provider).toBeDefined();
      expect(provider.name).toBe('claude');
    });
  });

  describe('getFallbackProvider', () => {
    it('should return the fallback provider', () => {
      const provider = getFallbackProvider();
      expect(provider).toBeDefined();
      expect(provider.name).toBe('gemini');
    });
  });

  describe('getProviderForTask', () => {
    it('should return a provider for any task type', () => {
      const provider = getProviderForTask('simple');
      expect(provider).toBeDefined();
      expect(provider.name).toBeDefined();
    });

    it('should return a provider for unknown task types', () => {
      const provider = getProviderForTask('unknown');
      expect(provider).toBeDefined();
      expect(provider.name).toBeDefined();
    });
  });

  describe('getAvailableProviders', () => {
    it('should return an object or array', () => {
      const providers = getAvailableProviders();
      expect(providers).toBeDefined();
    });
  });

  describe('getProvidersStatus', () => {
    it('should return an object', () => {
      const status = getProvidersStatus();
      expect(typeof status).toBe('object');
    });
  });

  describe('executeWithFallback', () => {
    it('should be a function', () => {
      expect(typeof executeWithFallback).toBe('function');
    });
  });
});
