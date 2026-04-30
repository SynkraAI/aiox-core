#!/usr/bin/env npx tsx
/**
 * BACKTEST-1 Phase 1 — NOAA GHCN-Daily climatology ingest.
 *
 * Builds the (station, doy, metric) -> empirical-distribution table that
 * powers the weather-vertical Brier baseline ("P_climate(threshold | doy)").
 *
 * Uses the AWS Open Data S3 mirror — public bucket, no creds needed:
 *   https://noaa-ghcn-pds.s3.amazonaws.com/csv/by_station/{STATION_ID}.csv
 *
 * Strategy (KISS):
 *   1) Curated station list: top ~30 weather markets cluster around a small
 *      set of major US/global airports. Hardcoded below; expand as needed
 *      per Phase 1 follow-up if backtest requires more stations.
 *   2) For each station: download by_station CSV, filter 1991-2020,
 *      aggregate per (doy, metric) -> mean / stddev / quantiles + raw values.
 *   3) UPSERT into weather_climatology.
 *
 * Network footprint: ~30 stations * ~3-5 MB CSV each = ~150 MB total.
 * Processing: ~30s per station on a modern laptop.
 *
 * Usage:
 *   npx tsx scripts/backtest-ingest/ingest-noaa-ghcn.ts
 */

import {
  openDb, upsertClimatology, startRun, makeProgress,
  loadCheckpoint, saveCheckpoint, clearCheckpoint,
  fetchJson, sleep, nodeVersionGuard,
} from './_lib.js';
import type { WeatherClimatologyRow } from './_lib.js';

const SCRIPT = 'ingest-noaa-ghcn';
const S3_BASE = 'https://noaa-ghcn-pds.s3.amazonaws.com/csv/by_station';
const REQ_DELAY_MS = 250;

// Climate normals window (per NOAA 1991-2020 standard)
const NORMAL_START_YEAR = 1991;
const NORMAL_END_YEAR = 2020;

// Curated station list — major metros covered by 90% of PM/Kalshi weather mkts.
// IDs are GHCN station codes. Expand list if Phase 1 finds gaps.
const STATIONS: Array<{ id: string; label: string }> = [
  { id: 'USW00094728', label: 'New York Central Park' },
  { id: 'USW00014732', label: 'New York LGA' },
  { id: 'USW00014734', label: 'New York JFK' },
  { id: 'USW00023174', label: 'Los Angeles LAX' },
  { id: 'USW00094846', label: 'Chicago ORD' },
  { id: 'USW00094847', label: 'Chicago Midway' },
  { id: 'USW00012960', label: 'Miami International' },
  { id: 'USW00013874', label: 'Atlanta ATL' },
  { id: 'USW00003017', label: 'Denver DEN' },
  { id: 'USW00012842', label: 'Tampa TPA' },
  { id: 'USW00013904', label: 'Dallas DFW' },
  { id: 'USW00012921', label: 'San Antonio SAT' },
  { id: 'USW00013958', label: 'Houston IAH' },
  { id: 'USW00094789', label: 'New York JFK alt' },
  { id: 'USW00014739', label: 'Boston Logan' },
  { id: 'USW00013722', label: 'Norfolk NAS' },
  { id: 'USW00094918', label: 'Detroit DTW' },
  { id: 'USW00014922', label: 'Minneapolis MSP' },
  { id: 'USW00094008', label: 'Glasgow MT' },
  { id: 'USW00024233', label: 'Seattle SEA' },
  { id: 'USW00024229', label: 'Portland PDX' },
  { id: 'USW00023183', label: 'Phoenix PHX' },
  { id: 'USW00012916', label: 'New Orleans NOLA' },
  { id: 'USW00013889', label: 'Charlotte CLT' },
  { id: 'USW00093721', label: 'Baltimore BWI' },
  { id: 'USW00013743', label: 'Washington DCA' },
  { id: 'USW00093738', label: 'Washington IAD' },
  { id: 'USW00094823', label: 'Pittsburgh PIT' },
  { id: 'USW00014820', label: 'Cleveland CLE' },
  { id: 'USW00012815', label: 'Orlando MCO' },
];

// Metrics we care about (per market types observed in PM/Kalshi)
const METRICS = ['TMAX', 'TMIN', 'PRCP', 'SNOW', 'SNWD'] as const;
type Metric = typeof METRICS[number];

interface DailyRecord {
  date: string;       // YYYY-MM-DD
  metric: Metric;
  value: number;
  qflag: string;
}

interface Checkpoint {
  completedStations: string[];
}

// ---------------------------------------------------------------------------
// CSV parser — GHCN by-station format is:  ID,DATE,ELEMENT,VALUE,M_FLAG,Q_FLAG,S_FLAG,OBS_TIME
// ---------------------------------------------------------------------------

function parseGhcnCsv(text: string): DailyRecord[] {
  const lines = text.split(/\r?\n/);
  const out: DailyRecord[] = [];
  // First line MAY be header; detect by checking presence of "STATION" or just non-numeric date
  let startIdx = 0;
  if (lines[0] && /^[A-Z_]+,/.test(lines[0])) startIdx = 1;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length < 6) continue;
    const date = parts[1];
    const metric = parts[2] as Metric;
    if (!METRICS.includes(metric)) continue;

    const valueRaw = parts[3];
    const qflag = parts[5] ?? '';
    const value = parseInt(valueRaw, 10);
    if (Number.isNaN(value)) continue;
    if (qflag && qflag.trim() !== '') continue; // failed QC -> skip

    // Date format: YYYYMMDD
    const dateIso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    out.push({ date: dateIso, metric, value, qflag });
  }
  return out;
}

function dayOfYear(dateIso: string): number {
  const [y, m, d] = dateIso.split('-').map(n => parseInt(n, 10));
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  const start = Date.UTC(y, 0, 1);
  return Math.floor((date.getTime() - start) / 86400000) + 1;
}

function quantile(sorted: number[], q: number): number | null {
  if (sorted.length === 0) return null;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function aggregate(records: DailyRecord[]): Map<string, WeatherClimatologyRow & { _values: number[] }> {
  // Bucket records by (doy, metric)
  const buckets = new Map<string, { values: number[]; years: Set<number>; metric: Metric; doy: number }>();

  for (const r of records) {
    const year = parseInt(r.date.slice(0, 4), 10);
    if (year < NORMAL_START_YEAR || year > NORMAL_END_YEAR) continue;
    const doy = dayOfYear(r.date);
    if (doy < 1 || doy > 366) continue;
    const key = `${doy}|${r.metric}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { values: [], years: new Set(), metric: r.metric, doy };
      buckets.set(key, bucket);
    }
    bucket.values.push(r.value);
    bucket.years.add(year);
  }

  const out = new Map<string, WeatherClimatologyRow & { _values: number[] }>();
  for (const [key, bucket] of buckets) {
    const sorted = [...bucket.values].sort((a, b) => a - b);
    const n = sorted.length;
    if (n === 0) continue;
    const mean = sorted.reduce((s, v) => s + v, 0) / n;
    const variance = n > 1 ? sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1) : 0;
    const stddev = Math.sqrt(variance);

    out.set(key, {
      station_id: '',  // filled by caller
      doy: bucket.doy,
      metric: bucket.metric,
      mean,
      stddev,
      p10: quantile(sorted, 0.10),
      p25: quantile(sorted, 0.25),
      p50: quantile(sorted, 0.50),
      p75: quantile(sorted, 0.75),
      p90: quantile(sorted, 0.90),
      n_years: bucket.years.size,
      raw_values_json: JSON.stringify(bucket.values),
      _values: bucket.values,
    });
  }
  return out;
}

async function fetchStationCsv(stationId: string): Promise<string | null> {
  const url = `${S3_BASE}/${stationId}.csv`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[${SCRIPT}] station ${stationId} HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`[${SCRIPT}] fetch ${stationId} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function main(): Promise<void> {
  nodeVersionGuard();
  const db = openDb();
  const run = startRun(db, SCRIPT);
  const progress = makeProgress(SCRIPT, 1);

  const checkpoint = loadCheckpoint<Checkpoint>(SCRIPT) ?? { completedStations: [] };
  const completed = new Set(checkpoint.completedStations);

  try {
    let processed = 0;
    for (const station of STATIONS) {
      processed += 1;
      if (completed.has(station.id)) {
        run.skipped += 1;
        progress(processed, STATIONS.length, processed - run.skipped);
        continue;
      }

      console.log(`[${SCRIPT}] fetching ${station.id} (${station.label})...`);
      const csv = await fetchStationCsv(station.id);
      if (!csv) {
        run.skipped += 1;
        continue;
      }

      const records = parseGhcnCsv(csv);
      if (records.length === 0) {
        console.warn(`[${SCRIPT}] no usable records in ${station.id}`);
        run.skipped += 1;
        continue;
      }

      const aggregated = aggregate(records);
      console.log(`[${SCRIPT}]   -> ${records.length} daily records -> ${aggregated.size} (doy, metric) buckets`);

      for (const row of aggregated.values()) {
        const dbRow: WeatherClimatologyRow = {
          station_id: station.id,
          doy: row.doy,
          metric: row.metric,
          mean: row.mean,
          stddev: row.stddev,
          p10: row.p10,
          p25: row.p25,
          p50: row.p50,
          p75: row.p75,
          p90: row.p90,
          n_years: row.n_years,
          raw_values_json: row.raw_values_json,
        };
        const result = upsertClimatology(db, dbRow);
        if (result === 'inserted') run.inserted += 1; else run.updated += 1;
      }

      completed.add(station.id);
      saveCheckpoint(SCRIPT, { completedStations: [...completed] });
      progress(processed, STATIONS.length, processed - run.skipped);
      await sleep(REQ_DELAY_MS);
    }

    console.log(`[${SCRIPT}] DONE. stations=${STATIONS.length} inserted=${run.inserted} updated=${run.updated} skipped=${run.skipped}`);
    run.finalize('completed', undefined, JSON.stringify({ stations: STATIONS.length }));
    clearCheckpoint(SCRIPT);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${SCRIPT}] FAILED:`, msg);
    saveCheckpoint(SCRIPT, { completedStations: [...completed] });
    run.finalize('failed', msg);
    process.exit(2);
  }
}

main();
