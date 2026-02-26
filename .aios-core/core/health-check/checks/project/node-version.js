/**
 * Node Version Check
 *
 * Verifies Node.js version compatibility with project requirements.
 *
 * @module aios-core/health-check/checks/project/node-version
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Minimum required Node.js version
 */
const MIN_NODE_VERSION = '18.0.0';

/**
 * Node.js version compatibility check
 *
 * @class NodeVersionCheck
 * @extends BaseCheck
 */
class NodeVersionCheck extends BaseCheck {
  constructor() {
    super({
      id: 'project.node-version',
      name: 'Node.js Version',
      description: 'Verifies Node.js version meets minimum requirements',
      domain: CheckDomain.PROJECT,
      severity: CheckSeverity.CRITICAL,
      timeout: 1000,
      cacheable: true,
      healingTier: 3, // Manual fix - requires Node.js upgrade
      tags: ['node', 'version', 'compatibility'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const currentVersion = process.version.replace('v', '');
    let requiredVersion = MIN_NODE_VERSION;

    // Try to get version from package.json engines field
    try {
      const packagePath = path.join(projectRoot, 'package.json');
      const content = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      if (packageJson.engines?.node) {
        requiredVersion = this.parseEngineVersion(packageJson.engines.node);
      }
    } catch {
      // Use default minimum version
    }

    // Compare versions
    const comparison = this.compareVersions(currentVersion, requiredVersion);

    if (comparison < 0) {
      return this.fail(`Node.js ${currentVersion} is below required version ${requiredVersion}`, {
        recommendation: `Upgrade Node.js to version ${requiredVersion} or higher`,
        healable: false,
        healingTier: 3,
        details: {
          current: currentVersion,
          required: requiredVersion,
        },
      });
    }

    // Check if version is too old (warning for LTS)
    const majorVersion = parseInt(currentVersion.split('.')[0], 10);
    if (majorVersion < 20) {
      return this.warning(
        `Node.js ${currentVersion} works but ${majorVersion < 18 ? 'is outdated' : 'consider upgrading to v20 LTS'}`,
        {
          recommendation: 'Consider upgrading to Node.js 20 LTS for best compatibility',
          details: {
            current: currentVersion,
            recommended: '20.x LTS',
          },
        },
      );
    }

    return this.pass(`Node.js ${currentVersion} meets requirements`, {
      details: {
        current: currentVersion,
        required: requiredVersion,
      },
    });
  }

  /**
   * Parse engine version requirement
   * @private
   * @param {string} engineSpec - Engine specification (e.g., ">=18.0.0")
   * @returns {string} Minimum version
   */
  parseEngineVersion(engineSpec) {
    // Handle various formats: >=18.0.0, ^18.0.0, 18.x, etc.
    const match = engineSpec.match(/(\d+)\.?(\d+)?\.?(\d+)?/);
    if (match) {
      return `${match[1]}.${match[2] || '0'}.${match[3] || '0'}`;
    }
    return MIN_NODE_VERSION;
  }

  /**
   * Compare two semver versions
   * @private
   * @param {string} v1 - First version
   * @param {string} v2 - Second version
   * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }

    return 0;
  }

  /**
   * Get healer for this check (manual guide)
   * @returns {Object} Healer configuration
   */
  getHealer() {
    return {
      name: 'node-upgrade-guide',
      action: 'manual',
      manualGuide: 'Upgrade Node.js to the required version',
      steps: [
        'Visit https://nodejs.org/en/download/',
        'Download the LTS version (20.x recommended)',
        'Install the new version',
        'Verify with: node --version',
        'Consider using nvm for version management: https://github.com/nvm-sh/nvm',
      ],
      documentation: 'https://nodejs.org/en/learn/getting-started/how-to-install-nodejs',
      warning: 'Upgrading Node.js may affect other projects. Consider using nvm.',
    };
  }
}

module.exports = NodeVersionCheck;
