/**
 * OS Detector Utility
 *
 * Provides cross-platform detection utilities for MCP system.
 * Detects operating system and provides appropriate commands.
 *
 * @module core/mcp/os-detector
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const os = require('os');
const path = require('path');

/**
 * Operating system types
 * @enum {string}
 */
const OS_TYPES = {
  WINDOWS: 'windows',
  MACOS: 'macos',
  LINUX: 'linux',
  UNKNOWN: 'unknown',
};

/**
 * Detect current operating system
 * @returns {string} One of OS_TYPES values
 */
function detectOS() {
  const platform = os.platform();

  switch (platform) {
    case 'win32':
      return OS_TYPES.WINDOWS;
    case 'darwin':
      return OS_TYPES.MACOS;
    case 'linux':
      return OS_TYPES.LINUX;
    default:
      return OS_TYPES.UNKNOWN;
  }
}

/**
 * Check if running on Windows
 * @returns {boolean}
 */
function isWindows() {
  return detectOS() === OS_TYPES.WINDOWS;
}

/**
 * Check if running on macOS
 * @returns {boolean}
 */
function isMacOS() {
  return detectOS() === OS_TYPES.MACOS;
}

/**
 * Check if running on Linux
 * @returns {boolean}
 */
function isLinux() {
  return detectOS() === OS_TYPES.LINUX;
}

/**
 * Check if running on Unix-like system (macOS or Linux)
 * @returns {boolean}
 */
function isUnix() {
  const osType = detectOS();
  return osType === OS_TYPES.MACOS || osType === OS_TYPES.LINUX;
}

/**
 * Get user home directory
 * @returns {string} Home directory path
 */
function getHomeDir() {
  return os.homedir();
}

/**
 * Get global AIOX directory path
 * @returns {string} Path to ~/.aiox/
 */
function getGlobalAioxDir() {
  return path.join(getHomeDir(), '.aiox');
}

/**
 * Get global MCP directory path
 * @returns {string} Path to ~/.aiox/mcp/
 */
function getGlobalMcpDir() {
  return path.join(getGlobalAioxDir(), 'mcp');
}

/**
 * Get global MCP config file path
 * @returns {string} Path to ~/.aiox/mcp/global-config.json
 */
function getGlobalConfigPath() {
  return path.join(getGlobalMcpDir(), 'global-config.json');
}

/**
 * Get global MCP servers directory path
 * @returns {string} Path to ~/.aiox/mcp/servers/
 */
function getServersDir() {
  return path.join(getGlobalMcpDir(), 'servers');
}

/**
 * Get global MCP cache directory path
 * @returns {string} Path to ~/.aiox/mcp/cache/
 */
function getCacheDir() {
  return path.join(getGlobalMcpDir(), 'cache');
}

/**
 * Get global credentials directory path
 * @returns {string} Path to ~/.aiox/credentials/
 */
function getCredentialsDir() {
  return path.join(getGlobalAioxDir(), 'credentials');
}

/**
 * Get OS-specific information
 * @returns {Object} OS information object
 */
function getOSInfo() {
  return {
    type: detectOS(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    homeDir: getHomeDir(),
    supportsSymlinks: !isWindows() || hasWindowsSymlinkSupport(),
  };
}

/**
 * Check if Windows has symlink support (Developer Mode or admin)
 * This is a heuristic check - actual support depends on permissions
 * @returns {boolean}
 */
function hasWindowsSymlinkSupport() {
  if (!isWindows()) return true;

  // On Windows, we use junctions which don't require special permissions
  // True symlinks require Developer Mode or admin
  // For our use case, junctions work fine for directories
  return true;
}

/**
 * Get the link type to use on current OS
 * @returns {string} 'junction' for Windows, 'symlink' for Unix
 */
function getLinkType() {
  return isWindows() ? 'junction' : 'symlink';
}

module.exports = {
  OS_TYPES,
  detectOS,
  isWindows,
  isMacOS,
  isLinux,
  isUnix,
  getHomeDir,
  getGlobalAioxDir,
  getGlobalMcpDir,
  getGlobalConfigPath,
  getServersDir,
  getCacheDir,
  getCredentialsDir,
  getOSInfo,
  hasWindowsSymlinkSupport,
  getLinkType,
};
