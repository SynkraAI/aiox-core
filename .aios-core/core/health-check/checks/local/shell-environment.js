/**
 * Shell Environment Check
 *
 * Verifies shell environment is properly configured.
 *
 * @module aios-core/health-check/checks/local/shell-environment
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { execSync } = require('child_process');
const os = require('os');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Shell environment check
 *
 * @class ShellEnvironmentCheck
 * @extends BaseCheck
 */
class ShellEnvironmentCheck extends BaseCheck {
  constructor() {
    super({
      id: 'local.shell-environment',
      name: 'Shell Environment',
      description: 'Verifies shell environment configuration',
      domain: CheckDomain.LOCAL,
      severity: CheckSeverity.LOW,
      timeout: 2000,
      cacheable: true,
      healingTier: 0,
      tags: ['shell', 'environment'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(_context) {
    const platform = os.platform();
    const details = {
      platform,
      arch: os.arch(),
      shell: null,
      user: null,
      cwd: process.cwd(),
    };

    const issues = [];

    // Detect shell
    if (platform === 'win32') {
      details.shell = process.env.ComSpec || 'cmd.exe';
      details.user = process.env.USERNAME;

      // Check for PowerShell
      try {
        execSync('powershell -Command "echo test"', {
          encoding: 'utf8',
          timeout: 3000,
          windowsHide: true,
        });
        details.powershellAvailable = true;
      } catch {
        details.powershellAvailable = false;
      }
    } else {
      details.shell = process.env.SHELL || '/bin/sh';
      details.user = process.env.USER;

      // Check shell type
      const shellName = details.shell.split('/').pop();
      details.shellType = shellName;

      if (shellName === 'sh') {
        issues.push('Using basic sh shell - consider bash or zsh');
      }
    }

    // Check PATH has required directories
    const pathDirs = (process.env.PATH || '').split(platform === 'win32' ? ';' : ':');
    details.pathEntries = pathDirs.length;

    // Check for common issues
    if (pathDirs.length < 3) {
      issues.push('PATH has very few entries - may be missing tools');
    }

    // Check locale/encoding
    if (platform !== 'win32') {
      const lang = process.env.LANG || process.env.LC_ALL || '';
      if (!lang.toLowerCase().includes('utf')) {
        issues.push('Shell may not be configured for UTF-8');
      }
      details.locale = lang;
    }

    // Check for common problematic characters in path
    if (process.cwd().includes(' ') && platform === 'win32') {
      issues.push('Working directory contains spaces (may cause issues with some tools)');
    }

    if (issues.length > 0) {
      return this.warning(`Shell environment has potential issues: ${issues.join(', ')}`, {
        recommendation: 'Review shell configuration for optimal development experience',
        details: { ...details, issues },
      });
    }

    return this.pass(`Shell environment OK (${details.shell})`, {
      details,
    });
  }
}

module.exports = ShellEnvironmentCheck;
