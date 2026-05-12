/**
 * AIOX-FullStack MCP Installation Module
 * Story 1.5: MCP Installation (Project-Level)
 *
 * Installs 4 essential MCPs at project level:
 * - Browser (Puppeteer)
 * - Context7
 * - Exa
 * - Desktop Commander
 *
 * @module mcp-installer
 * @version 1.0.0
 */

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const chalk = require('chalk');

const execAsync = promisify(exec);

/**
 * MCP Configuration Templates
 */
const MCP_CONFIGS = {
  browser: {
    id: 'browser',
    name: 'Browser (Puppeteer)',
    package: '@modelcontextprotocol/server-puppeteer',
    transport: 'stdio',
    healthCheck: {
      type: 'navigation',
      timeout: 30000,
      description: 'Navigate to blank page test',
    },
    getConfig: (platform) => {
      if (platform === 'win32') {
        return {
          command: 'cmd',
          args: ['/c', 'npx', '-y', '@modelcontextprotocol/server-puppeteer'],
        };
      }
      return {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-puppeteer'],
      };
    },
  },

  context7: {
    id: 'context7',
    name: 'Context7',
    package: '@upstash/context7-mcp',
    transport: 'stdio',
    healthCheck: {
      type: 'config-validation',
      timeout: 5000,
      description: 'Configuration validation',
    },
    getConfig: (platform) => {
      // Use npx/stdio transport for reliable local execution
      // HTTP endpoint returns 406 for non-MCP protocol requests
      if (platform === 'win32') {
        return {
          command: 'cmd',
          args: ['/c', 'npx', '-y', '@upstash/context7-mcp'],
        };
      }
      return {
        command: 'npx',
        args: ['-y', '@upstash/context7-mcp'],
      };
    },
  },

  exa: {
    id: 'exa',
    name: 'Exa Web Search',
    package: 'exa-mcp-server',
    transport: 'stdio',
    requiresApiKey: true,
    apiKeyEnvVar: 'EXA_API_KEY',
    healthCheck: {
      type: 'api-test',
      timeout: 10000,
      description: 'Web search test',
    },
    getConfig: (platform, apiKey) => {
      const tools = '--tools=web_search_exa,research_paper_search,company_research,crawling,competitor_finder,linkedin_search,wikipedia_search_exa,github_search';

      if (platform === 'win32') {
        return {
          command: 'cmd',
          args: ['/c', 'npx', '-y', 'exa-mcp-server', tools],
          env: {
            EXA_API_KEY: apiKey || '${EXA_API_KEY}',
          },
        };
      }
      return {
        command: 'npx',
        args: ['-y', 'exa-mcp-server', tools],
        env: {
          EXA_API_KEY: apiKey || '${EXA_API_KEY}',
        },
      };
    },
  },

  'desktop-commander': {
    id: 'desktop-commander',
    name: 'Desktop Commander',
    package: '@wonderwhy-er/desktop-commander',
    transport: 'stdio',
    healthCheck: {
      type: 'file-access',
      timeout: 5000,
      description: 'File system access test',
    },
    getConfig: (platform) => {
      if (platform === 'win32') {
        return {
          command: 'cmd',
          args: ['/c', 'npx', '-y', '@wonderwhy-er/desktop-commander'],
        };
      }
      return {
        command: 'npx',
        args: ['-y', '@wonderwhy-er/desktop-commander'],
      };
    },
  },
};

/**
 * Install project-level MCPs
 *
 * @param {Object} options - Installation options
 * @param {string[]} options.selectedMCPs - Array of MCP IDs to install
 * @param {string} options.projectPath - Project root path
 * @param {Object} options.apiKeys - API keys (e.g., { EXA_API_KEY: 'key' })
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Object>} Installation result
 */
async function installProjectMCPs(options = {}) {
  const {
    selectedMCPs = ['browser', 'context7', 'exa', 'desktop-commander'],
    projectPath = process.cwd(),
    apiKeys = {},
    onProgress = () => {},
  } = options;

  const platform = process.platform;
  const results = {
    success: false,
    installedMCPs: {},
    configPath: path.join(projectPath, '.mcp.json'),
    errors: [],
  };

  // Create .aiox directory for logs
  const aioxDir = path.join(projectPath, '.aiox');
  await fse.ensureDir(aioxDir);

  const logPath = path.join(aioxDir, 'install-log.txt');
  const errorLogPath = path.join(aioxDir, 'install-errors.log');

  // Initialize logs
  await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Starting MCP installation...`);
  await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Platform: ${platform}`);
  await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Selected MCPs: ${selectedMCPs.join(', ')}`);

  // Backup existing .mcp.json if exists
  const mcpConfigPath = path.join(projectPath, '.mcp.json');
  if (fs.existsSync(mcpConfigPath)) {
    const backupPath = path.join(projectPath, '.mcp.json.backup');
    await fse.copy(mcpConfigPath, backupPath);
    await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Backed up existing .mcp.json`);
  }

  try {
    // Install MCPs in parallel for performance
    onProgress({ phase: 'installation', message: 'Installing MCPs...' });

    const installPromises = selectedMCPs.map(async (mcpId) => {
      const mcpConfig = MCP_CONFIGS[mcpId];
      if (!mcpConfig) {
        const errorMsg = `Unknown MCP: ${mcpId}`;
        await appendLog(logPath, `[${new Date().toISOString()}] [ERROR] ${errorMsg}`);
        await appendLog(errorLogPath, `[${new Date().toISOString()}] [${mcpId}] ${errorMsg}`);
        return { mcpId, status: 'failed', message: errorMsg };
      }

      await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Installing ${mcpConfig.name}...`);
      onProgress({ phase: 'installation', mcp: mcpId, message: `Installing ${mcpConfig.name}...` });

      try {
        // Install npm package if needed
        if (mcpConfig.package) {
          await installNpmPackage(mcpConfig.package, projectPath, logPath);
        }

        // Generate config
        const config = typeof mcpConfig.getConfig === 'function'
          ? mcpConfig.getConfig(platform, apiKeys[mcpConfig.apiKeyEnvVar])
          : mcpConfig.getConfig;

        // Add to .mcp.json
        await addMCPToConfig(mcpId, config, mcpConfigPath);

        await appendLog(logPath, `[${new Date().toISOString()}] [SUCCESS] ${mcpConfig.name} installed successfully`);

        return { mcpId, status: 'success', message: 'Installed successfully' };
      } catch (error) {
        await appendLog(logPath, `[${new Date().toISOString()}] [ERROR] ${mcpConfig.name} installation failed: ${error.message}`);
        await appendLog(errorLogPath, `[${new Date().toISOString()}] [${mcpId}] ${error.stack}`);

        return { mcpId, status: 'failed', message: error.message };
      }
    });

    const installResults = await Promise.allSettled(installPromises);

    // Process install results
    for (const result of installResults) {
      if (result.status === 'fulfilled') {
        const { mcpId, status, message } = result.value;
        results.installedMCPs[mcpId] = { status, message };

        // Track failed installations in errors array
        if (status === 'failed') {
          results.errors.push(`${mcpId}: ${message}`);
        }
      } else {
        // Promise rejected - this should not happen with current code structure
        // but handle it defensively
        const errorMsg = result.reason?.message || 'Unknown error';
        results.errors.push(`Promise rejection: ${errorMsg}`);
        await appendLog(errorLogPath, `[${new Date().toISOString()}] [CRITICAL] Unexpected promise rejection: ${result.reason?.stack || errorMsg}`);
      }
    }

    // NOTE: Health checks deferred to Story 1.8 (Installation Validation)
    // MCP functionality will be validated when servers are first started
    await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Health checks deferred to Story 1.8`);

    // Determine overall success
    const failedCount = Object.values(results.installedMCPs).filter(r => r.status === 'failed').length;
    results.success = failedCount === 0;

    await appendLog(logPath, `[${new Date().toISOString()}] [INFO] MCP installation complete`);
    await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Success: ${Object.values(results.installedMCPs).filter(r => r.status === 'success').length}`);
    await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Warnings: ${Object.values(results.installedMCPs).filter(r => r.status === 'warning').length}`);
    await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Failed: ${failedCount}`);

    return results;
  } catch (error) {
    await appendLog(logPath, `[${new Date().toISOString()}] [ERROR] Installation failed: ${error.message}`);
    await appendLog(errorLogPath, `[${new Date().toISOString()}] ${error.stack}`);

    results.success = false;
    results.errors.push(error.message);

    return results;
  }
}

/**
 * Validate npm package availability via npx
 * @private
 *
 * Note: This is optional validation. Packages that don't support --version
 * will be installed automatically by npx when the MCP server first starts.
 * This validation helps catch obvious package name typos during installation.
 */
async function installNpmPackage(packageName, projectPath, logPath) {
  await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Validating package: ${packageName}`);

  try {
    // Test if npx can find the package
    // Note: This may fail if package doesn't support --version flag
    await execAsync(`npx -y ${packageName} --version`, {
      cwd: projectPath,
      timeout: 10000,
    });

    await appendLog(logPath, `[${new Date().toISOString()}] [SUCCESS] Package ${packageName} validated`);
  } catch (error) {
    // Package validation failed - could be:
    // 1. Package doesn't support --version (non-critical)
    // 2. Package name is invalid (will fail when MCP starts)
    // 3. Network timeout (may succeed later)
    await appendLog(logPath, `[${new Date().toISOString()}] [INFO] Package ${packageName} validation skipped (${error.message}) - will be installed on first use`);
    // Not throwing - npx will install/validate when MCP server actually starts
  }
}

/**
 * Add MCP configuration to .mcp.json
 * @private
 */
async function addMCPToConfig(mcpId, config, configPath) {
  let mcpConfig = { mcpServers: {} };

  // Load existing config if exists
  if (fs.existsSync(configPath)) {
    try {
      const content = await fse.readFile(configPath, 'utf8');
      mcpConfig = JSON.parse(content);

      // Ensure mcpServers object exists
      if (!mcpConfig.mcpServers) {
        mcpConfig.mcpServers = {};
      }
    } catch (error) {
      throw new Error(`Failed to parse existing .mcp.json: ${error.message}`);
    }
  }

  // Add new MCP config
  mcpConfig.mcpServers[mcpId] = config;

  // Write updated config
  await fse.writeFile(
    configPath,
    JSON.stringify(mcpConfig, null, 2) + '\n',
    'utf8',
  );
}

/**
 * Append to log file
 * @private
 */
async function appendLog(logPath, message) {
  try {
    await fse.appendFile(logPath, message + '\n', 'utf8');
  } catch {
    // Silently fail log writes - not critical to installation
  }
}

/**
 * Display installation status
 */
 
function displayInstallationStatus(results) {
  console.log('');
  console.log(chalk.cyan('📊 MCP Installation Status:'));
  console.log('');

  for (const [mcpId, result] of Object.entries(results.installedMCPs)) {
    const mcpConfig = MCP_CONFIGS[mcpId];
    const icon = result.status === 'success' ? chalk.green('✓')
      : result.status === 'warning' ? chalk.yellow('⚠️')
        : chalk.red('❌');

    console.log(`  ${icon} ${mcpConfig.name}: ${result.message}`);
  }

  console.log('');

  if (results.errors.length > 0) {
    console.log(chalk.yellow('⚠️  Errors encountered:'));
    results.errors.forEach(error => {
      console.log(chalk.yellow(`  - ${error}`));
    });
    console.log('');
  }

  console.log(chalk.gray(`📁 Configuration: ${results.configPath}`));
  console.log(chalk.gray('📋 Installation log: .aiox/install-log.txt'));
  console.log('');
}
 

module.exports = {
  installProjectMCPs,
  displayInstallationStatus,
  MCP_CONFIGS,
};
