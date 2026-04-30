/**
 * BACKTEST-1 Phase 2 Tier 1 — Brier compute + bootstrap CI + shuffle test +
 *                              calibration buckets + profit factor sim.
 *
 * Pure-math module. No DB, no I/O. Importable from generate-tier1-report.ts and
 * future Tier 2 (LLM) report generator.
 *
 * Story: BACKTEST-2-tier1-heuristic
 * Spec:  docs/projects/polymarket-trader/BACKTEST-1-scoping.md §4
 */

// ---------------------------------------------------------------------------
// Brier score
// ---------------------------------------------------------------------------

/**
 * Mean Brier Score: (1/N) * Σ (p_i - y_i)^2
 * Lower = better. Range [0, 1]. 0.25 = naive 50/50 forecast on balanced outcomes.
 */
export function brierScore(forecasts: ReadonlyArray<number>, outcomes: ReadonlyArray<number>): number {
  if (forecasts.length !== outcomes.length) {
    throw new Error(`brierScore: length mismatch (${forecasts.length} vs ${outcomes.length})`);
  }
  if (forecasts.length === 0) return NaN;
  let sumSq = 0;
  for (let i = 0; i < forecasts.length; i++) {
    const d = forecasts[i] - outcomes[i];
    sumSq += d * d;
  }
  return sumSq / forecasts.length;
}

// ---------------------------------------------------------------------------
// Bootstrap 95% CI for paired Brier difference (signal vs baseline)
// ---------------------------------------------------------------------------

export interface BootstrapResult {
  /** Mean of bootstrap distribution (baseline_BS - signal_BS). Positive = signal better. */
  meanDelta: number;
  /** 95% CI lower bound on (baseline_BS - signal_BS). */
  lower: number;
  /** 95% CI upper bound on (baseline_BS - signal_BS). */
  upper: number;
  /** Mean signal Brier across bootstrap resamples. */
  meanSignalBrier: number;
  /** Mean baseline Brier across bootstrap resamples. */
  meanBaselineBrier: number;
  /** Number of resamples performed. */
  nResamples: number;
}

/**
 * Paired bootstrap: resample (forecast_i, baseline_i, outcome_i) WITH replacement
 * `nResamples` times, compute both Briers each time, return CI on the
 * (baseline - signal) difference. Significant edge = lower bound > 0.
 *
 * Uses a deterministic LCG seed by default for reproducibility — pass `seed=null`
 * for nondeterministic Math.random.
 */
export function bootstrapCI(
  forecasts: ReadonlyArray<number>,
  baselines: ReadonlyArray<number>,
  outcomes: ReadonlyArray<number>,
  nResamples = 1000,
  alpha = 0.05,
  seed: number | null = 42,
): BootstrapResult {
  if (forecasts.length !== outcomes.length || forecasts.length !== baselines.length) {
    throw new Error('bootstrapCI: length mismatch');
  }
  const N = forecasts.length;
  if (N === 0) {
    return { meanDelta: NaN, lower: NaN, upper: NaN, meanSignalBrier: NaN, meanBaselineBrier: NaN, nResamples: 0 };
  }

  const rand = makeRng(seed);
  const deltas: number[] = new Array(nResamples);
  let sumSignal = 0;
  let sumBaseline = 0;

  for (let r = 0; r < nResamples; r++) {
    let sumSqSignal = 0;
    let sumSqBaseline = 0;
    for (let i = 0; i < N; i++) {
      const idx = Math.floor(rand() * N);
      const dS = forecasts[idx] - outcomes[idx];
      const dB = baselines[idx] - outcomes[idx];
      sumSqSignal += dS * dS;
      sumSqBaseline += dB * dB;
    }
    const bsS = sumSqSignal / N;
    const bsB = sumSqBaseline / N;
    deltas[r] = bsB - bsS;
    sumSignal += bsS;
    sumBaseline += bsB;
  }

  deltas.sort((a, b) => a - b);
  const lo = deltas[Math.floor(nResamples * (alpha / 2))];
  const hi = deltas[Math.floor(nResamples * (1 - alpha / 2))];
  const mean = deltas.reduce((s, d) => s + d, 0) / nResamples;

  return {
    meanDelta: mean,
    lower: lo,
    upper: hi,
    meanSignalBrier: sumSignal / nResamples,
    meanBaselineBrier: sumBaseline / nResamples,
    nResamples,
  };
}

// ---------------------------------------------------------------------------
// Shuffle test (permutation-based p-value)
// ---------------------------------------------------------------------------

export interface ShuffleResult {
  /** Observed Brier (no shuffling). */
  observedBrier: number;
  /** p-value: fraction of shuffled Briers <= observedBrier. */
  pValue: number;
  /** Mean Brier under null (random pairing). */
  meanNullBrier: number;
  nIterations: number;
}

/**
 * Shuffle outcomes vs forecasts `nIterations` times, recompute Brier, return
 * p-value of observed Brier under null hypothesis (random pairing). Lower
 * p = stronger evidence forecasts carry signal.
 *
 * Gate: p < 0.05 (Chip Huyen).
 */
export function shuffleTest(
  forecasts: ReadonlyArray<number>,
  outcomes: ReadonlyArray<number>,
  nIterations = 1000,
  seed: number | null = 42,
): ShuffleResult {
  if (forecasts.length !== outcomes.length) {
    throw new Error('shuffleTest: length mismatch');
  }
  const N = forecasts.length;
  if (N === 0) {
    return { observedBrier: NaN, pValue: NaN, meanNullBrier: NaN, nIterations: 0 };
  }

  const observed = brierScore(forecasts, outcomes);
  const rand = makeRng(seed);
  const shuffled = outcomes.slice() as number[];
  let count = 0;
  let sumNull = 0;

  for (let iter = 0; iter < nIterations; iter++) {
    // Fisher-Yates shuffle
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    const nullBs = brierScore(forecasts, shuffled);
    sumNull += nullBs;
    if (nullBs <= observed) count++;
  }

  return {
    observedBrier: observed,
    pValue: count / nIterations,
    meanNullBrier: sumNull / nIterations,
    nIterations,
  };
}

// ---------------------------------------------------------------------------
// Calibration buckets
// ---------------------------------------------------------------------------

export interface CalibrationBucket {
  low: number;          // bucket lower edge (inclusive)
  high: number;         // bucket upper edge (exclusive, except last bucket)
  n: number;
  predictedMean: number;  // average forecast in this bucket
  observedFreq: number;   // empirical freq of outcome=1 in this bucket
  /** |predictedMean - observedFreq|. Gate Chip Huyen: <=0.05 in all N>=10 buckets. */
  absGap: number;
}

/**
 * Bucket forecasts into nBuckets (default 10: 0-10%, 10-20%, ... 90-100%).
 * For each bucket, compare avg forecast vs empirical outcome rate.
 */
export function calibrationBuckets(
  forecasts: ReadonlyArray<number>,
  outcomes: ReadonlyArray<number>,
  nBuckets = 10,
): CalibrationBucket[] {
  if (forecasts.length !== outcomes.length) {
    throw new Error('calibrationBuckets: length mismatch');
  }
  const buckets: CalibrationBucket[] = [];
  for (let b = 0; b < nBuckets; b++) {
    const low = b / nBuckets;
    const high = (b + 1) / nBuckets;
    let n = 0;
    let sumForecast = 0;
    let sumOutcome = 0;
    for (let i = 0; i < forecasts.length; i++) {
      const f = forecasts[i];
      // Last bucket inclusive on the right (catches f === 1.0)
      const inBucket = b === nBuckets - 1
        ? f >= low && f <= high
        : f >= low && f < high;
      if (inBucket) {
        n++;
        sumForecast += f;
        sumOutcome += outcomes[i];
      }
    }
    const predictedMean = n > 0 ? sumForecast / n : 0;
    const observedFreq = n > 0 ? sumOutcome / n : 0;
    buckets.push({
      low, high, n,
      predictedMean,
      observedFreq,
      absGap: Math.abs(predictedMean - observedFreq),
    });
  }
  return buckets;
}

// ---------------------------------------------------------------------------
// Profit factor (Kelly-fractional bet sim with stress-test fees)
// ---------------------------------------------------------------------------

export interface ProfitFactorResult {
  /** Total profit / total loss (Kelly losses absolute). >1.15 = passing gate. */
  profitFactor: number;
  totalTrades: number;
  totalWins: number;
  totalLosses: number;
  totalPnl: number;
  totalProfitGross: number;
  totalLossGross: number;
  totalFeesPaid: number;
  /** Forecasts that passed minEdge filter and were traded. */
  tradedSelectorRate: number;
  /** Hit rate among traded markets. */
  hitRate: number;
}

export interface ProfitFactorOptions {
  /** Minimum edge to take a trade (mirrors auto-trader MIN_EDGE_DEFAULT). */
  minEdge?: number;
  /** Taker fee (PM 2% stress-test default per scoping decision #3). */
  feeTaker?: number;
  /** Kelly-fractional sizing — fraction of full Kelly. Default 0.05 (matches auto-trader risk-engine). */
  kellyFraction?: number;
  /** Per-trade unit stake (USD). Final size = stake * kellyFraction * kelly_pct. */
  stake?: number;
  /** Max position cap (USD). Mirrors auto-trader cap. */
  maxStake?: number;
}

const DEFAULT_OPTS: Required<ProfitFactorOptions> = {
  minEdge: 0.02,
  feeTaker: 0.02,        // PM 2% stress-test (per BACKTEST-1 scoping decision #3)
  kellyFraction: 0.05,
  // Stake here represents bankroll-scale (auto-trader uses bankroll * kellyFraction directly).
  // $1000 bankroll * 0.05 (Kelly fraction) * kelly_pct → realistic micro-bets in $1-25 range.
  stake: 1000,
  maxStake: 25,          // matches auto-trader cap
};

/**
 * Simulate Kelly-fractional bets per market.
 *
 * For each market with outcome ∈ {0,1}:
 *   - forecast_yes is our P(YES). market_yes = baseline (mid_t12h).
 *   - side = YES if forecast > baseline else NO (signal direction).
 *   - edge = |forecast - baseline|. Skip if edge < minEdge.
 *   - kelly_pct = (forecast_yes_side - market_prob_side) / (1 - market_prob_side).
 *   - bet = min(stake * kellyFraction * kelly_pct, maxStake).
 *   - PnL: if outcome matches side, gain bet * (1/market_prob - 1) - bet*fee.
 *          else lose bet (- bet*fee).
 *
 * Returns aggregate PnL + profit factor.
 */
export function profitFactor(
  forecasts: ReadonlyArray<number>,
  outcomes: ReadonlyArray<number>,
  baselines: ReadonlyArray<number>,
  opts: ProfitFactorOptions = {},
): ProfitFactorResult {
  const o = { ...DEFAULT_OPTS, ...opts };
  if (forecasts.length !== outcomes.length || forecasts.length !== baselines.length) {
    throw new Error('profitFactor: length mismatch');
  }

  let totalTrades = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let totalProfitGross = 0;
  let totalLossGross = 0;
  let totalFeesPaid = 0;

  for (let i = 0; i < forecasts.length; i++) {
    const f = forecasts[i];
    const b = baselines[i];
    const y = outcomes[i];

    const side: 'YES' | 'NO' = f > b ? 'YES' : 'NO';
    const forecastSide = side === 'YES' ? f : 1 - f;
    const marketProbSide = side === 'YES' ? b : 1 - b;
    const edge = forecastSide - marketProbSide;
    if (edge < o.minEdge) continue;
    if (marketProbSide >= 0.99) continue; // can't bet at certainty
    if (marketProbSide <= 0.01) continue;

    // Fractional Kelly: kelly_pct in [0,1]
    const kellyPct = Math.max(0, edge / (1 - marketProbSide));
    let bet = o.stake * o.kellyFraction * kellyPct;
    bet = Math.min(bet, o.maxStake);
    // Mirror auto-trader:510 — `if (suggestedSize < 1) return null`
    if (bet < 1) continue;

    totalTrades++;
    const won = side === 'YES' ? y === 1 : y === 0;
    const fee = bet * o.feeTaker;
    totalFeesPaid += fee;

    if (won) {
      const grossWin = bet * (1 / marketProbSide - 1); // payout - stake
      totalProfitGross += grossWin;
      totalWins++;
    } else {
      totalLossGross += bet;
      totalLosses++;
    }
  }

  const totalPnl = totalProfitGross - totalLossGross - totalFeesPaid;
  // Profit Factor = gross wins / (gross losses + fees)
  // (fees treated as guaranteed friction → counted on the loss side for PF)
  const denom = totalLossGross + totalFeesPaid;
  const pf = denom > 0 ? totalProfitGross / denom : (totalProfitGross > 0 ? Infinity : NaN);
  const hitRate = totalTrades > 0 ? totalWins / totalTrades : 0;

  return {
    profitFactor: pf,
    totalTrades,
    totalWins,
    totalLosses,
    totalPnl,
    totalProfitGross,
    totalLossGross,
    totalFeesPaid,
    tradedSelectorRate: totalTrades / forecasts.length,
    hitRate,
  };
}

// ---------------------------------------------------------------------------
// RNG helper (LCG for reproducibility — same seed = same shuffle/bootstrap)
// ---------------------------------------------------------------------------

function makeRng(seed: number | null): () => number {
  if (seed === null) return Math.random;
  // Numerical Recipes LCG — fast, deterministic, sufficient for resampling
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
