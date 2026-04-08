/**
 * Default configuration for the Polymarket trading system.
 * UltraPlan decisions encoded here.
 */

import type { TradingConfig, RiskLimits, GateCriteria, LiveTraderConfig, SplitOrderConfig } from '../types/index.js';

/** UltraPlan v2: Kelly 5% (startup), max $25/trade, circuit breaker -10%/day */
export const DEFAULT_RISK_LIMITS: RiskLimits = {
  maxPositionSize: 25,          // USD per trade (conservative startup sizing)
  maxBankrollPercent: 0.03,     // 3% of bankroll per position
  kellyFraction: 0.05,          // 5% of optimal Kelly (Damodaran: "bot is startup")
  dailyLossLimit: 0.10,         // -10% daily circuit breaker
  weeklyLossLimit: 0.20,        // -20% weekly circuit breaker
  minEdge: 0.05,                // Minimum 5% edge to trade (up from 1% paper unlimited)
  minLiquidity: 5000,           // Skip markets < $5K volume
  maxOpenPositions: 10,         // Max simultaneous positions
};

/**
 * PAPER UNLIMITED: No limits on trades — paper has zero cost.
 * Maximizes ACE evolution speed (150+ cycles/month vs 21).
 * All 7 verticals active, no position cap, no edge floor.
 */
export const PAPER_UNLIMITED_RISK_LIMITS: RiskLimits = {
  maxPositionSize: 10_000,        // No practical limit (simulated)
  maxBankrollPercent: 1.0,        // 100% — no constraint in paper
  kellyFraction: 1.0,             // Full Kelly for data collection
  dailyLossLimit: 1.0,            // No circuit breaker in paper
  weeklyLossLimit: 1.0,           // No circuit breaker in paper
  minEdge: 0.01,                  // 1% — capture everything for learning
  minLiquidity: 500,              // Include thin markets for data
  maxOpenPositions: 500,          // Effectively unlimited
};

/** D4: Paper trading mode by default */
export const DEFAULT_CONFIG: TradingConfig = {
  mode: 'paper',
  riskLimits: DEFAULT_RISK_LIMITS,
  enabledVerticals: ['weather', 'crypto'],   // UltraPlan v2 D16: 2 verticals max until proven profitable
  enabledStrategies: ['weather_model', 'crypto_sentiment'],  // UltraPlan v2: disabled 6 unproven strategies
  driftMonitorEnabled: true,     // D9: Auto-learning Layer 0
  aceEvolutionEnabled: true,
  telegramAlerts: false,
  pollIntervalMs: 60_000,       // 1 minute market poll
};

/** Paper Unlimited: all verticals, no limits, fast polling for maximum learning */
export const PAPER_UNLIMITED_CONFIG: TradingConfig = {
  mode: 'paper',
  riskLimits: PAPER_UNLIMITED_RISK_LIMITS,
  enabledVerticals: ['weather', 'crypto', 'politics', 'sports', 'pop_culture', 'finance', 'science'],
  enabledStrategies: ['info_arb', 'weather_model', 'crypto_sentiment', 'cross_platform', 'whale_follow', 'airdrop_volume', 'politics_model', 'sports_model'],
  driftMonitorEnabled: true,
  aceEvolutionEnabled: true,
  telegramAlerts: false,
  pollIntervalMs: 15_000,       // 15s — 4x faster scanning for max trade volume
};

export const KALSHI_API = {
  base: 'https://api.elections.kalshi.com/trade-api/v2',
  maxReqPerMin: 10,    // Kalshi is stricter than Polymarket
  cacheTtlMs: 60_000,  // 60s cache for market data
};

export const POLYMARKET_API = {
  gamma: 'https://gamma-api.polymarket.com',
  clob: 'https://clob.polymarket.com',
  data: 'https://data-api.polymarket.com',
  wsMarket: 'wss://ws-subscriptions-clob.polymarket.com/ws/market',
  wsUser: 'wss://ws-subscriptions-clob.polymarket.com/ws/user',
  chainId: 137,  // Polygon
};

export const DRIFT_THRESHOLDS = {
  winRate: { min: 0.55, zScoreAlert: 2.0 },
  evPerTrade: { min: 0.50 },
  edgeAccuracy: { maxMAE: 0.15 },
  executionQuality: { maxDeviation: 0.03 },
  windowSize: 50,  // Rolling 50-trade window
};

/**
 * Phase 3.2: Go/No-Go Gate criteria
 * UPDATED per Conclave 2026-04-04:
 * - Profit factor + EV/trade are PRIMARY metrics (Domer + Tetlock)
 * - Win rate demoted to 55% (secondary, informational)
 * - Added minEvPerTrade and maxBrierScore
 */
export const DEFAULT_GATE_CRITERIA: GateCriteria = {
  minDays: 30,
  minTrades: 500,
  minWinRate: 0.55,             // DEMOTED from 0.60 — Domer: "wrong metric"
  minPnl: 0,
  minSharpe: 1.0,
  maxDrawdown: 0.20,
  minEdgePersistenceWR: 0.50,
  minProfitFactor: 1.5,         // PRIMARY — Domer: "profit factor > win rate"
  minEvPerTrade: 0.50,          // PRIMARY — Tetlock: "EV/trade matters more"
  maxBrierScore: 0.25,          // Tetlock: "halt if calibration degrades"
};

/** Phase 3.3: Live Trader defaults */
export const DEFAULT_LIVE_TRADER_CONFIG: LiveTraderConfig = {
  privateKey: '',           // Must be set by user, never hardcoded
  walletAddress: '',        // Must be set by user
  maxTradeSize: 50,         // $50 max per trade
  slippageTolerance: 0.02,  // 2% slippage tolerance
  requireGatePass: true,    // Require Go/No-Go gate to pass
  gradualRollout: {
    enabled: true,
    kellyMultiplier: 0.25,  // Start at 25% of optimal Kelly
  },
};

export const ACE_CONFIG = {
  tradesPerEvolution: 100,   // Evolve prompts every 100 trades
  minTradesForBaseline: 50,  // Need 50 trades before measuring drift
};

/** Twitter sentiment adapter configuration */
export const TWITTER_CONFIG = {
  nitterInstances: [
    'https://nitter.privacydev.net',
    'https://nitter.poast.org',
    'https://nitter.cz',
  ],
  cacheTtlMs: 2 * 60 * 1000,        // 2 minutes (faster than news)
  rateLimitMs: 5_000,                 // 1 request per 5 seconds
  requestTimeoutMs: 10_000,           // 10s timeout
};

/** On-chain monitor configuration (Polygon) */
export const ONCHAIN_CONFIG = {
  rpcUrl: 'https://polygon-rpc.com',
  gasThresholdGwei: 100,              // Polygon usually < 50 gwei
  gasPollMs: 30_000,                  // Poll gas every 30 seconds
  balancePollMs: 60_000,              // Poll balance every 60 seconds
  requestTimeoutMs: 10_000,           // 10s timeout
};

/** Phase 3.6: Politics Strategy configuration */
export const POLITICS_STRATEGY_CONFIG = {
  minEdge: 0.10,                        // 10% — politics markets are efficient
  minConfidence: 0.40,                  // Min confidence threshold
  minVolume: 10_000,                    // $10K min volume
  minVolumeLongTerm: 50_000,            // $50K for markets > 30 days out
  longTermDays: 30,                     // Threshold for long-term filter
  maxNewsAdjustment: 0.05,             // ±5% news sentiment adjustment
  maxTwitterAdjustment: 0.03,          // ±3% Twitter momentum adjustment
  incumbencyBias: 0.02,                // +2% incumbency edge in close races
};

/** Phase 3.6: Sports Strategy configuration */
export const SPORTS_STRATEGY_CONFIG = {
  minEdge: 0.08,                        // 8% min edge
  minConfidence: 0.35,                  // Min confidence threshold
  minVolume: 5_000,                     // $5K min volume
  maxTimeHorizonDays: 7,               // Sports odds change fast
  momentumAdjustment: 0.02,            // ±2% win streak adjustment
  homeAdvantage: 0.03,                 // +3% home team advantage
  maxNewsAdjustment: 0.05,            // ±5% news sentiment
  maxTwitterAdjustment: 0.03,         // ±3% Twitter sentiment
};

/** Dashboard configuration */
export const DASHBOARD_CONFIG = {
  port: 3737,
  refreshIntervalMs: 60_000,   // Push P&L update every 60s
};

/** Phase 3.7: Whale Tracker configuration */
export const WHALE_TRACKER_CONFIG = {
  minPositionSize: 500,               // $500 min whale position
  minWinRate: 0.55,                   // 55% WR minimum to follow
  minTrades: 50,                      // 50+ resolved trades
  followDelayMs: { min: 5 * 60_000, max: 15 * 60_000 },  // 5-15 min delay
  maxFollowPercent: 0.10,             // 10% of whale's position
  maxFollowSizeUsd: 50,              // $50 max follow
  minMarketVolume: 10_000,           // $10K min market volume
  requestTimeoutMs: 10_000,          // 10s timeout
};

/** Telegram Bot configuration */
export const TELEGRAM_BOT_CONFIG = {
  pollTimeoutSeconds: 30,
  retryDelayMs: 5000,
  maxRetries: 50,
  notifications: {
    quietHoursStart: 23,
    quietHoursEnd: 7,
    maxMessagesPerHour: 30,
    quietHoursMinPriority: 'critical' as const,
    dailySummaryEnabled: true,
    dailySummaryHour: 20,
    weeklySummaryEnabled: true,
  },
};

/** Phase 3.8: Airdrop Optimizer configuration */
export const AIRDROP_OPTIMIZER_CONFIG = {
  maxSpread: 0.03,                    // 3% max spread for volume trades
  maxLossPerTrade: 1.0,              // $1 max loss per airdrop trade
  dailyBudgetPercent: 0.10,          // 10% of bankroll daily budget
  minVolume24h: 10_000,              // $10K min market volume
  minLiquidity: 5_000,              // $5K min liquidity
};

// ===========================================================================
// LIQUIDITY MAXIMIZER CONFIGS
// ===========================================================================

/** Orderbook Depth Filter: skip illiquid markets */
export const DEPTH_FILTER_CONFIG = {
  tiers: {
    deep:     { minDepth: 10_000, maxSizePercent: 1.0,  label: 'Full size' },
    moderate: { minDepth: 5_000,  maxSizePercent: 0.5,  label: 'Half size' },
    shallow:  { minDepth: 1_000,  maxSizePercent: 0.25, label: 'Quarter size' },
    skip:     { minDepth: 0,      maxSizePercent: 0,    label: 'Skip — too thin' },
  },
  /** Check depth before every trade */
  enabled: true,
  /** Cache orderbook for this long (ms) */
  cacheTtlMs: 30_000,
};

/** Maker Mode: earn rebates instead of paying fees */
export const MAKER_MODE_CONFIG = {
  enabled: true,
  /** Place limit orders this far below best ask (maker offset) */
  makerOffsetPercent: 0.005,     // 0.5% below best ask
  /** Max time to wait for maker fill before fallback to taker (ms) */
  makerTimeoutMs: 60_000,        // 60s
  /** Fallback to taker if maker doesn't fill */
  fallbackToTaker: true,
  /** Estimated maker rebate (Polymarket: ~0.5-1%) */
  estimatedRebatePercent: 0.005,
  /** Estimated taker fee */
  estimatedTakerFeePercent: 0.01,
};

/** Smart Order Splitting: reduce slippage on large orders */
export const SPLIT_ORDER_CONFIG: SplitOrderConfig = {
  chunks: 5,                      // Split into 5 pieces
  intervalMs: 30_000,             // 30s between chunks
  maxSlippage: 0.005,             // 0.5% max slippage per chunk
  preferMaker: true,              // Use limit orders
  gasOptimize: true,              // Wait for low gas windows
};

/** Polygon Gas Optimizer: batch trades in cheap windows */
export const GAS_OPTIMIZER_CONFIG = {
  enabled: true,
  /** Gas price tiers (gwei) */
  tiers: {
    low:    { maxGwei: 40,  action: 'execute' as const },
    medium: { maxGwei: 80,  action: 'queue' as const },
    high:   { maxGwei: 150, action: 'delay' as const },
  },
  /** Poll gas price interval (ms) */
  pollIntervalMs: 15_000,
  /** Max time to hold queued trades waiting for low gas (ms) */
  maxQueueTimeMs: 300_000,       // 5 min max wait
  /** Optimal trading hours (UTC) — Polygon gas is cheapest */
  optimalHoursUTC: [2, 3, 4, 5, 6, 7],   // 02:00-07:59 UTC
  /** RPC endpoint for gas price */
  rpcUrl: 'https://polygon-rpc.com',
};
