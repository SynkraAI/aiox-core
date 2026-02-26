/**
 * Environment Variables Check
 *
 * Verifies required environment variables are set.
 *
 * @module aios-core/health-check/checks/local/environment-vars
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Required environment variables (critical)
 */
const REQUIRED_VARS = ['PATH'];

/**
 * Recommended environment variables
 */
const RECOMMENDED_VARS = [
  'HOME',
  'USERPROFILE', // Windows
];

/**
 * AIOS-specific environment variables
 */
const AIOS_VARS = ['AIOS_DEBUG', 'AIOS_LOG_LEVEL'];

/**
 * Environment variables check
 *
 * @class EnvironmentVarsCheck
 * @extends BaseCheck
 */
class EnvironmentVarsCheck extends BaseCheck {
  constructor() {
    super({
      id: 'local.environment-vars',
      name: 'Environment Variables',
      description: 'Verifies required environment variables are set',
      domain: CheckDomain.LOCAL,
      severity: CheckSeverity.MEDIUM,
      timeout: 1000,
      cacheable: true,
      healingTier: 0, // Cannot auto-set env vars
      tags: ['environment', 'config'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(_context) {
    const missingRequired = [];
    const missingRecommended = [];
    const aiosVars = [];
    const setVars = [];

    // Check required vars
    for (const varName of REQUIRED_VARS) {
      if (process.env[varName]) {
        setVars.push(varName);
      } else {
        missingRequired.push(varName);
      }
    }

    // Check recommended vars
    for (const varName of RECOMMENDED_VARS) {
      if (process.env[varName]) {
        setVars.push(varName);
      } else {
        missingRecommended.push(varName);
      }
    }

    // Check AIOS-specific vars (info only)
    for (const varName of AIOS_VARS) {
      if (process.env[varName]) {
        aiosVars.push({ name: varName, value: this.maskValue(process.env[varName]) });
      }
    }

    // Missing required is a failure
    if (missingRequired.length > 0) {
      return this.fail(`Missing required environment variables: ${missingRequired.join(', ')}`, {
        recommendation: 'Set the missing environment variables in your shell profile',
        details: {
          missingRequired,
          missingRecommended,
        },
      });
    }

    // Missing recommended is a warning
    if (missingRecommended.length > 0) {
      return this.warning(
        `Missing recommended environment variables: ${missingRecommended.join(', ')}`,
        {
          recommendation: 'Consider setting recommended variables for full functionality',
          details: {
            setVars,
            missingRecommended,
            aiosVars,
          },
        },
      );
    }

    return this.pass('All required environment variables are set', {
      details: {
        setVars,
        aiosVars,
        homeDir: process.env.HOME || process.env.USERPROFILE,
      },
    });
  }

  /**
   * Mask sensitive values
   * @private
   */
  maskValue(value) {
    if (!value) return '';
    if (value.length <= 4) return '****';
    return value.substring(0, 2) + '****' + value.substring(value.length - 2);
  }
}

module.exports = EnvironmentVarsCheck;
