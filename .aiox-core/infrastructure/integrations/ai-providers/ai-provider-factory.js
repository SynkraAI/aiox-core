/**
 * @fileoverview AI Provider Factory
 *
 * Central factory for creating and managing AI providers (Claude, Gemini, OpenAI-compatible).
 * Automatically selects the correct provider based on .aiox-ai-config.yaml.
 * Supports fallback between providers for reliability.
 *
 * @see Epic GEMINI-INT - Story 2: AI Provider Factory Pattern
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

const { ClaudeProvider } = require('./claude-provider');
const { GeminiProvider } = require('./gemini-provider');
const { OpenAICompatibleProvider } = require('./openai-compatible-provider');

const NON_PROVIDER_CONFIG_KEYS = new Set(['ai_providers', 'model_switching', 'parallel_execution']);

const PROVIDER_ALIASES = {
  openai: 'openai-compatible',
  openai_compatible: 'openai-compatible',
  openaiCompatible: 'openai-compatible',
  moonshot: 'kimi',
};

/**
 * Cached provider instances (singleton pattern)
 * @type {Map<string, AIProvider>}
 */
const providerCache = new Map();

/**
 * Cached configuration
 * @type {Object|null}
 */
let cachedConfig = null;

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  ai_providers: {
    primary: 'claude',
    fallback: 'gemini',
    routing: {
      simple_tasks: 'gemini',
      complex_tasks: 'claude',
    },
  },
  claude: {
    model: 'claude-3-5-sonnet',
    timeout: 300000,
    dangerouslySkipPermissions: false,
  },
  gemini: {
    model: 'gemini-2.0-flash',
    timeout: 300000,
    previewFeatures: true,
    jsonOutput: false,
  },
  'openai-compatible': {
    provider: 'openai-compatible',
    baseURL: 'https://api.openai.com/v1',
    endpoint: '/chat/completions',
    apiKeyEnv: 'OPENAI_API_KEY',
    model: 'gpt-4o-mini',
    timeout: 300000,
  },
  kimi: {
    provider: 'openai-compatible',
    baseURL: 'https://api.moonshot.ai/v1',
    endpoint: '/chat/completions',
    apiKeyEnv: 'MOONSHOT_API_KEY',
    model: 'kimi-k2.5',
    timeout: 300000,
  },
};

/**
 * Load AI provider configuration
 * @param {string} [projectRoot] - Project root directory
 * @returns {Object} Configuration object
 */
function loadConfig(projectRoot = process.cwd()) {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = path.join(projectRoot, '.aiox-ai-config.yaml');

  if (!fs.existsSync(configPath)) {
    console.log('ℹ️  No AI provider config found - using defaults');
    cachedConfig = DEFAULT_CONFIG;
    return cachedConfig;
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const userConfig = yaml.load(configContent);

    // Merge with defaults while preserving custom provider config blocks.
    cachedConfig = {
      ...DEFAULT_CONFIG,
      ...userConfig,
      ai_providers: { ...DEFAULT_CONFIG.ai_providers, ...userConfig?.ai_providers },
      claude: { ...DEFAULT_CONFIG.claude, ...userConfig?.claude },
      gemini: { ...DEFAULT_CONFIG.gemini, ...userConfig?.gemini },
      'openai-compatible': {
        ...DEFAULT_CONFIG['openai-compatible'],
        ...userConfig?.['openai-compatible'],
        ...userConfig?.openai_compatible,
        ...userConfig?.openaiCompatible,
      },
      kimi: { ...DEFAULT_CONFIG.kimi, ...userConfig?.kimi },
    };

    cachedConfig.ai_providers.routing = {
      ...DEFAULT_CONFIG.ai_providers.routing,
      ...userConfig?.ai_providers?.routing,
    };

    Object.defineProperty(cachedConfig, '__configuredProviderKeys', {
      value: Object.keys(userConfig || {}).filter((key) =>
        isProviderConfigKey(key, userConfig[key]),
      ),
      enumerable: false,
      configurable: true,
    });

    return cachedConfig;
  } catch (error) {
    console.warn('⚠️  Error loading AI config:', error.message);
    cachedConfig = DEFAULT_CONFIG;
    return cachedConfig;
  }
}

/**
 * Get or create a provider instance
 * @param {string} providerName - Provider name or alias
 * @param {Object} [config] - Override configuration
 * @returns {AIProvider} Provider instance
 */
function getProvider(providerName, config = null) {
  const normalizedName = normalizeProviderName(providerName);
  const cacheKey = createProviderCacheKey(normalizedName, config);

  if (providerCache.has(cacheKey)) {
    return providerCache.get(cacheKey);
  }

  const fullConfig = loadConfig();
  const providerConfig = config || getProviderConfig(fullConfig, providerName);
  const providerType = normalizeProviderName(providerConfig.provider || normalizedName);

  let provider;

  switch (providerType) {
    case 'claude':
      provider = new ClaudeProvider(providerConfig);
      break;

    case 'gemini':
      provider = new GeminiProvider(providerConfig);
      break;

    case 'kimi':
    case 'openai-compatible':
      provider = new OpenAICompatibleProvider({
        ...providerConfig,
        name: normalizedName,
      });
      break;

    default:
      throw new Error(`Unknown AI provider: ${providerName}`);
  }

  providerCache.set(cacheKey, provider);
  return provider;
}

/**
 * Get the primary AI provider based on configuration
 * @returns {AIProvider} Primary provider instance
 */
function getPrimaryProvider() {
  const config = loadConfig();
  const primaryName = config.ai_providers?.primary || 'claude';

  console.log(`🤖 Using primary AI provider: ${primaryName}`);
  return getProvider(primaryName);
}

/**
 * Get the fallback AI provider based on configuration
 * @returns {AIProvider|null} Fallback provider instance or null
 */
function getFallbackProvider() {
  const config = loadConfig();
  const fallbackName = config.ai_providers?.fallback;

  if (!fallbackName) {
    return null;
  }

  return getProvider(fallbackName);
}

/**
 * Get provider for a specific task type
 * @param {string} taskType - Task type ('simple_tasks', 'complex_tasks', etc.)
 * @returns {AIProvider} Provider for task type
 */
function getProviderForTask(taskType) {
  const config = loadConfig();
  const routing = config.ai_providers?.routing || {};

  const providerName = routing[taskType] || config.ai_providers?.primary || 'claude';
  return getProvider(providerName);
}

/**
 * Execute a prompt with automatic fallback
 *
 * Tries the primary provider first, falls back to secondary on failure.
 *
 * @param {string} prompt - The prompt to execute
 * @param {Object} [options={}] - Execution options
 * @returns {Promise<AIResponse>} AI response
 */
async function executeWithFallback(prompt, options = {}) {
  const primary = getPrimaryProvider();
  const fallback = getFallbackProvider();

  // Check primary availability
  const primaryAvailable = await primary.checkAvailability();

  if (primaryAvailable) {
    try {
      return await primary.executeWithRetry(prompt, options);
    } catch (error) {
      console.warn(`⚠️  Primary provider (${primary.name}) failed: ${error.message}`);

      if (fallback) {
        console.log(`🔄 Falling back to ${fallback.name}...`);
      }
    }
  } else {
    console.warn(`⚠️  Primary provider (${primary.name}) not available`);
  }

  // Try fallback
  if (fallback) {
    const fallbackAvailable = await fallback.checkAvailability();

    if (fallbackAvailable) {
      return await fallback.executeWithRetry(prompt, options);
    } else {
      throw new Error(`Fallback provider (${fallback.name}) is also not available`);
    }
  }

  throw new Error('No AI providers available');
}

/**
 * Get all available providers
 * @returns {Promise<AIProvider[]>} Array of available providers
 */
async function getAvailableProviders() {
  const providers = getConfiguredProviderNames().map((name) => getProvider(name));

  const available = [];
  for (const provider of providers) {
    if (await provider.checkAvailability()) {
      available.push(provider);
    }
  }

  return available;
}

/**
 * Get status of all providers
 * @returns {Promise<Object>} Provider status map
 */
async function getProvidersStatus() {
  const status = {};

  for (const name of getConfiguredProviderNames()) {
    const provider = getProvider(name);
    const isAvailable = await provider.checkAvailability();

    status[name] = {
      available: isAvailable,
      version: provider.version,
      info: provider.getInfo(),
    };
  }

  return status;
}

/**
 * Clear provider cache
 * Forces recreation of provider instances on next call.
 */
function clearProviderCache() {
  providerCache.clear();
  cachedConfig = null;
}

/**
 * Get current configuration
 * @returns {Object} Current configuration
 */
function getConfig() {
  return loadConfig();
}

/**
 * Normalize provider aliases to canonical names.
 *
 * @param {string} providerName - Provider name or alias
 * @returns {string} Normalized provider name
 */
function normalizeProviderName(providerName) {
  const rawName = String(providerName || '').trim();
  const lowerName = rawName.toLowerCase();
  return PROVIDER_ALIASES[rawName] || PROVIDER_ALIASES[lowerName] || lowerName;
}

function createProviderCacheKey(normalizedName, config) {
  return `${normalizedName}:${JSON.stringify(sanitizeCacheConfig(config || {}))}`;
}

function sanitizeCacheConfig(config) {
  const { apiKey, fetch: _fetch, headers, ...safeConfig } = config;
  const sanitized = { ...safeConfig };

  if (apiKey) {
    sanitized.apiKeyHash = hashSecret(apiKey);
  }

  if (headers) {
    sanitized.headers = sanitizeHeaders(headers);
  }

  return sanitized;
}

function sanitizeHeaders(headers) {
  const sanitized = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'authorization' || lowerKey.includes('api-key')) {
      sanitized[key] = value ? `[sha256:${hashSecret(value)}]` : value;
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function hashSecret(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

/**
 * Get merged configuration for a provider.
 *
 * @param {Object} fullConfig - Loaded configuration
 * @param {string} providerName - Requested provider name
 * @returns {Object} Provider configuration
 */
function getProviderConfig(fullConfig, providerName) {
  const normalizedName = normalizeProviderName(providerName);
  const candidateKeys = getProviderConfigKeys(providerName, normalizedName);
  const merged = { ...(DEFAULT_CONFIG[normalizedName] || {}) };

  for (const key of candidateKeys) {
    if (fullConfig[key] && typeof fullConfig[key] === 'object') {
      Object.assign(merged, fullConfig[key]);
    }
  }

  return merged;
}

/**
 * Get known config key variants for a provider.
 *
 * @param {string} providerName - Requested provider name
 * @param {string} normalizedName - Normalized provider name
 * @returns {string[]} Candidate config keys
 */
function getProviderConfigKeys(providerName, normalizedName) {
  const keys = new Set([providerName, normalizedName]);

  if (normalizedName === 'openai-compatible') {
    keys.add('openai_compatible');
    keys.add('openaiCompatible');
  }

  return Array.from(keys).filter(Boolean);
}

/**
 * List providers explicitly selected or configured by the project.
 *
 * @returns {string[]} Provider names
 */
function getConfiguredProviderNames() {
  const config = loadConfig();
  const names = new Set();
  const providerConfig = config.ai_providers || {};

  addProviderName(names, providerConfig.primary || 'claude');
  addProviderName(names, providerConfig.fallback || 'gemini');

  for (const name of Object.values(providerConfig.routing || {})) {
    addProviderName(names, name);
  }

  for (const key of config.__configuredProviderKeys || []) {
    addProviderName(names, key);
  }

  return Array.from(names);
}

function addProviderName(names, providerName) {
  if (providerName) {
    names.add(normalizeProviderName(providerName));
  }
}

function isProviderConfigKey(key, value) {
  if (NON_PROVIDER_CONFIG_KEYS.has(key) || !value || typeof value !== 'object') {
    return false;
  }

  const normalizedKey = normalizeProviderName(key);
  return (
    ['claude', 'gemini', 'kimi', 'openai-compatible'].includes(normalizedKey) ||
    Boolean(value.provider || value.baseURL || value.baseUrl || value.apiKey || value.apiKeyEnv)
  );
}

module.exports = {
  // Provider access
  getProvider,
  getPrimaryProvider,
  getFallbackProvider,
  getProviderForTask,

  // Execution
  executeWithFallback,

  // Status and management
  getAvailableProviders,
  getProvidersStatus,
  clearProviderCache,
  getConfig,

  // Classes for direct use
  ClaudeProvider,
  GeminiProvider,
  OpenAICompatibleProvider,
};
