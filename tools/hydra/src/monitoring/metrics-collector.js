/**
 * @module metrics-collector
 * @description Collects and persists pipeline execution metrics to JSONL files.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const METRICS_DIR = path.resolve(__dirname, '../../hydra-data/metrics');

export class MetricsCollector {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.metricsDir] - Override metrics directory
   */
  constructor(options = {}) {
    this.metricsDir = options.metricsDir || METRICS_DIR;
    this._currentRun = null;
  }

  /**
   * Start tracking a new pipeline run.
   * @param {string} runId - Unique run identifier
   */
  startRun(runId) {
    this._currentRun = {
      timestamp: new Date().toISOString(),
      runId,
      duration_ms: 0,
      sources: { total: 0, active: 0, failed: 0 },
      items: { fetched: 0, filtered: 0, duplicates: 0, processed: 0, ingested: 0 },
      tiers: { S: 0, A: 0, B: 0, C: 0, D: 0 },
      circuit_breakers: { closed: 0, open: 0, half_open: 0 },
      errors: 0,
      heap_mb: 0,
      _startTime: Date.now(),
    };
  }

  /**
   * Record source group metrics.
   * @param {Object} sourceMetrics
   */
  recordSources(sourceMetrics) {
    if (!this._currentRun) return;
    Object.assign(this._currentRun.sources, sourceMetrics);
  }

  /**
   * Record item processing metrics.
   * @param {Object} itemMetrics
   */
  recordItems(itemMetrics) {
    if (!this._currentRun) return;
    Object.assign(this._currentRun.items, itemMetrics);
  }

  /**
   * Record tier breakdown.
   * @param {Object} tiers
   */
  recordTiers(tiers) {
    if (!this._currentRun) return;
    Object.assign(this._currentRun.tiers, tiers);
  }

  /**
   * Record circuit breaker states.
   * @param {{ closed: number, open: number, halfOpen: number }} cbState
   */
  recordCircuitBreakers(cbState) {
    if (!this._currentRun) return;
    this._currentRun.circuit_breakers = {
      closed: cbState.closed || 0,
      open: cbState.open || 0,
      half_open: cbState.halfOpen || 0,
    };
  }

  /**
   * Record error count.
   * @param {number} count
   */
  recordErrors(count) {
    if (!this._currentRun) return;
    this._currentRun.errors = count;
  }

  /**
   * Finalize and persist the current run metrics.
   * @returns {Object|null} The metrics record
   */
  endRun() {
    if (!this._currentRun) return null;

    const metrics = { ...this._currentRun };
    metrics.duration_ms = Date.now() - metrics._startTime;
    metrics.heap_mb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    delete metrics._startTime;

    this._persist(metrics);

    const result = metrics;
    this._currentRun = null;
    return result;
  }

  /**
   * Read metrics for a given date.
   * @param {string} [date] - Date in YYYY-MM-DD format (default: today)
   * @returns {Object[]}
   */
  readMetrics(date) {
    const dateStr = date || new Date().toISOString().split('T')[0];
    const filePath = path.join(this.metricsDir, `${dateStr}.jsonl`);

    try {
      if (!fs.existsSync(filePath)) return [];
      const lines = fs.readFileSync(filePath, 'utf-8')
        .split('\n')
        .filter((l) => l.trim());
      return lines.map((l) => JSON.parse(l));
    } catch {
      return [];
    }
  }

  /**
   * Get aggregate metrics for today.
   * @returns {Object}
   */
  getTodaySummary() {
    const metrics = this.readMetrics();
    if (metrics.length === 0) {
      return { runs: 0, totalItems: 0, totalErrors: 0 };
    }

    return {
      runs: metrics.length,
      totalItems: metrics.reduce((sum, m) => sum + (m.items?.processed || 0), 0),
      totalIngested: metrics.reduce((sum, m) => sum + (m.items?.ingested || 0), 0),
      totalErrors: metrics.reduce((sum, m) => sum + (m.errors || 0), 0),
      avgDurationMs: Math.round(metrics.reduce((sum, m) => sum + (m.duration_ms || 0), 0) / metrics.length),
      lastRun: metrics[metrics.length - 1]?.timestamp,
    };
  }

  /** @private */
  _persist(metrics) {
    try {
      if (!fs.existsSync(this.metricsDir)) {
        fs.mkdirSync(this.metricsDir, { recursive: true });
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const filePath = path.join(this.metricsDir, `${dateStr}.jsonl`);

      fs.appendFileSync(filePath, JSON.stringify(metrics) + '\n', 'utf-8');
    } catch {
      // Non-critical
    }
  }
}
