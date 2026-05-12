/**
 * SYNAPSE Path Utilities
 *
 * Cross-platform path resolution for the .synapse/ directory.
 * Compatible with Windows (backslash) and Unix (forward slash).
 *
 * @module core/synapse/utils/paths
 * @version 1.0.0
 * @created Story SYN-1 - Domain Loader + Manifest Parser
 */

const fs = require('fs');
const path = require('path');

/**
 * Resolve the .synapse/ directory path from a given working directory
 *
 * Looks for a `.synapse/` directory in the given cwd.
 * Uses path.join for cross-platform compatibility (Windows \ and Unix /).
 *
 * @param {string} cwd - The working directory to search from
 * @returns {{ exists: boolean, synapsePath: string, manifestPath: string }}
 */
function resolveSynapsePath(cwd) {
  const synapsePath = path.join(cwd, '.synapse');
  const manifestPath = path.join(synapsePath, 'manifest');

  let exists = false;
  try {
    const stat = fs.statSync(synapsePath);
    exists = stat.isDirectory();
  } catch (_error) {
    exists = false;
  }

  return {
    exists,
    synapsePath,
    manifestPath,
  };
}

/**
 * Resolve a domain file path within the .synapse/ directory
 *
 * @param {string} synapsePath - Path to .synapse/ directory
 * @param {string} fileName - Domain file name (e.g., 'agent-dev')
 * @returns {string} Full path to domain file
 */
function resolveDomainPath(synapsePath, fileName) {
  return path.join(synapsePath, fileName);
}

module.exports = {
  resolveSynapsePath,
  resolveDomainPath,
};
