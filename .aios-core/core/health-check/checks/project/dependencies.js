/**
 * Dependencies Check
 *
 * Verifies that required dependencies are present and installed.
 *
 * @module aios-core/health-check/checks/project/dependencies
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Required AIOS dependencies
 */
const REQUIRED_DEPENDENCIES = ['js-yaml'];

/**
 * Dependencies validation check
 *
 * @class DependenciesCheck
 * @extends BaseCheck
 */
class DependenciesCheck extends BaseCheck {
  constructor() {
    super({
      id: 'project.dependencies',
      name: 'Required Dependencies',
      description: 'Verifies required dependencies are installed',
      domain: CheckDomain.PROJECT,
      severity: CheckSeverity.HIGH,
      timeout: 5000,
      cacheable: true,
      healingTier: 2, // Can auto-fix with npm install (with confirmation)
      tags: ['npm', 'dependencies'],
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
    const nodeModulesPath = path.join(projectRoot, 'node_modules');

    try {
      // Read package.json
      const content = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const missing = [];
      const notInstalled = [];

      // Check required dependencies
      for (const dep of REQUIRED_DEPENDENCIES) {
        if (!dependencies[dep]) {
          missing.push(dep);
        }
      }

      // Check if node_modules exists
      try {
        await fs.access(nodeModulesPath);

        // Verify key dependencies are actually installed
        for (const dep of Object.keys(dependencies).slice(0, 10)) {
          const depPath = path.join(nodeModulesPath, dep);
          try {
            await fs.access(depPath);
          } catch {
            notInstalled.push(dep);
          }
        }
      } catch {
        return this.fail('node_modules not found - dependencies not installed', {
          recommendation: 'Run npm install to install dependencies',
          healable: true,
          healingTier: 2,
          details: { nodeModulesPath },
        });
      }

      // Report results
      if (missing.length > 0) {
        return this.warning(`Missing recommended dependencies: ${missing.join(', ')}`, {
          recommendation: `Install missing: npm install ${missing.join(' ')}`,
          healable: true,
          healingTier: 2,
          details: { missing },
        });
      }

      if (notInstalled.length > 0) {
        return this.fail(`Dependencies listed but not installed: ${notInstalled.join(', ')}`, {
          recommendation: 'Run npm install to install missing dependencies',
          healable: true,
          healingTier: 2,
          details: { notInstalled },
        });
      }

      const depCount = Object.keys(dependencies).length;
      return this.pass(`All ${depCount} dependencies installed`, {
        details: { count: depCount },
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return this.fail('Cannot check dependencies: package.json not found');
      }
      return this.error(`Failed to check dependencies: ${error.message}`, error);
    }
  }

  /**
   * Get healer for this check
   * @returns {Object} Healer configuration
   */
  getHealer() {
    return {
      name: 'npm-install',
      action: 'install-dependencies',
      promptMessage: 'Install missing dependencies?',
      promptQuestion: 'Run npm install to fix dependency issues?',
      promptDescription: 'This will run npm install in your project directory',
      risk: 'low',
      fix: async (_result) => {
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);

        await execPromise('npm install', { cwd: process.cwd() });
        return { success: true, message: 'Dependencies installed' };
      },
    };
  }
}

module.exports = DependenciesCheck;
