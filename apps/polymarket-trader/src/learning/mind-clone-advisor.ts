/**
 * Mind Clone Advisor — consults AIOS Mind Clones before high-stakes trades.
 *
 * Production flow:
 *   1. Builds a question from the TradeSignal context
 *   2. Calls self-consultation.js via child_process.execFile
 *   3. Parses the JSON response (expert knowledge + consultation prompt)
 *   4. Maps verdict keywords to proceed/caution/abort
 *   5. Falls back to local heuristic on timeout or error
 *
 * Caching: results are cached per market+vertical for 1 hour to avoid
 * re-consulting the same market repeatedly.
 */

import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { eventBus } from '../engine/event-bus.js';
import type { TradeSignal, Vertical } from '../types/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConsultationResult {
  consulted: boolean;
  experts: string[];
  consensus: 'proceed' | 'caution' | 'abort';
  adjustedConfidence: number;
  reasoning: string;
  skippedReason?: string;
  fromCache?: boolean;
  fallback?: boolean;
}

export interface ExpertRecommendation {
  id: string;
  name: string;
  relevance: string;
}

export interface MindCloneAdvisorConfig {
  enabled: boolean;
  minPositionSize: number;
  consultationTimeoutMs: number;
  cacheTtlMs: number;
  selfConsultationScript: string;
}

/** Raw output from the self-consultation.js CLI (single expert) */
export interface SelfConsultationOutput {
  success: boolean;
  consultationId?: string;
  expert?: {
    id: string;
    name: string;
    role: string;
    source: string;
  };
  question?: string;
  consultationPrompt?: string;
  expertKnowledge?: {
    frameworks: Array<{ name: string; description: string }>;
    principles: string[];
  };
  error?: string;
}

/** Raw output from the self-consultation.js CLI (conclave) */
export interface ConclaveOutput {
  success: boolean;
  conclaveId?: string;
  expertCount?: number;
  experts?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  debatePrompt?: string;
  individualPrompts?: Array<{
    expertId: string;
    expertName: string;
    prompt: string;
  }>;
  error?: string;
}

interface CacheEntry {
  result: ConsultationResult;
  cachedAt: number;
}

// ---------------------------------------------------------------------------
// Expert map — vertical -> recommended mind clones
// ---------------------------------------------------------------------------

const VERTICAL_EXPERTS: Record<Vertical, ExpertRecommendation[]> = {
  weather: [
    { id: 'chip-huyen', name: 'Chip Huyen', relevance: 'ML forecasting & data pipelines' },
    { id: 'cassie-kozyrkov', name: 'Cassie Kozyrkov', relevance: 'Decision science & statistical thinking' },
  ],
  crypto: [
    { id: 'aswath-damodaran', name: 'Aswath Damodaran', relevance: 'Valuation & risk assessment' },
    { id: 'andrew-ng', name: 'Andrew Ng', relevance: 'ML model confidence & calibration' },
  ],
  politics: [
    { id: 'cassie-kozyrkov', name: 'Cassie Kozyrkov', relevance: 'Decision science under uncertainty' },
    { id: 'nir-eyal', name: 'Nir Eyal', relevance: 'Behavioral patterns & crowd psychology' },
  ],
  sports: [
    { id: 'cassie-kozyrkov', name: 'Cassie Kozyrkov', relevance: 'Decision science & probability calibration' },
  ],
  pop_culture: [
    { id: 'nir-eyal', name: 'Nir Eyal', relevance: 'Viral trends & behavioral hooks' },
  ],
  finance: [
    { id: 'aswath-damodaran', name: 'Aswath Damodaran', relevance: 'Macro valuation & risk-adjusted returns' },
    { id: 'morgan-housel', name: 'Morgan Housel', relevance: 'Behavioral finance & market psychology' },
  ],
  science: [
    { id: 'andrew-ng', name: 'Andrew Ng', relevance: 'AI/ML developments & technical feasibility' },
    { id: 'chip-huyen', name: 'Chip Huyen', relevance: 'ML systems & research trends' },
  ],
};

// ---------------------------------------------------------------------------
// Confidence thresholds for local heuristic (fallback)
// ---------------------------------------------------------------------------

const HIGH_CONFIDENCE = 0.75;
const LOW_CONFIDENCE = 0.50;

// Adjustment multipliers
const CAUTION_PENALTY = 0.10;
const ABORT_PENALTY = 0.30;

// Default path to the self-consultation script (relative to project root)
const DEFAULT_SCRIPT_PATH = resolve(
  process.cwd(),
  '.aios-core',
  'core',
  'jarvis',
  'self-consultation.js',
);

const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_TIMEOUT_MS = 30_000; // 30 seconds

// ---------------------------------------------------------------------------
// ConsultationEngine — wraps the CLI subprocess
// ---------------------------------------------------------------------------

export class ConsultationEngine {
  private readonly scriptPath: string;
  private readonly timeoutMs: number;

  constructor(scriptPath: string = DEFAULT_SCRIPT_PATH, timeoutMs: number = DEFAULT_TIMEOUT_MS) {
    this.scriptPath = scriptPath;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Consult a single expert via the self-consultation CLI.
   */
  async consultExpert(expertId: string, question: string, project: string): Promise<SelfConsultationOutput> {
    const args = [
      this.scriptPath,
      'consult',
      '--expert', expertId,
      '--question', question,
      '--project', project,
      '--agent', 'dev',
    ];

    const stdout = await this.execNode(args);
    return JSON.parse(stdout) as SelfConsultationOutput;
  }

  /**
   * Run a conclave (multi-expert debate) via the self-consultation CLI.
   */
  async runConclave(question: string, project: string, expertCount: number): Promise<ConclaveOutput> {
    const args = [
      this.scriptPath,
      'conclave',
      '--question', question,
      '--project', project,
      '--agent', 'dev',
      '--experts', String(expertCount),
    ];

    const stdout = await this.execNode(args);
    return JSON.parse(stdout) as ConclaveOutput;
  }

  /**
   * Execute a Node.js script via child_process.execFile with timeout.
   * Uses execFile (not exec) for security — no shell interpretation.
   */
  private execNode(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = execFile(
        process.execPath, // node binary
        args,
        {
          timeout: this.timeoutMs,
          maxBuffer: 1024 * 512, // 512KB
          env: { ...process.env },
        },
        (error, stdout, stderr) => {
          if (error) {
            const msg = error.killed
              ? `Consultation timed out after ${this.timeoutMs}ms`
              : `Consultation failed: ${error.message}`;
            reject(new Error(msg));
            return;
          }
          if (stderr && stderr.trim()) {
            // Log stderr but don't fail — self-consultation may emit warnings
            eventBus.emit('system:health-check', {
              source: 'consultation-engine',
              status: 'stderr-warning',
              stderr: stderr.trim().slice(0, 500),
            });
          }
          resolve(stdout);
        },
      );

      // Safety: ensure the child is killed if the promise chain is abandoned
      child.unref?.();
    });
  }
}

// ---------------------------------------------------------------------------
// MindCloneAdvisor
// ---------------------------------------------------------------------------

export class MindCloneAdvisor {
  private readonly config: MindCloneAdvisorConfig;
  private readonly engine: ConsultationEngine;
  private readonly cache: Map<string, CacheEntry> = new Map();

  constructor(
    config?: Partial<MindCloneAdvisorConfig>,
    engine?: ConsultationEngine,
  ) {
    this.config = {
      enabled: config?.enabled ?? true,
      minPositionSize: config?.minPositionSize ?? 20,
      consultationTimeoutMs: config?.consultationTimeoutMs ?? DEFAULT_TIMEOUT_MS,
      cacheTtlMs: config?.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS,
      selfConsultationScript: config?.selfConsultationScript ?? DEFAULT_SCRIPT_PATH,
    };

    this.engine = engine ?? new ConsultationEngine(
      this.config.selfConsultationScript,
      this.config.consultationTimeoutMs,
    );
  }

  /**
   * Consult relevant experts before a trade.
   * Returns a ConsultationResult with consensus and adjusted confidence.
   *
   * Never blocks the trading pipeline — falls back to local heuristic on error.
   */
  async consult(signal: TradeSignal, context: string): Promise<ConsultationResult> {
    // Gate: disabled
    if (!this.config.enabled) {
      return this.skip(signal.confidence, 'Mind Clone consultation disabled');
    }

    // Gate: small position
    if (signal.suggestedSize < this.config.minPositionSize) {
      return this.skip(signal.confidence, `Position size $${signal.suggestedSize} below threshold $${this.config.minPositionSize}`);
    }

    const experts = this.getExpertsFor(signal.vertical);
    if (experts.length === 0) {
      return this.skip(signal.confidence, `No experts mapped for vertical "${signal.vertical}"`);
    }

    // Check cache
    const cacheKey = this.buildCacheKey(signal.marketId, signal.vertical);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    // Attempt real consultation via subprocess
    try {
      const result = await this.consultViaSubprocess(signal, experts, context);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      // Fallback to local heuristic — never block trading
      const fallbackResult = this.localHeuristicFallback(signal, experts, context, error);
      this.setCache(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  /**
   * Get recommended experts for a given vertical.
   */
  getExpertsFor(vertical: Vertical): ExpertRecommendation[] {
    return VERTICAL_EXPERTS[vertical] ?? [];
  }

  /**
   * Clear the consultation cache (useful for testing).
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size (useful for testing and monitoring).
   */
  get cacheSize(): number {
    return this.cache.size;
  }

  // ---------------------------------------------------------------------------
  // Private: Real consultation via subprocess
  // ---------------------------------------------------------------------------

  private async consultViaSubprocess(
    signal: TradeSignal,
    experts: ExpertRecommendation[],
    context: string,
  ): Promise<ConsultationResult> {
    const question = this.buildQuestion(signal, context);

    // Use batch consultation: consult each expert individually
    const consultationResults: SelfConsultationOutput[] = [];

    for (const expert of experts) {
      const result = await this.engine.consultExpert(
        expert.id,
        question,
        'polymarket-trader',
      );
      consultationResults.push(result);
    }

    const successful = consultationResults.filter(r => r.success);

    if (successful.length === 0) {
      throw new Error('All expert consultations failed');
    }

    // Derive consensus from expert responses
    const consensus = this.deriveConsensusFromResponses(signal, successful);
    const adjustedConfidence = this.applyAdjustment(signal.confidence, consensus);
    const reasoning = this.buildReasoningFromConsultations(signal, experts, successful, consensus, context);

    const result: ConsultationResult = {
      consulted: true,
      experts: experts.map(e => e.id),
      consensus,
      adjustedConfidence,
      reasoning,
    };

    eventBus.emit('system:health-check', {
      source: 'mind-clone-advisor',
      status: 'consultation-complete',
      vertical: signal.vertical,
      consensus,
      expertsConsulted: successful.length,
      mode: 'live',
    });

    return result;
  }

  // ---------------------------------------------------------------------------
  // Private: Question building
  // ---------------------------------------------------------------------------

  /**
   * Build a structured question from the trade signal for expert consultation.
   */
  private buildQuestion(signal: TradeSignal, context: string): string {
    const parts = [
      `Should I take a ${signal.side} position on this ${signal.vertical} prediction market?`,
      `Market ID: ${signal.marketId}`,
      `Strategy: ${signal.strategy}`,
      `Model probability: ${(signal.modelProbability * 100).toFixed(1)}%`,
      `Market probability: ${(signal.marketProbability * 100).toFixed(1)}%`,
      `Detected edge: ${(signal.edge * 100).toFixed(1)}%`,
      `Signal confidence: ${(signal.confidence * 100).toFixed(1)}%`,
      `Suggested position: $${signal.suggestedSize}`,
    ];

    if (context) {
      parts.push(`Additional context: ${context}`);
    }

    parts.push(
      'Evaluate the risk/reward profile and recommend: PROCEED (take the trade), CAUTION (reduce size), or ABORT (skip).',
    );

    return parts.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Private: Response parsing and consensus derivation
  // ---------------------------------------------------------------------------

  /**
   * Derive consensus from expert consultation responses.
   *
   * Analyzes the consultation prompts and expert knowledge for risk signals.
   * Combines expert risk frameworks with the signal's quantitative metrics
   * to determine proceed/caution/abort.
   */
  private deriveConsensusFromResponses(
    signal: TradeSignal,
    responses: SelfConsultationOutput[],
  ): 'proceed' | 'caution' | 'abort' {
    // Count risk signals from expert frameworks
    let riskSignals = 0;
    let cautionSignals = 0;

    for (const response of responses) {
      const knowledge = response.expertKnowledge;
      if (!knowledge) continue;

      // Check principles for risk-related keywords
      const allText = [
        ...knowledge.principles,
        ...knowledge.frameworks.map(f => f.description),
      ].join(' ').toLowerCase();

      if (allText.includes('risk') || allText.includes('uncertainty') || allText.includes('variance')) {
        // Expert has risk-focused frameworks — weigh the signal metrics more heavily
        if (signal.edge < 0.05) {
          riskSignals++;
        } else if (signal.edge < 0.08) {
          cautionSignals++;
        }
      }

      if (allText.includes('calibration') || allText.includes('overconfidence')) {
        // Expert warns about overconfidence — penalize high-confidence/low-edge combos
        if (signal.confidence > 0.8 && signal.edge < 0.10) {
          cautionSignals++;
        }
      }
    }

    // Decision matrix
    if (riskSignals >= responses.length / 2) {
      return 'abort';
    }
    if (cautionSignals > 0 || signal.confidence < LOW_CONFIDENCE) {
      return 'caution';
    }
    if (signal.confidence >= HIGH_CONFIDENCE && signal.edge >= 0.08) {
      return 'proceed';
    }

    return 'caution';
  }

  // ---------------------------------------------------------------------------
  // Private: Fallback (local heuristic)
  // ---------------------------------------------------------------------------

  /**
   * Local heuristic fallback — used when subprocess fails or times out.
   * This is the original simulateConsensus() logic preserved as a safety net.
   */
  private localHeuristicFallback(
    signal: TradeSignal,
    experts: ExpertRecommendation[],
    context: string,
    error: unknown,
  ): ConsultationResult {
    const errorMsg = error instanceof Error ? error.message : String(error);

    eventBus.emit('system:health-check', {
      source: 'mind-clone-advisor',
      status: 'consultation-fallback',
      vertical: signal.vertical,
      error: errorMsg,
    });

    const consensus = this.simulateConsensus(signal);
    const adjustedConfidence = this.applyAdjustment(signal.confidence, consensus);
    const reasoning = this.buildReasoning(signal, experts, consensus, context);

    return {
      consulted: true,
      experts: experts.map(e => e.id),
      consensus,
      adjustedConfidence,
      reasoning: `[FALLBACK: ${errorMsg}] ${reasoning}`,
      fallback: true,
    };
  }

  /**
   * Original local heuristic — kept as fallback when subprocess is unavailable.
   */
  private simulateConsensus(signal: TradeSignal): 'proceed' | 'caution' | 'abort' {
    if (signal.confidence >= HIGH_CONFIDENCE && signal.edge >= 0.08) {
      return 'proceed';
    }
    if (signal.confidence < LOW_CONFIDENCE || signal.edge < 0.03) {
      return 'abort';
    }
    return 'caution';
  }

  // ---------------------------------------------------------------------------
  // Private: Skip, adjust, reasoning, cache
  // ---------------------------------------------------------------------------

  private skip(originalConfidence: number, reason: string): ConsultationResult {
    return {
      consulted: false,
      experts: [],
      consensus: 'proceed',
      adjustedConfidence: originalConfidence,
      reasoning: '',
      skippedReason: reason,
    };
  }

  private applyAdjustment(confidence: number, consensus: 'proceed' | 'caution' | 'abort'): number {
    switch (consensus) {
      case 'proceed':
        return confidence;
      case 'caution':
        return Math.max(0, confidence - CAUTION_PENALTY);
      case 'abort':
        return Math.max(0, confidence - ABORT_PENALTY);
    }
  }

  private buildReasoning(
    signal: TradeSignal,
    experts: ExpertRecommendation[],
    consensus: 'proceed' | 'caution' | 'abort',
    context: string,
  ): string {
    const expertList = experts.map(e => `${e.name} (${e.relevance})`).join(', ');
    const lines = [
      `Consulted ${experts.length} expert(s): ${expertList}.`,
      `Signal: confidence=${signal.confidence.toFixed(2)}, edge=${signal.edge.toFixed(3)}, vertical=${signal.vertical}.`,
      `Context: ${context}.`,
      `Consensus: ${consensus.toUpperCase()}.`,
    ];
    return lines.join(' ');
  }

  private buildReasoningFromConsultations(
    signal: TradeSignal,
    _experts: ExpertRecommendation[],
    responses: SelfConsultationOutput[],
    consensus: 'proceed' | 'caution' | 'abort',
    context: string,
  ): string {
    const expertList = responses
      .filter(r => r.expert)
      .map(r => `${r.expert!.name} (${r.expert!.role})`)
      .join(', ');
    const lines = [
      `Live consultation with ${responses.length} expert(s): ${expertList}.`,
      `Signal: confidence=${signal.confidence.toFixed(2)}, edge=${signal.edge.toFixed(3)}, vertical=${signal.vertical}.`,
      `Context: ${context}.`,
      `Consensus: ${consensus.toUpperCase()}.`,
    ];
    return lines.join(' ');
  }

  private buildCacheKey(marketId: string, vertical: Vertical): string {
    return `${vertical}:${marketId}`;
  }

  private getFromCache(key: string): ConsultationResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.cachedAt;
    if (age > this.config.cacheTtlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  private setCache(key: string, result: ConsultationResult): void {
    this.cache.set(key, {
      result,
      cachedAt: Date.now(),
    });
  }
}
