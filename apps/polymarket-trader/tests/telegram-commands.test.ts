import { describe, it, expect, vi } from 'vitest';
import {
  handleStart,
  handleStatus,
  handlePnl,
  handlePositions,
  handleTrades,
  handleRisk,
  handleDrift,
  handleStrategies,
  handleVerticals,
  handleWhales,
  handleConfig,
  handleHelp,
  handlePause,
  handleResume,
  handleCircuitReset,
  handleSetMode,
  handleAddWhale,
  handleApproveSignal,
  handleSkipSignal,
  handleConfirmPause,
  handleConfirmResume,
  handleConfirmEmergency,
  handleConfirmCircuitReset,
  handleCancel,
  routeCommand,
  routeCallback,
  type CommandContext,
} from '../src/telegram/commands.js';
import type { TradingSystem } from '../src/index.js';

// ---------------------------------------------------------------------------
// Mock Context
// ---------------------------------------------------------------------------

function mockContext(): CommandContext {
  return {
    system: {
      client: {
        getMarkets: vi.fn().mockResolvedValue([]),
        searchMarkets: vi.fn().mockResolvedValue([]),
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
        resetCircuitBreaker: vi.fn(),
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
      },
      paper: {
        getOpenPositions: vi.fn().mockReturnValue([]),
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
    } as unknown as TradingSystem,
    chatId: '123',
    isPaused: false,
    adminPassword: 'secret',
    startedAt: new Date(Date.now() - 3600000),
    pendingSignals: new Map(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Command Handlers', () => {
  it('/start should return welcome with menu keyboard', () => {
    const ctx = mockContext();
    const res = handleStart(ctx);
    expect(res.text).toContain('POLYMARKET TRADER BOT');
    expect(res.keyboard).toBeDefined();
    expect(res.keyboard?.inline_keyboard.length).toBeGreaterThan(0);
  });

  it('/status should return system info', () => {
    const ctx = mockContext();
    const res = handleStatus(ctx);
    expect(res.text).toContain('PAPER');
    expect(res.keyboard).toBeDefined();
  });

  it('/pnl should return P&L data', () => {
    const ctx = mockContext();
    const res = handlePnl(ctx);
    expect(res.text).toContain('P&L');
  });

  it('/positions should return position list', () => {
    const ctx = mockContext();
    const res = handlePositions(ctx);
    expect(res.text).toContain('No open positions');
  });

  it('/trades should return trade list with pagination', () => {
    const ctx = mockContext();
    const res = handleTrades(ctx, 1, 10);
    expect(res.text).toContain('TRADES');
  });

  it('/risk should return risk dashboard', () => {
    const ctx = mockContext();
    const res = handleRisk(ctx);
    expect(res.text).toContain('RISK');
    expect(res.text).toContain('500');
  });

  it('/drift should return drift report', () => {
    const ctx = mockContext();
    const res = handleDrift(ctx);
    expect(res.text).toContain('DRIFT');
    expect(res.text).toContain('Win Rate');
  });

  it('/strategies should return strategy stats', () => {
    const ctx = mockContext();
    const res = handleStrategies(ctx);
    expect(res.text).toContain('STRATEG');
  });

  it('/verticals should return vertical stats', () => {
    const ctx = mockContext();
    const res = handleVerticals(ctx);
    expect(res.text).toContain('VERTICAL');
  });

  it('/whales should return whale activity', () => {
    const ctx = mockContext();
    const res = handleWhales(ctx);
    expect(res.text).toContain('WHALE');
  });

  it('/config should return configuration', () => {
    const ctx = mockContext();
    const res = handleConfig(ctx);
    expect(res.text).toContain('CONFIGURATION');
    expect(res.text).toContain('PAPER');
  });

  it('/help should list all commands', () => {
    const res = handleHelp();
    expect(res.text).toContain('COMMANDS');
    expect(res.text).toContain('/status');
    expect(res.text).toContain('/pause');
    expect(res.text).toContain('/emergency');
    expect(res.keyboard).toBeDefined();
  });
});

describe('Control Commands', () => {
  it('/pause should ask for confirmation', () => {
    const ctx = mockContext();
    const res = handlePause(ctx);
    expect(res.text).toContain('PAUSE');
    expect(res.keyboard).toBeDefined();
    expect(res.keyboard?.inline_keyboard[0]?.some(b => b.callback_data?.includes('cfm:pause'))).toBe(true);
  });

  it('/resume should ask for confirmation', () => {
    const ctx = mockContext();
    const res = handleResume(ctx);
    expect(res.text).toContain('RESUME');
    expect(res.keyboard).toBeDefined();
  });

  it('/circuit_reset should ask for confirmation', () => {
    const ctx = mockContext();
    const res = handleCircuitReset(ctx);
    expect(res.text).toContain('circuit breaker');
    expect(res.keyboard).toBeDefined();
  });

  it('/set_mode paper should be instant', () => {
    const ctx = mockContext();
    const res = handleSetMode(ctx, 'paper');
    expect(res.text).toContain('PAPER');
  });

  it('/set_mode live should ask for confirmation', () => {
    const ctx = mockContext();
    const res = handleSetMode(ctx, 'live');
    expect(res.text).toContain('LIVE');
    expect(res.keyboard).toBeDefined();
  });

  it('/add_whale should add and confirm', () => {
    const ctx = mockContext();
    const res = handleAddWhale(ctx, '0x123abc', 'TestWhale');
    expect(res.text).toContain('TestWhale');
    expect(res.text).toContain('Added');
  });

  it('/approve_signal should approve pending signal', () => {
    const ctx = mockContext();
    ctx.pendingSignals.set('sig-1', { marketId: 'mkt-1', side: 'YES', strategy: 'info_arb' });

    const res = handleApproveSignal(ctx, 'sig-1');
    expect(res.text).toContain('APPROVED');
    expect(ctx.pendingSignals.has('sig-1')).toBe(false);
  });

  it('/approve_signal should handle missing signal', () => {
    const ctx = mockContext();
    const res = handleApproveSignal(ctx, 'nonexistent');
    expect(res.text).toContain('not found');
  });

  it('/skip_signal should remove pending signal', () => {
    const ctx = mockContext();
    ctx.pendingSignals.set('sig-2', { marketId: 'mkt-2', side: 'NO', strategy: 'whale_follow' });

    const res = handleSkipSignal(ctx, 'sig-2');
    expect(res.text).toContain('skipped');
    expect(ctx.pendingSignals.has('sig-2')).toBe(false);
  });
});

describe('Confirmation Handlers', () => {
  it('confirm pause should set isPaused', () => {
    const ctx = mockContext();
    const res = handleConfirmPause(ctx);
    expect(ctx.isPaused).toBe(true);
    expect(res.text).toContain('PAUSED');
  });

  it('confirm resume should clear isPaused', () => {
    const ctx = mockContext();
    ctx.isPaused = true;
    const res = handleConfirmResume(ctx);
    expect(ctx.isPaused).toBe(false);
    expect(res.text).toContain('RESUMED');
  });

  it('confirm emergency should halt trading', () => {
    const ctx = mockContext();
    const res = handleConfirmEmergency(ctx);
    expect(ctx.isPaused).toBe(true);
    expect(res.text).toContain('EMERGENCY');
  });

  it('confirm circuit reset should call resetCircuitBreaker', () => {
    const ctx = mockContext();
    const res = handleConfirmCircuitReset(ctx);
    expect(ctx.system.risk.resetCircuitBreaker).toHaveBeenCalled();
    expect(res.text).toContain('RESET');
  });

  it('cancel should return cancellation message', () => {
    const res = handleCancel();
    expect(res.text).toContain('cancelled');
  });
});

describe('routeCommand', () => {
  it('should route /status', async () => {
    const ctx = mockContext();
    const res = await routeCommand('/status', ctx);
    expect(res.text).toContain('POLYMARKET TRADER');
  });

  it('should route /help', async () => {
    const ctx = mockContext();
    const res = await routeCommand('/help', ctx);
    expect(res.text).toContain('COMMANDS');
  });

  it('should route /trades with count argument', async () => {
    const ctx = mockContext();
    const res = await routeCommand('/trades 5', ctx);
    expect(res.text).toContain('TRADES');
  });

  it('should handle unknown command', async () => {
    const ctx = mockContext();
    const res = await routeCommand('/foobar', ctx);
    expect(res.text).toContain('Unknown command');
  });
});

describe('routeCallback', () => {
  it('should route menu:status', async () => {
    const ctx = mockContext();
    const res = await routeCallback('menu:status', ctx);
    expect(res.text).toContain('POLYMARKET TRADER');
  });

  it('should route nav:main to start', async () => {
    const ctx = mockContext();
    const res = await routeCallback('nav:main', ctx);
    expect(res.text).toContain('POLYMARKET TRADER BOT');
  });

  it('should route cfm:cancel', async () => {
    const ctx = mockContext();
    const res = await routeCallback('cfm:cancel', ctx);
    expect(res.text).toContain('cancelled');
  });

  it('should route cfm:pause', async () => {
    const ctx = mockContext();
    await routeCallback('cfm:pause', ctx);
    expect(ctx.isPaused).toBe(true);
  });

  it('should route trades:page with page number', async () => {
    const ctx = mockContext();
    const res = await routeCallback('trades:page:2', ctx);
    expect(res.text).toContain('TRADES');
  });

  it('should handle unknown callback', async () => {
    const ctx = mockContext();
    const res = await routeCallback('unknown:action', ctx);
    expect(res.text).toContain('Unknown');
  });
});
