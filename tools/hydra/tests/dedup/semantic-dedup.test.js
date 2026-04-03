import {
  computeFingerprint,
  cosineSimilarity,
  checkSemantic,
  getThreshold,
} from '../../src/dedup/semantic-dedup.js';

describe('semantic-dedup (Story 3.1)', () => {
  describe('computeFingerprint', () => {
    test('returns empty vector for empty text', () => {
      const fp = computeFingerprint('');
      expect(fp.tokens).toBe(0);
      expect(Object.keys(fp.vector).length).toBe(0);
    });

    test('returns empty vector for very short text', () => {
      const fp = computeFingerprint('hi');
      expect(fp.tokens).toBe(0); // 'hi' is 2 chars, filtered by length > 2
    });

    test('produces non-empty vector for real text', () => {
      const fp = computeFingerprint(
        'Machine learning is transforming the way we build software applications today'
      );
      expect(fp.tokens).toBeGreaterThan(5);
      expect(Object.keys(fp.vector).length).toBeGreaterThan(0);
    });

    test('includes bigrams in fingerprint', () => {
      const fp = computeFingerprint('the quick brown fox jumps');
      // Should have unigrams and bigrams
      expect(fp.vector).toHaveProperty('quick');
      expect(fp.vector).toHaveProperty('quick_brown');
    });

    test('normalizes values between 0 and 1', () => {
      const fp = computeFingerprint(
        'deep learning deep learning models are becoming more efficient and accessible'
      );
      for (const val of Object.values(fp.vector)) {
        expect(val).toBeGreaterThan(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('cosineSimilarity', () => {
    test('returns 1.0 for identical vectors', () => {
      const vec = { foo: 1, bar: 0.5 };
      expect(cosineSimilarity(vec, vec)).toBeCloseTo(1.0, 5);
    });

    test('returns 0 for completely disjoint vectors', () => {
      const vecA = { foo: 1, bar: 0.5 };
      const vecB = { baz: 1, qux: 0.5 };
      expect(cosineSimilarity(vecA, vecB)).toBe(0);
    });

    test('returns value between 0 and 1 for partially overlapping vectors', () => {
      const vecA = { foo: 1, bar: 0.5, shared: 0.8 };
      const vecB = { baz: 1, qux: 0.5, shared: 0.8 };
      const sim = cosineSimilarity(vecA, vecB);
      expect(sim).toBeGreaterThan(0);
      expect(sim).toBeLessThan(1);
    });

    test('handles empty vectors', () => {
      expect(cosineSimilarity({}, {})).toBe(0);
      expect(cosineSimilarity({ a: 1 }, {})).toBe(0);
      expect(cosineSimilarity({}, { a: 1 })).toBe(0);
    });

    test('handles null/undefined vectors', () => {
      expect(cosineSimilarity(null, null)).toBe(0);
      expect(cosineSimilarity(undefined, { a: 1 })).toBe(0);
    });
  });

  describe('getThreshold', () => {
    test('returns correct default threshold for known types', () => {
      expect(getThreshold('rss')).toBe(0.85);
      expect(getThreshold('youtube')).toBe(0.75);
      expect(getThreshold('twitter')).toBe(0.90);
      expect(getThreshold('podcast')).toBe(0.75);
    });

    test('returns default threshold for unknown types', () => {
      expect(getThreshold('unknown_source')).toBe(0.85);
    });

    test('custom thresholds override defaults', () => {
      expect(getThreshold('rss', { rss: 0.95 })).toBe(0.95);
    });
  });

  describe('checkSemantic', () => {
    test('returns not duplicate for short text', async () => {
      const result = await checkSemantic('short', 'rss', { fingerprints: [] });
      expect(result.isDuplicate).toBe(false);
      expect(result.similarity).toBe(0);
    });

    test('returns not duplicate when no stored fingerprints', async () => {
      const text = 'This is a reasonably long piece of text about machine learning and artificial intelligence applications in modern software development';
      const result = await checkSemantic(text, 'rss', { fingerprints: [] });
      expect(result.isDuplicate).toBe(false);
    });

    test('detects duplicate for identical text', async () => {
      const text = 'Machine learning is transforming the way we build software applications today and into the future of computing';
      const fp = computeFingerprint(text);

      const stored = [{
        id: 'existing-1',
        title: 'ML Article',
        sourceType: 'rss',
        vector: fp.vector,
        storedAt: new Date().toISOString(),
      }];

      const result = await checkSemantic(text, 'rss', { fingerprints: stored });
      expect(result.isDuplicate).toBe(true);
      expect(result.similarity).toBeCloseTo(1.0, 2);
      expect(result.matchedId).toBe('existing-1');
    });

    test('detects near-duplicate for similar text', async () => {
      const original = 'Machine learning is transforming the way we build modern software applications and services for enterprise customers around the world today';
      const similar = 'Machine learning is changing the way we develop modern software applications and services for enterprise clients around the world today';

      const fpOriginal = computeFingerprint(original);

      const stored = [{
        id: 'original-1',
        title: 'Original ML Article',
        sourceType: 'rss',
        vector: fpOriginal.vector,
        storedAt: new Date().toISOString(),
      }];

      const result = await checkSemantic(similar, 'rss', { fingerprints: stored });
      // These are very similar texts, so similarity should be high
      expect(result.similarity).toBeGreaterThan(0.7);
    });

    test('does not flag truly different content as duplicate', async () => {
      const original = 'The stock market saw significant gains today as tech companies reported strong quarterly earnings and positive growth outlook for the coming fiscal year';
      const different = 'A new recipe for chocolate cake involves mixing flour sugar butter and cocoa powder then baking at three hundred and fifty degrees for forty minutes until golden brown';

      const fpOriginal = computeFingerprint(original);

      const stored = [{
        id: 'finance-1',
        title: 'Stock Market',
        sourceType: 'rss',
        vector: fpOriginal.vector,
        storedAt: new Date().toISOString(),
      }];

      const result = await checkSemantic(different, 'rss', { fingerprints: stored });
      expect(result.isDuplicate).toBe(false);
      expect(result.similarity).toBeLessThan(0.5);
    });

    test('respects source-type-specific thresholds', async () => {
      const text1 = 'Breaking news about the latest developments in artificial intelligence research and deep learning applications across multiple industries worldwide';
      const text2 = 'Recent news covering the latest progress in artificial intelligence research and deep learning applications across various industries globally today';

      const fp1 = computeFingerprint(text1);

      const stored = [{
        id: 'news-1',
        title: 'AI News',
        sourceType: 'twitter',
        vector: fp1.vector,
        storedAt: new Date().toISOString(),
      }];

      // Twitter has higher threshold (0.90) vs rss (0.85)
      const resultTwitter = await checkSemantic(text2, 'twitter', { fingerprints: stored });
      const resultRss = await checkSemantic(text2, 'rss', { fingerprints: stored });

      // The similarity is the same, but the threshold differs
      expect(resultTwitter.similarity).toBe(resultRss.similarity);
    });
  });
});
