/**
 * Unit tests for JSON reporter module
 *
 * Tests the JSONReporter class: report generation, domain/issue formatting,
 * auto-fix formatting, tech debt extraction, sanitization of secrets.
 */

const JSONReporter = require('../../../.aios-core/core/health-check/reporters/json');

describe('JSONReporter', () => {
  let reporter;

  const makeCheckResult = (overrides = {}) => ({
    checkId: 'test-check',
    name: 'Test Check',
    domain: 'project',
    severity: 'MEDIUM',
    status: 'pass',
    message: 'All good',
    recommendation: null,
    duration: 50,
    timestamp: '2026-01-01T00:00:00.000Z',
    fromCache: false,
    healable: false,
    healingTier: 0,
    details: null,
    ...overrides,
  });

  const makeReportData = (overrides = {}) => ({
    checkResults: [makeCheckResult()],
    scores: {
      overall: { score: 95, status: 'healthy', issuesCount: 0 },
      domains: {
        project: {
          score: 100,
          status: 'healthy',
          summary: 'All project checks passed',
          checks: [{ name: 'Test Check', status: 'pass', severity: 'MEDIUM' }],
        },
      },
    },
    healingResults: [],
    config: { mode: 'quick' },
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  });

  beforeEach(() => {
    reporter = new JSONReporter();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('defaults to pretty and sanitized', () => {
      expect(reporter.pretty).toBe(true);
      expect(reporter.sanitize).toBe(true);
    });

    test('can disable pretty printing', () => {
      const r = new JSONReporter({ output: { pretty: false } });
      expect(r.pretty).toBe(false);
    });

    test('can disable sanitization', () => {
      const r = new JSONReporter({ output: { sanitize: false } });
      expect(r.sanitize).toBe(false);
    });
  });

  // ============================================================
  // generate
  // ============================================================
  describe('generate', () => {
    test('returns valid JSON string', async () => {
      const result = await reporter.generate(makeReportData());
      expect(() => JSON.parse(result)).not.toThrow();
    });

    test('includes schema and version', async () => {
      const result = JSON.parse(await reporter.generate(makeReportData()));
      expect(result.$schema).toBeDefined();
      expect(result.version).toBe('1.0.0');
    });

    test('includes overall summary', async () => {
      const result = JSON.parse(await reporter.generate(makeReportData()));
      expect(result.overall.score).toBe(95);
      expect(result.overall.status).toBe('healthy');
    });

    test('includes mode from config', async () => {
      const result = JSON.parse(await reporter.generate(makeReportData()));
      expect(result.mode).toBe('quick');
    });

    test('defaults mode to quick when not specified', async () => {
      const data = makeReportData({ config: {} });
      const result = JSON.parse(await reporter.generate(data));
      expect(result.mode).toBe('quick');
    });

    test('returns compact JSON when pretty is false', async () => {
      const r = new JSONReporter({ output: { pretty: false } });
      const result = await r.generate(makeReportData());
      expect(result).not.toContain('\n');
    });

    test('returns formatted JSON when pretty is true', async () => {
      const result = await reporter.generate(makeReportData());
      expect(result).toContain('\n');
    });

    test('counts auto-fixed items', async () => {
      const data = makeReportData({
        healingResults: [
          { success: true, checkId: 'a' },
          { success: false, checkId: 'b' },
          { success: true, checkId: 'c' },
        ],
      });
      const result = JSON.parse(await reporter.generate(data));
      expect(result.overall.autoFixedCount).toBe(2);
    });

    test('handles null healingResults', async () => {
      const data = makeReportData({ healingResults: null });
      const result = JSON.parse(await reporter.generate(data));
      expect(result.overall.autoFixedCount).toBe(0);
    });
  });

  // ============================================================
  // calculateDuration
  // ============================================================
  describe('calculateDuration', () => {
    test('formats milliseconds', () => {
      expect(reporter.calculateDuration([{ duration: 500 }])).toBe('500ms');
    });

    test('formats seconds', () => {
      expect(reporter.calculateDuration([{ duration: 1500 }])).toBe('1.5s');
    });

    test('sums multiple results', () => {
      const results = [{ duration: 300 }, { duration: 200 }];
      expect(reporter.calculateDuration(results)).toBe('500ms');
    });

    test('handles missing duration', () => {
      expect(reporter.calculateDuration([{}])).toBe('0ms');
    });
  });

  // ============================================================
  // formatDomainScores
  // ============================================================
  describe('formatDomainScores', () => {
    test('formats domain data', () => {
      const domains = {
        project: {
          score: 90,
          status: 'healthy',
          summary: 'Good',
          checks: [{ name: 'Check A', status: 'pass', severity: 'HIGH' }],
        },
      };
      const result = reporter.formatDomainScores(domains);
      expect(result.project.score).toBe(90);
      expect(result.project.checks[0].name).toBe('Check A');
    });
  });

  // ============================================================
  // formatIssues
  // ============================================================
  describe('formatIssues', () => {
    test('groups issues by severity', () => {
      const results = [
        makeCheckResult({ status: 'fail', severity: 'CRITICAL' }),
        makeCheckResult({ checkId: 'w1', status: 'warning', severity: 'HIGH' }),
        makeCheckResult({ checkId: 'p1', status: 'pass', severity: 'MEDIUM' }),
      ];
      const issues = reporter.formatIssues(results);
      expect(issues.critical).toHaveLength(1);
      expect(issues.high).toHaveLength(1);
      expect(issues.medium).toHaveLength(0);
    });

    test('includes error status in issues', () => {
      const results = [
        makeCheckResult({ status: 'error', severity: 'CRITICAL' }),
      ];
      const issues = reporter.formatIssues(results);
      expect(issues.critical).toHaveLength(1);
    });

    test('returns empty groups when all pass', () => {
      const results = [makeCheckResult({ status: 'pass' })];
      const issues = reporter.formatIssues(results);
      expect(issues.critical).toHaveLength(0);
      expect(issues.high).toHaveLength(0);
    });
  });

  // ============================================================
  // formatAutoFixed
  // ============================================================
  describe('formatAutoFixed', () => {
    test('returns successful healing results', () => {
      const results = [
        { success: true, checkId: 'a', tier: 1, action: 'fix', message: 'Fixed' },
        { success: false, checkId: 'b', tier: 2, action: 'fix', message: 'Failed' },
      ];
      const fixed = reporter.formatAutoFixed(results);
      expect(fixed).toHaveLength(1);
      expect(fixed[0].checkId).toBe('a');
    });

    test('returns empty array for null input', () => {
      expect(reporter.formatAutoFixed(null)).toEqual([]);
    });

    test('includes backupPath when present', () => {
      const results = [
        { success: true, checkId: 'a', tier: 1, action: 'fix', message: 'ok', backupPath: '/tmp/bak' },
      ];
      const fixed = reporter.formatAutoFixed(results);
      expect(fixed[0].backupPath).toBe('/tmp/bak');
    });
  });

  // ============================================================
  // extractTechDebt
  // ============================================================
  describe('extractTechDebt', () => {
    test('includes warnings as tech debt', () => {
      const results = [
        makeCheckResult({ status: 'warning', severity: 'MEDIUM' }),
      ];
      const debt = reporter.extractTechDebt(results);
      expect(debt).toHaveLength(1);
    });

    test('includes non-passing LOW severity as tech debt', () => {
      const results = [
        makeCheckResult({ status: 'fail', severity: 'LOW' }),
      ];
      const debt = reporter.extractTechDebt(results);
      expect(debt).toHaveLength(1);
    });

    test('excludes passing checks', () => {
      const results = [
        makeCheckResult({ status: 'pass', severity: 'LOW' }),
      ];
      const debt = reporter.extractTechDebt(results);
      expect(debt).toHaveLength(0);
    });
  });

  // ============================================================
  // Sanitization
  // ============================================================
  describe('sanitization', () => {
    test('redacts sensitive keys', () => {
      const obj = { api_key: 'secret123', name: 'safe' };
      reporter.sanitizeObject(obj);
      expect(obj.api_key).toBe('[REDACTED]');
      expect(obj.name).toBe('safe');
    });

    test('redacts nested sensitive keys', () => {
      const obj = { db: { password: 'mypass', host: 'localhost' } };
      reporter.sanitizeObject(obj);
      expect(obj.db.password).toBe('[REDACTED]');
      expect(obj.db.host).toBe('localhost');
    });

    test('redacts strings starting with sk-', () => {
      const obj = { value: 'sk-abc123' };
      reporter.sanitizeObject(obj);
      expect(obj.value).toBe('[REDACTED]');
    });

    test('redacts long hex strings', () => {
      const obj = { hash: 'a'.repeat(32) };
      reporter.sanitizeObject(obj);
      expect(obj.hash).toBe('[REDACTED]');
    });

    test('redacts long base64 strings', () => {
      const obj = { encoded: 'A'.repeat(50) };
      reporter.sanitizeObject(obj);
      expect(obj.encoded).toBe('[REDACTED]');
    });

    test('does not redact short strings', () => {
      const obj = { val: 'hello' };
      reporter.sanitizeObject(obj);
      expect(obj.val).toBe('hello');
    });

    test('handles null/undefined input', () => {
      expect(() => reporter.sanitizeObject(null)).not.toThrow();
      expect(() => reporter.sanitizeObject(undefined)).not.toThrow();
    });

    test('isSensitiveKey matches patterns', () => {
      expect(reporter.isSensitiveKey('api_key')).toBe(true);
      expect(reporter.isSensitiveKey('password')).toBe(true);
      expect(reporter.isSensitiveKey('auth_token')).toBe(true);
      expect(reporter.isSensitiveKey('name')).toBe(false);
    });

    test('sanitizeDetails returns null for null input', () => {
      expect(reporter.sanitizeDetails(null)).toBeNull();
    });

    test('sanitizeDetails redacts sensitive fields', () => {
      const details = { token: 'secret', info: 'ok' };
      const result = reporter.sanitizeDetails(details);
      expect(result.token).toBe('[REDACTED]');
      expect(result.info).toBe('ok');
    });

    test('skips sanitization when disabled', async () => {
      const r = new JSONReporter({ output: { sanitize: false } });
      const data = makeReportData({
        checkResults: [makeCheckResult({ details: { api_key: 'secret' } })],
      });
      const result = JSON.parse(await r.generate(data));
      expect(result.checks[0].details.api_key).toBe('secret');
    });
  });

  // ============================================================
  // formatChecks
  // ============================================================
  describe('formatChecks', () => {
    test('maps all check fields', () => {
      const checks = reporter.formatChecks([makeCheckResult()]);
      expect(checks[0].id).toBe('test-check');
      expect(checks[0].name).toBe('Test Check');
      expect(checks[0].domain).toBe('project');
      expect(checks[0].fromCache).toBe(false);
    });

    test('defaults fromCache to false', () => {
      const checks = reporter.formatChecks([makeCheckResult({ fromCache: undefined })]);
      expect(checks[0].fromCache).toBe(false);
    });
  });
});
