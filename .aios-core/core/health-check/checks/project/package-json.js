/**
 * Package.json Check
 *
 * Verifies that package.json exists and is valid JSON.
 *
 * @module aios-core/health-check/checks/project/package-json
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Package.json validation check
 *
 * @class PackageJsonCheck
 * @extends BaseCheck
 */
class PackageJsonCheck extends BaseCheck {
  constructor() {
    super({
      id: 'project.package-json',
      name: 'Package.json Valid',
      description: 'Verifies package.json exists and contains valid JSON',
      domain: CheckDomain.PROJECT,
      severity: CheckSeverity.CRITICAL,
      timeout: 2000,
      cacheable: true,
      healingTier: 0, // Cannot auto-fix missing/invalid package.json
      tags: ['npm', 'config', 'required'],
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

    try {
      // Check if file exists
      await fs.access(packagePath);

      // Read and parse JSON
      const content = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      // Validate required fields
      const issues = [];

      if (!packageJson.name) {
        issues.push('Missing "name" field');
      }

      if (!packageJson.version) {
        issues.push('Missing "version" field');
      }

      if (
        packageJson.name &&
        !/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(packageJson.name)
      ) {
        issues.push('Invalid package name format');
      }

      if (issues.length > 0) {
        return this.warning(`package.json has issues: ${issues.join(', ')}`, {
          recommendation: 'Fix the package.json fields to match npm requirements',
          details: { issues, path: packagePath },
        });
      }

      return this.pass('package.json is valid', {
        details: {
          name: packageJson.name,
          version: packageJson.version,
          path: packagePath,
        },
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return this.fail('package.json not found', {
          recommendation: 'Initialize npm project with: npm init',
          details: { path: packagePath },
        });
      }

      if (error instanceof SyntaxError) {
        return this.fail('package.json contains invalid JSON', {
          recommendation: 'Fix JSON syntax errors in package.json',
          details: { error: error.message, path: packagePath },
        });
      }

      return this.error(`Failed to read package.json: ${error.message}`, error);
    }
  }
}

module.exports = PackageJsonCheck;
