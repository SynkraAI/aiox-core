/**
 * Whale Following Strategy for Polymarket.
 *
 * Monitors large/profitable wallets on Polymarket and generates
 * copy-trade signals when whales open significant positions.
 *
 * Strategy ID: 'whale_follow'
 *
 * Data sources:
 *   - Polymarket Gamma API: /users/{address}/positions and /users/{address}/history
 *   - On-chain: CTF contract events (position changes via event logs)
 *   - Fallback: Polymarket leaderboard API for top traders
 *
 * Safety:
 *   - Configurable delay (5-15 min) to avoid front-running detection
 *   - Max follow size: min(10% of whale's position, $50)
 *   - Only follows wallets with WR > 55% over 50+ trades
 *   - Skips if whale is averaging down on a losing position
 *   - Skips if market volume < $10K
 */

import { POLYMARKET_API } from '../config/defaults.js';
import { eventBus } from '../engine/event-bus.js';
import type { Market, TradeSignal, Side, Vertical } from '../types/market.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum position size (USD) to trigger a whale signal. */
export const MIN_WHALE_POSITION_SIZE = 500;

/** Minimum win rate (decimal) for a wallet to be followed. */
export const MIN_WIN_RATE = 0.55;

/** Minimum number of resolved trades for a wallet to qualify. */
export const MIN_TRADES_FOR_QUALIFICATION = 50;

/** Default follow delay range in milliseconds. */
export const DEFAULT_FOLLOW_DELAY_MS = { min: 5 * 60_000, max: 15 * 60_000 };

/** Max follow size relative to whale's position (10%). */
export const MAX_FOLLOW_PERCENT = 0.10;

/** Absolute max follow size in USD. */
export const MAX_FOLLOW_SIZE_USD = 50;

/** Minimum market volume to follow (USD). */
export const MIN_MARKET_VOLUME = 10_000;

/** Penalty for crowded trade (many whales on same side). */
export const CROWD_PENALTY = 0.15;

/** Boost for whale with vertical-specific edge. */
export const VERTICAL_BOOST = 0.10;

/** Penalty for position smaller than whale's typical size. */
export const SMALL_POSITION_PENALTY = 0.10;

/** Threshold for what counts as "typical" -- position must be at least 50% of avg. */
export const TYPICAL_SIZE_THRESHOLD = 0.50;

/** Maximum wallets on same side of same market before crowding penalty. */
export const CROWD_THRESHOLD = 2;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WalletInfo {
  address: string;
  label: string;
  addedAt: Date;
}

export interface WhaleStats {
  address: string;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgPositionSize: number;
  /** Win rate by vertical, if tracked. */
  verticalEdge: Record<string, number>;
}

export interface WhaleActivity {
  walletAddress: string;
  marketId: string;
  side: Side;
  size: number;
  price: number;
  timestamp: Date;
  isNewPosition: boolean;
  isAveragingDown: boolean;
}

export interface WhaleSignal {
  walletAddress: string;
  walletLabel: string;
  marketId: string;
  side: Side;
  size: number;
  timestamp: Date;
  whaleWinRate: number;
  confidence: number;
}

export interface WhaleTrackerConfig {
  /** Min position size to consider (USD). Default: 500. */
  minPositionSize: number;
  /** Min win rate to follow. Default: 0.55. */
  minWinRate: number;
  /** Min resolved trades for qualification. Default: 50. */
  minTrades: number;
  /** Follow delay range in ms. Default: {min: 300000, max: 900000}. */
  followDelayMs: { min: number; max: number };
  /** Max follow size as fraction of whale's position. Default: 0.10. */
  maxFollowPercent: number;
  /** Absolute max follow size USD. Default: 50. */
  maxFollowSizeUsd: number;
  /** Minimum market volume. Default: 10000. */
  minMarketVolume: number;
  /** Request timeout in ms. Default: 10000. */
  requestTimeoutMs: number;
}

const DEFAULT_WHALE_CONFIG: WhaleTrackerConfig = {
  minPositionSize: MIN_WHALE_POSITION_SIZE,
  minWinRate: MIN_WIN_RATE,
  minTrades: MIN_TRADES_FOR_QUALIFICATION,
  followDelayMs: DEFAULT_FOLLOW_DELAY_MS,
  maxFollowPercent: MAX_FOLLOW_PERCENT,
  maxFollowSizeUsd: MAX_FOLLOW_SIZE_USD,
  minMarketVolume: MIN_MARKET_VOLUME,
  requestTimeoutMs: 10_000,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detect vertical from market question text.
 * Mirrors the logic in polymarket-client.ts.
 */
function detectVertical(question: string): Vertical {
  const q = question.toLowerCase();
  if (q.includes('temperature') || q.includes('weather') || q.includes('f') || q.includes('c')) return 'weather';
  if (q.includes('bitcoin') || q.includes('ethereum') || q.includes('crypto') || q.includes('btc') || q.includes('eth')) return 'crypto';
  if (q.includes('election') || q.includes('president') || q.includes('congress') || q.includes('vote')) return 'politics';
  if (q.includes('nba') || q.includes('nfl') || q.includes('mlb') || q.includes('game')) return 'sports';
  return 'crypto';
}

/**
 * Calculate follow delay within configured range.
 * Deterministic for testing when seed is provided, random otherwise.
 */
export function calculateFollowDelay(min: number, max: number, randomValue?: number): number {
  const r = randomValue ?? Math.random();
  return Math.round(min + r * (max - min));
}

/**
 * Calculate maximum follow size: min(whale position * maxFollowPercent, maxFollowSizeUsd).
 */
export function calculateFollowSize(whaleSize: number, maxFollowPercent: number, maxFollowSizeUsd: number): number {
  const proportional = whaleSize * maxFollowPercent;
  return Math.round(Math.min(proportional, maxFollowSizeUsd) * 100) / 100;
}

/**
 * Calculate confidence for a whale signal.
 *
 * Base: whale's historical win rate.
 * +10% if whale has edge in the specific vertical.
 * -15% if many whales are on the same side (crowded trade).
 * -10% if position size is small relative to whale's typical size.
 */
export function calculateWhaleConfidence(params: {
  winRate: number;
  hasVerticalEdge: boolean;
  isCrowded: boolean;
  isSmallForWhale: boolean;
}): number {
  let confidence = params.winRate;
  if (params.hasVerticalEdge) confidence += VERTICAL_BOOST;
  if (params.isCrowded) confidence -= CROWD_PENALTY;
  if (params.isSmallForWhale) confidence -= SMALL_POSITION_PENALTY;
  return Math.max(0, Math.min(1, Math.round(confidence * 1000) / 1000));
}

// ---------------------------------------------------------------------------
// WhaleTracker
// ---------------------------------------------------------------------------

export class WhaleTracker {
  readonly strategyId = 'whale_follow' as const;
  private readonly config: WhaleTrackerConfig;
  private watchlist: Map<string, WalletInfo> = new Map();
  private statsCache: Map<string, WhaleStats> = new Map();
  private recentSignals: WhaleSignal[] = [];

  constructor(config?: Partial<WhaleTrackerConfig>) {
    this.config = { ...DEFAULT_WHALE_CONFIG, ...config };
  }

  // ─── Watchlist Management ────────────────────────────

  addWallet(address: string, label: string): void {
    const normalized = address.toLowerCase();
    if (this.watchlist.has(normalized)) return;
    this.watchlist.set(normalized, {
      address: normalized,
      label,
      addedAt: new Date(),
    });
  }

  removeWallet(address: string): void {
    const normalized = address.toLowerCase();
    this.watchlist.delete(normalized);
    this.statsCache.delete(normalized);
  }

  getWatchlist(): WalletInfo[] {
    return Array.from(this.watchlist.values());
  }

  // ─── Stats / Performance ─────────────────────────────

  /**
   * Get cached whale performance stats.
   * Returns null if wallet is not tracked or stats not yet fetched.
   */
  getWhalePerformance(address: string): WhaleStats | null {
    return this.statsCache.get(address.toLowerCase()) ?? null;
  }

  /**
   * Set whale stats (from external data source or API fetch).
   * This allows unit tests and external callers to populate stats.
   */
  setWhaleStats(address: string, stats: WhaleStats): void {
    this.statsCache.set(address.toLowerCase(), stats);
  }

  /**
   * Fetch whale stats from Polymarket Data API.
   * Returns null on any failure -- never throws.
   */
  async fetchWhaleStats(address: string): Promise<WhaleStats | null> {
    try {
      const url = `${POLYMARKET_API.data}/users/${address}/history`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.config.requestTimeoutMs),
      });

      if (!response.ok) return null;

      const data = (await response.json()) as Array<{
        market_id: string;
        outcome: string;
        pnl: string;
        size: string;
        question?: string;
      }>;

      if (!Array.isArray(data) || data.length === 0) return null;

      let wins = 0;
      let losses = 0;
      let totalPnl = 0;
      let totalSize = 0;
      const verticalWins: Record<string, number> = {};
      const verticalTotal: Record<string, number> = {};

      for (const trade of data) {
        const pnl = parseFloat(trade.pnl || '0');
        const size = parseFloat(trade.size || '0');
        totalPnl += pnl;
        totalSize += size;

        if (pnl > 0) wins++;
        else losses++;

        const vertical = detectVertical(trade.question || '');
        verticalTotal[vertical] = (verticalTotal[vertical] || 0) + 1;
        if (pnl > 0) verticalWins[vertical] = (verticalWins[vertical] || 0) + 1;
      }

      const totalTrades = wins + losses;
      const verticalEdge: Record<string, number> = {};
      for (const v of Object.keys(verticalTotal)) {
        verticalEdge[v] = verticalTotal[v] > 0 ? (verticalWins[v] || 0) / verticalTotal[v] : 0;
      }

      const stats: WhaleStats = {
        address: address.toLowerCase(),
        totalTrades,
        wins,
        losses,
        winRate: totalTrades > 0 ? wins / totalTrades : 0,
        totalPnl,
        avgPositionSize: totalTrades > 0 ? totalSize / totalTrades : 0,
        verticalEdge,
      };

      this.statsCache.set(address.toLowerCase(), stats);
      return stats;
    } catch {
      return null;
    }
  }

  // ─── Activity Scanning ───────────────────────────────

  /**
   * Fetch recent activity for a specific wallet from the API.
   * Returns empty array on failure -- never throws.
   */
  async fetchWalletActivity(address: string): Promise<WhaleActivity[]> {
    try {
      const url = `${POLYMARKET_API.data}/users/${address}/positions`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.config.requestTimeoutMs),
      });

      if (!response.ok) return [];

      const data = (await response.json()) as Array<{
        market_id: string;
        side: string;
        size: string;
        price: string;
        timestamp: string;
        is_new?: boolean;
        is_avg_down?: boolean;
      }>;

      if (!Array.isArray(data)) return [];

      return data.map((d) => ({
        walletAddress: address.toLowerCase(),
        marketId: d.market_id || '',
        side: (d.side?.toUpperCase() === 'NO' ? 'NO' : 'YES') as Side,
        size: parseFloat(d.size || '0'),
        price: parseFloat(d.price || '0'),
        timestamp: new Date(d.timestamp || Date.now()),
        isNewPosition: d.is_new ?? true,
        isAveragingDown: d.is_avg_down ?? false,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Scan all watched wallets for new qualifying activity.
   * Filters by: min position size, WR, not averaging down, market volume.
   *
   * @param marketVolumes - Map of marketId -> volume for volume checks.
   *   If not provided, volume check is skipped (caller should supply).
   */
  async scanWhaleActivity(marketVolumes?: Map<string, number>): Promise<WhaleSignal[]> {
    const signals: WhaleSignal[] = [];
    const wallets = this.getWatchlist();

    if (wallets.length === 0) return [];

    // Track signals per market to detect crowding
    const marketSideCounts: Map<string, Map<Side, number>> = new Map();

    for (const wallet of wallets) {
      const stats = this.statsCache.get(wallet.address);

      // Skip wallets without stats or below minimum qualification
      if (!stats) continue;
      if (stats.totalTrades < this.config.minTrades) continue;
      if (stats.winRate < this.config.minWinRate) continue;

      const activities = await this.fetchWalletActivity(wallet.address);

      for (const activity of activities) {
        // Filter: min position size
        if (activity.size < this.config.minPositionSize) continue;

        // Filter: skip averaging down
        if (activity.isAveragingDown) continue;

        // Filter: market volume
        if (marketVolumes) {
          const vol = marketVolumes.get(activity.marketId) ?? 0;
          if (vol < this.config.minMarketVolume) continue;
        }

        // Track for crowding detection
        if (!marketSideCounts.has(activity.marketId)) {
          marketSideCounts.set(activity.marketId, new Map());
        }
        const sideCounts = marketSideCounts.get(activity.marketId)!;
        sideCounts.set(activity.side, (sideCounts.get(activity.side) ?? 0) + 1);

        signals.push({
          walletAddress: wallet.address,
          walletLabel: wallet.label,
          marketId: activity.marketId,
          side: activity.side,
          size: activity.size,
          timestamp: activity.timestamp,
          whaleWinRate: stats.winRate,
          confidence: 0, // Calculated below after crowding analysis
        });
      }
    }

    // Calculate confidence for all signals (now we have crowding data)
    for (const signal of signals) {
      const stats = this.statsCache.get(signal.walletAddress);
      if (!stats) continue;

      const sideCounts = marketSideCounts.get(signal.marketId);
      const sameCount = sideCounts?.get(signal.side) ?? 0;
      const isCrowded = sameCount > CROWD_THRESHOLD;

      const isSmallForWhale = stats.avgPositionSize > 0
        ? signal.size < stats.avgPositionSize * TYPICAL_SIZE_THRESHOLD
        : false;

      // Check if whale has vertical-specific edge (requires market question -- approximate)
      const hasVerticalEdge = false; // Would need market data for proper check

      signal.confidence = calculateWhaleConfidence({
        winRate: signal.whaleWinRate,
        hasVerticalEdge,
        isCrowded,
        isSmallForWhale,
      });
    }

    // Emit events
    for (const signal of signals) {
      eventBus.emit('whale:activity-detected', signal);
    }

    this.recentSignals = signals;
    return signals;
  }

  /**
   * Scan with market data context for better vertical edge detection.
   */
  async scanWithMarkets(
    markets: Market[],
    marketVolumes?: Map<string, number>,
  ): Promise<WhaleSignal[]> {
    const volMap = marketVolumes ?? new Map<string, number>();

    // Build volume map from markets if not provided
    if (!marketVolumes) {
      for (const m of markets) {
        volMap.set(m.id, m.volume);
      }
    }

    const signals = await this.scanWhaleActivity(volMap);

    // Recalculate confidence with vertical edge info
    const marketMap = new Map(markets.map(m => [m.id, m]));

    for (const signal of signals) {
      const market = marketMap.get(signal.marketId);
      if (!market) continue;

      const stats = this.statsCache.get(signal.walletAddress);
      if (!stats) continue;

      const verticalWR = stats.verticalEdge[market.vertical] ?? 0;
      const hasVerticalEdge = verticalWR > stats.winRate;

      const sideCounts = new Map<Side, number>();
      for (const s of signals) {
        if (s.marketId === signal.marketId) {
          sideCounts.set(s.side, (sideCounts.get(s.side) ?? 0) + 1);
        }
      }
      const isCrowded = (sideCounts.get(signal.side) ?? 0) > CROWD_THRESHOLD;

      const isSmallForWhale = stats.avgPositionSize > 0
        ? signal.size < stats.avgPositionSize * TYPICAL_SIZE_THRESHOLD
        : false;

      signal.confidence = calculateWhaleConfidence({
        winRate: signal.whaleWinRate,
        hasVerticalEdge,
        isCrowded,
        isSmallForWhale,
      });
    }

    return signals;
  }

  // ─── Signal Conversion ───────────────────────────────

  /**
   * Convert a whale signal to a standard TradeSignal.
   * The suggestedSize follows the max follow size rules.
   */
  toTradeSignal(whaleSignal: WhaleSignal, marketVertical?: Vertical): TradeSignal {
    const followSize = calculateFollowSize(
      whaleSignal.size,
      this.config.maxFollowPercent,
      this.config.maxFollowSizeUsd,
    );

    const signal: TradeSignal = {
      marketId: whaleSignal.marketId,
      vertical: marketVertical ?? 'crypto',
      strategy: this.strategyId,
      side: whaleSignal.side,
      modelProbability: whaleSignal.confidence,
      marketProbability: 0.5, // Unknown -- whale signal doesn't carry price
      edge: whaleSignal.whaleWinRate - 0.50, // Edge over random
      confidence: whaleSignal.confidence,
      suggestedSize: followSize,
      reasoning: `Whale follow: ${whaleSignal.walletLabel} (WR ${(whaleSignal.whaleWinRate * 100).toFixed(1)}%) ` +
        `opened $${whaleSignal.size} ${whaleSignal.side} position. ` +
        `Follow size: $${followSize}. Confidence: ${(whaleSignal.confidence * 100).toFixed(1)}%.`,
      timestamp: new Date(),
    };

    eventBus.emit('signal:detected', {
      ...signal,
      strategy: 'whale_follow',
      vertical: marketVertical ?? 'crypto',
    });

    return signal;
  }

  // ─── Accessors ───────────────────────────────────────

  getRecentSignals(): WhaleSignal[] {
    return [...this.recentSignals];
  }

  getConfig(): Readonly<WhaleTrackerConfig> {
    return { ...this.config };
  }
}
