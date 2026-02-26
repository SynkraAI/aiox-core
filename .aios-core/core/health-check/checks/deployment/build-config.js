/**
 * Build Configuration Check
 *
 * Verifies build configuration is valid.
 *
 * @module aios-core/health-check/checks/deployment/build-config
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Build configuration check
 *
 * @class BuildConfigCheck
 * @extends BaseCheck
 */
class BuildConfigCheck extends BaseCheck {
  constructor() {
    super({
      id: 'deployment.build-config',
      name: 'Build Configuration',
      description: 'Verifies build configuration',
      domain: CheckDomain.DEPLOYMENT,
      severity: CheckSeverity.MEDIUM,
      timeout: 3000,
      cacheable: true,
      healingTier: 0,
      tags: ['build', 'config'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const issues = [];
    const found = [];

    // Check package.json scripts
    try {
      const packagePath = path.join(projectRoot, 'package.json');
      const content = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      const scripts = packageJson.scripts || {};

      // Check for essential scripts
      if (scripts.build) found.push('build script');
      if (scripts.start) found.push('start script');
      if (scripts.test) found.push('test script');
      if (scripts.lint) found.push('lint script');

      if (!scripts.build && !scripts.start) {
        issues.push('No build or start script defined');
      }
    } catch {
      issues.push('Could not read package.json');
    }

    // Check for build tool configs
    const buildConfigs = [
      { file: 'tsconfig.json', name: 'TypeScript' },
      { file: 'webpack.config.js', name: 'Webpack' },
      { file: 'vite.config.js', name: 'Vite' },
      { file: 'rollup.config.js', name: 'Rollup' },
      { file: 'esbuild.config.js', name: 'esbuild' },
      { file: 'babel.config.js', name: 'Babel' },
      { file: '.babelrc', name: 'Babel' },
    ];

    for (const config of buildConfigs) {
      try {
        await fs.access(path.join(projectRoot, config.file));
        found.push(config.name);
      } catch {
        // Not found
      }
    }

    const details = {
      found,
      issues: issues.length,
    };

    if (issues.length > 0) {
      return this.warning(`Build configuration issues: ${issues.join(', ')}`, {
        recommendation: 'Add missing build scripts to package.json',
        details: { ...details, issues },
      });
    }

    if (found.length === 0) {
      return this.pass('No build configuration found (may be a simple project)', {
        details,
      });
    }

    return this.pass(`Build configuration OK (${found.join(', ')})`, { details });
  }
}

module.exports = BuildConfigCheck;
