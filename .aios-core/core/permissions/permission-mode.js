/**
 * Permission Mode System
 *
 * Controls agent autonomy level with 3 modes:
 * - explore: Read-only, safe exploration
 * - ask: Confirm before changes (default)
 * - auto: Full autonomy (yolo mode)
 *
 * @module permissions/permission-mode
 * @version 1.0.0
 * @inspired-by Craft Agents OSS
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

class PermissionMode {
  /**
   * Available permission modes with their configurations
   */
  static MODES = {
    explore: {
      name: 'Explore',
      icon: '🔍',
      color: 'blue',
      description: 'Read-only mode - safe exploration',
      shortDescription: 'Safe browsing',
      permissions: {
        read: true,
        write: false,
        execute: false,
        delete: false,
      },
    },
    ask: {
      name: 'Ask',
      icon: '⚠️',
      color: 'yellow',
      description: 'Confirm before changes - balanced approach',
      shortDescription: 'Confirm changes',
      permissions: {
        read: true,
        write: 'confirm',
        execute: 'confirm',
        delete: 'confirm',
      },
    },
    auto: {
      name: 'Auto',
      icon: '⚡',
      color: 'green',
      description: 'Full autonomy - trust mode',
      shortDescription: 'Full speed',
      permissions: {
        read: true,
        write: true,
        execute: true,
        delete: true,
      },
    },
  };

  /**
   * Mode cycle order for quick toggle
   */
  static MODE_CYCLE = ['explore', 'ask', 'auto'];

  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.configPath = path.join(projectRoot, '.aios', 'config.yaml');
    this.currentMode = 'ask'; // default
    this._loaded = false;
  }

  /**
   * Load current mode from config
   * @returns {Promise<string>} Current mode name
   */
  async load() {
    if (this._loaded) return this.currentMode;

    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      const config = yaml.load(configContent) || {};
      this.currentMode = config.permissions?.mode || 'ask';

      // Validate mode
      if (!PermissionMode.MODES[this.currentMode]) {
        console.warn(`Invalid mode "${this.currentMode}" in config, defaulting to "ask"`);
        this.currentMode = 'ask';
      }
    } catch (error) {
      // Config doesn't exist or is invalid, use default
      this.currentMode = 'ask';
    }

    this._loaded = true;
    return this.currentMode;
  }

  /**
   * Set permission mode
   * @param {string} mode - Mode name (explore, ask, auto)
   * @returns {Promise<Object>} Mode info
   */
  async setMode(mode) {
    // Handle aliases
    if (mode === 'yolo') mode = 'auto';
    if (mode === 'safe') mode = 'explore';
    if (mode === 'balanced') mode = 'ask';

    if (!PermissionMode.MODES[mode]) {
      const validModes = Object.keys(PermissionMode.MODES).join(', ');
      throw new Error(`Invalid mode: "${mode}". Valid modes: ${validModes}`);
    }

    this.currentMode = mode;
    this._loaded = true;

    // Save to config
    await this._saveToConfig(mode);

    return this.getModeInfo();
  }

  /**
   * Cycle to next mode
   * @returns {Promise<Object>} New mode info
   */
  async cycleMode() {
    await this.load();
    const currentIndex = PermissionMode.MODE_CYCLE.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % PermissionMode.MODE_CYCLE.length;
    const nextMode = PermissionMode.MODE_CYCLE[nextIndex];
    return this.setMode(nextMode);
  }

  /**
   * Get current mode information
   * @returns {Object} Mode info with name, icon, description, permissions
   */
  getModeInfo() {
    const mode = PermissionMode.MODES[this.currentMode];
    return {
      mode: this.currentMode,
      ...mode,
    };
  }

  /**
   * Get mode badge for display in greeting
   * @returns {string} Formatted badge like "[⚠️ Ask]"
   */
  getBadge() {
    const mode = PermissionMode.MODES[this.currentMode];
    return `[${mode.icon} ${mode.name}]`;
  }

  /**
   * Check if an operation is allowed
   * @param {string} operation - Operation type (read, write, execute, delete)
   * @returns {Object} { allowed: boolean|'confirm', reason?: string, message?: string }
   */
  canPerform(operation) {
    const mode = PermissionMode.MODES[this.currentMode];
    const permission = mode.permissions[operation];

    if (permission === true) {
      return { allowed: true };
    }

    if (permission === false) {
      return {
        allowed: false,
        reason: `Blocked in ${mode.name} mode`,
        message: `🔒 Operation "${operation}" is blocked in ${mode.name} mode. Use \`*mode ask\` or \`*mode auto\` to enable.`,
      };
    }

    if (permission === 'confirm') {
      return {
        allowed: 'confirm',
        message: `${mode.icon} Operation "${operation}" requires confirmation in ${mode.name} mode.`,
      };
    }

    return {
      allowed: false,
      reason: 'Unknown operation type',
    };
  }

  /**
   * Check if current mode allows autonomous execution
   * @returns {boolean}
   */
  isAutonomous() {
    return this.currentMode === 'auto';
  }

  /**
   * Check if current mode is read-only
   * @returns {boolean}
   */
  isReadOnly() {
    return this.currentMode === 'explore';
  }

  /**
   * Get help text for modes
   * @returns {string} Markdown formatted help
   */
  static getHelp() {
    let help = '## Permission Modes\n\n';
    help += '| Mode | Icon | Description | Writes | Executes |\n';
    help += '|------|------|-------------|--------|----------|\n';

    for (const [key, mode] of Object.entries(PermissionMode.MODES)) {
      const writes =
        mode.permissions.write === true ? '✅' : mode.permissions.write === 'confirm' ? '⚠️' : '❌';
      const executes =
        mode.permissions.execute === true
          ? '✅'
          : mode.permissions.execute === 'confirm'
            ? '⚠️'
            : '❌';
      help += `| ${key} | ${mode.icon} | ${mode.shortDescription} | ${writes} | ${executes} |\n`;
    }

    help += '\n**Commands:**\n';
    help += '- `*mode` - Show current mode\n';
    help += '- `*mode explore` - Switch to read-only mode\n';
    help += '- `*mode ask` - Switch to confirm mode (default)\n';
    help += '- `*mode auto` - Switch to full autonomy\n';
    help += '- `*yolo` - Alias for `*mode auto`\n';

    return help;
  }

  /**
   * Save mode to config file
   * @private
   */
  async _saveToConfig(mode) {
    let config = {};

    // Try to read existing config
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      config = yaml.load(configContent) || {};
    } catch {
      // Config doesn't exist, will create new
    }

    // Update permissions section
    config.permissions = config.permissions || {};
    config.permissions.mode = mode;

    // Ensure .aios directory exists
    const aiosDir = path.dirname(this.configPath);
    await fs.mkdir(aiosDir, { recursive: true });

    // Write config
    const configYaml = yaml.dump(config, { indent: 2 });
    await fs.writeFile(this.configPath, configYaml, 'utf-8');
  }
}

module.exports = { PermissionMode };
