import { diceCoefficient, findBestMatch, verifyQuotes } from '../../src/hallucination/quote-verifier.js';

describe('quote-verifier', () => {
  describe('diceCoefficient', () => {
    test('returns 1 for identical strings', () => {
      expect(diceCoefficient('hello world', 'hello world')).toBe(1);
    });

    test('returns 0 for completely different strings', () => {
      const result = diceCoefficient('abc', 'xyz');
      expect(result).toBeLessThan(0.2);
    });

    test('returns high similarity for similar strings', () => {
      const result = diceCoefficient('machine learning', 'machine leaning');
      expect(result).toBeGreaterThan(0.8);
    });

    test('handles empty strings', () => {
      expect(diceCoefficient('', 'hello')).toBe(0);
      expect(diceCoefficient('hello', '')).toBe(0);
    });
  });

  describe('findBestMatch', () => {
    test('finds exact substring match', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const { similarity } = findBestMatch('quick brown fox', text);
      expect(similarity).toBe(1.0);
    });

    test('finds fuzzy match', () => {
      const text = 'Machine learning has transformed the industry significantly.';
      const { similarity } = findBestMatch('Machine learning transformed industry', text);
      expect(similarity).toBeGreaterThan(0.6);
    });

    test('returns low similarity for non-matching text', () => {
      const text = 'The weather is nice today.';
      const { similarity } = findBestMatch('Quantum computing will change everything', text);
      expect(similarity).toBeLessThan(0.3);
    });
  });

  describe('verifyQuotes', () => {
    const originalText = 'AI is transforming healthcare. Machine learning models can now diagnose diseases with high accuracy. Dr. Smith said that early detection saves lives.';

    test('confirms quotes present in text', () => {
      const results = verifyQuotes(['Machine learning models can now diagnose diseases'], originalText);
      expect(results[0].status).toBe('CONFIRMED');
    });

    test('marks fabricated quotes as hallucinated', () => {
      const results = verifyQuotes(['Quantum computing will solve all problems'], originalText);
      expect(results[0].status).toBe('HALLUCINATED');
    });

    test('handles paraphrased quotes', () => {
      const results = verifyQuotes(['ML models diagnose diseases accurately'], originalText);
      // Should be PARAPHRASED or CONFIRMED depending on threshold
      expect(['CONFIRMED', 'PARAPHRASED']).toContain(results[0].status);
    });

    test('returns similarity scores', () => {
      const results = verifyQuotes(['some quote'], originalText);
      expect(results[0]).toHaveProperty('similarity');
      expect(typeof results[0].similarity).toBe('number');
    });
  });
});
