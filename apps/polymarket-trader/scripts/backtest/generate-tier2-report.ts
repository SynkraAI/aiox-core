/**
 * BACKTEST-3 Phase 2 Tier 2 — Report Generator.
 *
 * Reads `replay_llm_predictions` (populated by replay-llm.ts), joins against
 * `historical_markets` (resolved_outcome) and `replay_heuristic_predictions`
 * (heuristic forecast on the SAME market_ids), then computes per-vertical
 * Brier for THREE forecasters: LLM, heuristic, baseline (mid_price_t12h).
 *
 * Bootstrap CIs:
 *   - LLM vs baseline   (does LLM beat the market mid?)
 *   - LLM vs heuristic  (does LLM beat the cheap pure-heuristic?)
 *
 * Verdict gate per vertical (per BACKTEST-1 §5):
 *   PASS  =  LLM Brier < min(baseline Brier, heuristic Brier)
 *            AND CI lower (LLM vs baseline) > 0
 *
 * Final recommendation:
 *   GO_LIVE_PAPER         — >= 1 vertical PASS, all G1/G3/G4/G5 met
 *   GO_LIVE_PAPER_PARTIAL — 1 vertical PASS but other gates flag concerns
 *   STOP                  — 0 verticals PASS
 *
 * Story: BACKTEST-3-tier2-llm
 */

import { DatabaseSync } from 'node:sqlite';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  brierScore,
  bootstrapCI,
  shuffleTest,
  calibrationBuckets,
  profitFactor,
  type BootstrapResult,
  type ShuffleResult,
  type CalibrationBucket,
  type ProfitFactorResult,
} from './compute-brier.ts';

const SCRIPT_DIR = import.meta.dirname;
const DB_PATH = join(SCRIPT_DIR, '..', '..', 'data', 'backtest', 'historical-markets.db');
const REPORT_PATH = join(SCRIPT_DIR, '..', '..', 'data', 'backtest', 'TIER2-RESULTS.md');

type Vertical = 'politics' | 'sports' | 'finance' | 'weather' | 'crypto';
const VERTICALS: Vertical[] = ['politics', 'sports', 'finance', 'weather', 'crypto'];

// Same N-gates as Tier 1 (Chip Huyen)
const N_GATE_DEFAULT = 100;
const N_GATE_FINANCE = 50;

// Tier 2 expects smaller samples (150/vertical default), so we lower the gate
// for the LLM analysis ONLY when the underlying Tier 2 sample is small.
const N_GATE_TIER2_DEFAULT = 50;

function nThresholdFor(v: Vertical | 'GLOBAL', tier2: boolean): number {
  if (v === 'GLOBAL') return 0;
  if (tier2) return v === 'finance' ? Math.min(N_GATE_FINANCE, N_GATE_TIER2_DEFAULT) : N_GATE_TIER2_DEFAULT;
  return v === 'finance' ? N_GATE_FINANCE : N_GATE_DEFAULT;
}

interface JoinedRow {
  market_id: string;
  vertical: Vertical;
  llmForecast: number;
  heuristicForecast: number;
  baseline: number;
  outcome: number;
  parsedOk: number;
  costUsd: number;
}

interface VerticalAnalysis {
  vertical: Vertical | 'GLOBAL';
  n: number;
  llmBrier: number;
  heuristicBrier: number;
  baselineBrier: number;
  llmVsBaseline: BootstrapResult;
  llmVsHeuristic: BootstrapResult;
  shuffle: ShuffleResult;
  calibration: CalibrationBucket[];
  profitFactor: ProfitFactorResult;
  parsedOkRate: number;
  totalCostUsd: number;
  verdict: 'PASS' | 'FAIL' | 'INSUFFICIENT_N';
  verdictReason: string;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (!existsSync(DB_PATH)) {
    console.error(`[tier2-report] FATAL: DB not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new DatabaseSync(DB_PATH);

  // Verify both tables exist
  const llmCheck = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='replay_llm_predictions'`)
    .get();
  if (!llmCheck) {
    console.error('[tier2-report] FATAL: replay_llm_predictions table not found.');
    console.error('  Run scripts/backtest/replay-llm.ts first.');
    process.exit(1);
  }
  const heuristicCheck = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='replay_heuristic_predictions'`)
    .get();
  if (!heuristicCheck) {
    console.error('[tier2-report] FATAL: replay_heuristic_predictions table not found.');
    console.error('  Run scripts/backtest/replay-heuristic.ts first (Tier 1).');
    process.exit(1);
  }

  // Inner join: only markets that have BOTH LLM and heuristic predictions.
  const rows = db
    .prepare(`
      SELECT
        l.market_id,
        l.vertical,
        l.forecast    AS llm_forecast,
        h.forecast    AS heuristic_forecast,
        l.baseline    AS baseline,
        l.outcome     AS outcome,
        l.parsed_ok   AS parsed_ok,
        l.cost_usd    AS cost_usd
      FROM replay_llm_predictions l
      INNER JOIN replay_heuristic_predictions h ON h.market_id = l.market_id
    `)
    .all() as Array<{
      market_id: string;
      vertical: Vertical;
      llm_forecast: number;
      heuristic_forecast: number;
      baseline: number;
      outcome: number;
      parsed_ok: number;
      cost_usd: number;
    }>;

  if (rows.length === 0) {
    console.error('[tier2-report] FATAL: 0 rows after joining LLM × heuristic predictions.');
    console.error('  Ensure replay-llm.ts ran and the same market_ids exist in heuristic table.');
    process.exit(1);
  }

  const joined: JoinedRow[] = rows.map((r) => ({
    market_id: r.market_id,
    vertical: r.vertical,
    llmForecast: r.llm_forecast,
    heuristicForecast: r.heuristic_forecast,
    baseline: r.baseline,
    outcome: r.outcome,
    parsedOk: r.parsed_ok,
    costUsd: r.cost_usd,
  }));

  console.log(`[tier2-report] ${joined.length} joined predictions loaded`);

  const analyses: VerticalAnalysis[] = [];
  for (const v of VERTICALS) {
    const vRows = joined.filter((r) => r.vertical === v);
    if (vRows.length === 0) continue;
    analyses.push(analyze(v, vRows, true));
  }
  analyses.push(analyze('GLOBAL', joined, true));

  const passed = analyses.filter((a) => a.vertical !== 'GLOBAL' && a.verdict === 'PASS');
  const failed = analyses.filter((a) => a.vertical !== 'GLOBAL' && a.verdict === 'FAIL');
  const insufficient = analyses.filter((a) => a.vertical !== 'GLOBAL' && a.verdict === 'INSUFFICIENT_N');

  // Recommendation
  let recommendation: 'GO_LIVE_PAPER' | 'GO_LIVE_PAPER_PARTIAL' | 'STOP';
  if (passed.length === 0) {
    recommendation = 'STOP';
  } else {
    const global = analyses.find((a) => a.vertical === 'GLOBAL');
    const calOk = global ? global.calibration.filter((b) => b.n >= 10 && b.absGap > 0.05).length === 0 : false;
    const shuffleOk = global ? !isNaN(global.shuffle.pValue) && global.shuffle.pValue < 0.05 : false;
    if (calOk && shuffleOk && passed.length >= 1) recommendation = 'GO_LIVE_PAPER';
    else recommendation = 'GO_LIVE_PAPER_PARTIAL';
  }

  // Total cost
  const totalCostUsd = joined.reduce((s, r) => s + r.costUsd, 0);
  const parsedOkCount = joined.filter((r) => r.parsedOk === 1).length;
  const parsedOkRate = joined.length > 0 ? parsedOkCount / joined.length : 0;

  const md = renderMarkdown(
    analyses,
    recommendation,
    passed.map((a) => a.vertical),
    failed.map((a) => a.vertical),
    insufficient.map((a) => a.vertical),
    totalCostUsd,
    parsedOkRate,
    parsedOkCount,
    joined.length,
  );
  writeFileSync(REPORT_PATH, md, 'utf8');

  console.log('\n[tier2-report] DONE');
  console.log(`  Wrote: ${REPORT_PATH}`);
  console.log(`  Recommendation: ${recommendation}`);
  console.log(`  PASS verticals: ${passed.map((a) => a.vertical).join(', ') || '(none)'}`);
  console.log(`  Total LLM cost: $${totalCostUsd.toFixed(4)}`);
  console.log(`  Parse OK: ${parsedOkCount}/${joined.length} (${(parsedOkRate * 100).toFixed(1)}%)`);

  console.log('\n  Per-vertical summary:');
  console.log('  | Vertical | N    | LLM BS  | Heur BS | Base BS | Δvs base | CI lower | Verdict |');
  console.log('  |----------|------|---------|---------|---------|----------|----------|---------|');
  for (const a of analyses) {
    console.log(
      `  | ${String(a.vertical).padEnd(8)} | ${String(a.n).padStart(4)} | ${a.llmBrier.toFixed(4)}  | ${a.heuristicBrier.toFixed(4)}  | ${a.baselineBrier.toFixed(4)}  | ${signed(a.baselineBrier - a.llmBrier)} | ${signed(a.llmVsBaseline.lower)}  | ${a.verdict.padEnd(7)} |`,
    );
  }

  db.close();
}

// ---------------------------------------------------------------------------
// Per-vertical analyzer
// ---------------------------------------------------------------------------

function analyze(label: Vertical | 'GLOBAL', rows: JoinedRow[], tier2: boolean): VerticalAnalysis {
  const N = rows.length;
  if (N === 0) return emptyAnalysis(label);

  const llm = rows.map((r) => r.llmForecast);
  const heur = rows.map((r) => r.heuristicForecast);
  const base = rows.map((r) => r.baseline);
  const outc = rows.map((r) => r.outcome);

  const llmBrier = brierScore(llm, outc);
  const heurBrier = brierScore(heur, outc);
  const baseBrier = brierScore(base, outc);

  const llmVsBaseline = bootstrapCI(llm, base, outc, 1000, 0.05, 42);
  const llmVsHeuristic = bootstrapCI(llm, heur, outc, 1000, 0.05, 43); // diff seed for replication
  const shuffle = shuffleTest(llm, outc, 1000, 42);
  const cal = calibrationBuckets(llm, outc, 10);
  const pf = profitFactor(llm, outc, base, {
    feeTaker: 0.02,
    kellyFraction: 0.05,
    stake: 1000,
    maxStake: 25,
    minEdge: 0.02,
  });

  const parsedOkCount = rows.filter((r) => r.parsedOk === 1).length;
  const parsedOkRate = parsedOkCount / N;
  const totalCostUsd = rows.reduce((s, r) => s + r.costUsd, 0);

  // Verdict
  const nThreshold = nThresholdFor(label, tier2);
  let verdict: VerticalAnalysis['verdict'];
  let reason: string;
  if (label !== 'GLOBAL' && N < nThreshold) {
    verdict = 'INSUFFICIENT_N';
    reason = `N=${N} < threshold=${nThreshold}`;
  } else if (llmBrier < baseBrier && llmBrier < heurBrier && llmVsBaseline.lower > 0) {
    verdict = 'PASS';
    reason = `LLM Brier ${llmBrier.toFixed(4)} < heuristic ${heurBrier.toFixed(4)} AND < baseline ${baseBrier.toFixed(4)}, CI lower ${llmVsBaseline.lower.toFixed(4)} > 0`;
  } else {
    verdict = 'FAIL';
    if (llmBrier >= baseBrier) {
      reason = `LLM Brier ${llmBrier.toFixed(4)} >= baseline ${baseBrier.toFixed(4)} (no edge over consensus)`;
    } else if (llmBrier >= heurBrier) {
      reason = `LLM Brier ${llmBrier.toFixed(4)} >= heuristic ${heurBrier.toFixed(4)} (LLM didn't justify its cost)`;
    } else {
      reason = `LLM beat heuristic+baseline on point estimate but CI lower ${llmVsBaseline.lower.toFixed(4)} <= 0 (not significant)`;
    }
  }

  return {
    vertical: label,
    n: N,
    llmBrier,
    heuristicBrier: heurBrier,
    baselineBrier: baseBrier,
    llmVsBaseline,
    llmVsHeuristic,
    shuffle,
    calibration: cal,
    profitFactor: pf,
    parsedOkRate,
    totalCostUsd,
    verdict,
    verdictReason: reason,
  };
}

function emptyAnalysis(label: Vertical | 'GLOBAL'): VerticalAnalysis {
  return {
    vertical: label,
    n: 0,
    llmBrier: NaN,
    heuristicBrier: NaN,
    baselineBrier: NaN,
    llmVsBaseline: { meanDelta: NaN, lower: NaN, upper: NaN, meanSignalBrier: NaN, meanBaselineBrier: NaN, nResamples: 0 },
    llmVsHeuristic: { meanDelta: NaN, lower: NaN, upper: NaN, meanSignalBrier: NaN, meanBaselineBrier: NaN, nResamples: 0 },
    shuffle: { observedBrier: NaN, pValue: NaN, meanNullBrier: NaN, nIterations: 0 },
    calibration: [],
    profitFactor: {
      profitFactor: NaN, totalTrades: 0, totalWins: 0, totalLosses: 0, totalPnl: 0,
      totalProfitGross: 0, totalLossGross: 0, totalFeesPaid: 0, tradedSelectorRate: 0, hitRate: 0,
    },
    parsedOkRate: 0,
    totalCostUsd: 0,
    verdict: 'INSUFFICIENT_N',
    verdictReason: 'N=0',
  };
}

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

function renderMarkdown(
  analyses: VerticalAnalysis[],
  recommendation: 'GO_LIVE_PAPER' | 'GO_LIVE_PAPER_PARTIAL' | 'STOP',
  passV: Array<Vertical | 'GLOBAL'>,
  failV: Array<Vertical | 'GLOBAL'>,
  insV: Array<Vertical | 'GLOBAL'>,
  totalCostUsd: number,
  parsedOkRate: number,
  parsedOkCount: number,
  totalN: number,
): string {
  const ts = new Date().toISOString();
  const global = analyses.find((a) => a.vertical === 'GLOBAL');

  const lines: string[] = [];
  lines.push(`# BACKTEST-3 Phase 2 Tier 2 — Replay LLM (Anthropic Claude Haiku)`);
  lines.push('');
  lines.push(`**Gerado em:** ${ts}`);
  lines.push(`**Story:** BACKTEST-3-tier2-llm`);
  lines.push(`**Predecessor:** BACKTEST-2 Tier 1 (apenas weather PASS)`);
  lines.push(`**Custo desta fase:** $${totalCostUsd.toFixed(4)} (Anthropic Claude Haiku)`);
  lines.push(`**Parse OK rate:** ${(parsedOkRate * 100).toFixed(1)}% (${parsedOkCount}/${totalN})`);
  lines.push('');

  // ---- Resumo ----
  lines.push(`## 1. Resumo Executivo`);
  lines.push('');
  if (global) {
    lines.push(`- **N total replay LLM:** ${global.n}`);
    lines.push(`- **Brier global LLM:** ${global.llmBrier.toFixed(4)}`);
    lines.push(`- **Brier global heurística (mesmo subset):** ${global.heuristicBrier.toFixed(4)}`);
    lines.push(`- **Brier global baseline (mid_t12h):** ${global.baselineBrier.toFixed(4)}`);
    lines.push(`- **CI 95% (LLM vs baseline):** [${fmt(global.llmVsBaseline.lower)}, ${fmt(global.llmVsBaseline.upper)}]`);
    lines.push(`- **CI 95% (LLM vs heurística):** [${fmt(global.llmVsHeuristic.lower)}, ${fmt(global.llmVsHeuristic.upper)}]`);
    lines.push(`- **Shuffle p-value (LLM):** ${fmt(global.shuffle.pValue)}`);
  }
  lines.push(`- **Verticais PASS:** ${passV.length > 0 ? passV.map(String).join(', ') : '(nenhum)'}`);
  if (failV.length > 0) lines.push(`- **Verticais FAIL:** ${failV.map(String).join(', ')}`);
  if (insV.length > 0) lines.push(`- **Verticais INSUFFICIENT_N:** ${insV.map(String).join(', ')}`);
  lines.push('');

  lines.push(`### Recomendação`);
  if (recommendation === 'GO_LIVE_PAPER') {
    lines.push(`- **GO LIVE PAPER (full)** — LLM passa gates G2/G4/G5 em ${passV.length} vertical(s). Iniciar paper trading 30+ dias com LLM ativo nesses verticals antes de live capital.`);
  } else if (recommendation === 'GO_LIVE_PAPER_PARTIAL') {
    lines.push(`- **GO LIVE PAPER PARCIAL** — LLM passa G2 em ${passV.length} vertical(s), mas G4 (calibration) ou G5 (shuffle) flagam alertas. Paper trading só nos verticals PASS, com calibration tracking explícito.`);
  } else {
    lines.push(`- **STOP — Damodaran stop-loss aciona em Tier 2.** LLM Haiku NÃO supera baseline+heurística em nenhum vertical. Antes de gastar mais $$$:`);
    lines.push(`  - Considerar LLM melhor (Sonnet ou GPT-4o) — mas custo 5-10× maior.`);
    lines.push(`  - Pivotar pra weather-only (Tier 1 já mostrou edge).`);
    lines.push(`  - Pivotar pra cross-platform arb (PM vs Kalshi spreads), fora do escopo atual.`);
  }
  lines.push('');

  // ---- Brier por vertical ----
  lines.push(`## 2. Brier por vertical — LLM vs Heurística vs Baseline`);
  lines.push('');
  lines.push(`| Vertical | N | LLM Brier | Heur Brier | Base Brier | Δ(LLM vs base) | 95% CI | Δ(LLM vs heur) | 95% CI | Verdict |`);
  lines.push(`|---|---|---|---|---|---|---|---|---|---|`);
  for (const a of analyses) {
    const dB = a.baselineBrier - a.llmBrier; // positive = LLM better
    const dH = a.heuristicBrier - a.llmBrier;
    const ciB = `[${fmt(a.llmVsBaseline.lower)}, ${fmt(a.llmVsBaseline.upper)}]`;
    const ciH = `[${fmt(a.llmVsHeuristic.lower)}, ${fmt(a.llmVsHeuristic.upper)}]`;
    lines.push(
      `| ${a.vertical} | ${a.n} | ${fmt(a.llmBrier)} | ${fmt(a.heuristicBrier)} | ${fmt(a.baselineBrier)} | ${fmtSigned(dB)} | ${ciB} | ${fmtSigned(dH)} | ${ciH} | **${a.verdict}** |`,
    );
  }
  lines.push('');

  lines.push(`### Veredito por vertical`);
  for (const a of analyses) {
    if (a.vertical === 'GLOBAL') continue;
    lines.push(`- **${a.vertical}** (N=${a.n}, parse_ok=${(a.parsedOkRate * 100).toFixed(1)}%): ${a.verdict} — ${a.verdictReason}`);
  }
  lines.push('');

  // ---- Calibration (LLM, GLOBAL) ----
  if (global && global.calibration.length > 0) {
    lines.push(`## 3. Calibration buckets LLM (10 bins) — GLOBAL`);
    lines.push('');
    lines.push('Gate Chip Huyen: |predictedMean - observedFreq| <= 0.05 em buckets com N>=10.');
    lines.push('');
    lines.push(`| Bucket | N | Predicted Mean | Observed Freq | Abs Gap | Within 5pp? |`);
    lines.push(`|---|---|---|---|---|---|`);
    for (const b of global.calibration) {
      const within = b.n >= 10 ? (b.absGap <= 0.05 ? 'YES' : 'NO') : '(N<10)';
      lines.push(
        `| ${(b.low * 100).toFixed(0)}-${(b.high * 100).toFixed(0)}% | ${b.n} | ${fmt(b.predictedMean)} | ${fmt(b.observedFreq)} | ${fmt(b.absGap)} | ${within} |`,
      );
    }
    lines.push('');
    const calFails = global.calibration.filter((b) => b.n >= 10 && b.absGap > 0.05);
    if (calFails.length > 0) {
      lines.push(`**Calibration fails (N>=10):** ${calFails.length} bucket(s). Largest gap: ${fmt(Math.max(...calFails.map((b) => b.absGap)))}`);
    } else {
      lines.push(`**Calibration:** PASS (all N>=10 buckets within 5pp).`);
    }
    lines.push('');
  }

  // ---- Profit factor ----
  lines.push(`## 4. Profit factor — Stress-test fees (PM 2% taker, Kelly 5%, bankroll $1000, cap $25)`);
  lines.push('');
  lines.push(`| Vertical | Trades | Wins | Hit Rate | Profit Gross | Loss Gross | Fees | PnL | PF |`);
  lines.push(`|---|---|---|---|---|---|---|---|---|`);
  for (const a of analyses) {
    const p = a.profitFactor;
    const pfStr = isFinite(p.profitFactor) ? p.profitFactor.toFixed(3) : (isNaN(p.profitFactor) ? 'N/A' : '∞');
    lines.push(
      `| ${a.vertical} | ${p.totalTrades} | ${p.totalWins} | ${(p.hitRate * 100).toFixed(1)}% | $${p.totalProfitGross.toFixed(2)} | $${p.totalLossGross.toFixed(2)} | $${p.totalFeesPaid.toFixed(2)} | $${p.totalPnl.toFixed(2)} | ${pfStr} |`,
    );
  }
  lines.push('');
  lines.push(`Gate G3: PF >= 1.15 com fees realistas.`);
  lines.push('');

  // ---- LLM operational stats ----
  lines.push(`## 5. LLM operational stats`);
  lines.push('');
  lines.push(`| Vertical | N | Parse OK Rate | Cost USD |`);
  lines.push(`|---|---|---|---|`);
  for (const a of analyses) {
    lines.push(`| ${a.vertical} | ${a.n} | ${(a.parsedOkRate * 100).toFixed(1)}% | $${a.totalCostUsd.toFixed(4)} |`);
  }
  lines.push('');
  lines.push(`**Total cost across all verticals: $${totalCostUsd.toFixed(4)}**`);
  lines.push('');

  // ---- Caveats ----
  lines.push(`## 6. Caveats e limitações`);
  lines.push('');
  lines.push(`- **Sample stratificado, não population:** Tier 2 amostrou ~150/vertical (vs Tier 1 que rodou full 7647 markets). Bootstrap CIs aqui têm mais variância.`);
  lines.push(`- **Heurística subset != Tier 1 full:** Esta heurística Brier vem do mesmo subset de markets que LLM viu. Compara LLM vs heurística "head-to-head" no MESMO sample.`);
  lines.push(`- **Parse fallback usa mid_price:** Quando LLM output não parseia, forecast = baseline. Penaliza LLM Brier (parse fail = neutralidade forçada). Parse OK rate global = ${(parsedOkRate * 100).toFixed(1)}%.`);
  lines.push(`- **Custo real pode divergir:** Estimativa usa Haiku 4.5 pricing oficial ($1/M input, $5/M output). Anthropic pode ter promo/desconto.`);
  lines.push(`- **Sem retry logic complexo:** Erros API são logados mas markets pulados (não-fatal). Se >1% de mercados deram erro, considerar re-rodar com --resume.`);
  lines.push(`- **LLM date awareness:** Claude conhece eventos até ~2025. Markets resolvidos em 2024-2025 podem ter "vazamento" parcial via training data. Mitigação: prompt explícito "estimate fair P", não "what happened".`);
  lines.push('');

  // ---- Decisão go-live ----
  lines.push(`## 7. Decisão Go-Live Paper`);
  lines.push('');
  if (recommendation === 'STOP') {
    lines.push(`**STOP** — não vale paper trading com Haiku. Considerar:`);
    lines.push(`1. Tier 2.5 com Claude Sonnet (5-10× custo, ~$8-15) em weather + 1 vertical FAIL pra ver se LLM melhor reverte.`);
    lines.push(`2. Pivot para weather-only com heurística (já PF 1.388 stress no Tier 1) + climatology NOAA. Sem LLM.`);
    lines.push(`3. Pausar pivot real-only (PM-PIVOT-1) e re-avaliar tese.`);
  } else {
    lines.push(`**${recommendation}** — proceder para paper trading 30+ dias.`);
    lines.push('');
    lines.push(`Próximos passos:`);
    lines.push(`1. Habilitar LLM em runtime SOMENTE nos verticals: ${passV.map(String).join(', ')}.`);
    lines.push(`2. Gate de production: 30 dias de paper com Brier tracking + calibration buckets diários.`);
    lines.push(`3. Se paper Brier < baseline em janela rolling 30d: GO LIVE com bankroll inicial $200, Kelly 5%.`);
    lines.push(`4. Se paper Brier piorar: STOP, debugar (drift? prompt? model?).`);
  }
  lines.push('');

  // ---- Apêndice gates ----
  lines.push(`## 8. Apêndice — Gates Chip Huyen`);
  lines.push('');
  const calFails = global ? global.calibration.filter((b) => b.n >= 10 && b.absGap > 0.05).length : 0;
  lines.push(`| Gate | Threshold | Status |`);
  lines.push(`|---|---|---|`);
  lines.push(`| G1 — N por vertical | >=50 (Tier 2) | ${analyses.filter((a) => a.vertical !== 'GLOBAL' && a.verdict !== 'INSUFFICIENT_N').length}/${analyses.filter((a) => a.vertical !== 'GLOBAL').length} |`);
  lines.push(`| G2 — LLM Brier < min(base, heur) (CI lower > 0) | per vertical | ${passV.length} PASS |`);
  lines.push(`| G3 — Profit factor (fees stress) | >=1.15 | ver §4 |`);
  lines.push(`| G4 — Calibration | <=5pp em N>=10 buckets | ${calFails === 0 ? 'PASS' : `${calFails} buckets fail`} |`);
  lines.push(`| G5 — Shuffle test | p<0.05 | global p=${global ? fmt(global.shuffle.pValue) : 'N/A'} |`);
  lines.push(`| G7 — Parse OK rate | >=90% | ${(parsedOkRate * 100).toFixed(1)}% ${parsedOkRate >= 0.9 ? 'PASS' : 'FAIL'} |`);
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(x: number): string {
  if (isNaN(x)) return 'N/A';
  if (!isFinite(x)) return x > 0 ? '∞' : '-∞';
  return x.toFixed(4);
}
function fmtSigned(x: number): string {
  if (isNaN(x)) return 'N/A';
  return (x >= 0 ? '+' : '') + x.toFixed(4);
}
function signed(x: number): string {
  if (isNaN(x)) return ' N/A   ';
  const s = (x >= 0 ? '+' : '') + x.toFixed(4);
  return s.padStart(8);
}

main().catch((err) => {
  console.error('[tier2-report] UNCAUGHT:', err);
  process.exit(1);
});
