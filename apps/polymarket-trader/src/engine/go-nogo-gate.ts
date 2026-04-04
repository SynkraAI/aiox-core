/**
 * Go/No-Go Gate for transitioning from paper to live trading.
 * Phase 3.2: Enforces all minimum criteria before real capital deployment.
 *
 * Criteria (all must pass for GO):
 * 1. Paper trading >= 30 days
 * 2. Total trades >= 500
 * 3. Win rate >= 60%
 * 4. Total P&L > 0
 * 5. Sharpe >= 1.0
 * 6. Max drawdown <= 20%
 * 7. Edge persistence: all 3 periods WR > 50%
 * 8. Profit factor >= 1.5
 * 9. No active circuit breaker
 * 10. Drift monitor healthy
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
        name: 'Win rate',
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
        name: 'Profit factor',
        required: `>= ${this.criteria.minProfitFactor}`,
        actual: `${report.profitFactor === Infinity ? 'Inf' : report.profitFactor.toFixed(2)}`,
        passed: report.profitFactor >= this.criteria.minProfitFactor,
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
