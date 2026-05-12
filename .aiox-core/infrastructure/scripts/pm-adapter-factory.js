/**
 * @fileoverview PM Adapter Factory
 *
 * Central factory for creating and caching PM tool adapters.
 * Automatically selects the correct adapter based on .aiox-pm-config.yaml.
 *
 * Falls back to LocalAdapter if no PM tool is configured, ensuring
 * AIOX works 100% standalone without external dependencies.
 *
 * @see Story 3.20 - PM Tool-Agnostic Integration (TR-3.20.7)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { ClickUpAdapter } = require('../integrations/pm-adapters/clickup-adapter');
const { GitHubProjectsAdapter } = require('../integrations/pm-adapters/github-adapter');
const { JiraAdapter } = require('../integrations/pm-adapters/jira-adapter');
const { LocalAdapter } = require('../integrations/pm-adapters/local-adapter');

/**
 * Cached adapter instance (singleton pattern)
 * @type {PMAdapter|null}
 */
let cachedAdapter = null;

/**
 * Get PM adapter instance based on configuration
 *
 * Reads .aiox-pm-config.yaml from project root and instantiates
 * the appropriate adapter. Caches the adapter for subsequent calls.
 *
 * Falls back to LocalAdapter if:
 * - No .aiox-pm-config.yaml file exists
 * - Config file has type: 'local'
 * - Config file is malformed
 *
 * @returns {PMAdapter} Configured PM adapter instance
 *
 * @example
 * const adapter = getPMAdapter();
 * const result = await adapter.syncStory('/path/to/story.yaml');
 */
function getPMAdapter() {
  // Return cached adapter if available
  if (cachedAdapter) {
    return cachedAdapter;
  }

  const configPath = path.join(process.cwd(), '.aiox-pm-config.yaml');

  // If no PM config file, use local-only adapter
  if (!fs.existsSync(configPath)) {
    console.log('ℹ️  No PM tool configured - using local-only mode');
    console.log('   To configure a PM tool, run: aiox init');
    cachedAdapter = new LocalAdapter();
    return cachedAdapter;
  }

  try {
    // Read and parse config file
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent);

    if (!config || !config.pm_tool) {
      console.warn('⚠️  Invalid PM config file - using local-only mode');
      cachedAdapter = new LocalAdapter();
      return cachedAdapter;
    }

    const toolType = config.pm_tool.type;
    const toolConfig = config.pm_tool.config || {};

    // Create appropriate adapter based on type
    switch (toolType) {
      case 'clickup':
        console.log('📌 Using ClickUp adapter');
        cachedAdapter = new ClickUpAdapter(toolConfig);
        break;

      case 'github-projects':
        console.log('📌 Using GitHub Projects adapter');
        cachedAdapter = new GitHubProjectsAdapter(toolConfig);
        break;

      case 'jira':
        console.log('📌 Using Jira adapter');
        cachedAdapter = new JiraAdapter(toolConfig);
        break;

      case 'local':
      default:
        console.log('📌 Using Local-only adapter (no PM tool)');
        cachedAdapter = new LocalAdapter();
        break;
    }

    return cachedAdapter;

  } catch (error) {
    console.error('❌ Error loading PM config:', error.message);
    console.log('   Falling back to local-only mode');
    cachedAdapter = new LocalAdapter();
    return cachedAdapter;
  }
}

/**
 * Clear cached adapter instance
 *
 * Forces the next call to getPMAdapter() to re-read the config file
 * and create a new adapter instance.
 *
 * Useful when:
 * - PM configuration has changed
 * - Testing different adapters
 * - Switching between projects
 *
 * @example
 * clearAdapterCache();
 * const newAdapter = getPMAdapter();  // Re-reads config
 */
function clearAdapterCache() {
  cachedAdapter = null;
}

/**
 * Get current PM tool type without creating adapter
 *
 * Reads .aiox-pm-config.yaml and returns the tool type.
 * Returns 'local' if no config or config is invalid.
 *
 * @returns {string} PM tool type ('clickup', 'github-projects', 'jira', 'local')
 *
 * @example
 * const toolType = getPMToolType();
 * if (toolType !== 'local') {
 *   console.log(`PM tool configured: ${toolType}`);
 * }
 */
function getPMToolType() {
  const configPath = path.join(process.cwd(), '.aiox-pm-config.yaml');

  if (!fs.existsSync(configPath)) {
    return 'local';
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent);

    return config?.pm_tool?.type || 'local';
  } catch (error) {
    return 'local';
  }
}

/**
 * Check if PM tool is configured (not local-only)
 *
 * @returns {boolean} True if external PM tool configured, false if local-only
 *
 * @example
 * if (isPMToolConfigured()) {
 *   console.log('External PM tool is configured');
 * } else {
 *   console.log('Running in local-only mode');
 * }
 */
function isPMToolConfigured() {
  const toolType = getPMToolType();
  return toolType !== 'local';
}

module.exports = {
  getPMAdapter,
  clearAdapterCache,
  getPMToolType,
  isPMToolConfigured,
};
