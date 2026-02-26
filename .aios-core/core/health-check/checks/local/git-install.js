/**
 * Git Installation Check
 *
 * Verifies Git is installed and configured.
 *
 * @module aios-core/health-check/checks/local/git-install
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { execSync } = require('child_process');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Minimum required Git version
 */
const MIN_GIT_VERSION = '2.20.0';

/**
 * Git installation check
 *
 * @class GitInstallCheck
 * @extends BaseCheck
 */
class GitInstallCheck extends BaseCheck {
  constructor() {
    super({
      id: 'local.git-install',
      name: 'Git Installation',
      description: 'Verifies Git is installed and configured',
      domain: CheckDomain.LOCAL,
      severity: CheckSeverity.CRITICAL,
      timeout: 3000,
      cacheable: true,
      healingTier: 3, // Manual installation required
      tags: ['git', 'installation'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(_context) {
    try {
      // Check if git is installed
      const versionOutput = execSync('git --version', {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true,
      }).trim();

      // Parse version
      const versionMatch = versionOutput.match(/(\d+)\.(\d+)\.(\d+)/);
      if (!versionMatch) {
        return this.warning('Could not determine Git version', {
          details: { output: versionOutput },
        });
      }

      const version = `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}`;

      // Check version meets minimum
      if (this.compareVersions(version, MIN_GIT_VERSION) < 0) {
        return this.warning(`Git version ${version} is below recommended ${MIN_GIT_VERSION}`, {
          recommendation: 'Consider upgrading Git for best compatibility',
          healable: false,
          healingTier: 3,
          details: {
            current: version,
            minimum: MIN_GIT_VERSION,
          },
        });
      }

      // Check for user configuration
      const configIssues = [];

      try {
        execSync('git config user.name', { encoding: 'utf8', windowsHide: true });
      } catch {
        configIssues.push('user.name not configured');
      }

      try {
        execSync('git config user.email', { encoding: 'utf8', windowsHide: true });
      } catch {
        configIssues.push('user.email not configured');
      }

      if (configIssues.length > 0) {
        return this.warning(
          `Git installed but configuration incomplete: ${configIssues.join(', ')}`,
          {
            recommendation:
              'Configure Git with: git config --global user.name "Your Name" && git config --global user.email "you@example.com"',
            details: {
              version,
              configIssues,
            },
          },
        );
      }

      return this.pass(`Git ${version} installed and configured`, {
        details: { version },
      });
    } catch (error) {
      return this.fail('Git is not installed or not in PATH', {
        recommendation: 'Install Git from https://git-scm.com/downloads',
        healable: false,
        healingTier: 3,
        details: { error: error.message },
      });
    }
  }

  /**
   * Compare semver versions
   * @private
   */
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if ((parts1[i] || 0) < (parts2[i] || 0)) return -1;
      if ((parts1[i] || 0) > (parts2[i] || 0)) return 1;
    }
    return 0;
  }

  /**
   * Get healer (manual guide)
   */
  getHealer() {
    return {
      name: 'git-install-guide',
      action: 'manual',
      manualGuide: 'Install Git on your system',
      steps: [
        'Visit https://git-scm.com/downloads',
        'Download the installer for your OS',
        'Run the installer with default options',
        'Restart your terminal',
        'Verify with: git --version',
        'Configure: git config --global user.name "Your Name"',
        'Configure: git config --global user.email "you@example.com"',
      ],
      documentation: 'https://git-scm.com/book/en/v2/Getting-Started-Installing-Git',
    };
  }
}

module.exports = GitInstallCheck;
