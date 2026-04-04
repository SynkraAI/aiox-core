import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiveTrader, buildEIP712Order } from '../src/execution/live-trader.js';
import { eventBus } from '../src/engine/event-bus.js';
import type {
  TradeSignal,
  TradeExperience,
  PaperReviewReport,
  GateResult,
} from '../src/types/index.js';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

function makeMockClient(overrides: Record<string, unknown> = {}) {
  return {
    getMidpoint: vi.fn().mockResolvedValue(0.55),
    getBalance: vi.fn().mockResolvedValue(500),
    getPositions: vi.fn().mockResolvedValue([]),
    placeOrder: vi.fn().mockResolvedValue({
      id: 'order-123',
      marketId: 'mkt-1',
      side: 'YES',
      price: 0.55,
      size: 10,
      orderType: 'GTC',
      status: 'pending',
      filledSize: 0,
      averageFillPrice: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    cancelOrder: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn().mockReturnValue(true),
    ...overrides,
  } as any;
}

function makeMockStore() {
  return {
    record: vi.fn().mockReturnValue({ id: 'exp-1' }),
    updateOutcome: vi.fn(),
    getStats: vi.fn().mockReturnValue({ total: 600, wins: 400, winRate: 0.65, totalPnl: 1200 }),
    close: vi.fn(),
  } as any;
}

function makeMockRisk() {
  return {
    getState: vi.fn().mockReturnValue({
      bankroll: 500,
      dailyPnl: 0,
      weeklyPnl: 0,
      openPositions: 0,
      totalExposure: 0,
      circuitBreakerTripped: false,
      lastUpdated: new Date(),
    }),
    calculateKelly: vi.fn().mockReturnValue({ suggestedSize: 10 }),
    evaluateSignal: vi.fn().mockReturnValue({ approved: true, suggestedSize: 10 }),
  } as any;
}

function makeMockGate() {
  return {
    evaluate: vi.fn().mockReturnValue({
      passed: true,
      score: 100,
      recommendation: 'GO',
      criteria: [],
    } as GateResult),
  } as any;
}

function makeMockReviewer() {
  return {
    analyze: vi.fn().mockReturnValue({
      period: { start: new Date('2026-01-01'), end: new Date('2026-02-15'), days: 45 },
      totalTrades: 600,
      wins: 390,
      losses: 210,
      winRate: 0.65,
      totalPnl: 1200,
      avgPnlPerTrade: 2.0,
      sharpeRatio: 1.8,
      maxDrawdown: 0.12,
      maxDrawdownDuration: 5,
      profitFactor: 2.1,
      bestTrade: { pnl: 50, marketId: 'best' },
      worstTrade: { pnl: -30, marketId: 'worst' },
      avgHoldingPeriod: 24,
      consecutiveWins: 8,
      consecutiveLosses: 4,
      edgePersistence: { period1WR: 0.63, period2WR: 0.66, period3WR: 0.65, isConsistent: true },
      byVertical: {},
      byStrategy: {},
      dailyPnl: [],
    } as PaperReviewReport),
  } as any;
}

function makeMockOnchain() {
  return {
    isGasSafe: vi.fn().mockResolvedValue(true),
    getGasPrice: vi.fn().mockResolvedValue({ gasPriceGwei: 30, isSafe: true, timestamp: new Date() }),
    getUSDCBalance: vi.fn().mockResolvedValue({ balanceFormatted: 500, token: 'USDC' }),
  } as any;
}

function makeSignal(overrides: Partial<TradeSignal> = {}): TradeSignal {
  return {
    marketId: 'mkt-1',
    vertical: 'weather',
    strategy: 'weather_model',
    side: 'YES',
    modelProbability: 0.70,
    marketProbability: 0.55,
    edge: 0.15,
    confidence: 0.85,
    suggestedSize: 20,
    reasoning: 'Test signal',
    timestamp: new Date(),
    ...overrides,
  };
}

function makePaperTrades(): TradeExperience[] {
  return Array.from({ length: 600 }, (_, i) => ({
    id: `t-${i}`,
    timestamp: new Date('2026-01-01'),
    marketId: `mkt-${i}`,
    vertical: 'weather' as const,
    strategy: 'weather_model' as const,
    marketQuestion: 'test',
    signalConfidence: 0.8,
    modelProbability: 0.7,
    marketProbability: 0.55,
    edgeDetected: 0.15,
    positionSize: 20,
    kellyFraction: 0.04,
    side: 'YES' as const,
    entryPrice: 0.55,
    slippage: 0.005,
    gasFee: 0.01,
    takerFee: 0.2,
    fillTimeMs: 50,
    outcome: (i < 400 ? 'WIN' : 'LOSS') as 'WIN' | 'LOSS',
    exitPrice: i < 400 ? 1.0 : 0.0,
    pnl: i < 400 ? 9 : -11,
    lesson: '',
    tags: ['paper-trade'],
    similarPastTrades: [],
    metadata: {},
  }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LiveTrader', () => {
  let trader: LiveTrader;
  let client: ReturnType<typeof makeMockClient>;
  let store: ReturnType<typeof makeMockStore>;
  let risk: ReturnType<typeof makeMockRisk>;
  let gate: ReturnType<typeof makeMockGate>;
  let reviewer: ReturnType<typeof makeMockReviewer>;
  let onchain: ReturnType<typeof makeMockOnchain>;

  beforeEach(() => {
    client = makeMockClient();
    store = makeMockStore();
    risk = makeMockRisk();
    gate = makeMockGate();
    reviewer = makeMockReviewer();
    onchain = makeMockOnchain();
    trader = new LiveTrader({
      client, store, risk, gate, reviewer, onchain,
      config: {
        privateKey: 'test-key',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        maxTradeSize: 50,
        slippageTolerance: 0.02,
        requireGatePass: true,
        gradualRollout: { enabled: true, kellyMultiplier: 0.25 },
      },
    });
  });

  describe('initialization', () => {
    it('should initialize when gate passes', async () => {
      await trader.initialize(makePaperTrades());
      expect(trader.isReady()).toBe(true);
    });

    it('should throw when gate fails', async () => {
      gate.evaluate.mockReturnValue({
        passed: false,
        score: 40,
        recommendation: 'NO_GO',
        criteria: [{ name: 'Win rate', required: '>= 60%', actual: '45%', passed: false }],
      });
      await expect(trader.initialize(makePaperTrades())).rejects.toThrow('Go/No-Go gate FAILED');
    });

    it('should skip gate when requireGatePass is false', async () => {
      trader = new LiveTrader({
        client, store, risk, gate, reviewer, onchain,
        config: {
          privateKey: 'k',
          walletAddress: '0x',
          maxTradeSize: 50,
          slippageTolerance: 0.02,
          requireGatePass: false,
          gradualRollout: { enabled: false, kellyMultiplier: 1 },
        },
      });
      await trader.initialize([]);
      expect(trader.isReady()).toBe(true);
      expect(gate.evaluate).not.toHaveBeenCalled();
    });
  });

  describe('executeTrade', () => {
    beforeEach(async () => {
      await trader.initialize(makePaperTrades());
    });

    it('should execute trade successfully', async () => {
      const result = await trader.executeTrade(makeSignal());
      expect(result.success).toBe(true);
      expect(result.orderId).toBe('order-123');
      expect(client.placeOrder).toHaveBeenCalled();
    });

    it('should record trade to experience store', async () => {
      await trader.executeTrade(makeSignal());
      expect(store.record).toHaveBeenCalledOnce();
      const recorded = store.record.mock.calls[0][0];
      expect(recorded.tags).toContain('live-trade');
      expect(recorded.metadata.mode).toBe('live');
    });

    it('should reject when not initialized', async () => {
      const uninitTrader = new LiveTrader({
        client, store, risk, gate, reviewer, onchain,
        config: {
          privateKey: 'k', walletAddress: '0x', maxTradeSize: 50,
          slippageTolerance: 0.02, requireGatePass: false,
          gradualRollout: { enabled: false, kellyMultiplier: 1 },
        },
      });
      const result = await uninitTrader.executeTrade(makeSignal());
      expect(result.success).toBe(false);
      expect(result.error).toContain('not initialized');
    });

    it('should reject when circuit breaker is tripped', async () => {
      risk.getState.mockReturnValue({
        bankroll: 500, dailyPnl: -100, weeklyPnl: -100,
        openPositions: 0, totalExposure: 0,
        circuitBreakerTripped: true, circuitBreakerReason: 'Daily loss',
        lastUpdated: new Date(),
      });
      const result = await trader.executeTrade(makeSignal());
      expect(result.success).toBe(false);
      expect(result.error).toContain('Circuit breaker');
    });

    it('should reject when gas is unsafe', async () => {
      onchain.isGasSafe.mockResolvedValue(false);
      const result = await trader.executeTrade(makeSignal());
      expect(result.success).toBe(false);
      expect(result.error).toContain('Gas price unsafe');
    });

    it('should reject when balance is insufficient', async () => {
      client.getBalance.mockResolvedValue(1); // Only $1
      const result = await trader.executeTrade(makeSignal({ suggestedSize: 100 }));
      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient balance');
    });

    it('should reject when slippage exceeds tolerance', async () => {
      // Signal says market is at 0.55, but current price moved to 0.60
      client.getMidpoint.mockResolvedValue(0.60);
      const result = await trader.executeTrade(makeSignal({ marketProbability: 0.55 }));
      expect(result.success).toBe(false);
      expect(result.error).toContain('Slippage too high');
    });

    it('should cap trade size at maxTradeSize', async () => {
      // gradualRollout disabled to test maxTradeSize directly
      trader = new LiveTrader({
        client, store, risk, gate, reviewer, onchain,
        config: {
          privateKey: 'k', walletAddress: '0x', maxTradeSize: 25,
          slippageTolerance: 0.05, requireGatePass: false,
          gradualRollout: { enabled: false, kellyMultiplier: 1 },
        },
      });
      await trader.initialize([]);
      await trader.executeTrade(makeSignal({ suggestedSize: 100 }));
      const orderCall = client.placeOrder.mock.calls[0][0];
      expect(orderCall.size).toBeLessThanOrEqual(25);
    });

    it('should emit telegram alert on trade', async () => {
      const spy = vi.fn();
      eventBus.on('telegram:alert', spy);
      await trader.executeTrade(makeSignal());
      expect(spy).toHaveBeenCalled();
      const alert = spy.mock.calls[0][0];
      expect(alert.type).toBe('live_trade');
      expect(alert.message).toContain('LIVE TRADE');
      eventBus.removeListener('telegram:alert', spy);
    });

    it('should reject after emergency shutdown', async () => {
      await trader.emergencyShutdown();
      const result = await trader.executeTrade(makeSignal());
      expect(result.success).toBe(false);
      expect(result.error).toContain('Emergency shutdown');
    });
  });

  describe('gradual rollout', () => {
    it('should return 0.25 multiplier in week 1', () => {
      expect(trader.getKellyMultiplier()).toBe(0.25);
    });

    it('should return 0.25 for first live trade (no prior trades)', async () => {
      await trader.initialize(makePaperTrades());
      // First trade uses initial multiplier
      const multiplier = trader.getKellyMultiplier();
      expect(multiplier).toBe(0.25);
    });

    it('should scale multiplier based on days since first trade', async () => {
      await trader.initialize(makePaperTrades());
      // Simulate first trade
      await trader.executeTrade(makeSignal());

      // Hack internal state to test time-based scaling
      const traderAny = trader as any;
      const now = Date.now();

      // Week 1
      traderAny.firstLiveTradeAt = new Date(now - 3 * 86_400_000);
      expect(trader.getKellyMultiplier()).toBe(0.25);

      // Week 2
      traderAny.firstLiveTradeAt = new Date(now - 10 * 86_400_000);
      expect(trader.getKellyMultiplier()).toBe(0.50);

      // Week 3
      traderAny.firstLiveTradeAt = new Date(now - 17 * 86_400_000);
      expect(trader.getKellyMultiplier()).toBe(0.75);

      // Week 4+
      traderAny.firstLiveTradeAt = new Date(now - 28 * 86_400_000);
      expect(trader.getKellyMultiplier()).toBe(1.0);
    });

    it('should return 1.0 when gradual rollout is disabled', async () => {
      trader = new LiveTrader({
        client, store, risk, gate, reviewer, onchain,
        config: {
          privateKey: 'k', walletAddress: '0x', maxTradeSize: 50,
          slippageTolerance: 0.02, requireGatePass: false,
          gradualRollout: { enabled: false, kellyMultiplier: 0.25 },
        },
      });
      expect(trader.getKellyMultiplier()).toBe(1.0);
    });
  });

  describe('emergencyShutdown', () => {
    it('should halt trading and emit events', async () => {
      await trader.initialize(makePaperTrades());
      const shutdownSpy = vi.fn();
      const telegramSpy = vi.fn();
      eventBus.on('live:emergency-shutdown', shutdownSpy);
      eventBus.on('telegram:alert', telegramSpy);

      await trader.emergencyShutdown();

      expect(trader.isReady()).toBe(false);
      expect(shutdownSpy).toHaveBeenCalled();
      expect(telegramSpy).toHaveBeenCalled();

      eventBus.removeListener('live:emergency-shutdown', shutdownSpy);
      eventBus.removeListener('telegram:alert', telegramSpy);
    });
  });

  describe('closePosition', () => {
    it('should close an existing position', async () => {
      await trader.initialize(makePaperTrades());
      await trader.executeTrade(makeSignal({ marketId: 'close-me' }));

      const result = await trader.closePosition('close-me');
      expect(result.success).toBe(true);
      expect(trader.getOpenPositions()).toHaveLength(0);
    });

    it('should fail for non-existent position', async () => {
      await trader.initialize(makePaperTrades());
      const result = await trader.closePosition('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No open position');
    });
  });

  describe('getPositions and getBalance', () => {
    it('should delegate getPositions to client', async () => {
      await trader.getPositions();
      expect(client.getPositions).toHaveBeenCalled();
    });

    it('should delegate getBalance to client', async () => {
      const balance = await trader.getBalance();
      expect(balance).toBe(500);
    });
  });

  describe('buildEIP712Order', () => {
    it('should build correct order structure', () => {
      const order = buildEIP712Order({
        maker: '0xABCD',
        tokenId: 'token-1',
        side: 'YES',
        price: 0.55,
        size: 20,
      });
      expect(order.maker).toBe('0xABCD');
      expect(order.tokenId).toBe('token-1');
      expect(order.side).toBe(0); // YES = 0
      expect(order.signatureType).toBe(2);
      expect(order.taker).toBe('0x0000000000000000000000000000000000000000');
    });

    it('should set side 1 for NO', () => {
      const order = buildEIP712Order({
        maker: '0xABCD',
        tokenId: 'token-1',
        side: 'NO',
        price: 0.45,
        size: 10,
      });
      expect(order.side).toBe(1);
    });
  });
});
