import { calculateWeightedScore, classifyTier, requiresHallucinationCheck, getMinConfidence, DEFAULT_WEIGHTS } from '../../src/curator/scoring-rubric.js';

describe('scoring-rubric', () => {
  describe('calculateWeightedScore', () => {
    test('calculates correct weighted average', () => {
      const scores = { relevance: 5, novelty: 5, actionability: 5, authority: 5, depth: 5 };
      expect(calculateWeightedScore(scores)).toBe(5);
    });

    test('calculates weighted average for mixed scores', () => {
      const scores = { relevance: 4, novelty: 3, actionability: 4, authority: 3, depth: 3 };
      const result = calculateWeightedScore(scores);
      // 4*0.3 + 3*0.25 + 4*0.2 + 3*0.15 + 3*0.10 = 1.2+0.75+0.8+0.45+0.3 = 3.5
      expect(result).toBeCloseTo(3.5, 1);
    });

    test('clamps scores to 1-5 range', () => {
      const scores = { relevance: 10, novelty: -1, actionability: 3, authority: 3, depth: 3 };
      const result = calculateWeightedScore(scores);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(5);
    });

    test('handles missing dimensions', () => {
      const scores = { relevance: 4 };
      const result = calculateWeightedScore(scores);
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });

  describe('classifyTier', () => {
    test('classifies S tier', () => {
      expect(classifyTier(4.8).tier).toBe('S');
    });

    test('classifies A tier', () => {
      expect(classifyTier(3.8).tier).toBe('A');
    });

    test('classifies B tier', () => {
      expect(classifyTier(2.8).tier).toBe('B');
    });

    test('classifies C tier', () => {
      expect(classifyTier(1.8).tier).toBe('C');
    });

    test('classifies D tier', () => {
      expect(classifyTier(1.0).tier).toBe('D');
    });

    test('returns action for each tier', () => {
      expect(classifyTier(4.8).action).toBe('ingest_full_alert');
      expect(classifyTier(3.8).action).toBe('ingest_full');
      expect(classifyTier(2.8).action).toBe('ingest_metadata_only');
    });
  });

  describe('requiresHallucinationCheck', () => {
    test('requires for S tier', () => {
      expect(requiresHallucinationCheck('S')).toBe(true);
    });

    test('requires for A tier', () => {
      expect(requiresHallucinationCheck('A')).toBe(true);
    });

    test('not required for B tier', () => {
      expect(requiresHallucinationCheck('B')).toBe(false);
    });
  });

  describe('getMinConfidence', () => {
    test('returns 4 for S tier', () => {
      expect(getMinConfidence('S')).toBe(4);
    });

    test('returns 3 for A tier', () => {
      expect(getMinConfidence('A')).toBe(3);
    });

    test('returns 1 for D tier', () => {
      expect(getMinConfidence('D')).toBe(1);
    });
  });
});
