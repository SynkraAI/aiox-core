import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoNoGoGate } from '../src/engine/go-nogo-gate.js';
import { eventBus } from '../src/engine/event-bus.js';
import type { PaperReviewReport, RiskState, GateCriteria } from '../src/types/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePassingReport(): PaperReviewReport {
  return {
    period: { start: new Date('2026-01-01'), end: new Date('2026-02-15'), days: 45 },
    totalTrades: 600,
    wins: 390,
    losses: 210,
    winRate: 0.65,
    totalPnl: 1200,
    avgPnlPerTrade: 2.0,
    sharpeRatio: 1.8,
    maxDrawdown: 0.12,
    maxDrawdownDuration: 5,
    profitFactor: 2.1,
    bestTrade: { pnl: 50, marketId: 'best' },
    worstTrade: { pnl: -30, marketId: 'worst' },
    avgHoldingPeriod: 24,
    consecutiveWins: 8,
    consecutiveLosses: 4,
    edgePersistence: { period1WR: 0.63, period2WR: 0.66, period3WR: 0.65, isConsistent: true },
    byVertical: {},
    byStrategy: {},
    dailyPnl: [],
  };
}

function makeHealthyRiskState(): RiskState {
  return {
    bankroll: 500,
    dailyPnl: 0,
    weeklyPnl: 0,
    openPositions: 0,
    totalExposure: 0,
    circuitBreakerTripped: false,
    lastUpdated: new Date(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GoNoGoGate', () => {
  let gate: GoNoGoGate;

  beforeEach(() => {
    gate = new GoNoGoGate();
  });

  describe('GO scenario', () => {
    it('should return GO when all criteria pass', () => {
      const result = gate.evaluate(makePassingReport(), makeHealthyRiskState(), true);
      expect(result.passed).toBe(true);
      expect(result.recommendation).toBe('GO');
      expect(result.score).toBe(100);
      expect(result.criteria.every(c => c.passed)).toBe(true);
    });

    it('should emit gate:evaluated event', () => {
      const spy = vi.fn();
      eventBus.on('gate:evaluated', spy);
      gate.evaluate(makePassingReport(), makeHealthyRiskState(), true);
      expect(spy).toHaveBeenCalledOnce();
      eventBus.removeListener('gate:evaluated', spy);
    });
  });

  describe('NO_GO scenario', () => {
    it('should return NO_GO when score < 60', () => {
      const report = makePassingReport();
      report.period.days = 5;     // fail
      report.totalTrades = 10;    // fail
      report.winRate = 0.30;      // fail
      report.totalPnl = -500;     // fail
      report.sharpeRatio = -1;    // fail
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      expect(result.recommendation).toBe('NO_GO');
      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(60);
    });
  });

  describe('CONDITIONAL scenario', () => {
    it('should return CONDITIONAL when score is 60-79', () => {
      const report = makePassingReport();
      report.period.days = 20;        // fail (need 30)
      report.totalTrades = 400;       // fail (need 500)
      report.profitFactor = 1.2;      // fail (need 1.5)
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      expect(result.recommendation).toBe('CONDITIONAL');
      expect(result.passed).toBe(false);
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.score).toBeLessThan(100);
    });

    it('should return CONDITIONAL when score >= 80 but not all pass', () => {
      const report = makePassingReport();
      report.profitFactor = 1.2; // just one failure
      const riskState = makeHealthyRiskState();
      const result = gate.evaluate(report, riskState, true);
      // 9/10 pass = 90 score, but not all pass
      expect(result.recommendation).toBe('CONDITIONAL');
      expect(result.passed).toBe(false);
    });
  });

  describe('individual criteria', () => {
    it('should fail on insufficient duration', () => {
      const report = makePassingReport();
      report.period.days = 15;
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      const criterion = result.criteria.find(c => c.name === 'Paper trading duration');
      expect(criterion?.passed).toBe(false);
    });

    it('should fail on insufficient trades', () => {
      const report = makePassingReport();
      report.totalTrades = 200;
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      const criterion = result.criteria.find(c => c.name === 'Total trades');
      expect(criterion?.passed).toBe(false);
    });

    it('should fail on low win rate', () => {
      const report = makePassingReport();
      report.winRate = 0.50;
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      const criterion = result.criteria.find(c => c.name === 'Win rate');
      expect(criterion?.passed).toBe(false);
    });

    it('should fail on negative P&L', () => {
      const report = makePassingReport();
      report.totalPnl = -100;
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      const criterion = result.criteria.find(c => c.name === 'Total P&L positive');
      expect(criterion?.passed).toBe(false);
    });

    it('should fail on low Sharpe ratio', () => {
      const report = makePassingReport();
      report.sharpeRatio = 0.5;
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      const criterion = result.criteria.find(c => c.name === 'Sharpe ratio');
      expect(criterion?.passed).toBe(false);
    });

    it('should fail on high drawdown', () => {
      const report = makePassingReport();
      report.maxDrawdown = 0.35;
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      const criterion = result.criteria.find(c => c.name === 'Max drawdown');
      expect(criterion?.passed).toBe(false);
    });

    it('should fail on inconsistent edge', () => {
      const report = makePassingReport();
      report.edgePersistence.isConsistent = false;
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      const criterion = result.criteria.find(c => c.name === 'Edge persistence');
      expect(criterion?.passed).toBe(false);
    });

    it('should fail on low profit factor', () => {
      const report = makePassingReport();
      report.profitFactor = 1.1;
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      const criterion = result.criteria.find(c => c.name === 'Profit factor');
      expect(criterion?.passed).toBe(false);
    });

    it('should fail when circuit breaker is tripped', () => {
      const riskState = makeHealthyRiskState();
      riskState.circuitBreakerTripped = true;
      riskState.circuitBreakerReason = 'Daily loss limit';
      const result = gate.evaluate(makePassingReport(), riskState, true);
      const criterion = result.criteria.find(c => c.name === 'No active circuit breaker');
      expect(criterion?.passed).toBe(false);
    });

    it('should fail when drift monitor is unhealthy', () => {
      const result = gate.evaluate(makePassingReport(), makeHealthyRiskState(), false);
      const criterion = result.criteria.find(c => c.name === 'Drift monitor healthy');
      expect(criterion?.passed).toBe(false);
    });
  });

  describe('score calculation', () => {
    it('should return 100 when all 10 criteria pass', () => {
      const result = gate.evaluate(makePassingReport(), makeHealthyRiskState(), true);
      expect(result.score).toBe(100);
    });

    it('should return 0 when all criteria fail', () => {
      const report = makePassingReport();
      report.period.days = 1;
      report.totalTrades = 1;
      report.winRate = 0.10;
      report.totalPnl = -1000;
      report.sharpeRatio = -5;
      report.maxDrawdown = 0.90;
      report.edgePersistence.isConsistent = false;
      report.profitFactor = 0.1;
      const riskState = makeHealthyRiskState();
      riskState.circuitBreakerTripped = true;
      const result = gate.evaluate(report, riskState, false);
      expect(result.score).toBe(0);
      expect(result.recommendation).toBe('NO_GO');
    });

    it('should score proportionally to passing criteria', () => {
      const report = makePassingReport();
      report.period.days = 10; // 1 failure
      const result = gate.evaluate(report, makeHealthyRiskState(), true);
      expect(result.score).toBe(90); // 9/10
    });
  });

  describe('custom criteria', () => {
    it('should accept custom gate criteria', () => {
      const customCriteria: GateCriteria = {
        minDays: 7,
        minTrades: 50,
        minWinRate: 0.55,
        minPnl: 0,
        minSharpe: 0.5,
        maxDrawdown: 0.30,
        minEdgePersistenceWR: 0.45,
        minProfitFactor: 1.0,
      };
      const customGate = new GoNoGoGate(customCriteria);
      const report = makePassingReport();
      report.period.days = 10;
      report.totalTrades = 60;
      report.sharpeRatio = 0.6;

      const result = customGate.evaluate(report, makeHealthyRiskState(), true);
      expect(result.recommendation).toBe('GO');
    });
  });

  describe('result structure', () => {
    it('should include all 10 criteria in result', () => {
      const result = gate.evaluate(makePassingReport(), makeHealthyRiskState(), true);
      expect(result.criteria).toHaveLength(10);
    });

    it('should include name, required, actual, and passed for each criterion', () => {
      const result = gate.evaluate(makePassingReport(), makeHealthyRiskState(), true);
      for (const c of result.criteria) {
        expect(c).toHaveProperty('name');
        expect(c).toHaveProperty('required');
        expect(c).toHaveProperty('actual');
        expect(c).toHaveProperty('passed');
      }
    });
  });
});
