/**
 * Agent Drift Monitor for trading metrics.
 * Detects silent degradation across 4 dimensions:
 * - Win Rate
 * - EV per Trade
 * - Edge Accuracy
 * - Execution Quality
 *
 * Uses z-score for anomaly detection and rolling windows.
 */

import { eventBus } from '../engine/event-bus.js';
import { DRIFT_THRESHOLDS } from '../config/defaults.js';
import type { DriftMetrics, RollingMetric, TradeExperience } from '../types/index.js';

export class DriftMonitor {
  private trades: TradeExperience[] = [];
  private windowSize: number;
  private baselineEstablished = false;
  private baselineMetrics: DriftMetrics | null = null;

  constructor(windowSize = DRIFT_THRESHOLDS.windowSize) {
    this.windowSize = windowSize;
    this.wireEvents();
  }

  private wireEvents(): void {
    eventBus.on('learning:trade-recorded', (experience) => {
      if (experience.outcome !== 'PENDING') {
        this.addTrade(experience);
      }
    });
  }

  addTrade(trade: TradeExperience): void {
    this.trades.push(trade);

    // Keep only what we need for analysis
    if (this.trades.length > this.windowSize * 3) {
      this.trades = this.trades.slice(-this.windowSize * 3);
    }

    // Establish baseline after minimum trades
    if (!this.baselineEstablished && this.trades.length >= this.windowSize) {
      this.baselineMetrics = this.computeMetrics(this.trades.slice(0, this.windowSize));
      this.baselineEstablished = true;
    }

    // Check for drift on every new trade (if baseline exists)
    if (this.baselineEstablished) {
      const current = this.computeCurrentMetrics();
      const hasAlert = this.checkAlerts(current);
      if (hasAlert) {
        eventBus.emit('learning:drift-detected', current);
      }
    }
  }

  computeCurrentMetrics(): DriftMetrics {
    const recent = this.trades.slice(-this.windowSize);
    return this.computeMetrics(recent);
  }

  private computeMetrics(trades: TradeExperience[]): DriftMetrics {
    const settled = trades.filter(t => t.outcome !== 'PENDING');
    const wins = settled.filter(t => t.outcome === 'WIN');

    // Win Rate
    const winRate = settled.length > 0 ? wins.length / settled.length : 0;

    // EV per Trade
    const totalPnl = settled.reduce((sum, t) => sum + t.pnl, 0);
    const evPerTrade = settled.length > 0 ? totalPnl / settled.length : 0;

    // Edge Accuracy: how close our model_probability was to actual outcome
    const edgeErrors = settled.map(t => {
      const actualOutcome = t.outcome === 'WIN' ? 1 : 0;
      return Math.abs(t.modelProbability - actualOutcome);
    });
    const edgeMAE = edgeErrors.length > 0
      ? edgeErrors.reduce((a, b) => a + b, 0) / edgeErrors.length
      : 0;

    // Execution Quality: slippage + fees deviation from expected
    const execDeviations = settled.map(t => {
      const totalCost = t.slippage + t.takerFee + t.gasFee;
      const expectedCost = t.positionSize * 0.01; // 1% expected baseline
      return Math.abs(totalCost - expectedCost) / Math.max(t.positionSize, 1);
    });
    const execDeviation = execDeviations.length > 0
      ? execDeviations.reduce((a, b) => a + b, 0) / execDeviations.length
      : 0;

    const baseline = this.baselineMetrics;

    return {
      winRate: this.buildMetric(winRate, baseline?.winRate.current ?? winRate, settled.length),
      evPerTrade: this.buildMetric(evPerTrade, baseline?.evPerTrade.current ?? evPerTrade, settled.length),
      edgeAccuracy: this.buildMetric(1 - edgeMAE, baseline?.edgeAccuracy.current ?? (1 - edgeMAE), settled.length),
      executionQuality: this.buildMetric(1 - execDeviation, baseline?.executionQuality.current ?? (1 - execDeviation), settled.length),
    };
  }

  private buildMetric(current: number, baseline: number, sampleSize: number): RollingMetric {
    // Simplified z-score (assumes std dev proportional to baseline)
    const stdEstimate = Math.max(baseline * 0.1, 0.01); // rough estimate
    const zScore = (current - baseline) / stdEstimate;
    const absDiff = current - baseline;

    let trend: 'improving' | 'stable' | 'degrading';
    if (absDiff > stdEstimate) trend = 'improving';
    else if (absDiff < -stdEstimate) trend = 'degrading';
    else trend = 'stable';

    return {
      current,
      baseline,
      zScore,
      trend,
      sampleSize,
      alertTriggered: Math.abs(zScore) > DRIFT_THRESHOLDS.winRate.zScoreAlert,
    };
  }

  private checkAlerts(metrics: DriftMetrics): boolean {
    let hasAlert = false;

    if (metrics.winRate.current < DRIFT_THRESHOLDS.winRate.min) {
      eventBus.emit('risk:warning', {
        metric: 'win_rate',
        value: metrics.winRate.current,
        threshold: DRIFT_THRESHOLDS.winRate.min,
      });
      hasAlert = true;
    }

    if (metrics.evPerTrade.current < DRIFT_THRESHOLDS.evPerTrade.min) {
      eventBus.emit('risk:warning', {
        metric: 'ev_per_trade',
        value: metrics.evPerTrade.current,
        threshold: DRIFT_THRESHOLDS.evPerTrade.min,
      });
      hasAlert = true;
    }

    return hasAlert;
  }

  getReport(): { metrics: DriftMetrics; baselineEstablished: boolean; totalTrades: number } {
    return {
      metrics: this.computeCurrentMetrics(),
      baselineEstablished: this.baselineEstablished,
      totalTrades: this.trades.length,
    };
  }

  isHealthy(): boolean {
    if (!this.baselineEstablished) return true; // Not enough data to judge
    const metrics = this.computeCurrentMetrics();
    return !metrics.winRate.alertTriggered && !metrics.evPerTrade.alertTriggered;
  }
}
