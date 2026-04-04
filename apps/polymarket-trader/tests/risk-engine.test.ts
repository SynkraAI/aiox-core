import { describe, it, expect, beforeEach } from 'vitest';
import { RiskEngine } from '../src/engine/risk-engine.js';
import type { TradeSignal } from '../src/types/index.js';

describe('RiskEngine', () => {
  let engine: RiskEngine;

  beforeEach(() => {
    engine = new RiskEngine(500); // $500 bankroll
  });

  describe('calculateKelly', () => {
    it('should return 0 when no edge exists', () => {
      const result = engine.calculateKelly(0.50, 0.50);
      expect(result.optimalFraction).toBe(0);
      expect(result.suggestedSize).toBe(0);
    });

    it('should return 0 when negative edge', () => {
      const result = engine.calculateKelly(0.40, 0.50);
      expect(result.optimalFraction).toBe(0);
      expect(result.suggestedSize).toBe(0);
    });

    it('should calculate correct Kelly for positive edge', () => {
      // model says 70%, market says 60%
      // f* = (0.70 - 0.60) / (1 - 0.60) = 0.25
      const result = engine.calculateKelly(0.70, 0.60);
      expect(result.optimalFraction).toBeCloseTo(0.25, 2);
      expect(result.adjustedFraction).toBeCloseTo(0.25 * 0.15, 2); // 15% Kelly
      expect(result.edge).toBeCloseTo(0.10, 2);
    });

    it('should cap position size at maxPositionSize ($50)', () => {
      // Very high edge on large bankroll
      const bigEngine = new RiskEngine(10000);
      const result = bigEngine.calculateKelly(0.90, 0.50);
      expect(result.suggestedSize).toBeLessThanOrEqual(50);
    });

    it('should cap at maxBankrollPercent (5%)', () => {
      const result = engine.calculateKelly(0.90, 0.10);
      // 5% of $500 = $25
      expect(result.suggestedSize).toBeLessThanOrEqual(25);
    });
  });

  describe('evaluateSignal', () => {
    const baseSignal: TradeSignal = {
      marketId: 'test-market',
      vertical: 'weather',
      strategy: 'weather_model',
      side: 'YES',
      modelProbability: 0.75,
      marketProbability: 0.60,
      edge: 0.15,
      confidence: 0.85,
      suggestedSize: 20,
      reasoning: 'Test signal',
      timestamp: new Date(),
    };

    it('should approve signal with sufficient edge', () => {
      const result = engine.evaluateSignal(baseSignal);
      expect(result.approved).toBe(true);
      expect(result.suggestedSize).toBeGreaterThan(0);
    });

    it('should reject signal with edge below minimum', () => {
      const result = engine.evaluateSignal({ ...baseSignal, edge: 0.05 });
      expect(result.approved).toBe(false);
      expect(result.reason).toContain('below minimum');
    });

    it('should reject when circuit breaker is tripped', () => {
      // Trip the circuit breaker manually
      (engine as any).state.circuitBreakerTripped = true;
      (engine as any).state.circuitBreakerReason = 'Test';
      const result = engine.evaluateSignal(baseSignal);
      expect(result.approved).toBe(false);
      expect(result.reason).toContain('Circuit breaker');
    });

    it('should reject when max positions reached', () => {
      (engine as any).state.openPositions = 10;
      const result = engine.evaluateSignal(baseSignal);
      expect(result.approved).toBe(false);
      expect(result.reason).toContain('Max open positions');
    });
  });

  describe('circuit breakers', () => {
    it('should start with circuit breaker off', () => {
      expect(engine.getState().circuitBreakerTripped).toBe(false);
    });

    it('should allow resetting circuit breaker', () => {
      (engine as any).state.circuitBreakerTripped = true;
      engine.resetCircuitBreaker();
      expect(engine.getState().circuitBreakerTripped).toBe(false);
    });

    it('should reset daily P&L', () => {
      (engine as any).state.dailyPnl = -50;
      engine.resetDaily();
      expect(engine.getState().dailyPnl).toBe(0);
    });
  });
});
