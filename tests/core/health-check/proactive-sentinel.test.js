/**
 * Tests for Proactive Sentinel
 *
 * Story: HCS-3 - Proactive Health Monitoring
 */

const fs = require('fs');
const path = require('path');
const ProactiveSentinel = require('../../../.aios-core/core/health-check/proactive-sentinel');
const { AlertSeverity, WatchpointStatus, Events, CONFIG } = ProactiveSentinel;

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TEST SETUP
// ═══════════════════════════════════════════════════════════════════════════════════

const TEST_DIR = path.join(__dirname, '__test-sentinel__');

function createSentinel(overrides = {}) {
  return new ProactiveSentinel({
    projectRoot: TEST_DIR,
    config: {
      alertsPath: '.aiox/sentinel-alerts.json',
      ...overrides,
    },
  });
}

function healthyCheck() {
  return async () => ({
    status: WatchpointStatus.HEALTHY,
    message: 'All good',
  });
}

function failingCheck(msg = 'Something broke') {
  return async () => ({
    status: WatchpointStatus.FAILING,
    message: msg,
    data: { detail: 'error' },
  });
}

function degradedCheck() {
  return async () => ({
    status: WatchpointStatus.DEGRADED,
    message: 'Partially working',
  });
}

beforeEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - constructor', () => {
  test('initializes with defaults', () => {
    const s = createSentinel();
    expect(s.watchpoints.size).toBe(0);
    expect(s.alerts).toEqual([]);
    expect(s.running).toBe(false);
    expect(s._lastHealthScore).toBe(100);
  });

  test('accepts custom config', () => {
    const s = createSentinel({ maxAlerts: 50 });
    expect(s.config.maxAlerts).toBe(50);
  });

  test('is an EventEmitter', () => {
    const s = createSentinel();
    expect(typeof s.on).toBe('function');
    expect(typeof s.emit).toBe('function');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              LOAD / SAVE
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - load/save', () => {
  test('loads from empty state', async () => {
    const s = createSentinel();
    await s.load();
    expect(s._loaded).toBe(true);
    expect(s.alerts).toEqual([]);
  });

  test('save creates directory and file', async () => {
    const s = createSentinel();
    await s.load();
    s.alerts.push({ id: 'test', timestamp: new Date().toISOString() });
    await s.save();

    const filePath = path.join(TEST_DIR, '.aiox/sentinel-alerts.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('round-trip: save then load', async () => {
    const s1 = createSentinel();
    await s1.load();
    s1.alerts.push({
      id: 'a1',
      watchpointId: 'test',
      severity: AlertSeverity.WARNING,
      timestamp: new Date().toISOString(),
    });
    await s1.save();

    const s2 = createSentinel();
    await s2.load();
    expect(s2.alerts).toHaveLength(1);
    expect(s2.alerts[0].id).toBe('a1');
  });

  test('handles corrupted file', async () => {
    const dir = path.join(TEST_DIR, '.aiox');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'sentinel-alerts.json'), 'BROKEN');

    const s = createSentinel();
    await s.load();
    expect(s._loaded).toBe(true);
    expect(s.alerts).toEqual([]);
  });

  test('resets on schema mismatch', async () => {
    const dir = path.join(TEST_DIR, '.aiox');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'sentinel-alerts.json'),
      JSON.stringify({ schemaVersion: 'old-v0', alerts: [{ id: 'old' }] }),
    );

    const s = createSentinel();
    await s.load();
    expect(s.alerts).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              REGISTER WATCHPOINT
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - registerWatchpoint', () => {
  test('registers a watchpoint', () => {
    const s = createSentinel();
    const wp = s.registerWatchpoint({
      id: 'test-wp',
      name: 'Test Watchpoint',
      description: 'Monitors something',
      check: healthyCheck(),
    });

    expect(wp.id).toBe('test-wp');
    expect(s.watchpoints.size).toBe(1);
    expect(s.watchpoints.get('test-wp').lastStatus).toBe(WatchpointStatus.UNKNOWN);
  });

  test('throws on missing required fields', () => {
    const s = createSentinel();
    expect(() => s.registerWatchpoint({ id: 'x' })).toThrow('Required fields');
    expect(() => s.registerWatchpoint({})).toThrow('Required fields');
  });

  test('throws when check is not a function', () => {
    const s = createSentinel();
    expect(() =>
      s.registerWatchpoint({ id: 'x', name: 'X', check: 'not-a-function' }),
    ).toThrow('check must be a function');
  });

  test('emits WATCHPOINT_REGISTERED event', () => {
    const s = createSentinel();
    const handler = jest.fn();
    s.on(Events.WATCHPOINT_REGISTERED, handler);

    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: healthyCheck() });
    expect(handler).toHaveBeenCalledWith({ id: 'wp1', name: 'WP1' });
  });

  test('uses default values for optional fields', () => {
    const s = createSentinel();
    const wp = s.registerWatchpoint({ id: 'wp2', name: 'WP2', check: healthyCheck() });

    expect(wp.severity).toBe(AlertSeverity.WARNING);
    expect(wp.autoHeal).toBe(false);
    expect(wp.healerId).toBeNull();
    expect(wp.intervalMs).toBe(CONFIG.defaultIntervalMs);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              UNREGISTER WATCHPOINT
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - unregisterWatchpoint', () => {
  test('removes a watchpoint', () => {
    const s = createSentinel();
    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: healthyCheck() });
    expect(s.unregisterWatchpoint('wp1')).toBe(true);
    expect(s.watchpoints.size).toBe(0);
  });

  test('returns false for unknown watchpoint', () => {
    const s = createSentinel();
    expect(s.unregisterWatchpoint('nonexistent')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EVALUATE WATCHPOINT
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - evaluateWatchpoint', () => {
  test('evaluates a healthy watchpoint', async () => {
    const s = createSentinel();
    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: healthyCheck() });

    const result = await s.evaluateWatchpoint('wp1');
    expect(result.status).toBe(WatchpointStatus.HEALTHY);
    expect(result.watchpointId).toBe('wp1');
    expect(result.consecutiveFailures).toBe(0);
  });

  test('evaluates a failing watchpoint', async () => {
    const s = createSentinel();
    s.registerWatchpoint({
      id: 'wp1',
      name: 'WP1',
      check: failingCheck('DB down'),
      severity: AlertSeverity.CRITICAL,
    });

    const result = await s.evaluateWatchpoint('wp1');
    expect(result.status).toBe(WatchpointStatus.FAILING);
    expect(result.message).toBe('DB down');
    expect(result.consecutiveFailures).toBe(1);
  });

  test('tracks consecutive failures', async () => {
    const s = createSentinel();
    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: failingCheck() });

    await s.evaluateWatchpoint('wp1');
    await s.evaluateWatchpoint('wp1');
    const r = await s.evaluateWatchpoint('wp1');
    expect(r.consecutiveFailures).toBe(3);
  });

  test('resets consecutive failures on healthy', async () => {
    let shouldFail = true;
    const s = createSentinel();
    s.registerWatchpoint({
      id: 'wp1',
      name: 'WP1',
      check: async () => ({
        status: shouldFail ? WatchpointStatus.FAILING : WatchpointStatus.HEALTHY,
        message: shouldFail ? 'fail' : 'ok',
      }),
    });

    await s.evaluateWatchpoint('wp1');
    await s.evaluateWatchpoint('wp1');
    shouldFail = false;
    const r = await s.evaluateWatchpoint('wp1');
    expect(r.consecutiveFailures).toBe(0);
  });

  test('throws for unknown watchpoint', async () => {
    const s = createSentinel();
    await expect(s.evaluateWatchpoint('missing')).rejects.toThrow('Unknown watchpoint');
  });

  test('handles check function that throws', async () => {
    const s = createSentinel();
    s.registerWatchpoint({
      id: 'wp1',
      name: 'WP1',
      check: async () => {
        throw new Error('Boom');
      },
    });

    const result = await s.evaluateWatchpoint('wp1');
    expect(result.status).toBe(WatchpointStatus.FAILING);
    expect(result.message).toContain('Boom');
  });

  test('emits WATCHPOINT_EVALUATED event', async () => {
    const s = createSentinel();
    const handler = jest.fn();
    s.on(Events.WATCHPOINT_EVALUATED, handler);

    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: healthyCheck() });
    await s.evaluateWatchpoint('wp1');

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ watchpointId: 'wp1', status: WatchpointStatus.HEALTHY }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EVALUATE ALL
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - evaluateAll', () => {
  test('evaluates all watchpoints', async () => {
    const s = createSentinel();
    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: healthyCheck() });
    s.registerWatchpoint({ id: 'wp2', name: 'WP2', check: failingCheck() });

    const results = await s.evaluateAll();
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe(WatchpointStatus.HEALTHY);
    expect(results[1].status).toBe(WatchpointStatus.FAILING);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ALERTS
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - alerts', () => {
  test('fires alert on failing watchpoint', async () => {
    const s = createSentinel();
    const handler = jest.fn();
    s.on(Events.ALERT_FIRED, handler);

    s.registerWatchpoint({
      id: 'wp1',
      name: 'WP1',
      check: failingCheck(),
      severity: AlertSeverity.CRITICAL,
    });

    await s.evaluateWatchpoint('wp1');

    expect(handler).toHaveBeenCalledTimes(1);
    const alert = handler.mock.calls[0][0];
    expect(alert.severity).toBe(AlertSeverity.CRITICAL);
    expect(alert.watchpointId).toBe('wp1');
  });

  test('does not fire alert for healthy watchpoint', async () => {
    const s = createSentinel();
    const handler = jest.fn();
    s.on(Events.ALERT_FIRED, handler);

    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: healthyCheck() });
    await s.evaluateWatchpoint('wp1');

    expect(handler).not.toHaveBeenCalled();
  });

  test('records alert in history', async () => {
    const s = createSentinel();
    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: failingCheck() });

    await s.evaluateWatchpoint('wp1');
    expect(s.alerts).toHaveLength(1);
    expect(s.alerts[0].watchpointId).toBe('wp1');
  });

  test('enforces maxAlerts limit', async () => {
    const s = createSentinel({ maxAlerts: 2 });
    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: failingCheck() });

    await s.evaluateWatchpoint('wp1');
    await s.evaluateWatchpoint('wp1');
    await s.evaluateWatchpoint('wp1');

    expect(s.alerts.length).toBeLessThanOrEqual(2);
  });

  test('getAlerts filters by severity', async () => {
    const s = createSentinel();
    s.registerWatchpoint({
      id: 'wp1',
      name: 'WP1',
      check: failingCheck(),
      severity: AlertSeverity.CRITICAL,
    });
    s.registerWatchpoint({
      id: 'wp2',
      name: 'WP2',
      check: failingCheck(),
      severity: AlertSeverity.WARNING,
    });

    await s.evaluateWatchpoint('wp1');
    await s.evaluateWatchpoint('wp2');

    const criticals = s.getAlerts({ severity: AlertSeverity.CRITICAL });
    expect(criticals).toHaveLength(1);
    expect(criticals[0].watchpointId).toBe('wp1');
  });

  test('getAlerts filters by watchpointId', async () => {
    const s = createSentinel();
    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: failingCheck() });
    s.registerWatchpoint({ id: 'wp2', name: 'WP2', check: failingCheck() });

    await s.evaluateWatchpoint('wp1');
    await s.evaluateWatchpoint('wp2');

    expect(s.getAlerts({ watchpointId: 'wp2' })).toHaveLength(1);
  });

  test('getAlerts applies limit', async () => {
    const s = createSentinel();
    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: failingCheck() });

    for (let i = 0; i < 5; i++) {
      await s.evaluateWatchpoint('wp1');
    }

    expect(s.getAlerts({ limit: 2 })).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HEALTH SCORE
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - health score', () => {
  test('starts at 100', () => {
    const s = createSentinel();
    expect(s.getHealthScore()).toBe(100);
  });

  test('decreases on failing watchpoint', async () => {
    const s = createSentinel();
    s.registerWatchpoint({
      id: 'wp1',
      name: 'WP1',
      check: failingCheck(),
      severity: AlertSeverity.CRITICAL,
    });

    await s.evaluateWatchpoint('wp1');
    expect(s.getHealthScore()).toBeLessThan(100);
  });

  test('partially decreases on degraded watchpoint', async () => {
    const s = createSentinel();
    s.registerWatchpoint({
      id: 'wp1',
      name: 'WP1',
      check: degradedCheck(),
      severity: AlertSeverity.WARNING,
    });

    await s.evaluateWatchpoint('wp1');
    const score = s.getHealthScore();
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(85); // Should only be a minor deduction
  });

  test('emits HEALTH_SCORE_CHANGED event', async () => {
    const s = createSentinel();
    const handler = jest.fn();
    s.on(Events.HEALTH_SCORE_CHANGED, handler);

    s.registerWatchpoint({
      id: 'wp1',
      name: 'WP1',
      check: failingCheck(),
      severity: AlertSeverity.CRITICAL,
    });

    await s.evaluateWatchpoint('wp1');
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ previous: 100 }),
    );
  });

  test('recovers when watchpoint becomes healthy', async () => {
    let healthy = false;
    const s = createSentinel();
    s.registerWatchpoint({
      id: 'wp1',
      name: 'WP1',
      check: async () => ({
        status: healthy ? WatchpointStatus.HEALTHY : WatchpointStatus.FAILING,
        message: healthy ? 'ok' : 'fail',
      }),
      severity: AlertSeverity.CRITICAL,
    });

    await s.evaluateWatchpoint('wp1');
    const lowScore = s.getHealthScore();

    healthy = true;
    await s.evaluateWatchpoint('wp1');
    expect(s.getHealthScore()).toBeGreaterThan(lowScore);
  });

  test('never goes below 0', async () => {
    const s = createSentinel();
    // Register many failing critical watchpoints
    for (let i = 0; i < 10; i++) {
      s.registerWatchpoint({
        id: `wp-${i}`,
        name: `WP ${i}`,
        check: failingCheck(),
        severity: AlertSeverity.CRITICAL,
      });
    }

    await s.evaluateAll();
    expect(s.getHealthScore()).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              START / STOP
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - start/stop', () => {
  test('emits SENTINEL_STARTED on start', () => {
    const s = createSentinel();
    const handler = jest.fn();
    s.on(Events.SENTINEL_STARTED, handler);

    s.start();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(s.running).toBe(true);
    s.stop();
  });

  test('emits SENTINEL_STOPPED on stop', () => {
    const s = createSentinel();
    const handler = jest.fn();
    s.on(Events.SENTINEL_STOPPED, handler);

    s.start();
    s.stop();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(s.running).toBe(false);
  });

  test('does not double-start', () => {
    const s = createSentinel();
    const handler = jest.fn();
    s.on(Events.SENTINEL_STARTED, handler);

    s.start();
    s.start();
    expect(handler).toHaveBeenCalledTimes(1);
    s.stop();
  });

  test('does not double-stop', () => {
    const s = createSentinel();
    const handler = jest.fn();
    s.on(Events.SENTINEL_STOPPED, handler);

    s.stop(); // not running
    expect(handler).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              STATUS & STATS
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - getStatus', () => {
  test('returns status of all watchpoints', async () => {
    const s = createSentinel();
    s.registerWatchpoint({ id: 'wp1', name: 'WP1', check: healthyCheck() });
    s.registerWatchpoint({ id: 'wp2', name: 'WP2', check: failingCheck() });

    await s.evaluateAll();
    const status = s.getStatus();

    expect(status).toHaveLength(2);
    expect(status[0].status).toBe(WatchpointStatus.HEALTHY);
    expect(status[1].status).toBe(WatchpointStatus.FAILING);
  });
});

describe('ProactiveSentinel - getStats', () => {
  test('returns complete statistics', async () => {
    const s = createSentinel();
    s.registerWatchpoint({
      id: 'wp1',
      name: 'WP1',
      check: failingCheck(),
      severity: AlertSeverity.CRITICAL,
    });

    await s.evaluateWatchpoint('wp1');

    const stats = s.getStats();
    expect(stats.totalAlerts).toBe(1);
    expect(stats.totalWatchpoints).toBe(1);
    expect(stats.running).toBe(false);
    expect(stats.bySeverity[AlertSeverity.CRITICAL]).toBe(1);
    expect(stats.byWatchpoint['wp1']).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              PRUNE
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - prune', () => {
  test('removes old alerts', () => {
    const s = createSentinel({ retentionDays: 7 });
    s.alerts.push({
      id: 'old',
      watchpointId: 'wp1',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    });
    s.alerts.push({
      id: 'recent',
      watchpointId: 'wp1',
      timestamp: new Date().toISOString(),
    });

    const pruned = s.prune();
    expect(pruned).toBe(1);
    expect(s.alerts).toHaveLength(1);
    expect(s.alerts[0].id).toBe('recent');
  });

  test('emits ALERTS_PRUNED event', () => {
    const s = createSentinel({ retentionDays: 1 });
    const handler = jest.fn();
    s.on(Events.ALERTS_PRUNED, handler);

    s.alerts.push({
      id: 'old',
      watchpointId: 'wp1',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    });

    s.prune();
    expect(handler).toHaveBeenCalledWith({ count: 1 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              BUILT-IN WATCHPOINTS
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ProactiveSentinel - registerBuiltInWatchpoints', () => {
  test('registers all built-in watchpoints', () => {
    const s = createSentinel();
    s.registerBuiltInWatchpoints();

    expect(s.watchpoints.size).toBe(5);
    expect(s.watchpoints.has('config-integrity')).toBe(true);
    expect(s.watchpoints.has('memory-integrity')).toBe(true);
    expect(s.watchpoints.has('stale-locks')).toBe(true);
    expect(s.watchpoints.has('disk-space')).toBe(true);
    expect(s.watchpoints.has('workspace-structure')).toBe(true);
  });

  test('config-integrity passes with valid package.json', async () => {
    fs.writeFileSync(path.join(TEST_DIR, 'package.json'), JSON.stringify({ name: 'test' }));
    fs.writeFileSync(path.join(TEST_DIR, 'core-config.yaml'), 'key: value');

    const s = createSentinel();
    s.registerBuiltInWatchpoints();

    const result = await s.evaluateWatchpoint('config-integrity');
    expect(result.status).toBe(WatchpointStatus.HEALTHY);
  });

  test('config-integrity fails with corrupted package.json', async () => {
    fs.writeFileSync(path.join(TEST_DIR, 'package.json'), 'NOT JSON!!!');

    const s = createSentinel();
    s.registerBuiltInWatchpoints();

    const result = await s.evaluateWatchpoint('config-integrity');
    expect(result.status).toBe(WatchpointStatus.FAILING);
  });

  test('memory-integrity detects corrupted JSON files', async () => {
    const memDir = path.join(TEST_DIR, '.aiox');
    fs.mkdirSync(memDir, { recursive: true });
    fs.writeFileSync(path.join(memDir, 'gotchas.json'), 'BROKEN');

    const s = createSentinel();
    s.registerBuiltInWatchpoints();

    const result = await s.evaluateWatchpoint('memory-integrity');
    expect(result.status).toBe(WatchpointStatus.FAILING);
    expect(result.message).toContain('gotchas.json');
  });

  test('stale-locks detects old lock files', async () => {
    const memDir = path.join(TEST_DIR, '.aiox');
    fs.mkdirSync(memDir, { recursive: true });
    const lockFile = path.join(memDir, 'test.lock');
    fs.writeFileSync(lockFile, 'locked');

    // Set mtime to 31 minutes ago
    const oldTime = new Date(Date.now() - 31 * 60 * 1000);
    fs.utimesSync(lockFile, oldTime, oldTime);

    const s = createSentinel();
    s.registerBuiltInWatchpoints();

    const result = await s.evaluateWatchpoint('stale-locks');
    expect(result.status).toBe(WatchpointStatus.DEGRADED);
  });

  test('workspace-structure passes with correct dirs', async () => {
    // Create required dirs (use .aios-core for backward compat check)
    fs.mkdirSync(path.join(TEST_DIR, '.aios-core'), { recursive: true });
    fs.mkdirSync(path.join(TEST_DIR, 'tests'), { recursive: true });
    fs.mkdirSync(path.join(TEST_DIR, 'bin'), { recursive: true });

    const s = createSentinel();
    s.registerBuiltInWatchpoints();

    const result = await s.evaluateWatchpoint('workspace-structure');
    expect(result.status).toBe(WatchpointStatus.HEALTHY);
  });
});
