/**
 * API Endpoints Check
 *
 * Verifies external API endpoint connectivity.
 *
 * @module aios-core/health-check/checks/services/api-endpoints
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const https = require('https');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Common development API endpoints to check
 */
const COMMON_ENDPOINTS = [
  { name: 'npm Registry', host: 'registry.npmjs.org', path: '/', critical: true },
  { name: 'GitHub API', host: 'api.github.com', path: '/', critical: false },
];

/**
 * API endpoints check
 *
 * @class ApiEndpointsCheck
 * @extends BaseCheck
 */
class ApiEndpointsCheck extends BaseCheck {
  constructor() {
    super({
      id: 'services.api-endpoints',
      name: 'API Endpoints',
      description: 'Verifies external API endpoint connectivity',
      domain: CheckDomain.SERVICES,
      severity: CheckSeverity.LOW,
      timeout: 15000,
      cacheable: false, // Network state can change
      healingTier: 3, // Manual - network issues
      tags: ['api', 'network', 'connectivity'],
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
    const criticalFailures = [];

    for (const endpoint of COMMON_ENDPOINTS) {
      try {
        const responseTime = await this.checkEndpoint(endpoint.host, endpoint.path);
        results.push({
          name: endpoint.name,
          status: 'ok',
          responseTime: `${responseTime}ms`,
        });
      } catch (error) {
        const failure = {
          name: endpoint.name,
          status: 'failed',
          error: error.message,
        };
        results.push(failure);
        failures.push(endpoint.name);

        if (endpoint.critical) {
          criticalFailures.push(endpoint.name);
        }
      }
    }

    const details = {
      endpoints: results,
      checkedCount: COMMON_ENDPOINTS.length,
      failedCount: failures.length,
    };

    // Critical endpoint failure
    if (criticalFailures.length > 0) {
      return this.fail(`Critical API endpoint(s) unreachable: ${criticalFailures.join(', ')}`, {
        recommendation: 'Check network connection and firewall settings',
        healable: false,
        healingTier: 3,
        details,
      });
    }

    // Non-critical failures
    if (failures.length > 0) {
      return this.warning(`Some API endpoints unreachable: ${failures.join(', ')}`, {
        recommendation: 'Non-critical services unavailable - some features may not work',
        details,
      });
    }

    return this.pass(`All ${COMMON_ENDPOINTS.length} API endpoints reachable`, {
      details,
    });
  }

  /**
   * Check a single endpoint
   * @private
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
          headers: {
            'User-Agent': 'AIOS-HealthCheck/1.0',
          },
        },
        (res) => {
          const responseTime = Date.now() - startTime;

          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve(responseTime);
          } else if (res.statusCode === 403 || res.statusCode === 401) {
            // Auth required but endpoint is reachable
            resolve(responseTime);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        },
      );

      req.on('error', reject);
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
      name: 'api-connectivity-guide',
      action: 'manual',
      manualGuide: 'Troubleshoot API connectivity',
      steps: [
        'Check your internet connection',
        'Verify you can access these URLs in a browser',
        'Check if you are behind a corporate proxy',
        'Configure proxy settings if needed',
        'Check firewall settings',
      ],
    };
  }
}

module.exports = ApiEndpointsCheck;
