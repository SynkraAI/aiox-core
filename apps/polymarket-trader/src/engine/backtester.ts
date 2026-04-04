/**
 * Backtesting Framework: Replays historical market data through strategies
 * to validate them before paper/live trading.
 *
 * Phase 1.7 — offline simulation engine with Kelly sizing,
 * slippage modeling, fee deduction, and performance metrics.
 */

import type { Market, Side, StrategyId, TradeSignal, Vertical } from '../types/market.js';
import type { RiskLimits, KellyResult } from '../types/trading.js';
import { DEFAULT_RISK_LIMITS } from '../config/defaults.js';

// ---------------------------------------------------------------------------
// Public interfaces
// ---------------------------------------------------------------------------

export interface HistoricalMarket {
  market: Market;
  priceHistory: Array<{ timestamp: Date; price: number }>;
  outcome: 'YES' | 'NO';
  resolutionDate: Date;
}

export type StrategyFn = (
  market: Market,
  currentPrice: number,
  daysToResolution: number,
) => TradeSignal | null;

export interface BacktestTrade {
  marketId: string;
  vertical: Vertical;
  side: Side;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  edge: number;
  correct: boolean;
}

export interface BacktestResult {
  strategyId: StrategyId;
  period: { start: Date; end: Date };
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  avgEdge: number;
  trades: BacktestTrade[];
}

export interface BacktestConfig {
  /** Initial bankroll for position sizing (USD). */
  bankroll: number;
  /** Risk limits forwarded to the internal Kelly calculator. */
  riskLimits: RiskLimits;
  /** Taker fee as a fraction (0.01 = 1%). */
  takerFee: number;
  /** Slippage range [min, max] as fractions (e.g. [0.005, 0.02]). */
  slippageRange: [number, number];
  /** Deterministic seed for slippage. When set, slippage is the midpoint of the range. */
  deterministicSlippage: boolean;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_BACKTEST_CONFIG: BacktestConfig = {
  bankroll: 500,
  riskLimits: DEFAULT_RISK_LIMITS,
  takerFee: 0.01,
  slippageRange: [0.005, 0.02],
  deterministicSlippage: false,
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Milliseconds in one day. */
const MS_PER_DAY = 86_400_000;

/** Annualization factor (trading days per year). */
const ANNUALIZATION_FACTOR = Math.sqrt(252);

export function calculateMaxDrawdown(pnlSeries: number[]): number {
  if (pnlSeries.length === 0) return 0;

  let peak = 0;
  let cumulative = 0;
  let maxDd = 0;

  for (const pnl of pnlSeries) {
    cumulative += pnl;
    if (cumulative > peak) {
      peak = cumulative;
    }
    const dd = peak - cumulative;
    if (dd > maxDd) {
      maxDd = dd;
    }
  }

  return maxDd;
}

export function calculateSharpeRatio(returns: number[]): number {
  if (returns.length < 2) return 0;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (returns.length - 1);
  const std = Math.sqrt(variance);

  if (std === 0) return mean > 0 ? Infinity : mean < 0 ? -Infinity : 0;

  return (mean / std) * ANNUALIZATION_FACTOR;
}

export function calculateProfitFactor(trades: BacktestTrade[]): number {
  let grossProfit = 0;
  let grossLoss = 0;

  for (const t of trades) {
    if (t.pnl > 0) grossProfit += t.pnl;
    else if (t.pnl < 0) grossLoss += Math.abs(t.pnl);
  }

  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

/**
 * Standalone Kelly calculator (same formula as RiskEngine but
 * without eventBus dependency so the backtester stays offline).
 */
export function calculateKelly(
  modelProbability: number,
  marketPrice: number,
  bankroll: number,
  limits: RiskLimits,
): KellyResult {
  const edge = modelProbability - marketPrice;

  if (edge <= 0) {
    return { optimalFraction: 0, adjustedFraction: 0, suggestedSize: 0, edge, probability: modelProbability };
  }

  const optimalFraction = edge / (1 - marketPrice);
  const adjustedFraction = optimalFraction * limits.kellyFraction;
  const suggestedSize = Math.min(
    bankroll * adjustedFraction,
    limits.maxPositionSize,
    bankroll * limits.maxBankrollPercent,
  );

  return {
    optimalFraction,
    adjustedFraction,
    suggestedSize: Math.max(0, Math.round(suggestedSize * 100) / 100),
    edge,
    probability: modelProbability,
  };
}

// ---------------------------------------------------------------------------
// Backtester
// ---------------------------------------------------------------------------

export class Backtester {
  private readonly config: BacktestConfig;

  constructor(config: Partial<BacktestConfig> = {}) {
    this.config = { ...DEFAULT_BACKTEST_CONFIG, ...config };
  }

  /**
   * Run a full backtest across a set of historical markets.
   */
  run(
    strategyId: StrategyId,
    strategyFn: StrategyFn,
    historicalMarkets: HistoricalMarket[],
  ): BacktestResult {
    const trades: BacktestTrade[] = [];
    let bankroll = this.config.bankroll;

    for (const hm of historicalMarkets) {
      const marketTrades = this.simulateMarket(hm, strategyFn, bankroll);
      for (const trade of marketTrades) {
        trades.push(trade);
        bankroll += trade.pnl;
      }
    }

    return this.buildResult(strategyId, trades, historicalMarkets);
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private simulateMarket(
    hm: HistoricalMarket,
    strategyFn: StrategyFn,
    bankroll: number,
  ): BacktestTrade[] {
    const trades: BacktestTrade[] = [];

    // Sort price history chronologically (defensive copy).
    const sortedPrices = [...hm.priceHistory].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    for (const snapshot of sortedPrices) {
      const daysToResolution =
        (hm.resolutionDate.getTime() - snapshot.timestamp.getTime()) / MS_PER_DAY;

      if (daysToResolution <= 0) continue;

      const signal = strategyFn(hm.market, snapshot.price, daysToResolution);
      if (!signal) continue;

      // Kelly position sizing.
      const kelly = calculateKelly(
        signal.modelProbability,
        signal.marketProbability,
        bankroll,
        this.config.riskLimits,
      );

      if (kelly.suggestedSize < 1) continue;

      // Simulate slippage on entry price.
      const slippage = this.getSlippage();
      const entryPrice = Math.min(signal.side === 'YES'
        ? snapshot.price * (1 + slippage)
        : snapshot.price * (1 - slippage), 0.99);
      const clampedEntry = Math.max(0.01, entryPrice);

      // Resolution: 1.0 if prediction matches outcome, 0.0 otherwise.
      const correct = signal.side === hm.outcome;
      const exitPrice = correct ? 1.0 : 0.0;

      // P&L: (exit - entry) * size - fees.
      const rawPnl = (exitPrice - clampedEntry) * kelly.suggestedSize;
      const fee = kelly.suggestedSize * this.config.takerFee;
      const pnl = Math.round((rawPnl - fee) * 100) / 100;

      trades.push({
        marketId: hm.market.id,
        vertical: hm.market.vertical,
        side: signal.side,
        entryPrice: clampedEntry,
        exitPrice,
        size: kelly.suggestedSize,
        pnl,
        edge: signal.edge,
        correct,
      });

      // Only one trade per market per walk-through.
      break;
    }

    return trades;
  }

  private getSlippage(): number {
    const [min, max] = this.config.slippageRange;
    if (this.config.deterministicSlippage) {
      return (min + max) / 2;
    }
    return min + Math.random() * (max - min);
  }

  private buildResult(
    strategyId: StrategyId,
    trades: BacktestTrade[],
    historicalMarkets: HistoricalMarket[],
  ): BacktestResult {
    const wins = trades.filter((t) => t.correct).length;
    const losses = trades.length - wins;
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const pnlSeries = trades.map((t) => t.pnl);
    const returns = trades.map((t) => (t.size > 0 ? t.pnl / t.size : 0));

    // Period boundaries.
    let start = new Date();
    let end = new Date(0);
    for (const hm of historicalMarkets) {
      if (hm.priceHistory.length > 0) {
        const first = hm.priceHistory[0].timestamp;
        const last = hm.resolutionDate;
        if (first < start) start = first;
        if (last > end) end = last;
      }
    }

    return {
      strategyId,
      period: { start, end },
      totalTrades: trades.length,
      wins,
      losses,
      winRate: trades.length > 0 ? wins / trades.length : 0,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgPnl: trades.length > 0 ? Math.round((totalPnl / trades.length) * 100) / 100 : 0,
      maxDrawdown: Math.round(calculateMaxDrawdown(pnlSeries) * 100) / 100,
      sharpeRatio: Math.round(calculateSharpeRatio(returns) * 100) / 100,
      profitFactor: Math.round(calculateProfitFactor(trades) * 100) / 100,
      avgEdge:
        trades.length > 0
          ? Math.round((trades.reduce((s, t) => s + t.edge, 0) / trades.length) * 10000) / 10000
          : 0,
      trades,
    };
  }
}
