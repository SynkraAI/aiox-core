/**
 * Global Config Manager
 *
 * Manages the global MCP configuration at ~/.aiox/mcp/
 * Handles creation, reading, updating of global config.
 *
 * @module core/mcp/global-config-manager
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const fs = require('fs');
const path = require('path');
const {
  getGlobalAioxDir,
  getGlobalMcpDir,
  getGlobalConfigPath,
  getServersDir,
  getCacheDir,
  getCredentialsDir,
} = require('./os-detector');

/**
 * Default global config structure
 */
const DEFAULT_CONFIG = {
  version: '1.0',
  servers: {},
  defaults: {
    timeout: 30000,
    retries: 3,
  },
};

/**
 * Default server templates for common MCP servers
 */
const SERVER_TEMPLATES = {
  context7: {
    type: 'sse',
    url: 'https://mcp.context7.com/sse',
    enabled: true,
  },
  exa: {
    command: 'npx',
    args: ['-y', 'exa-mcp-server'],
    env: {
      EXA_API_KEY: '${EXA_API_KEY}',
    },
    enabled: true,
  },
  github: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_TOKEN: '${GITHUB_TOKEN}',
    },
    enabled: true,
  },
  puppeteer: {
    command: 'npx',
    args: ['-y', '@anthropic-ai/mcp-server-puppeteer'],
    enabled: true,
  },
  'desktop-commander': {
    command: 'npx',
    args: ['-y', '@anthropic-ai/mcp-server-desktop-commander'],
    enabled: true,
  },
  filesystem: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    enabled: true,
  },
  memory: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    enabled: true,
  },
};

/**
 * Check if global AIOX directory exists
 * @returns {boolean}
 */
function globalDirExists() {
  return fs.existsSync(getGlobalAioxDir());
}

/**
 * Check if global MCP directory exists
 * @returns {boolean}
 */
function globalMcpDirExists() {
  return fs.existsSync(getGlobalMcpDir());
}

/**
 * Check if global config file exists
 * @returns {boolean}
 */
function globalConfigExists() {
  return fs.existsSync(getGlobalConfigPath());
}

/**
 * Create the global directory structure
 * @returns {Object} Result with created directories
 */
function createGlobalStructure() {
  const created = [];
  const errors = [];

  const directories = [
    getGlobalAioxDir(),
    getGlobalMcpDir(),
    getServersDir(),
    getCacheDir(),
    getCredentialsDir(),
  ];

  for (const dir of directories) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        created.push(dir);
      }
    } catch (error) {
      errors.push({ dir, error: error.message });
    }
  }

  // Create .gitignore in credentials directory
  const credentialsGitignore = path.join(getCredentialsDir(), '.gitignore');
  try {
    if (!fs.existsSync(credentialsGitignore)) {
      fs.writeFileSync(credentialsGitignore, '*\n!.gitignore\n');
      created.push(credentialsGitignore);
    }
  } catch (error) {
    errors.push({ file: credentialsGitignore, error: error.message });
  }

  return { created, errors, success: errors.length === 0 };
}

/**
 * Create default global config file
 * @param {Object} initialServers - Optional initial servers to include
 * @returns {Object} Result with config path
 */
function createGlobalConfig(initialServers = {}) {
  const configPath = getGlobalConfigPath();

  if (fs.existsSync(configPath)) {
    return { success: false, error: 'Config already exists', configPath };
  }

  const config = {
    ...DEFAULT_CONFIG,
    servers: { ...initialServers },
  };

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return { success: true, configPath };
  } catch (error) {
    return { success: false, error: error.message, configPath };
  }
}

/**
 * Read global config
 * @returns {Object|null} Config object or null if not exists
 */
function readGlobalConfig() {
  const configPath = getGlobalConfigPath();

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading global config: ${error.message}`);
    return null;
  }
}

/**
 * Write global config
 * @param {Object} config - Config object to write
 * @returns {Object} Result with success status
 */
function writeGlobalConfig(config) {
  const configPath = getGlobalConfigPath();

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return { success: true, configPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Add a server to global config
 * @param {string} serverName - Name of the server
 * @param {Object} serverConfig - Server configuration (optional, uses template if available)
 * @returns {Object} Result with success status
 */
function addServer(serverName, serverConfig = null) {
  const config = readGlobalConfig();

  if (!config) {
    return { success: false, error: 'Global config not found. Run "aiox mcp setup" first.' };
  }

  // Use template if available and no config provided
  if (!serverConfig && SERVER_TEMPLATES[serverName]) {
    serverConfig = { ...SERVER_TEMPLATES[serverName] };
  } else if (!serverConfig) {
    return { success: false, error: `No template available for "${serverName}". Provide server configuration.` };
  }

  // Check if server already exists
  if (config.servers[serverName]) {
    return { success: false, error: `Server "${serverName}" already exists in config.` };
  }

  config.servers[serverName] = serverConfig;

  const writeResult = writeGlobalConfig(config);
  if (!writeResult.success) {
    return writeResult;
  }

  // Also create individual server config file
  const serverFilePath = path.join(getServersDir(), `${serverName}.json`);
  try {
    fs.writeFileSync(serverFilePath, JSON.stringify(serverConfig, null, 2), 'utf8');
  } catch (error) {
    // Non-critical error, main config is updated
    console.warn(`Warning: Could not create server file: ${error.message}`);
  }

  return { success: true, server: serverName };
}

/**
 * Remove a server from global config
 * @param {string} serverName - Name of the server to remove
 * @returns {Object} Result with success status
 */
function removeServer(serverName) {
  const config = readGlobalConfig();

  if (!config) {
    return { success: false, error: 'Global config not found.' };
  }

  if (!config.servers[serverName]) {
    return { success: false, error: `Server "${serverName}" not found in config.` };
  }

  delete config.servers[serverName];

  const writeResult = writeGlobalConfig(config);
  if (!writeResult.success) {
    return writeResult;
  }

  // Also remove individual server config file
  const serverFilePath = path.join(getServersDir(), `${serverName}.json`);
  try {
    if (fs.existsSync(serverFilePath)) {
      fs.unlinkSync(serverFilePath);
    }
  } catch (error) {
    console.warn(`Warning: Could not remove server file: ${error.message}`);
  }

  return { success: true, server: serverName };
}

/**
 * Enable/disable a server
 * @param {string} serverName - Name of the server
 * @param {boolean} enabled - Enable or disable
 * @returns {Object} Result with success status
 */
function setServerEnabled(serverName, enabled) {
  const config = readGlobalConfig();

  if (!config) {
    return { success: false, error: 'Global config not found.' };
  }

  if (!config.servers[serverName]) {
    return { success: false, error: `Server "${serverName}" not found in config.` };
  }

  config.servers[serverName].enabled = enabled;

  return writeGlobalConfig(config);
}

/**
 * Get list of configured servers
 * @returns {Object} Object with server names and their enabled status
 */
function listServers() {
  const config = readGlobalConfig();

  if (!config) {
    return { servers: [], total: 0, enabled: 0 };
  }

  const servers = Object.entries(config.servers).map(([name, cfg]) => ({
    name,
    type: cfg.type || 'command',
    enabled: cfg.enabled !== false,
    url: cfg.url,
    command: cfg.command,
  }));

  return {
    servers,
    total: servers.length,
    enabled: servers.filter(s => s.enabled).length,
  };
}

/**
 * Get available server templates
 * @returns {string[]} List of available template names
 */
function getAvailableTemplates() {
  return Object.keys(SERVER_TEMPLATES);
}

/**
 * Get a server template
 * @param {string} name - Template name
 * @returns {Object|null} Template config or null
 */
function getServerTemplate(name) {
  return SERVER_TEMPLATES[name] ? { ...SERVER_TEMPLATES[name] } : null;
}

module.exports = {
  DEFAULT_CONFIG,
  SERVER_TEMPLATES,
  globalDirExists,
  globalMcpDirExists,
  globalConfigExists,
  createGlobalStructure,
  createGlobalConfig,
  readGlobalConfig,
  writeGlobalConfig,
  addServer,
  removeServer,
  setServerEnabled,
  listServers,
  getAvailableTemplates,
  getServerTemplate,
};
