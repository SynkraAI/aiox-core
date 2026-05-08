/**
 * @fileoverview OpenAI-compatible HTTP Provider
 *
 * Generic provider for APIs that implement the OpenAI Chat Completions
 * contract, including Moonshot/Kimi and other compatible gateways.
 */

const { AIProvider } = require('./ai-provider');

const DEFAULT_ENDPOINT = '/chat/completions';
const DEFAULT_TIMEOUT = 300000;

/**
 * OpenAI-compatible HTTP provider implementation.
 *
 * @class OpenAICompatibleProvider
 * @extends AIProvider
 */
class OpenAICompatibleProvider extends AIProvider {
  /**
   * Create an OpenAI-compatible provider.
   *
   * @param {Object} [config={}] - Provider configuration
   * @param {string} [config.name='openai-compatible'] - Provider display name
   * @param {string} [config.baseURL] - API base URL
   * @param {string} [config.baseUrl] - Alias for baseURL
   * @param {string} [config.endpoint='/chat/completions'] - Chat completions endpoint relative to baseURL
   * @param {string} [config.apiKey] - Direct API key value
   * @param {string} [config.apiKeyEnv='OPENAI_API_KEY'] - Environment variable containing the API key
   * @param {string} [config.model] - Default model identifier
   * @param {Function} [config.fetch] - Fetch implementation for tests or custom runtimes
   */
  constructor(config = {}) {
    const providerName = config.name || 'openai-compatible';
    const safeOptions = buildProviderOptions(config);

    super({
      name: providerName,
      command: 'http',
      timeout: config.timeout || DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries || 3,
      options: safeOptions,
    });

    this.baseURL = this._normalizeBaseURL(config.baseURL || config.baseUrl);
    this.endpoint = this._normalizeEndpoint(config.endpoint || DEFAULT_ENDPOINT);
    this.apiKey = config.apiKey;
    this.apiKeyEnv = config.apiKeyEnv || 'OPENAI_API_KEY';
    this.model = config.model;
    this.fetchFn = config.fetch || globalThis.fetch;
  }

  /**
   * Check local provider readiness without performing an external API call.
   *
   * @returns {Promise<boolean>} True if fetch and API key are available
   */
  async checkAvailability(options = {}) {
    if (typeof this.fetchFn !== 'function') {
      this.isAvailable = false;
      this.lastError = new Error('fetch API is not available in this runtime');
      return false;
    }

    if (!this._resolveApiKey(options)) {
      this.isAvailable = false;
      this.lastError = new Error(`${this.name} API key is not configured`);
      return false;
    }

    this.isAvailable = true;
    this.version = this.model || null;
    this.lastError = null;
    return true;
  }

  /**
   * Execute a prompt using an OpenAI-compatible Chat Completions API.
   *
   * @param {string} prompt - Prompt to send
   * @param {Object} [options={}] - Execution options
   * @returns {Promise<AIResponse>} The AI response
   */
  async execute(prompt, options = {}) {
    const startTime = Date.now();
    const apiKey = this._resolveApiKey(options);
    const model = options.model || this.model || this.options.model;

    if (typeof this.fetchFn !== 'function') {
      throw new Error(`[${this.name}] fetch API is not available in this runtime`);
    }

    if (!apiKey) {
      throw new Error(
        `[${this.name}] API key is not configured. Set ${this.apiKeyEnv} or provide apiKey.`,
      );
    }

    if (!model) {
      throw new Error(`[${this.name}] model is required for OpenAI-compatible execution`);
    }

    const timeout = options.timeout || this.timeout;
    const controller = this._createAbortController();
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeout) : null;

    try {
      const response = await this.fetchFn(this._buildURL(options), {
        method: 'POST',
        headers: this._buildHeaders(apiKey, options),
        body: JSON.stringify(this._buildPayload(prompt, model, options)),
        signal: controller?.signal,
      });

      const duration = Date.now() - startTime;
      const responseBody = await this._readResponseBody(response);

      if (!response.ok) {
        throw new Error(
          `[${this.name}] request failed with status ${response.status}: ${this._sanitizeError(
            this._stringifyBody(responseBody),
            apiKey,
          )}`,
        );
      }

      const output = this._extractOutput(responseBody);

      return {
        success: true,
        output,
        data: responseBody,
        metadata: {
          duration,
          provider: this.name,
          model,
          usage: responseBody?.usage,
          id: responseBody?.id,
        },
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`[${this.name}] request timed out after ${timeout}ms`);
      }

      throw new Error(this._sanitizeError(error.message, apiKey));
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Get provider information without exposing secrets.
   *
   * @returns {Object} Provider info
   */
  getInfo() {
    return {
      ...super.getInfo(),
      baseURL: this.baseURL,
      endpoint: this.endpoint,
      model: this.model,
      apiKeyEnv: this.apiKeyEnv,
      hasApiKey: Boolean(this._resolveApiKey()),
    };
  }

  _buildURL(options = {}) {
    const baseURL = this._normalizeBaseURL(options.baseURL || options.baseUrl || this.baseURL);
    const endpoint = this._normalizeEndpoint(options.endpoint || this.endpoint);
    return `${baseURL}${endpoint}`;
  }

  _buildHeaders(apiKey, options = {}) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(this.options.headers || {}),
      ...(options.headers || {}),
    };
  }

  _buildPayload(prompt, model, options = {}) {
    const messages = options.messages ||
      this.options.messages || [{ role: 'user', content: prompt }];
    const payload = {
      model,
      messages,
      ...(this.options.requestOptions || {}),
      ...(this.options.extraBody || {}),
      ...(options.requestOptions || {}),
      ...(options.extraBody || {}),
      ...(options.body || {}),
    };

    this._copyDefined(payload, 'temperature', options.temperature ?? this.options.temperature);
    this._copyDefined(
      payload,
      'top_p',
      options.top_p ?? options.topP ?? this.options.top_p ?? this.options.topP,
    );
    this._copyDefined(
      payload,
      'max_tokens',
      options.max_tokens ?? options.maxTokens ?? this.options.max_tokens ?? this.options.maxTokens,
    );
    this._copyDefined(payload, 'n', options.n ?? this.options.n);
    this._copyDefined(
      payload,
      'presence_penalty',
      options.presence_penalty ??
        options.presencePenalty ??
        this.options.presence_penalty ??
        this.options.presencePenalty,
    );
    this._copyDefined(
      payload,
      'frequency_penalty',
      options.frequency_penalty ??
        options.frequencyPenalty ??
        this.options.frequency_penalty ??
        this.options.frequencyPenalty,
    );
    this._copyDefined(payload, 'tools', options.tools ?? this.options.tools);
    this._copyDefined(
      payload,
      'tool_choice',
      options.tool_choice ??
        options.toolChoice ??
        this.options.tool_choice ??
        this.options.toolChoice,
    );
    this._copyDefined(payload, 'thinking', options.thinking ?? this.options.thinking);
    this._copyDefined(
      payload,
      'response_format',
      options.response_format ??
        options.responseFormat ??
        this.options.response_format ??
        this.options.responseFormat,
    );

    return payload;
  }

  async _readResponseBody(response) {
    const contentType = response.headers?.get?.('content-type') || '';

    if (contentType.includes('application/json')) {
      return await response.json();
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  }

  _extractOutput(responseBody) {
    const choice = responseBody?.choices?.[0];
    const content = choice?.message?.content ?? choice?.text ?? responseBody?.text ?? '';

    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') return part;
          return part?.text || part?.content || '';
        })
        .filter(Boolean)
        .join('\n')
        .trim();
    }

    if (typeof content === 'string') {
      return content.trim();
    }

    if (content == null) {
      return '';
    }

    return JSON.stringify(content);
  }

  _resolveApiKey(options = {}) {
    return options.apiKey || this.apiKey || process.env[this.apiKeyEnv];
  }

  _sanitizeError(message, apiKey) {
    if (!message) return message;

    let sanitized = String(message);
    if (apiKey) {
      sanitized = sanitized.split(apiKey).join('[REDACTED]');
    }

    return sanitized.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/g, 'Bearer [REDACTED]');
  }

  _stringifyBody(body) {
    if (typeof body === 'string') return body;
    return JSON.stringify(body);
  }

  _normalizeBaseURL(baseURL) {
    if (!baseURL) {
      throw new Error(`[${this.name}] baseURL is required`);
    }
    return String(baseURL).replace(/\/+$/, '');
  }

  _normalizeEndpoint(endpoint) {
    const normalized = String(endpoint || DEFAULT_ENDPOINT);
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  _copyDefined(target, key, value) {
    if (value !== undefined) {
      target[key] = value;
    }
  }

  _createAbortController() {
    if (typeof AbortController === 'undefined') {
      return null;
    }

    return new AbortController();
  }
}

function buildProviderOptions(config) {
  const { apiKey: _apiKey, fetch: _fetch, name: _name, ...safeConfig } = config;

  return {
    ...safeConfig,
    endpoint: safeConfig.endpoint || DEFAULT_ENDPOINT,
    baseURL: safeConfig.baseURL || safeConfig.baseUrl,
    apiKeyEnv: safeConfig.apiKeyEnv || 'OPENAI_API_KEY',
    model: safeConfig.model,
    headers: safeConfig.headers || {},
    requestOptions: safeConfig.requestOptions || {},
    extraBody: safeConfig.extraBody || {},
  };
}

module.exports = { OpenAICompatibleProvider };
