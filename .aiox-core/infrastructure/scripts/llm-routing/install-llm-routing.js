#!/usr/bin/env node
/**
 * LLM Routing Installation Module
 *
 * Installs claude-max and claude-free commands for cost-effective
 * LLM usage with Claude Code.
 *
 * - claude-max: Uses Claude Max subscription (OAuth)
 * - claude-free: Uses DeepSeek API (~$0.14/M tokens)
 *
 * @module llm-routing
 * @location .aiox-core/infrastructure/scripts/llm-routing/
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';
const LLM_ROUTING_VERSION = '1.1.0'; // Added usage tracking support

/**
 * Get the installation directory for commands
 * @returns {string} Installation directory path
 */
function getInstallDir() {
  if (isWindows) {
    // Try npm global directory first (usually in PATH)
    const appData = process.env.APPDATA;
    if (appData) {
      const npmGlobal = path.join(appData, 'npm');
      // Create npm directory if it doesn't exist
      if (!fs.existsSync(npmGlobal)) {
        fs.mkdirSync(npmGlobal, { recursive: true });
      }
      return npmGlobal;
    }
    // Fallback to user profile when APPDATA is not set
    return os.homedir();
  } else {
    // macOS/Linux: /usr/local/bin or ~/bin
    const localBin = '/usr/local/bin';
    const homeBin = path.join(os.homedir(), 'bin');

    // Check if /usr/local/bin is writable
    try {
      fs.accessSync(localBin, fs.constants.W_OK);
      return localBin;
    } catch {
      // Create ~/bin if it doesn't exist
      if (!fs.existsSync(homeBin)) {
        fs.mkdirSync(homeBin, { recursive: true });
      }
      return homeBin;
    }
  }
}

/**
 * Install LLM Routing commands
 * @param {Object} options - Installation options
 * @param {string} options.projectRoot - Project root directory
 * @param {string} options.templatesDir - Templates directory
 * @param {boolean} options.enableTracking - Enable usage tracking (default: true)
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Installation result
 */
function installLLMRouting(options = {}) {
  const {
    projectRoot = process.cwd(),
    templatesDir = path.join(__dirname, 'templates'),
    enableTracking = true,
    onProgress = console.log,
    onError = console.error
  } = options;

  const result = {
    success: true,
    installDir: null,
    filesInstalled: [],
    envCreated: false,
    errors: []
  };

  // Check templates exist
  if (!fs.existsSync(templatesDir)) {
    result.success = false;
    result.errors.push(`Templates directory not found: ${templatesDir}`);
    onError(`❌ Templates directory not found: ${templatesDir}`);
    return result;
  }

  const installDir = getInstallDir();
  result.installDir = installDir;
  onProgress(`📂 Installing to: ${installDir}`);

  // Determine which scripts to install
  // Use tracked version of claude-free if tracking is enabled
  const claudeFreeScript = enableTracking ? 'claude-free-tracked' : 'claude-free';

  const scripts = isWindows
    ? [`${claudeFreeScript}.cmd`, 'claude-max.cmd', 'deepseek-usage.cmd', 'deepseek-proxy.cmd', 'qwen-router.cmd']
    : [`${claudeFreeScript}.sh`, 'claude-max.sh', 'deepseek-usage.sh', 'deepseek-proxy.sh', 'qwen-router.sh'];

  const targetNames = isWindows
    ? ['claude-free.cmd', 'claude-max.cmd', 'deepseek-usage.cmd', 'deepseek-proxy.cmd', 'aiox-qwen.cmd']
    : ['claude-free', 'claude-max', 'deepseek-usage', 'deepseek-proxy', 'aiox-qwen'];

  // Ensure global bin for helper scripts exists
  const globalAioxBin = path.join(os.homedir(), '.aiox', 'bin');
  if (!fs.existsSync(globalAioxBin)) {
    fs.mkdirSync(globalAioxBin, { recursive: true });
  }

  // Copy helpers
  const bridgeSrc = path.join(__dirname, 'usage-tracker', 'ollama-bridge.js');
  const bridgeDest = path.join(globalAioxBin, 'ollama-bridge.js');
  if (fs.existsSync(bridgeSrc)) {
    fs.copyFileSync(bridgeSrc, bridgeDest);
    onProgress('✅ Installed: ollama-bridge helper');
  }

  // Install each script
  scripts.forEach((script, index) => {
    const src = path.join(templatesDir, script);
    const dest = path.join(installDir, targetNames[index]);

    if (!fs.existsSync(src)) {
      result.success = false;
      result.errors.push(`Source file not found: ${src}`);
      onError(`❌ Source file not found: ${src}`);
      return;
    }

    try {
      fs.copyFileSync(src, dest);

      // Make executable on Unix
      if (!isWindows) {
        fs.chmodSync(dest, 0o755);
      }

      result.filesInstalled.push(targetNames[index]);
      onProgress(`✅ Installed: ${targetNames[index]}`);
    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to install ${targetNames[index]}: ${error.message}`);
      onError(`❌ Failed to install ${targetNames[index]}: ${error.message}`);

      if (!isWindows && error.code === 'EACCES') {
        onProgress(`   Try: sudo node ${process.argv[1]}`);
      }
    }
  });

  // Handle .env file
  const envExample = path.join(projectRoot, '.env.example');
  const envFile = path.join(projectRoot, '.env');

  if (fs.existsSync(envExample) && !fs.existsSync(envFile)) {
    try {
      fs.copyFileSync(envExample, envFile);
      result.envCreated = true;
      onProgress(`✅ Created .env from .env.example`);
    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to create .env: ${error.message}`);
      onError(`❌ Failed to create .env: ${error.message}`);
    }
  }

  // Final guard: if any errors were collected, mark as failure
  if (result.errors.length > 0) {
    result.success = false;
  }

  // Only update ~/.claude.json when installation succeeded
  if (result.success) {
    updateClaudeConfig(enableTracking);
  }

  return result;
}

/**
 * Update ~/.claude.json to mark LLM routing as installed
 * @param {boolean} trackingEnabled - Whether tracking is enabled
 */
function updateClaudeConfig(trackingEnabled = true) {
  const claudeConfigPath = path.join(os.homedir(), '.claude.json');

  try {
    let config = {};

    if (fs.existsSync(claudeConfigPath)) {
      config = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
    }

    config.aioxLLMRouting = {
      version: LLM_ROUTING_VERSION,
      installedAt: new Date().toISOString(),
      commands: ['claude-max', 'claude-free', 'deepseek-usage', 'deepseek-proxy', 'aiox-qwen'],
      trackingEnabled
    };

    fs.writeFileSync(claudeConfigPath, JSON.stringify(config, null, 2));
  } catch {
    // Ignore errors updating config
  }
}

/**
 * Check if LLM Routing is already installed
 * @returns {boolean}
 */
function isLLMRoutingInstalled() {
  const installDir = getInstallDir();

  if (isWindows) {
    return fs.existsSync(path.join(installDir, 'claude-max.cmd')) &&
           fs.existsSync(path.join(installDir, 'claude-free.cmd')) &&
           fs.existsSync(path.join(installDir, 'aiox-qwen.cmd'));
  } else {
    return fs.existsSync(path.join(installDir, 'claude-max')) &&
           fs.existsSync(path.join(installDir, 'claude-free')) &&
           fs.existsSync(path.join(installDir, 'aiox-qwen'));
  }
}

/**
 * Get installation summary for display
 * @param {Object} result - Installation result
 * @returns {string[]} Summary lines
 */
function getInstallationSummary(result) {
  const summary = [];

  if (result.success) {
    summary.push('');
    summary.push('📋 LLM Routing Installation Complete!');
    summary.push('═'.repeat(60));
    summary.push('');
    summary.push('Commands installed:');
    summary.push('  • claude-max      → Uses your Claude Max subscription');
    summary.push('  • claude-free     → Uses DeepSeek (~$0.14/M tokens) with tracking');
    summary.push('  • aiox-qwen       → Uses Qwen 3 14B (Local or Cloud Router)');
    summary.push('  • deepseek-usage  → View usage statistics by alias');
    summary.push('  • deepseek-proxy  → Manage the usage tracking proxy');
    summary.push('');

    if (result.envCreated) {
      summary.push('Next steps:');
      summary.push('  1. Edit .env and add your DEEPSEEK_API_KEY');
      summary.push('     Get key at: https://platform.deepseek.com/api_keys');
      summary.push('');
    }

    summary.push('Usage:');
    summary.push('  claude-max          # Premium Claude experience');
    summary.push('  claude-free         # Cost-effective development (tracked)');
    summary.push('  deepseek-usage      # View all usage stats');
    summary.push('  deepseek-usage <alias>  # Stats for specific alias');
    summary.push('');
    summary.push('Usage data saved to: ~/.aiox/usage-tracking/deepseek-usage.json');
    summary.push('');
  } else {
    summary.push('');
    summary.push('❌ LLM Routing installation failed:');
    result.errors.forEach(err => summary.push(`   • ${err}`));
    summary.push('');
  }

  return summary;
}

// Export for use as module
module.exports = {
  installLLMRouting,
  isLLMRoutingInstalled,
  getInstallDir,
  getInstallationSummary,
  LLM_ROUTING_VERSION
};

// Run if executed directly
if (require.main === module) {
  console.log('\n🚀 AIOX LLM Routing Installer\n');

  const result = installLLMRouting({
    projectRoot: process.cwd(),
    templatesDir: path.join(__dirname, 'templates')
  });

  const summary = getInstallationSummary(result);
  summary.forEach(line => console.log(line));
}
