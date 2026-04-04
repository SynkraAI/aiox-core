import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TradingScheduler, DEFAULT_TASK_DEFS } from '../src/engine/scheduler.js';
import { HealthMonitor } from '../src/engine/health-monitor.js';
import { eventBus } from '../src/engine/event-bus.js';

// ---------------------------------------------------------------------------
// TradingScheduler
// ---------------------------------------------------------------------------

describe('TradingScheduler', () => {
  let scheduler: TradingScheduler;

  beforeEach(() => {
    vi.useFakeTimers();
    scheduler = new TradingScheduler({ pollIntervalMs: 60_000 });
  });

  afterEach(() => {
    scheduler.stop();
    vi.useRealTimers();
    eventBus.removeAllListeners();
  });

  // -- Registration ---------------------------------------------------------

  it('should register tasks correctly', () => {
    scheduler.register({
      id: 'test-task',
      name: 'Test Task',
      intervalMs: 1000,
      handler: async () => {},
      enabled: true,
      runCount: 0,
    });

    const status = scheduler.getStatus();
    expect(status.tasks).toHaveLength(1);
    expect(status.tasks[0].id).toBe('test-task');
    expect(status.tasks[0].name).toBe('Test Task');
  });

  it('should register multiple tasks', () => {
    scheduler.register({ id: 'a', name: 'A', intervalMs: 1000, handler: async () => {}, enabled: true, runCount: 0 });
    scheduler.register({ id: 'b', name: 'B', intervalMs: 2000, handler: async () => {}, enabled: false, runCount: 0 });

    const status = scheduler.getStatus();
    expect(status.tasks).toHaveLength(2);
  });

  // -- Start / Stop lifecycle -----------------------------------------------

  it('should start and stop correctly', () => {
    expect(scheduler.getStatus().running).toBe(false);

    scheduler.start();
    expect(scheduler.getStatus().running).toBe(true);

    scheduler.stop();
    expect(scheduler.getStatus().running).toBe(false);
  });

  it('should not double-start', () => {
    const emitSpy = vi.spyOn(eventBus, 'emit');
    scheduler.start();
    scheduler.start(); // second call should be no-op
    const startEvents = emitSpy.mock.calls.filter(([ev]) => ev === 'system:started');
    expect(startEvents).toHaveLength(1);
  });

  it('should emit system:started on start', () => {
    const emitSpy = vi.spyOn(eventBus, 'emit');
    scheduler.start();
    expect(emitSpy).toHaveBeenCalledWith('system:started', expect.objectContaining({ component: 'scheduler' }));
  });

  it('should emit system:stopped on stop', () => {
    scheduler.start();
    const emitSpy = vi.spyOn(eventBus, 'emit');
    scheduler.stop();
    expect(emitSpy).toHaveBeenCalledWith('system:stopped', expect.objectContaining({ component: 'scheduler' }));
  });

  // -- Task execution -------------------------------------------------------

  it('should run tasks at their intervals', async () => {
    const handler = vi.fn(async () => {});

    scheduler.register({
      id: 'tick',
      name: 'Ticker',
      intervalMs: 5000,
      handler,
      enabled: true,
      runCount: 0,
    });

    scheduler.start();

    // Advance 5 seconds — should trigger once
    await vi.advanceTimersByTimeAsync(5000);
    expect(handler).toHaveBeenCalledTimes(1);

    // Advance another 5 seconds
    await vi.advanceTimersByTimeAsync(5000);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('should not run disabled tasks', async () => {
    const handler = vi.fn(async () => {});

    scheduler.register({
      id: 'disabled',
      name: 'Disabled Task',
      intervalMs: 1000,
      handler,
      enabled: false,
      runCount: 0,
    });

    scheduler.start();
    await vi.advanceTimersByTimeAsync(5000);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should continue running other tasks when one errors', async () => {
    const goodHandler = vi.fn(async () => {});
    const badHandler = vi.fn(async () => { throw new Error('boom'); });

    scheduler.register({ id: 'good', name: 'Good', intervalMs: 1000, handler: goodHandler, enabled: true, runCount: 0 });
    scheduler.register({ id: 'bad', name: 'Bad', intervalMs: 1000, handler: badHandler, enabled: true, runCount: 0 });

    scheduler.start();
    await vi.advanceTimersByTimeAsync(1000);

    expect(goodHandler).toHaveBeenCalledTimes(1);
    expect(badHandler).toHaveBeenCalledTimes(1);

    // Both should still fire on next tick
    await vi.advanceTimersByTimeAsync(1000);
    expect(goodHandler).toHaveBeenCalledTimes(2);
    expect(badHandler).toHaveBeenCalledTimes(2);
  });

  it('should capture lastError on task failure', async () => {
    scheduler.register({
      id: 'failing',
      name: 'Failing',
      intervalMs: 1000,
      handler: async () => { throw new Error('oops'); },
      enabled: true,
      runCount: 0,
    });

    scheduler.start();
    await vi.advanceTimersByTimeAsync(1000);

    const status = scheduler.getStatus();
    const task = status.tasks.find((t) => t.id === 'failing');
    expect(task?.lastError).toBe('oops');
  });

  // -- Manual runNow --------------------------------------------------------

  it('should execute a task immediately with runNow', async () => {
    const handler = vi.fn(async () => {});

    scheduler.register({
      id: 'manual',
      name: 'Manual',
      intervalMs: 999_999,
      handler,
      enabled: true,
      runCount: 0,
    });

    await scheduler.runNow('manual');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should throw on runNow for unknown task', async () => {
    await expect(scheduler.runNow('nope')).rejects.toThrow('Task not found: nope');
  });

  // -- Status reporting -----------------------------------------------------

  it('should report correct status after runs', async () => {
    scheduler.register({
      id: 'counter',
      name: 'Counter',
      intervalMs: 1000,
      handler: async () => {},
      enabled: true,
      runCount: 0,
    });

    scheduler.start();
    await vi.advanceTimersByTimeAsync(3000);

    const task = scheduler.getStatus().tasks.find((t) => t.id === 'counter');
    expect(task?.runCount).toBe(3);
    expect(task?.lastRun).toBeTruthy();
    expect(task?.lastError).toBeNull();
  });

  it('should emit system:health-check events per task run', async () => {
    const emitSpy = vi.spyOn(eventBus, 'emit');

    scheduler.register({
      id: 'health',
      name: 'Health Emitter',
      intervalMs: 1000,
      handler: async () => {},
      enabled: true,
      runCount: 0,
    });

    scheduler.start();
    await vi.advanceTimersByTimeAsync(1000);

    const healthEvents = emitSpy.mock.calls.filter(([ev]) => ev === 'system:health-check');
    expect(healthEvents.length).toBeGreaterThanOrEqual(1);
    expect(healthEvents[0][1]).toEqual(expect.objectContaining({ task: 'health', status: 'ok' }));
  });

  // -- Default task definitions ---------------------------------------------

  it('should have correct default task intervals', () => {
    expect(DEFAULT_TASK_DEFS.MARKET_SCAN.intervalMs).toBe(60_000);
    expect(DEFAULT_TASK_DEFS.EDGE_SCAN.intervalMs).toBe(120_000);
    expect(DEFAULT_TASK_DEFS.POSITION_CHECK.intervalMs).toBe(300_000);
    expect(DEFAULT_TASK_DEFS.DAILY_RESET.intervalMs).toBe(86_400_000);
    expect(DEFAULT_TASK_DEFS.DRIFT_CHECK.intervalMs).toBe(3_600_000);
  });
});

// ---------------------------------------------------------------------------
// HealthMonitor
// ---------------------------------------------------------------------------

describe('HealthMonitor', () => {
  afterEach(() => {
    eventBus.removeAllListeners();
    vi.restoreAllMocks();
  });

  it('should return a health report with all checks', async () => {
    // Mock fetch to simulate API being reachable
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));

    const monitor = new HealthMonitor({ telegramEnabled: false });
    const report = await monitor.checkAll();

    expect(report.timestamp).toBeInstanceOf(Date);
    expect(['healthy', 'degraded', 'critical']).toContain(report.overall);
    expect(report.checks.length).toBe(6);

    const names = report.checks.map((c) => c.name);
    expect(names).toContain('api-connectivity');
    expect(names).toContain('position-exposure');
    expect(names).toContain('circuit-breaker');
    expect(names).toContain('drift-status');
    expect(names).toContain('order-queue');
    expect(names).toContain('disk-space');
  });

  it('should report healthy when all checks pass', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));

    const monitor = new HealthMonitor({ telegramEnabled: false });
    const report = await monitor.checkAll();

    expect(report.overall).toBe('healthy');
    expect(report.checks.every((c) => c.status === 'ok')).toBe(true);
  });

  it('should report degraded when API returns non-200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const monitor = new HealthMonitor({ telegramEnabled: false });
    const report = await monitor.checkAll();

    expect(report.overall).toBe('degraded');
    const apiCheck = report.checks.find((c) => c.name === 'api-connectivity');
    expect(apiCheck?.status).toBe('warn');
  });

  it('should report critical when API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const monitor = new HealthMonitor({ telegramEnabled: false });
    const report = await monitor.checkAll();

    expect(report.overall).toBe('critical');
    const apiCheck = report.checks.find((c) => c.name === 'api-connectivity');
    expect(apiCheck?.status).toBe('fail');
    expect(apiCheck?.message).toContain('ECONNREFUSED');
  });

  // -- Auto-alerts ----------------------------------------------------------

  it('should wire auto-alerts to event bus', async () => {
    const monitor = new HealthMonitor({ telegramEnabled: false });
    const alertSpy = vi.spyOn(monitor, 'alert').mockResolvedValue(undefined);
    monitor.wireAutoAlerts();

    eventBus.emit('risk:circuit-breaker', { reason: 'daily loss' });

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('Circuit breaker tripped'),
      'critical',
    );
  });

  it('should alert on drift detected', async () => {
    const monitor = new HealthMonitor({ telegramEnabled: false });
    const alertSpy = vi.spyOn(monitor, 'alert').mockResolvedValue(undefined);
    monitor.wireAutoAlerts();

    eventBus.emit('learning:drift-detected', { dimension: 'winRate' });

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('Drift detected'),
      'warning',
    );
  });

  it('should alert on order failure', async () => {
    const monitor = new HealthMonitor({ telegramEnabled: false });
    const alertSpy = vi.spyOn(monitor, 'alert').mockResolvedValue(undefined);
    monitor.wireAutoAlerts();

    eventBus.emit('order:failed', { marketId: 'mkt-123', error: 'insufficient funds' });

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('Order failed'),
      'warning',
    );
  });

  it('should alert on position closed with P&L', async () => {
    const monitor = new HealthMonitor({ telegramEnabled: false });
    const alertSpy = vi.spyOn(monitor, 'alert').mockResolvedValue(undefined);
    monitor.wireAutoAlerts();

    eventBus.emit('position:closed', { pnl: 15.5, marketId: 'mkt-456' });

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('+$15.50'),
      'info',
    );
  });

  // -- Alert formatting -----------------------------------------------------

  it('should format critical alerts with siren emoji', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const monitor = new HealthMonitor({ telegramEnabled: false });

    await monitor.alert('System down', 'critical');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[CRITICAL]'),
    );
  });

  it('should format warning alerts with warning emoji', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const monitor = new HealthMonitor({ telegramEnabled: false });

    await monitor.alert('High exposure', 'warning');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[WARNING]'),
    );
  });

  it('should format info alerts with info emoji', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const monitor = new HealthMonitor({ telegramEnabled: false });

    await monitor.alert('Trade closed', 'info');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
    );
  });

  // -- Telegram fallback ----------------------------------------------------

  it('should fallback to console when Telegram not configured', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const monitor = new HealthMonitor({ telegramEnabled: false });

    await monitor.alert('test message', 'info');

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should detect circuit-breaker events in health check', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));

    // Emit a circuit breaker event so health check picks it up
    eventBus.emit('risk:circuit-breaker', { reason: 'test' });

    const monitor = new HealthMonitor({ telegramEnabled: false });
    const report = await monitor.checkAll();

    const cbCheck = report.checks.find((c) => c.name === 'circuit-breaker');
    expect(cbCheck?.status).toBe('fail');
    expect(report.overall).toBe('critical');
  });
});
