#!/usr/bin/env node
/**
 * AIOS Notification System Installer
 *
 * Safely merges notification hooks into ~/.claude/settings.json
 * without overwriting existing user configuration.
 *
 * Usage:
 *   node install-notifications.js              # Install with interactive prompts
 *   node install-notifications.js --silent     # Install without prompts
 *   node install-notifications.js --dry-run    # Preview changes without writing
 *
 * @module infrastructure/scripts/notifications/install-notifications
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const NOTIFICATION_VERSION = '1.0.0';
const HOME = os.homedir();
const CLAUDE_SETTINGS_PATH = path.join(HOME, '.claude', 'settings.json');
const AIOS_NOTIFICATIONS_DIR = path.join(HOME, '.aios', 'notifications');
const AIOS_CONFIG_PATH = path.join(AIOS_NOTIFICATIONS_DIR, 'config.yaml');

/**
 * Resolve the path to notification-player.js
 * Uses the project-local .aios-core if available, otherwise fallback
 * @param {Object} options
 * @returns {string} Absolute path to notification-player.js
 */
function resolvePlayerPath(options = {}) {
  if (options.projectDir) {
    const projectPlayer = path.join(options.projectDir, '.aios-core', 'scripts', 'notification-player.js');
    if (fs.existsSync(projectPlayer)) return projectPlayer;
  }

  // Try to find it relative to this script
  const localPlayer = path.resolve(__dirname, '..', '..', '..', 'scripts', 'notification-player.js');
  if (fs.existsSync(localPlayer)) return localPlayer;

  // Fallback: global ~/.aios path
  return path.join(HOME, '.aios', 'scripts', 'notification-player.js');
}

/**
 * Read and parse ~/.claude/settings.json
 * @returns {Object} Parsed settings or empty object
 */
function readClaudeSettings() {
  try {
    if (fs.existsSync(CLAUDE_SETTINGS_PATH)) {
      const content = fs.readFileSync(CLAUDE_SETTINGS_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`  Warning: Could not parse ${CLAUDE_SETTINGS_PATH}: ${err.message}`);
  }
  return {};
}

/**
 * Check if AIOS notification hook is already installed
 * @param {Object} settings - Claude settings object
 * @returns {boolean}
 */
function isAlreadyInstalled(settings) {
  const notifications = settings?.hooks?.Notification;
  if (!Array.isArray(notifications)) return false;

  return notifications.some(
    entry => entry.hooks?.some(h => h.command?.includes('notification-player.js'))
  );
}

/**
 * Check if there's a legacy powershell beep hook
 * @param {Object} settings - Claude settings object
 * @returns {number} Index of legacy hook, or -1
 */
function findLegacyHook(settings) {
  const notifications = settings?.hooks?.Notification;
  if (!Array.isArray(notifications)) return -1;

  return notifications.findIndex(
    entry => entry.hooks?.some(h =>
      h.command?.includes('[console]::beep') && !h.command?.includes('notification-player.js')
    )
  );
}

/**
 * Build the hook entry for settings.json
 * @param {string} playerPath - Path to notification-player.js
 * @param {string[]} events - Event matchers
 * @returns {Object} Hook entry
 */
function buildHookEntry(playerPath, events = ['permission_prompt', 'elicitation_dialog']) {
  // Normalize path separators for the command
  const normalizedPath = playerPath.replace(/\\/g, '/');

  return {
    matcher: events.join('|'),
    hooks: [
      {
        type: 'command',
        command: `node "${normalizedPath}"`,
        timeout: 5,
      },
    ],
  };
}

/**
 * Merge notification hook into settings
 * @param {Object} settings - Current settings
 * @param {string} playerPath - Path to player script
 * @param {Object} options - Install options
 * @returns {Object} Updated settings
 */
function mergeHook(settings, playerPath, options = {}) {
  const updated = JSON.parse(JSON.stringify(settings));

  // Ensure hooks structure exists
  updated.hooks = updated.hooks || {};
  updated.hooks.Notification = updated.hooks.Notification || [];

  // Handle legacy powershell hook
  const legacyIndex = findLegacyHook(updated);
  if (legacyIndex >= 0) {
    console.log('  Found legacy PowerShell beep hook - replacing with cross-platform version.');
    updated.hooks.Notification.splice(legacyIndex, 1);
  }

  // Add AIOS hook
  const hookEntry = buildHookEntry(playerPath);
  updated.hooks.Notification.push(hookEntry);

  return updated;
}

/**
 * Copy config template to user directory
 */
function installConfigTemplate() {
  if (fs.existsSync(AIOS_CONFIG_PATH)) {
    console.log('  Config already exists, keeping current configuration.');
    return;
  }

  // Create directory
  fs.mkdirSync(AIOS_NOTIFICATIONS_DIR, { recursive: true });

  // Copy template
  const templatePath = path.join(__dirname, 'templates', 'notification-config.yaml');
  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, AIOS_CONFIG_PATH);
    console.log(`  Config created: ${AIOS_CONFIG_PATH}`);
  } else {
    // Create minimal config inline
    const minimalConfig = [
      '# AIOS Notification System Configuration',
      '# Manage with: *notification [on|off|test|config|status]',
      '',
      'enabled: true',
      'cooldown_ms: 2000',
      '',
      'events:',
      '  - permission_prompt',
      '  - elicitation_dialog',
      '',
      'sound:',
      '  preset: ping',
      '  windows:',
      '    frequency: 1000',
      '    duration: 500',
      '  macos:',
      '    sound_name: Ping',
      '  linux:',
      '    sound_file: /usr/share/sounds/freedesktop/stereo/message.oga',
      '    fallback: bell',
      '',
      'timeout_ms: 3000',
    ].join('\n');

    fs.writeFileSync(AIOS_CONFIG_PATH, minimalConfig, 'utf-8');
    console.log(`  Config created: ${AIOS_CONFIG_PATH}`);
  }
}

/**
 * Main installation function
 * @param {Object} options - Installation options
 * @returns {Object} Installation result
 */
function installModule(options = {}) {
  const result = { success: false, errors: [], changes: [] };

  console.log('');
  console.log('  AIOS Notification System Installer v' + NOTIFICATION_VERSION);
  console.log('  ================================================');
  console.log('');

  try {
    // Step 1: Resolve player path
    const playerPath = resolvePlayerPath(options);
    console.log(`  Player script: ${playerPath}`);

    if (!fs.existsSync(playerPath)) {
      result.errors.push(`Player script not found: ${playerPath}`);
      console.error(`  ERROR: Player script not found at ${playerPath}`);
      return result;
    }

    // Step 2: Read current settings
    const settings = readClaudeSettings();
    console.log(`  Settings file: ${CLAUDE_SETTINGS_PATH}`);

    // Step 3: Check if already installed
    if (isAlreadyInstalled(settings)) {
      console.log('  AIOS notification hook is already installed.');
      result.success = true;
      result.changes.push('already-installed');
      return result;
    }

    // Step 4: Install config template
    installConfigTemplate();
    result.changes.push('config-created');

    // Step 5: Merge hook
    const updated = mergeHook(settings, playerPath, options);

    // Step 6: Write or preview
    if (options.dryRun) {
      console.log('');
      console.log('  [DRY RUN] Would write:');
      console.log(JSON.stringify(updated.hooks, null, 2));
    } else {
      // Ensure .claude directory exists
      const claudeDir = path.join(HOME, '.claude');
      if (!fs.existsSync(claudeDir)) {
        fs.mkdirSync(claudeDir, { recursive: true });
      }

      fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(updated, null, 2), 'utf-8');
      console.log(`  Hook installed in ${CLAUDE_SETTINGS_PATH}`);
      result.changes.push('hook-installed');
    }

    // Step 7: Test sound
    if (!options.dryRun && !options.silent) {
      console.log('');
      console.log('  Testing notification sound...');
      try {
        require('child_process').execSync(`node "${playerPath}" --test`, {
          stdio: 'inherit',
          timeout: 5000,
        });
      } catch {
        console.log('  Warning: Test sound did not play. Check your audio settings.');
      }
    }

    console.log('');
    console.log('  Installation complete!');
    console.log('  Use *notification status to check, or *notification test to test again.');
    console.log('');

    result.success = true;
  } catch (err) {
    result.errors.push(err.message);
    console.error(`  ERROR: ${err.message}`);
  }

  return result;
}

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    silent: args.includes('--silent'),
  };

  const result = installModule(options);
  process.exit(result.success ? 0 : 1);
}

module.exports = { installModule };
