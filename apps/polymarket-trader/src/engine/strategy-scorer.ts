/**
 * Strategy Scorer: ranks incoming TradeSignals by composite score,
 * runs them through the Risk Engine, and emits approved/rejected events.
 *
 * Phase 1.4 — Signal ranking + deduplication + freshness gating.
 */

import { eventBus } from './event-bus.js';
import type { RiskEngine } from './risk-engine.js';
import type { TradeSignal } from '../types/index.js';

/** Scored signal with composite breakdown. */
export interface ScoredSignal {
  signal: TradeSignal;
  edgeScore: number;
  confidenceScore: number;
  liquidityScore: number;
  recencyBonus: number;
  composite: number;
}

export interface StrategyScorerConfig {
  /** Max edge used for normalisation (default 0.20 = 20%). */
  maxEdgeNorm: number;
  /** Signals older than this (ms) are rejected outright (default 5 min). */
  maxSignalAgeMs: number;
  /** Deduplication window: same market blocked for this long (ms). Default 1 h. */
  deduplicationWindowMs: number;
  /** Minimum composite score to even consider sending to Risk Engine. */
  minComposite: number;
}

const DEFAULT_CONFIG: StrategyScorerConfig = {
  maxEdgeNorm: 0.20,
  maxSignalAgeMs: 5 * 60 * 1000,
  deduplicationWindowMs: 60 * 60 * 1000,
  minComposite: 0,
};

export class StrategyScorer {
  private config: StrategyScorerConfig;
  private risk: RiskEngine;

  /** marketId -> timestamp of last approval. */
  private recentApprovals: Map<string, number> = new Map();

  /** Priority queue — processed highest-first. */
  private queue: ScoredSignal[] = [];

  /** All scored signals for observability. */
  private history: ScoredSignal[] = [];

  constructor(risk: RiskEngine, config: Partial<StrategyScorerConfig> = {}) {
    this.risk = risk;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.wireEvents();
  }

  // ------------------------------------------------------------------
  // Event wiring
  // ------------------------------------------------------------------

  private wireEvents(): void {
    eventBus.on('signal:detected', (signal: TradeSignal) => {
      this.ingest(signal);
    });
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /**
   * Score a signal and push it through the pipeline.
   * Returns the ScoredSignal (or null if rejected before scoring).
   */
  ingest(signal: TradeSignal): ScoredSignal | null {
    // 1. Freshness gate
    const ageMs = Date.now() - signal.timestamp.getTime();
    if (ageMs > this.config.maxSignalAgeMs) {
      eventBus.emit('signal:rejected', {
        signal,
        reason: `Stale signal: ${Math.round(ageMs / 1000)}s old (max ${this.config.maxSignalAgeMs / 1000}s)`,
      });
      return null;
    }

    // 2. Deduplication gate
    const lastApproval = this.recentApprovals.get(signal.marketId);
    if (lastApproval !== undefined && Date.now() - lastApproval < this.config.deduplicationWindowMs) {
      eventBus.emit('signal:rejected', {
        signal,
        reason: `Duplicate: market ${signal.marketId} already approved within deduplication window`,
      });
      return null;
    }

    // 3. Score
    const scored = this.score(signal);
    this.history.push(scored);

    // 4. Min composite check
    if (scored.composite < this.config.minComposite) {
      eventBus.emit('signal:rejected', {
        signal,
        reason: `Composite score ${scored.composite.toFixed(3)} below minimum ${this.config.minComposite}`,
      });
      return scored;
    }

    // 5. Insert into priority queue (sorted high→low)
    this.insertSorted(scored);

    // 6. Process the queue
    this.processQueue();

    return scored;
  }

  /** Score a signal without side-effects (pure calculation). */
  score(signal: TradeSignal, marketLiquidity?: number): ScoredSignal {
    const edgeScore = Math.min(signal.edge / this.config.maxEdgeNorm, 1);
    const confidenceScore = signal.confidence;
    const liquidityScore = this.calcLiquidityScore(marketLiquidity);
    const recencyBonus = this.calcRecencyBonus(signal.timestamp);

    const composite =
      edgeScore * 0.4 +
      confidenceScore * 0.3 +
      liquidityScore * 0.2 +
      recencyBonus * 0.1;

    return {
      signal,
      edgeScore,
      confidenceScore,
      liquidityScore,
      recencyBonus,
      composite,
    };
  }

  getHistory(): readonly ScoredSignal[] {
    return this.history;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  /** Manually clear deduplication cache (for testing / admin). */
  clearDeduplication(): void {
    this.recentApprovals.clear();
  }

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------

  private calcLiquidityScore(liquidity?: number): number {
    if (liquidity === undefined) return 0.5; // unknown → neutral
    // Normalise: $0 → 0, $50k+ → 1
    return Math.min(liquidity / 50_000, 1);
  }

  private calcRecencyBonus(timestamp: Date): number {
    const ageMs = Date.now() - timestamp.getTime();
    // 0 ms → 1.0, maxAge → 0.0 linearly
    return Math.max(0, 1 - ageMs / this.config.maxSignalAgeMs);
  }

  private insertSorted(scored: ScoredSignal): void {
    const idx = this.queue.findIndex((s) => s.composite < scored.composite);
    if (idx === -1) {
      this.queue.push(scored);
    } else {
      this.queue.splice(idx, 0, scored);
    }
  }

  private processQueue(): void {
    while (this.queue.length > 0) {
      const top = this.queue.shift()!;
      this.evaluateWithRisk(top);
    }
  }

  private evaluateWithRisk(scored: ScoredSignal): void {
    const { signal } = scored;
    const result = this.risk.evaluateSignal(signal);

    if (result.approved) {
      this.recentApprovals.set(signal.marketId, Date.now());
      eventBus.emit('signal:approved', {
        ...signal,
        suggestedSize: result.suggestedSize,
        composite: scored.composite,
      });
    } else {
      eventBus.emit('signal:rejected', {
        signal,
        reason: result.reason,
        composite: scored.composite,
      });
    }
  }
}
