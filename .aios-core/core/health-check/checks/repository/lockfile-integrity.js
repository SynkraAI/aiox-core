/**
 * Lockfile Integrity Check
 *
 * Verifies package-lock.json integrity and sync with package.json.
 *
 * @module aios-core/health-check/checks/repository/lockfile-integrity
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const _crypto = require('crypto');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Lockfile integrity check
 *
 * @class LockfileIntegrityCheck
 * @extends BaseCheck
 */
class LockfileIntegrityCheck extends BaseCheck {
  constructor() {
    super({
      id: 'repository.lockfile-integrity',
      name: 'Lockfile Integrity',
      description: 'Verifies package-lock.json integrity',
      domain: CheckDomain.REPOSITORY,
      severity: CheckSeverity.HIGH,
      timeout: 5000,
      cacheable: true,
      healingTier: 2, // Can regenerate with npm install
      tags: ['npm', 'lockfile', 'dependencies'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const packagePath = path.join(projectRoot, 'package.json');
    const lockfilePath = path.join(projectRoot, 'package-lock.json');

    try {
      // Check if package.json exists
      let packageJson;
      try {
        const content = await fs.readFile(packagePath, 'utf8');
        packageJson = JSON.parse(content);
      } catch {
        return this.pass('No package.json - npm lockfile check skipped');
      }

      // Check if lockfile exists
      let lockfile;
      try {
        const content = await fs.readFile(lockfilePath, 'utf8');
        lockfile = JSON.parse(content);
      } catch (error) {
        if (error.code === 'ENOENT') {
          return this.fail('package-lock.json not found', {
            recommendation: 'Run npm install to generate lockfile',
            healable: true,
            healingTier: 2,
          });
        }
        return this.fail('package-lock.json contains invalid JSON', {
          recommendation: 'Delete and regenerate lockfile with npm install',
          healable: true,
          healingTier: 2,
        });
      }

      // Compare package.json dependencies with lockfile
      const packageDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const lockfileDeps = lockfile.packages?.['']?.dependencies || {};
      const lockfileDevDeps = lockfile.packages?.['']?.devDependencies || {};
      const _allLockfileDeps = { ...lockfileDeps, ...lockfileDevDeps };

      const missing = [];
      const _versionMismatch = [];

      for (const [dep, _version] of Object.entries(packageDeps)) {
        if (!lockfile.packages?.[`node_modules/${dep}`]) {
          missing.push(dep);
        }
      }

      const details = {
        lockfileVersion: lockfile.lockfileVersion,
        packageDepsCount: Object.keys(packageDeps).length,
        lockfilePackages: Object.keys(lockfile.packages || {}).length,
        missing: missing.length,
      };

      if (missing.length > 0) {
        return this.fail(`Lockfile out of sync: ${missing.length} package(s) missing`, {
          recommendation: 'Run npm install to sync lockfile',
          healable: true,
          healingTier: 2,
          details: {
            ...details,
            missingPackages: missing.slice(0, 10),
          },
        });
      }

      return this.pass('Lockfile is in sync with package.json', { details });
    } catch (error) {
      return this.error(`Lockfile check failed: ${error.message}`, error);
    }
  }

  /**
   * Get healer
   */
  getHealer() {
    return {
      name: 'npm-install-lockfile',
      action: 'regenerate-lockfile',
      promptMessage: 'Regenerate lockfile?',
      promptQuestion: 'Run npm install to sync lockfile with package.json?',
      promptDescription: 'This will update package-lock.json',
      risk: 'low',
      targetFile: 'package-lock.json',
      fix: async () => {
        const { execSync } = require('child_process');
        execSync('npm install', { cwd: process.cwd(), windowsHide: true });
        return { success: true, message: 'Lockfile regenerated' };
      },
    };
  }
}

module.exports = LockfileIntegrityCheck;
