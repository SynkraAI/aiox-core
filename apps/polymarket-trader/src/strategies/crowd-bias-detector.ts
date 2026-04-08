/**
 * Crowd Bias Detector — finds contrarian opportunities.
 * Conclave recommendation (GCR):
 * "When market >85% one direction, flag as contrarian opportunity
 * with outsized EV because the market is priced for certainty
 * but outcomes have fat tails."
 *
 * Most prediction market participants are retail and biased by:
 * - Recency bias (recent events overweighted)
 * - Narrative bias (good story = high probability)
 * - Attention bias (trending topics = overconfident)
 */

import type { Market, TradeSignal, StrategyId } from '../types/index.js';

interface CrowdBiasSignal {
  market: Market;
  biasType: 'extreme_yes' | 'extreme_no' | 'false_certainty';
  marketPrice: number;
  suggestedContrarian: 'YES' | 'NO';
  estimatedEdge: number;
  confidence: number;
  reasoning: string;
}

export interface CrowdBiasConfig {
  /** Market price threshold for "extreme" (default 0.85 = 85%) */
  extremeThreshold: number;
  /** Minimum volume for crowd bias to be meaningful */
  minVolume: number;
  /** Max position size for contrarian bets (smaller = safer) */
  maxPositionPercent: number;
  /** Minimum days until resolution (avoid near-expiry certainty) */
  minDaysToExpiry: number;
}

const DEFAULT_CONFIG: CrowdBiasConfig = {
  extremeThreshold: 0.85,
  minVolume: 5_000,
  maxPositionPercent: 0.02,   // 2% of bankroll max for contrarian
  minDaysToExpiry: 3,
};

export class CrowdBiasDetector {
  private config: CrowdBiasConfig;
  private signals: CrowdBiasSignal[] = [];
  private stats = { scanned: 0, biasDetected: 0, signalsEmitted: 0 };

  constructor(config: Partial<CrowdBiasConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Scan a market for crowd bias.
   * Returns a contrarian signal if extreme pricing detected.
   */
  scan(market: Market): CrowdBiasSignal | null {
    this.stats.scanned++;

    // Skip low volume (crowd bias meaningless in thin markets)
    if (market.volume < this.config.minVolume) return null;

    // Skip if market already expired or resolves within minDaysToExpiry
    if (market.endDate) {
      const daysLeft = (new Date(market.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysLeft <= 0) return null; // Already happened — never trade
      if (daysLeft < this.config.minDaysToExpiry) return null;
    }

    const yesPrice = market.tokens.yes.price;
    const noPrice = market.tokens.no.price;

    // Detect extreme YES
    if (yesPrice >= this.config.extremeThreshold) {
      return this.buildSignal(market, 'extreme_yes', yesPrice, 'NO');
    }

    // Detect extreme NO (YES is very cheap)
    if (noPrice >= this.config.extremeThreshold) {
      return this.buildSignal(market, 'extreme_no', noPrice, 'YES');
    }

    return null;
  }

  /**
   * Scan multiple markets and emit signals for detected biases.
   */
  scanAll(markets: Market[]): CrowdBiasSignal[] {
    const signals: CrowdBiasSignal[] = [];

    for (const market of markets) {
      const signal = this.scan(market);
      if (signal) {
        signals.push(signal);
        this.signals.push(signal);
        this.stats.biasDetected++;
      }
    }

    return signals;
  }

  /**
   * Convert a crowd bias signal to a TradeSignal for the execution pipeline.
   */
  toTradeSignal(bias: CrowdBiasSignal, bankroll: number): TradeSignal {
    const size = bankroll * this.config.maxPositionPercent;

    this.stats.signalsEmitted++;

    return {
      marketId: bias.market.id,
      vertical: bias.market.vertical,
      strategy: 'info_arb' as StrategyId,  // Contrarian is a type of info arb
      side: bias.suggestedContrarian,
      modelProbability: bias.suggestedContrarian === 'YES'
        ? 1 - bias.marketPrice + bias.estimatedEdge
        : bias.marketPrice - bias.estimatedEdge,
      marketProbability: bias.marketPrice,
      edge: bias.estimatedEdge,
      confidence: bias.confidence,
      suggestedSize: Math.round(size * 100) / 100,
      reasoning: `[CROWD BIAS] ${bias.reasoning}`,
      timestamp: new Date(),
    };
  }

  getStats() {
    return { ...this.stats };
  }

  getRecentSignals(limit = 20): CrowdBiasSignal[] {
    return this.signals.slice(-limit);
  }

  // -- Private --

  private buildSignal(
    market: Market,
    biasType: CrowdBiasSignal['biasType'],
    marketPrice: number,
    suggestedSide: 'YES' | 'NO',
  ): CrowdBiasSignal {
    // Fat tail estimation: extreme prices underestimate tail risk
    // At 90% market price, historical base rate of upsets is ~15-25%
    // At 95%, it's still ~8-12%
    const extremeness = marketPrice - this.config.extremeThreshold;
    const estimatedEdge = 0.05 + extremeness * 0.5;  // 5-10% edge in fat tails
    const confidence = 0.3 + (1 - marketPrice) * 0.5; // Lower confidence for more extreme

    const reasoning = biasType === 'extreme_yes'
      ? `Market at ${(marketPrice * 100).toFixed(0)}% YES — crowd overconfident. Fat tail risk underpriced. Contrarian NO has ${(estimatedEdge * 100).toFixed(1)}% estimated edge.`
      : `Market at ${(marketPrice * 100).toFixed(0)}% NO — crowd dismissing YES too aggressively. Contrarian YES has ${(estimatedEdge * 100).toFixed(1)}% estimated edge.`;

    return {
      market,
      biasType,
      marketPrice,
      suggestedContrarian: suggestedSide,
      estimatedEdge,
      confidence,
      reasoning,
    };
  }
}
