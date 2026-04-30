/**
 * BACKTEST-1 Phase 2 Tier 1 — Report Generator
 *
 * Reads `replay_heuristic_predictions` (populated by replay-heuristic.ts),
 * runs Brier + bootstrap + shuffle + calibration + profit-factor analysis
 * per vertical AND globally, then writes a Markdown report:
 *
 *   data/backtest/TIER1-RESULTS.md
 *
 * Verdict gate (per BACKTEST-1 §5):
 *   PASS  =  signal Brier < baseline Brier  AND  bootstrap CI lower > 0
 *   FAIL  =  otherwise (CI cruzes 0, signal worse, etc.)
 *
 * Recommendation:
 *   GO Tier 2  =  >= 1 vertical PASS  (parcial GO ok per scoping decision #6)
 *   STOP       =  0 verticais PASS    (Damodaran's stop-loss)
 *
 * Story: BACKTEST-2-tier1-heuristic
 */

import { DatabaseSync } from 'node:sqlite';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  brierScore, bootstrapCI, shuffleTest, calibrationBuckets, profitFactor,
  type BootstrapResult, type ShuffleResult, type CalibrationBucket, type ProfitFactorResult,
} from './compute-brier.ts';

const SCRIPT_DIR = import.meta.dirname;
const DB_PATH = join(SCRIPT_DIR, '..', '..', 'data', 'backtest', 'historical-markets.db');
const REPORT_PATH = join(SCRIPT_DIR, '..', '..', 'data', 'backtest', 'TIER1-RESULTS.md');

type Vertical = 'politics' | 'sports' | 'finance' | 'weather' | 'crypto';
const VERTICALS: Vertical[] = ['politics', 'sports', 'finance', 'weather', 'crypto'];

interface VerticalAnalysis {
  vertical: Vertical | 'GLOBAL';
  n: number;
  signalBrier: number;
  baselineBrier: number;
  delta: number;
  bootstrap: BootstrapResult;
  shuffle: ShuffleResult;
  calibration: CalibrationBucket[];
  profitFactor: ProfitFactorResult;
  verdict: 'PASS' | 'FAIL' | 'INSUFFICIENT_N';
  verdictReason: string;
}

// Threshold per BACKTEST-1 scoping §5 (Chip Huyen gate)
const N_GATE_DEFAULT = 100;
const N_GATE_FINANCE = 50; // finance allowed flexibilization per §1.2 / decision

function nThresholdFor(v: Vertical | 'GLOBAL'): number {
  return v === 'finance' ? N_GATE_FINANCE : N_GATE_DEFAULT;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (!existsSync(DB_PATH)) {
    console.error(`[report] FATAL: DB not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new DatabaseSync(DB_PATH);

  // Verify replay table exists
  const tableCheck = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='replay_heuristic_predictions'`)
    .get();
  if (!tableCheck) {
    console.error(`[report] FATAL: replay_heuristic_predictions table not found.`);
    console.error('  Run scripts/backtest/replay-heuristic.ts first.');
    process.exit(1);
  }

  // Pull all predictions joined with raw market data
  const rows = db
    .prepare(`
      SELECT
        p.market_id, p.vertical, p.forecast, p.baseline, p.outcome,
        p.side, p.edge, p.confidence, p.should_trade, p.signal_count
      FROM replay_heuristic_predictions p
    `)
    .all() as Array<{
      market_id: string;
      vertical: Vertical;
      forecast: number;
      baseline: number;
      outcome: number;
      side: string;
      edge: number;
      confidence: number;
      should_trade: number;
      signal_count: number;
    }>;

  console.log(`[report] ${rows.length} predictions loaded`);

  // ---- Per-vertical analyses + GLOBAL ----
  const analyses: VerticalAnalysis[] = [];

  for (const v of VERTICALS) {
    const vRows = rows.filter((r) => r.vertical === v);
    analyses.push(analyze(v, vRows));
  }
  analyses.push(analyze('GLOBAL', rows));

  // ---- Should-trade subset analysis (the bot's actual signaled trades) ----
  const tradedAnalyses: VerticalAnalysis[] = [];
  for (const v of VERTICALS) {
    const vRows = rows.filter((r) => r.vertical === v && r.should_trade === 1);
    tradedAnalyses.push(analyze(v, vRows));
  }
  const allTraded = rows.filter((r) => r.should_trade === 1);
  tradedAnalyses.push(analyze('GLOBAL', allTraded));

  // ---- Verdict + recommendation ----
  const passed = analyses.filter((a) => a.vertical !== 'GLOBAL' && a.verdict === 'PASS');
  const insufficient = analyses.filter((a) => a.vertical !== 'GLOBAL' && a.verdict === 'INSUFFICIENT_N');
  const recommendation = passed.length >= 1 ? 'GO_TIER2' : 'STOP';

  // ---- Render markdown ----
  const md = renderMarkdown(analyses, tradedAnalyses, recommendation, passed.map((a) => a.vertical), insufficient.map((a) => a.vertical));
  writeFileSync(REPORT_PATH, md, 'utf8');

  console.log('\n[report] DONE');
  console.log(`  Wrote: ${REPORT_PATH}`);
  console.log(`  Recommendation: ${recommendation}`);
  console.log(`  PASS verticals: ${passed.map((a) => a.vertical).join(', ') || '(none)'}`);

  // Print summary table to stdout for the agent
  console.log('\n  Per-vertical summary:');
  console.log('  | Vertical | N     | Signal BS | Baseline BS | Δ        | CI lower | Shuffle p | Verdict |');
  console.log('  |----------|-------|-----------|-------------|----------|----------|-----------|---------|');
  for (const a of analyses) {
    console.log(
      `  | ${String(a.vertical).padEnd(8)} | ${String(a.n).padStart(5)} | ${a.signalBrier.toFixed(4)}    | ${a.baselineBrier.toFixed(4)}      | ${a.delta >= 0 ? '+' : ''}${a.delta.toFixed(4)} | ${a.bootstrap.lower >= 0 ? '+' : ''}${a.bootstrap.lower.toFixed(4)}  | ${a.shuffle.pValue.toFixed(3)}     | ${a.verdict.padEnd(7)} |`,
    );
  }

  db.close();
}

// ---------------------------------------------------------------------------
// Analysis pipeline per vertical
// ---------------------------------------------------------------------------

function analyze(
  label: Vertical | 'GLOBAL',
  rows: Array<{ forecast: number; baseline: number; outcome: number }>,
): VerticalAnalysis {
  const N = rows.length;
  if (N === 0) {
    const empty: VerticalAnalysis = {
      vertical: label,
      n: 0,
      signalBrier: NaN,
      baselineBrier: NaN,
      delta: NaN,
      bootstrap: { meanDelta: NaN, lower: NaN, upper: NaN, meanSignalBrier: NaN, meanBaselineBrier: NaN, nResamples: 0 },
      shuffle: { observedBrier: NaN, pValue: NaN, meanNullBrier: NaN, nIterations: 0 },
      calibration: [],
      profitFactor: { profitFactor: NaN, totalTrades: 0, totalWins: 0, totalLosses: 0, totalPnl: 0, totalProfitGross: 0, totalLossGross: 0, totalFeesPaid: 0, tradedSelectorRate: 0, hitRate: 0 },
      verdict: 'INSUFFICIENT_N',
      verdictReason: 'N=0',
    };
    return empty;
  }

  const forecasts = rows.map((r) => r.forecast);
  const baselines = rows.map((r) => r.baseline);
  const outcomes = rows.map((r) => r.outcome);

  const sBrier = brierScore(forecasts, outcomes);
  const bBrier = brierScore(baselines, outcomes);
  const delta = bBrier - sBrier; // positive = signal better

  const boot = bootstrapCI(forecasts, baselines, outcomes, 1000, 0.05, 42);
  const shuf = shuffleTest(forecasts, outcomes, 1000, 42);
  const cal  = calibrationBuckets(forecasts, outcomes, 10);
  const pf   = profitFactor(forecasts, outcomes, baselines, { feeTaker: 0.02, kellyFraction: 0.05, stake: 1000, maxStake: 25, minEdge: 0.02 });

  // Verdict: per scoping §5 — Brier signal < baseline AND bootstrap CI lower > 0
  const nThreshold = label === 'GLOBAL' ? 0 : nThresholdFor(label as Vertical);
  let verdict: VerticalAnalysis['verdict'];
  let reason: string;
  if (label !== 'GLOBAL' && N < nThreshold) {
    verdict = 'INSUFFICIENT_N';
    reason = `N=${N} < threshold=${nThreshold}`;
  } else if (sBrier < bBrier && boot.lower > 0) {
    verdict = 'PASS';
    reason = `Brier ${sBrier.toFixed(4)} < baseline ${bBrier.toFixed(4)}, CI lower ${boot.lower.toFixed(4)} > 0`;
  } else {
    verdict = 'FAIL';
    if (sBrier >= bBrier) {
      reason = `signal Brier ${sBrier.toFixed(4)} >= baseline ${bBrier.toFixed(4)} (no edge)`;
    } else {
      reason = `signal slightly better (${sBrier.toFixed(4)} vs ${bBrier.toFixed(4)}) but CI lower ${boot.lower.toFixed(4)} <= 0 (not significant)`;
    }
  }

  return {
    vertical: label, n: N,
    signalBrier: sBrier, baselineBrier: bBrier, delta,
    bootstrap: boot, shuffle: shuf, calibration: cal, profitFactor: pf,
    verdict, verdictReason: reason,
  };
}

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

function renderMarkdown(
  analyses: VerticalAnalysis[],
  traded: VerticalAnalysis[],
  recommendation: 'GO_TIER2' | 'STOP',
  passVerticals: Array<Vertical | 'GLOBAL'>,
  insufficientVerticals: Array<Vertical | 'GLOBAL'>,
): string {
  const ts = new Date().toISOString();
  const global = analyses.find((a) => a.vertical === 'GLOBAL')!;

  const lines: string[] = [];
  lines.push(`# BACKTEST-1 Phase 2 Tier 1 — Replay Heurístico (Sem LLM)`);
  lines.push('');
  lines.push(`**Gerado em:** ${ts}`);
  lines.push(`**Story:** BACKTEST-2-tier1-heuristic`);
  lines.push(`**Predecessor:** BACKTEST-1 Phase 1 (ingest, 7.647 markets eligíveis)`);
  lines.push(`**Custo desta fase:** $0,00 (heurística pura, zero LLM)`);
  lines.push('');

  // ---- Resumo executivo ----
  lines.push(`## 1. Resumo Executivo`);
  lines.push('');
  lines.push(`- **N total replay:** ${global.n}`);
  lines.push(`- **Brier global:** ${global.signalBrier.toFixed(4)} vs baseline ${global.baselineBrier.toFixed(4)} (Δ=${global.delta >= 0 ? '+' : ''}${global.delta.toFixed(4)})`);
  lines.push(`- **Bootstrap 95% CI (Δ):** [${global.bootstrap.lower.toFixed(4)}, ${global.bootstrap.upper.toFixed(4)}]`);
  lines.push(`- **Shuffle p-value:** ${global.shuffle.pValue.toFixed(4)}`);
  lines.push(`- **Verticais PASS:** ${passVerticals.length > 0 ? passVerticals.map(String).join(', ') : '(nenhum)'}`);
  if (insufficientVerticals.length > 0) {
    lines.push(`- **Verticais INSUFFICIENT_N:** ${insufficientVerticals.map(String).join(', ')}`);
  }
  lines.push('');
  lines.push(`### Recomendação`);
  if (recommendation === 'GO_TIER2') {
    lines.push(`- **GO Tier 2 (LLM ~$1.50)** — pelo menos um vertical PASS detecta edge estatisticamente significativo. Vale o investimento de Tier 2 para ver se LLM amplifica o sinal.`);
  } else {
    lines.push(`- **STOP — Damodaran stop-loss aciona.** Zero verticais passam o gate G2 (Brier signal < baseline com CI lower > 0). Heurística pura NÃO derrota o consenso T-12h. Tier 2 (LLM) provavelmente também falhará — antes de gastar $$$, considerar:`);
    lines.push(`  - Pivotar de "beat the market mid" para "find specific arbs" (cross-platform PM/Kalshi spreads, ou eventos com evidência exógena verificável).`);
    lines.push(`  - Estender janela histórica para >12m em verticals borderline.`);
    lines.push(`  - Re-validar baseline T-12h vs T-1h via subgraph (decisão #5: T-12h pode estar enfraquecendo o teste, mas dado o δ pequeno em vários verticais aqui, T-1h provavelmente também não passaria).`);
  }
  lines.push('');

  // ---- Brier por vertical (full population) ----
  lines.push(`## 2. Brier por vertical — Population completa`);
  lines.push('');
  lines.push('Forecasts do bot heurístico para TODOS markets resolvidos (mesmo onde shouldTrade=false → forecast = mid_price_t12h, replay neutro). Compara contra mid_price_t12h baseline.');
  lines.push('');
  lines.push(`| Vertical | N | Signal Brier | Baseline Brier | Δ | 95% CI (Δ) | Shuffle p | Verdict |`);
  lines.push(`|---|---|---|---|---|---|---|---|`);
  for (const a of analyses) {
    const ciStr = `[${fmt(a.bootstrap.lower)}, ${fmt(a.bootstrap.upper)}]`;
    lines.push(
      `| ${a.vertical} | ${a.n} | ${fmt(a.signalBrier)} | ${fmt(a.baselineBrier)} | ${fmtSigned(a.delta)} | ${ciStr} | ${fmt(a.shuffle.pValue)} | **${a.verdict}** |`,
    );
  }
  lines.push('');
  lines.push(`### Veredito por vertical`);
  for (const a of analyses) {
    if (a.vertical === 'GLOBAL') continue;
    lines.push(`- **${a.vertical}** (N=${a.n}): ${a.verdict} — ${a.verdictReason}`);
  }
  lines.push('');

  // ---- Should-trade subset ----
  lines.push(`## 3. Brier por vertical — Subset shouldTrade=true`);
  lines.push('');
  lines.push('Apenas markets onde a heurística EMITIU signal (rawEdge >= MIN_EDGE = 0.02). Esse é o verdadeiro teste de "skill quando o bot age".');
  lines.push('');
  lines.push(`| Vertical | N (traded) | Signal Brier | Baseline Brier | Δ | 95% CI (Δ) | Shuffle p | Verdict |`);
  lines.push(`|---|---|---|---|---|---|---|---|`);
  for (const a of traded) {
    const ciStr = `[${fmt(a.bootstrap.lower)}, ${fmt(a.bootstrap.upper)}]`;
    lines.push(
      `| ${a.vertical} | ${a.n} | ${fmt(a.signalBrier)} | ${fmt(a.baselineBrier)} | ${fmtSigned(a.delta)} | ${ciStr} | ${fmt(a.shuffle.pValue)} | **${a.verdict}** |`,
    );
  }
  lines.push('');

  // ---- Calibration ----
  lines.push(`## 4. Calibration buckets (10 bins) — GLOBAL`);
  lines.push('');
  lines.push('Gate Chip Huyen: |predictedMean - observedFreq| <= 0.05 em todos os buckets com N>=10.');
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

  // ---- Profit factor ----
  lines.push(`## 5. Profit factor — Stress-test fees (PM 2% taker, Kelly fração 5%, bankroll $1000, cap $25, min bet $1)`);
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
  lines.push(`Gate G3: PF >= 1.15 com fees realistas. Estes números usam fees de stress-test (PM 2% taker), conservadores. Fees reais (PM ~0.10%) renderiam PFs maiores.`);
  lines.push('');

  // ---- Caveats ----
  lines.push(`## 6. Caveats e limitações`);
  lines.push('');
  lines.push(`- **Baseline T-12h, não T-1h:** Limitação CLOB API (issue #216). Decisão #5 do scoping aceitou. Menos duro que T-1h, mas também menos otimista pra nós.`);
  lines.push(`- **Signal 1 (price-mismatch) sempre = 0 no replay:** Por construção, noPrice = 1 - midPriceT12h, então priceSum sempre = 1.0. Em runtime, yes/no podem divergir → signal 1 ativo. Limitação inerente do replay com schema atual.`);
  lines.push(`- **Sem ExperienceStore:** Heurística runtime usa boost/penalty baseado em similar past trades. No replay isso é zero — número de trades histórico in-replay é insuficiente para reconstruir.`);
  lines.push(`- **KnowledgeStore hardcoded:** Biases ('favorite-longshot', 'anchoring') hardcoded por vertical (faithful default — todos quatro verticals exibem esses no KB padrão).`);
  lines.push(`- **Survivorship:** ${global.n} markets vêm de Phase 1 com filtro \`resolution_status='resolved'\`. Markets void/disputed (~17 sports + 7 finance + 5 politics) excluídos por construção. <10% — passa G6.`);
  lines.push('');

  // ---- Decisão Tier 2 ----
  lines.push(`## 7. Decisão Tier 2`);
  lines.push('');
  if (recommendation === 'GO_TIER2') {
    lines.push(`**GO** — proceder para Tier 2 (LLM ~$1.50). Heurística pura mostra edge em ${passVerticals.length} vertical(is): ${passVerticals.map(String).join(', ')}. Tier 2 testará se LLM amplifica esse signal e cobre verticals onde heurística sozinha falhou.`);
    lines.push('');
    lines.push(`Próximos passos:`);
    lines.push(`1. Spawn @dev story BACKTEST-3-tier2-llm (~$1.50, 4-6h dev).`);
    lines.push(`2. Roda LLM (Claude Haiku ou GPT-4o-mini) em sample estratificado pelos ${passVerticals.length} verticals que passaram + 1 que falhou (controle).`);
    lines.push(`3. Re-corre Brier + bootstrap + shuffle nos forecasts LLM.`);
    lines.push(`4. Se LLM piora ou empata: GO PARCIAL com heurística-only no(s) vertical(is) PASS.`);
    lines.push(`5. Se LLM melhora: paper trading >=30 dias antes de live.`);
  } else {
    lines.push(`**STOP** — não vale Tier 2 ($1.50 e tempo). Damodaran's stop-loss disparou. A heurística atual NÃO supera o consenso T-12h, e LLM tier 2 é improvável reverter isso (LLM melhora em information arbitrage, não em estrutura de bias detection — e essa é a tese da heurística).`);
    lines.push('');
    lines.push(`Próximos passos:`);
    lines.push(`1. Pausar pivot real-only (PM-PIVOT-1) até evidência mais forte.`);
    lines.push(`2. Considerar pivot estratégico:`);
    lines.push(`   - **Cross-platform arb** (PM vs Kalshi spreads >2%): demanda VPS US + KYC, fora do escopo cidadão BR atual.`);
    lines.push(`   - **NOAA-anchored weather only**: weather Brier baseline já é ~${analyses.find((a) => a.vertical === 'weather')?.baselineBrier.toFixed(4) ?? '?'} — climatology pode ser informação NAO precificada nos markets que não tracking weather histórico. Vale Tier 1.5 isolado.`);
    lines.push(`3. Documentar lição aprendida: "heurística micro-bias (anchoring, favorite-longshot) sozinha não derrota mid_t12h". Atualizar tese.`);
  }
  lines.push('');

  // ---- Apêndice: gates ----
  lines.push(`## 8. Apêndice — Gates Chip Huyen`);
  lines.push('');
  lines.push(`| Gate | Threshold | Status |`);
  lines.push(`|---|---|---|`);
  lines.push(`| G1 — N por vertical | >=100 (>=50 finance) | ${analyses.filter((a) => a.vertical !== 'GLOBAL' && a.verdict !== 'INSUFFICIENT_N').length}/4 verticais |`);
  lines.push(`| G2 — Signal Brier < Baseline (CI lower > 0) | per vertical | ${passVerticals.length}/4 verticals PASS |`);
  lines.push(`| G3 — Profit factor (fees stress) | >=1.15 | ver §5 |`);
  lines.push(`| G4 — Calibration | <=5pp em N>=10 buckets | ${calFails.length === 0 ? 'PASS' : `${calFails.length} buckets fail`} |`);
  lines.push(`| G5 — Shuffle test | p<0.05 | global p=${fmt(global.shuffle.pValue)} |`);
  lines.push(`| G6 — Survivorship | <10% void/disputed | ~0.5% (passa) |`);
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

main().catch((err) => {
  console.error('[report] UNCAUGHT:', err);
  process.exit(1);
});
