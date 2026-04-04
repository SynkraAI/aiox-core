/**
 * ACE — Adaptive Context Evolution.
 * Strategy prompts evolve based on trading performance.
 *
 * Every N trades (default 100) per strategy, ACE analyses WIN/LOSS patterns
 * and nudges tunable parameters toward better performance:
 *   - High win rate  → slightly more aggressive (lower minEdge)
 *   - Low win rate   → more conservative (higher minEdge, smaller positions)
 *   - Stable         → no change
 *
 * Pure logic — zero async, zero external deps.
 */

import { eventBus } from '../engine/event-bus.js';
import { ACE_CONFIG } from '../config/defaults.js';
import type { TradeExperience, StrategyId } from '../types/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PromptVersion {
  strategy: StrategyId;
  version: string;
  parameters: Record<string, number>;
  createdAt: Date;
  tradesEvaluated: number;
  winRate: number;
}

export interface EvolutionResult {
  strategy: StrategyId;
  fromVersion: string;
  toVersion: string;
  changes: string[];
  reason: string;
  expectedImprovement: string;
  timestamp: Date;
}

export interface AceEvolverConfig {
  tradesPerEvolution: number;
  minTrades: number;
}

// ---------------------------------------------------------------------------
// Default parameters per strategy
// ---------------------------------------------------------------------------

const DEFAULT_PARAMS: Record<StrategyId, Record<string, number>> = {
  info_arb: {
    minEdge: 0.08,
    confidenceWeight: 1.0,
    sentimentWeight: 0.5,
  },
  weather_model: {
    minEdge: 0.08,
    maxLeadDays: 2,
    confidenceWeight: 1.0,
  },
  crypto_sentiment: {
    minEdge: 0.08,
    confidenceWeight: 1.0,
    sentimentWeight: 0.7,
  },
  market_making: {
    minEdge: 0.08,
    confidenceWeight: 1.0,
  },
  cross_platform: {
    minEdge: 0.08,
    confidenceWeight: 1.0,
  },
  whale_follow: {
    minEdge: 0.05,
    confidenceWeight: 1.0,
  },
  airdrop_volume: {
    minEdge: 0.0,
    confidenceWeight: 0.5,
  },
  politics_model: {
    minEdge: 0.10,
    confidenceWeight: 1.0,
  },
  sports_model: {
    minEdge: 0.08,
    confidenceWeight: 1.0,
  },
};

// ---------------------------------------------------------------------------
// Win-rate thresholds
// ---------------------------------------------------------------------------

const HIGH_WIN_RATE = 0.70;
const LOW_WIN_RATE = 0.55;

// Adjustment magnitudes
const AGGRESSIVE_EDGE_DELTA = -0.005;   // Lower minEdge by 0.5%
const CONSERVATIVE_EDGE_DELTA = 0.01;   // Raise minEdge by 1%
const CONSERVATIVE_CONFIDENCE_BUMP = 0.05;

// Bounds
const MIN_EDGE_FLOOR = 0.02;
const MIN_EDGE_CEILING = 0.20;
const CONFIDENCE_WEIGHT_MAX = 2.0;
// CONFIDENCE_WEIGHT_MIN reserved for future conservative floor

// ---------------------------------------------------------------------------
// AceEvolver
// ---------------------------------------------------------------------------

export class AceEvolver {
  private readonly config: AceEvolverConfig;
  private readonly tradeBuffers: Map<StrategyId, TradeExperience[]> = new Map();
  private readonly currentVersions: Map<StrategyId, PromptVersion> = new Map();
  private readonly evolutionHistory: EvolutionResult[] = [];

  constructor(config?: Partial<AceEvolverConfig>) {
    this.config = {
      tradesPerEvolution: config?.tradesPerEvolution ?? ACE_CONFIG.tradesPerEvolution,
      minTrades: config?.minTrades ?? ACE_CONFIG.minTradesForBaseline,
    };
  }

  /**
   * Record a completed trade for evolution tracking.
   * Only settled trades (WIN/LOSS) count.
   */
  recordResult(experience: TradeExperience): void {
    if (experience.outcome === 'PENDING') return;

    const strategy = experience.strategy;
    if (!this.tradeBuffers.has(strategy)) {
      this.tradeBuffers.set(strategy, []);
    }
    this.tradeBuffers.get(strategy)!.push(experience);
  }

  /**
   * Check all strategies for evolution readiness. Returns the first
   * evolution triggered, or null if none are due.
   */
  checkAndEvolve(): EvolutionResult | null {
    for (const [strategy, buffer] of this.tradeBuffers.entries()) {
      if (buffer.length >= this.config.tradesPerEvolution) {
        return this.evolveStrategy(strategy, buffer);
      }
    }
    return null;
  }

  /**
   * Get the current prompt version for a strategy.
   * Returns an initial version if the strategy has not evolved yet.
   */
  getPromptVersion(strategy: StrategyId): PromptVersion {
    const existing = this.currentVersions.get(strategy);
    if (existing) return existing;

    // Initial version — never evolved
    const params = { ...(DEFAULT_PARAMS[strategy] ?? { minEdge: 0.08, confidenceWeight: 1.0 }) };
    const initial: PromptVersion = {
      strategy,
      version: '1.0',
      parameters: params,
      createdAt: new Date(),
      tradesEvaluated: 0,
      winRate: 0,
    };
    this.currentVersions.set(strategy, initial);
    return initial;
  }

  /**
   * Return the full evolution history across all strategies.
   */
  getHistory(): EvolutionResult[] {
    return [...this.evolutionHistory];
  }

  // ---------------------------------------------------------------------------
  // Private — evolution logic
  // ---------------------------------------------------------------------------

  private evolveStrategy(strategy: StrategyId, buffer: TradeExperience[]): EvolutionResult {
    const current = this.getPromptVersion(strategy);
    const wins = buffer.filter(t => t.outcome === 'WIN').length;
    const winRate = buffer.length > 0 ? wins / buffer.length : 0;

    const newParams = { ...current.parameters };
    const changes: string[] = [];
    let reason: string;
    let expectedImprovement: string;

    if (winRate > HIGH_WIN_RATE) {
      // High performance — get slightly more aggressive
      reason = `Win rate ${(winRate * 100).toFixed(1)}% exceeds ${HIGH_WIN_RATE * 100}% — increasing aggressiveness`;
      expectedImprovement = 'Capture more marginal opportunities';

      if (newParams.minEdge !== undefined) {
        const prev = newParams.minEdge;
        newParams.minEdge = Math.max(MIN_EDGE_FLOOR, newParams.minEdge + AGGRESSIVE_EDGE_DELTA);
        if (newParams.minEdge !== prev) {
          changes.push(`minEdge: ${prev.toFixed(4)} -> ${newParams.minEdge.toFixed(4)}`);
        }
      }
    } else if (winRate < LOW_WIN_RATE) {
      // Under-performing — increase conservatism
      reason = `Win rate ${(winRate * 100).toFixed(1)}% below ${LOW_WIN_RATE * 100}% — increasing conservatism`;
      expectedImprovement = 'Filter out low-quality trades';

      if (newParams.minEdge !== undefined) {
        const prev = newParams.minEdge;
        newParams.minEdge = Math.min(MIN_EDGE_CEILING, newParams.minEdge + CONSERVATIVE_EDGE_DELTA);
        if (newParams.minEdge !== prev) {
          changes.push(`minEdge: ${prev.toFixed(4)} -> ${newParams.minEdge.toFixed(4)}`);
        }
      }
      if (newParams.confidenceWeight !== undefined) {
        const prev = newParams.confidenceWeight;
        newParams.confidenceWeight = Math.min(CONFIDENCE_WEIGHT_MAX, newParams.confidenceWeight + CONSERVATIVE_CONFIDENCE_BUMP);
        if (newParams.confidenceWeight !== prev) {
          changes.push(`confidenceWeight: ${prev.toFixed(2)} -> ${newParams.confidenceWeight.toFixed(2)}`);
        }
      }
    } else {
      // Stable zone — no changes
      reason = `Win rate ${(winRate * 100).toFixed(1)}% in stable range (${LOW_WIN_RATE * 100}%-${HIGH_WIN_RATE * 100}%) — no adjustment`;
      expectedImprovement = 'Maintain current performance';
    }

    // Bump version
    const fromVersion = current.version;
    const toVersion = this.bumpVersion(fromVersion);

    // Build new prompt version
    const newVersion: PromptVersion = {
      strategy,
      version: toVersion,
      parameters: newParams,
      createdAt: new Date(),
      tradesEvaluated: buffer.length,
      winRate,
    };
    this.currentVersions.set(strategy, newVersion);

    // Clear processed trades
    this.tradeBuffers.set(strategy, []);

    // Build result
    const result: EvolutionResult = {
      strategy,
      fromVersion,
      toVersion,
      changes,
      reason,
      expectedImprovement,
      timestamp: new Date(),
    };

    this.evolutionHistory.push(result);
    eventBus.emit('learning:prompt-evolved', result);

    return result;
  }

  private bumpVersion(version: string): string {
    const parts = version.split('.');
    const major = parseInt(parts[0] ?? '1', 10);
    const minor = parseInt(parts[1] ?? '0', 10);
    return `${major}.${minor + 1}`;
  }
}
