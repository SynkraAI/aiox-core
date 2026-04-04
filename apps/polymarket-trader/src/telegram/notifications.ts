/**
 * Proactive Notification Manager.
 * Listens to eventBus and sends auto-notifications to Telegram.
 * Handles quiet hours, rate limiting, and priority filtering.
 * Zero external dependencies.
 */

import { eventBus } from '../engine/event-bus.js';
import type { TradeSignal } from '../types/index.js';
import { formatTradeAlert, escapeMarkdownV2 } from './formatters.js';
import { tradeAlertKeyboard } from './keyboards.js';
import type { InlineKeyboardMarkup } from './keyboards.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationPriority = 'info' | 'normal' | 'warning' | 'critical' | 'scheduled';

export interface NotificationConfig {
  /** Quiet hours start (0-23). Default: 23. */
  quietHoursStart: number;
  /** Quiet hours end (0-23). Default: 7. */
  quietHoursEnd: number;
  /** Max messages per hour. Default: 30. */
  maxMessagesPerHour: number;
  /** Minimum priority to send during quiet hours. Default: 'critical'. */
  quietHoursMinPriority: NotificationPriority;
  /** Enable daily summary at 20:00. Default: true. */
  dailySummaryEnabled: boolean;
  /** Daily summary hour (0-23). Default: 20. */
  dailySummaryHour: number;
  /** Enable weekly summary on Sundays. Default: true. */
  weeklySummaryEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  quietHoursStart: 23,
  quietHoursEnd: 7,
  maxMessagesPerHour: 30,
  quietHoursMinPriority: 'critical',
  dailySummaryEnabled: true,
  dailySummaryHour: 20,
  weeklySummaryEnabled: true,
};

type SendFn = (text: string, keyboard?: InlineKeyboardMarkup) => Promise<void>;

// ---------------------------------------------------------------------------
// Priority ordering
// ---------------------------------------------------------------------------

const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  info: 0,
  normal: 1,
  warning: 2,
  critical: 3,
  scheduled: 1,
};

function priorityAtLeast(a: NotificationPriority, b: NotificationPriority): boolean {
  return PRIORITY_ORDER[a] >= PRIORITY_ORDER[b];
}

// ---------------------------------------------------------------------------
// NotificationManager
// ---------------------------------------------------------------------------

export class NotificationManager {
  private config: NotificationConfig;
  private sendFn: SendFn;
  private messageTimestamps: Date[] = [];
  private wired = false;
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;
  private lastDailySummary: string | null = null;
  private lastWeeklySummary: string | null = null;

  /** Exposed for testing: summary data callback. */
  private getSummaryData: (() => { dailyPnl: number; totalPnl: number; totalTrades: number; winRate: number; openPositions: number }) | null = null;

  constructor(sendFn: SendFn, config: Partial<NotificationConfig> = {}) {
    this.config = { ...DEFAULT_NOTIFICATION_CONFIG, ...config };
    this.sendFn = sendFn;
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Wire to eventBus for automatic notifications. */
  wire(summaryDataFn?: () => { dailyPnl: number; totalPnl: number; totalTrades: number; winRate: number; openPositions: number }): void {
    if (this.wired) return;
    this.wired = true;
    this.getSummaryData = summaryDataFn ?? null;

    eventBus.on('signal:detected', (signal: TradeSignal) => {
      const text = formatTradeAlert(signal);
      const keyboard = tradeAlertKeyboard(signal.marketId);
      void this.send(text, 'normal', keyboard);
    });

    eventBus.on('signal:approved', (signal: TradeSignal) => {
      void this.send(
        `\u2705 ${escapeMarkdownV2('Signal APPROVED:')} \`${signal.side}\` $${signal.suggestedSize.toFixed(2)} on \`${signal.marketId.slice(0, 16)}\``,
        'info',
      );
    });

    eventBus.on('order:filled', (data: { marketId?: string; side?: string; size?: number }) => {
      void this.send(
        `\u{1F4B0} ${escapeMarkdownV2('Order FILLED:')} \`${data.side ?? '?'}\` $${(data.size ?? 0).toFixed(2)} on \`${(data.marketId ?? '?').slice(0, 16)}\``,
        'info',
      );
    });

    eventBus.on('position:closed', (data: { marketId?: string; pnl?: number }) => {
      const pnl = data.pnl ?? 0;
      const icon = pnl >= 0 ? '\u{1F4C8}' : '\u{1F4C9}';
      void this.send(
        `${icon} ${escapeMarkdownV2('Position CLOSED:')} \`${(data.marketId ?? '?').slice(0, 16)}\` P&L: \`${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}\``,
        'normal',
      );
    });

    eventBus.on('risk:circuit-breaker', (data: { reason: string }) => {
      void this.send(
        `\u{1F6A8} *CIRCUIT BREAKER TRIPPED*\n\n${escapeMarkdownV2(data.reason)}`,
        'critical',
      );
    });

    eventBus.on('learning:drift-detected', (data: { dimension?: string }) => {
      void this.send(
        `\u26A0\uFE0F ${escapeMarkdownV2('Drift detected')}${data.dimension ? ` ${escapeMarkdownV2('in')} \`${data.dimension}\`` : ''}`,
        'warning',
      );
    });

    eventBus.on('learning:prompt-evolved', (data: { strategy?: string; fromVersion?: string; toVersion?: string }) => {
      void this.send(
        `\u{1F9EC} ${escapeMarkdownV2('ACE Evolution:')} \`${data.strategy}\` v${data.fromVersion} \\-\\> v${data.toVersion}`,
        'info',
      );
    });

    eventBus.on('whale:activity-detected', (data: { walletLabel?: string; marketId?: string; side?: string; size?: number }) => {
      void this.send(
        `\u{1F40B} ${escapeMarkdownV2('Whale:')} \`${data.walletLabel}\` ${data.side} $${(data.size ?? 0).toFixed(0)} on \`${(data.marketId ?? '?').slice(0, 16)}\``,
        'normal',
      );
    });

    // Scheduled summaries
    this.startScheduler();
  }

  /** Unwire all listeners and stop scheduler. */
  unwire(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    this.wired = false;
  }

  /** Send a notification, respecting quiet hours and rate limits. */
  async send(text: string, priority: NotificationPriority, keyboard?: InlineKeyboardMarkup): Promise<boolean> {
    // Rate limiting
    if (this.isRateLimited()) {
      if (!priorityAtLeast(priority, 'critical')) {
        return false;
      }
    }

    // Quiet hours
    if (this.isQuietHours()) {
      if (!priorityAtLeast(priority, this.config.quietHoursMinPriority)) {
        return false;
      }
    }

    // Record timestamp
    this.messageTimestamps.push(new Date());
    this.pruneTimestamps();

    try {
      await this.sendFn(text, keyboard);
      return true;
    } catch {
      return false;
    }
  }

  /** Check if currently in quiet hours. */
  isQuietHours(now?: Date): boolean {
    const d = now ?? new Date();
    const hour = d.getHours();
    const { quietHoursStart, quietHoursEnd } = this.config;

    if (quietHoursStart > quietHoursEnd) {
      // Wraps midnight: e.g., 23-07
      return hour >= quietHoursStart || hour < quietHoursEnd;
    }
    return hour >= quietHoursStart && hour < quietHoursEnd;
  }

  /** Check if rate limited (max messages per hour). */
  isRateLimited(): boolean {
    this.pruneTimestamps();
    return this.messageTimestamps.length >= this.config.maxMessagesPerHour;
  }

  /** Get current notification stats. */
  getStats(): { messagesLastHour: number; isQuietHours: boolean; isRateLimited: boolean } {
    this.pruneTimestamps();
    return {
      messagesLastHour: this.messageTimestamps.length,
      isQuietHours: this.isQuietHours(),
      isRateLimited: this.isRateLimited(),
    };
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private pruneTimestamps(): void {
    const oneHourAgo = Date.now() - 3600000;
    this.messageTimestamps = this.messageTimestamps.filter(t => t.getTime() > oneHourAgo);
  }

  private startScheduler(): void {
    // Check every minute for scheduled summaries
    this.schedulerInterval = setInterval(() => {
      void this.checkScheduledSummaries();
    }, 60_000);
  }

  private async checkScheduledSummaries(): Promise<void> {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Daily summary
    if (
      this.config.dailySummaryEnabled &&
      hour === this.config.dailySummaryHour &&
      minute < 2 && // within first 2 min of the hour
      this.lastDailySummary !== dateKey
    ) {
      this.lastDailySummary = dateKey;
      await this.sendDailySummary();
    }

    // Weekly summary (Sunday)
    const weekKey = `${dateKey}-weekly`;
    if (
      this.config.weeklySummaryEnabled &&
      now.getDay() === 0 &&
      hour === this.config.dailySummaryHour &&
      minute < 2 &&
      this.lastWeeklySummary !== weekKey
    ) {
      this.lastWeeklySummary = weekKey;
      await this.sendWeeklySummary();
    }
  }

  private async sendDailySummary(): Promise<void> {
    if (!this.getSummaryData) return;
    const data = this.getSummaryData();
    const icon = data.dailyPnl >= 0 ? '\u{1F4C8}' : '\u{1F4C9}';

    const text = [
      `\u{1F4CB} *DAILY SUMMARY*`,
      '',
      `${icon} ${escapeMarkdownV2('P&L Today:')} \`${data.dailyPnl >= 0 ? '+' : ''}$${data.dailyPnl.toFixed(2)}\``,
      `${escapeMarkdownV2('Total P&L:')} \`${data.totalPnl >= 0 ? '+' : ''}$${data.totalPnl.toFixed(2)}\``,
      `${escapeMarkdownV2('Trades:')} \`${data.totalTrades}\``,
      `${escapeMarkdownV2('Win Rate:')} \`${(data.winRate * 100).toFixed(1)}%\``,
      `${escapeMarkdownV2('Open Positions:')} \`${data.openPositions}\``,
    ].join('\n');

    await this.send(text, 'scheduled');
  }

  private async sendWeeklySummary(): Promise<void> {
    if (!this.getSummaryData) return;
    const data = this.getSummaryData();

    const text = [
      `\u{1F4CA} *WEEKLY REVIEW*`,
      '',
      `${escapeMarkdownV2('Total P&L:')} \`${data.totalPnl >= 0 ? '+' : ''}$${data.totalPnl.toFixed(2)}\``,
      `${escapeMarkdownV2('Trades:')} \`${data.totalTrades}\``,
      `${escapeMarkdownV2('Win Rate:')} \`${(data.winRate * 100).toFixed(1)}%\``,
      `${escapeMarkdownV2('Open Positions:')} \`${data.openPositions}\``,
    ].join('\n');

    await this.send(text, 'scheduled');
  }
}
