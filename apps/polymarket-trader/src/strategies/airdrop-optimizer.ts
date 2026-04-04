/**
 * Airdrop Volume Optimization Strategy for Polymarket.
 *
 * Maximizes trading volume to qualify for potential $POLY airdrop
 * while staying within strict risk bounds.
 *
 * Strategy ID: 'airdrop_volume'
 *
 * Approach:
 *   1. Identify low-risk, high-volume opportunities (tight spreads, liquid markets)
 *   2. Market making: place limit orders on both sides of liquid markets
 *   3. Quick flip: buy and sell with minimal holding time on tight-spread markets
 *   4. Volume boost: small volume-generating trades when no strong conviction signals
 *
 * Risk constraints:
 *   - Max daily volume budget: 10% of bankroll for airdrop-specific trades
 *   - Only trade markets with spread < 3% (low cost)
 *   - Max loss per airdrop trade: $1 (essentially fee-only cost)
 *   - Circuit breakers still apply
 *   - All trades tagged as strategy='airdrop_volume' in ExperienceStore
 */

import { eventBus } from '../engine/event-bus.js';
import type { Market, TradeSignal } from '../types/market.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum spread (YES + NO deviation from $1.00) for airdrop trades. */
export const MAX_SPREAD = 0.03;

/** Maximum allowed loss per airdrop trade (USD). */
export const MAX_LOSS_PER_TRADE = 1.0;

/** Daily volume budget as fraction of bankroll. */
export const DAILY_VOLUME_BUDGET_PERCENT = 0.10;

/** Minimum 24h volume for a market to be considered. */
export const MIN_24H_VOLUME = 10_000;

/** Minimum liquidity for a market to be considered. */
export const MIN_LIQUIDITY = 5_000;

/** Taker fee rate (1% per side). */
export const TAKER_FEE_RATE = 0.01;

/** Round-trip fee rate (buy + sell). */
export const ROUND_TRIP_FEE_RATE = TAKER_FEE_RATE * 2;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AirdropOpportunity {
  marketId: string;
  question: string;
  spread: number;
  volume24h: number;
  expectedCost: number;
  volumeGenerated: number;
  efficiency: number;
}

export interface VolumeTarget {
  dailyBudget: number;
  maxTradesPerDay: number;
  targetVolumePerTrade: number;
  totalTargetVolume: number;
}

export interface VolumeStats {
  totalVolume: number;
  estimatedRank: string;
  dailyAvg: number;
  tradeCount: number;
  totalCost: number;
}

export interface AirdropOptimizerConfig {
  /** Max spread to consider (decimal). Default: 0.03. */
  maxSpread: number;
  /** Max loss per trade (USD). Default: 1.0. */
  maxLossPerTrade: number;
  /** Daily volume budget as fraction of bankroll. Default: 0.10. */
  dailyBudgetPercent: number;
  /** Min 24h market volume. Default: 10000. */
  minVolume24h: number;
  /** Min market liquidity. Default: 5000. */
  minLiquidity: number;
}

const DEFAULT_AIRDROP_CONFIG: AirdropOptimizerConfig = {
  maxSpread: MAX_SPREAD,
  maxLossPerTrade: MAX_LOSS_PER_TRADE,
  dailyBudgetPercent: DAILY_VOLUME_BUDGET_PERCENT,
  minVolume24h: MIN_24H_VOLUME,
  minLiquidity: MIN_LIQUIDITY,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate the spread of a market (deviation of YES + NO from $1.00).
 * A tight spread (close to 0) means low cost for a round-trip trade.
 */
export function calculateSpread(yesPrice: number, noPrice: number): number {
  return Math.abs((yesPrice + noPrice) - 1.0);
}

/**
 * Calculate the expected cost of a round-trip trade (buy + sell).
 * Cost = spread loss + fees on both legs.
 */
export function calculateRoundTripCost(tradeSize: number, spread: number): number {
  const spreadCost = tradeSize * spread;
  const fees = tradeSize * ROUND_TRIP_FEE_RATE;
  return Math.round((spreadCost + fees) * 100) / 100;
}

/**
 * Calculate efficiency: volume generated per dollar of cost.
 * Higher is better -- we want maximum volume for minimum expense.
 */
export function calculateEfficiency(volumeGenerated: number, cost: number): number {
  if (cost <= 0) return 0;
  return Math.round((volumeGenerated / cost) * 100) / 100;
}

/**
 * Estimate airdrop rank based on total volume.
 * These are rough estimates based on Polymarket activity data.
 */
export function estimateRank(totalVolume: number): string {
  if (totalVolume >= 100_000) return 'top-100';
  if (totalVolume >= 50_000) return 'top-500';
  if (totalVolume >= 10_000) return 'top-2000';
  if (totalVolume >= 1_000) return 'top-10000';
  return 'unranked';
}

// ---------------------------------------------------------------------------
// AirdropOptimizer
// ---------------------------------------------------------------------------

export class AirdropOptimizer {
  readonly strategyId = 'airdrop_volume' as const;
  private readonly config: AirdropOptimizerConfig;
  private volumeHistory: Array<{ date: string; volume: number; cost: number; trades: number }> = [];
  private todayVolume = 0;
  private todayCost = 0;
  private todayTrades = 0;
  private currentDate: string = new Date().toISOString().slice(0, 10);

  constructor(config?: Partial<AirdropOptimizerConfig>) {
    this.config = { ...DEFAULT_AIRDROP_CONFIG, ...config };
  }

  // ─── Opportunity Finding ─────────────────────────────

  /**
   * Find airdrop volume opportunities from a list of markets.
   * Filters by: active, spread, volume, liquidity.
   * Returns sorted by efficiency (best first).
   */
  findVolumeOpportunities(markets: Market[]): AirdropOpportunity[] {
    const opportunities: AirdropOpportunity[] = [];

    for (const market of markets) {
      if (!market.active || market.closed) continue;

      const spread = calculateSpread(market.tokens.yes.price, market.tokens.no.price);

      // Filter: spread must be tight
      if (spread > this.config.maxSpread) continue;

      // Filter: minimum 24h volume
      if (market.volume < this.config.minVolume24h) continue;

      // Filter: minimum liquidity
      if (market.liquidity < this.config.minLiquidity) continue;

      // Calculate opportunity metrics
      // For a $100 round-trip trade
      const tradeSize = 100;
      const expectedCost = calculateRoundTripCost(tradeSize, spread);
      const volumeGenerated = tradeSize * 2; // Both buy and sell count as volume
      const efficiency = calculateEfficiency(volumeGenerated, expectedCost);

      // Filter: cost must not exceed max loss per trade (scaled to $100)
      // We'll scale down trade size to keep within max loss
      if (expectedCost > this.config.maxLossPerTrade * 100) continue;

      opportunities.push({
        marketId: market.id,
        question: market.question,
        spread,
        volume24h: market.volume,
        expectedCost,
        volumeGenerated,
        efficiency,
      });
    }

    // Sort by efficiency descending
    opportunities.sort((a, b) => b.efficiency - a.efficiency);

    return opportunities;
  }

  // ─── Volume Targeting ────────────────────────────────

  /**
   * Calculate optimal volume targets based on bankroll and risk budget.
   */
  calculateOptimalVolume(bankroll: number, riskBudget?: number): VolumeTarget {
    const dailyBudget = riskBudget ?? bankroll * this.config.dailyBudgetPercent;

    // With tight spreads (~1%) and 2% round-trip fee, each $1 of budget
    // generates roughly $30-50 of volume. We estimate conservatively.
    const costPerTrade = this.config.maxLossPerTrade;
    const maxTradesPerDay = Math.floor(dailyBudget / costPerTrade);

    // Each trade generates ~2x its size in volume (buy + sell)
    // Target trade size: keep cost under maxLossPerTrade
    // cost = size * (spread + round_trip_fee) ~ size * 0.05 for typical market
    // So size = maxLossPerTrade / 0.05 = $20 for $1 max loss
    const estimatedCostRate = 0.05; // spread + fees on tight markets
    const targetVolumePerTrade = Math.round(
      (costPerTrade / estimatedCostRate) * 2 * 100
    ) / 100;

    const totalTargetVolume = Math.round(maxTradesPerDay * targetVolumePerTrade * 100) / 100;

    return {
      dailyBudget: Math.round(dailyBudget * 100) / 100,
      maxTradesPerDay,
      targetVolumePerTrade,
      totalTargetVolume,
    };
  }

  // ─── Signal Generation ───────────────────────────────

  /**
   * Generate trade signals from airdrop opportunities.
   * Respects daily budget and max loss constraints.
   *
   * @param opportunities - Ranked list of opportunities.
   * @param bankroll - Current bankroll for budget calculation.
   */
  generateVolumeSignals(opportunities: AirdropOpportunity[], bankroll: number): TradeSignal[] {
    const signals: TradeSignal[] = [];
    const dailyBudget = bankroll * this.config.dailyBudgetPercent;
    let remainingBudget = dailyBudget - this.todayCost;

    if (remainingBudget <= 0) return [];

    for (const opp of opportunities) {
      if (remainingBudget <= 0) break;

      // Scale trade size so cost stays within maxLossPerTrade
      const costRate = opp.spread + ROUND_TRIP_FEE_RATE;
      const maxSize = costRate > 0
        ? Math.floor(this.config.maxLossPerTrade / costRate)
        : 0;

      if (maxSize < 1) continue;

      const tradeCost = calculateRoundTripCost(maxSize, opp.spread);
      if (tradeCost > remainingBudget) continue;

      const signal: TradeSignal = {
        marketId: opp.marketId,
        vertical: 'crypto', // Airdrop trades are vertical-agnostic
        strategy: this.strategyId,
        side: 'YES', // Buy YES for volume; will pair with NO sell
        modelProbability: 0.5, // No directional view
        marketProbability: 0.5,
        edge: 0, // No edge expected -- volume play
        confidence: opp.efficiency / 1000, // Normalized efficiency as confidence
        suggestedSize: maxSize,
        reasoning: `Airdrop volume: ${opp.question.slice(0, 60)}... ` +
          `Spread ${(opp.spread * 100).toFixed(1)}%, ` +
          `efficiency ${opp.efficiency.toFixed(0)} vol/$, ` +
          `cost ~$${tradeCost.toFixed(2)}.`,
        timestamp: new Date(),
      };

      signals.push(signal);
      remainingBudget -= tradeCost;

      eventBus.emit('signal:detected', {
        ...signal,
        strategy: 'airdrop_volume',
      });
    }

    return signals;
  }

  // ─── Volume Tracking ─────────────────────────────────

  /**
   * Record volume from an executed airdrop trade.
   * Call this after a trade is executed to track daily stats.
   */
  recordVolume(volume: number, cost: number): void {
    this.rollDateIfNeeded();
    this.todayVolume += volume;
    this.todayCost += cost;
    this.todayTrades += 1;
  }

  /**
   * Get aggregate volume statistics.
   */
  getVolumeStats(): VolumeStats {
    this.rollDateIfNeeded();

    // Include today's stats
    const allDays = [
      ...this.volumeHistory,
      { date: this.currentDate, volume: this.todayVolume, cost: this.todayCost, trades: this.todayTrades },
    ];

    const totalVolume = allDays.reduce((sum, d) => sum + d.volume, 0);
    const totalCost = allDays.reduce((sum, d) => sum + d.cost, 0);
    const tradeCount = allDays.reduce((sum, d) => sum + d.trades, 0);
    const daysTracked = allDays.length || 1;

    return {
      totalVolume: Math.round(totalVolume * 100) / 100,
      estimatedRank: estimateRank(totalVolume),
      dailyAvg: Math.round((totalVolume / daysTracked) * 100) / 100,
      tradeCount,
      totalCost: Math.round(totalCost * 100) / 100,
    };
  }

  /**
   * Get today's remaining budget.
   */
  getRemainingBudget(bankroll: number): number {
    this.rollDateIfNeeded();
    const dailyBudget = bankroll * this.config.dailyBudgetPercent;
    return Math.max(0, Math.round((dailyBudget - this.todayCost) * 100) / 100);
  }

  // ─── Internal ────────────────────────────────────────

  /**
   * Roll over to a new day if the date has changed.
   */
  private rollDateIfNeeded(): void {
    const today = new Date().toISOString().slice(0, 10);
    if (today !== this.currentDate) {
      // Archive yesterday's stats
      if (this.todayVolume > 0 || this.todayTrades > 0) {
        this.volumeHistory.push({
          date: this.currentDate,
          volume: this.todayVolume,
          cost: this.todayCost,
          trades: this.todayTrades,
        });
      }
      this.currentDate = today;
      this.todayVolume = 0;
      this.todayCost = 0;
      this.todayTrades = 0;
    }
  }

  getConfig(): Readonly<AirdropOptimizerConfig> {
    return { ...this.config };
  }
}
