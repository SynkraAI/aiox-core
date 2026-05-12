/**
 * OS Detector - Detects operating system for cross-platform support
 *
 * Supports:
 * - macOS (Darwin)
 * - Linux (native)
 * - Windows (native + WSL detection)
 *
 * @module os-detector
 */

'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * OS types enum
 */
const OS_TYPE = {
  MACOS: 'macos',
  LINUX: 'linux',
  WINDOWS: 'windows',
  WSL: 'wsl',
  UNKNOWN: 'unknown',
};

/**
 * Detects if running in WSL (Windows Subsystem for Linux)
 * @returns {boolean} True if running in WSL
 */
function isWSL() {
  // Check environment variable (most reliable)
  if (process.env.WSL_DISTRO_NAME) {
    return true;
  }

  // Check /proc/version for Microsoft signature
  try {
    const procVersion = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    if (procVersion.includes('microsoft') || procVersion.includes('wsl')) {
      return true;
    }
  } catch {
    // /proc/version doesn't exist (not Linux/WSL)
  }

  // Check for WSL interop
  try {
    const interop = fs.existsSync('/proc/sys/fs/binfmt_misc/WSLInterop');
    if (interop) {
      return true;
    }
  } catch {
    // Ignore errors
  }

  return false;
}

/**
 * Gets the WSL distribution name
 * @returns {string|null} Distribution name or null
 */
function getWSLDistro() {
  if (process.env.WSL_DISTRO_NAME) {
    return process.env.WSL_DISTRO_NAME;
  }

  try {
    const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
    const nameMatch = osRelease.match(/^NAME="?([^"\n]+)"?/m);
    if (nameMatch) {
      return nameMatch[1];
    }
  } catch {
    // Ignore errors
  }

  return null;
}

/**
 * Detects the current operating system
 * @returns {Object} OS detection result
 */
function detectOS() {
  const platform = process.platform;
  const release = os.release();
  const arch = process.arch;

  // Base result structure
  const result = {
    type: OS_TYPE.UNKNOWN,
    platform,
    release,
    arch,
    isWSL: false,
    wslDistro: null,
    homeDir: os.homedir(),
    shell: process.env.SHELL || process.env.COMSPEC || '/bin/sh',
    pathSeparator: path.sep,
  };

  switch (platform) {
    case 'darwin':
      result.type = OS_TYPE.MACOS;
      result.packageManager = 'brew';
      result.installInstructions = {
        node: 'brew install node@18',
        git: 'brew install git',
        docker: 'brew install --cask docker',
        gh: 'brew install gh',
      };
      break;

    case 'linux':
      // Check if it's WSL
      if (isWSL()) {
        result.type = OS_TYPE.WSL;
        result.isWSL = true;
        result.wslDistro = getWSLDistro();
        result.packageManager = detectLinuxPackageManager();
        result.installInstructions = getLinuxInstallInstructions(result.packageManager);
        // WSL-specific note
        result.notes = [
          'Running in WSL (Windows Subsystem for Linux)',
          'Docker Desktop for Windows must be configured for WSL integration',
        ];
      } else {
        result.type = OS_TYPE.LINUX;
        result.packageManager = detectLinuxPackageManager();
        result.installInstructions = getLinuxInstallInstructions(result.packageManager);
      }
      break;

    case 'win32':
      result.type = OS_TYPE.WINDOWS;
      result.packageManager = 'winget';
      result.shell = process.env.COMSPEC || 'cmd.exe';
      result.pathSeparator = '\\';
      result.installInstructions = {
        node: 'winget install OpenJS.NodeJS.LTS',
        git: 'winget install Git.Git',
        docker: 'winget install Docker.DockerDesktop',
        gh: 'winget install GitHub.cli',
      };
      result.notes = [
        'For best experience, consider using WSL',
        'Install WSL: wsl --install',
      ];
      break;

    default:
      result.type = OS_TYPE.UNKNOWN;
      result.installInstructions = {
        node: 'Visit https://nodejs.org to download Node.js',
        git: 'Visit https://git-scm.com to download Git',
        docker: 'Visit https://docker.com to download Docker',
        gh: 'Visit https://cli.github.com to download GitHub CLI',
      };
  }

  return result;
}

/**
 * Detects the Linux package manager
 * @returns {string} Package manager name
 */
function detectLinuxPackageManager() {
  // Check for common package managers
  const managers = [
    { name: 'apt', check: '/usr/bin/apt' },
    { name: 'apt-get', check: '/usr/bin/apt-get' },
    { name: 'dnf', check: '/usr/bin/dnf' },
    { name: 'yum', check: '/usr/bin/yum' },
    { name: 'pacman', check: '/usr/bin/pacman' },
    { name: 'zypper', check: '/usr/bin/zypper' },
    { name: 'apk', check: '/sbin/apk' },
  ];

  for (const manager of managers) {
    if (fs.existsSync(manager.check)) {
      return manager.name;
    }
  }

  return 'unknown';
}

/**
 * Gets install instructions for Linux based on package manager
 * @param {string} packageManager - The detected package manager
 * @returns {Object} Install instructions
 */
function getLinuxInstallInstructions(packageManager) {
  const instructions = {
    apt: {
      node: 'sudo apt update && sudo apt install -y nodejs npm',
      git: 'sudo apt install -y git',
      docker: 'sudo apt install -y docker.io && sudo systemctl start docker',
      gh: 'sudo apt install -y gh',
    },
    'apt-get': {
      node: 'sudo apt-get update && sudo apt-get install -y nodejs npm',
      git: 'sudo apt-get install -y git',
      docker: 'sudo apt-get install -y docker.io && sudo systemctl start docker',
      gh: 'sudo apt-get install -y gh',
    },
    dnf: {
      node: 'sudo dnf install -y nodejs npm',
      git: 'sudo dnf install -y git',
      docker: 'sudo dnf install -y docker && sudo systemctl start docker',
      gh: 'sudo dnf install -y gh',
    },
    yum: {
      node: 'sudo yum install -y nodejs npm',
      git: 'sudo yum install -y git',
      docker: 'sudo yum install -y docker && sudo systemctl start docker',
      gh: 'sudo yum install -y gh',
    },
    pacman: {
      node: 'sudo pacman -S nodejs npm',
      git: 'sudo pacman -S git',
      docker: 'sudo pacman -S docker && sudo systemctl start docker',
      gh: 'sudo pacman -S github-cli',
    },
    zypper: {
      node: 'sudo zypper install nodejs npm',
      git: 'sudo zypper install git',
      docker: 'sudo zypper install docker && sudo systemctl start docker',
      gh: 'sudo zypper install gh',
    },
    apk: {
      node: 'apk add nodejs npm',
      git: 'apk add git',
      docker: 'apk add docker',
      gh: 'apk add github-cli',
    },
    unknown: {
      node: 'Visit https://nodejs.org to download Node.js',
      git: 'Visit https://git-scm.com to download Git',
      docker: 'Visit https://docker.com to download Docker',
      gh: 'Visit https://cli.github.com to download GitHub CLI',
    },
  };

  return instructions[packageManager] || instructions.unknown;
}

/**
 * Gets a user-friendly OS name
 * @param {Object} osInfo - OS detection result
 * @returns {string} User-friendly name
 */
function getOSDisplayName(osInfo) {
  switch (osInfo.type) {
    case OS_TYPE.MACOS:
      return `macOS (${osInfo.release})`;
    case OS_TYPE.WSL:
      return `WSL (${osInfo.wslDistro || 'Linux'})`;
    case OS_TYPE.LINUX:
      return `Linux (${osInfo.release})`;
    case OS_TYPE.WINDOWS:
      return `Windows (${osInfo.release})`;
    default:
      return `Unknown (${osInfo.platform})`;
  }
}

module.exports = {
  OS_TYPE,
  detectOS,
  isWSL,
  getWSLDistro,
  detectLinuxPackageManager,
  getOSDisplayName,
};
