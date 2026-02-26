/**
 * Network Check
 *
 * Verifies network connectivity for development tools.
 *
 * @module aios-core/health-check/checks/local/network
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const https = require('https');
const dns = require('dns').promises;
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Endpoints to check
 */
const ENDPOINTS = [
  { name: 'npm Registry', host: 'registry.npmjs.org', path: '/' },
  { name: 'GitHub', host: 'github.com', path: '/' },
];

/**
 * Network connectivity check
 *
 * @class NetworkCheck
 * @extends BaseCheck
 */
class NetworkCheck extends BaseCheck {
  constructor() {
    super({
      id: 'local.network',
      name: 'Network Connectivity',
      description: 'Verifies network connectivity for development tools',
      domain: CheckDomain.LOCAL,
      severity: CheckSeverity.HIGH,
      timeout: 10000,
      cacheable: false, // Don't cache - network can change
      healingTier: 3, // Manual - network issues
      tags: ['network', 'connectivity'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(_context) {
    const results = [];
    const failures = [];

    // Check DNS first
    try {
      await dns.lookup('github.com');
      results.push({ name: 'DNS', status: 'ok' });
    } catch {
      failures.push('DNS resolution');
      results.push({ name: 'DNS', status: 'failed' });
    }

    // Check each endpoint
    for (const endpoint of ENDPOINTS) {
      try {
        const responseTime = await this.checkEndpoint(endpoint.host, endpoint.path);
        results.push({
          name: endpoint.name,
          status: 'ok',
          responseTime: `${responseTime}ms`,
        });
      } catch (error) {
        failures.push(endpoint.name);
        results.push({
          name: endpoint.name,
          status: 'failed',
          error: error.message,
        });
      }
    }

    const details = { checks: results };

    // All failed - critical
    if (failures.length === ENDPOINTS.length + 1) {
      return this.fail('No network connectivity detected', {
        recommendation: 'Check your internet connection',
        healable: false,
        healingTier: 3,
        details,
      });
    }

    // Some failed - warning
    if (failures.length > 0) {
      return this.warning(`Some network services unreachable: ${failures.join(', ')}`, {
        recommendation: 'Check firewall settings or try again later',
        details,
      });
    }

    return this.pass('Network connectivity OK', { details });
  }

  /**
   * Check a single endpoint
   * @private
   * @param {string} host - Host to check
   * @param {string} urlPath - Path to request
   * @returns {Promise<number>} Response time in ms
   */
  checkEndpoint(host, urlPath) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const req = https.request(
        {
          host,
          path: urlPath,
          method: 'HEAD',
          timeout: 5000,
        },
        (res) => {
          const responseTime = Date.now() - startTime;

          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve(responseTime);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        },
      );

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.end();
    });
  }

  /**
   * Get healer (manual guide)
   */
  getHealer() {
    return {
      name: 'network-troubleshoot-guide',
      action: 'manual',
      manualGuide: 'Troubleshoot network connectivity',
      steps: [
        'Check if you have internet access',
        'Try pinging github.com or google.com',
        'Check your firewall settings',
        'Verify proxy settings if behind a corporate proxy',
        'Try a different network (mobile hotspot)',
        'Contact your network administrator if issues persist',
      ],
      documentation:
        'https://docs.github.com/en/authentication/troubleshooting-ssh/error-permission-denied-publickey',
    };
  }
}

module.exports = NetworkCheck;
