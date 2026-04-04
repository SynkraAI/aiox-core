/**
 * Default configuration for the Polymarket trading system.
 * UltraPlan decisions encoded here.
 */

import type { TradingConfig, RiskLimits, GateCriteria, LiveTraderConfig } from '../types/index.js';

/** D6: Fractional Kelly 15%, max $50/trade, circuit breaker -10%/day */
export const DEFAULT_RISK_LIMITS: RiskLimits = {
  maxPositionSize: 50,          // USD per trade
  maxBankrollPercent: 0.05,     // 5% of bankroll per position
  kellyFraction: 0.15,          // 15% of optimal Kelly
  dailyLossLimit: 0.10,         // -10% daily circuit breaker
  weeklyLossLimit: 0.20,        // -20% weekly circuit breaker
  minEdge: 0.08,                // Minimum 8% edge to trade
  minLiquidity: 5000,           // Skip markets < $5K volume
  maxOpenPositions: 10,         // Max simultaneous positions
};

/** D4: Paper trading mode by default */
export const DEFAULT_CONFIG: TradingConfig = {
  mode: 'paper',
  riskLimits: DEFAULT_RISK_LIMITS,
  enabledVerticals: ['weather', 'crypto', 'politics', 'sports'],   // D1 + Phase 3.6 vertical expansion
  enabledStrategies: ['info_arb', 'weather_model', 'crypto_sentiment', 'cross_platform', 'whale_follow', 'airdrop_volume', 'politics_model', 'sports_model'],  // D5 + Phase 3.6/3.7/3.8
  driftMonitorEnabled: true,     // D9: Auto-learning Layer 0
  aceEvolutionEnabled: true,
  telegramAlerts: false,
  pollIntervalMs: 60_000,       // 1 minute market poll
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

/** Phase 3.2: Go/No-Go Gate criteria */
export const DEFAULT_GATE_CRITERIA: GateCriteria = {
  minDays: 30,
  minTrades: 500,
  minWinRate: 0.60,
  minPnl: 0,
  minSharpe: 1.0,
  maxDrawdown: 0.20,
  minEdgePersistenceWR: 0.50,
  minProfitFactor: 1.5,
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
