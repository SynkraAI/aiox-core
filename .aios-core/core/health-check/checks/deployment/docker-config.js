/**
 * Docker Configuration Check
 *
 * Verifies Docker configuration if present.
 *
 * @module aios-core/health-check/checks/deployment/docker-config
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Docker configuration check
 *
 * @class DockerConfigCheck
 * @extends BaseCheck
 */
class DockerConfigCheck extends BaseCheck {
  constructor() {
    super({
      id: 'deployment.docker-config',
      name: 'Docker Configuration',
      description: 'Verifies Docker configuration',
      domain: CheckDomain.DEPLOYMENT,
      severity: CheckSeverity.INFO,
      timeout: 5000,
      cacheable: true,
      healingTier: 0,
      tags: ['docker', 'containers'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const dockerFiles = [];
    const issues = [];

    // Check for Docker files
    const filesToCheck = [
      'Dockerfile',
      'docker-compose.yml',
      'docker-compose.yaml',
      '.dockerignore',
    ];

    for (const file of filesToCheck) {
      try {
        await fs.access(path.join(projectRoot, file));
        dockerFiles.push(file);
      } catch {
        // Not found
      }
    }

    if (dockerFiles.length === 0) {
      return this.pass('No Docker configuration found (not using Docker)', {
        details: { dockerFiles: [] },
      });
    }

    // Validate Dockerfile if present
    if (dockerFiles.includes('Dockerfile')) {
      try {
        const content = await fs.readFile(path.join(projectRoot, 'Dockerfile'), 'utf8');

        // Check for FROM instruction
        if (!content.includes('FROM ')) {
          issues.push('Dockerfile missing FROM instruction');
        }

        // Check for security best practices
        if (content.includes('root') && !content.includes('USER ')) {
          issues.push('Dockerfile may be running as root');
        }

        // Check if .dockerignore exists
        if (!dockerFiles.includes('.dockerignore')) {
          issues.push('Missing .dockerignore file');
        }
      } catch {
        issues.push('Could not read Dockerfile');
      }
    }

    // Check if Docker is available
    let dockerAvailable = false;
    try {
      execSync('docker --version', { encoding: 'utf8', windowsHide: true });
      dockerAvailable = true;
    } catch {
      // Docker not installed
    }

    const details = {
      dockerFiles,
      dockerAvailable,
      issues: issues.length,
    };

    if (issues.length > 0) {
      return this.warning(`Docker configuration issues: ${issues.join(', ')}`, {
        recommendation: 'Review Docker configuration for best practices',
        details: { ...details, issues },
      });
    }

    return this.pass(`Docker configured (${dockerFiles.join(', ')})`, { details });
  }
}

module.exports = DockerConfigCheck;
