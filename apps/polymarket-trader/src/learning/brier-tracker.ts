/**
 * Brier Score Tracker — measures prediction calibration per vertical.
 * Conclave recommendation (Philip Tetlock):
 * "If Brier score degrades >0.25, halt that vertical."
 *
 * Brier Score = (1/N) * Σ(forecast - outcome)²
 * Perfect = 0.0, Random = 0.25, Always wrong = 1.0
 */

import { eventBus } from '../engine/event-bus.js';
import type { Vertical } from '../types/index.js';

interface BrierEntry {
  marketId: string;
  vertical: Vertical;
  forecast: number;     // Model's probability (0-1)
  outcome: number;      // Actual outcome (0 or 1)
  timestamp: Date;
}

interface VerticalBrier {
  entries: BrierEntry[];
  brierScore: number;
  calibrationCurve: Array<{ bucket: string; forecast: number; actual: number; count: number }>;
  halted: boolean;
  haltReason?: string;
}

export class BrierTracker {
  private verticals: Map<Vertical, VerticalBrier> = new Map();
  private maxBrierScore: number;
  private windowSize: number;

  constructor(maxBrierScore = 0.25, windowSize = 100) {
    this.maxBrierScore = maxBrierScore;
    this.windowSize = windowSize;
    this.wireEvents();
  }

  private wireEvents(): void {
    // Auto-record when positions close with outcome
    eventBus.on('position:closed', (data: { market?: { vertical?: Vertical; id?: string }; pnl?: number }) => {
      if (!data.market?.vertical) return;
      // This is wired externally with proper forecast/outcome data
    });
  }

  /**
   * Record a forecast-outcome pair.
   * Call this when a market resolves.
   */
  record(marketId: string, vertical: Vertical, forecast: number, outcome: 0 | 1): void {
    const entry: BrierEntry = { marketId, vertical, forecast, outcome, timestamp: new Date() };

    if (!this.verticals.has(vertical)) {
      this.verticals.set(vertical, {
        entries: [],
        brierScore: 0,
        calibrationCurve: [],
        halted: false,
      });
    }

    const vb = this.verticals.get(vertical)!;
    vb.entries.push(entry);

    // Keep rolling window
    if (vb.entries.length > this.windowSize * 3) {
      vb.entries = vb.entries.slice(-this.windowSize * 2);
    }

    // Recalculate Brier score (rolling window)
    const recent = vb.entries.slice(-this.windowSize);
    vb.brierScore = this.calculateBrier(recent);
    vb.calibrationCurve = this.buildCalibrationCurve(recent);

    // Check halt condition
    if (recent.length >= 50 && vb.brierScore > this.maxBrierScore && !vb.halted) {
      vb.halted = true;
      vb.haltReason = `Brier ${vb.brierScore.toFixed(3)} > ${this.maxBrierScore} (${recent.length} trades)`;
      eventBus.emit('brier:halt', {
        vertical,
        brierScore: vb.brierScore,
        threshold: this.maxBrierScore,
        reason: vb.haltReason,
      });
    }

    // Auto-resume if score improves
    if (vb.halted && vb.brierScore <= this.maxBrierScore * 0.9) {
      vb.halted = false;
      vb.haltReason = undefined;
      eventBus.emit('brier:resumed', { vertical, brierScore: vb.brierScore });
    }
  }

  /**
   * Check if a vertical is halted due to poor calibration.
   */
  isVerticalHalted(vertical: Vertical): boolean {
    return this.verticals.get(vertical)?.halted ?? false;
  }

  /**
   * Get Brier score for a vertical.
   */
  getScore(vertical: Vertical): number {
    return this.verticals.get(vertical)?.brierScore ?? 0;
  }

  /**
   * Get full report for all verticals.
   */
  getReport(): Record<string, {
    brierScore: number;
    sampleSize: number;
    halted: boolean;
    haltReason?: string;
    calibration: Array<{ bucket: string; forecast: number; actual: number; count: number }>;
    grade: 'excellent' | 'good' | 'fair' | 'poor' | 'halted';
  }> {
    const report: Record<string, any> = {};

    for (const [vertical, vb] of this.verticals) {
      const recent = vb.entries.slice(-this.windowSize);
      const grade = vb.halted ? 'halted'
        : vb.brierScore < 0.10 ? 'excellent'
        : vb.brierScore < 0.15 ? 'good'
        : vb.brierScore < 0.20 ? 'fair'
        : 'poor';

      report[vertical] = {
        brierScore: Math.round(vb.brierScore * 1000) / 1000,
        sampleSize: recent.length,
        halted: vb.halted,
        haltReason: vb.haltReason,
        calibration: vb.calibrationCurve,
        grade,
      };
    }

    return report;
  }

  /**
   * Get overall Brier score across all verticals.
   */
  getOverallScore(): number {
    const allEntries: BrierEntry[] = [];
    for (const vb of this.verticals.values()) {
      allEntries.push(...vb.entries.slice(-this.windowSize));
    }
    return allEntries.length > 0 ? this.calculateBrier(allEntries) : 0;
  }

  // -- Private --

  private calculateBrier(entries: BrierEntry[]): number {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, e) => acc + Math.pow(e.forecast - e.outcome, 2), 0);
    return sum / entries.length;
  }

  /**
   * Build calibration curve — group forecasts into buckets
   * and compare predicted vs actual frequency.
   * Perfect calibration: 70% predictions come true 70% of the time.
   */
  private buildCalibrationCurve(entries: BrierEntry[]): Array<{
    bucket: string;
    forecast: number;
    actual: number;
    count: number;
  }> {
    const buckets = [
      { min: 0.0, max: 0.2, label: '0-20%' },
      { min: 0.2, max: 0.4, label: '20-40%' },
      { min: 0.4, max: 0.6, label: '40-60%' },
      { min: 0.6, max: 0.8, label: '60-80%' },
      { min: 0.8, max: 1.0, label: '80-100%' },
    ];

    return buckets.map(b => {
      const inBucket = entries.filter(e => e.forecast >= b.min && e.forecast < (b.max === 1.0 ? 1.01 : b.max));
      const count = inBucket.length;
      const avgForecast = count > 0 ? inBucket.reduce((s, e) => s + e.forecast, 0) / count : 0;
      const avgOutcome = count > 0 ? inBucket.reduce((s, e) => s + e.outcome, 0) / count : 0;

      return {
        bucket: b.label,
        forecast: Math.round(avgForecast * 100) / 100,
        actual: Math.round(avgOutcome * 100) / 100,
        count,
      };
    });
  }
}
