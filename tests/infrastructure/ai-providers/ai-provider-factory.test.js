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
  clearProviderCache,
  ClaudeProvider,
  GeminiProvider,
  OpenAICompatibleProvider,
} = require('../../../.aiox-core/infrastructure/integrations/ai-providers/ai-provider-factory');

describe('AI Provider Factory', () => {
  const originalMoonshotKey = process.env.MOONSHOT_API_KEY;

  beforeEach(() => {
    clearProviderCache();
    delete process.env.MOONSHOT_API_KEY;
  });

  afterEach(() => {
    clearProviderCache();
    if (originalMoonshotKey === undefined) {
      delete process.env.MOONSHOT_API_KEY;
    } else {
      process.env.MOONSHOT_API_KEY = originalMoonshotKey;
    }
  });

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

    it('should export OpenAICompatibleProvider class', () => {
      expect(OpenAICompatibleProvider).toBeDefined();
      const provider = new OpenAICompatibleProvider({
        baseURL: 'https://api.example.com/v1',
        model: 'example-model',
      });
      expect(provider.name).toBe('openai-compatible');
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

    it('should return kimi provider through the OpenAI-compatible contract', () => {
      const provider = getProvider('kimi');
      expect(provider).toBeDefined();
      expect(provider).toBeInstanceOf(OpenAICompatibleProvider);
      expect(provider.name).toBe('kimi');
      expect(provider.model).toBe('kimi-k2.5');
      expect(provider.baseURL).toBe('https://api.moonshot.ai/v1');
    });

    it('should return openai-compatible provider aliases', () => {
      const provider = getProvider('openai_compatible');
      expect(provider).toBeDefined();
      expect(provider).toBeInstanceOf(OpenAICompatibleProvider);
      expect(provider.name).toBe('openai-compatible');
    });

    it('should support custom providers declared as openai-compatible', () => {
      const provider = getProvider('custom-gateway', {
        provider: 'openai-compatible',
        baseURL: 'https://gateway.example/v1',
        apiKey: 'test-key',
        model: 'gateway-model',
        fetch: jest.fn(),
      });

      expect(provider).toBeInstanceOf(OpenAICompatibleProvider);
      expect(provider.name).toBe('custom-gateway');
      expect(provider.baseURL).toBe('https://gateway.example/v1');
    });

    it('should not reuse custom providers with different inline API keys', () => {
      const first = getProvider('custom-gateway', {
        provider: 'openai-compatible',
        baseURL: 'https://gateway.example/v1',
        apiKey: 'first-test-key',
        model: 'gateway-model',
        fetch: jest.fn(),
      });
      const second = getProvider('custom-gateway', {
        provider: 'openai-compatible',
        baseURL: 'https://gateway.example/v1',
        apiKey: 'second-test-key',
        model: 'gateway-model',
        fetch: jest.fn(),
      });

      expect(first).toBeInstanceOf(OpenAICompatibleProvider);
      expect(second).toBeInstanceOf(OpenAICompatibleProvider);
      expect(first).not.toBe(second);
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
    it('should return an object or array', async () => {
      const providers = await getAvailableProviders();
      expect(providers).toBeDefined();
      expect(Array.isArray(providers)).toBe(true);
    });
  });

  describe('getProvidersStatus', () => {
    it('should return an object', async () => {
      const status = await getProvidersStatus();
      expect(typeof status).toBe('object');
      expect(status).toHaveProperty('claude');
      expect(status).toHaveProperty('gemini');
    });
  });

  describe('executeWithFallback', () => {
    it('should be a function', () => {
      expect(typeof executeWithFallback).toBe('function');
    });
  });
});
