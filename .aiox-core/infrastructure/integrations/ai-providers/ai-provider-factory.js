/**
 * @fileoverview AI Provider Factory
 *
 * Central factory for creating and managing AI providers (Claude, Gemini).
 * Automatically selects the correct provider based on .aiox-ai-config.yaml.
 * Supports fallback between providers for reliability.
 *
 * @see Epic GEMINI-INT - Story 2: AI Provider Factory Pattern
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { ClaudeProvider } = require('./claude-provider');
const { GeminiProvider } = require('./gemini-provider');

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

    // Merge with defaults
    cachedConfig = {
      ai_providers: { ...DEFAULT_CONFIG.ai_providers, ...userConfig?.ai_providers },
      claude: { ...DEFAULT_CONFIG.claude, ...userConfig?.claude },
      gemini: { ...DEFAULT_CONFIG.gemini, ...userConfig?.gemini },
    };

    return cachedConfig;
  } catch (error) {
    console.warn('⚠️  Error loading AI config:', error.message);
    cachedConfig = DEFAULT_CONFIG;
    return cachedConfig;
  }
}

/**
 * Get or create a provider instance
 * @param {string} providerName - Provider name ('claude' or 'gemini')
 * @param {Object} [config] - Override configuration
 * @returns {AIProvider} Provider instance
 */
function getProvider(providerName, config = null) {
  const cacheKey = `${providerName}:${JSON.stringify(config || {})}`;

  if (providerCache.has(cacheKey)) {
    return providerCache.get(cacheKey);
  }

  const fullConfig = loadConfig();
  const providerConfig = config || fullConfig[providerName] || {};

  let provider;

  switch (providerName.toLowerCase()) {
    case 'claude':
      provider = new ClaudeProvider(providerConfig);
      break;

    case 'gemini':
      provider = new GeminiProvider(providerConfig);
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
  const providers = [getProvider('claude'), getProvider('gemini')];

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

  for (const name of ['claude', 'gemini']) {
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
};
