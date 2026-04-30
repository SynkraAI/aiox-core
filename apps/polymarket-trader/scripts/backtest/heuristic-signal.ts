/**
 * BACKTEST-1 Phase 2 Tier 1 — Heuristic-only signal generator (zero LLM, zero $).
 *
 * EXTRACTED from `src/engine/auto-trader.ts::analyzeMarket` (lines ~384-535).
 * This module is a faithful, OFFLINE replay of the bot's heuristic core:
 *   - Signal 1: price-completeness mismatch (YES + NO != 1)
 *   - Signal 2: liquidity stress (vlRatio < 0.05)
 *   - Signal 3: mid-range edge (priceExtremity in [0.05, 0.30])
 *   - Signal 4: knowledge-informed bias (favorite-longshot + anchoring)
 *
 * Side selection: contrarian — bet underdog (YES if price < 0.5, else NO).
 * Edge cap: 0.25 (matches P2 BUG-4 fix in auto-trader:489).
 * modelProb: clamped at 0.90 (matches auto-trader:491-492).
 *
 * KEY DIFFERENCE vs runtime auto-trader:
 *   - No `experienceStore` or `aceEvolver` (those are stateful runtime systems).
 *     For backtest replay, we use static `experienceBoost = 0` / `experiencePenalty = 0`.
 *   - No live `KnowledgeStore` — biases hardcoded per vertical (faithful to KB defaults
 *     loaded at runtime, where politics/sports/finance/weather all expose
 *     'favorite-longshot' and 'anchoring' bias keywords from the KB MD files).
 *   - `noPrice = 1 - midPrice` (replay assumes book completeness; backtest DB only
 *     stores mid_price_t12h, not full orderbook. Signal 1 thus collapses to 0 in
 *     replay — documented limitation).
 *
 * Story: BACKTEST-2-tier1-heuristic
 * Spec:  docs/projects/polymarket-trader/BACKTEST-1-scoping.md
 */

export type Vertical = 'politics' | 'sports' | 'finance' | 'weather' | 'crypto';

export interface ReplayMarketInput {
  marketId: string;
  vertical: Vertical;
  question: string;
  /** Mid-price 12h before resolution (our T-12h baseline). Range [0,1]. */
  midPriceT12h: number;
  /** Volume at entry (USD). NULL if not available — Signal 2 disabled. */
  volumeEntryUsd: number | null;
  /** Liquidity at entry (USD). NULL if not available — Signal 2 disabled. */
  liquidityEntryUsd: number | null;
  /** Resolution timestamp (epoch_s). Used for daysToEnd calc; in replay this is
   *  always 12h from entry by definition (we evaluate at T-12h). */
  endTs: number;
  /** Entry timestamp (epoch_s). In replay = endTs - 12*3600 (the T-12h moment). */
  entryTs: number;
}

export interface ReplayHeuristicResult {
  /** Probability YES outcome will resolve to 1, in [0, 1]. */
  forecastYes: number;
  /** Side the bot would have picked (contrarian: underdog). */
  side: 'YES' | 'NO';
  /** Estimated edge (capped at 0.25). 0 if no signal. */
  edge: number;
  /** Composite confidence. 0.1-0.95. */
  confidence: number;
  /** Whether the bot would have emitted a signal (rawEdge >= MIN_EDGE). */
  shouldTrade: boolean;
  /** Reason for skipping or trading (debug). */
  reason: string;
  /** Per-signal breakdown for diagnostics. */
  diagnostics: {
    yesPrice: number;
    noPrice: number;
    priceMismatch: number;
    liquidityStress: number;
    midRangeEdge: number;
    knowledgeEdge: number;
    rawEdge: number;
    signalCount: number;
  };
}

// ---------------------------------------------------------------------------
// Constants — mirrored from auto-trader.ts (single source of truth)
// ---------------------------------------------------------------------------

const MIN_EDGE_DEFAULT = 0.02; // auto-trader default config.minEdge
const EDGE_CAP = 0.25;          // P2 BUG-4 cap
const MODEL_PROB_CAP = 0.90;    // modelProb upper bound

// Hardcoded biases per vertical — faithful replay of getVerticalBrief()
// running against the project's KB. Both 'favorite-longshot' and 'anchoring'
// are present in the standard Polymarket KB for all four verticals
// (verified in knowledge-store.ts biasKeywords logic).
const HARDCODED_BIASES: Record<Vertical, ReadonlySet<string>> = {
  politics: new Set(['favorite-longshot', 'anchoring']),
  sports:   new Set(['favorite-longshot', 'anchoring']),
  finance:  new Set(['favorite-longshot', 'anchoring']),
  weather:  new Set(['favorite-longshot', 'anchoring']),
  crypto:   new Set(['favorite-longshot', 'anchoring']),
};

// ---------------------------------------------------------------------------
// Core: heuristic forecast
// ---------------------------------------------------------------------------

/**
 * Compute the bot's heuristic forecast for a single market — purely from
 * mid_price + volume + liquidity + vertical biases. Zero network, zero LLM.
 *
 * Returns { forecastYes, side, edge, ... }. `forecastYes` is the predicted
 * P(outcome=YES), used by Brier scoring against `outcome ∈ {0,1}`.
 *
 * If shouldTrade=false, forecastYes equals midPriceT12h (the bot would have
 * deferred to market consensus → fair Brier comparison: only flagged trades
 * carry signal vs baseline).
 */
export function heuristicForecast(input: ReplayMarketInput): ReplayHeuristicResult {
  const yesPrice = input.midPriceT12h;
  const noPrice  = 1 - yesPrice;

  // ── Skip near-certain outcomes (auto-trader:389) ──
  if (yesPrice <= 0.03 || yesPrice >= 0.97) {
    return makeNoTradeResult(input, yesPrice, noPrice, 'near_certain_price_skip');
  }

  // ── Skip ultra-thin liquidity (auto-trader:390) ──
  // In replay, allow NULL liquidity (= unknown, not zero). Only skip if
  // explicitly < 100.
  if (input.liquidityEntryUsd != null && input.liquidityEntryUsd < 100) {
    return makeNoTradeResult(input, yesPrice, noPrice, 'liquidity_below_100');
  }

  // ── Signal 1: price-completeness mismatch ──
  // In replay we only have midPrice, so noPrice = 1 - yesPrice by construction
  // → priceSum = 1 always → mismatchSignal = 0. Documented limitation.
  // (At runtime, yes/no prices come from independent CLOB ticks and CAN diverge.)
  const priceSum = yesPrice + noPrice;
  const priceMismatch = Math.abs(priceSum - 1.0);
  const mismatchSignal = priceMismatch > 0.03 ? priceMismatch * 0.5 : 0;

  // ── Signal 2: volume/liquidity stress ──
  let liquidityStress = 0;
  if (input.volumeEntryUsd != null && input.liquidityEntryUsd != null && input.volumeEntryUsd > 0) {
    const vlRatio = input.liquidityEntryUsd / input.volumeEntryUsd;
    liquidityStress = vlRatio < 0.05 ? 0.02 : 0;
  }

  // ── Signal 3: mid-range edge ──
  const priceExtremity = Math.abs(yesPrice - 0.5);
  const midRangeEdge = priceExtremity > 0.05 && priceExtremity < 0.30 ? 0.02 : 0;

  // ── Signal 4: knowledge-informed bias ──
  let knowledgeEdge = 0;
  const biases = HARDCODED_BIASES[input.vertical];
  if (biases.has('favorite-longshot') && priceExtremity > 0.30) {
    knowledgeEdge = 0.015;
  }
  // Anchoring: market anchors to round numbers (every 10pp).
  // nearRound = distance to closest multiple of 0.10
  const mod = yesPrice % 0.10;
  const nearRound = Math.min(Math.abs(mod), Math.abs(mod - 0.10));
  if (biases.has('anchoring') && nearRound < 0.02) {
    knowledgeEdge = Math.max(knowledgeEdge, 0.01);
  }

  // ── Composite edge: MAX of signals (NOT sum — auto-trader:473) ──
  const rawEdge = Math.max(mismatchSignal, liquidityStress, midRangeEdge, knowledgeEdge);

  if (rawEdge < MIN_EDGE_DEFAULT) {
    // No edge → bot would NOT trade. Fallback forecast = market mid (replay neutral).
    return {
      forecastYes: yesPrice,
      side: yesPrice < 0.5 ? 'YES' : 'NO',
      edge: 0,
      confidence: 0,
      shouldTrade: false,
      reason: `no_edge (rawEdge=${rawEdge.toFixed(4)} < min=${MIN_EDGE_DEFAULT})`,
      diagnostics: {
        yesPrice, noPrice, priceMismatch, liquidityStress, midRangeEdge, knowledgeEdge, rawEdge,
        signalCount: 0,
      },
    };
  }

  // ── Determine side: contrarian (bet the underdog) ──
  const side: 'YES' | 'NO' = yesPrice < 0.5 ? 'YES' : 'NO';
  const marketProb = side === 'YES' ? yesPrice : noPrice;

  const edge = Math.min(rawEdge, EDGE_CAP);
  const modelProbSide = Math.min(MODEL_PROB_CAP, marketProb + edge);

  // Convert to forecastYes (always P(YES=1)):
  //   side=YES: forecastYes = modelProbSide (probability YES happens)
  //   side=NO:  forecastYes = 1 - modelProbSide (probability YES happens = 1 - prob NO happens)
  const forecastYes = side === 'YES' ? modelProbSide : 1 - modelProbSide;

  // Confidence (auto-trader:495-499). No experienceBoost/penalty in replay.
  const signalCount =
    (mismatchSignal > 0 ? 1 : 0) +
    (liquidityStress > 0 ? 1 : 0) +
    (midRangeEdge > 0 ? 1 : 0) +
    (knowledgeEdge > 0 ? 1 : 0);
  const knowledgeBiasCount = biases.size;
  const knowledgeBoost = knowledgeBiasCount > 0 ? 0.05 * Math.min(knowledgeBiasCount, 3) : 0;
  const confidence = Math.max(0.1, Math.min(0.95, 0.3 + signalCount * 0.2 + knowledgeBoost));

  return {
    forecastYes,
    side,
    edge,
    confidence,
    shouldTrade: true,
    reason: `signals=${signalCount} edge=${edge.toFixed(4)} side=${side}`,
    diagnostics: {
      yesPrice, noPrice, priceMismatch, liquidityStress, midRangeEdge, knowledgeEdge, rawEdge,
      signalCount,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNoTradeResult(
  input: ReplayMarketInput,
  yesPrice: number,
  noPrice: number,
  reason: string,
): ReplayHeuristicResult {
  return {
    forecastYes: yesPrice,
    side: yesPrice < 0.5 ? 'YES' : 'NO',
    edge: 0,
    confidence: 0,
    shouldTrade: false,
    reason,
    diagnostics: {
      yesPrice, noPrice,
      priceMismatch: 0, liquidityStress: 0, midRangeEdge: 0, knowledgeEdge: 0, rawEdge: 0,
      signalCount: 0,
    },
  };
}
