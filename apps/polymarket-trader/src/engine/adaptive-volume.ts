/**
 * Adaptive Volume Engine — adjusts daily trade target based on opportunity.
 * Conclave recommendation (Domer):
 * "Don't force 70 trades on low-opportunity days.
 * Some days have 200 good opportunities, some have 10."
 *
 * Replaces fixed 70 trades/day with dynamic target.
 */

import { eventBus } from './event-bus.js';

interface DailySnapshot {
  date: string;
  marketsScanned: number;
  signalsGenerated: number;
  tradesExecuted: number;
  avgEdge: number;
  avgEv: number;
}

export interface AdaptiveVolumeConfig {
  /** Minimum trades per day (floor) */
  minDailyTrades: number;
  /** Maximum trades per day (ceiling) */
  maxDailyTrades: number;
  /** Target EV per trade — only take trades above this */
  minEvPerTrade: number;
  /** Scale factor: how aggressively to increase volume on good days */
  scaleFactor: number;
  /** Lookback days for moving average */
  lookbackDays: number;
}

const DEFAULT_CONFIG: AdaptiveVolumeConfig = {
  minDailyTrades: 10,
  maxDailyTrades: 200,
  minEvPerTrade: 0.20,    // $0.20 minimum EV to take a trade
  scaleFactor: 1.5,
  lookbackDays: 7,
};

export class AdaptiveVolume {
  private config: AdaptiveVolumeConfig;
  private history: DailySnapshot[] = [];
  private todayStats = { scanned: 0, signals: 0, trades: 0, totalEdge: 0, totalEv: 0 };
  private currentTarget: number;

  constructor(config: Partial<AdaptiveVolumeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentTarget = 70; // Start at the original target
    this.wireEvents();
  }

  private wireEvents(): void {
    eventBus.on('signal:approved', () => {
      this.todayStats.signals++;
    });

    eventBus.on('learning:trade-recorded', (exp: { edgeDetected?: number; pnl?: number }) => {
      this.todayStats.trades++;
      this.todayStats.totalEdge += exp.edgeDetected ?? 0;
      this.todayStats.totalEv += exp.pnl ?? 0;
    });
  }

  /**
   * Should we take another trade today?
   * Returns { shouldTrade, reason, todayTrades, todayTarget }
   */
  shouldTrade(_signalEdge: number, signalEv: number): {
    shouldTrade: boolean;
    reason: string;
    todayTrades: number;
    todayTarget: number;
  } {
    const { trades } = this.todayStats;

    // Always allow if below minimum
    if (trades < this.config.minDailyTrades) {
      return { shouldTrade: true, reason: 'Below daily minimum', todayTrades: trades, todayTarget: this.currentTarget };
    }

    // Hard cap
    if (trades >= this.config.maxDailyTrades) {
      return { shouldTrade: false, reason: `Hit daily max (${this.config.maxDailyTrades})`, todayTrades: trades, todayTarget: this.currentTarget };
    }

    // At/above target — only take high-EV trades
    if (trades >= this.currentTarget) {
      if (signalEv >= this.config.minEvPerTrade * 2) {
        return { shouldTrade: true, reason: 'Above target but high EV — taking it', todayTrades: trades, todayTarget: this.currentTarget };
      }
      return { shouldTrade: false, reason: `At target (${this.currentTarget}). Need EV > $${(this.config.minEvPerTrade * 2).toFixed(2)} to continue`, todayTrades: trades, todayTarget: this.currentTarget };
    }

    // Below target — check minimum EV
    if (signalEv < this.config.minEvPerTrade) {
      return { shouldTrade: false, reason: `EV $${signalEv.toFixed(2)} below min $${this.config.minEvPerTrade.toFixed(2)}`, todayTrades: trades, todayTarget: this.currentTarget };
    }

    return { shouldTrade: true, reason: 'Within target, EV acceptable', todayTrades: trades, todayTarget: this.currentTarget };
  }

  /**
   * End of day — snapshot today's stats and recalculate tomorrow's target.
   */
  endDay(): void {
    const today = new Date().toISOString().split('T')[0];
    const avgEdge = this.todayStats.signals > 0 ? this.todayStats.totalEdge / this.todayStats.signals : 0;
    const avgEv = this.todayStats.trades > 0 ? this.todayStats.totalEv / this.todayStats.trades : 0;

    this.history.push({
      date: today,
      marketsScanned: this.todayStats.scanned,
      signalsGenerated: this.todayStats.signals,
      tradesExecuted: this.todayStats.trades,
      avgEdge,
      avgEv,
    });

    // Keep lookback window
    if (this.history.length > this.config.lookbackDays * 2) {
      this.history = this.history.slice(-this.config.lookbackDays * 2);
    }

    // Recalculate target for tomorrow
    this.recalculateTarget();

    // Reset today
    this.todayStats = { scanned: 0, signals: 0, trades: 0, totalEdge: 0, totalEv: 0 };

    eventBus.emit('volume:day-end', {
      date: today,
      trades: this.todayStats.trades,
      newTarget: this.currentTarget,
    });
  }

  /**
   * Recalculate target based on recent history.
   * High EV days → increase target. Low EV days → decrease.
   */
  private recalculateTarget(): void {
    const recent = this.history.slice(-this.config.lookbackDays);
    if (recent.length === 0) return;

    const avgSignals = recent.reduce((s, d) => s + d.signalsGenerated, 0) / recent.length;
    const avgEv = recent.reduce((s, d) => s + d.avgEv, 0) / recent.length;

    // If average EV is good, scale up toward available signals
    if (avgEv > this.config.minEvPerTrade) {
      this.currentTarget = Math.min(
        Math.round(avgSignals * this.config.scaleFactor),
        this.config.maxDailyTrades,
      );
    } else {
      // Low EV — scale down
      this.currentTarget = Math.max(
        Math.round(avgSignals * 0.5),
        this.config.minDailyTrades,
      );
    }
  }

  recordScan(): void {
    this.todayStats.scanned++;
  }

  getCurrentTarget(): number {
    return this.currentTarget;
  }

  getStats() {
    return {
      currentTarget: this.currentTarget,
      todayTrades: this.todayStats.trades,
      todaySignals: this.todayStats.signals,
      todayScanned: this.todayStats.scanned,
      historyDays: this.history.length,
      avgDailyTrades: this.history.length > 0
        ? Math.round(this.history.reduce((s, d) => s + d.tradesExecuted, 0) / this.history.length)
        : 0,
    };
  }
}
