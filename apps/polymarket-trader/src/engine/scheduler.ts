/**
 * Trading Scheduler: interval-based recurring task runner.
 * Zero external dependencies — uses native setInterval.
 */

import { eventBus } from './event-bus.js';

export interface ScheduledTask {
  id: string;
  name: string;
  intervalMs: number;
  handler: () => Promise<void>;
  enabled: boolean;
  lastRun?: Date;
  lastError?: string;
  runCount: number;
}

export interface SchedulerStatus {
  running: boolean;
  tasks: Array<{
    id: string;
    name: string;
    enabled: boolean;
    lastRun: Date | null;
    nextRun: Date | null;
    runCount: number;
    lastError: string | null;
  }>;
}

/** Default task definitions (handlers injected externally). */
export const DEFAULT_TASK_DEFS = {
  MARKET_SCAN:    { id: 'market-scan',    name: 'Market Scanner',       intervalMs: 60_000 },
  EDGE_SCAN:      { id: 'edge-scan',      name: 'Edge Scanner',         intervalMs: 120_000 },
  POSITION_CHECK: { id: 'position-check', name: 'Position Checker',     intervalMs: 300_000 },
  DAILY_RESET:    { id: 'daily-reset',    name: 'Daily P&L Reset',      intervalMs: 86_400_000 },
  DRIFT_CHECK:    { id: 'drift-check',    name: 'Drift Monitor Check',  intervalMs: 3_600_000 },
} as const;

export class TradingScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private running = false;

  constructor(_config: { pollIntervalMs: number }) {
    // pollIntervalMs reserved for future use (dynamic interval adjustment)
  }

  /** Register a recurring task. */
  register(task: ScheduledTask): void {
    this.tasks.set(task.id, { ...task });

    // If scheduler is already running and the task is enabled, start its interval
    if (this.running && task.enabled) {
      this.startTask(task.id);
    }
  }

  /** Start the scheduler — begins all enabled task intervals. */
  start(): void {
    if (this.running) return;
    this.running = true;

    for (const [id, task] of this.tasks) {
      if (task.enabled) {
        this.startTask(id);
      }
    }

    eventBus.emit('system:started', { component: 'scheduler', taskCount: this.tasks.size });
  }

  /** Stop the scheduler — clears all intervals. */
  stop(): void {
    if (!this.running) return;

    for (const [id, handle] of this.intervals) {
      clearInterval(handle);
      this.intervals.delete(id);
    }

    this.running = false;
    eventBus.emit('system:stopped', { component: 'scheduler' });
  }

  /** Get current status of all tasks. */
  getStatus(): SchedulerStatus {
    const tasks = Array.from(this.tasks.values()).map((t) => ({
      id: t.id,
      name: t.name,
      enabled: t.enabled,
      lastRun: t.lastRun ?? null,
      nextRun: this.computeNextRun(t),
      runCount: t.runCount,
      lastError: t.lastError ?? null,
    }));

    return { running: this.running, tasks };
  }

  /** Manually trigger a specific task immediately. */
  async runNow(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    await this.executeTask(task);
  }

  // -- Private helpers --

  private startTask(id: string): void {
    const task = this.tasks.get(id);
    if (!task) return;

    // Avoid duplicate intervals
    if (this.intervals.has(id)) {
      clearInterval(this.intervals.get(id)!);
    }

    const handle = setInterval(() => {
      void this.executeTask(task);
    }, task.intervalMs);

    this.intervals.set(id, handle);
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    const start = Date.now();
    try {
      await task.handler();
      task.lastRun = new Date();
      task.runCount++;
      task.lastError = undefined;

      eventBus.emit('system:health-check', {
        task: task.id,
        status: 'ok',
        durationMs: Date.now() - start,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      task.lastError = message;
      task.lastRun = new Date();
      task.runCount++;

      eventBus.emit('system:health-check', {
        task: task.id,
        status: 'error',
        error: message,
        durationMs: Date.now() - start,
      });

      eventBus.emit('system:error', {
        component: 'scheduler',
        task: task.id,
        error: message,
      });
    }
  }

  private computeNextRun(task: ScheduledTask): Date | null {
    if (!this.running || !task.enabled) return null;
    if (!task.lastRun) {
      // Hasn't run yet — next run is now + interval
      return new Date(Date.now() + task.intervalMs);
    }
    return new Date(task.lastRun.getTime() + task.intervalMs);
  }
}
