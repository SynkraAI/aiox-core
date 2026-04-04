import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MindCloneAdvisor, ConsultationEngine } from '../src/learning/mind-clone-advisor.js';
import type { TradeSignal } from '../src/types/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSignal(overrides: Partial<TradeSignal> = {}): TradeSignal {
  return {
    marketId: 'market-test-123',
    vertical: 'weather',
    strategy: 'weather_model',
    side: 'YES',
    modelProbability: 0.75,
    marketProbability: 0.60,
    edge: 0.10,
    confidence: 0.80,
    suggestedSize: 30,
    reasoning: 'Test signal',
    timestamp: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock ConsultationEngine where consultExpert returns controlled output.
 */
function createMockEngine(
  consultResult?: Partial<ReturnType<ConsultationEngine['consultExpert']> extends Promise<infer T> ? T : never>,
  shouldFail = false,
  failMessage = 'Subprocess failed',
): ConsultationEngine {
  const engine = new ConsultationEngine('/fake/path.js', 5000);

  if (shouldFail) {
    vi.spyOn(engine, 'consultExpert').mockRejectedValue(new Error(failMessage));
    vi.spyOn(engine, 'runConclave').mockRejectedValue(new Error(failMessage));
  } else {
    vi.spyOn(engine, 'consultExpert').mockResolvedValue({
      success: true,
      consultationId: 'test-consult-001',
      expert: {
        id: 'chip-huyen',
        name: 'Chip Huyen',
        role: 'ML Engineer',
        source: 'mega-brain',
      },
      question: 'test question',
      consultationPrompt: 'You are consulting as Chip Huyen...',
      expertKnowledge: {
        frameworks: [
          { name: 'MLOps Pipeline', description: 'Continuous training and monitoring' },
        ],
        principles: ['Data quality over quantity', 'Monitor for distribution drift'],
      },
      ...consultResult,
    });
  }

  return engine;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MindCloneAdvisor', () => {
  let advisor: MindCloneAdvisor;

  describe('consult() — gating logic', () => {
    beforeEach(() => {
      advisor = new MindCloneAdvisor(
        { enabled: true, minPositionSize: 20 },
        createMockEngine(),
      );
    });

    it('should skip when disabled', async () => {
      advisor = new MindCloneAdvisor(
        { enabled: false },
        createMockEngine(),
      );
      const result = await advisor.consult(makeSignal(), 'test context');

      expect(result.consulted).toBe(false);
      expect(result.skippedReason).toContain('disabled');
      expect(result.consensus).toBe('proceed');
    });

    it('should skip when position size is below threshold', async () => {
      const signal = makeSignal({ suggestedSize: 10 });
      const result = await advisor.consult(signal, 'test');

      expect(result.consulted).toBe(false);
      expect(result.skippedReason).toContain('below threshold');
    });

    it('should skip when no experts mapped for vertical', async () => {
      // Create signal with unknown vertical by casting
      const signal = makeSignal({ vertical: 'unknown' as 'weather' });
      const advisorNoExperts = new MindCloneAdvisor(
        { enabled: true },
        createMockEngine(),
      );

      const result = await advisorNoExperts.consult(signal, 'test');

      expect(result.consulted).toBe(false);
      expect(result.skippedReason).toContain('No experts mapped');
    });
  });

  describe('consult() — live consultation via subprocess', () => {
    it('should call ConsultationEngine for each expert in the vertical', async () => {
      const engine = createMockEngine();
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal({ vertical: 'weather' }); // 2 experts
      const result = await advisor.consult(signal, 'Weather market test');

      expect(result.consulted).toBe(true);
      expect(result.experts).toEqual(['chip-huyen', 'cassie-kozyrkov']);
      expect(engine.consultExpert).toHaveBeenCalledTimes(2);
      expect(result.fallback).toBeUndefined();
    });

    it('should build a structured question from the trade signal', async () => {
      const engine = createMockEngine();
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal({
        vertical: 'crypto',
        side: 'NO',
        modelProbability: 0.65,
        marketProbability: 0.80,
        edge: 0.12,
        confidence: 0.85,
        suggestedSize: 40,
      });

      await advisor.consult(signal, 'BTC prediction');

      const call = vi.mocked(engine.consultExpert).mock.calls[0];
      const question = call[1]; // second arg = question

      expect(question).toContain('NO position');
      expect(question).toContain('crypto');
      expect(question).toContain('65.0%'); // model probability
      expect(question).toContain('80.0%'); // market probability
      expect(question).toContain('12.0%'); // edge
      expect(question).toContain('85.0%'); // confidence
      expect(question).toContain('$40');   // suggested size
      expect(question).toContain('BTC prediction'); // context
      expect(question).toContain('PROCEED');
      expect(question).toContain('CAUTION');
      expect(question).toContain('ABORT');
    });

    it('should return proceed for high-confidence, high-edge signals', async () => {
      const engine = createMockEngine();
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal({ confidence: 0.85, edge: 0.12 });
      const result = await advisor.consult(signal, 'test');

      expect(result.consensus).toBe('proceed');
      expect(result.adjustedConfidence).toBe(0.85);
    });

    it('should include expert names and roles in reasoning', async () => {
      const engine = createMockEngine();
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal();
      const result = await advisor.consult(signal, 'test');

      expect(result.reasoning).toContain('Live consultation');
      expect(result.reasoning).toContain('Chip Huyen');
    });
  });

  describe('consult() — fallback on subprocess failure', () => {
    it('should fall back to local heuristic when subprocess fails', async () => {
      const engine = createMockEngine(undefined, true, 'Connection refused');
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal({ confidence: 0.80, edge: 0.10 });
      const result = await advisor.consult(signal, 'test');

      expect(result.consulted).toBe(true);
      expect(result.fallback).toBe(true);
      expect(result.reasoning).toContain('[FALLBACK');
      expect(result.reasoning).toContain('Connection refused');
      // High confidence + high edge = proceed in local heuristic
      expect(result.consensus).toBe('proceed');
    });

    it('should fall back on timeout', async () => {
      const engine = createMockEngine(undefined, true, 'Consultation timed out after 30000ms');
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal({ confidence: 0.40, edge: 0.02 });
      const result = await advisor.consult(signal, 'test');

      expect(result.fallback).toBe(true);
      expect(result.reasoning).toContain('timed out');
      // Low confidence + low edge = abort in local heuristic
      expect(result.consensus).toBe('abort');
    });

    it('should use caution consensus in fallback for medium signals', async () => {
      const engine = createMockEngine(undefined, true);
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal({ confidence: 0.60, edge: 0.06 });
      const result = await advisor.consult(signal, 'test');

      expect(result.fallback).toBe(true);
      expect(result.consensus).toBe('caution');
      expect(result.adjustedConfidence).toBe(0.50); // 0.60 - 0.10
    });

    it('should never block trading — always return a result', async () => {
      const engine = createMockEngine(undefined, true, 'ENOENT: script not found');
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal();
      const result = await advisor.consult(signal, 'test');

      // Must return a valid result, never throw
      expect(result).toBeDefined();
      expect(result.consulted).toBe(true);
      expect(['proceed', 'caution', 'abort']).toContain(result.consensus);
      expect(typeof result.adjustedConfidence).toBe('number');
    });
  });

  describe('consult() — caching', () => {
    it('should cache results and return from cache on second call', async () => {
      const engine = createMockEngine();
      advisor = new MindCloneAdvisor({ enabled: true, cacheTtlMs: 60000 }, engine);

      const signal = makeSignal();
      const result1 = await advisor.consult(signal, 'test');
      const result2 = await advisor.consult(signal, 'test');

      expect(result1.fromCache).toBeUndefined();
      expect(result2.fromCache).toBe(true);
      // Engine should only be called once (first call)
      expect(engine.consultExpert).toHaveBeenCalledTimes(2); // 2 experts in weather
    });

    it('should not use cache for different markets', async () => {
      const engine = createMockEngine();
      advisor = new MindCloneAdvisor({ enabled: true, cacheTtlMs: 60000 }, engine);

      const signal1 = makeSignal({ marketId: 'market-A' });
      const signal2 = makeSignal({ marketId: 'market-B' });

      await advisor.consult(signal1, 'test');
      const result2 = await advisor.consult(signal2, 'test');

      expect(result2.fromCache).toBeUndefined();
      // 2 experts x 2 calls = 4
      expect(engine.consultExpert).toHaveBeenCalledTimes(4);
    });

    it('should not use cache for different verticals', async () => {
      const engine = createMockEngine();
      advisor = new MindCloneAdvisor({ enabled: true, cacheTtlMs: 60000 }, engine);

      const signal1 = makeSignal({ marketId: 'market-X', vertical: 'weather' });
      const signal2 = makeSignal({ marketId: 'market-X', vertical: 'crypto' });

      await advisor.consult(signal1, 'test');
      const result2 = await advisor.consult(signal2, 'test');

      expect(result2.fromCache).toBeUndefined();
    });

    it('should expire cache entries after TTL', async () => {
      const engine = createMockEngine();
      advisor = new MindCloneAdvisor({ enabled: true, cacheTtlMs: 100 }, engine); // 100ms TTL

      const signal = makeSignal();
      await advisor.consult(signal, 'test');

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      const result2 = await advisor.consult(signal, 'test');
      expect(result2.fromCache).toBeUndefined();
      // 2 experts x 2 calls = 4
      expect(engine.consultExpert).toHaveBeenCalledTimes(4);
    });

    it('should allow clearing the cache manually', async () => {
      const engine = createMockEngine();
      advisor = new MindCloneAdvisor({ enabled: true, cacheTtlMs: 60000 }, engine);

      const signal = makeSignal();
      await advisor.consult(signal, 'test');
      expect(advisor.cacheSize).toBe(1);

      advisor.clearCache();
      expect(advisor.cacheSize).toBe(0);
    });

    it('should cache fallback results too', async () => {
      const engine = createMockEngine(undefined, true);
      advisor = new MindCloneAdvisor({ enabled: true, cacheTtlMs: 60000 }, engine);

      const signal = makeSignal();
      const result1 = await advisor.consult(signal, 'test');
      const result2 = await advisor.consult(signal, 'test');

      expect(result1.fallback).toBe(true);
      expect(result2.fromCache).toBe(true);
      expect(result2.fallback).toBe(true);
    });
  });

  describe('getExpertsFor()', () => {
    beforeEach(() => {
      advisor = new MindCloneAdvisor({}, createMockEngine());
    });

    it('should return weather experts', () => {
      const experts = advisor.getExpertsFor('weather');
      expect(experts).toHaveLength(2);
      expect(experts[0].id).toBe('chip-huyen');
      expect(experts[1].id).toBe('cassie-kozyrkov');
    });

    it('should return crypto experts', () => {
      const experts = advisor.getExpertsFor('crypto');
      expect(experts).toHaveLength(2);
      expect(experts[0].id).toBe('aswath-damodaran');
    });

    it('should return politics experts', () => {
      const experts = advisor.getExpertsFor('politics');
      expect(experts).toHaveLength(2);
    });

    it('should return sports experts', () => {
      const experts = advisor.getExpertsFor('sports');
      expect(experts).toHaveLength(1);
    });

    it('should return empty array for unknown vertical', () => {
      const experts = advisor.getExpertsFor('unknown' as 'weather');
      expect(experts).toEqual([]);
    });
  });

  describe('confidence adjustment', () => {
    it('should not adjust confidence on proceed', async () => {
      const engine = createMockEngine();
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal({ confidence: 0.85, edge: 0.12 });
      const result = await advisor.consult(signal, 'test');

      expect(result.consensus).toBe('proceed');
      expect(result.adjustedConfidence).toBe(0.85);
    });

    it('should reduce confidence by 0.30 on abort (fallback)', async () => {
      const engine = createMockEngine(undefined, true);
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal({ confidence: 0.45, edge: 0.02 });
      const result = await advisor.consult(signal, 'test');

      expect(result.consensus).toBe('abort');
      expect(result.adjustedConfidence).toBeCloseTo(0.15, 2);
    });

    it('should never produce negative adjusted confidence', async () => {
      const engine = createMockEngine(undefined, true);
      advisor = new MindCloneAdvisor({ enabled: true }, engine);

      const signal = makeSignal({ confidence: 0.10, edge: 0.01 });
      const result = await advisor.consult(signal, 'test');

      expect(result.adjustedConfidence).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('ConsultationEngine', () => {
  it('should be constructable with defaults', () => {
    const engine = new ConsultationEngine();
    expect(engine).toBeDefined();
  });

  it('should accept custom script path and timeout', () => {
    const engine = new ConsultationEngine('/custom/path.js', 5000);
    expect(engine).toBeDefined();
  });
});
