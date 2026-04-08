/**
 * Go/No-Go Gate for transitioning from paper to live trading.
 * Phase 3.2: Enforces all minimum criteria before real capital deployment.
 *
 * UPDATED per Conclave 2026-04-04 (Domer + Tetlock recommendation):
 * - Primary metrics: Profit Factor + EV/trade (not win rate)
 * - Win rate demoted to secondary (informational, not blocking)
 * - Added: EV/trade > $0.50, Brier score < 0.25
 *
 * Criteria (all must pass for GO):
 * 1. Paper trading >= 30 days
 * 2. Total trades >= 500
 * 3. Profit factor >= 1.5 (PRIMARY — Domer)
 * 4. EV per trade > $0.50 (PRIMARY — Tetlock)
 * 5. Total P&L > 0
 * 6. Sharpe >= 1.0
 * 7. Max drawdown <= 20%
 * 8. Edge persistence: all 3 periods WR > 50%
 * 9. Win rate >= 55% (DEMOTED — secondary, lowered from 60%)
 * 10. No active circuit breaker
 * 11. Drift monitor healthy
 */

import { eventBus } from './event-bus.js';
import { DEFAULT_GATE_CRITERIA } from '../config/defaults.js';
import type {
  PaperReviewReport,
  RiskState,
  GateResult,
  GateCriterion,
  GateCriteria,
} from '../types/index.js';

export class GoNoGoGate {
  private criteria: GateCriteria;

  constructor(criteria: GateCriteria = DEFAULT_GATE_CRITERIA) {
    this.criteria = criteria;
  }

  /**
   * Evaluate paper trading results against all gate criteria.
   * Returns a GateResult with score, per-criterion detail, and recommendation.
   */
  evaluate(
    report: PaperReviewReport,
    riskState: RiskState,
    driftHealthy: boolean,
  ): GateResult {
    const criteria: GateCriterion[] = [
      {
        name: 'Paper trading duration',
        required: `>= ${this.criteria.minDays} days`,
        actual: `${report.period.days} days`,
        passed: report.period.days >= this.criteria.minDays,
      },
      {
        name: 'Total trades',
        required: `>= ${this.criteria.minTrades}`,
        actual: `${report.totalTrades}`,
        passed: report.totalTrades >= this.criteria.minTrades,
      },
      {
        name: '⭐ Profit factor (PRIMARY)',
        required: `>= ${this.criteria.minProfitFactor}`,
        actual: `${report.profitFactor === Infinity ? 'Inf' : report.profitFactor.toFixed(2)}`,
        passed: report.profitFactor >= this.criteria.minProfitFactor,
      },
      {
        name: '⭐ EV per trade (PRIMARY)',
        required: `>= $${this.criteria.minEvPerTrade}`,
        actual: `$${report.avgPnlPerTrade.toFixed(2)}`,
        passed: report.avgPnlPerTrade >= this.criteria.minEvPerTrade,
      },
      {
        name: 'Win rate (secondary)',
        required: `>= ${(this.criteria.minWinRate * 100).toFixed(0)}%`,
        actual: `${(report.winRate * 100).toFixed(1)}%`,
        passed: report.winRate >= this.criteria.minWinRate,
      },
      {
        name: 'Total P&L positive',
        required: '> $0',
        actual: `$${report.totalPnl.toFixed(2)}`,
        passed: report.totalPnl > this.criteria.minPnl,
      },
      {
        name: 'Sharpe ratio',
        required: `>= ${this.criteria.minSharpe}`,
        actual: `${report.sharpeRatio.toFixed(2)}`,
        passed: report.sharpeRatio >= this.criteria.minSharpe,
      },
      {
        name: 'Max drawdown',
        required: `<= ${(this.criteria.maxDrawdown * 100).toFixed(0)}%`,
        actual: `${(report.maxDrawdown * 100).toFixed(1)}%`,
        passed: report.maxDrawdown <= this.criteria.maxDrawdown,
      },
      {
        name: 'Edge persistence',
        required: 'All periods WR > 50%',
        actual: `P1=${(report.edgePersistence.period1WR * 100).toFixed(1)}% P2=${(report.edgePersistence.period2WR * 100).toFixed(1)}% P3=${(report.edgePersistence.period3WR * 100).toFixed(1)}%`,
        passed: report.edgePersistence.isConsistent,
      },
      {
        name: 'No active circuit breaker',
        required: 'false',
        actual: String(riskState.circuitBreakerTripped),
        passed: !riskState.circuitBreakerTripped,
      },
      {
        name: 'Drift monitor healthy',
        required: 'true',
        actual: String(driftHealthy),
        passed: driftHealthy,
      },
    ];

    const passedCount = criteria.filter(c => c.passed).length;
    const score = Math.round((passedCount / criteria.length) * 100);

    let recommendation: 'GO' | 'NO_GO' | 'CONDITIONAL';
    if (score >= 80) {
      // Check if ALL criteria pass for GO
      const allPassed = criteria.every(c => c.passed);
      recommendation = allPassed ? 'GO' : 'CONDITIONAL';
    } else if (score >= 60) {
      recommendation = 'CONDITIONAL';
    } else {
      recommendation = 'NO_GO';
    }

    const result: GateResult = { passed: recommendation === 'GO', score, criteria, recommendation };

    eventBus.emit('gate:evaluated', result);

    return result;
  }
}
