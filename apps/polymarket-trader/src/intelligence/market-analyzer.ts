/**
 * Fase 2: LLM-in-the-Loop Market Analyzer
 *
 * Supports THREE providers (auto-detected):
 * 1. Ollama (local)  — free, qwen2.5:7b on GTX 1660 SUPER
 * 2. vLLM (local)    — free, PolarQuant models (needs 8GB+ VRAM)
 * 3. Claude API       — best quality, costs ~$3-8/day
 *
 * Detection order:
 * - LLM_PROVIDER=ollama|vllm|claude in env → forced
 * - ANTHROPIC_API_KEY set → Claude
 * - OLLAMA_HOST or localhost:11434 responds → Ollama
 * - VLLM_HOST responds → vLLM
 */

import Anthropic from '@anthropic-ai/sdk';
import { eventBus } from '../engine/event-bus.js';
import type { PolymarketClient } from '../integrations/polymarket-client.js';
import type { ExperienceStore } from '../learning/experience-store.js';
import type { Market, TradeSignal, StrategyId } from '../types/index.js';

type LLMProvider = 'claude' | 'ollama' | 'vllm' | 'none';

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
  /** Force a specific provider (auto-detect if empty) */
  provider: LLMProvider | '';
  /** Anthropic API key (for Claude) */
  apiKey: string;
  /** Claude model */
  claudeModel: string;
  /** Ollama host (default: http://localhost:11434) */
  ollamaHost: string;
  /** Ollama model (default: qwen2.5:7b) */
  ollamaModel: string;
  /** vLLM host (default: http://localhost:8000) */
  vllmHost: string;
  /** vLLM model (auto-detect from server) */
  vllmModel: string;
  /** Max markets to analyze per scan */
  maxMarketsPerScan: number;
  /** Daily budget in USD (only for Claude, local = unlimited) */
  dailyBudgetUsd: number;
  /** Minimum volume for LLM analysis */
  minVolumeForAnalysis: number;
  /** Minimum liquidity */
  minLiquidityForAnalysis: number;
}

const DEFAULT_CONFIG: AnalyzerConfig = {
  provider: '',
  apiKey: '',
  claudeModel: 'claude-haiku-4-5-20251001',
  ollamaHost: 'http://localhost:11434',
  ollamaModel: 'qwen2.5:7b',
  vllmHost: 'http://localhost:8000',
  vllmModel: '',
  maxMarketsPerScan: 15,
  dailyBudgetUsd: 5.0,
  minVolumeForAnalysis: 5000,
  minLiquidityForAnalysis: 2000,
};

// Haiku pricing (Claude only)
const COST_PER_INPUT_TOKEN = 0.80 / 1_000_000;
const COST_PER_OUTPUT_TOKEN = 4.0 / 1_000_000;

// ---------------------------------------------------------------------------
// Calibration Tracker
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
    return Math.abs(totalPredicted / resolved.length - totalActual / resolved.length);
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
// Budget Controller (Claude only — local is free)
// ---------------------------------------------------------------------------

class BudgetController {
  private dailySpend = 0;
  private lastResetDate = new Date().toDateString();
  private dailyLimit: number;
  private callCount = 0;

  constructor(dailyLimitUsd: number) {
    this.dailyLimit = dailyLimitUsd;
  }

  canSpend(isLocal: boolean): boolean {
    if (isLocal) return true; // Local models are free
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
  private _client: PolymarketClient;
  private store: ExperienceStore | null;
  private anthropic: Anthropic | null = null;
  private config: AnalyzerConfig;
  private provider: LLMProvider = 'none';
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
    this.calibration = new CalibrationTracker();
    this.budget = new BudgetController(this.config.dailyBudgetUsd);

    eventBus.on('position:closed', (position) => {
      const pnl = position.unrealizedPnl + position.realizedPnl;
      this.calibration.recordOutcome(position.marketId, pnl > 0 ? 'YES' : 'NO');
    });
  }

  /**
   * Detect and initialize the best available LLM provider.
   * Must be called before analyzeMarket().
   */
  async initialize(): Promise<LLMProvider> {
    // Forced provider via config or env
    const forced = (this.config.provider || process.env.LLM_PROVIDER || '') as LLMProvider;
    if (forced && forced !== 'none') {
      this.provider = forced;
      if (forced === 'claude') {
        this.anthropic = new Anthropic({ apiKey: this.config.apiKey || process.env.ANTHROPIC_API_KEY });
      }
      console.log(`[MarketAnalyzer] Provider forced: ${forced}`);
      return this.provider;
    }

    // Auto-detect: Ollama first (free + local)
    const ollamaHost = this.config.ollamaHost || process.env.OLLAMA_HOST || 'http://localhost:11434';
    try {
      const res = await fetch(`${ollamaHost}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json() as { models?: Array<{ name: string }> };
        const models = data.models?.map(m => m.name) ?? [];
        const targetModel = this.config.ollamaModel || process.env.OLLAMA_MODEL || 'qwen2.5:7b';

        if (models.some(m => m.startsWith(targetModel.split(':')[0]))) {
          this.provider = 'ollama';
          this.config.ollamaHost = ollamaHost;
          console.log(`[MarketAnalyzer] Provider: Ollama (${ollamaHost}) — model: ${targetModel} — FREE`);
          return this.provider;
        }
        console.log(`[MarketAnalyzer] Ollama running but model "${targetModel}" not found. Available: ${models.join(', ')}`);
      }
    } catch { /* Ollama not available */ }

    // Auto-detect: vLLM
    const vllmHost = this.config.vllmHost || process.env.VLLM_HOST || 'http://localhost:8000';
    try {
      const res = await fetch(`${vllmHost}/v1/models`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json() as { data?: Array<{ id: string }> };
        const modelId = data.data?.[0]?.id ?? '';
        if (modelId) {
          this.provider = 'vllm';
          this.config.vllmHost = vllmHost;
          this.config.vllmModel = modelId;
          console.log(`[MarketAnalyzer] Provider: vLLM (${vllmHost}) — model: ${modelId} — FREE`);
          return this.provider;
        }
      }
    } catch { /* vLLM not available */ }

    // Auto-detect: Claude API
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
      this.provider = 'claude';
      console.log(`[MarketAnalyzer] Provider: Claude API — model: ${this.config.claudeModel} — ~$3-8/day`);
      return this.provider;
    }

    this.provider = 'none';
    console.log('[MarketAnalyzer] No LLM provider available. Set OLLAMA_MODEL, VLLM_HOST, or ANTHROPIC_API_KEY.');
    return this.provider;
  }

  /** Pre-filter markets to top candidates. */
  preFilter(markets: Market[]): Market[] {
    return markets
      .filter(m => m.volume >= this.config.minVolumeForAnalysis)
      .filter(m => m.liquidity >= this.config.minLiquidityForAnalysis)
      .filter(m => m.tokens.yes.price > 0.05 && m.tokens.yes.price < 0.95)
      .sort((a, b) => (b.volume * b.liquidity) - (a.volume * a.liquidity))
      .slice(0, this.config.maxMarketsPerScan);
  }

  /**
   * Send prompt to the active LLM provider and get text response.
   */
  private async callLLM(prompt: string): Promise<string | null> {
    const isLocal = this.provider === 'ollama' || this.provider === 'vllm';

    if (!this.budget.canSpend(isLocal)) {
      console.log('[MarketAnalyzer] Daily budget exhausted — skipping');
      return null;
    }

    try {
      switch (this.provider) {
        case 'ollama':
          return await this.callOllama(prompt);
        case 'vllm':
          return await this.callVLLM(prompt);
        case 'claude':
          return await this.callClaude(prompt);
        default:
          return null;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[MarketAnalyzer] ${this.provider} error: ${msg}`);
      return null;
    }
  }

  /** Call Ollama REST API (OpenAI-compatible /api/chat) */
  private async callOllama(prompt: string): Promise<string> {
    const res = await fetch(`${this.config.ollamaHost}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.ollamaModel,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 512,
        },
      }),
      signal: AbortSignal.timeout(60_000), // 60s timeout for local inference
    });

    if (!res.ok) throw new Error(`Ollama ${res.status}: ${res.statusText}`);
    const data = await res.json() as { message?: { content: string } };
    return data.message?.content ?? '';
  }

  /** Call vLLM via OpenAI-compatible /v1/chat/completions */
  private async callVLLM(prompt: string): Promise<string> {
    const model = this.config.vllmModel || 'default';
    const res = await fetch(`${this.config.vllmHost}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) throw new Error(`vLLM ${res.status}: ${res.statusText}`);
    const data = await res.json() as { choices?: Array<{ message: { content: string } }> };
    return data.choices?.[0]?.message?.content ?? '';
  }

  /** Call Claude via Anthropic SDK */
  private async callClaude(prompt: string): Promise<string> {
    if (!this.anthropic) throw new Error('Anthropic client not initialized');

    const response = await this.anthropic.messages.create({
      model: this.config.claudeModel,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    this.budget.recordSpend(
      response.usage?.input_tokens ?? 0,
      response.usage?.output_tokens ?? 0,
    );

    const firstBlock = response.content?.[0];
    return firstBlock && firstBlock.type === 'text' ? firstBlock.text : '';
  }

  /**
   * Analyze a single market using the active LLM provider.
   */
  async analyzeMarket(market: Market): Promise<LLMAnalysis | null> {
    if (this.provider === 'none') return null;

    const similarTrades = this.store
      ? this.store.findSimilar(market.question, market.vertical, 5)
      : [];

    const settledSimilar = similarTrades
      .filter(t => t.outcome !== 'PENDING')
      .map(t => `- "${t.marketQuestion.substring(0, 80)}": ${t.outcome} (edge=${(t.edgeDetected * 100).toFixed(1)}%, P&L=$${t.pnl.toFixed(2)})`)
      .join('\n');

    const prompt = this.buildPrompt(market, settledSimilar);
    const text = await this.callLLM(prompt);
    if (!text) return null;

    const analysis = this.parseAnalysis(text, market);

    if (analysis) {
      this.analysisCount++;
      this.calibration.record(market.id, analysis.probability, analysis.side);
      console.log(`[MarketAnalyzer] #${this.analysisCount} [${this.provider}] "${market.question.substring(0, 50)}..." → ${analysis.side} ${(analysis.probability * 100).toFixed(0)}% (${analysis.confidence}) trade=${analysis.shouldTrade}`);
    }

    return analysis;
  }

  /**
   * Analyze multiple markets and return trade signals.
   */
  async analyzeMarkets(markets: Market[], bankroll: number): Promise<TradeSignal[]> {
    if (this.provider === 'none') return [];

    const candidates = this.preFilter(markets);
    if (candidates.length === 0) return [];

    const providerLabel = this.provider === 'ollama' ? `Ollama/${this.config.ollamaModel}`
      : this.provider === 'vllm' ? `vLLM/${this.config.vllmModel}`
      : `Claude/${this.config.claudeModel}`;
    console.log(`[MarketAnalyzer] Analyzing ${candidates.length} markets via ${providerLabel}`);

    const signals: TradeSignal[] = [];

    // Batch size: local models = 1 (sequential, shared GPU), Claude = 5 (parallel API)
    const BATCH_SIZE = this.provider === 'claude' ? 5 : 1;
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
      if (analysis.edge < 0.03) continue;

      const marketProb = analysis.side === 'YES' ? market.tokens.yes.price : market.tokens.no.price;
      const confidenceMultiplier = analysis.confidence === 'high' ? 1.0
        : analysis.confidence === 'medium' ? 0.6 : 0.3;
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
        reasoning: `[${this.provider.toUpperCase()}] ${analysis.reasoning} | Factors: ${analysis.keyFactors.join(', ')}`,
        timestamp: new Date(),
      });
    }

    return signals;
  }

  /** Build the analysis prompt. */
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

  /** Parse LLM response into structured analysis. */
  private parseAnalysis(text: string, market: Market): LLMAnalysis | null {
    try {
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
      console.error('[MarketAnalyzer] Failed to parse LLM response');
      return null;
    }
  }

  getProvider(): LLMProvider { return this.provider; }

  getStats() {
    return {
      provider: this.provider,
      model: this.provider === 'ollama' ? this.config.ollamaModel
        : this.provider === 'vllm' ? this.config.vllmModel
        : this.config.claudeModel,
      analysisCount: this.analysisCount,
      budget: this.budget.getStats(),
      calibration: this.calibration.getStats(),
    };
  }
}
