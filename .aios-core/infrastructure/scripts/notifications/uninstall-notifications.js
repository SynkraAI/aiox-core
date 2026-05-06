#!/usr/bin/env node
/**
 * AIOS Notification System Uninstaller
 *
 * Removes notification hooks from ~/.claude/settings.json
 * while preserving all other user configuration.
 *
 * Usage:
 *   node uninstall-notifications.js              # Uninstall hooks only
 *   node uninstall-notifications.js --purge      # Also remove config directory
 *
 * @module infrastructure/scripts/notifications/uninstall-notifications
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const CLAUDE_SETTINGS_PATH = path.join(HOME, '.claude', 'settings.json');
const AIOS_NOTIFICATIONS_DIR = path.join(HOME, '.aios', 'notifications');

/**
 * Remove AIOS notification hooks from settings
 * @param {Object} options
 * @returns {Object} Result with success flag
 */
function uninstallModule(options = {}) {
  const result = { success: false, errors: [], changes: [] };

  console.log('');
  console.log('  AIOS Notification System Uninstaller');
  console.log('  =====================================');
  console.log('');

  try {
    // Step 1: Read settings
    if (!fs.existsSync(CLAUDE_SETTINGS_PATH)) {
      console.log('  No settings.json found. Nothing to uninstall.');
      result.success = true;
      return result;
    }

    const content = fs.readFileSync(CLAUDE_SETTINGS_PATH, 'utf-8');
    const settings = JSON.parse(content);

    // Step 2: Find and remove AIOS notification hooks
    const notifications = settings?.hooks?.Notification;
    if (!Array.isArray(notifications) || notifications.length === 0) {
      console.log('  No notification hooks found. Nothing to uninstall.');
      result.success = true;
      return result;
    }

    const originalCount = notifications.length;
    settings.hooks.Notification = notifications.filter(
      entry => !entry.hooks?.some(h => h.command?.includes('notification-player.js'))
    );

    const removed = originalCount - settings.hooks.Notification.length;

    if (removed === 0) {
      console.log('  AIOS notification hook not found. Nothing to uninstall.');
      result.success = true;
      return result;
    }

    // Clean up empty arrays
    if (settings.hooks.Notification.length === 0) {
      delete settings.hooks.Notification;
    }
    if (Object.keys(settings.hooks).length === 0) {
      delete settings.hooks;
    }

    // Step 3: Write settings
    fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
    console.log(`  Removed ${removed} AIOS notification hook(s) from settings.json`);
    result.changes.push('hook-removed');

    // Step 4: Optionally purge config
    if (options.purge && fs.existsSync(AIOS_NOTIFICATIONS_DIR)) {
      fs.rmSync(AIOS_NOTIFICATIONS_DIR, { recursive: true, force: true });
      console.log(`  Purged config directory: ${AIOS_NOTIFICATIONS_DIR}`);
      result.changes.push('config-purged');
    }

    console.log('');
    console.log('  Uninstall complete. Notification sounds are now disabled.');
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
    purge: args.includes('--purge'),
  };

  const result = uninstallModule(options);
  process.exit(result.success ? 0 : 1);
}

module.exports = { uninstallModule };
