/**
 * OpenAI-Compatible Provider Tests
 * Story 184.1
 */

const {
  AIProvider,
} = require('../../../.aiox-core/infrastructure/integrations/ai-providers/ai-provider');
const {
  OpenAICompatibleProvider,
} = require('../../../.aiox-core/infrastructure/integrations/ai-providers/openai-compatible-provider');

function jsonResponse(body, overrides = {}) {
  return {
    ok: true,
    status: 200,
    headers: {
      get: () => 'application/json',
    },
    json: jest.fn().mockResolvedValue(body),
    ...overrides,
  };
}

describe('OpenAICompatibleProvider', () => {
  const originalMoonshotKey = process.env.MOONSHOT_API_KEY;
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.fn();
    delete process.env.MOONSHOT_API_KEY;
  });

  afterEach(() => {
    if (originalMoonshotKey === undefined) {
      delete process.env.MOONSHOT_API_KEY;
    } else {
      process.env.MOONSHOT_API_KEY = originalMoonshotKey;
    }
  });

  it('extends AIProvider and keeps HTTP transport metadata', () => {
    const provider = new OpenAICompatibleProvider({
      name: 'kimi',
      baseURL: 'https://api.moonshot.ai/v1',
      apiKeyEnv: 'MOONSHOT_API_KEY',
      model: 'kimi-k2.5',
      fetch: fetchMock,
    });

    expect(provider).toBeInstanceOf(AIProvider);
    expect(provider.name).toBe('kimi');
    expect(provider.command).toBe('http');
    expect(provider.options.apiKey).toBeUndefined();
    expect(provider.options.fetch).toBeUndefined();
    expect(provider.getInfo()).toMatchObject({
      name: 'kimi',
      baseURL: 'https://api.moonshot.ai/v1',
      endpoint: '/chat/completions',
      model: 'kimi-k2.5',
      apiKeyEnv: 'MOONSHOT_API_KEY',
      hasApiKey: false,
    });
  });

  it('checks local availability without external network calls', async () => {
    const provider = new OpenAICompatibleProvider({
      baseURL: 'https://api.moonshot.ai/v1',
      apiKeyEnv: 'MOONSHOT_API_KEY',
      model: 'kimi-k2.5',
      fetch: fetchMock,
    });

    await expect(provider.checkAvailability()).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();

    process.env.MOONSHOT_API_KEY = 'moonshot-test-key';

    await expect(provider.checkAvailability()).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('executes a chat completion request and returns AIResponse metadata', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: 'chatcmpl-test',
        choices: [{ message: { content: 'Hello from Kimi' } }],
        usage: { total_tokens: 12 },
      }),
    );

    const provider = new OpenAICompatibleProvider({
      name: 'kimi',
      baseUrl: 'https://api.moonshot.ai/v1/',
      apiKey: 'direct-secret',
      model: 'kimi-k2.5',
      fetch: fetchMock,
    });

    const response = await provider.execute('Say hello');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.moonshot.ai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer direct-secret',
          'Content-Type': 'application/json',
        }),
      }),
    );

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(requestBody).toMatchObject({
      model: 'kimi-k2.5',
      messages: [{ role: 'user', content: 'Say hello' }],
    });
    expect(response).toMatchObject({
      success: true,
      output: 'Hello from Kimi',
      metadata: {
        provider: 'kimi',
        model: 'kimi-k2.5',
        usage: { total_tokens: 12 },
        id: 'chatcmpl-test',
      },
    });
  });

  it('supports custom messages and OpenAI-style generation options', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        choices: [{ message: { content: [{ type: 'text', text: 'structured response' }] } }],
      }),
    );

    const provider = new OpenAICompatibleProvider({
      baseURL: 'https://gateway.example/v1',
      apiKey: 'gateway-key',
      model: 'gateway-model',
      fetch: fetchMock,
    });

    const response = await provider.execute('ignored when messages exist', {
      messages: [
        { role: 'system', content: 'Be concise' },
        { role: 'user', content: 'Hi' },
      ],
      temperature: 0.2,
      maxTokens: 128,
      extraBody: { thinking: { type: 'disabled' } },
    });

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(requestBody).toMatchObject({
      model: 'gateway-model',
      messages: [
        { role: 'system', content: 'Be concise' },
        { role: 'user', content: 'Hi' },
      ],
      temperature: 0.2,
      max_tokens: 128,
      thinking: { type: 'disabled' },
    });
    expect(response.output).toBe('structured response');
  });

  it('fails safely when the API key is missing', async () => {
    const provider = new OpenAICompatibleProvider({
      baseURL: 'https://api.moonshot.ai/v1',
      apiKeyEnv: 'MOONSHOT_API_KEY',
      model: 'kimi-k2.5',
      fetch: fetchMock,
    });

    await expect(provider.execute('hello')).rejects.toThrow('API key is not configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('redacts secrets from API error messages', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: { message: 'Invalid key direct-secret in Authorization: Bearer direct-secret' } },
        { ok: false, status: 401 },
      ),
    );

    const provider = new OpenAICompatibleProvider({
      baseURL: 'https://api.moonshot.ai/v1',
      apiKey: 'direct-secret',
      model: 'kimi-k2.5',
      fetch: fetchMock,
    });

    await expect(provider.execute('hello')).rejects.toThrow('REDACTED');
    await expect(provider.execute('hello')).rejects.not.toThrow('direct-secret');
  });

  it('reports timeout errors from aborted requests', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    fetchMock.mockRejectedValue(abortError);

    const provider = new OpenAICompatibleProvider({
      baseURL: 'https://api.moonshot.ai/v1',
      apiKey: 'direct-secret',
      model: 'kimi-k2.5',
      timeout: 10,
      fetch: fetchMock,
    });

    await expect(provider.execute('hello')).rejects.toThrow('request timed out after 10ms');
  });
});
