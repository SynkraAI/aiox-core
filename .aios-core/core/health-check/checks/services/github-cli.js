/**
 * GitHub CLI Check
 *
 * Verifies GitHub CLI (gh) integration.
 *
 * @module aios-core/health-check/checks/services/github-cli
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { execSync } = require('child_process');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * GitHub CLI check
 *
 * @class GithubCliCheck
 * @extends BaseCheck
 */
class GithubCliCheck extends BaseCheck {
  constructor() {
    super({
      id: 'services.github-cli',
      name: 'GitHub CLI',
      description: 'Verifies GitHub CLI (gh) installation and authentication',
      domain: CheckDomain.SERVICES,
      severity: CheckSeverity.MEDIUM,
      timeout: 5000,
      cacheable: true,
      healingTier: 3, // Manual installation
      tags: ['github', 'cli', 'integration'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(_context) {
    const details = {
      installed: false,
      version: null,
      authenticated: false,
      user: null,
    };

    // Check if gh is installed
    try {
      const version = execSync('gh --version', {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true,
      }).trim();

      const versionMatch = version.match(/(\d+\.\d+\.\d+)/);
      details.installed = true;
      details.version = versionMatch ? versionMatch[1] : 'unknown';
    } catch {
      return this.pass('GitHub CLI (gh) not installed (optional)', {
        details,
      });
    }

    // Check authentication status
    try {
      const authStatus = execSync('gh auth status', {
        encoding: 'utf8',
        timeout: 10000,
        windowsHide: true,
      });

      details.authenticated = true;

      // Try to get username
      const userMatch = authStatus.match(/Logged in to .+ as (\w+)/);
      if (userMatch) {
        details.user = userMatch[1];
      }
    } catch (_error) {
      // Not authenticated
      details.authenticated = false;

      return this.warning(`GitHub CLI installed (v${details.version}) but not authenticated`, {
        recommendation: 'Run: gh auth login',
        details,
      });
    }

    return this.pass(`GitHub CLI v${details.version} authenticated as ${details.user || 'user'}`, {
      details,
    });
  }

  /**
   * Get healer (manual guide)
   */
  getHealer() {
    return {
      name: 'github-cli-setup',
      action: 'manual',
      manualGuide: 'Set up GitHub CLI',
      steps: [
        'Install gh: https://cli.github.com/',
        'Run: gh auth login',
        'Select GitHub.com or Enterprise',
        'Choose authentication method (browser recommended)',
        'Verify with: gh auth status',
      ],
      documentation: 'https://cli.github.com/manual/',
    };
  }
}

module.exports = GithubCliCheck;
