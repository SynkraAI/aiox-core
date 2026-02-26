/**
 * Git fsmonitor detection utility.
 * Shared between bin/aios.js (runDoctor) and tests.
 * Story: NOG-13
 */

const { execSync } = require('child_process');

/**
 * Compare semver versions: returns 1 if a > b, -1 if a < b, 0 if equal.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function compareVersions(a, b) {
  const pa = a.split('.').map((n) => parseInt(n, 10));
  const pb = b.split('.').map((n) => parseInt(n, 10));
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

/**
 * Detect git fsmonitor status based on git version string.
 *
 * @param {string|null} gitVersionStr - Output of `git --version` (e.g. "git version 2.43.0.windows.1")
 * @returns {{ status: string, message: string, suggestion?: string }}
 */
function detectFsmonitor(gitVersionStr) {
  if (!gitVersionStr) {
    return { status: 'unavailable', message: 'Git not installed' };
  }

  const versionMatch = gitVersionStr.match(/(\d+\.\d+\.\d+)/);
  const gitVer = versionMatch ? versionMatch[1] : '0.0.0';
  const gitSupportsFsmonitor = compareVersions(gitVer, '2.37.0') >= 0;

  let fsmonitorValue = '';
  try {
    fsmonitorValue = execSync('git config core.fsmonitor', { encoding: 'utf8' }).trim();
  } catch {
    // Not set
  }

  const isEnabled = fsmonitorValue === 'true';

  if (isEnabled) {
    return {
      status: 'enabled',
      message: 'Git fsmonitor: enabled (git status acceleration active)',
    };
  } else if (gitSupportsFsmonitor) {
    return {
      status: 'available',
      message: 'Git fsmonitor: not enabled (opt-in optimization available)',
      suggestion: 'git config core.fsmonitor true',
    };
  } else {
    return {
      status: 'unavailable',
      message: `Git fsmonitor: not available (Git 2.37+ required, found ${gitVer})`,
    };
  }
}

module.exports = { detectFsmonitor, compareVersions };
