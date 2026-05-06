#!/usr/bin/env node
/**
 * AIOS Notification Player
 *
 * Cross-platform sound notification for Claude Code hooks.
 * Plays a beep/sound when Claude Code needs human input.
 *
 * Usage:
 *   node notification-player.js           # Play notification (respects cooldown)
 *   node notification-player.js --test    # Play test sound (ignores cooldown)
 *   node notification-player.js --status  # Show current configuration
 *
 * Supported platforms: Windows, macOS, Linux
 *
 * @module scripts/notification-player
 * @version 1.0.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// --- Constants ---

const HOME = os.homedir();
const CONFIG_DIR = path.join(HOME, '.aios', 'notifications');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.yaml');
const COOLDOWN_PATH = path.join(CONFIG_DIR, '.last-beep');

const PRESETS = {
  beep:  { win: { frequency: 1000, duration: 500 }, mac: 'Ping',  linux: 'message.oga' },
  ping:  { win: { frequency: 800,  duration: 300 }, mac: 'Ping',  linux: 'message.oga' },
  glass: { win: { frequency: 1200, duration: 200 }, mac: 'Glass', linux: 'bell.oga' },
  hero:  { win: { frequency: 600,  duration: 800 }, mac: 'Hero',  linux: 'complete.oga' },
  purr:  { win: { frequency: 400,  duration: 600 }, mac: 'Purr',  linux: 'message.oga' },
};

const DEFAULT_CONFIG = {
  enabled: true,
  cooldown_ms: 2000,
  events: ['permission_prompt', 'elicitation_dialog'],
  sound: {
    preset: 'ping',
    windows: { frequency: 1000, duration: 500 },
    macos: { sound_name: 'Ping' },
    linux: { sound_file: '/usr/share/sounds/freedesktop/stereo/message.oga', fallback: 'bell' },
  },
  timeout_ms: 3000,
};

// --- Config Loading ---

/**
 * Parse a simple YAML config file (handles our flat structure without a full YAML parser)
 * @param {string} content - YAML file content
 * @returns {Object} Parsed config
 */
function parseSimpleYaml(content) {
  const config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^(\w[\w_]*):\s*(.+)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    const value = rawValue.replace(/#.*$/, '').trim();

    switch (key) {
      case 'enabled':
        config.enabled = value === 'true';
        break;
      case 'cooldown_ms':
        config.cooldown_ms = parseInt(value, 10) || 2000;
        break;
      case 'preset':
        config.sound.preset = value;
        break;
      case 'frequency':
        config.sound.windows.frequency = parseInt(value, 10) || 1000;
        break;
      case 'duration':
        config.sound.windows.duration = parseInt(value, 10) || 500;
        break;
      case 'sound_name':
        config.sound.macos.sound_name = value;
        break;
      case 'sound_file':
        config.sound.linux.sound_file = value;
        break;
      case 'fallback':
        config.sound.linux.fallback = value;
        break;
      case 'timeout_ms':
        config.timeout_ms = parseInt(value, 10) || 3000;
        break;
    }
  }

  return config;
}

/**
 * Load configuration from ~/.aios/notifications/config.yaml
 * Falls back to defaults if file doesn't exist
 * @returns {Object} Configuration object
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return parseSimpleYaml(content);
    }
  } catch {
    // Fall through to defaults
  }
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

// --- Cooldown ---

/**
 * Check if cooldown period has passed since last notification
 * @param {number} cooldownMs - Cooldown in milliseconds
 * @returns {boolean} true if notification is allowed
 */
function checkCooldown(cooldownMs) {
  try {
    if (fs.existsSync(COOLDOWN_PATH)) {
      const lastBeep = parseInt(fs.readFileSync(COOLDOWN_PATH, 'utf-8'), 10);
      if (Date.now() - lastBeep < cooldownMs) {
        return false;
      }
    }
  } catch {
    // Allow notification on error
  }
  return true;
}

/**
 * Record current timestamp as last notification time
 */
function recordBeep() {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(COOLDOWN_PATH, String(Date.now()));
  } catch {
    // Non-critical failure
  }
}

// --- Sound Playback ---

/**
 * Get platform-specific sound command
 * @param {Object} config - Configuration object
 * @returns {string} Shell command to play sound
 */
function getSoundCommand(config) {
  const platform = os.platform();
  const preset = PRESETS[config.sound.preset] || PRESETS.ping;

  switch (platform) {
    case 'win32': {
      const freq = config.sound.windows.frequency || preset.win.frequency;
      const dur = config.sound.windows.duration || preset.win.duration;
      return `powershell.exe -Command "[console]::beep(${freq}, ${dur})"`;
    }
    case 'darwin': {
      const soundName = config.sound.macos.sound_name || preset.mac;
      const soundPath = `/System/Library/Sounds/${soundName}.aiff`;
      return `afplay "${soundPath}"`;
    }
    case 'linux': {
      const soundFile = config.sound.linux.sound_file || `/usr/share/sounds/freedesktop/stereo/${preset.linux}`;
      const fallback = config.sound.linux.fallback || 'bell';
      // Try paplay first, fall back to terminal bell
      if (fallback === 'bell') {
        return `paplay "${soundFile}" 2>/dev/null || printf '\\a'`;
      }
      return `paplay "${soundFile}"`;
    }
    default:
      return `printf '\\a'`;
  }
}

/**
 * Play the notification sound
 * @param {Object} config - Configuration object
 * @returns {boolean} true if sound was played
 */
function playSound(config) {
  const command = getSoundCommand(config);
  try {
    execSync(command, {
      timeout: config.timeout_ms || 3000,
      stdio: 'ignore',
      windowsHide: true,
    });
    return true;
  } catch {
    return false;
  }
}

// --- CLI Commands ---

/**
 * Show current notification status
 * @param {Object} config - Configuration object
 */
function showStatus(config) {
  const platform = os.platform();
  const platformName = { win32: 'Windows', darwin: 'macOS', linux: 'Linux' }[platform] || platform;

  console.log('');
  console.log('  AIOS Notification System');
  console.log('  ========================');
  console.log(`  Status:    ${config.enabled ? 'ON' : 'OFF'}`);
  console.log(`  Platform:  ${platformName}`);
  console.log(`  Preset:    ${config.sound.preset}`);
  console.log(`  Cooldown:  ${config.cooldown_ms}ms`);
  console.log(`  Events:    ${config.events.join(', ')}`);
  console.log(`  Config:    ${CONFIG_PATH}`);
  console.log(`  Installed: ${fs.existsSync(CONFIG_PATH) ? 'Yes' : 'No (using defaults)'}`);
  console.log('');
}

// --- Main ---

function main() {
  const args = process.argv.slice(2);
  const config = loadConfig();

  // --status: Show configuration
  if (args.includes('--status')) {
    showStatus(config);
    process.exit(0);
  }

  // --test: Play sound ignoring cooldown and enabled state
  if (args.includes('--test')) {
    console.log('Playing test notification...');
    const played = playSound(config);
    console.log(played ? 'Sound played successfully!' : 'Failed to play sound.');
    process.exit(played ? 0 : 1);
  }

  // Normal execution: respect enabled flag and cooldown
  if (!config.enabled) {
    process.exit(0);
  }

  if (!checkCooldown(config.cooldown_ms)) {
    process.exit(0);
  }

  recordBeep();
  playSound(config);
}

main();
