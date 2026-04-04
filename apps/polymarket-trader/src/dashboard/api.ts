/**
 * Dashboard API Data Aggregator.
 * Collects data from all system modules and returns JSON-serializable snapshots.
 * Every method handles errors gracefully (returns defaults if module unavailable).
 */

import type { TradingSystem } from '../index.js';
import type {
  GateResult,
  RiskState,
  TradeExperience,
} from '../types/index.js';
import type { HealthReport } from '../engine/health-monitor.js';
import type { PromptVersion } from '../learning/ace-evolver.js';
import type { WhaleSignal } from '../strategies/whale-tracker.js';

// ---------------------------------------------------------------------------
// Response types (JSON-serializable)
// ---------------------------------------------------------------------------

export interface StatusResponse {
  mode: 'paper' | 'live';
  uptime: number;
  startedAt: string;
  daysRunning: number;
  tradeCount: number;
  openPositions: number;
  readyForLive: boolean;
  enabledStrategies: string[];
  enabledVerticals: string[];
  bankroll: number;
  totalPnl: number;
  winRate: number;
  healthy: boolean;
  timestamp: string;
}

export interface PnlResponse {
  totalPnl: number;
  dailyPnl: number;
  weeklyPnl: number;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  pending: number;
  avgPnl: number;
  dailySeries: Array<{ date: string; pnl: number; cumulative: number }>;
}

export interface PositionResponse {
  marketId: string;
  side: string;
  size: number;
  entryPrice: number;
  enteredAt: string;
  age: number;
}

export interface TradeResponse {
  id: string;
  timestamp: string;
  marketId: string;
  marketQuestion: string;
  vertical: string;
  strategy: string;
  side: string;
  positionSize: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  outcome: string;
}

export interface RiskResponse {
  bankroll: number;
  dailyPnl: number;
  weeklyPnl: number;
  openPositions: number;
  totalExposure: number;
  circuitBreakerTripped: boolean;
  circuitBreakerReason?: string;
  lastUpdated: string;
  limits: {
    maxPositionSize: number;
    maxBankrollPercent: number;
    kellyFraction: number;
    dailyLossLimit: number;
    weeklyLossLimit: number;
    minEdge: number;
    maxOpenPositions: number;
  };
  utilization: number;
  dailyPnlPercent: number;
  weeklyPnlPercent: number;
}

export interface HealthResponse {
  overall: string;
  timestamp: string;
  checks: Array<{
    name: string;
    status: string;
    value?: number;
    threshold?: number;
    message: string;
  }>;
}

export interface DriftResponse {
  baselineEstablished: boolean;
  totalTrades: number;
  healthy: boolean;
  metrics: {
    winRate: MetricSnapshot;
    evPerTrade: MetricSnapshot;
    edgeAccuracy: MetricSnapshot;
    executionQuality: MetricSnapshot;
  };
}

interface MetricSnapshot {
  current: number;
  baseline: number;
  zScore: number;
  trend: string;
  sampleSize: number;
  alertTriggered: boolean;
}

export interface StrategyResponse {
  strategy: string;
  trades: number;
  winRate: number;
  pnl: number;
  avgPnl: number;
  aceVersion: string;
  active: boolean;
}

export interface VerticalResponse {
  vertical: string;
  trades: number;
  winRate: number;
  pnl: number;
  active: boolean;
}

export interface MarketResponse {
  id: string;
  question: string;
  vertical: string;
  volume: number;
  liquidity: number;
  yesPrice: number;
  noPrice: number;
  endDate: string;
  active: boolean;
}

export interface GateResponse {
  passed: boolean;
  score: number;
  recommendation: string;
  criteria: Array<{
    name: string;
    required: string;
    actual: string;
    passed: boolean;
  }>;
}

export interface WhaleResponse {
  walletAddress: string;
  walletLabel: string;
  marketId: string;
  side: string;
  size: number;
  timestamp: string;
  whaleWinRate: number;
  confidence: number;
}

// ---------------------------------------------------------------------------
// DashboardAPI
// ---------------------------------------------------------------------------

export class DashboardAPI {
  private system: TradingSystem;
  private healthMonitorInstance: { checkAll(): Promise<HealthReport> } | null = null;
  private aceInstance: { getPromptVersion(s: string): PromptVersion } | null = null;
  private gateInstance: { evaluate(report: unknown, risk: RiskState, drift: boolean): GateResult } | null = null;
  private reviewerInstance: { analyze(trades: TradeExperience[]): unknown } | null = null;
  private whaleInstance: { getRecentSignals(): WhaleSignal[]; getWatchlist(): unknown[] } | null = null;

  constructor(system: TradingSystem) {
    this.system = system;
  }

  /** Set optional modules that are lazy-loaded */
  setHealthMonitor(monitor: { checkAll(): Promise<HealthReport> }): void {
    this.healthMonitorInstance = monitor;
  }

  setAceEvolver(ace: { getPromptVersion(s: string): PromptVersion }): void {
    this.aceInstance = ace;
  }

  setGoNoGoGate(gate: { evaluate(report: unknown, risk: RiskState, drift: boolean): GateResult }): void {
    this.gateInstance = gate;
  }

  setReviewer(reviewer: { analyze(trades: TradeExperience[]): unknown }): void {
    this.reviewerInstance = reviewer;
  }

  setWhaleTracker(tracker: { getRecentSignals(): WhaleSignal[]; getWatchlist(): unknown[] }): void {
    this.whaleInstance = tracker;
  }

  // -----------------------------------------------------------------------
  // API Methods
  // -----------------------------------------------------------------------

  getStatus(): StatusResponse {
    try {
      const risk = this.system.risk.getState();
      const stats = this.system.store.getStats();
      const paper = this.system.paper.getStatus();
      const healthy = this.system.drift.isHealthy();

      return {
        mode: paper.mode,
        uptime: Date.now() - paper.startedAt.getTime(),
        startedAt: paper.startedAt.toISOString(),
        daysRunning: paper.daysRunning,
        tradeCount: paper.tradeCount,
        openPositions: paper.openPositions,
        readyForLive: paper.readyForLive,
        enabledStrategies: this.system.config.enabledStrategies,
        enabledVerticals: this.system.config.enabledVerticals,
        bankroll: risk.bankroll,
        totalPnl: stats.totalPnl,
        winRate: stats.winRate,
        healthy,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        mode: 'paper',
        uptime: 0,
        startedAt: new Date().toISOString(),
        daysRunning: 0,
        tradeCount: 0,
        openPositions: 0,
        readyForLive: false,
        enabledStrategies: [],
        enabledVerticals: [],
        bankroll: 0,
        totalPnl: 0,
        winRate: 0,
        healthy: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  getPnl(period: '1d' | '7d' | '30d' | 'all' = 'all'): PnlResponse {
    try {
      const risk = this.system.risk.getState();
      const stats = this.system.store.getStats();
      const trades = this.system.store.getRecent(10000);

      // Build daily series
      const settled = trades.filter(t => t.outcome !== 'PENDING');
      const dailyMap = new Map<string, number>();
      for (const t of settled) {
        const date = new Date(t.timestamp).toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) ?? 0) + t.pnl);
      }

      const sortedDates = [...dailyMap.keys()].sort();
      let cumulative = 0;
      let allSeries = sortedDates.map(date => {
        const pnl = Math.round((dailyMap.get(date) ?? 0) * 100) / 100;
        cumulative = Math.round((cumulative + pnl) * 100) / 100;
        return { date, pnl, cumulative };
      });

      // Filter by period
      if (period !== 'all' && allSeries.length > 0) {
        const now = Date.now();
        const daysMap: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30 };
        const cutoff = now - (daysMap[period] ?? 9999) * 86_400_000;
        const cutoffDate = new Date(cutoff).toISOString().split('T')[0];
        allSeries = allSeries.filter(s => s.date >= cutoffDate);
      }

      return {
        totalPnl: stats.totalPnl,
        dailyPnl: risk.dailyPnl,
        weeklyPnl: risk.weeklyPnl,
        winRate: stats.winRate,
        totalTrades: stats.total,
        wins: stats.wins,
        losses: stats.losses,
        pending: stats.pending,
        avgPnl: stats.avgPnl,
        dailySeries: allSeries,
      };
    } catch {
      return {
        totalPnl: 0, dailyPnl: 0, weeklyPnl: 0, winRate: 0,
        totalTrades: 0, wins: 0, losses: 0, pending: 0, avgPnl: 0,
        dailySeries: [],
      };
    }
  }

  getPositions(): PositionResponse[] {
    try {
      const positions = this.system.paper.getOpenPositions();
      return positions.map(p => ({
        marketId: p.marketId,
        side: p.side,
        size: p.size,
        entryPrice: p.entryPrice,
        enteredAt: p.enteredAt.toISOString(),
        age: Date.now() - p.enteredAt.getTime(),
      }));
    } catch {
      return [];
    }
  }

  getTrades(limit = 50, offset = 0): { trades: TradeResponse[]; total: number } {
    try {
      const all = this.system.store.getRecent(10000);
      const total = all.length;
      const sliced = all.slice(offset, offset + limit);

      return {
        total,
        trades: sliced.map(t => ({
          id: t.id,
          timestamp: new Date(t.timestamp).toISOString(),
          marketId: t.marketId,
          marketQuestion: t.marketQuestion,
          vertical: t.vertical,
          strategy: t.strategy,
          side: t.side,
          positionSize: t.positionSize,
          entryPrice: t.entryPrice,
          exitPrice: t.exitPrice,
          pnl: t.pnl,
          outcome: t.outcome,
        })),
      };
    } catch {
      return { trades: [], total: 0 };
    }
  }

  getRisk(): RiskResponse {
    try {
      const state = this.system.risk.getState();
      const limits = this.system.config.riskLimits;
      const utilization = state.bankroll > 0 ? state.totalExposure / state.bankroll : 0;

      return {
        bankroll: state.bankroll,
        dailyPnl: state.dailyPnl,
        weeklyPnl: state.weeklyPnl,
        openPositions: state.openPositions,
        totalExposure: state.totalExposure,
        circuitBreakerTripped: state.circuitBreakerTripped,
        circuitBreakerReason: state.circuitBreakerReason,
        lastUpdated: state.lastUpdated.toISOString(),
        limits: {
          maxPositionSize: limits.maxPositionSize,
          maxBankrollPercent: limits.maxBankrollPercent,
          kellyFraction: limits.kellyFraction,
          dailyLossLimit: limits.dailyLossLimit,
          weeklyLossLimit: limits.weeklyLossLimit,
          minEdge: limits.minEdge,
          maxOpenPositions: limits.maxOpenPositions,
        },
        utilization,
        dailyPnlPercent: state.bankroll > 0 ? state.dailyPnl / state.bankroll : 0,
        weeklyPnlPercent: state.bankroll > 0 ? state.weeklyPnl / state.bankroll : 0,
      };
    } catch {
      return {
        bankroll: 0, dailyPnl: 0, weeklyPnl: 0, openPositions: 0,
        totalExposure: 0, circuitBreakerTripped: false, lastUpdated: new Date().toISOString(),
        limits: {
          maxPositionSize: 0, maxBankrollPercent: 0, kellyFraction: 0,
          dailyLossLimit: 0, weeklyLossLimit: 0, minEdge: 0, maxOpenPositions: 0,
        },
        utilization: 0, dailyPnlPercent: 0, weeklyPnlPercent: 0,
      };
    }
  }

  async getHealth(): Promise<HealthResponse> {
    try {
      if (!this.healthMonitorInstance) {
        const { HealthMonitor } = await import('../engine/health-monitor.js');
        this.healthMonitorInstance = new HealthMonitor();
      }
      const report = await this.healthMonitorInstance.checkAll();
      return {
        overall: report.overall,
        timestamp: report.timestamp.toISOString(),
        checks: report.checks.map(c => ({
          name: c.name,
          status: c.status,
          value: c.value,
          threshold: c.threshold,
          message: c.message,
        })),
      };
    } catch {
      return {
        overall: 'critical',
        timestamp: new Date().toISOString(),
        checks: [{ name: 'health-module', status: 'fail', message: 'Health module unavailable' }],
      };
    }
  }

  getDrift(): DriftResponse {
    try {
      const report = this.system.drift.getReport();
      const m = report.metrics;
      return {
        baselineEstablished: report.baselineEstablished,
        totalTrades: report.totalTrades,
        healthy: this.system.drift.isHealthy(),
        metrics: {
          winRate: { ...m.winRate },
          evPerTrade: { ...m.evPerTrade },
          edgeAccuracy: { ...m.edgeAccuracy },
          executionQuality: { ...m.executionQuality },
        },
      };
    } catch {
      const empty: MetricSnapshot = {
        current: 0, baseline: 0, zScore: 0, trend: 'stable', sampleSize: 0, alertTriggered: false,
      };
      return {
        baselineEstablished: false, totalTrades: 0, healthy: true,
        metrics: { winRate: { ...empty }, evPerTrade: { ...empty }, edgeAccuracy: { ...empty }, executionQuality: { ...empty } },
      };
    }
  }

  getStrategies(): StrategyResponse[] {
    try {
      const stats = this.system.store.getStats();
      const enabled = this.system.config.enabledStrategies;

      return Object.entries(stats.byStrategy).map(([strategy, data]) => {
        let aceVersion = '1.0';
        if (this.aceInstance) {
          try {
            aceVersion = this.aceInstance.getPromptVersion(strategy as never).version;
          } catch { /* ignore */ }
        }
        return {
          strategy,
          trades: data.count,
          winRate: data.winRate,
          pnl: data.pnl,
          avgPnl: data.count > 0 ? data.pnl / data.count : 0,
          aceVersion: `v${aceVersion}`,
          active: enabled.includes(strategy as never),
        };
      });
    } catch {
      return [];
    }
  }

  getVerticals(): VerticalResponse[] {
    try {
      const stats = this.system.store.getStats();
      const enabled = this.system.config.enabledVerticals;

      return Object.entries(stats.byVertical).map(([vertical, data]) => ({
        vertical,
        trades: data.count,
        winRate: data.winRate,
        pnl: data.pnl,
        active: enabled.includes(vertical as never),
      }));
    } catch {
      return [];
    }
  }

  async getMarkets(query?: string): Promise<MarketResponse[]> {
    try {
      let markets;
      if (query) {
        markets = await this.system.client.searchMarkets(query);
      } else {
        markets = await this.system.client.getMarkets({ active: true, limit: 20 });
      }

      return markets.map(m => ({
        id: m.id,
        question: m.question,
        vertical: m.vertical,
        volume: m.volume,
        liquidity: m.liquidity,
        yesPrice: m.tokens.yes.price,
        noPrice: m.tokens.no.price,
        endDate: m.endDate,
        active: m.active,
      }));
    } catch {
      return [];
    }
  }

  async getGate(): Promise<GateResponse> {
    try {
      // Lazy-load modules
      if (!this.gateInstance) {
        const { GoNoGoGate } = await import('../engine/go-nogo-gate.js');
        this.gateInstance = new GoNoGoGate();
      }
      if (!this.reviewerInstance) {
        const { PaperTradingReviewer } = await import('../engine/paper-review.js');
        this.reviewerInstance = new PaperTradingReviewer();
      }

      const trades = this.system.store.getRecent(10000);
      const report = this.reviewerInstance.analyze(trades) as Parameters<typeof this.gateInstance.evaluate>[0];
      const riskState = this.system.risk.getState();
      const driftHealthy = this.system.drift.isHealthy();
      const result = this.gateInstance.evaluate(report, riskState, driftHealthy);

      return {
        passed: result.passed,
        score: result.score,
        recommendation: result.recommendation,
        criteria: result.criteria.map(c => ({
          name: c.name,
          required: String(c.required),
          actual: String(c.actual),
          passed: c.passed,
        })),
      };
    } catch {
      return {
        passed: false,
        score: 0,
        recommendation: 'NO_GO',
        criteria: [{ name: 'gate-module', required: 'available', actual: 'unavailable', passed: false }],
      };
    }
  }

  getWhales(): WhaleResponse[] {
    try {
      if (!this.whaleInstance) return [];
      const signals = this.whaleInstance.getRecentSignals();
      return signals.map(s => ({
        walletAddress: s.walletAddress,
        walletLabel: s.walletLabel,
        marketId: s.marketId,
        side: s.side,
        size: s.size,
        timestamp: s.timestamp.toISOString(),
        whaleWinRate: s.whaleWinRate,
        confidence: s.confidence,
      }));
    } catch {
      return [];
    }
  }
}
