/**
 * AIOX Directory Check
 *
 * Verifies .aiox/ directory structure and permissions.
 *
 * @module aiox-core/health-check/checks/project/aiox-directory
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Expected .aiox directory structure
 */
const EXPECTED_STRUCTURE = [
  { path: '.aiox', type: 'directory', required: false },
  { path: '.aiox/config.yaml', type: 'file', required: false },
  { path: '.aiox/reports', type: 'directory', required: false },
  { path: '.aiox/backups', type: 'directory', required: false },
];

/**
 * AIOX directory structure check
 *
 * @class AioxDirectoryCheck
 * @extends BaseCheck
 */
class AioxDirectoryCheck extends BaseCheck {
  constructor() {
    super({
      id: 'project.aiox-directory',
      name: 'AIOX Directory Structure',
      description: 'Verifies .aiox/ directory structure',
      domain: CheckDomain.PROJECT,
      severity: CheckSeverity.MEDIUM,
      timeout: 2000,
      cacheable: true,
      healingTier: 1, // Can auto-create directories
      tags: ['aiox', 'directory', 'structure'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const aioxPath = path.join(projectRoot, '.aiox');
    const issues = [];
    const found = [];

    // Check if .aiox exists at all
    try {
      const stats = await fs.stat(aioxPath);
      if (!stats.isDirectory()) {
        return this.fail('.aiox exists but is not a directory', {
          recommendation: 'Remove .aiox file and run health check again',
        });
      }
      found.push('.aiox');
    } catch {
      // .aiox doesn't exist - this is optional
      return this.pass('.aiox directory not present (optional)', {
        details: {
          message: '.aiox directory is created automatically when needed',
          healable: true,
        },
      });
    }

    // Check subdirectories
    for (const item of EXPECTED_STRUCTURE.filter((i) => i.path !== '.aiox')) {
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
      const testFile = path.join(aioxPath, '.write-test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
    } catch {
      issues.push('.aiox directory is not writable');
    }

    if (issues.length > 0) {
      return this.warning(`AIOX directory has issues: ${issues.join(', ')}`, {
        recommendation: 'Run health check with --fix to create missing directories',
        healable: true,
        healingTier: 1,
        details: { issues, found },
      });
    }

    return this.pass('AIOX directory structure is valid', {
      details: { found },
    });
  }

  /**
   * Get healer for this check
   * @returns {Object} Healer configuration
   */
  getHealer() {
    return {
      name: 'create-aiox-directories',
      action: 'create-directories',
      successMessage: 'Created missing AIOX directories',
      fix: async (_result) => {
        const projectRoot = process.cwd();
        const dirs = ['.aiox', '.aiox/reports', '.aiox/backups', '.aiox/backups/health-check'];

        for (const dir of dirs) {
          const fullPath = path.join(projectRoot, dir);
          await fs.mkdir(fullPath, { recursive: true });
        }

        return { success: true, message: 'Created AIOX directories' };
      },
    };
  }
}

module.exports = AioxDirectoryCheck;
