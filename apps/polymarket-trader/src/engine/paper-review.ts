/**
 * Paper Trading Review Analyzer.
 * Phase 3.1: Computes comprehensive performance metrics
 * from paper trading history before Go/No-Go gate evaluation.
 */

import type { TradeExperience, PaperReviewReport } from '../types/index.js';

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;
const ANNUALIZATION_FACTOR = Math.sqrt(252);

export class PaperTradingReviewer {
  /**
   * Analyze an array of settled trades and produce a full review report.
   * Trades with outcome === 'PENDING' are excluded.
   *
   * P4 hybrid refactor: `options.realOnly` filters to trades tagged `source:real`.
   * Synthetic (crypto) trades are NOT edge-evidence for Go/No-Go — they're LLM
   * telemetry. The Go/No-Go gate must evaluate only real-market performance.
   */
  analyze(trades: TradeExperience[], options?: { realOnly?: boolean }): PaperReviewReport {
    let settled = trades.filter(t => t.outcome !== 'PENDING');
    if (options?.realOnly) {
      settled = settled.filter(t => {
        const source = (t.metadata as Record<string, unknown>)?.source;
        if (source === 'real') return true;
        if (source === 'synth') return false;
        // Legacy trades without source tag — infer from marketId prefix.
        return !t.marketId.startsWith('synth-');
      });
    }

    if (settled.length === 0) {
      return this.emptyReport();
    }

    // Sort by timestamp ascending
    const sorted = [...settled].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    const wins = sorted.filter(t => t.outcome === 'WIN');
    const losses = sorted.filter(t => t.outcome === 'LOSS');
    const totalPnl = sorted.reduce((sum, t) => sum + t.pnl, 0);

    const start = new Date(sorted[0].timestamp);
    const end = new Date(sorted[sorted.length - 1].timestamp);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));

    // Daily P&L series
    const dailyPnl = this.computeDailyPnl(sorted);

    // Sharpe from daily returns
    const dailyReturns = dailyPnl.map(d => d.pnl);
    const sharpeRatio = this.computeSharpe(dailyReturns);

    // Max drawdown (percentage of peak equity)
    const { maxDrawdown, maxDrawdownDuration } = this.computeDrawdown(dailyPnl);

    // Profit factor
    const grossWins = sorted.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
    const grossLosses = sorted.filter(t => t.pnl < 0).reduce((s, t) => s + Math.abs(t.pnl), 0);
    const profitFactor = grossLosses === 0
      ? (grossWins > 0 ? Infinity : 0)
      : grossWins / grossLosses;

    // Best / worst trade
    const bestTrade = sorted.reduce(
      (best, t) => t.pnl > best.pnl ? { pnl: t.pnl, marketId: t.marketId } : best,
      { pnl: -Infinity, marketId: '' },
    );
    const worstTrade = sorted.reduce(
      (worst, t) => t.pnl < worst.pnl ? { pnl: t.pnl, marketId: t.marketId } : worst,
      { pnl: Infinity, marketId: '' },
    );

    // Average holding period (hours) — from entry timestamp to exit
    // Approximation: use metadata exitTimestamp if available, else estimate from sequential trades
    const avgHoldingPeriod = this.computeAvgHoldingPeriod(sorted);

    // Consecutive streaks
    const { consecutiveWins, consecutiveLosses } = this.computeStreaks(sorted);

    // Edge persistence: split into 3 equal periods
    const edgePersistence = this.computeEdgePersistence(sorted);

    // Per-vertical breakdown
    const byVertical = this.computeBreakdown(sorted, 'vertical');

    // Per-strategy breakdown
    const byStrategy = this.computeBreakdown(sorted, 'strategy');

    return {
      period: { start, end, days },
      totalTrades: sorted.length,
      wins: wins.length,
      losses: losses.length,
      winRate: sorted.length > 0 ? wins.length / sorted.length : 0,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgPnlPerTrade: Math.round((totalPnl / sorted.length) * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 10000) / 10000,
      maxDrawdownDuration,
      profitFactor: Math.round(profitFactor * 100) / 100,
      bestTrade,
      worstTrade,
      avgHoldingPeriod: Math.round(avgHoldingPeriod * 100) / 100,
      consecutiveWins,
      consecutiveLosses,
      edgePersistence,
      byVertical,
      byStrategy,
      dailyPnl,
    };
  }

  /**
   * Generate a human-readable text summary from a report.
   */
  generateSummary(report: PaperReviewReport): string {
    const lines: string[] = [
      '=== Paper Trading Review ===',
      `Period: ${report.period.start.toISOString().split('T')[0]} to ${report.period.end.toISOString().split('T')[0]} (${report.period.days} days)`,
      `Total Trades: ${report.totalTrades} (${report.wins}W / ${report.losses}L)`,
      `Win Rate: ${(report.winRate * 100).toFixed(1)}%`,
      `Total P&L: $${report.totalPnl.toFixed(2)}`,
      `Avg P&L/Trade: $${report.avgPnlPerTrade.toFixed(2)}`,
      `Sharpe Ratio: ${report.sharpeRatio.toFixed(2)}`,
      `Max Drawdown: ${(report.maxDrawdown * 100).toFixed(1)}% (${report.maxDrawdownDuration} days)`,
      `Profit Factor: ${report.profitFactor === Infinity ? 'Inf' : report.profitFactor.toFixed(2)}`,
      `Best Trade: $${report.bestTrade.pnl.toFixed(2)} (${report.bestTrade.marketId})`,
      `Worst Trade: $${report.worstTrade.pnl.toFixed(2)} (${report.worstTrade.marketId})`,
      `Avg Holding Period: ${report.avgHoldingPeriod.toFixed(1)}h`,
      `Max Consecutive Wins: ${report.consecutiveWins}`,
      `Max Consecutive Losses: ${report.consecutiveLosses}`,
      '',
      '--- Edge Persistence ---',
      `Period 1 WR: ${(report.edgePersistence.period1WR * 100).toFixed(1)}%`,
      `Period 2 WR: ${(report.edgePersistence.period2WR * 100).toFixed(1)}%`,
      `Period 3 WR: ${(report.edgePersistence.period3WR * 100).toFixed(1)}%`,
      `Consistent: ${report.edgePersistence.isConsistent ? 'YES' : 'NO'}`,
    ];

    // Vertical breakdown
    const verticals = Object.entries(report.byVertical);
    if (verticals.length > 0) {
      lines.push('', '--- By Vertical ---');
      for (const [v, data] of verticals) {
        lines.push(`  ${v}: ${data.trades} trades, ${(data.winRate * 100).toFixed(1)}% WR, $${data.pnl.toFixed(2)} P&L`);
      }
    }

    // Strategy breakdown
    const strategies = Object.entries(report.byStrategy);
    if (strategies.length > 0) {
      lines.push('', '--- By Strategy ---');
      for (const [s, data] of strategies) {
        lines.push(`  ${s}: ${data.trades} trades, ${(data.winRate * 100).toFixed(1)}% WR, $${data.pnl.toFixed(2)} P&L`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Check whether a report meets minimum go/no-go criteria.
   */
  meetsMinimumCriteria(report: PaperReviewReport): { passes: boolean; failures: string[] } {
    const failures: string[] = [];

    if (report.period.days < 30) {
      failures.push(`Duration ${report.period.days} days < 30 days minimum`);
    }
    if (report.totalTrades < 500) {
      failures.push(`Total trades ${report.totalTrades} < 500 minimum`);
    }
    if (report.winRate < 0.60) {
      failures.push(`Win rate ${(report.winRate * 100).toFixed(1)}% < 60% minimum`);
    }
    if (report.totalPnl <= 0) {
      failures.push(`Total P&L $${report.totalPnl.toFixed(2)} must be positive`);
    }
    if (report.sharpeRatio < 1.0) {
      failures.push(`Sharpe ratio ${report.sharpeRatio.toFixed(2)} < 1.0 minimum`);
    }
    if (report.maxDrawdown > 0.20) {
      failures.push(`Max drawdown ${(report.maxDrawdown * 100).toFixed(1)}% > 20% maximum`);
    }
    if (!report.edgePersistence.isConsistent) {
      failures.push('Edge persistence: not all periods above 50% win rate');
    }
    if (report.profitFactor < 1.5) {
      failures.push(`Profit factor ${report.profitFactor.toFixed(2)} < 1.5 minimum`);
    }

    return { passes: failures.length === 0, failures };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private emptyReport(): PaperReviewReport {
    const now = new Date();
    return {
      period: { start: now, end: now, days: 0 },
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalPnl: 0,
      avgPnlPerTrade: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      maxDrawdownDuration: 0,
      profitFactor: 0,
      bestTrade: { pnl: 0, marketId: '' },
      worstTrade: { pnl: 0, marketId: '' },
      avgHoldingPeriod: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      edgePersistence: { period1WR: 0, period2WR: 0, period3WR: 0, isConsistent: false },
      byVertical: {},
      byStrategy: {},
      dailyPnl: [],
    };
  }

  private computeDailyPnl(
    sorted: TradeExperience[],
  ): Array<{ date: string; pnl: number; cumulative: number }> {
    const dailyMap = new Map<string, number>();

    for (const trade of sorted) {
      const date = new Date(trade.timestamp).toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + trade.pnl);
    }

    const result: Array<{ date: string; pnl: number; cumulative: number }> = [];
    let cumulative = 0;

    // Sort dates
    const dates = [...dailyMap.keys()].sort();
    for (const date of dates) {
      const pnl = Math.round((dailyMap.get(date) ?? 0) * 100) / 100;
      cumulative = Math.round((cumulative + pnl) * 100) / 100;
      result.push({ date, pnl, cumulative });
    }

    return result;
  }

  private computeSharpe(dailyReturns: number[]): number {
    if (dailyReturns.length < 2) return 0;

    const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance =
      dailyReturns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (dailyReturns.length - 1);
    const std = Math.sqrt(variance);

    if (std === 0) return mean > 0 ? Infinity : mean < 0 ? -Infinity : 0;

    return (mean / std) * ANNUALIZATION_FACTOR;
  }

  private computeDrawdown(
    dailyPnl: Array<{ date: string; pnl: number; cumulative: number }>,
  ): { maxDrawdown: number; maxDrawdownDuration: number } {
    if (dailyPnl.length === 0) return { maxDrawdown: 0, maxDrawdownDuration: 0 };

    let peak = 0;
    let maxDrawdown = 0;
    let maxDdDuration = 0;
    let currentDdStart = -1;

    for (let i = 0; i < dailyPnl.length; i++) {
      const cum = dailyPnl[i].cumulative;
      if (cum > peak) {
        peak = cum;
        currentDdStart = -1; // Reset drawdown start
      }

      if (peak > 0) {
        const dd = (peak - cum) / peak;
        if (dd > maxDrawdown) {
          maxDrawdown = dd;
        }

        if (dd > 0) {
          if (currentDdStart === -1) currentDdStart = i;
          const duration = i - currentDdStart + 1;
          if (duration > maxDdDuration) maxDdDuration = duration;
        }
      }
    }

    return { maxDrawdown, maxDrawdownDuration: maxDdDuration };
  }

  private computeAvgHoldingPeriod(sorted: TradeExperience[]): number {
    // If metadata has holdingPeriodMs, use it; otherwise estimate from
    // consecutive trades on the same market or default to 24h
    const periods: number[] = [];

    for (const trade of sorted) {
      const meta = trade.metadata as Record<string, unknown>;
      if (meta?.holdingPeriodMs && typeof meta.holdingPeriodMs === 'number') {
        periods.push(meta.holdingPeriodMs / MS_PER_HOUR);
      } else if (meta?.exitTimestamp) {
        const entry = new Date(trade.timestamp).getTime();
        const exit = new Date(meta.exitTimestamp as string).getTime();
        if (exit > entry) {
          periods.push((exit - entry) / MS_PER_HOUR);
        }
      } else {
        // Default: estimate 24h for prediction markets
        periods.push(24);
      }
    }

    if (periods.length === 0) return 0;
    return periods.reduce((a, b) => a + b, 0) / periods.length;
  }

  private computeStreaks(
    sorted: TradeExperience[],
  ): { consecutiveWins: number; consecutiveLosses: number } {
    let maxWins = 0;
    let maxLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;

    for (const trade of sorted) {
      if (trade.outcome === 'WIN') {
        currentWins++;
        currentLosses = 0;
        if (currentWins > maxWins) maxWins = currentWins;
      } else {
        currentLosses++;
        currentWins = 0;
        if (currentLosses > maxLosses) maxLosses = currentLosses;
      }
    }

    return { consecutiveWins: maxWins, consecutiveLosses: maxLosses };
  }

  private computeEdgePersistence(sorted: TradeExperience[]): {
    period1WR: number;
    period2WR: number;
    period3WR: number;
    isConsistent: boolean;
  } {
    if (sorted.length < 3) {
      const wr = sorted.length > 0
        ? sorted.filter(t => t.outcome === 'WIN').length / sorted.length
        : 0;
      return { period1WR: wr, period2WR: wr, period3WR: wr, isConsistent: wr > 0.50 };
    }

    const third = Math.floor(sorted.length / 3);
    const p1 = sorted.slice(0, third);
    const p2 = sorted.slice(third, third * 2);
    const p3 = sorted.slice(third * 2);

    const wr = (trades: TradeExperience[]) =>
      trades.length > 0 ? trades.filter(t => t.outcome === 'WIN').length / trades.length : 0;

    const period1WR = Math.round(wr(p1) * 10000) / 10000;
    const period2WR = Math.round(wr(p2) * 10000) / 10000;
    const period3WR = Math.round(wr(p3) * 10000) / 10000;

    return {
      period1WR,
      period2WR,
      period3WR,
      isConsistent: period1WR > 0.50 && period2WR > 0.50 && period3WR > 0.50,
    };
  }

  private computeBreakdown(
    sorted: TradeExperience[],
    key: 'vertical' | 'strategy',
  ): Record<string, { trades: number; winRate: number; pnl: number }> {
    const result: Record<string, { trades: number; wins: number; pnl: number }> = {};

    for (const trade of sorted) {
      const k = trade[key];
      if (!result[k]) result[k] = { trades: 0, wins: 0, pnl: 0 };
      result[k].trades++;
      result[k].pnl += trade.pnl;
      if (trade.outcome === 'WIN') result[k].wins++;
    }

    const output: Record<string, { trades: number; winRate: number; pnl: number }> = {};
    for (const [k, v] of Object.entries(result)) {
      output[k] = {
        trades: v.trades,
        winRate: v.trades > 0 ? Math.round((v.wins / v.trades) * 10000) / 10000 : 0,
        pnl: Math.round(v.pnl * 100) / 100,
      };
    }

    return output;
  }
}
