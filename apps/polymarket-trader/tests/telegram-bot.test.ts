import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TradingBot } from '../src/telegram/bot.js';
import type { TradingSystem } from '../src/index.js';

// ---------------------------------------------------------------------------
// Mock TradingSystem
// ---------------------------------------------------------------------------

function mockSystem(): TradingSystem {
  return {
    client: {
      getMarkets: vi.fn().mockResolvedValue([]),
      searchMarkets: vi.fn().mockResolvedValue([]),
      getMarket: vi.fn().mockResolvedValue(null),
      getMidpoint: vi.fn().mockResolvedValue(0.5),
      getOrderBook: vi.fn().mockResolvedValue({ bids: [], asks: [], spread: 0, midpoint: 0.5, timestamp: new Date() }),
      placeOrder: vi.fn().mockResolvedValue({ id: 'test' }),
      cancelOrder: vi.fn(),
      getPositions: vi.fn().mockResolvedValue([]),
      getBalance: vi.fn().mockResolvedValue(500),
      isAuthenticated: vi.fn().mockReturnValue(false),
    },
    risk: {
      getState: vi.fn().mockReturnValue({
        bankroll: 500,
        dailyPnl: 10,
        weeklyPnl: 25,
        openPositions: 2,
        totalExposure: 50,
        circuitBreakerTripped: false,
        lastUpdated: new Date(),
      }),
      calculateKelly: vi.fn(),
      evaluateSignal: vi.fn(),
      resetCircuitBreaker: vi.fn(),
      resetDaily: vi.fn(),
      resetWeekly: vi.fn(),
      updateBankroll: vi.fn(),
    },
    store: {
      getRecent: vi.fn().mockReturnValue([]),
      getStats: vi.fn().mockReturnValue({
        total: 50,
        wins: 30,
        losses: 20,
        pending: 0,
        winRate: 0.60,
        totalPnl: 100,
        avgPnl: 2,
        byVertical: {},
        byStrategy: {},
      }),
      record: vi.fn(),
      updateOutcome: vi.fn(),
      updateLesson: vi.fn(),
      getByVertical: vi.fn().mockReturnValue([]),
      getByStrategy: vi.fn().mockReturnValue([]),
      findSimilar: vi.fn().mockReturnValue([]),
      close: vi.fn(),
    },
    drift: {
      getReport: vi.fn().mockReturnValue({
        metrics: {
          winRate: { current: 0.65, baseline: 0.60, zScore: 0.5, trend: 'stable', sampleSize: 50, alertTriggered: false },
          evPerTrade: { current: 2, baseline: 1.5, zScore: 0.3, trend: 'stable', sampleSize: 50, alertTriggered: false },
          edgeAccuracy: { current: 0.85, baseline: 0.80, zScore: 0.2, trend: 'stable', sampleSize: 50, alertTriggered: false },
          executionQuality: { current: 0.95, baseline: 0.90, zScore: 0.1, trend: 'stable', sampleSize: 50, alertTriggered: false },
        },
        baselineEstablished: true,
        totalTrades: 100,
      }),
      isHealthy: vi.fn().mockReturnValue(true),
      addTrade: vi.fn(),
      computeCurrentMetrics: vi.fn(),
    },
    paper: {
      getStatus: vi.fn().mockReturnValue({
        mode: 'paper',
        startedAt: new Date(Date.now() - 86400000),
        daysRunning: 1,
        tradeCount: 50,
        openPositions: 2,
        readyForLive: false,
      }),
      getOpenPositions: vi.fn().mockReturnValue([]),
      executePaperTrade: vi.fn(),
      resolvePosition: vi.fn(),
    },
    config: {
      mode: 'paper' as const,
      riskLimits: {
        maxPositionSize: 50,
        maxBankrollPercent: 0.05,
        kellyFraction: 0.15,
        dailyLossLimit: 0.10,
        weeklyLossLimit: 0.20,
        minEdge: 0.08,
        minLiquidity: 5000,
        maxOpenPositions: 10,
      },
      enabledVerticals: ['crypto', 'weather'],
      enabledStrategies: ['info_arb', 'whale_follow'],
      driftMonitorEnabled: true,
      aceEvolutionEnabled: true,
      telegramAlerts: true,
      pollIntervalMs: 60000,
    },
    start: vi.fn(),
    stop: vi.fn(),
  } as unknown as TradingSystem;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TradingBot', () => {
  let system: TradingSystem;

  beforeEach(() => {
    system = mockSystem();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create bot instance', () => {
    const bot = new TradingBot(system, { token: 'test-token', chatId: '123' });
    expect(bot).toBeDefined();
    expect(bot.isRunning()).toBe(false);
  });

  it('should throw if token is missing on start', async () => {
    const bot = new TradingBot(system, { token: '', chatId: '123' });
    await expect(bot.start()).rejects.toThrow('TELEGRAM_BOT_TOKEN not configured');
  });

  it('should throw if chatId is missing on start', async () => {
    const bot = new TradingBot(system, { token: 'test-token', chatId: '' });
    await expect(bot.start()).rejects.toThrow('TELEGRAM_CHAT_ID not configured');
  });

  it('should use environment variables as fallback', () => {
    process.env['TELEGRAM_BOT_TOKEN'] = 'env-token';
    process.env['TELEGRAM_CHAT_ID'] = 'env-chat';
    process.env['TELEGRAM_ADMIN_PASSWORD'] = 'env-pass';

    const bot = new TradingBot(system);
    expect(bot).toBeDefined();

    delete process.env['TELEGRAM_BOT_TOKEN'];
    delete process.env['TELEGRAM_CHAT_ID'];
    delete process.env['TELEGRAM_ADMIN_PASSWORD'];
  });

  it('should get notification manager', () => {
    const bot = new TradingBot(system, { token: 'test-token', chatId: '123' });
    const nm = bot.getNotifications();
    expect(nm).toBeDefined();
  });

  it('should send messages via sendMessage', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, result: {} }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const bot = new TradingBot(system, { token: 'test-token', chatId: '123' });
    await bot.sendMessage('Test message');

    const sendCalls = fetchMock.mock.calls.filter((call: unknown[]) =>
      typeof call[0] === 'string' && (call[0] as string).includes('/sendMessage')
    );
    expect(sendCalls.length).toBe(1);

    const body = JSON.parse((sendCalls[0][1] as { body: string }).body);
    expect(body.chat_id).toBe('123');
    expect(body.text).toBe('Test message');
    expect(body.parse_mode).toBe('MarkdownV2');

    vi.unstubAllGlobals();
  });

  it('should send messages with keyboard', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, result: {} }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const keyboard = { inline_keyboard: [[{ text: 'Test', callback_data: 'test' }]] };
    const bot = new TradingBot(system, { token: 'test-token', chatId: '123' });
    await bot.sendMessage('With keyboard', keyboard);

    const sendCalls = fetchMock.mock.calls.filter((call: unknown[]) =>
      typeof call[0] === 'string' && (call[0] as string).includes('/sendMessage')
    );
    const body = JSON.parse((sendCalls[0][1] as { body: string }).body);
    expect(body.reply_markup).toBeDefined();
    expect(body.reply_markup.inline_keyboard).toBeDefined();

    vi.unstubAllGlobals();
  });

  it('should handle sendMessage failure gracefully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ ok: false, description: 'Bad Request' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const bot = new TradingBot(system, { token: 'test-token', chatId: '123' });
    // Should not throw
    await bot.sendMessage('Test');

    vi.unstubAllGlobals();
  });

  it('should handle network errors in sendMessage gracefully', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network down'));
    vi.stubGlobal('fetch', fetchMock);

    const bot = new TradingBot(system, { token: 'test-token', chatId: '123' });
    // Should not throw
    await bot.sendMessage('Test');

    vi.unstubAllGlobals();
  });

  it('should report running state correctly', () => {
    const bot = new TradingBot(system, { token: 'test-token', chatId: '123' });
    expect(bot.isRunning()).toBe(false);
  });

  it('should build correct API URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, result: {} }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const bot = new TradingBot(system, { token: 'my-secret-token', chatId: '123' });
    await bot.sendMessage('Test');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe('https://api.telegram.org/botmy-secret-token/sendMessage');

    vi.unstubAllGlobals();
  });

  it('should use default config values', () => {
    const bot = new TradingBot(system, { token: 'test', chatId: '123' });
    // The bot should have been created with defaults
    expect(bot).toBeDefined();
    // Default admin password
    expect(bot.isRunning()).toBe(false);
  });

  it('should accept custom config', () => {
    const bot = new TradingBot(system, {
      token: 'test',
      chatId: '123',
      adminPassword: 'custom-pass',
      pollTimeoutSeconds: 60,
      retryDelayMs: 10000,
      maxRetries: 100,
    });
    expect(bot).toBeDefined();
  });

  it('should handle stop when not running', async () => {
    const bot = new TradingBot(system, { token: 'test-token', chatId: '123' });
    // Should not throw
    await bot.stop();
    expect(bot.isRunning()).toBe(false);
  });

  it('should handle sendMessage with empty text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, result: {} }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const bot = new TradingBot(system, { token: 'test-token', chatId: '123' });
    await bot.sendMessage('');

    expect(fetchMock).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('should never include sensitive data in messages', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, result: {} }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const bot = new TradingBot(system, {
      token: 'super-secret-token-123',
      chatId: '123',
      adminPassword: 'admin-pass-456',
    });
    await bot.sendMessage('Status update');

    // The sent message body should not contain the token or password
    for (const call of fetchMock.mock.calls) {
      if (call[1]?.body) {
        const body = call[1].body as string;
        expect(body).not.toContain('super-secret-token-123');
        expect(body).not.toContain('admin-pass-456');
      }
    }

    vi.unstubAllGlobals();
  });

  it('should construct with Partial config', () => {
    const bot = new TradingBot(system, { token: 'test' });
    expect(bot).toBeDefined();
  });
});
