/**
 * @deprecated Use config-resolver.js for config resolution, agent-config-loader.js for agent configs.
 * This file will be removed in v4.0.0.
 *
 * Migration guide:
 * - Config resolution: const { resolveConfig } = require('./config-resolver');
 *                      const config = await resolveConfig(projectRoot);
 * - Agent config:      const { AgentConfigLoader } = require('./agent-config-loader');
 *                      const loader = new AgentConfigLoader(agentId);
 *                      const config = await loader.load(coreConfig);
 * - Single section:    const config = await loadConfigSections([sectionName]);
 *                      const section = config[sectionName];
 *
 * AIOX Config Loader with Lazy Loading
 *
 * Intelligent configuration loader that only loads what each agent needs,
 * significantly reducing memory footprint and load times.
 *
 * @module core/config/config-loader
 * @version 1.0.0
 * @created 2025-01-16 (Story 6.1.2.6)
 * @migrated Story 2.2 - Core Module Creation
 * @deprecated Since Story 6.1.4 - Use agent-config-loader.js instead
 * @deprecated Since Story PRO-4 - Use config-resolver.js for layered config resolution
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Config cache with TTL
 */
const configCache = {
  full: null,
  sections: {},
  lastLoad: null,
  TTL: 5 * 60 * 1000,  // 5 minutes
};

/**
 * Agent requirements mapping (from agent-config-requirements.yaml)
 */
const agentRequirements = {
  dev: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations', 'pvMindContext', 'hybridOpsConfig'],
  qa: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  po: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  pm: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading'],
  sm: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  architect: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  analyst: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  'data-engineer': ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations', 'pvMindContext', 'hybridOpsConfig'],
  devops: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  'aiox-master': ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'registry', 'expansionPacks', 'toolConfigurations'],
  'ux-expert': ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  'db-sage': ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations', 'pvMindContext', 'hybridOpsConfig'],
  security: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
};

/**
 * Always-loaded sections (lightweight, needed by all)
 */
const ALWAYS_LOADED = [
  'frameworkDocsLocation',
  'projectDocsLocation',
  'devLoadAlwaysFiles',
  'lazyLoading',
];

/**
 * Performance tracking
 */
const performanceMetrics = {
  loads: 0,
  cacheHits: 0,
  cacheMisses: 0,
  avgLoadTime: 0,
  totalLoadTime: 0,
};

/**
 * Checks whether the in-memory configuration cache is still valid.
 *
 * @returns {boolean} True when a cache timestamp exists and is still within the TTL window.
 */
function isCacheValid() {
  if (!configCache.lastLoad) return false;

  const now = Date.now();
  const age = now - configCache.lastLoad;

  return age < configCache.TTL;
}

/**
 * Loads the full core-config.yaml file from disk.
 *
 * Used for initial load or cache refresh. The parsed result is stored in the
 * in-memory cache and performance metrics are updated for observability.
 *
 * @returns {Promise<Object>} Parsed configuration object.
 * @throws {Error} If the config file cannot be read or parsed.
 */
async function loadFullConfig() {
  const configPath = path.join('.aiox-core', 'core-config.yaml');

  const startTime = Date.now();

  try {
    const content = await fs.readFile(configPath, 'utf8');
    const config = yaml.load(content);

    const loadTime = Date.now() - startTime;

    // Update performance metrics
    performanceMetrics.loads++;
    performanceMetrics.totalLoadTime += loadTime;
    performanceMetrics.avgLoadTime = performanceMetrics.totalLoadTime / performanceMetrics.loads;

    // Cache full config
    configCache.full = config;
    configCache.lastLoad = Date.now();

    return config;
  } catch (error) {
    console.error('Failed to load core-config.yaml:', error.message);
    throw new Error(`Config load failed: ${error.message}`);
  }
}

/**
 * Loads specific config sections on demand
 *
 * Uses the cached full config when possible; otherwise reloads the full config
 * and returns only the requested sections. Unknown sections are omitted.
 *
 * @param {string[]} sections - Array of section names to load
 * @returns {Promise<Object>} Config object containing the requested sections
 * @throws {Error} If config file cannot be read or parsed on cache miss.
 */
async function loadConfigSections(sections) {
  const startTime = Date.now();

  // Check cache first
  if (isCacheValid() && configCache.full) {
    performanceMetrics.cacheHits++;

    const config = {};
    sections.forEach(section => {
      if (configCache.full[section] !== undefined) {
        config[section] = configCache.full[section];
      }
    });

    return config;
  }

  // Cache miss - load full config
  performanceMetrics.cacheMisses++;
  const fullConfig = await loadFullConfig();

  // Extract requested sections
  const config = {};
  sections.forEach(section => {
    if (fullConfig[section] !== undefined) {
      config[section] = fullConfig[section];
    }
  });

  const loadTime = Date.now() - startTime;
  console.log(`⚡ Loaded ${sections.length} sections in ${loadTime}ms`);

  return config;
}

/**
 * Loads config for a specific agent with lazy loading.
 *
 * Only sections listed in the agent requirements map are loaded. Unknown agent
 * IDs fall back to the always-loaded baseline sections.
 *
 * @param {string} agentId - Agent ID (e.g., 'dev', 'qa', 'po')
 * @returns {Promise<Object>} Config object with sections needed by the agent
 * @throws {Error} If config file cannot be read or parsed.
 *
 * @example
 * const config = await loadAgentConfig('dev');
 * console.log(config.frameworkDocsLocation);
 */
async function loadAgentConfig(agentId) {
  const startTime = Date.now();

  // Get required sections for this agent
  const requiredSections = agentRequirements[agentId] || ALWAYS_LOADED;

  console.log(`📦 Loading config for @${agentId} (${requiredSections.length} sections)...`);

  const config = await loadConfigSections(requiredSections);

  const loadTime = Date.now() - startTime;

  // Calculate size estimate
  const sizeKB = (JSON.stringify(config).length / 1024).toFixed(1);

  console.log(`✅ Config loaded in ${loadTime}ms (~${sizeKB} KB)`);

  return config;
}

/**
 * Loads the always-loaded baseline configuration sections.
 *
 * This lightweight subset is enough for startup paths that do not need
 * agent-specific or tool-specific configuration yet.
 *
 * @returns {Promise<Object>} Minimal config with always-loaded sections
 * @throws {Error} If config file cannot be read or parsed.
 */
async function loadMinimalConfig() {
  return await loadConfigSections(ALWAYS_LOADED);
}

/**
 * Preloads the full configuration into the in-memory cache.
 *
 * Useful during startup when subsequent commands need config access without
 * paying the initial disk-read cost.
 *
 * @returns {Promise<void>}
 * @throws {Error} If config file cannot be read or parsed.
 */
async function preloadConfig() {
  console.log('🔄 Preloading config into cache...');
  await loadFullConfig();
  console.log('✅ Config preloaded');
}

/**
 * Clears the full config cache and section cache.
 *
 * Useful for tests or for forcing the next config access to read fresh data
 * from disk.
 *
 * @returns {void}
 */
function clearCache() {
  configCache.full = null;
  configCache.sections = {};
  configCache.lastLoad = null;
  console.log('🗑️ Config cache cleared');
}

/**
 * Gets configuration loader performance metrics.
 *
 * @returns {Object} Performance statistics including load counts, cache hit rate, and average load time.
 */
function getPerformanceMetrics() {
  return {
    ...performanceMetrics,
    cacheHitRate: (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) > 0
      ? ((performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses)) * 100).toFixed(1) + '%'
      : '0%',
    avgLoadTimeMs: Math.round(performanceMetrics.avgLoadTime),
  };
}

/**
 * Validates that required sections exist in config for a specific agent.
 *
 * Loads the full config and checks each section required by the agent
 * requirements map. Unknown agent IDs validate against the always-loaded
 * baseline sections.
 *
 * @param {string} agentId - Agent ID to validate
 * @returns {Promise<{valid: boolean, agentId: string, requiredSections: string[], missingSections: string[], availableSections: string[]}>} Validation result
 * @throws {Error} If config file cannot be read or parsed.
 */
async function validateAgentConfig(agentId) {
  const requiredSections = agentRequirements[agentId] || ALWAYS_LOADED;

  const config = await loadFullConfig();

  const missingSections = requiredSections.filter(
    section => config[section] === undefined,
  );

  return {
    valid: missingSections.length === 0,
    agentId,
    requiredSections,
    missingSections,
    availableSections: Object.keys(config),
  };
}

/**
 * Gets a single config section on demand.
 *
 * Uses the same lazy loading and cache behavior as loadConfigSections.
 *
 * @param {string} sectionName - Section to load
 * @returns {Promise<*>} Section content, or undefined if the section is not present
 *
 * @example
 * const tools = await getConfigSection('toolConfigurations');
 */
async function getConfigSection(sectionName) {
  const config = await loadConfigSections([sectionName]);
  return config[sectionName];
}

// Export functions
module.exports = {
  loadAgentConfig,
  loadConfigSections,
  loadMinimalConfig,
  loadFullConfig,
  preloadConfig,
  clearCache,
  getPerformanceMetrics,
  validateAgentConfig,
  getConfigSection,
  agentRequirements,
  ALWAYS_LOADED,
};
