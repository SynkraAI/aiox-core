import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardAPI } from '../src/dashboard/api.js';
import type { TradingSystem } from '../src/index.js';
import type { TradeExperience } from '../src/types/index.js';

// ---------------------------------------------------------------------------
// Mock system factory
// ---------------------------------------------------------------------------

function mockTrade(overrides: Partial<TradeExperience> = {}): TradeExperience {
  return {
    id: 'trade-1',
    timestamp: new Date('2026-01-15T12:00:00Z'),
    marketId: 'market-1',
    vertical: 'weather',
    strategy: 'info_arb',
    marketQuestion: 'Will it rain?',
    signalConfidence: 0.8,
    modelProbability: 0.7,
    marketProbability: 0.5,
    edgeDetected: 0.2,
    positionSize: 25,
    kellyFraction: 0.05,
    side: 'YES',
    entryPrice: 0.5,
    slippage: 0.005,
    gasFee: 0.01,
    takerFee: 0.25,
    fillTimeMs: 120,
    outcome: 'WIN',
    exitPrice: 1.0,
    pnl: 12.50,
    lesson: '',
    tags: ['paper-trade'],
    similarPastTrades: [],
    metadata: {},
    ...overrides,
  };
}

function createMockSystem(overrides: Partial<Record<string, unknown>> = {}): TradingSystem {
  const trades = (overrides.trades as TradeExperience[] | undefined) ?? [
    mockTrade(),
    mockTrade({ id: 'trade-2', outcome: 'LOSS', pnl: -5, strategy: 'weather_model', vertical: 'crypto' }),
    mockTrade({ id: 'trade-3', outcome: 'PENDING', pnl: 0 }),
  ];

  return {
    client: {
      getMarkets: vi.fn().mockResolvedValue([
        {
          id: 'm-1', question: 'Will BTC hit 100k?', slug: 'btc-100k', vertical: 'crypto',
          endDate: '2026-12-31', active: true, closed: false,
          tokens: { yes: { tokenId: 't1', price: 0.65, outcome: 'Yes' }, no: { tokenId: 't2', price: 0.35, outcome: 'No' } },
          volume: 50000, liquidity: 20000, lastPrice: 0.65,
        },
      ]),
      searchMarkets: vi.fn().mockResolvedValue([]),
    } as unknown as TradingSystem['client'],
    risk: {
      getState: vi.fn().mockReturnValue({
        bankroll: 500,
        dailyPnl: -5,
        weeklyPnl: 15,
        openPositions: 2,
        totalExposure: 75,
        circuitBreakerTripped: false,
        lastUpdated: new Date('2026-01-15T12:00:00Z'),
      }),
    } as unknown as TradingSystem['risk'],
    store: {
      getStats: vi.fn().mockReturnValue({
        total: trades.length,
        wins: trades.filter(t => t.outcome === 'WIN').length,
        losses: trades.filter(t => t.outcome === 'LOSS').length,
        pending: trades.filter(t => t.outcome === 'PENDING').length,
        winRate: 0.667,
        totalPnl: 7.50,
        avgPnl: 3.75,
        byVertical: {
          weather: { count: 2, winRate: 0.5, pnl: 12.50 },
          crypto: { count: 1, winRate: 0, pnl: -5 },
        },
        byStrategy: {
          info_arb: { count: 2, winRate: 0.5, pnl: 12.50 },
          weather_model: { count: 1, winRate: 0, pnl: -5 },
        },
      }),
      getRecent: vi.fn().mockReturnValue(trades),
    } as unknown as TradingSystem['store'],
    drift: {
      isHealthy: vi.fn().mockReturnValue(true),
      getReport: vi.fn().mockReturnValue({
        baselineEstablished: true,
        totalTrades: 100,
        metrics: {
          winRate: { current: 0.65, baseline: 0.60, zScore: 0.5, trend: 'stable', sampleSize: 50, alertTriggered: false },
          evPerTrade: { current: 1.2, baseline: 1.0, zScore: 0.2, trend: 'improving', sampleSize: 50, alertTriggered: false },
          edgeAccuracy: { current: 0.85, baseline: 0.80, zScore: 0.5, trend: 'stable', sampleSize: 50, alertTriggered: false },
          executionQuality: { current: 0.95, baseline: 0.90, zScore: 0.5, trend: 'stable', sampleSize: 50, alertTriggered: false },
        },
      }),
    } as unknown as TradingSystem['drift'],
    paper: {
      getStatus: vi.fn().mockReturnValue({
        mode: 'paper',
        startedAt: new Date('2026-01-01T00:00:00Z'),
        daysRunning: 15,
        tradeCount: 100,
        openPositions: 2,
        readyForLive: false,
      }),
      getOpenPositions: vi.fn().mockReturnValue([
        { marketId: 'market-1', tokenId: 't1', side: 'YES', size: 25, entryPrice: 0.5, enteredAt: new Date('2026-01-14T10:00:00Z'), signal: {} },
      ]),
    } as unknown as TradingSystem['paper'],
    config: {
      mode: 'paper' as const,
      riskLimits: {
        maxPositionSize: 50, maxBankrollPercent: 0.05, kellyFraction: 0.15,
        dailyLossLimit: 0.10, weeklyLossLimit: 0.20, minEdge: 0.08,
        minLiquidity: 5000, maxOpenPositions: 10,
      },
      enabledVerticals: ['weather', 'crypto'],
      enabledStrategies: ['info_arb', 'weather_model'],
      driftMonitorEnabled: true,
      aceEvolutionEnabled: true,
      telegramAlerts: false,
      pollIntervalMs: 60000,
    },
    start: vi.fn(),
    stop: vi.fn(),
  } as unknown as TradingSystem;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardAPI', () => {
  let api: DashboardAPI;
  let system: TradingSystem;

  beforeEach(() => {
    system = createMockSystem();
    api = new DashboardAPI(system);
  });

  // --- getStatus ---
  describe('getStatus', () => {
    it('should return system status with all fields', () => {
      const status = api.getStatus();
      expect(status.mode).toBe('paper');
      expect(status.tradeCount).toBe(100);
      expect(status.openPositions).toBe(2);
      expect(status.bankroll).toBe(500);
      expect(status.totalPnl).toBe(7.50);
      expect(status.winRate).toBe(0.667);
      expect(status.healthy).toBe(true);
      expect(status.readyForLive).toBe(false);
      expect(status.enabledStrategies).toContain('info_arb');
      expect(status.timestamp).toBeTruthy();
    });

    it('should return defaults when system throws', () => {
      (system.paper.getStatus as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('boom'); });
      const status = api.getStatus();
      expect(status.mode).toBe('paper');
      expect(status.bankroll).toBe(0);
    });
  });

  // --- getPnl ---
  describe('getPnl', () => {
    it('should return P&L data with daily series', () => {
      const pnl = api.getPnl();
      expect(pnl.totalPnl).toBe(7.50);
      expect(pnl.dailyPnl).toBe(-5);
      expect(pnl.weeklyPnl).toBe(15);
      expect(pnl.winRate).toBe(0.667);
      expect(pnl.totalTrades).toBe(3);
    });

    it('should build dailySeries from settled trades', () => {
      const pnl = api.getPnl();
      // Both WIN and LOSS trades are on 2026-01-15
      expect(pnl.dailySeries.length).toBeGreaterThanOrEqual(1);
      if (pnl.dailySeries.length > 0) {
        expect(pnl.dailySeries[0].date).toBe('2026-01-15');
      }
    });

    it('should handle period filtering', () => {
      const pnl = api.getPnl('1d');
      expect(pnl).toBeTruthy();
      expect(Array.isArray(pnl.dailySeries)).toBe(true);
    });

    it('should return defaults on error', () => {
      (system.risk.getState as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('boom'); });
      const pnl = api.getPnl();
      expect(pnl.totalPnl).toBe(0);
      expect(pnl.dailySeries).toEqual([]);
    });
  });

  // --- getPositions ---
  describe('getPositions', () => {
    it('should return open positions', () => {
      const positions = api.getPositions();
      expect(positions).toHaveLength(1);
      expect(positions[0].marketId).toBe('market-1');
      expect(positions[0].side).toBe('YES');
      expect(positions[0].size).toBe(25);
      expect(positions[0].entryPrice).toBe(0.5);
      expect(positions[0].enteredAt).toBeTruthy();
      expect(positions[0].age).toBeGreaterThan(0);
    });

    it('should return empty array on error', () => {
      (system.paper.getOpenPositions as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('boom'); });
      const positions = api.getPositions();
      expect(positions).toEqual([]);
    });
  });

  // --- getTrades ---
  describe('getTrades', () => {
    it('should return paginated trades', () => {
      const result = api.getTrades(2, 0);
      expect(result.total).toBe(3);
      expect(result.trades).toHaveLength(2);
      expect(result.trades[0].id).toBe('trade-1');
    });

    it('should respect offset', () => {
      const result = api.getTrades(10, 1);
      expect(result.trades).toHaveLength(2);
      expect(result.trades[0].id).toBe('trade-2');
    });

    it('should return trade fields', () => {
      const result = api.getTrades(1, 0);
      const t = result.trades[0];
      expect(t.marketId).toBe('market-1');
      expect(t.vertical).toBe('weather');
      expect(t.strategy).toBe('info_arb');
      expect(t.side).toBe('YES');
      expect(t.pnl).toBe(12.50);
      expect(t.outcome).toBe('WIN');
    });

    it('should return empty on error', () => {
      (system.store.getRecent as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('boom'); });
      const result = api.getTrades();
      expect(result.trades).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // --- getRisk ---
  describe('getRisk', () => {
    it('should return risk state with limits', () => {
      const risk = api.getRisk();
      expect(risk.bankroll).toBe(500);
      expect(risk.dailyPnl).toBe(-5);
      expect(risk.openPositions).toBe(2);
      expect(risk.circuitBreakerTripped).toBe(false);
      expect(risk.utilization).toBeCloseTo(0.15, 2);
      expect(risk.limits.kellyFraction).toBe(0.15);
      expect(risk.limits.maxOpenPositions).toBe(10);
    });

    it('should compute daily/weekly P&L percentages', () => {
      const risk = api.getRisk();
      expect(risk.dailyPnlPercent).toBeCloseTo(-0.01, 2);
      expect(risk.weeklyPnlPercent).toBeCloseTo(0.03, 2);
    });

    it('should return defaults on error', () => {
      (system.risk.getState as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('boom'); });
      const risk = api.getRisk();
      expect(risk.bankroll).toBe(0);
    });
  });

  // --- getHealth ---
  describe('getHealth', () => {
    it('should return health report using injected monitor', async () => {
      api.setHealthMonitor({
        checkAll: vi.fn().mockResolvedValue({
          timestamp: new Date('2026-01-15T12:00:00Z'),
          overall: 'healthy',
          checks: [
            { name: 'api-connectivity', status: 'ok', message: 'OK' },
          ],
        }),
      });

      const health = await api.getHealth();
      expect(health.overall).toBe('healthy');
      expect(health.checks).toHaveLength(1);
      expect(health.checks[0].name).toBe('api-connectivity');
    });

    it('should return critical on error', async () => {
      api.setHealthMonitor({
        checkAll: vi.fn().mockRejectedValue(new Error('boom')),
      });
      const health = await api.getHealth();
      expect(health.overall).toBe('critical');
    });
  });

  // --- getDrift ---
  describe('getDrift', () => {
    it('should return drift metrics', () => {
      const drift = api.getDrift();
      expect(drift.baselineEstablished).toBe(true);
      expect(drift.totalTrades).toBe(100);
      expect(drift.healthy).toBe(true);
      expect(drift.metrics.winRate.current).toBe(0.65);
      expect(drift.metrics.evPerTrade.trend).toBe('improving');
    });

    it('should return defaults on error', () => {
      (system.drift.getReport as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('boom'); });
      const drift = api.getDrift();
      expect(drift.baselineEstablished).toBe(false);
      expect(drift.healthy).toBe(true);
    });
  });

  // --- getStrategies ---
  describe('getStrategies', () => {
    it('should return strategy list', () => {
      const strats = api.getStrategies();
      expect(strats).toHaveLength(2);
      expect(strats[0].strategy).toBe('info_arb');
      expect(strats[0].trades).toBe(2);
      expect(strats[0].active).toBe(true);
    });

    it('should mark inactive strategies', () => {
      const strats = api.getStrategies();
      // weather_model is in enabledStrategies so it should be active
      const wm = strats.find(s => s.strategy === 'weather_model');
      expect(wm?.active).toBe(true);
    });

    it('should include ACE version when evolver is set', () => {
      api.setAceEvolver({
        getPromptVersion: vi.fn().mockReturnValue({ version: '2.3' }),
      });
      const strats = api.getStrategies();
      expect(strats[0].aceVersion).toBe('v2.3');
    });

    it('should return empty on error', () => {
      (system.store.getStats as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('boom'); });
      const strats = api.getStrategies();
      expect(strats).toEqual([]);
    });
  });

  // --- getVerticals ---
  describe('getVerticals', () => {
    it('should return vertical list', () => {
      const verts = api.getVerticals();
      expect(verts).toHaveLength(2);
      expect(verts.find(v => v.vertical === 'weather')?.active).toBe(true);
    });

    it('should return empty on error', () => {
      (system.store.getStats as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('boom'); });
      expect(api.getVerticals()).toEqual([]);
    });
  });

  // --- getMarkets ---
  describe('getMarkets', () => {
    it('should return markets from client', async () => {
      const markets = await api.getMarkets();
      expect(markets).toHaveLength(1);
      expect(markets[0].question).toBe('Will BTC hit 100k?');
      expect(markets[0].yesPrice).toBe(0.65);
    });

    it('should search markets with query', async () => {
      (system.client.searchMarkets as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          id: 'm-2', question: 'Rain?', slug: 'rain', vertical: 'weather',
          endDate: '', active: true, closed: false,
          tokens: { yes: { tokenId: '', price: 0.3, outcome: 'Yes' }, no: { tokenId: '', price: 0.7, outcome: 'No' } },
          volume: 1000, liquidity: 500, lastPrice: 0.3,
        },
      ]);
      const markets = await api.getMarkets('rain');
      expect(markets).toHaveLength(1);
      expect(system.client.searchMarkets).toHaveBeenCalledWith('rain');
    });

    it('should return empty on error', async () => {
      (system.client.getMarkets as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network'));
      const markets = await api.getMarkets();
      expect(markets).toEqual([]);
    });
  });

  // --- getGate ---
  describe('getGate', () => {
    it('should return gate result when gate module is injected', async () => {
      api.setGoNoGoGate({
        evaluate: vi.fn().mockReturnValue({
          passed: false,
          score: 40,
          recommendation: 'NO_GO',
          criteria: [{ name: 'Duration', required: '>= 30', actual: '15', passed: false }],
        }),
      });
      api.setReviewer({
        analyze: vi.fn().mockReturnValue({}),
      });

      const gate = await api.getGate();
      expect(gate.recommendation).toBe('NO_GO');
      expect(gate.score).toBe(40);
      expect(gate.criteria).toHaveLength(1);
    });

    it('should return NO_GO on error', async () => {
      api.setGoNoGoGate({
        evaluate: vi.fn().mockImplementation(() => { throw new Error('boom'); }),
      });
      api.setReviewer({
        analyze: vi.fn().mockReturnValue({}),
      });
      const gate = await api.getGate();
      expect(gate.recommendation).toBe('NO_GO');
    });
  });

  // --- getWhales ---
  describe('getWhales', () => {
    it('should return empty when no whale tracker set', () => {
      expect(api.getWhales()).toEqual([]);
    });

    it('should return whale signals when tracker is set', () => {
      api.setWhaleTracker({
        getRecentSignals: vi.fn().mockReturnValue([{
          walletAddress: '0xabc',
          walletLabel: 'BigWhale',
          marketId: 'm-1',
          side: 'YES',
          size: 1000,
          timestamp: new Date('2026-01-15T12:00:00Z'),
          whaleWinRate: 0.72,
          confidence: 0.68,
        }]),
        getWatchlist: vi.fn().mockReturnValue([]),
      });

      const whales = api.getWhales();
      expect(whales).toHaveLength(1);
      expect(whales[0].walletLabel).toBe('BigWhale');
      expect(whales[0].size).toBe(1000);
      expect(whales[0].whaleWinRate).toBe(0.72);
    });

    it('should return empty on error', () => {
      api.setWhaleTracker({
        getRecentSignals: vi.fn().mockImplementation(() => { throw new Error('boom'); }),
        getWatchlist: vi.fn().mockReturnValue([]),
      });
      expect(api.getWhales()).toEqual([]);
    });
  });
});
