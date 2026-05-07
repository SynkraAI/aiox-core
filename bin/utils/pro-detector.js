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
 * Canonical npm package name.
 */
const PRO_PACKAGE_CANONICAL = '@aiox-squads/pro';

/**
 * Legacy npm package name kept as a fallback for installs created during the
 * unpublished @aiox-fullstack/pro transition.
 */
const PRO_PACKAGE_FALLBACK = '@aiox-fullstack/pro';

/**
 * Original AIOS npm package name, retained for backward compatibility.
 */
const PRO_PACKAGE_LEGACY = '@aios-fullstack/pro';

const PRO_PACKAGES = [
  PRO_PACKAGE_CANONICAL,
  PRO_PACKAGE_FALLBACK,
  PRO_PACKAGE_LEGACY,
];

/**
 * Resolve the installed npm Pro package path.
 * Tries canonical name first, then legacy fallbacks.
 *
 * @returns {{ packagePath: string, packageName: string } | null}
 */
function resolveNpmProPackage() {
  for (const packageName of PRO_PACKAGES) {
    try {
      const pkgJson = require.resolve(`${packageName}/package.json`, {
        paths: [process.cwd()],
      });
      return { packagePath: path.dirname(pkgJson), packageName };
    } catch {
      // try next package
    }
  }

  return null;
}

/**
 * Check if the AIOX Pro is available via any source.
 *
 * Detection priority:
 * 1. npm package (canonical @aiox-squads/pro or legacy fallbacks)
 * 2. pro/ submodule directory
 *
 * @returns {boolean} true if Pro is available
 */
function isProAvailable() {
  try {
    if (resolveNpmProPackage()) return true;
    return fs.existsSync(PRO_PACKAGE_PATH);
  } catch {
    return false;
  }
}

/**
 * Safely load a module from the pro package.
 *
 * Resolution order:
 * 1. npm package (canonical or fallback)
 * 2. pro/ submodule directory
 *
 * @param {string} moduleName - Relative path within pro/ (e.g., 'squads/squad-creator-pro')
 * @returns {*|null} The loaded module or null
 */
function loadProModule(moduleName) {
  // 1. Try npm package
  const npmPro = resolveNpmProPackage();
  if (npmPro) {
    try {
      return require(path.join(npmPro.packagePath, moduleName));
    } catch { /* fall through */ }
  }

  // 2. Try submodule
  if (fs.existsSync(PRO_PACKAGE_PATH)) {
    try {
      return require(path.join(PRO_DIR, moduleName));
    } catch { /* not available */ }
  }

  return null;
}

/**
 * Get the version of the installed AIOX Pro package.
 *
 * @returns {string|null} The version string (e.g., '0.3.0') or null if not available
 */
function getProVersion() {
  // 1. Try npm package
  const npmPro = resolveNpmProPackage();
  if (npmPro) {
    try {
      const packageData = JSON.parse(fs.readFileSync(path.join(npmPro.packagePath, 'package.json'), 'utf8'));
      return packageData.version || null;
    } catch { /* fall through */ }
  }

  // 2. Try submodule
  if (fs.existsSync(PRO_PACKAGE_PATH)) {
    try {
      const packageData = JSON.parse(fs.readFileSync(PRO_PACKAGE_PATH, 'utf8'));
      return packageData.version || null;
    } catch { /* not available */ }
  }

  return null;
}

/**
 * Get metadata about the AIOX Pro installation.
 *
 * @returns {{ available: boolean, version: string|null, path: string, source: string, packageName: string|null }} Pro status info
 */
function getProInfo() {
  const npmPro = resolveNpmProPackage();
  if (npmPro) {
    try {
      const packageData = JSON.parse(fs.readFileSync(path.join(npmPro.packagePath, 'package.json'), 'utf8'));
      return {
        available: true,
        version: packageData.version || null,
        path: npmPro.packagePath,
        source: 'npm',
        packageName: npmPro.packageName,
      };
    } catch { /* fall through */ }
  }

  if (fs.existsSync(PRO_PACKAGE_PATH)) {
    try {
      const packageData = JSON.parse(fs.readFileSync(PRO_PACKAGE_PATH, 'utf8'));
      return {
        available: true,
        version: packageData.version || null,
        path: PRO_DIR,
        source: 'submodule',
        packageName: null,
      };
    } catch { /* fall through */ }
  }

  return {
    available: false,
    version: null,
    path: PRO_DIR,
    source: 'none',
    packageName: null,
  };
}

module.exports = {
  isProAvailable,
  loadProModule,
  getProVersion,
  getProInfo,
  resolveNpmProPackage,
  PRO_PACKAGE_CANONICAL,
  PRO_PACKAGE_FALLBACK,
  PRO_PACKAGE_LEGACY,
  PRO_PACKAGES,
  // Exported for testing
  _PRO_DIR: PRO_DIR,
  _PRO_PACKAGE_PATH: PRO_PACKAGE_PATH,
};
