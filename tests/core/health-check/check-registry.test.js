/**
 * Unit tests for check-registry module
 *
 * Tests the CheckRegistry class: registration, unregistration,
 * lookup by id/domain/severity/tag, healable checks, stats, and clear.
 */

const { BaseCheck, CheckSeverity, CheckDomain } = require('../../../.aios-core/core/health-check/base-check');

// Mock the built-in check modules to prevent loading real files
jest.mock('../../../.aios-core/core/health-check/checks/project', () => ({}), { virtual: true });
jest.mock('../../../.aios-core/core/health-check/checks/local', () => ({}), { virtual: true });
jest.mock('../../../.aios-core/core/health-check/checks/repository', () => ({}), { virtual: true });
jest.mock('../../../.aios-core/core/health-check/checks/deployment', () => ({}), { virtual: true });
jest.mock('../../../.aios-core/core/health-check/checks/services', () => ({}), { virtual: true });

const CheckRegistry = require('../../../.aios-core/core/health-check/check-registry');

// Test check subclasses
class ProjectCheck extends BaseCheck {
  constructor(id, opts = {}) {
    super({
      id,
      name: opts.name || `Check ${id}`,
      domain: CheckDomain.PROJECT,
      severity: opts.severity || CheckSeverity.MEDIUM,
      healingTier: opts.healingTier || 0,
      tags: opts.tags || [],
    });
  }
  async execute() { return this.pass('ok'); }
}

class LocalCheck extends BaseCheck {
  constructor(id, opts = {}) {
    super({
      id,
      name: opts.name || `Check ${id}`,
      domain: CheckDomain.LOCAL,
      severity: opts.severity || CheckSeverity.LOW,
      healingTier: opts.healingTier || 0,
      tags: opts.tags || [],
    });
  }
  async execute() { return this.pass('ok'); }
}

describe('check-registry', () => {
  let registry;

  beforeEach(() => {
    registry = new CheckRegistry();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    test('registers a valid check', () => {
      const check = new ProjectCheck('pkg-json');
      registry.register(check);
      expect(registry.getCheck('pkg-json')).toBe(check);
    });

    test('throws for non-BaseCheck instance', () => {
      expect(() => registry.register({ id: 'fake' })).toThrow('must be an instance of BaseCheck');
    });

    test('throws for duplicate id', () => {
      registry.register(new ProjectCheck('dup'));
      expect(() => registry.register(new ProjectCheck('dup'))).toThrow("already registered");
    });

    test('indexes check by domain', () => {
      const check = new ProjectCheck('proj-1');
      registry.register(check);
      expect(registry.getChecksByDomain(CheckDomain.PROJECT)).toContain(check);
    });

    test('indexes check by severity', () => {
      const check = new ProjectCheck('sev-1', { severity: CheckSeverity.CRITICAL });
      registry.register(check);
      expect(registry.getChecksBySeverity(CheckSeverity.CRITICAL)).toContain(check);
    });
  });

  // ============================================================
  // unregister
  // ============================================================
  describe('unregister', () => {
    test('removes a registered check', () => {
      registry.register(new ProjectCheck('to-remove'));
      expect(registry.unregister('to-remove')).toBe(true);
      expect(registry.getCheck('to-remove')).toBeUndefined();
    });

    test('returns false for non-existent check', () => {
      expect(registry.unregister('does-not-exist')).toBe(false);
    });

    test('removes check from domain index', () => {
      const check = new ProjectCheck('dom-rm');
      registry.register(check);
      registry.unregister('dom-rm');
      expect(registry.getChecksByDomain(CheckDomain.PROJECT)).not.toContain(check);
    });

    test('removes check from severity index', () => {
      const check = new ProjectCheck('sev-rm', { severity: CheckSeverity.HIGH });
      registry.register(check);
      registry.unregister('sev-rm');
      expect(registry.getChecksBySeverity(CheckSeverity.HIGH)).not.toContain(check);
    });
  });

  // ============================================================
  // getCheck / getAllChecks
  // ============================================================
  describe('getCheck', () => {
    test('returns check by id', () => {
      const check = new ProjectCheck('find-me');
      registry.register(check);
      expect(registry.getCheck('find-me')).toBe(check);
    });

    test('returns undefined for unknown id', () => {
      expect(registry.getCheck('nope')).toBeUndefined();
    });
  });

  describe('getAllChecks', () => {
    test('returns all registered checks as array', () => {
      registry.register(new ProjectCheck('a'));
      registry.register(new LocalCheck('b'));
      const all = registry.getAllChecks();
      expect(all).toHaveLength(2);
    });

    test('returns empty array when no checks', () => {
      registry.clear();
      expect(registry.getAllChecks()).toEqual([]);
    });
  });

  // ============================================================
  // getChecksByDomain
  // ============================================================
  describe('getChecksByDomain', () => {
    test('returns checks for a specific domain', () => {
      registry.register(new ProjectCheck('p1'));
      registry.register(new ProjectCheck('p2'));
      registry.register(new LocalCheck('l1'));

      const project = registry.getChecksByDomain(CheckDomain.PROJECT);
      expect(project).toHaveLength(2);
    });

    test('returns empty array for domain with no checks', () => {
      expect(registry.getChecksByDomain(CheckDomain.SERVICES)).toEqual([]);
    });
  });

  // ============================================================
  // getChecksBySeverity
  // ============================================================
  describe('getChecksBySeverity', () => {
    test('returns checks for a specific severity', () => {
      registry.register(new ProjectCheck('c1', { severity: CheckSeverity.CRITICAL }));
      registry.register(new ProjectCheck('c2', { severity: CheckSeverity.CRITICAL }));
      registry.register(new LocalCheck('l1', { severity: CheckSeverity.LOW }));

      expect(registry.getChecksBySeverity(CheckSeverity.CRITICAL)).toHaveLength(2);
      expect(registry.getChecksBySeverity(CheckSeverity.LOW)).toHaveLength(1);
    });

    test('returns empty array for unused severity', () => {
      expect(registry.getChecksBySeverity(CheckSeverity.INFO)).toEqual([]);
    });
  });

  // ============================================================
  // getChecksByTag
  // ============================================================
  describe('getChecksByTag', () => {
    test('filters checks by tag', () => {
      registry.register(new ProjectCheck('t1', { tags: ['fast', 'core'] }));
      registry.register(new ProjectCheck('t2', { tags: ['slow'] }));
      registry.register(new LocalCheck('t3', { tags: ['fast'] }));

      const fast = registry.getChecksByTag('fast');
      expect(fast).toHaveLength(2);
    });

    test('returns empty when no checks match tag', () => {
      registry.register(new ProjectCheck('t1', { tags: ['a'] }));
      expect(registry.getChecksByTag('nonexistent')).toEqual([]);
    });
  });

  // ============================================================
  // getHealableChecks
  // ============================================================
  describe('getHealableChecks', () => {
    test('returns checks with healingTier > 0', () => {
      registry.register(new ProjectCheck('h1', { healingTier: 1 }));
      registry.register(new ProjectCheck('h2', { healingTier: 2 }));
      registry.register(new LocalCheck('h3', { healingTier: 0 }));

      const healable = registry.getHealableChecks();
      expect(healable).toHaveLength(2);
    });

    test('filters by maxTier', () => {
      registry.register(new ProjectCheck('t1', { healingTier: 1 }));
      registry.register(new ProjectCheck('t2', { healingTier: 2 }));
      registry.register(new ProjectCheck('t3', { healingTier: 3 }));

      expect(registry.getHealableChecks(1)).toHaveLength(1);
      expect(registry.getHealableChecks(2)).toHaveLength(2);
    });

    test('returns empty when no healable checks', () => {
      registry.register(new ProjectCheck('nh', { healingTier: 0 }));
      expect(registry.getHealableChecks()).toEqual([]);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    test('returns complete stats object', () => {
      registry.register(new ProjectCheck('s1', { severity: CheckSeverity.HIGH, healingTier: 1 }));
      registry.register(new LocalCheck('s2', { severity: CheckSeverity.LOW }));

      const stats = registry.getStats();
      expect(stats.total).toBe(2);
      expect(stats.byDomain[CheckDomain.PROJECT]).toBe(1);
      expect(stats.byDomain[CheckDomain.LOCAL]).toBe(1);
      expect(stats.bySeverity[CheckSeverity.HIGH]).toBe(1);
      expect(stats.healable).toBe(1);
    });

    test('returns zeros when empty', () => {
      registry.clear();
      const stats = registry.getStats();
      expect(stats.total).toBe(0);
      expect(stats.healable).toBe(0);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    test('removes all checks', () => {
      registry.register(new ProjectCheck('cl1'));
      registry.register(new LocalCheck('cl2'));
      registry.clear();

      expect(registry.getAllChecks()).toEqual([]);
      expect(registry.getChecksByDomain(CheckDomain.PROJECT)).toEqual([]);
    });

    test('allows re-registration after clear', () => {
      const check = new ProjectCheck('re-add');
      registry.register(check);
      registry.clear();
      registry.register(check);
      expect(registry.getCheck('re-add')).toBe(check);
    });
  });
});
