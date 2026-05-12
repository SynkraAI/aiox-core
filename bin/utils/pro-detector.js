/**
 * Pro Detector - Conditional loading of AIOX Pro modules
 *
 * Detects whether the pro/ submodule is available and provides
 * safe module loading from the pro/ directory.
 *
 * @module bin/utils/pro-detector
 * @see ADR-PRO-001 - Repository Strategy
 * @see Story PRO-5 - aiox-pro Repository Bootstrap
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Root directory of the aiox-core project.
 * Resolves from bin/utils/ up two levels to project root.
 */
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/**
 * Path to the pro/ submodule directory.
 */
const PRO_DIR = path.join(PROJECT_ROOT, 'pro');

/**
 * Path to the pro/package.json file (primary detection indicator).
 */
const PRO_PACKAGE_PATH = path.join(PRO_DIR, 'package.json');

/**
 * Check if the AIOX Pro submodule is available.
 *
 * Detection is based on the existence of pro/package.json.
 * An empty pro/ directory (uninitialized submodule) returns false.
 *
 * @returns {boolean} true if pro/package.json exists
 */
function isProAvailable() {
  try {
    return fs.existsSync(PRO_PACKAGE_PATH);
  } catch {
    return false;
  }
}

/**
 * Safely load a module from the pro/ directory.
 *
 * Returns null if:
 * - Pro submodule is not available
 * - The requested module does not exist
 * - The module throws during loading
 *
 * @param {string} moduleName - Relative path within pro/ (e.g., 'squads/squad-creator-pro')
 * @returns {*|null} The loaded module or null
 */
function loadProModule(moduleName) {
  if (!isProAvailable()) {
    return null;
  }

  try {
    const modulePath = path.join(PRO_DIR, moduleName);
    return require(modulePath);
  } catch {
    return null;
  }
}

/**
 * Get the version of the installed AIOX Pro package.
 *
 * @returns {string|null} The version string (e.g., '0.1.0') or null if not available
 */
function getProVersion() {
  if (!isProAvailable()) {
    return null;
  }

  try {
    const packageData = JSON.parse(fs.readFileSync(PRO_PACKAGE_PATH, 'utf8'));
    return packageData.version || null;
  } catch {
    return null;
  }
}

/**
 * Get metadata about the AIOX Pro installation.
 *
 * @returns {{ available: boolean, version: string|null, path: string }} Pro status info
 */
function getProInfo() {
  const available = isProAvailable();
  return {
    available,
    version: available ? getProVersion() : null,
    path: PRO_DIR,
  };
}

module.exports = {
  isProAvailable,
  loadProModule,
  getProVersion,
  getProInfo,
  // Exported for testing
  _PRO_DIR: PRO_DIR,
  _PRO_PACKAGE_PATH: PRO_PACKAGE_PATH,
};
