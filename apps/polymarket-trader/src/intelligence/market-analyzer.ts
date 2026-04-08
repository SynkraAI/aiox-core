/**
 * Fase 2: LLM-in-the-Loop Market Analyzer
 *
 * Uses Claude Haiku to analyze prediction markets with real reasoning.
 * Replaces the broken heuristic (price math) with actual intelligence.
 *
 * Architecture (UltraPlan v2):
 * - Pre-filter top 20 markets by volume + liquidity
 * - Claude analyzes each with structured output
 * - Tools: getOrderBook, getSimilarTrades, getMarketContext
 * - Calibration tracking: log every (LLM prob, actual outcome)
 * - Budget controller: hard cap on daily LLM spend
 */

import Anthropic from '@anthropic-ai/sdk';
import { eventBus } from '../engine/event-bus.js';
import type { PolymarketClient } from '../integrations/polymarket-client.js';
import type { ExperienceStore } from '../learning/experience-store.js';
import type { Market, TradeSignal, StrategyId } from '../types/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LLMAnalysis {
  probability: number;
  confidence: 'high' | 'medium' | 'low';
  shouldTrade: boolean;
  edge: number;
  side: 'YES' | 'NO';
  reasoning: string;
  keyFactors: string[];
  riskFlags: string[];
}

export interface AnalyzerConfig {
  /** Anthropic API key */
  apiKey: string;
  /** Model to use (default: claude-haiku-4-5-20251001) */
  model: string;
  /** Max markets to analyze per scan */
  maxMarketsPerScan: number;
  /** Daily budget in USD (hard cap) */
  dailyBudgetUsd: number;
  /** Minimum volume to consider for LLM analysis */
  minVolumeForAnalysis: number;
  /** Minimum liquidity */
  minLiquidityForAnalysis: number;
}

const DEFAULT_CONFIG: AnalyzerConfig = {
  apiKey: '',
  model: 'claude-haiku-4-5-20251001',
  maxMarketsPerScan: 15,
  dailyBudgetUsd: 5.0,
  minVolumeForAnalysis: 5000,
  minLiquidityForAnalysis: 2000,
};

// Haiku pricing: $0.80/M input, $4/M output (approximate)
const COST_PER_INPUT_TOKEN = 0.80 / 1_000_000;
const COST_PER_OUTPUT_TOKEN = 4.0 / 1_000_000;

// ---------------------------------------------------------------------------
// Calibration Tracker (Fase 2.6)
// ---------------------------------------------------------------------------

interface CalibrationEntry {
  marketId: string;
  llmProbability: number;
  side: 'YES' | 'NO';
  outcome?: 'YES' | 'NO';
  timestamp: Date;
}

class CalibrationTracker {
  private entries: Map<string, CalibrationEntry> = new Map();

  record(marketId: string, probability: number, side: 'YES' | 'NO'): void {
    this.entries.set(marketId, { marketId, llmProbability: probability, side, timestamp: new Date() });
  }

  recordOutcome(marketId: string, outcome: 'YES' | 'NO'): void {
    const entry = this.entries.get(marketId);
    if (entry && !entry.outcome) entry.outcome = outcome;
  }

  getCalibrationGap(): number {
    const resolved = [...this.entries.values()].filter(e => e.outcome);
    if (resolved.length < 10) return 0;

    let totalPredicted = 0;
    let totalActual = 0;

    for (const entry of resolved) {
      totalPredicted += entry.llmProbability;
      totalActual += entry.side === entry.outcome ? 1 : 0;
    }

    const avgPredicted = totalPredicted / resolved.length;
    const avgActual = totalActual / resolved.length;
    return Math.abs(avgPredicted - avgActual);
  }

  getStats() {
    const resolved = [...this.entries.values()].filter(e => e.outcome);
    const correct = resolved.filter(e => e.side === e.outcome).length;
    return {
      total: this.entries.size,
      resolved: resolved.length,
      accuracy: resolved.length > 0 ? correct / resolved.length : 0,
      calibrationGap: this.getCalibrationGap(),
    };
  }
}

// ---------------------------------------------------------------------------
// Budget Controller (Fase 2.7)
// ---------------------------------------------------------------------------

class BudgetController {
  private dailySpend = 0;
  private lastResetDate = new Date().toDateString();
  private dailyLimit: number;
  private callCount = 0;

  constructor(dailyLimitUsd: number) {
    this.dailyLimit = dailyLimitUsd;
  }

  canSpend(): boolean {
    this.resetIfNewDay();
    return this.dailySpend < this.dailyLimit;
  }

  recordSpend(inputTokens: number, outputTokens: number): void {
    const cost = inputTokens * COST_PER_INPUT_TOKEN + outputTokens * COST_PER_OUTPUT_TOKEN;
    this.dailySpend += cost;
    this.callCount++;
  }

  private resetIfNewDay(): void {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      console.log(`[BudgetController] Daily reset. Yesterday: $${this.dailySpend.toFixed(4)} (${this.callCount} calls)`);
      this.dailySpend = 0;
      this.callCount = 0;
      this.lastResetDate = today;
    }
  }

  getStats() {
    return {
      dailySpend: this.dailySpend,
      dailyLimit: this.dailyLimit,
      remaining: this.dailyLimit - this.dailySpend,
      callCount: this.callCount,
    };
  }
}

// ---------------------------------------------------------------------------
// Market Analyzer
// ---------------------------------------------------------------------------

export class MarketAnalyzer {
  // Reserved for Fase 2.3 agentic tools (getOrderBook, etc.)
  private _client: PolymarketClient;
  private store: ExperienceStore | null;
  private anthropic: Anthropic;
  private config: AnalyzerConfig;
  private calibration: CalibrationTracker;
  private budget: BudgetController;
  private analysisCount = 0;

  constructor(
    client: PolymarketClient,
    store: ExperienceStore | null,
    config: Partial<AnalyzerConfig> = {},
  ) {
    this._client = client;
    this.store = store;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.anthropic = new Anthropic({ apiKey: this.config.apiKey || process.env.ANTHROPIC_API_KEY });
    this.calibration = new CalibrationTracker();
    this.budget = new BudgetController(this.config.dailyBudgetUsd);

    // Wire calibration to position outcomes
    eventBus.on('position:closed', (position) => {
      const pnl = position.unrealizedPnl + position.realizedPnl;
      this.calibration.recordOutcome(position.marketId, pnl > 0 ? 'YES' : 'NO');
    });
  }

  /**
   * Pre-filter markets to top candidates for LLM analysis.
   * Sorts by volume * liquidity (proxy for market importance).
   */
  preFilter(markets: Market[]): Market[] {
    return markets
      .filter(m => m.volume >= this.config.minVolumeForAnalysis)
      .filter(m => m.liquidity >= this.config.minLiquidityForAnalysis)
      .filter(m => m.tokens.yes.price > 0.05 && m.tokens.yes.price < 0.95)
      .sort((a, b) => (b.volume * b.liquidity) - (a.volume * a.liquidity))
      .slice(0, this.config.maxMarketsPerScan);
  }

  /**
   * Analyze a single market using Claude.
   * Returns structured analysis with probability, confidence, and reasoning.
   */
  async analyzeMarket(market: Market): Promise<LLMAnalysis | null> {
    if (!this.budget.canSpend()) {
      console.log('[MarketAnalyzer] Daily budget exhausted — skipping LLM analysis');
      return null;
    }

    // Gather context for the LLM
    const similarTrades = this.store
      ? this.store.findSimilar(market.question, market.vertical, 5)
      : [];

    const settledSimilar = similarTrades
      .filter(t => t.outcome !== 'PENDING')
      .map(t => `- "${t.marketQuestion.substring(0, 80)}": ${t.outcome} (edge=${(t.edgeDetected * 100).toFixed(1)}%, P&L=$${t.pnl.toFixed(2)})`)
      .join('\n');

    const prompt = this.buildPrompt(market, settledSimilar);

    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      // Track spend
      this.budget.recordSpend(
        response.usage?.input_tokens ?? 0,
        response.usage?.output_tokens ?? 0,
      );

      // Parse response (safe access — content may be empty)
      const firstBlock = response.content?.[0];
      const text = firstBlock && firstBlock.type === 'text' ? firstBlock.text : '';
      if (!text) return null;
      const analysis = this.parseAnalysis(text, market);

      if (analysis) {
        this.analysisCount++;
        this.calibration.record(market.id, analysis.probability, analysis.side);
        console.log(`[MarketAnalyzer] #${this.analysisCount} "${market.question.substring(0, 50)}..." → ${analysis.side} ${(analysis.probability * 100).toFixed(0)}% (${analysis.confidence}) trade=${analysis.shouldTrade}`);
      }

      return analysis;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[MarketAnalyzer] Claude error: ${msg}`);
      return null;
    }
  }

  /**
   * Analyze multiple markets and return trade signals for approved ones.
   */
  async analyzeMarkets(markets: Market[], bankroll: number): Promise<TradeSignal[]> {
    const candidates = this.preFilter(markets);
    if (candidates.length === 0) return [];

    console.log(`[MarketAnalyzer] Analyzing ${candidates.length} markets via Claude ${this.config.model}`);

    const signals: TradeSignal[] = [];

    // Batch LLM calls in groups of 5 for concurrency (not sequential)
    const BATCH_SIZE = 5;
    const analyses: Array<{ market: Market; analysis: LLMAnalysis | null }> = [];
    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      const batch = candidates.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (m) => ({ market: m, analysis: await this.analyzeMarket(m) }))
      );
      analyses.push(...results);
    }

    for (const { market, analysis } of analyses) {
      if (!analysis || !analysis.shouldTrade) continue;
      if (analysis.edge < 0.03) continue; // Minimum 3% edge from LLM

      // Convert to TradeSignal
      const marketProb = analysis.side === 'YES' ? market.tokens.yes.price : market.tokens.no.price;

      // Kelly sizing with confidence weight (Damodaran: confidence-weighted Kelly)
      const confidenceMultiplier = analysis.confidence === 'high' ? 1.0
        : analysis.confidence === 'medium' ? 0.6
        : 0.3;
      const kellyFraction = (analysis.edge / (1 - marketProb)) * 0.05 * confidenceMultiplier;
      const suggestedSize = Math.min(bankroll * kellyFraction, 25);

      if (suggestedSize < 1) continue;

      signals.push({
        marketId: market.id,
        vertical: market.vertical,
        strategy: 'info_arb' as StrategyId,
        side: analysis.side,
        modelProbability: analysis.probability,
        marketProbability: marketProb,
        edge: analysis.edge,
        confidence: confidenceMultiplier,
        suggestedSize: Math.round(suggestedSize * 100) / 100,
        reasoning: `[LLM] ${analysis.reasoning} | Factors: ${analysis.keyFactors.join(', ')}`,
        timestamp: new Date(),
      });
    }

    return signals;
  }

  /**
   * Build the analysis prompt with calibration anchors and context.
   */
  private buildPrompt(market: Market, similarTrades: string): string {
    const yesPrice = market.tokens.yes.price;
    const noPrice = market.tokens.no.price;
    const daysLeft = market.endDate
      ? Math.max(0, (new Date(market.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    return `You are a prediction market analyst. Analyze this market and estimate the TRUE probability of the YES outcome.

MARKET: ${market.question}
Current YES price: ${(yesPrice * 100).toFixed(1)}% | NO price: ${(noPrice * 100).toFixed(1)}%
Volume: $${market.volume.toFixed(0)} | Liquidity: $${market.liquidity.toFixed(0)}
End date: ${market.endDate || 'unknown'} (${daysLeft.toFixed(0)} days left)
Vertical: ${market.vertical}

${similarTrades ? `SIMILAR PAST TRADES FROM OUR EXPERIENCE:\n${similarTrades}\n` : ''}
CALIBRATION INSTRUCTIONS:
- When you say 70%, you should be correct ~70% of the time
- The market price already reflects the consensus. Your edge comes ONLY from information or reasoning the market hasn't priced in
- If you don't have a clear information advantage, set shouldTrade to false
- Be skeptical of your own estimates. Markets are semi-efficient.

Respond with ONLY a JSON object (no markdown, no explanation outside JSON):
{
  "probability": 0.XX,
  "confidence": "high" | "medium" | "low",
  "shouldTrade": true | false,
  "edge": 0.XX,
  "side": "YES" | "NO",
  "reasoning": "2-3 sentence reasoning",
  "keyFactors": ["factor1", "factor2"],
  "riskFlags": ["flag1"]
}`;
  }

  /**
   * Parse Claude's response into structured analysis.
   */
  private parseAnalysis(text: string, market: Market): LLMAnalysis | null {
    try {
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);

      const probability = Number(parsed.probability);
      if (isNaN(probability) || probability < 0 || probability > 1) return null;

      const side = parsed.side === 'YES' ? 'YES' as const : 'NO' as const;
      const marketProb = side === 'YES' ? market.tokens.yes.price : market.tokens.no.price;
      const edge = Math.abs(probability - marketProb);

      return {
        probability,
        confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'low',
        shouldTrade: Boolean(parsed.shouldTrade),
        edge,
        side,
        reasoning: String(parsed.reasoning || ''),
        keyFactors: Array.isArray(parsed.keyFactors) ? parsed.keyFactors.map(String) : [],
        riskFlags: Array.isArray(parsed.riskFlags) ? parsed.riskFlags.map(String) : [],
      };
    } catch {
      console.error('[MarketAnalyzer] Failed to parse Claude response');
      return null;
    }
  }

  getStats() {
    return {
      analysisCount: this.analysisCount,
      budget: this.budget.getStats(),
      calibration: this.calibration.getStats(),
    };
  }
}
