/**
 * CI Configuration Check
 *
 * Verifies CI/CD configuration.
 *
 * @module aios-core/health-check/checks/deployment/ci-config
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * CI platforms and their config files
 */
const CI_CONFIGS = [
  { dir: '.github/workflows', name: 'GitHub Actions' },
  { file: '.gitlab-ci.yml', name: 'GitLab CI' },
  { file: 'azure-pipelines.yml', name: 'Azure DevOps' },
  { file: '.circleci/config.yml', name: 'CircleCI' },
  { file: 'Jenkinsfile', name: 'Jenkins' },
  { file: '.travis.yml', name: 'Travis CI' },
];

/**
 * CI configuration check
 *
 * @class CiConfigCheck
 * @extends BaseCheck
 */
class CiConfigCheck extends BaseCheck {
  constructor() {
    super({
      id: 'deployment.ci-config',
      name: 'CI/CD Configuration',
      description: 'Verifies CI/CD configuration',
      domain: CheckDomain.DEPLOYMENT,
      severity: CheckSeverity.LOW,
      timeout: 3000,
      cacheable: true,
      healingTier: 0,
      tags: ['ci', 'cd', 'automation'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const foundPlatforms = [];
    const issues = [];

    for (const ci of CI_CONFIGS) {
      const checkPath = ci.dir ? path.join(projectRoot, ci.dir) : path.join(projectRoot, ci.file);

      try {
        const stats = await fs.stat(checkPath);

        if (ci.dir && stats.isDirectory()) {
          // Check for workflow files
          const files = await fs.readdir(checkPath);
          const workflows = files.filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));

          if (workflows.length > 0) {
            foundPlatforms.push({
              name: ci.name,
              workflows: workflows.length,
              files: workflows.slice(0, 5),
            });

            // Validate YAML syntax
            for (const workflow of workflows) {
              try {
                const content = await fs.readFile(path.join(checkPath, workflow), 'utf8');
                // Basic validation
                if (content.includes('\t')) {
                  issues.push(`${workflow}: contains tabs (use spaces)`);
                }
              } catch {
                issues.push(`${workflow}: could not read`);
              }
            }
          }
        } else if (!ci.dir && stats.isFile()) {
          foundPlatforms.push({
            name: ci.name,
            file: ci.file,
          });
        }
      } catch {
        // Not found
      }
    }

    const details = {
      platforms: foundPlatforms,
      issues: issues.length,
    };

    if (foundPlatforms.length === 0) {
      return this.pass('No CI/CD configuration found (consider adding for automation)', {
        details,
      });
    }

    if (issues.length > 0) {
      return this.warning(`CI configuration issues: ${issues.join(', ')}`, {
        recommendation: 'Fix YAML syntax issues in CI configuration files',
        details: { ...details, issues },
      });
    }

    const names = foundPlatforms.map((p) => p.name).join(', ');
    return this.pass(`CI/CD configured: ${names}`, { details });
  }
}

module.exports = CiConfigCheck;
