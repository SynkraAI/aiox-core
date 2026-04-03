import { VectorStore } from '../../src/store/vector-store.js';

describe('vector-store (Story 3.6)', () => {
  /** @type {VectorStore} */
  let store;

  const sampleText1 = 'Machine learning models are transforming how we build and deploy software applications in modern enterprise environments around the world';
  const sampleText2 = 'Deep learning neural networks have revolutionized computer vision and natural language processing tasks across many different industries and use cases';
  const sampleText3 = 'A delicious chocolate cake recipe requires mixing flour sugar cocoa powder butter and eggs then baking at three hundred fifty degrees for forty minutes';

  beforeEach(() => {
    store = new VectorStore({ mode: 'local', maxEntries: 100 });
    store._loaded = true; // Skip disk I/O
    store._entries = [];
  });

  describe('upsert', () => {
    test('stores content with valid text', async () => {
      const result = await store.upsert({
        id: 'test-1',
        title: 'ML Article',
        url: 'https://example.com/ml',
        tier: 'A',
        score: 3.8,
        domains: ['ai-ml'],
        tags: ['machine-learning'],
        normalizedText: sampleText1,
      });

      expect(result.stored).toBe(true);
      expect(store._entries.length).toBe(1);
      expect(store._entries[0].id).toBe('test-1');
    });

    test('rejects text too short for vectorization', async () => {
      const result = await store.upsert({
        id: 'test-short',
        title: 'Short',
        url: 'https://example.com/short',
        tier: 'B',
        score: 2.5,
        domains: [],
        tags: [],
        normalizedText: 'too short',
      });

      expect(result.stored).toBe(false);
      expect(result.error).toContain('too short');
    });

    test('updates existing entry with same ID', async () => {
      await store.upsert({
        id: 'test-1',
        title: 'Original Title',
        url: 'https://example.com/article',
        tier: 'B',
        score: 2.5,
        domains: [],
        tags: [],
        normalizedText: sampleText1,
      });

      await store.upsert({
        id: 'test-1',
        title: 'Updated Title',
        url: 'https://example.com/article',
        tier: 'A',
        score: 3.8,
        domains: ['ai-ml'],
        tags: [],
        normalizedText: sampleText1,
      });

      expect(store._entries.length).toBe(1);
      expect(store._entries[0].title).toBe('Updated Title');
      expect(store._entries[0].tier).toBe('A');
    });

    test('enforces max entries limit', async () => {
      store.maxEntries = 2;

      for (let i = 0; i < 3; i++) {
        await store.upsert({
          id: `test-${i}`,
          title: `Article ${i}`,
          url: `https://example.com/${i}`,
          tier: i === 0 ? 'S' : 'B',
          score: i === 0 ? 4.5 : 2.5,
          domains: [],
          tags: [],
          normalizedText: sampleText1 + ` variation number ${i} added here for uniqueness`,
        });
      }

      expect(store._entries.length).toBe(2);
      // Highest-scored entries should be kept
      const ids = store._entries.map((e) => e.id);
      expect(ids).toContain('test-0'); // S-tier, highest score
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await store.upsert({
        id: 'ml-1',
        title: 'ML Article',
        url: 'https://example.com/ml',
        tier: 'A',
        score: 3.8,
        domains: ['ai-ml'],
        tags: ['machine-learning'],
        normalizedText: sampleText1,
      });

      await store.upsert({
        id: 'dl-1',
        title: 'Deep Learning Article',
        url: 'https://example.com/dl',
        tier: 'S',
        score: 4.5,
        domains: ['ai-ml'],
        tags: ['deep-learning'],
        normalizedText: sampleText2,
      });

      await store.upsert({
        id: 'recipe-1',
        title: 'Cake Recipe',
        url: 'https://example.com/cake',
        tier: 'B',
        score: 2.5,
        domains: ['food'],
        tags: ['recipe'],
        normalizedText: sampleText3,
      });
    });

    test('returns empty for very short query', async () => {
      const results = await store.search('hi');
      expect(results.length).toBe(0);
    });

    test('finds similar content to query', async () => {
      const results = await store.search(
        'machine learning software applications deployment enterprise systems worldwide',
        { limit: 5 }
      );

      expect(results.length).toBeGreaterThan(0);
      // ML article should be most similar
      expect(results[0].id).toBe('ml-1');
      expect(results[0].similarity).toBeGreaterThan(0.3);
    });

    test('results are sorted by similarity descending', async () => {
      const results = await store.search(
        'machine learning artificial intelligence deep learning neural networks software development',
        { limit: 10 }
      );

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].similarity).toBeGreaterThanOrEqual(results[i].similarity);
      }
    });

    test('respects limit parameter', async () => {
      const results = await store.search(
        'learning software applications building modern systems today around the world',
        { limit: 1 }
      );
      expect(results.length).toBeLessThanOrEqual(1);
    });

    test('respects minSimilarity filter', async () => {
      const results = await store.search(
        'learning models software applications enterprise deployment systems development',
        { minSimilarity: 0.9 }
      );
      for (const r of results) {
        expect(r.similarity).toBeGreaterThanOrEqual(0.9);
      }
    });

    test('filters by domain', async () => {
      const results = await store.search(
        'machine learning artificial intelligence applications and software systems development',
        { filterDomains: ['food'] }
      );

      for (const r of results) {
        expect(r.domains).toContain('food');
      }
    });

    test('filters by tier', async () => {
      const results = await store.search(
        'learning applications building deploying modern systems around the world today',
        { filterTiers: ['S'] }
      );

      for (const r of results) {
        expect(r.tier).toBe('S');
      }
    });

    test('returns proper SearchResult shape', async () => {
      const results = await store.search(
        'machine learning software modern enterprise applications systems development worldwide',
        { limit: 1 }
      );

      if (results.length > 0) {
        const r = results[0];
        expect(r).toHaveProperty('id');
        expect(r).toHaveProperty('title');
        expect(r).toHaveProperty('url');
        expect(r).toHaveProperty('tier');
        expect(r).toHaveProperty('score');
        expect(r).toHaveProperty('similarity');
        expect(r).toHaveProperty('domains');
        // Vector should NOT be in search results
        expect(r).not.toHaveProperty('vector');
      }
    });
  });

  describe('getStats', () => {
    test('returns correct stats for empty store', async () => {
      const stats = await store.getStats();
      expect(stats.total).toBe(0);
      expect(stats.byTier).toEqual({});
      expect(stats.byDomain).toEqual({});
    });

    test('returns correct tier and domain breakdown', async () => {
      store._entries = [
        { id: '1', tier: 'S', score: 4.5, domains: ['ai-ml'], vector: {} },
        { id: '2', tier: 'A', score: 3.8, domains: ['ai-ml', 'engineering'], vector: {} },
        { id: '3', tier: 'B', score: 2.5, domains: ['food'], vector: {} },
      ];

      const stats = await store.getStats();
      expect(stats.total).toBe(3);
      expect(stats.byTier).toEqual({ S: 1, A: 1, B: 1 });
      expect(stats.byDomain['ai-ml']).toBe(2);
      expect(stats.byDomain['food']).toBe(1);
      expect(stats.byDomain['engineering']).toBe(1);
    });
  });

  describe('remove', () => {
    test('removes existing entry', async () => {
      store._entries = [
        { id: 'test-1', tier: 'A', vector: {} },
        { id: 'test-2', tier: 'B', vector: {} },
      ];

      const removed = await store.remove('test-1');
      expect(removed).toBe(true);
      expect(store._entries.length).toBe(1);
      expect(store._entries[0].id).toBe('test-2');
    });

    test('returns false for non-existent entry', async () => {
      const removed = await store.remove('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('clear', () => {
    test('removes all entries', async () => {
      store._entries = [
        { id: '1', vector: {} },
        { id: '2', vector: {} },
      ];

      await store.clear();
      expect(store._entries.length).toBe(0);
    });
  });

  describe('getSummary', () => {
    test('returns formatted summary', () => {
      store._entries = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const summary = store.getSummary();
      expect(summary).toContain('3 entries');
      expect(summary).toContain('local');
    });
  });
});
