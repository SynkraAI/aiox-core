/**
 * Core market types for Polymarket trading system.
 */

export type Vertical = 'weather' | 'crypto' | 'politics' | 'sports' | 'pop_culture' | 'finance' | 'science';
export type Side = 'YES' | 'NO';
export type OrderType = 'GTC' | 'GTD' | 'FOK' | 'FAK';
export type OrderStatus = 'pending' | 'filled' | 'partial' | 'cancelled' | 'expired';
export type TradeOutcome = 'WIN' | 'LOSS' | 'PENDING';
export type OrderMode = 'taker' | 'maker';
export type StrategyId = 'info_arb' | 'market_making' | 'cross_platform' | 'weather_model' | 'crypto_sentiment' | 'whale_follow' | 'airdrop_volume' | 'politics_model' | 'sports_model';

export interface Market {
  id: string;
  question: string;
  slug: string;
  vertical: Vertical;
  endDate: string;
  active: boolean;
  closed: boolean;
  tokens: TokenPair;
  volume: number;
  liquidity: number;
  lastPrice: number;
}

export interface TokenPair {
  yes: TokenInfo;
  no: TokenInfo;
}

export interface TokenInfo {
  tokenId: string;
  price: number;
  outcome: string;
}

export interface OrderBookEntry {
  price: number;
  size: number;
}

export interface OrderBook {
  marketId: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  midpoint: number;
  timestamp: Date;
}

export interface Order {
  id: string;
  marketId: string;
  side: Side;
  price: number;
  size: number;
  orderType: OrderType;
  status: OrderStatus;
  filledSize: number;
  averageFillPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  marketId: string;
  market: Market;
  side: Side;
  size: number;
  averageEntry: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

export interface TradeSignal {
  marketId: string;
  marketQuestion?: string;
  vertical: Vertical;
  strategy: StrategyId;
  side: Side;
  modelProbability: number;
  marketProbability: number;
  edge: number;
  confidence: number;
  suggestedSize: number;
  reasoning: string;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Liquidity Maximizer types
// ---------------------------------------------------------------------------

export interface DepthCheckResult {
  marketId: string;
  bidDepth: number;
  askDepth: number;
  totalDepth: number;
  tier: 'deep' | 'moderate' | 'shallow' | 'skip';
  maxSafeSize: number;
  spread: number;
}

export interface SplitOrderConfig {
  chunks: number;
  intervalMs: number;
  maxSlippage: number;
  preferMaker: boolean;
  gasOptimize: boolean;
}

export interface GasWindow {
  hour: number;
  avgGwei: number;
  tier: 'low' | 'medium' | 'high';
}

export interface LiquidityReport {
  timestamp: Date;
  totalMarketsScanned: number;
  marketsWithDepth: number;
  avgSpread: number;
  avgBidDepth: number;
  avgAskDepth: number;
  gasCurrentGwei: number;
  gasTier: 'low' | 'medium' | 'high';
  makerSavingsEstimate: number;
  byVertical: Record<string, { markets: number; avgDepth: number; avgSpread: number }>;
}
