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

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { eventBus } from '../engine/event-bus.js';
import { selectMarkets } from '../engine/market-selector.js';
import type { PolymarketClient } from '../integrations/polymarket-client.js';
import type { ExperienceStore } from '../learning/experience-store.js';
import type { KnowledgeStore } from './knowledge-store.js';
import type { Market, TradeSignal, StrategyId } from '../types/index.js';

type LLMProvider = 'claude' | 'openai' | 'ollama' | 'vllm' | 'none';

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
  /** OpenAI API key */
  openaiApiKey: string;
  /** OpenAI model (default: gpt-4o-mini) */
  openaiModel: string;
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
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
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

/**
 * BudgetController — tracks daily LLM spend, persists across restarts.
 *
 * PM-PIVOT-1 (Conclave Ng — bot morreu por OpenAI budget esgotado):
 *   - Persisted to data/llm-budget.json so restart not reset spend mid-day.
 *   - Resets at midnight LOCAL time.
 *   - Warns once at 80%, once at 100% (then pauses LLM, fallback heuristic).
 *
 * `now()` is injected for tests (mocking Date is messy in vitest module-level).
 */
export class BudgetController {
  private dailySpend = 0;
  private lastResetDate: string;
  private dailyLimit: number;
  private callCount = 0;
  private warned80 = false;
  private warned100 = false;
  private statePath: string;
  private now: () => number;

  constructor(dailyLimitUsd: number, statePath?: string, nowFn?: () => number) {
    this.dailyLimit = dailyLimitUsd;
    this.now = nowFn ?? (() => Date.now());
    this.statePath = statePath ?? join(process.cwd(), 'data', 'llm-budget.json');
    this.lastResetDate = new Date(this.now()).toDateString();
    this.loadState();
  }

  /** Load persisted state from disk (silent fallback to defaults if missing/corrupt). */
  private loadState(): void {
    try {
      if (!existsSync(this.statePath)) return;
      const raw = JSON.parse(readFileSync(this.statePath, 'utf-8')) as {
        dailySpend?: number;
        lastResetDate?: string;
        callCount?: number;
        warned80?: boolean;
        warned100?: boolean;
      };
      const todayStr = new Date(this.now()).toDateString();
      if (raw.lastResetDate === todayStr) {
        this.dailySpend = Number(raw.dailySpend) || 0;
        this.callCount = Number(raw.callCount) || 0;
        this.warned80 = Boolean(raw.warned80);
        this.warned100 = Boolean(raw.warned100);
      } else {
        // Different day on disk — start fresh, persist new lastResetDate
        this.lastResetDate = todayStr;
        this.persistState();
      }
    } catch {
      // Corrupt or unreadable — defaults are safe
    }
  }

  /** Persist state to disk. Non-fatal — never throws. */
  private persistState(): void {
    try {
      writeFileSync(
        this.statePath,
        JSON.stringify({
          dailySpend: this.dailySpend,
          lastResetDate: this.lastResetDate,
          callCount: this.callCount,
          warned80: this.warned80,
          warned100: this.warned100,
        }, null, 2),
      );
    } catch {
      // Disk write failed — in-memory state still authoritative
    }
  }

  /** True if there's headroom under the cap (or local provider). */
  canSpend(isLocal: boolean): boolean {
    if (isLocal) return true; // Local models are free
    this.resetIfNewDay();
    return this.dailySpend < this.dailyLimit;
  }

  recordSpend(inputTokens: number, outputTokens: number): void {
    this.resetIfNewDay();
    const cost = inputTokens * COST_PER_INPUT_TOKEN + outputTokens * COST_PER_OUTPUT_TOKEN;
    this.dailySpend += cost;
    this.callCount++;
    this.checkWarnings();
    this.persistState();
  }

  private checkWarnings(): void {
    const pct = this.dailyLimit > 0 ? this.dailySpend / this.dailyLimit : 0;
    if (!this.warned80 && pct >= 0.80) {
      this.warned80 = true;
      console.warn(`[BudgetController] ⚠️  80% of daily LLM budget consumed: $${this.dailySpend.toFixed(4)} / $${this.dailyLimit.toFixed(2)}`);
    }
    if (!this.warned100 && pct >= 1.0) {
      this.warned100 = true;
      console.warn(`[BudgetController] 🛑 100% of daily LLM budget consumed: $${this.dailySpend.toFixed(4)} / $${this.dailyLimit.toFixed(2)} — pausing LLM until midnight, falling back to heuristic.`);
    }
  }

  private resetIfNewDay(): void {
    const today = new Date(this.now()).toDateString();
    if (today !== this.lastResetDate) {
      console.log(`[BudgetController] Daily reset. Yesterday: $${this.dailySpend.toFixed(4)} (${this.callCount} calls)`);
      this.dailySpend = 0;
      this.callCount = 0;
      this.warned80 = false;
      this.warned100 = false;
      this.lastResetDate = today;
      this.persistState();
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
// OpenAIBudgetTracker — PM-PIVOT-1 (AC 5, 17)
// ---------------------------------------------------------------------------
//
// Public, test-facing budget gate. Lives alongside BudgetController (legacy/internal).
// API per story contract:
//   constructor(opts: { thresholdUsd: number; statePath?: string; clock?: () => Date })
//   load(): Promise<void>           — restore state from disk + reset if date rolled over
//   recordSpend(usd): Promise<void> — increment + persist + auto-reset
//   isPaused(): boolean             — true when dailySpend >= thresholdUsd (auto-resets first)
//   getDailySpend(): number
//   getLastResetDate(): string      — YYYY-MM-DD local TZ
//
// State file shape:
//   { "dailySpend": number, "lastResetDate": "YYYY-MM-DD" }

export interface OpenAIBudgetTrackerOptions {
  thresholdUsd: number;
  statePath?: string;
  clock?: () => Date;
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export class OpenAIBudgetTracker {
  private thresholdUsd: number;
  private statePath: string;
  private clock: () => Date;
  private dailySpend = 0;
  private lastResetDate: string;

  constructor(opts: OpenAIBudgetTrackerOptions) {
    this.thresholdUsd = opts.thresholdUsd;
    this.statePath = opts.statePath ?? join(process.cwd(), 'data', 'llm-budget.json');
    this.clock = opts.clock ?? (() => new Date());
    this.lastResetDate = formatYmd(this.clock());
  }

  /** Restore from disk and auto-reset if calendar day changed. */
  async load(): Promise<void> {
    try {
      if (existsSync(this.statePath)) {
        const raw = JSON.parse(readFileSync(this.statePath, 'utf-8')) as {
          dailySpend?: number;
          lastResetDate?: string;
        };
        if (typeof raw.dailySpend === 'number') this.dailySpend = raw.dailySpend;
        if (typeof raw.lastResetDate === 'string') this.lastResetDate = raw.lastResetDate;
      }
    } catch {
      // corrupt or unreadable — start fresh
    }
    this.maybeReset();
  }

  /** Reset spend if today's date no longer matches the persisted lastResetDate. */
  private maybeReset(): void {
    const today = formatYmd(this.clock());
    if (today !== this.lastResetDate) {
      this.dailySpend = 0;
      this.lastResetDate = today;
      this.persist();
    }
  }

  private persist(): void {
    try {
      writeFileSync(
        this.statePath,
        JSON.stringify({ dailySpend: this.dailySpend, lastResetDate: this.lastResetDate }, null, 2),
      );
    } catch {
      // disk failure is non-fatal — in-memory state is authoritative for the running process
    }
  }

  async recordSpend(usd: number): Promise<void> {
    this.maybeReset();
    this.dailySpend += usd;
    this.persist();
  }

  isPaused(): boolean {
    this.maybeReset();
    return this.dailySpend >= this.thresholdUsd;
  }

  getDailySpend(): number {
    return this.dailySpend;
  }

  getLastResetDate(): string {
    return this.lastResetDate;
  }
}

// ---------------------------------------------------------------------------
// Market Analyzer
// ---------------------------------------------------------------------------

export class MarketAnalyzer {
  private store: ExperienceStore | null;
  private knowledgeStore: KnowledgeStore | null = null;
  private anthropic: Anthropic | null = null;
  private config: AnalyzerConfig;
  private provider: LLMProvider = 'none';
  private calibration: CalibrationTracker;
  private budget: BudgetController;
  // PM-PIVOT-1: OpenAI-specific persistent budget gate (separate from the legacy in-memory BudgetController).
  private openaiBudget: OpenAIBudgetTracker;
  private openaiBudgetReady = false;
  private analysisCount = 0;

  constructor(
    client: PolymarketClient,
    store: ExperienceStore | null,
    config: Partial<AnalyzerConfig> = {},
  ) {
    void client; // retained in constructor scope for future Phase 4 use
    this.store = store;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.calibration = new CalibrationTracker();
    this.budget = new BudgetController(this.config.dailyBudgetUsd);
    this.openaiBudget = new OpenAIBudgetTracker({ thresholdUsd: this.config.dailyBudgetUsd });

    eventBus.on('position:closed', (position) => {
      // Use actual market resolution (price-based), not PnL direction
      const yesPrice = position.market?.tokens?.yes?.price ?? 0;
      const outcome: 'YES' | 'NO' = yesPrice >= 0.99 ? 'YES' : 'NO';
      this.calibration.recordOutcome(position.marketId, outcome);
    });
  }

  /** Lazy-load persistent OpenAI budget once per process. */
  private async ensureOpenAIBudgetLoaded(): Promise<void> {
    if (this.openaiBudgetReady) return;
    await this.openaiBudget.load();
    this.openaiBudgetReady = true;
  }

  /** Connect the knowledge store for context-augmented analysis. */
  setKnowledgeStore(knowledge: KnowledgeStore): void {
    this.knowledgeStore = knowledge;
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
      if (forced === 'openai') {
        const oaiKey = this.config.openaiApiKey || process.env.OPENAI_API_KEY;
        if (!oaiKey) {
          console.log('[MarketAnalyzer] OpenAI forced but no OPENAI_API_KEY set');
          this.provider = 'none';
          return this.provider;
        }
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

    // Auto-detect: OpenAI API
    const openaiKey = this.config.openaiApiKey || process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.provider = 'openai';
      console.log(`[MarketAnalyzer] Provider: OpenAI — model: ${this.config.openaiModel} — ~$1-3/day`);
      return this.provider;
    }

    this.provider = 'none';
    console.log('[MarketAnalyzer] No LLM provider available. Set OLLAMA_MODEL, VLLM_HOST, ANTHROPIC_API_KEY, or OPENAI_API_KEY.');
    return this.provider;
  }

  /**
   * Pre-filter markets to top candidates.
   * PM-PIVOT-1: delegates to selectMarkets() for source-of-truth real-only filtering,
   * then applies analyzer-specific volume + price-band gates.
   */
  preFilter(markets: Market[]): Market[] {
    const minVol = this.config.minVolumeForAnalysis;
    const maxResHours = Number(process.env.MAX_RESOLUTION_HOURS) || 168;
    const tradeable = selectMarkets(markets, {
      maxResolutionHours: maxResHours,
      minLiquidity: this.config.minLiquidityForAnalysis,
      batchLimit: Number.MAX_SAFE_INTEGER, // analyzer applies its own batch slice below
    });
    return tradeable
      .filter(m => m.volume >= minVol)
      .filter(m => m.tokens.yes.price > 0.05 && m.tokens.yes.price < 0.95)
      .slice(0, this.config.maxMarketsPerScan);
  }

  /**
   * Send prompt to the active LLM provider and get text response.
   */
  private async callLLM(prompt: string): Promise<string | null> {
    const isLocal = this.provider === 'ollama' || this.provider === 'vllm';
    // OpenAI is also a paid provider

    if (!this.budget.canSpend(isLocal)) {
      console.log('[MarketAnalyzer] Daily budget exhausted — skipping');
      return null;
    }

    // PM-PIVOT-1: persistent OpenAI budget gate (Conclave Ng — bot morreu por budget esgotado)
    if (this.provider === 'openai' || this.provider === 'claude') {
      await this.ensureOpenAIBudgetLoaded();
      if (this.openaiBudget.isPaused()) {
        console.warn(`[MarketAnalyzer] OpenAI budget cap reached ($${this.openaiBudget.getDailySpend().toFixed(4)}) — pausing LLM, falling back to heuristic.`);
        return null;
      }
    }

    try {
      switch (this.provider) {
        case 'ollama':
          return await this.callOllama(prompt);
        case 'vllm':
          return await this.callVLLM(prompt);
        case 'claude':
          return await this.callClaude(prompt);
        case 'openai':
          return await this.callOpenAI(prompt);
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
    // PM-PIVOT-1: mirror to persistent tracker for restart-safe budget enforcement.
    const inTok = response.usage?.input_tokens ?? 0;
    const outTok = response.usage?.output_tokens ?? 0;
    const cost = inTok * COST_PER_INPUT_TOKEN + outTok * COST_PER_OUTPUT_TOKEN;
    void this.openaiBudget.recordSpend(cost);

    const firstBlock = response.content?.[0];
    return firstBlock && firstBlock.type === 'text' ? firstBlock.text : '';
  }

  /** Call OpenAI via REST (no SDK dependency) */
  private async callOpenAI(prompt: string): Promise<string> {
    const apiKey = this.config.openaiApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not set');

    const model = this.config.openaiModel || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI ${res.status}: ${body}`);
    }

    const data = await res.json() as {
      choices?: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
    };

    if (data.usage) {
      this.budget.recordSpend(data.usage.prompt_tokens, data.usage.completion_tokens);
      // PM-PIVOT-1: also feed persistent OpenAI tracker (~Haiku-equivalent token cost approximation —
      // for OpenAI, prompt = $0.15/M, completion = $0.60/M for gpt-4o-mini). Use a conservative blend.
      const cost = data.usage.prompt_tokens * (0.15 / 1_000_000)
                 + data.usage.completion_tokens * (0.60 / 1_000_000);
      void this.openaiBudget.recordSpend(cost);
    }

    return data.choices?.[0]?.message?.content ?? '';
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

    // Retrieve relevant knowledge for this market
    let knowledgeContext = '';
    if (this.knowledgeStore) {
      const relevant = this.knowledgeStore.findRelevant(market.question, market.vertical, 5);
      if (relevant.length > 0) {
        knowledgeContext = this.knowledgeStore.formatForPrompt(relevant, 1500);
      }
    }

    // Build performance feedback: calibration stats + per-vertical track record
    const performanceContext = this.buildPerformanceContext(market.vertical);

    const prompt = this.buildPrompt(market, settledSimilar, knowledgeContext, performanceContext);
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
      : this.provider === 'openai' ? `OpenAI/${this.config.openaiModel}`
      : `Claude/${this.config.claudeModel}`;
    console.log(`[MarketAnalyzer] Analyzing ${candidates.length} markets via ${providerLabel}`);

    const signals: TradeSignal[] = [];

    // Batch size: local models = 1 (sequential, shared GPU), cloud APIs = 5 (parallel)
    const isCloud = this.provider === 'claude' || this.provider === 'openai';
    const BATCH_SIZE = isCloud ? 5 : 1;
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
      // Short-term markets get 1.5x Kelly boost — faster feedback, higher conviction
      const daysLeft = market.endDate
        ? Math.max(0, (new Date(market.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 9999;
      const horizonBoost = daysLeft <= 14 ? 1.5 : 1.0;
      const kellyFraction = (analysis.edge / (1 - marketProb)) * 0.05 * confidenceMultiplier * horizonBoost;
      const suggestedSize = Math.min(bankroll * kellyFraction, 25);

      if (suggestedSize < 1) continue;

      signals.push({
        marketId: market.id,
        marketQuestion: market.question,
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

  /** Build performance feedback for the LLM — self-awareness of its own track record. */
  private buildPerformanceContext(vertical: string): string {
    const parts: string[] = [];

    // Calibration stats
    const calStats = this.calibration.getStats();
    if (calStats.resolved >= 10) {
      parts.push(`YOUR TRACK RECORD (${calStats.resolved} resolved predictions):`);
      parts.push(`- Overall accuracy: ${(calStats.accuracy * 100).toFixed(0)}%`);
      if (calStats.calibrationGap > 0.05) {
        parts.push(`- ⚠️ Calibration gap: ${(calStats.calibrationGap * 100).toFixed(1)}% — your probability estimates are systematically off. Be more conservative.`);
      } else {
        parts.push(`- Calibration gap: ${(calStats.calibrationGap * 100).toFixed(1)}% (well-calibrated)`);
      }
    }

    // Per-vertical performance from experience store
    if (this.store) {
      const verticalTrades = this.store.getByVertical(vertical as any, 100);
      const settled = verticalTrades.filter(t => t.outcome !== 'PENDING');
      if (settled.length >= 5) {
        const wins = settled.filter(t => t.outcome === 'WIN').length;
        const wr = wins / settled.length;
        const totalPnl = settled.reduce((s, t) => s + t.pnl, 0);
        const overconfidentLosses = settled.filter(t => t.outcome === 'LOSS' && t.edgeDetected > 0.10).length;
        const totalLosses = settled.filter(t => t.outcome === 'LOSS').length;

        parts.push(`YOUR ${vertical.toUpperCase()} PERFORMANCE (${settled.length} trades):`);
        parts.push(`- Win rate: ${(wr * 100).toFixed(0)}%, PnL: $${totalPnl.toFixed(2)}`);

        if (overconfidentLosses > 0 && totalLosses > 0) {
          const overconfPct = (overconfidentLosses / totalLosses * 100).toFixed(0);
          parts.push(`- ⚠️ ${overconfPct}% of your losses were HIGH-EDGE calls that were WRONG — you tend to be overconfident when you think the edge is large. Reduce confidence on high-edge calls.`);
        }

        if (wr < 0.5) {
          parts.push(`- ⚠️ Below 50% win rate — set shouldTrade=false unless you have VERY strong evidence.`);
        }
      }
    }

    return parts.length > 0 ? parts.join('\n') : '';
  }

  /** Build the analysis prompt with knowledge augmentation. */
  private buildPrompt(market: Market, similarTrades: string, knowledgeContext = '', performanceContext = ''): string {
    const yesPrice = market.tokens.yes.price;
    const noPrice = market.tokens.no.price;
    const daysLeft = market.endDate
      ? Math.max(0, (new Date(market.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    return `You are an expert prediction market analyst. Estimate the FAIR probability of this event occurring, then determine which side (YES or NO) offers better value.

MARKET: ${market.question}
Current YES price: ${(yesPrice * 100).toFixed(1)}% | NO price: ${(noPrice * 100).toFixed(1)}%
Volume: $${market.volume.toFixed(0)} | Liquidity: $${market.liquidity.toFixed(0)}
End date: ${market.endDate || 'unknown'} (${daysLeft.toFixed(0)} days left)
Vertical: ${market.vertical}

${similarTrades ? `SIMILAR PAST TRADES FROM OUR EXPERIENCE:\n${similarTrades}\n` : ''}\
${knowledgeContext ? `DOMAIN KNOWLEDGE (use these insights to inform your analysis):\n${knowledgeContext}\n` : ''}\
${performanceContext ? `${performanceContext}\n` : ''}\
CALIBRATION INSTRUCTIONS:
- Estimate the fair probability INDEPENDENTLY, then compare to both YES and NO prices
- YES and NO are equally valid sides. Betting NO is just as good as betting YES when NO is underpriced
- The market price already reflects consensus. Your edge comes ONLY from information or reasoning the market hasn't priced in
- Use the domain knowledge above to identify specific biases, patterns, or inefficiencies the market may exhibit
- If you don't have a clear information advantage on EITHER side, set shouldTrade to false
- Be skeptical of your own estimates. Markets are semi-efficient
- Consider: is the NO side underpriced? Many events are LESS likely than markets suggest
- For short-term markets (< 14 days): focus on imminent catalysts, scheduled events, and near-term momentum
- For long-term markets (> 30 days): be extra skeptical — more time = more uncertainty = harder to have edge

Respond with ONLY a JSON object (no markdown, no explanation outside JSON):
{
  "probability": 0.XX,
  "confidence": "high" | "medium" | "low",
  "shouldTrade": true | false,
  "edge": 0.XX,
  "side": "YES" | "NO",
  "reasoning": "2-3 sentence reasoning citing specific knowledge or patterns. Explain why you chose YES or NO specifically.",
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
      const rawEdge = Math.abs(probability - marketProb);
      const edge = Math.min(rawEdge, 0.25); // Cap edge at 25% — no real market has 77% edge

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
        : this.provider === 'openai' ? this.config.openaiModel
        : this.config.claudeModel,
      analysisCount: this.analysisCount,
      budget: this.budget.getStats(),
      calibration: this.calibration.getStats(),
    };
  }
}
