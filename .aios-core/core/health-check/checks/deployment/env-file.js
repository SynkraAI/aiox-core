/**
 * Environment File Check
 *
 * Verifies .env files are properly configured.
 *
 * @module aios-core/health-check/checks/deployment/env-file
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Environment file check
 *
 * @class EnvFileCheck
 * @extends BaseCheck
 */
class EnvFileCheck extends BaseCheck {
  constructor() {
    super({
      id: 'deployment.env-file',
      name: 'Environment File',
      description: 'Verifies .env configuration',
      domain: CheckDomain.DEPLOYMENT,
      severity: CheckSeverity.HIGH,
      timeout: 2000,
      cacheable: true,
      healingTier: 0, // Cannot auto-create .env (contains secrets)
      tags: ['environment', 'config', 'secrets'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const envFiles = [
      { name: '.env', type: 'main' },
      { name: '.env.example', type: 'example' },
      { name: '.env.local', type: 'local' },
    ];

    const found = [];
    const details = {};

    for (const envFile of envFiles) {
      const envPath = path.join(projectRoot, envFile.name);
      try {
        const content = await fs.readFile(envPath, 'utf8');
        const lines = content.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
        const vars = lines.map((l) => l.split('=')[0]).filter((v) => v);

        found.push(envFile.name);
        details[envFile.name] = {
          variables: vars.length,
          keys: vars.slice(0, 5).map((v) => v.substring(0, 20)), // Truncate for security
        };
      } catch {
        // File doesn't exist
      }
    }

    // Check .env.example exists for documentation
    const hasExample = found.includes('.env.example');
    const hasMain = found.includes('.env');

    if (found.length === 0) {
      return this.pass('No .env files found (project may not use environment variables)', {
        details: { found: [] },
      });
    }

    // Warn if .env exists but no example
    if (hasMain && !hasExample) {
      return this.warning('.env exists but .env.example is missing', {
        recommendation: 'Create .env.example to document required variables',
        details: { found, ...details },
      });
    }

    // Check if .env.example has more vars than .env
    if (hasMain && hasExample) {
      const mainVars = details['.env']?.variables || 0;
      const exampleVars = details['.env.example']?.variables || 0;

      if (exampleVars > mainVars) {
        return this.warning(
          `.env is missing ${exampleVars - mainVars} variable(s) defined in .env.example`,
          {
            recommendation: 'Check .env.example and add missing variables to .env',
            details: { found, ...details },
          },
        );
      }
    }

    return this.pass(`Environment files configured (${found.join(', ')})`, {
      details: { found, ...details },
    });
  }
}

module.exports = EnvFileCheck;
