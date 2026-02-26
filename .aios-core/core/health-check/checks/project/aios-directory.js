/**
 * AIOS Directory Check
 *
 * Verifies .aios/ directory structure and permissions.
 *
 * @module aios-core/health-check/checks/project/aios-directory
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Expected .aios directory structure
 */
const EXPECTED_STRUCTURE = [
  { path: '.aios', type: 'directory', required: false },
  { path: '.aios/config.yaml', type: 'file', required: false },
  { path: '.aios/reports', type: 'directory', required: false },
  { path: '.aios/backups', type: 'directory', required: false },
];

/**
 * AIOS directory structure check
 *
 * @class AiosDirectoryCheck
 * @extends BaseCheck
 */
class AiosDirectoryCheck extends BaseCheck {
  constructor() {
    super({
      id: 'project.aios-directory',
      name: 'AIOS Directory Structure',
      description: 'Verifies .aios/ directory structure',
      domain: CheckDomain.PROJECT,
      severity: CheckSeverity.MEDIUM,
      timeout: 2000,
      cacheable: true,
      healingTier: 1, // Can auto-create directories
      tags: ['aios', 'directory', 'structure'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const aiosPath = path.join(projectRoot, '.aios');
    const issues = [];
    const found = [];

    // Check if .aios exists at all
    try {
      const stats = await fs.stat(aiosPath);
      if (!stats.isDirectory()) {
        return this.fail('.aios exists but is not a directory', {
          recommendation: 'Remove .aios file and run health check again',
        });
      }
      found.push('.aios');
    } catch {
      // .aios doesn't exist - this is optional
      return this.pass('.aios directory not present (optional)', {
        details: {
          message: '.aios directory is created automatically when needed',
          healable: true,
        },
      });
    }

    // Check subdirectories
    for (const item of EXPECTED_STRUCTURE.filter((i) => i.path !== '.aios')) {
      const fullPath = path.join(projectRoot, item.path);
      try {
        const stats = await fs.stat(fullPath);
        const typeMatch = item.type === 'directory' ? stats.isDirectory() : stats.isFile();
        if (typeMatch) {
          found.push(item.path);
        } else {
          issues.push(`${item.path} exists but is wrong type`);
        }
      } catch {
        if (item.required) {
          issues.push(`Missing: ${item.path}`);
        }
      }
    }

    // Check write permissions
    try {
      const testFile = path.join(aiosPath, '.write-test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
    } catch {
      issues.push('.aios directory is not writable');
    }

    if (issues.length > 0) {
      return this.warning(`AIOS directory has issues: ${issues.join(', ')}`, {
        recommendation: 'Run health check with --fix to create missing directories',
        healable: true,
        healingTier: 1,
        details: { issues, found },
      });
    }

    return this.pass('AIOS directory structure is valid', {
      details: { found },
    });
  }

  /**
   * Get healer for this check
   * @returns {Object} Healer configuration
   */
  getHealer() {
    return {
      name: 'create-aios-directories',
      action: 'create-directories',
      successMessage: 'Created missing AIOS directories',
      fix: async (_result) => {
        const projectRoot = process.cwd();
        const dirs = ['.aios', '.aios/reports', '.aios/backups', '.aios/backups/health-check'];

        for (const dir of dirs) {
          const fullPath = path.join(projectRoot, dir);
          await fs.mkdir(fullPath, { recursive: true });
        }

        return { success: true, message: 'Created AIOS directories' };
      },
    };
  }
}

module.exports = AiosDirectoryCheck;
