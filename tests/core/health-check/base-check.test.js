/**
 * Unit tests for base-check module
 *
 * Tests the abstract BaseCheck class and its enums:
 * CheckSeverity, CheckStatus, CheckDomain, result helpers,
 * metadata, and healing support.
 */

const { BaseCheck, CheckSeverity, CheckStatus, CheckDomain } = require('../../../.aios-core/core/health-check/base-check');

// Concrete subclass for testing
class TestCheck extends BaseCheck {
  async execute(context) {
    return this.pass('ok');
  }
}

describe('base-check', () => {
  // ============================================================
  // Enums
  // ============================================================
  describe('CheckSeverity', () => {
    test('has all severity levels', () => {
      expect(CheckSeverity.CRITICAL).toBe('CRITICAL');
      expect(CheckSeverity.HIGH).toBe('HIGH');
      expect(CheckSeverity.MEDIUM).toBe('MEDIUM');
      expect(CheckSeverity.LOW).toBe('LOW');
      expect(CheckSeverity.INFO).toBe('INFO');
    });

    test('has exactly 5 levels', () => {
      expect(Object.keys(CheckSeverity)).toHaveLength(5);
    });
  });

  describe('CheckStatus', () => {
    test('has all status values', () => {
      expect(CheckStatus.PASS).toBe('pass');
      expect(CheckStatus.FAIL).toBe('fail');
      expect(CheckStatus.WARNING).toBe('warning');
      expect(CheckStatus.ERROR).toBe('error');
      expect(CheckStatus.SKIPPED).toBe('skipped');
    });

    test('has exactly 5 statuses', () => {
      expect(Object.keys(CheckStatus)).toHaveLength(5);
    });
  });

  describe('CheckDomain', () => {
    test('has all domain values', () => {
      expect(CheckDomain.PROJECT).toBe('project');
      expect(CheckDomain.LOCAL).toBe('local');
      expect(CheckDomain.REPOSITORY).toBe('repository');
      expect(CheckDomain.DEPLOYMENT).toBe('deployment');
      expect(CheckDomain.SERVICES).toBe('services');
    });

    test('has exactly 5 domains', () => {
      expect(Object.keys(CheckDomain)).toHaveLength(5);
    });
  });

  // ============================================================
  // BaseCheck constructor
  // ============================================================
  describe('constructor', () => {
    test('throws when instantiated directly', () => {
      expect(() => new BaseCheck({
        id: 'test', name: 'Test', domain: 'project', severity: 'HIGH'
      })).toThrow('BaseCheck is abstract');
    });

    test('creates instance with required options', () => {
      const check = new TestCheck({
        id: 'test-check',
        name: 'Test Check',
        domain: 'project',
        severity: 'HIGH',
      });
      expect(check.id).toBe('test-check');
      expect(check.name).toBe('Test Check');
      expect(check.domain).toBe('project');
      expect(check.severity).toBe('HIGH');
    });

    test('sets default values', () => {
      const check = new TestCheck({
        id: 'def', name: 'Def', domain: 'local', severity: 'LOW',
      });
      expect(check.description).toBe('');
      expect(check.timeout).toBe(5000);
      expect(check.cacheable).toBe(true);
      expect(check.healingTier).toBe(0);
      expect(check.tags).toEqual([]);
    });

    test('accepts optional values', () => {
      const check = new TestCheck({
        id: 'opt', name: 'Opt', domain: 'local', severity: 'MEDIUM',
        description: 'A description',
        timeout: 10000,
        cacheable: false,
        healingTier: 2,
        tags: ['fast', 'core'],
      });
      expect(check.description).toBe('A description');
      expect(check.timeout).toBe(10000);
      expect(check.cacheable).toBe(false);
      expect(check.healingTier).toBe(2);
      expect(check.tags).toEqual(['fast', 'core']);
    });

    test('throws when id is missing', () => {
      expect(() => new TestCheck({
        name: 'No ID', domain: 'project', severity: 'HIGH',
      })).toThrow('Check must have an id');
    });

    test('throws when name is missing', () => {
      expect(() => new TestCheck({
        id: 'no-name', domain: 'project', severity: 'HIGH',
      })).toThrow('Check must have a name');
    });

    test('throws when domain is missing', () => {
      expect(() => new TestCheck({
        id: 'no-dom', name: 'No Domain', severity: 'HIGH',
      })).toThrow('Check must have a domain');
    });

    test('throws when severity is missing', () => {
      expect(() => new TestCheck({
        id: 'no-sev', name: 'No Severity', domain: 'project',
      })).toThrow('Check must have a severity');
    });
  });

  // ============================================================
  // execute()
  // ============================================================
  describe('execute', () => {
    test('abstract execute throws in base class', async () => {
      // Use a minimal subclass that does NOT override execute
      class NoExecute extends BaseCheck {}
      const check = new NoExecute({
        id: 'no-exec', name: 'No Exec', domain: 'project', severity: 'LOW',
      });
      await expect(check.execute({})).rejects.toThrow('execute() must be implemented');
    });

    test('subclass can implement execute', async () => {
      const check = new TestCheck({
        id: 'impl', name: 'Impl', domain: 'project', severity: 'LOW',
      });
      const result = await check.execute({});
      expect(result.status).toBe('pass');
    });
  });

  // ============================================================
  // Result helpers
  // ============================================================
  describe('pass()', () => {
    let check;
    beforeEach(() => {
      check = new TestCheck({
        id: 'p', name: 'P', domain: 'project', severity: 'LOW',
      });
    });

    test('creates pass result', () => {
      const result = check.pass('All good');
      expect(result.status).toBe('pass');
      expect(result.message).toBe('All good');
      expect(result.healable).toBe(false);
      expect(result.healingTier).toBe(0);
    });

    test('includes details when provided', () => {
      const result = check.pass('ok', { count: 5 });
      expect(result.details).toEqual({ count: 5 });
    });

    test('details default to null', () => {
      const result = check.pass('ok');
      expect(result.details).toBeNull();
    });
  });

  describe('fail()', () => {
    let check;
    beforeEach(() => {
      check = new TestCheck({
        id: 'f', name: 'F', domain: 'project', severity: 'HIGH', healingTier: 1,
      });
    });

    test('creates fail result', () => {
      const result = check.fail('Something broke');
      expect(result.status).toBe('fail');
      expect(result.message).toBe('Something broke');
    });

    test('includes options', () => {
      const result = check.fail('error', {
        details: { file: 'a.js' },
        recommendation: 'Fix it',
        healable: true,
        healingTier: 2,
      });
      expect(result.details).toEqual({ file: 'a.js' });
      expect(result.recommendation).toBe('Fix it');
      expect(result.healable).toBe(true);
      expect(result.healingTier).toBe(2);
    });

    test('uses instance healingTier as default', () => {
      const result = check.fail('err');
      expect(result.healingTier).toBe(1);
    });

    test('defaults to non-healable', () => {
      const result = check.fail('err');
      expect(result.healable).toBe(false);
      expect(result.recommendation).toBeNull();
      expect(result.details).toBeNull();
    });
  });

  describe('warning()', () => {
    let check;
    beforeEach(() => {
      check = new TestCheck({
        id: 'w', name: 'W', domain: 'local', severity: 'MEDIUM',
      });
    });

    test('creates warning result', () => {
      const result = check.warning('Watch out');
      expect(result.status).toBe('warning');
      expect(result.message).toBe('Watch out');
    });

    test('includes options', () => {
      const result = check.warning('warn', {
        details: { info: true },
        recommendation: 'Consider this',
        healable: true,
        healingTier: 1,
      });
      expect(result.details).toEqual({ info: true });
      expect(result.recommendation).toBe('Consider this');
      expect(result.healable).toBe(true);
      expect(result.healingTier).toBe(1);
    });

    test('defaults to safe values', () => {
      const result = check.warning('w');
      expect(result.healable).toBe(false);
      expect(result.healingTier).toBe(0);
      expect(result.details).toBeNull();
      expect(result.recommendation).toBeNull();
    });
  });

  describe('error()', () => {
    let check;
    beforeEach(() => {
      check = new TestCheck({
        id: 'e', name: 'E', domain: 'local', severity: 'CRITICAL',
      });
    });

    test('creates error result', () => {
      const result = check.error('Crash');
      expect(result.status).toBe('error');
      expect(result.message).toBe('Crash');
      expect(result.healable).toBe(false);
      expect(result.healingTier).toBe(0);
    });

    test('includes error details', () => {
      const err = new Error('boom');
      const result = check.error('Crash', err);
      expect(result.details.error).toBe('boom');
      expect(result.details.stack).toBeDefined();
    });

    test('details null when no error provided', () => {
      const result = check.error('No err');
      expect(result.details).toBeNull();
    });
  });

  // ============================================================
  // Metadata & Healing
  // ============================================================
  describe('getMetadata()', () => {
    test('returns complete metadata object', () => {
      const check = new TestCheck({
        id: 'meta-check',
        name: 'Meta Check',
        description: 'Checks metadata',
        domain: 'repository',
        severity: 'INFO',
        timeout: 3000,
        cacheable: false,
        healingTier: 3,
        tags: ['meta'],
      });
      const meta = check.getMetadata();
      expect(meta).toEqual({
        id: 'meta-check',
        name: 'Meta Check',
        description: 'Checks metadata',
        domain: 'repository',
        severity: 'INFO',
        timeout: 3000,
        cacheable: false,
        healingTier: 3,
        tags: ['meta'],
      });
    });
  });

  describe('isHealable()', () => {
    test('returns false when healingTier is 0', () => {
      const check = new TestCheck({
        id: 'nh', name: 'NH', domain: 'project', severity: 'LOW',
      });
      expect(check.isHealable()).toBe(false);
    });

    test('returns true when healingTier > 0', () => {
      const check = new TestCheck({
        id: 'h', name: 'H', domain: 'project', severity: 'LOW', healingTier: 1,
      });
      expect(check.isHealable()).toBe(true);
    });
  });

  describe('getHealer()', () => {
    test('returns null by default', () => {
      const check = new TestCheck({
        id: 'gh', name: 'GH', domain: 'project', severity: 'LOW',
      });
      expect(check.getHealer()).toBeNull();
    });
  });
});
