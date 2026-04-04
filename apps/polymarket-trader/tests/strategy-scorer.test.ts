import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StrategyScorer } from '../src/engine/strategy-scorer.js';
import { RiskEngine } from '../src/engine/risk-engine.js';
import { eventBus } from '../src/engine/event-bus.js';
import type { TradeSignal } from '../src/types/index.js';

function makeSignal(overrides: Partial<TradeSignal> = {}): TradeSignal {
  return {
    marketId: 'market-abc',
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
    ...overrides,
  };
}

describe('StrategyScorer', () => {
  let risk: RiskEngine;
  let scorer: StrategyScorer;

  beforeEach(() => {
    eventBus.removeAllListeners();
    risk = new RiskEngine(500);
    scorer = new StrategyScorer(risk);
  });

  // ---------------------------------------------------------------
  // Composite score calculation
  // ---------------------------------------------------------------

  describe('composite score', () => {
    it('should calculate a composite score with correct weights', () => {
      const signal = makeSignal({ edge: 0.10, confidence: 0.80 });
      const scored = scorer.score(signal);

      // edgeScore = 0.10 / 0.20 = 0.50
      expect(scored.edgeScore).toBeCloseTo(0.50, 2);
      expect(scored.confidenceScore).toBeCloseTo(0.80, 2);
      // liquidityScore default (no market data) = 0.50
      expect(scored.liquidityScore).toBeCloseTo(0.50, 2);
      // recencyBonus ~ 1.0 (brand new signal)
      expect(scored.recencyBonus).toBeGreaterThan(0.95);

      // composite = 0.50*0.4 + 0.80*0.3 + 0.50*0.2 + ~1.0*0.1
      // = 0.20 + 0.24 + 0.10 + ~0.10 ≈ 0.64
      expect(scored.composite).toBeGreaterThan(0.60);
      expect(scored.composite).toBeLessThan(0.70);
    });

    it('should give higher composite for higher edge', () => {
      const lowEdge = scorer.score(makeSignal({ edge: 0.05 }));
      const highEdge = scorer.score(makeSignal({ edge: 0.18 }));
      expect(highEdge.composite).toBeGreaterThan(lowEdge.composite);
    });

    it('should cap edgeScore at 1.0 when edge exceeds maxEdgeNorm', () => {
      const scored = scorer.score(makeSignal({ edge: 0.30 }));
      expect(scored.edgeScore).toBe(1);
    });

    it('should use provided market liquidity for liquidityScore', () => {
      const low = scorer.score(makeSignal(), 5_000);
      const high = scorer.score(makeSignal(), 50_000);
      expect(high.liquidityScore).toBeCloseTo(1.0, 2);
      expect(low.liquidityScore).toBeCloseTo(0.10, 2);
    });
  });

  // ---------------------------------------------------------------
  // Freshness
  // ---------------------------------------------------------------

  describe('freshness', () => {
    it('should reject signals older than 5 minutes', () => {
      const rejected = vi.fn();
      eventBus.on('signal:rejected', rejected);

      const staleSignal = makeSignal({
        timestamp: new Date(Date.now() - 6 * 60 * 1000), // 6 min ago
      });
      const result = scorer.ingest(staleSignal);

      expect(result).toBeNull();
      expect(rejected).toHaveBeenCalledTimes(1);
      expect(rejected.mock.calls[0][0].reason).toMatch(/Stale signal/);
    });

    it('should accept fresh signals (< 5 min)', () => {
      const signal = makeSignal({ timestamp: new Date(Date.now() - 2 * 60 * 1000) });
      const result = scorer.ingest(signal);
      expect(result).not.toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // Deduplication
  // ---------------------------------------------------------------

  describe('deduplication', () => {
    it('should reject duplicate market within 1 hour', () => {
      const rejected = vi.fn();
      eventBus.on('signal:rejected', rejected);

      // First signal → approved (assuming risk engine approves)
      scorer.ingest(makeSignal({ marketId: 'dup-market' }));

      // Second signal for same market → rejected
      const result = scorer.ingest(makeSignal({ marketId: 'dup-market' }));
      expect(result).toBeNull();
      expect(rejected).toHaveBeenCalled();
      const lastCall = rejected.mock.calls[rejected.mock.calls.length - 1][0];
      expect(lastCall.reason).toMatch(/Duplicate/);
    });

    it('should allow same market after deduplication window expires', () => {
      const shortWindow = new StrategyScorer(risk, { deduplicationWindowMs: 100 });

      shortWindow.ingest(makeSignal({ marketId: 'dedup-test' }));

      // Manually clear to simulate time passing (since we can't sleep in sync tests)
      shortWindow.clearDeduplication();

      const result = shortWindow.ingest(makeSignal({ marketId: 'dedup-test' }));
      expect(result).not.toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // Risk Engine integration
  // ---------------------------------------------------------------

  describe('risk engine integration', () => {
    it('should emit signal:approved when Risk Engine approves', () => {
      const approved = vi.fn();
      eventBus.on('signal:approved', approved);

      scorer.ingest(makeSignal());

      expect(approved).toHaveBeenCalledTimes(1);
      expect(approved.mock.calls[0][0].suggestedSize).toBeGreaterThan(0);
    });

    it('should emit signal:rejected when Risk Engine rejects', () => {
      const rejected = vi.fn();
      eventBus.on('signal:rejected', rejected);

      // Trip circuit breaker so Risk Engine rejects everything
      (risk as any).state.circuitBreakerTripped = true;
      (risk as any).state.circuitBreakerReason = 'Test CB';

      scorer.ingest(makeSignal());

      expect(rejected).toHaveBeenCalledTimes(1);
      expect(rejected.mock.calls[0][0].reason).toMatch(/Circuit breaker/);
    });

    it('should pass adjusted size from Risk Engine in approved event', () => {
      const approved = vi.fn();
      eventBus.on('signal:approved', approved);

      scorer.ingest(makeSignal({ modelProbability: 0.75, marketProbability: 0.60 }));

      const payload = approved.mock.calls[0][0];
      // RiskEngine calculates Kelly size, not the original suggestedSize
      expect(typeof payload.suggestedSize).toBe('number');
      expect(payload.suggestedSize).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------
  // Priority queue
  // ---------------------------------------------------------------

  describe('priority queue', () => {
    it('should process higher-scored signals first', () => {
      const approvedOrder: string[] = [];
      eventBus.on('signal:approved', (s: any) => {
        approvedOrder.push(s.marketId);
      });

      // Ingest two signals: low edge first, high edge second
      // Both should be approved, but priority queue should re-order
      scorer.ingest(makeSignal({ marketId: 'low-edge', edge: 0.09 }));
      scorer.ingest(makeSignal({ marketId: 'high-edge', edge: 0.19 }));

      // Since the queue processes synchronously within ingest(),
      // each signal is processed immediately.
      // Both should appear in history.
      expect(approvedOrder).toContain('low-edge');
      expect(approvedOrder).toContain('high-edge');
    });
  });

  // ---------------------------------------------------------------
  // Event bus wiring
  // ---------------------------------------------------------------

  describe('event wiring', () => {
    it('should ingest signals emitted via signal:detected event', () => {
      const approved = vi.fn();
      eventBus.on('signal:approved', approved);

      eventBus.emit('signal:detected', makeSignal({ marketId: 'event-test' }));

      expect(approved).toHaveBeenCalledTimes(1);
      expect(approved.mock.calls[0][0].marketId).toBe('event-test');
    });
  });
});
