/**
 * Deployment Readiness Check
 *
 * Verifies project is ready for deployment.
 *
 * @module aios-core/health-check/checks/deployment/deployment-readiness
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Deployment readiness check
 *
 * @class DeploymentReadinessCheck
 * @extends BaseCheck
 */
class DeploymentReadinessCheck extends BaseCheck {
  constructor() {
    super({
      id: 'deployment.readiness',
      name: 'Deployment Readiness',
      description: 'Verifies project is ready for deployment',
      domain: CheckDomain.DEPLOYMENT,
      severity: CheckSeverity.MEDIUM,
      timeout: 5000,
      cacheable: true,
      healingTier: 0,
      tags: ['deployment', 'readiness'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const readiness = {
      checks: [],
      passed: 0,
      failed: 0,
    };

    // Check 1: package.json exists
    try {
      const packagePath = path.join(projectRoot, 'package.json');
      const content = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(content);

      readiness.checks.push({ name: 'package.json', status: 'pass' });
      readiness.passed++;

      // Check version is set
      if (pkg.version && pkg.version !== '0.0.0') {
        readiness.checks.push({ name: 'version set', status: 'pass' });
        readiness.passed++;
      } else {
        readiness.checks.push({ name: 'version set', status: 'fail', reason: 'Version not set' });
        readiness.failed++;
      }

      // Check for start script
      if (pkg.scripts?.start || pkg.scripts?.build) {
        readiness.checks.push({ name: 'entry script', status: 'pass' });
        readiness.passed++;
      } else {
        readiness.checks.push({
          name: 'entry script',
          status: 'fail',
          reason: 'No start/build script',
        });
        readiness.failed++;
      }

      // Check main field
      if (pkg.main) {
        readiness.checks.push({ name: 'main entry', status: 'pass' });
        readiness.passed++;
      } else {
        readiness.checks.push({ name: 'main entry', status: 'warn', reason: 'No main field' });
      }
    } catch {
      readiness.checks.push({ name: 'package.json', status: 'fail', reason: 'Missing or invalid' });
      readiness.failed++;
    }

    // Check 2: README exists
    const readmeFiles = ['README.md', 'readme.md', 'README'];
    let hasReadme = false;
    for (const readme of readmeFiles) {
      try {
        await fs.access(path.join(projectRoot, readme));
        hasReadme = true;
        break;
      } catch {
        // Not found
      }
    }

    if (hasReadme) {
      readiness.checks.push({ name: 'README', status: 'pass' });
      readiness.passed++;
    } else {
      readiness.checks.push({ name: 'README', status: 'warn', reason: 'No README file' });
    }

    // Check 3: LICENSE exists
    try {
      await fs.access(path.join(projectRoot, 'LICENSE'));
      readiness.checks.push({ name: 'LICENSE', status: 'pass' });
      readiness.passed++;
    } catch {
      readiness.checks.push({ name: 'LICENSE', status: 'warn', reason: 'No LICENSE file' });
    }

    // Calculate score
    const total = readiness.passed + readiness.failed;
    const score = total > 0 ? Math.round((readiness.passed / total) * 100) : 0;

    const details = {
      ...readiness,
      score: `${score}%`,
    };

    if (readiness.failed > 0) {
      const failedChecks = readiness.checks.filter((c) => c.status === 'fail').map((c) => c.name);
      return this.fail(`Deployment readiness issues: ${failedChecks.join(', ')}`, {
        recommendation: 'Fix deployment readiness issues before deploying',
        details,
      });
    }

    const warnings = readiness.checks.filter((c) => c.status === 'warn');
    if (warnings.length > 0) {
      return this.warning(`Deployment ready with ${warnings.length} warning(s)`, {
        recommendation: 'Consider addressing warnings for better deployment',
        details,
      });
    }

    return this.pass(`Project is deployment ready (${score}%)`, { details });
  }
}

module.exports = DeploymentReadinessCheck;
