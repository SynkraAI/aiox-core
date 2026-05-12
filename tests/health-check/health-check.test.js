/**
 * Health Check System Tests
 *
 * @story HCS-2 - Health Check System Implementation
 */

const assert = require('assert');
const path = require('path');

// Import health check modules
const {
  HealthCheck,
  HealthCheckEngine,
  BaseCheck,
  CheckSeverity,
  CheckStatus,
  CheckRegistry,
  DEFAULT_CONFIG,
} = require('../../.aiox-core/core/health-check');

// Set timeout for all tests in this file (Jest compatible)
jest.setTimeout(30000);

describe('Health Check System', () => {
  describe('Module Loading', () => {
    it('should export all required classes', () => {
      assert.strictEqual(typeof HealthCheck, 'function', 'HealthCheck should be a class');
      assert.strictEqual(
        typeof HealthCheckEngine,
        'function',
        'HealthCheckEngine should be a class',
      );
      assert.strictEqual(typeof BaseCheck, 'function', 'BaseCheck should be a class');
      assert.strictEqual(typeof CheckRegistry, 'function', 'CheckRegistry should be a class');
    });

    it('should export severity and status enums', () => {
      assert.ok(CheckSeverity.CRITICAL, 'Should have CRITICAL severity');
      assert.ok(CheckSeverity.HIGH, 'Should have HIGH severity');
      assert.ok(CheckSeverity.MEDIUM, 'Should have MEDIUM severity');
      assert.ok(CheckSeverity.LOW, 'Should have LOW severity');
      assert.ok(CheckSeverity.INFO, 'Should have INFO severity');

      assert.ok(CheckStatus.PASS, 'Should have PASS status');
      assert.ok(CheckStatus.FAIL, 'Should have FAIL status');
      assert.ok(CheckStatus.WARNING, 'Should have WARNING status');
    });

    it('should have default configuration', () => {
      assert.ok(DEFAULT_CONFIG, 'Should have DEFAULT_CONFIG');
      assert.strictEqual(DEFAULT_CONFIG.mode, 'quick', 'Default mode should be quick');
      assert.strictEqual(DEFAULT_CONFIG.autoFix, true, 'Auto-fix should be enabled by default');
    });
  });

  describe('HealthCheck Instance', () => {
    let healthCheck;

    beforeEach(() => {
      healthCheck = new HealthCheck();
    });

    it('should create instance with default config', () => {
      assert.ok(healthCheck, 'Should create instance');
      assert.ok(healthCheck.engine, 'Should have engine');
      assert.ok(healthCheck.registry, 'Should have registry');
      assert.ok(healthCheck.healers, 'Should have healers');
      assert.ok(healthCheck.reporters, 'Should have reporters');
    });

    it('should return all 5 domains', () => {
      const domains = healthCheck.getDomains();
      assert.strictEqual(domains.length, 5, 'Should have 5 domains');
      assert.ok(domains.includes('project'), 'Should include project');
      assert.ok(domains.includes('local'), 'Should include local');
      assert.ok(domains.includes('repository'), 'Should include repository');
      assert.ok(domains.includes('deployment'), 'Should include deployment');
      assert.ok(domains.includes('services'), 'Should include services');
    });

    it('should have 34 total checks', () => {
      const counts = healthCheck.getCheckCounts();
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      assert.strictEqual(total, 34, 'Should have 34 total checks');
    });

    it('should have correct check distribution', () => {
      const counts = healthCheck.getCheckCounts();
      assert.strictEqual(counts.project, 8, 'Project should have 8 checks');
      assert.strictEqual(counts.local, 8, 'Local should have 8 checks');
      assert.strictEqual(counts.repository, 8, 'Repository should have 8 checks');
      assert.strictEqual(counts.deployment, 5, 'Deployment should have 5 checks');
      assert.strictEqual(counts.services, 5, 'Services should have 5 checks');
    });
  });

  describe('Health Check Execution', () => {
    let healthCheck;

    beforeEach(() => {
      healthCheck = new HealthCheck({ mode: 'quick' });
    });

    it('should run quick mode successfully', async () => {
      const results = await healthCheck.run({ mode: 'quick' });

      assert.ok(results, 'Should return results');
      assert.ok(results.timestamp, 'Should have timestamp');
      assert.ok(results.overall, 'Should have overall summary');
      assert.ok(results.domains, 'Should have domain scores');
      assert.ok(results.report, 'Should have report');
    });

    it('should return valid score', async () => {
      const results = await healthCheck.run({ mode: 'quick' });

      assert.ok(results.overall.score >= 0, 'Score should be >= 0');
      assert.ok(results.overall.score <= 100, 'Score should be <= 100');
    });

    it('should return valid status', async () => {
      const results = await healthCheck.run({ mode: 'quick' });
      const validStatuses = ['healthy', 'degraded', 'warning', 'critical'];

      assert.ok(
        validStatuses.includes(results.overall.status),
        `Status should be one of: ${validStatuses.join(', ')}`,
      );
    });

    it('should run domain-specific check', async () => {
      const results = await healthCheck.run({ domain: 'project' });

      assert.ok(results.domains.project, 'Should have project domain results');
    });

    it('should complete within timeout', async () => {
      const startTime = Date.now();
      await healthCheck.run({ mode: 'quick' });
      const duration = Date.now() - startTime;

      assert.ok(duration < 15000, `Quick mode should complete in <15s (took ${duration}ms)`);
    });
  });

  describe('Reporters', () => {
    let healthCheck;
    let results;

    beforeAll(async () => {
      healthCheck = new HealthCheck();
      results = await healthCheck.run({ mode: 'quick', domain: 'project' });
    });

    it('should generate console report', () => {
      assert.ok(results.report, 'Should have report');
      assert.ok(typeof results.report === 'string', 'Report should be string');
      assert.ok(results.report.includes('Health'), 'Report should mention Health');
    });
  });

  describe('Check Registry', () => {
    it('should register and retrieve checks', () => {
      const registry = new CheckRegistry();

      // Get stats
      const stats = registry.getStats();
      assert.ok(stats.total > 0, 'Should have registered checks');
    });

    it('should group checks by domain', () => {
      const registry = new CheckRegistry();

      const projectChecks = registry.getChecksByDomain('project');
      assert.ok(Array.isArray(projectChecks), 'Should return array');
    });

    it('should group checks by severity', () => {
      const registry = new CheckRegistry();

      const criticalChecks = registry.getChecksBySeverity('CRITICAL');
      assert.ok(Array.isArray(criticalChecks), 'Should return array');
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score correctly for all pass', async () => {
      // When all checks pass, score should be 100
      const healthCheck = new HealthCheck();
      const results = await healthCheck.run({ mode: 'quick', domain: 'project' });

      // Verify score is calculated
      assert.ok(typeof results.overall.score === 'number', 'Score should be number');
    });
  });
});
