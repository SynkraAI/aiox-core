/**
 * Claude Code Check
 *
 * Verifies Claude Code CLI installation and configuration.
 *
 * @module aios-core/health-check/checks/services/claude-code
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Claude Code check
 *
 * @class ClaudeCodeCheck
 * @extends BaseCheck
 */
class ClaudeCodeCheck extends BaseCheck {
  constructor() {
    super({
      id: 'services.claude-code',
      name: 'Claude Code',
      description: 'Verifies Claude Code CLI configuration',
      domain: CheckDomain.SERVICES,
      severity: CheckSeverity.LOW,
      timeout: 3000,
      cacheable: true,
      healingTier: 0,
      tags: ['claude', 'ai', 'cli'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const homeDir = os.homedir();

    const details = {
      installed: false,
      version: null,
      projectConfig: false,
      globalConfig: false,
    };

    // Check if claude is installed
    try {
      const version = execSync('claude --version', {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true,
      }).trim();

      details.installed = true;
      details.version = version;
    } catch {
      // Not installed - check config anyway
    }

    // Check project .claude directory
    try {
      const claudeDir = path.join(projectRoot, '.claude');
      await fs.access(claudeDir);
      details.projectConfig = true;

      // Check for CLAUDE.md
      try {
        await fs.access(path.join(claudeDir, 'CLAUDE.md'));
        details.hasProjectInstructions = true;
      } catch {
        details.hasProjectInstructions = false;
      }
    } catch {
      // No project config
    }

    // Check global config
    try {
      const globalConfig = path.join(homeDir, '.claude.json');
      await fs.access(globalConfig);
      details.globalConfig = true;
    } catch {
      // No global config
    }

    // Check for global CLAUDE.md
    try {
      const globalClaudeMd = path.join(homeDir, '.claude', 'CLAUDE.md');
      await fs.access(globalClaudeMd);
      details.hasGlobalInstructions = true;
    } catch {
      details.hasGlobalInstructions = false;
    }

    if (!details.installed && !details.projectConfig && !details.globalConfig) {
      return this.pass('Claude Code not detected (not using Claude Code)', {
        details,
      });
    }

    const issues = [];

    if (!details.projectConfig) {
      issues.push('No project-level .claude directory');
    }

    if (details.projectConfig && !details.hasProjectInstructions) {
      issues.push('Project .claude/CLAUDE.md not found');
    }

    if (issues.length > 0) {
      return this.warning(`Claude Code configuration incomplete: ${issues.join(', ')}`, {
        recommendation: 'Add .claude/CLAUDE.md for project-specific instructions',
        details: { ...details, issues },
      });
    }

    const parts = [];
    if (details.installed) parts.push(`CLI v${details.version}`);
    if (details.projectConfig) parts.push('project config');
    if (details.globalConfig) parts.push('global config');

    return this.pass(`Claude Code configured (${parts.join(', ')})`, {
      details,
    });
  }
}

module.exports = ClaudeCodeCheck;
