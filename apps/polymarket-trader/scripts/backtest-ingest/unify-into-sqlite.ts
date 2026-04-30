#!/usr/bin/env npx tsx
/**
 * BACKTEST-1 Phase 1 — Unify report.
 *
 * After all per-source ingest scripts run, this script:
 *   1) Validates the DB shape (counts per source/vertical/status).
 *   2) Computes the survivorship + baseline-availability metrics.
 *   3) Generates `data/backtest/INGEST-REPORT.md` (per Output D spec).
 *
 * NOTE on script naming:
 *   The mission spec called this "unify-into-sqlite.ts" assuming each source
 *   wrote to a separate intermediate store and this consolidated. We chose
 *   instead to UPSERT directly into the unified historical_markets table
 *   from each ingest script (simpler, fewer copies). This script therefore
 *   acts as the AUDIT + REPORT step rather than a copy step. Same end result,
 *   one less data hop.
 *
 * Usage:
 *   npx tsx scripts/backtest-ingest/unify-into-sqlite.ts
 */

import { openDb, startRun, nodeVersionGuard, BACKTEST_ROOT } from './_lib.js';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SCRIPT = 'unify-into-sqlite';
const REPORT_PATH = join(BACKTEST_ROOT, 'INGEST-REPORT.md');

// Gate thresholds (Chip Huyen, scoping doc section 4.2 / 5)
const MIN_N_PER_VERTICAL = 100;
const MIN_N_FINANCE_FLEX = 50;

interface CountRow { count: number }
interface GroupRow { source: string; vertical: string; count: number }
interface StatusGroupRow { source: string; vertical: string; resolution_status: string; count: number }

function totalRows(db: ReturnType<typeof openDb>): number {
  return (db.prepare('SELECT COUNT(*) AS count FROM historical_markets').get() as unknown as CountRow).count;
}

function countsBySourceVertical(db: ReturnType<typeof openDb>): GroupRow[] {
  return db.prepare(`
    SELECT source, vertical, COUNT(*) AS count
      FROM historical_markets
     GROUP BY source, vertical
     ORDER BY source, vertical
  `).all() as unknown as GroupRow[];
}

function countsByStatus(db: ReturnType<typeof openDb>): StatusGroupRow[] {
  return db.prepare(`
    SELECT source, vertical, resolution_status, COUNT(*) AS count
      FROM historical_markets
     GROUP BY source, vertical, resolution_status
     ORDER BY source, vertical, resolution_status
  `).all() as unknown as StatusGroupRow[];
}

function totalsByVertical(db: ReturnType<typeof openDb>, predicate: 'usable' | 'resolved' | 'all'): Record<string, number> {
  const where = predicate === 'usable'
    ? `WHERE resolution_status = 'resolved' AND mid_price_t12h IS NOT NULL AND resolved_outcome IS NOT NULL`
    : predicate === 'resolved'
      ? `WHERE resolution_status = 'resolved'`
      : '';
  const rows = db.prepare(`
    SELECT vertical, COUNT(*) AS count FROM historical_markets ${where} GROUP BY vertical
  `).all() as unknown as Array<{ vertical: string; count: number }>;
  const out: Record<string, number> = { politics: 0, sports: 0, finance: 0, weather: 0 };
  for (const r of rows) out[r.vertical] = r.count;
  return out;
}

function climatologyCoverage(db: ReturnType<typeof openDb>): { stations: number; rows: number } {
  const stations = (db.prepare('SELECT COUNT(DISTINCT station_id) AS count FROM weather_climatology').get() as unknown as CountRow).count;
  const rows = (db.prepare('SELECT COUNT(*) AS count FROM weather_climatology').get() as unknown as CountRow).count;
  return { stations, rows };
}

function gateVerdict(usableByVertical: Record<string, number>): { vertical: string; n: number; pass: boolean; threshold: number; flag?: string }[] {
  const verticals: ('politics' | 'sports' | 'finance' | 'weather')[] = ['politics', 'sports', 'finance', 'weather'];
  return verticals.map(v => {
    const n = usableByVertical[v] ?? 0;
    const threshold = v === 'finance' ? MIN_N_FINANCE_FLEX : MIN_N_PER_VERTICAL;
    return {
      vertical: v,
      n,
      threshold,
      pass: n >= threshold,
      flag: v === 'finance' && n >= MIN_N_FINANCE_FLEX && n < MIN_N_PER_VERTICAL ? 'flex (CI larger)' : undefined,
    };
  });
}

function buildMarkdown(opts: {
  total: number;
  bySV: GroupRow[];
  byStatus: StatusGroupRow[];
  allByVertical: Record<string, number>;
  resolvedByVertical: Record<string, number>;
  usableByVertical: Record<string, number>;
  climate: { stations: number; rows: number };
  gate: ReturnType<typeof gateVerdict>;
}): string {
  const lines: string[] = [];
  const now = new Date().toISOString();

  lines.push(`# BACKTEST-1 Phase 1 — Ingest Report`);
  lines.push('');
  lines.push(`**Gerado em:** ${now}`);
  lines.push(`**Janela:** 2025-05-01 -> 2026-04-28 (12 meses)`);
  lines.push(`**Universo:** Polymarket + Kalshi, verticais politics/sports/finance/weather, resolucao <=7d`);
  lines.push('');
  lines.push(`**Total de markets ingeridos:** ${opts.total}`);
  lines.push('');

  // ---- Section 1: por source x vertical ----
  lines.push(`## 1. Markets por source x vertical`);
  lines.push('');
  lines.push(`| Source | Vertical | N |`);
  lines.push(`|---|---|---|`);
  for (const r of opts.bySV) {
    lines.push(`| ${r.source} | ${r.vertical} | ${r.count} |`);
  }
  lines.push('');

  // ---- Section 2: status breakdown ----
  lines.push(`## 2. Survivorship breakdown (resolution_status)`);
  lines.push('');
  lines.push(`| Source | Vertical | Status | N |`);
  lines.push(`|---|---|---|---|`);
  for (const r of opts.byStatus) {
    lines.push(`| ${r.source} | ${r.vertical} | ${r.resolution_status} | ${r.count} |`);
  }
  lines.push('');

  // ---- Section 3: gate (usable for Brier) ----
  lines.push(`## 3. Brier-gate readiness por vertical`);
  lines.push('');
  lines.push(`Critério "usable" = resolution_status=resolved AND mid_price_t12h IS NOT NULL AND resolved_outcome IS NOT NULL.`);
  lines.push('');
  lines.push(`| Vertical | All | Resolved | Usable (Brier) | Threshold | Pass? | Flag |`);
  lines.push(`|---|---|---|---|---|---|---|`);
  for (const g of opts.gate) {
    const all = opts.allByVertical[g.vertical] ?? 0;
    const res = opts.resolvedByVertical[g.vertical] ?? 0;
    lines.push(`| ${g.vertical} | ${all} | ${res} | ${g.n} | ${g.threshold} | ${g.pass ? 'PASS' : 'FAIL'} | ${g.flag ?? '-'} |`);
  }
  lines.push('');

  // ---- Section 4: NOAA climatology coverage ----
  lines.push(`## 4. NOAA climatology coverage`);
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Stations ingested | ${opts.climate.stations} |`);
  lines.push(`| (station, doy, metric) rows | ${opts.climate.rows} |`);
  lines.push('');

  // ---- Section 5: red flags ----
  lines.push(`## 5. Red flags`);
  lines.push('');
  const failed = opts.gate.filter(g => !g.pass);
  if (failed.length === 0) {
    lines.push(`- Nenhum vertical abaixo do threshold. Phase 2 GO.`);
  } else {
    for (const g of failed) {
      lines.push(`- **${g.vertical}**: N=${g.n} < threshold ${g.threshold}. Recomendacao: estender janela ou aceitar CI mais largo.`);
    }
  }
  // Survivorship warning
  const resTotalAll = Object.values(opts.allByVertical).reduce((s, v) => s + v, 0);
  const resTotalResolved = Object.values(opts.resolvedByVertical).reduce((s, v) => s + v, 0);
  const voidPct = resTotalAll > 0 ? ((resTotalAll - resTotalResolved) / resTotalAll) * 100 : 0;
  if (voidPct > 10) {
    lines.push(`- **Survivorship**: ${voidPct.toFixed(1)}% dos markets nao resolveram cleanly (void/disputed/pending). >10% e o gate G6.`);
  }
  // Baseline coverage warning
  for (const v of ['politics', 'sports', 'finance', 'weather']) {
    const res = opts.resolvedByVertical[v] ?? 0;
    const usable = opts.usableByVertical[v] ?? 0;
    if (res > 0) {
      const cover = (usable / res) * 100;
      if (cover < 80) {
        lines.push(`- **Baseline coverage ${v}**: ${cover.toFixed(1)}% dos resolved tem mid_price_t12h. Investigar perda em ingest-polymarket-clob-prices.`);
      }
    }
  }
  lines.push('');

  // ---- Section 6: next steps ----
  lines.push(`## 6. Proximos passos (Phase 2)`);
  lines.push('');
  lines.push(`- Implementar \`compute_brier_per_vertical\` (forecasts vs outcomes vs mid_price_t12h)`);
  lines.push(`- Bootstrap 95% CI + shuffle test`);
  lines.push(`- Calibration plot 10 buckets`);
  lines.push(`- Profit-factor sim com fees stress-test (PM 2% taker, KA 1% flat)`);
  lines.push(`- Go/No-Go report final`);

  return lines.join('\n') + '\n';
}

async function main(): Promise<void> {
  nodeVersionGuard();
  const db = openDb();
  const run = startRun(db, SCRIPT);

  try {
    const total = totalRows(db);
    if (total === 0) {
      console.error(`[${SCRIPT}] historical_markets is empty. Run ingest-polymarket-gamma + ingest-kalshi-historical first.`);
      run.finalize('aborted', 'empty-table');
      process.exit(1);
    }

    const bySV = countsBySourceVertical(db);
    const byStatus = countsByStatus(db);
    const allByVertical = totalsByVertical(db, 'all');
    const resolvedByVertical = totalsByVertical(db, 'resolved');
    const usableByVertical = totalsByVertical(db, 'usable');
    const climate = climatologyCoverage(db);
    const gate = gateVerdict(usableByVertical);

    const md = buildMarkdown({
      total, bySV, byStatus,
      allByVertical, resolvedByVertical, usableByVertical,
      climate, gate,
    });

    writeFileSync(REPORT_PATH, md);
    console.log(`[${SCRIPT}] report written: ${REPORT_PATH}`);
    console.log(`[${SCRIPT}] gate summary:`);
    for (const g of gate) {
      console.log(`  - ${g.vertical}: n=${g.n} threshold=${g.threshold} ${g.pass ? 'PASS' : 'FAIL'} ${g.flag ? `(${g.flag})` : ''}`);
    }
    run.finalize('completed', undefined, `report at ${REPORT_PATH}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${SCRIPT}] FAILED:`, msg);
    run.finalize('failed', msg);
    process.exit(2);
  }
}

main();
