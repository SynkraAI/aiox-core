/**
 * Telegram Trading Bot — Main Engine.
 * Uses native fetch() for HTTP long polling (ZERO external deps).
 * Authenticates by CHAT_ID — ignores messages from other users.
 *
 * Telegram Bot API: https://api.telegram.org/bot{token}/{method}
 */

import type { TradingSystem } from '../index.js';
import { routeCommand, routeCallback, type CommandContext } from './commands.js';
import { NotificationManager, type NotificationConfig } from './notifications.js';
import type { InlineKeyboardMarkup } from './keyboards.js';
import { escapeMarkdownV2 } from './formatters.js';

// ---------------------------------------------------------------------------
// Types (Telegram Bot API subset)
// ---------------------------------------------------------------------------

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name?: string; username?: string };
  chat: { id: number; type: string };
  text?: string;
  date: number;
}

interface TelegramCallbackQuery {
  id: string;
  from: { id: number; first_name?: string; username?: string };
  message?: TelegramMessage;
  data?: string;
}

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface TelegramBotConfig {
  /** Telegram Bot token from BotFather. Required. */
  token: string;
  /** Authorized chat ID. Only this chat receives responses. */
  chatId: string;
  /** Admin password for dangerous operations. */
  adminPassword: string;
  /** Long polling timeout in seconds. Default: 30. */
  pollTimeoutSeconds: number;
  /** Retry delay on poll failure in ms. Default: 5000. */
  retryDelayMs: number;
  /** Max retries before giving up. Default: 50 (then restarts). */
  maxRetries: number;
  /** Notification config. */
  notifications: Partial<NotificationConfig>;
}

export const DEFAULT_BOT_CONFIG: TelegramBotConfig = {
  token: '',
  chatId: '',
  adminPassword: '',
  pollTimeoutSeconds: 30,
  retryDelayMs: 5000,
  maxRetries: 50,
  notifications: {},
};

// ---------------------------------------------------------------------------
// TradingBot
// ---------------------------------------------------------------------------

export class TradingBot {
  private config: TelegramBotConfig;
  private system: TradingSystem;
  private notifications: NotificationManager;
  private ctx: CommandContext;

  private running = false;
  private offset = 0;
  private retryCount = 0;
  private pollAbort: AbortController | null = null;
  private awaitingEmergencyPassword = false;

  constructor(system: TradingSystem, config: Partial<TelegramBotConfig> = {}) {
    this.config = { ...DEFAULT_BOT_CONFIG, ...config };

    // Environment variable fallbacks
    if (!this.config.token) this.config.token = process.env['TELEGRAM_BOT_TOKEN'] ?? '';
    if (!this.config.chatId) this.config.chatId = process.env['TELEGRAM_CHAT_ID'] ?? '';
    if (!this.config.adminPassword) this.config.adminPassword = process.env['TELEGRAM_ADMIN_PASSWORD'] ?? 'shutdown';

    this.system = system;

    // Build command context
    this.ctx = {
      system,
      chatId: this.config.chatId,
      isPaused: false,
      adminPassword: this.config.adminPassword,
      startedAt: new Date(),
      pendingSignals: new Map(),
    };

    // Wire notifications
    this.notifications = new NotificationManager(
      (text, keyboard) => this.sendMessage(text, keyboard),
      this.config.notifications,
    );
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Start the bot — begins long polling and sends startup message. */
  async start(): Promise<void> {
    if (this.running) return;
    if (!this.config.token) throw new Error('TELEGRAM_BOT_TOKEN not configured');
    if (!this.config.chatId) throw new Error('TELEGRAM_CHAT_ID not configured');

    this.running = true;
    this.retryCount = 0;

    // Wire notifications to eventBus
    this.notifications.wire(() => {
      const risk = this.system.risk.getState();
      const stats = this.system.store.getStats();
      return {
        dailyPnl: risk.dailyPnl,
        totalPnl: stats.totalPnl,
        totalTrades: stats.total,
        winRate: stats.winRate,
        openPositions: risk.openPositions,
      };
    });

    // Send startup message
    await this.sendMessage(
      `\u{1F7E2} *Bot Started*\n\n${escapeMarkdownV2('Polymarket Trader is online. Type /start for the menu.')}`,
    );

    // Begin polling loop
    void this.pollLoop();
  }

  /** Stop the bot gracefully. */
  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;

    // Abort current poll
    if (this.pollAbort) {
      this.pollAbort.abort();
      this.pollAbort = null;
    }

    // Unwire notifications
    this.notifications.unwire();

    // Send shutdown message (best effort)
    try {
      await this.sendMessage(
        `\u{1F534} *Bot Stopped*\n\n${escapeMarkdownV2('Polymarket Trader going offline.')}`,
      );
    } catch {
      // Ignore send failures during shutdown
    }
  }

  /** Check if the bot is running. */
  isRunning(): boolean {
    return this.running;
  }

  /** Get the notification manager (for external wiring). */
  getNotifications(): NotificationManager {
    return this.notifications;
  }

  // -----------------------------------------------------------------------
  // Long Polling
  // -----------------------------------------------------------------------

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        const updates = await this.getUpdates();
        this.retryCount = 0; // Reset on success

        for (const update of updates) {
          try {
            await this.handleUpdate(update);
          } catch (err) {
            console.error('[TelegramBot] Error handling update:', err instanceof Error ? err.message : err);
          }
        }
      } catch (err) {
        if (!this.running) break; // Expected abort on stop

        this.retryCount++;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[TelegramBot] Poll error (retry ${this.retryCount}/${this.config.maxRetries}): ${msg}`);

        if (this.retryCount >= this.config.maxRetries) {
          console.error('[TelegramBot] Max retries reached, resetting retry count');
          this.retryCount = 0;
        }

        // Wait before retry
        await this.sleep(this.config.retryDelayMs);
      }
    }
  }

  private async getUpdates(): Promise<TelegramUpdate[]> {
    this.pollAbort = new AbortController();

    const url = `${this.apiBase()}/getUpdates`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offset: this.offset,
        timeout: this.config.pollTimeoutSeconds,
        allowed_updates: ['message', 'callback_query'],
      }),
      signal: this.pollAbort.signal,
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as TelegramResponse<TelegramUpdate[]>;

    if (!data.ok || !data.result) {
      throw new Error(`Telegram API returned error: ${data.description ?? 'unknown'}`);
    }

    // Advance offset
    for (const update of data.result) {
      if (update.update_id >= this.offset) {
        this.offset = update.update_id + 1;
      }
    }

    return data.result;
  }

  // -----------------------------------------------------------------------
  // Update Handler
  // -----------------------------------------------------------------------

  private async handleUpdate(update: TelegramUpdate): Promise<void> {
    if (update.message) {
      await this.handleMessage(update.message);
    } else if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
    }
  }

  private async handleMessage(message: TelegramMessage): Promise<void> {
    // Auth: only respond to configured chat
    if (String(message.chat.id) !== this.config.chatId) {
      return; // Silently ignore
    }

    const text = message.text?.trim();
    if (!text) return;

    // Emergency password flow
    if (this.awaitingEmergencyPassword) {
      this.awaitingEmergencyPassword = false;
      if (text === this.config.adminPassword) {
        const response = {
          text: `\u{1F6D1} ${escapeMarkdownV2('EMERGENCY SHUTDOWN CONFIRMED. All trading halted.')}`,
          parseMode: 'MarkdownV2' as const,
        };
        this.ctx.isPaused = true;
        await this.sendMessage(response.text);
        this.system.stop();
        return;
      } else {
        await this.sendMessage(escapeMarkdownV2('Invalid password. Emergency shutdown cancelled.'));
        return;
      }
    }

    // Check if this is the emergency command (needs password next)
    if (text.toLowerCase() === '/emergency') {
      this.awaitingEmergencyPassword = true;
    }

    // Route command
    const response = await routeCommand(text, this.ctx);
    await this.sendMessage(response.text, response.keyboard);
  }

  private async handleCallbackQuery(query: TelegramCallbackQuery): Promise<void> {
    // Auth check
    if (query.message && String(query.message.chat.id) !== this.config.chatId) {
      return;
    }

    // Answer callback to remove loading state
    await this.answerCallbackQuery(query.id);

    if (!query.data || query.data === 'noop') return;

    const response = await routeCallback(query.data, this.ctx);

    // Edit the original message if possible
    if (query.message) {
      await this.editMessage(query.message.chat.id, query.message.message_id, response.text, response.keyboard);
    } else {
      await this.sendMessage(response.text, response.keyboard);
    }
  }

  // -----------------------------------------------------------------------
  // Telegram API Methods
  // -----------------------------------------------------------------------

  /** Send a message to the configured chat. */
  async sendMessage(text: string, keyboard?: InlineKeyboardMarkup): Promise<void> {
    const url = `${this.apiBase()}/sendMessage`;

    const body: Record<string, unknown> = {
      chat_id: this.config.chatId,
      text,
      parse_mode: 'MarkdownV2',
    };

    if (keyboard) {
      body.reply_markup = keyboard;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({})) as { description?: string };
        console.error(`[TelegramBot] sendMessage failed: ${response.status} ${errData.description ?? ''}`);
      }
    } catch (err) {
      console.error('[TelegramBot] sendMessage error:', err instanceof Error ? err.message : err);
    }
  }

  /** Edit an existing message. */
  private async editMessage(chatId: number, messageId: number, text: string, keyboard?: InlineKeyboardMarkup): Promise<void> {
    const url = `${this.apiBase()}/editMessageText`;

    const body: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'MarkdownV2',
    };

    if (keyboard) {
      body.reply_markup = keyboard;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        // If edit fails (message too old, etc.), send a new message
        await this.sendMessage(text, keyboard);
      }
    } catch {
      await this.sendMessage(text, keyboard);
    }
  }

  /** Answer a callback query to clear the loading indicator. */
  private async answerCallbackQuery(callbackQueryId: string): Promise<void> {
    const url = `${this.apiBase()}/answerCallbackQuery`;

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId }),
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      // Non-critical, ignore
    }
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private apiBase(): string {
    return `https://api.telegram.org/bot${this.config.token}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
