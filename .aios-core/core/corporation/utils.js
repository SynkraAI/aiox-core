'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Check if Corporation module is enabled in core-config.yaml.
 * Shared utility -- used by permission-engine, escalation-manager, activity-logger, shadow-mode.
 *
 * @returns {boolean}
 */
function isCorporationEnabled() {
  try {
    const configPath = path.join(process.cwd(), '.aios-core', 'core-config.yaml');
    if (!fs.existsSync(configPath)) return false;

    const content = fs.readFileSync(configPath, 'utf-8');
    const lines = content.split('\n');
    let inCorporation = false;

    for (const line of lines) {
      const trimmed = line.trimStart();

      if (/^corporation\s*:/.test(trimmed)) {
        inCorporation = true;
        continue;
      }

      if (inCorporation && /^\S/.test(trimmed)) {
        // New top-level key, stop
        break;
      }

      if (inCorporation && /^\s+enabled\s*:\s*true/i.test(line)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

module.exports = { isCorporationEnabled };
