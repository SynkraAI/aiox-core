/**
 * Trading execution and risk management types.
 */

import type { Side, StrategyId, TradeOutcome, Vertical } from './market.js';

export interface TradeExperience {
  id: string;
  timestamp: Date;

  // Context
  marketId: string;
  vertical: Vertical;
  strategy: StrategyId;
  marketQuestion: string;

  // Decision
  signalConfidence: number;
  modelProbability: number;
  marketProbability: number;
  edgeDetected: number;
  positionSize: number;
  kellyFraction: number;
  side: Side;
  entryPrice: number;

  // Execution
  slippage: number;
  gasFee: number;
  takerFee: number;
  fillTimeMs: number;

  // Result
  outcome: TradeOutcome;
  exitPrice: number;
  pnl: number;

  // Learning
  lesson: string;
  tags: string[];
  similarPastTrades: string[];

  // Vertical-specific metadata
  metadata: Record<string, unknown>;
}

export interface RiskLimits {
  maxPositionSize: number;       // USD per trade
  maxBankrollPercent: number;    // Max % of bankroll per position
  kellyFraction: number;         // Kelly fraction (0.15 = 15%)
  dailyLossLimit: number;        // Max daily loss as % of bankroll
  weeklyLossLimit: number;       // Max weekly loss as % of bankroll
  minEdge: number;               // Minimum edge to trade (e.g., 0.08 = 8%)
  minLiquidity: number;          // Minimum market liquidity USD
  maxOpenPositions: number;      // Max simultaneous positions
}

export interface RiskState {
  bankroll: number;
  dailyPnl: number;
  weeklyPnl: number;
  openPositions: number;
  totalExposure: number;
  circuitBreakerTripped: boolean;
  circuitBreakerReason?: string;
  lastUpdated: Date;
}

export interface KellyResult {
  optimalFraction: number;
  adjustedFraction: number;
  suggestedSize: number;
  edge: number;
  probability: number;
}

export interface DriftMetrics {
  winRate: RollingMetric;
  evPerTrade: RollingMetric;
  edgeAccuracy: RollingMetric;
  executionQuality: RollingMetric;
}

export interface RollingMetric {
  current: number;
  baseline: number;
  zScore: number;
  trend: 'improving' | 'stable' | 'degrading';
  sampleSize: number;
  alertTriggered: boolean;
}

export interface PaperTrade {
  id: string;
  experience: TradeExperience;
  simulatedFill: boolean;
  realMarketDataUsed: boolean;
}

export interface TradingConfig {
  mode: 'paper' | 'live';
  riskLimits: RiskLimits;
  enabledVerticals: Vertical[];
  enabledStrategies: StrategyId[];
  driftMonitorEnabled: boolean;
  aceEvolutionEnabled: boolean;
  telegramAlerts: boolean;
  pollIntervalMs: number;
}

// ---------------------------------------------------------------------------
// Phase 3.1: Paper Review Report
// ---------------------------------------------------------------------------

export interface PaperReviewReport {
  period: { start: Date; end: Date; days: number };
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgPnlPerTrade: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownDuration: number; // days
  profitFactor: number;
  bestTrade: { pnl: number; marketId: string };
  worstTrade: { pnl: number; marketId: string };
  avgHoldingPeriod: number; // hours
  consecutiveWins: number;
  consecutiveLosses: number;
  edgePersistence: {
    period1WR: number;
    period2WR: number;
    period3WR: number;
    isConsistent: boolean;
  };
  byVertical: Record<string, { trades: number; winRate: number; pnl: number }>;
  byStrategy: Record<string, { trades: number; winRate: number; pnl: number }>;
  dailyPnl: Array<{ date: string; pnl: number; cumulative: number }>;
}

// ---------------------------------------------------------------------------
// Phase 3.2: Go/No-Go Gate
// ---------------------------------------------------------------------------

export interface GateCriterion {
  name: string;
  required: number | boolean | string;
  actual: number | boolean | string;
  passed: boolean;
}

export interface GateResult {
  passed: boolean;
  score: number; // 0-100
  criteria: GateCriterion[];
  recommendation: 'GO' | 'NO_GO' | 'CONDITIONAL';
}

export interface GateCriteria {
  minDays: number;
  minTrades: number;
  minWinRate: number;
  minPnl: number;
  minSharpe: number;
  maxDrawdown: number;
  minEdgePersistenceWR: number;
  minProfitFactor: number;         // PRIMARY metric (Conclave: Domer)
  minEvPerTrade: number;           // PRIMARY metric (Conclave: Tetlock)
  maxBrierScore: number;           // Calibration gate (Conclave: Tetlock)
}

// ---------------------------------------------------------------------------
// Phase 3.3: Live Trader
// ---------------------------------------------------------------------------

export interface LiveTraderConfig {
  privateKey: string;       // encrypted, never logged
  walletAddress: string;
  maxTradeSize: number;     // $50 default
  slippageTolerance: number; // 0.02 = 2% default
  requireGatePass: boolean; // true, can override for testing
  gradualRollout: {
    enabled: boolean;
    kellyMultiplier: number; // start at 0.25, scale to 1.0
  };
}

export interface TradeResult {
  success: boolean;
  orderId?: string;
  marketId: string;
  side: Side;
  size: number;
  price: number;
  txHash?: string;
  error?: string;
  timestamp: Date;
}

export interface LivePosition {
  marketId: string;
  tokenId: string;
  side: Side;
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  enteredAt: Date;
}
