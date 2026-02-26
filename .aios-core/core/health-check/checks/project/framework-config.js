/**
 * Framework Config Check
 *
 * Verifies that AIOS framework configuration files are present.
 *
 * @module aios-core/health-check/checks/project/framework-config
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Required framework config files
 */
const REQUIRED_CONFIGS = [
  { path: '.aios-core', type: 'directory', description: 'AIOS core framework' },
  { path: '.claude', type: 'directory', description: 'Claude Code configuration' },
];

/**
 * Optional but recommended config files
 */
const RECOMMENDED_CONFIGS = [
  { path: '.aios', type: 'directory', description: 'AIOS local configuration' },
  { path: '.claude/CLAUDE.md', type: 'file', description: 'Project instructions' },
  { path: 'docs/framework', type: 'directory', description: 'Framework documentation' },
];

/**
 * Framework configuration check
 *
 * @class FrameworkConfigCheck
 * @extends BaseCheck
 */
class FrameworkConfigCheck extends BaseCheck {
  constructor() {
    super({
      id: 'project.framework-config',
      name: 'Framework Configuration',
      description: 'Verifies AIOS framework configuration is present',
      domain: CheckDomain.PROJECT,
      severity: CheckSeverity.HIGH,
      timeout: 3000,
      cacheable: true,
      healingTier: 0, // Cannot auto-fix framework setup
      tags: ['aios', 'config', 'framework'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const missingRequired = [];
    const missingRecommended = [];
    const found = [];

    // Check required configs
    for (const config of REQUIRED_CONFIGS) {
      const fullPath = path.join(projectRoot, config.path);
      try {
        const stats = await fs.stat(fullPath);
        const typeMatch = config.type === 'directory' ? stats.isDirectory() : stats.isFile();
        if (typeMatch) {
          found.push(config);
        } else {
          missingRequired.push(config);
        }
      } catch {
        missingRequired.push(config);
      }
    }

    // Check recommended configs
    for (const config of RECOMMENDED_CONFIGS) {
      const fullPath = path.join(projectRoot, config.path);
      try {
        const stats = await fs.stat(fullPath);
        const typeMatch = config.type === 'directory' ? stats.isDirectory() : stats.isFile();
        if (typeMatch) {
          found.push(config);
        } else {
          missingRecommended.push(config);
        }
      } catch {
        missingRecommended.push(config);
      }
    }

    // Report results
    if (missingRequired.length > 0) {
      const missing = missingRequired.map((c) => c.path).join(', ');
      return this.fail(`Missing required framework configuration: ${missing}`, {
        recommendation: 'Run AIOS setup or manually create missing directories',
        details: {
          missingRequired: missingRequired.map((c) => ({
            path: c.path,
            description: c.description,
          })),
          found: found.map((c) => c.path),
        },
      });
    }

    if (missingRecommended.length > 0) {
      const missing = missingRecommended.map((c) => c.path).join(', ');
      return this.warning(`Missing recommended configuration: ${missing}`, {
        recommendation: 'Consider adding recommended configuration for full AIOS functionality',
        details: {
          missingRecommended: missingRecommended.map((c) => ({
            path: c.path,
            description: c.description,
          })),
          found: found.map((c) => c.path),
        },
      });
    }

    return this.pass('All framework configuration present', {
      details: { found: found.map((c) => c.path) },
    });
  }
}

module.exports = FrameworkConfigCheck;
