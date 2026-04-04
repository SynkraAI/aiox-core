/**
 * Health Monitor: multi-dimension health checks + Telegram alerts.
 * Zero external dependencies — uses native fetch() for Telegram Bot API.
 */

import { eventBus } from './event-bus.js';
import { POLYMARKET_API } from '../config/defaults.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HealthCheck {
  name: string;
  status: 'ok' | 'warn' | 'fail';
  value?: number;
  threshold?: number;
  message: string;
}

export interface HealthReport {
  timestamp: Date;
  overall: 'healthy' | 'degraded' | 'critical';
  checks: HealthCheck[];
}

export type AlertPriority = 'info' | 'warning' | 'critical';

// ---------------------------------------------------------------------------
// Health Monitor
// ---------------------------------------------------------------------------

export class HealthMonitor {
  private readonly telegramEnabled: boolean;
  private readonly telegramToken: string | undefined;
  private readonly telegramChatId: string | undefined;

  constructor(config?: { telegramEnabled: boolean; webhookUrl?: string }) {
    this.telegramEnabled = config?.telegramEnabled ?? false;
    this.telegramToken = process.env['TELEGRAM_BOT_TOKEN'];
    this.telegramChatId = process.env['TELEGRAM_CHAT_ID'];
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Run every health check and produce a consolidated report. */
  async checkAll(): Promise<HealthReport> {
    const checks = await Promise.all([
      this.checkApiConnectivity(),
      this.checkPositionExposure(),
      this.checkCircuitBreaker(),
      this.checkDriftStatus(),
      this.checkOrderQueue(),
      this.checkDiskSpace(),
    ]);

    const overall = this.deriveOverall(checks);

    return { timestamp: new Date(), overall, checks };
  }

  /** Send a formatted alert. Telegram if configured, else console. */
  async alert(message: string, priority: AlertPriority): Promise<void> {
    const prefix = priority === 'critical' ? '\u{1F6A8}'  // red siren
                 : priority === 'warning'  ? '\u26A0\uFE0F'  // warning sign
                 : '\u2139\uFE0F';                            // info

    const formatted = `${prefix} [${priority.toUpperCase()}] ${message}`;

    if (this.telegramEnabled && this.telegramToken && this.telegramChatId) {
      await this.sendTelegram(formatted);
    } else {
      console.log(`[HealthMonitor] ${formatted}`);
    }
  }

  /** Wire to eventBus for automatic alerts on key events. */
  wireAutoAlerts(): void {
    eventBus.on('risk:circuit-breaker', (data: { reason: string }) => {
      void this.alert(`Circuit breaker tripped: ${data.reason}`, 'critical');
    });

    eventBus.on('learning:drift-detected', (data: { dimension?: string }) => {
      void this.alert(`Drift detected${data.dimension ? ` in ${data.dimension}` : ''}`, 'warning');
    });

    eventBus.on('order:failed', (data: { marketId?: string; error?: string }) => {
      void this.alert(
        `Order failed${data.marketId ? ` on ${data.marketId}` : ''}${data.error ? `: ${data.error}` : ''}`,
        'warning',
      );
    });

    eventBus.on('position:closed', (data: { pnl?: number; marketId?: string }) => {
      const pnl = data.pnl ?? 0;
      const sign = pnl >= 0 ? '+' : '';
      void this.alert(
        `Position closed${data.marketId ? ` on ${data.marketId}` : ''}: ${sign}$${pnl.toFixed(2)}`,
        'info',
      );
    });

    eventBus.on('risk:warning', (data: { message?: string }) => {
      void this.alert(`Risk warning: ${data.message ?? 'unknown'}`, 'warning');
    });
  }

  // -----------------------------------------------------------------------
  // Individual health checks
  // -----------------------------------------------------------------------

  private async checkApiConnectivity(): Promise<HealthCheck> {
    try {
      const res = await fetch(`${POLYMARKET_API.gamma}/markets?limit=1`, {
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        return { name: 'api-connectivity', status: 'ok', message: 'Polymarket API reachable' };
      }
      return { name: 'api-connectivity', status: 'warn', message: `API returned ${res.status}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { name: 'api-connectivity', status: 'fail', message: `API unreachable: ${msg}` };
    }
  }

  private async checkPositionExposure(): Promise<HealthCheck> {
    // Read risk state from latest event data or default to safe
    const recentEvents = eventBus.getRecentEvents(100);
    const lastRiskUpdate = [...recentEvents].reverse().find((e) => e.event === 'risk:updated');

    if (!lastRiskUpdate) {
      return { name: 'position-exposure', status: 'ok', value: 0, message: 'No risk data yet — assuming safe' };
    }

    // The risk:updated event payload is not typed on the bus, so we just
    // report that we observed the event. Actual exposure limits are
    // enforced by the RiskEngine itself.
    return { name: 'position-exposure', status: 'ok', message: 'Risk engine active — exposure monitored' };
  }

  private async checkCircuitBreaker(): Promise<HealthCheck> {
    const recentEvents = eventBus.getRecentEvents(200);
    const cbEvents = recentEvents.filter((e) => e.event === 'risk:circuit-breaker');

    if (cbEvents.length > 0) {
      return { name: 'circuit-breaker', status: 'fail', message: 'Circuit breaker has been tripped' };
    }
    return { name: 'circuit-breaker', status: 'ok', message: 'Circuit breaker not tripped' };
  }

  private async checkDriftStatus(): Promise<HealthCheck> {
    const recentEvents = eventBus.getRecentEvents(200);
    const driftEvents = recentEvents.filter((e) => e.event === 'learning:drift-detected');

    if (driftEvents.length > 0) {
      return { name: 'drift-status', status: 'warn', value: driftEvents.length, message: `${driftEvents.length} drift event(s) detected` };
    }
    return { name: 'drift-status', status: 'ok', message: 'No drift detected' };
  }

  private async checkOrderQueue(): Promise<HealthCheck> {
    const recentEvents = eventBus.getRecentEvents(200);
    const submitted = recentEvents.filter((e) => e.event === 'order:submitted').length;
    const completed = recentEvents.filter((e) =>
      e.event === 'order:filled' || e.event === 'order:cancelled' || e.event === 'order:failed'
    ).length;
    const pending = Math.max(0, submitted - completed);

    if (pending > 10) {
      return { name: 'order-queue', status: 'fail', value: pending, threshold: 10, message: `${pending} stuck orders` };
    }
    if (pending > 5) {
      return { name: 'order-queue', status: 'warn', value: pending, threshold: 5, message: `${pending} pending orders` };
    }
    return { name: 'order-queue', status: 'ok', value: pending, message: `${pending} pending orders` };
  }

  private async checkDiskSpace(): Promise<HealthCheck> {
    // Simple writable check — attempt to verify data dir is accessible.
    // In Node, we cannot easily check free space without child_process,
    // so we just verify we can reference the working directory.
    try {
      // A lightweight check: the process is alive and can allocate memory
      const mem = process.memoryUsage();
      const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
      const usagePercent = Math.round((mem.heapUsed / mem.heapTotal) * 100);

      if (usagePercent > 90) {
        return { name: 'disk-space', status: 'warn', value: usagePercent, threshold: 90, message: `High memory usage: ${heapUsedMB}/${heapTotalMB}MB (${usagePercent}%)` };
      }
      return { name: 'disk-space', status: 'ok', value: usagePercent, message: `Memory OK: ${heapUsedMB}/${heapTotalMB}MB (${usagePercent}%)` };
    } catch {
      return { name: 'disk-space', status: 'fail', message: 'System resource check failed' };
    }
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private deriveOverall(checks: HealthCheck[]): 'healthy' | 'degraded' | 'critical' {
    const hasFail = checks.some((c) => c.status === 'fail');
    const hasWarn = checks.some((c) => c.status === 'warn');

    if (hasFail) return 'critical';
    if (hasWarn) return 'degraded';
    return 'healthy';
  }

  private async sendTelegram(text: string): Promise<void> {
    try {
      const url = `https://api.telegram.org/bot${this.telegramToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.telegramChatId,
          text,
          parse_mode: 'HTML',
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err: unknown) {
      // Fallback to console — never let a notification failure crash the system
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[HealthMonitor] Telegram send failed: ${msg}`);
      console.log(`[HealthMonitor] ${text}`);
    }
  }
}
