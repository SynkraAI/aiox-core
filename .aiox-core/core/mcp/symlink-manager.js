/**
 * Symlink Manager
 *
 * Manages symlinks (Unix) and junctions (Windows) for MCP configuration.
 * Provides cross-platform link creation and verification.
 *
 * @module core/mcp/symlink-manager
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { isWindows, getGlobalMcpDir, getLinkType } = require('./os-detector');

/**
 * Link status types
 * @enum {string}
 */
const LINK_STATUS = {
  LINKED: 'linked',
  NOT_LINKED: 'not_linked',
  BROKEN: 'broken',
  DIRECTORY: 'directory',
  ERROR: 'error',
};

/**
 * Get the project MCP link path
 * @param {string} projectRoot - Project root directory
 * @returns {string} Path to .aiox-core/tools/mcp
 */
function getProjectMcpPath(projectRoot = process.cwd()) {
  return path.join(projectRoot, '.aiox-core', 'tools', 'mcp');
}

/**
 * Check if a path is a symbolic link or junction
 * @param {string} linkPath - Path to check
 * @returns {boolean}
 */
function isLink(linkPath) {
  try {
    const stats = fs.lstatSync(linkPath);
    return stats.isSymbolicLink();
  } catch (_error) {
    // On Windows, junctions might not show as symlinks via lstat
    if (isWindows()) {
      return isWindowsJunction(linkPath);
    }
    return false;
  }
}

/**
 * Check if a path is a Windows junction
 * @param {string} linkPath - Path to check
 * @returns {boolean}
 */
function isWindowsJunction(linkPath) {
  if (!isWindows()) return false;

  try {
    // Use fsutil to check if it's a junction
    const result = execSync(`fsutil reparsepoint query "${linkPath}"`, {
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.includes('Symbolic Link') || result.includes('Mount Point');
  } catch (_error) {
    return false;
  }
}

/**
 * Get the target of a symlink/junction
 * @param {string} linkPath - Path to the link
 * @returns {string|null} Target path or null
 */
function getLinkTarget(linkPath) {
  try {
    return fs.readlinkSync(linkPath);
  } catch (_error) {
    // On Windows, try alternative method for junctions
    if (isWindows()) {
      return getWindowsJunctionTarget(linkPath);
    }
    return null;
  }
}

/**
 * Get the target of a Windows junction
 * @param {string} linkPath - Path to junction
 * @returns {string|null} Target path or null
 */
function getWindowsJunctionTarget(linkPath) {
  if (!isWindows()) return null;

  try {
    const result = execSync(`fsutil reparsepoint query "${linkPath}"`, {
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Parse the target from fsutil output
    const match = result.match(/Print Name:\s*(.+)/);
    if (match) {
      return match[1].trim();
    }

    // Alternative: parse Substitute Name
    const substMatch = result.match(/Substitute Name:\s*(.+)/);
    if (substMatch) {
      let target = substMatch[1].trim();
      // Remove \\?\ prefix if present
      target = target.replace(/^\\\\\?\\/g, '');
      return target;
    }

    return null;
  } catch (_error) {
    return null;
  }
}

/**
 * Check link status
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Link status information
 */
function checkLinkStatus(projectRoot = process.cwd()) {
  const linkPath = getProjectMcpPath(projectRoot);
  const globalPath = getGlobalMcpDir();

  // Check if parent directory exists
  const toolsDir = path.dirname(linkPath);
  if (!fs.existsSync(toolsDir)) {
    return {
      status: LINK_STATUS.NOT_LINKED,
      linkPath,
      globalPath,
      type: getLinkType(),
      message: 'Tools directory does not exist',
    };
  }

  // Check if path exists
  if (!fs.existsSync(linkPath)) {
    return {
      status: LINK_STATUS.NOT_LINKED,
      linkPath,
      globalPath,
      type: getLinkType(),
      message: 'MCP link does not exist',
    };
  }

  // Check if it's a link
  if (isLink(linkPath)) {
    const target = getLinkTarget(linkPath);

    // Verify target matches global MCP dir
    if (target) {
      // Resolve to absolute paths for accurate comparison
      const resolvedTarget = path.resolve(target);
      const resolvedGlobal = path.resolve(globalPath);

      // Check exact match or if target is the global directory
      // Use path.relative to safely compare - empty string means same path,
      // no '..' prefix means target is equal to or child of global
      const relativePath = path.relative(resolvedGlobal, resolvedTarget);
      const isLinkedToGlobal = relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));

      if (isLinkedToGlobal) {
        return {
          status: LINK_STATUS.LINKED,
          linkPath,
          globalPath,
          target,
          type: getLinkType(),
          message: 'Linked to global MCP config',
        };
      } else {
        return {
          status: LINK_STATUS.BROKEN,
          linkPath,
          globalPath,
          target,
          type: getLinkType(),
          message: `Link points to different location: ${target}`,
        };
      }
    }

    return {
      status: LINK_STATUS.BROKEN,
      linkPath,
      globalPath,
      type: getLinkType(),
      message: 'Could not resolve link target',
    };
  }

  // It's a regular directory
  return {
    status: LINK_STATUS.DIRECTORY,
    linkPath,
    globalPath,
    type: getLinkType(),
    message: 'Path exists as regular directory (not linked)',
  };
}

/**
 * Create symlink (Unix) or junction (Windows)
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Options
 * @param {boolean} options.force - Force creation (remove existing)
 * @returns {Object} Result with success status
 */
function createLink(projectRoot = process.cwd(), options = {}) {
  const linkPath = getProjectMcpPath(projectRoot);
  const globalPath = getGlobalMcpDir();

  // Verify global MCP directory exists
  if (!fs.existsSync(globalPath)) {
    return {
      success: false,
      error: 'Global MCP directory does not exist. Run "aiox mcp setup" first.',
      linkPath,
      globalPath,
    };
  }

  // Ensure tools directory exists
  const toolsDir = path.dirname(linkPath);
  if (!fs.existsSync(toolsDir)) {
    try {
      fs.mkdirSync(toolsDir, { recursive: true });
    } catch (error) {
      return {
        success: false,
        error: `Could not create tools directory: ${error.message}`,
        linkPath,
        globalPath,
      };
    }
  }

  // Check existing link status
  const status = checkLinkStatus(projectRoot);

  // If already properly linked, no action needed
  if (status.status === LINK_STATUS.LINKED) {
    return {
      success: true,
      alreadyLinked: true,
      linkPath,
      globalPath,
      type: getLinkType(),
    };
  }

  // Handle existing path
  if (fs.existsSync(linkPath)) {
    if (!options.force) {
      return {
        success: false,
        error: 'Path already exists. Use --force to overwrite.',
        status: status.status,
        linkPath,
        globalPath,
      };
    }

    // Remove existing
    try {
      if (status.status === LINK_STATUS.DIRECTORY) {
        // Backup existing config if it has content
        const configFile = path.join(linkPath, 'global-config.json');
        if (fs.existsSync(configFile)) {
          const backupPath = linkPath + '.backup.' + Date.now();
          fs.renameSync(linkPath, backupPath);
          return {
            success: false,
            error: `Existing config backed up to ${backupPath}. Run with --migrate to merge configs.`,
            linkPath,
            globalPath,
            backup: backupPath,
          };
        }
        fs.rmSync(linkPath, { recursive: true });
      } else {
        // Remove symlink/junction
        fs.unlinkSync(linkPath);
      }
    } catch (error) {
      return {
        success: false,
        error: `Could not remove existing path: ${error.message}`,
        linkPath,
        globalPath,
      };
    }
  }

  // Create the link
  try {
    if (isWindows()) {
      // Use mklink /J for Windows junction
      execSync(`mklink /J "${linkPath}" "${globalPath}"`, {
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } else {
      // Use fs.symlinkSync for Unix (type 'dir' for directory symlinks)
      fs.symlinkSync(globalPath, linkPath, 'dir');
    }

    // Verify the link was created
    const verifyStatus = checkLinkStatus(projectRoot);
    if (verifyStatus.status === LINK_STATUS.LINKED) {
      return {
        success: true,
        linkPath,
        globalPath,
        type: getLinkType(),
      };
    } else {
      return {
        success: false,
        error: 'Link created but verification failed',
        linkPath,
        globalPath,
        status: verifyStatus.status,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Could not create link: ${error.message}`,
      linkPath,
      globalPath,
      hint: isWindows()
        ? 'Try running as Administrator or enable Developer Mode'
        : 'Check directory permissions',
    };
  }
}

/**
 * Remove symlink/junction
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Result with success status
 */
function removeLink(projectRoot = process.cwd()) {
  const linkPath = getProjectMcpPath(projectRoot);
  const status = checkLinkStatus(projectRoot);

  if (status.status === LINK_STATUS.NOT_LINKED) {
    return {
      success: true,
      alreadyRemoved: true,
      linkPath,
    };
  }

  if (status.status === LINK_STATUS.DIRECTORY) {
    return {
      success: false,
      error: 'Path is a directory, not a link. Cannot remove.',
      linkPath,
    };
  }

  try {
    if (isWindows()) {
      // Remove junction using rmdir
      execSync(`rmdir "${linkPath}"`, {
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } else {
      fs.unlinkSync(linkPath);
    }

    return {
      success: true,
      linkPath,
    };
  } catch (error) {
    return {
      success: false,
      error: `Could not remove link: ${error.message}`,
      linkPath,
    };
  }
}

module.exports = {
  LINK_STATUS,
  getProjectMcpPath,
  isLink,
  isWindowsJunction,
  getLinkTarget,
  checkLinkStatus,
  createLink,
  removeLink,
};
