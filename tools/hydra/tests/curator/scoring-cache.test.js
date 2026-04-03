import { ScoringCache } from '../../src/curator/scoring-cache.js';

describe('scoring-cache (Story 3.4)', () => {
  /** @type {ScoringCache} */
  let cache;

  const mockResult = {
    tier: 'A',
    action: 'ingest_full',
    label: 'A-Tier (High Quality)',
    weightedScore: 3.8,
    scores: { relevance: 4, novelty: 4, actionability: 3, authority: 4, depth: 3 },
    reasoning: 'High quality content',
  };

  beforeEach(() => {
    // Create cache in disabled-persistence mode (no disk writes in tests)
    cache = new ScoringCache({ enabled: true });
    cache._loaded = true; // Skip disk loading
    cache.entries = [];
  });

  describe('diceCoefficient', () => {
    test('returns 1.0 for identical strings', () => {
      expect(cache.diceCoefficient('hello world', 'hello world')).toBeCloseTo(1.0);
    });

    test('returns 0 for completely different strings', () => {
      const sim = cache.diceCoefficient('abcdef', 'xyz123');
      expect(sim).toBe(0);
    });

    test('returns high similarity for similar strings', () => {
      const sim = cache.diceCoefficient(
        'How to Build Machine Learning Models',
        'How to Build Machine Learning Pipelines'
      );
      expect(sim).toBeGreaterThan(0.6);
    });

    test('returns 0 for empty strings', () => {
      expect(cache.diceCoefficient('', '')).toBe(0);
      expect(cache.diceCoefficient('hello', '')).toBe(0);
    });

    test('is case-insensitive', () => {
      expect(cache.diceCoefficient('Hello World', 'hello world')).toBeCloseTo(1.0);
    });
  });

  describe('lookup', () => {
    test('returns miss on empty cache', async () => {
      const result = await cache.lookup('Some Title', 'https://example.com/article');
      expect(result.hit).toBe(false);
    });

    test('returns miss for different domain', async () => {
      cache.entries.push({
        key: 'example.com:Some Title',
        title: 'Some Title',
        domain: 'example.com',
        result: mockResult,
        createdAt: Date.now(),
        hits: 0,
      });

      const result = await cache.lookup('Some Title', 'https://other-domain.com/article');
      expect(result.hit).toBe(false);
    });

    test('returns hit for same domain and similar title', async () => {
      cache.entries.push({
        key: 'example.com:Building ML Models',
        title: 'Building ML Models for Production',
        domain: 'example.com',
        result: mockResult,
        createdAt: Date.now(),
        hits: 0,
      });

      const result = await cache.lookup(
        'Building ML Models for Production Systems',
        'https://example.com/new-article'
      );
      expect(result.hit).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(result.similarity).toBeGreaterThan(0.7);
    });

    test('returns miss for very different title on same domain', async () => {
      cache.entries.push({
        key: 'example.com:ML Article',
        title: 'Introduction to Machine Learning',
        domain: 'example.com',
        result: mockResult,
        createdAt: Date.now(),
        hits: 0,
      });

      const result = await cache.lookup(
        'Chocolate Cake Recipe Tips and Tricks',
        'https://example.com/cooking'
      );
      expect(result.hit).toBe(false);
    });

    test('increments hit counter on cache hit', async () => {
      const entry = {
        key: 'example.com:Title',
        title: 'Exact Same Title Here',
        domain: 'example.com',
        result: mockResult,
        createdAt: Date.now(),
        hits: 0,
      };
      cache.entries.push(entry);

      await cache.lookup('Exact Same Title Here', 'https://example.com/page');
      expect(entry.hits).toBe(1);
      expect(cache.sessionHits).toBe(1);
    });

    test('returns miss when cache is disabled', async () => {
      cache.enabled = false;
      cache.entries.push({
        key: 'example.com:Title',
        title: 'Same Title',
        domain: 'example.com',
        result: mockResult,
        createdAt: Date.now(),
        hits: 0,
      });

      const result = await cache.lookup('Same Title', 'https://example.com/page');
      expect(result.hit).toBe(false);
    });

    test('strips www. from domain for matching', async () => {
      cache.entries.push({
        key: 'example.com:Title',
        title: 'Same Title Article',
        domain: 'example.com',
        result: mockResult,
        createdAt: Date.now(),
        hits: 0,
      });

      const result = await cache.lookup('Same Title Article', 'https://www.example.com/page');
      expect(result.hit).toBe(true);
    });
  });

  describe('store', () => {
    test('adds new entry', async () => {
      await cache.store('New Article', 'https://example.com/new', mockResult);
      expect(cache.entries.length).toBe(1);
      expect(cache.entries[0].title).toBe('New Article');
      expect(cache.entries[0].domain).toBe('example.com');
    });

    test('updates entry with very similar title on same domain', async () => {
      cache.entries.push({
        key: 'example.com:Same Article',
        title: 'Same Article Title',
        domain: 'example.com',
        result: { ...mockResult, weightedScore: 3.0 },
        createdAt: Date.now() - 10000,
        hits: 5,
      });

      const updatedResult = { ...mockResult, weightedScore: 4.2 };
      await cache.store('Same Article Title', 'https://example.com/updated', updatedResult);

      expect(cache.entries.length).toBe(1);
      expect(cache.entries[0].result.weightedScore).toBe(4.2);
    });

    test('enforces max entries limit', async () => {
      cache.maxEntries = 3;

      for (let i = 0; i < 5; i++) {
        await cache.store(`Article ${i}`, `https://site${i}.com/page`, mockResult);
      }

      expect(cache.entries.length).toBe(3);
    });

    test('does not store when disabled', async () => {
      cache.enabled = false;
      await cache.store('Title', 'https://example.com/page', mockResult);
      expect(cache.entries.length).toBe(0);
    });
  });

  describe('getStats', () => {
    test('returns correct stats', async () => {
      cache.entries.push(
        { key: 'a', title: 'A', domain: 'a.com', result: mockResult, createdAt: Date.now(), hits: 0 },
        { key: 'b', title: 'B', domain: 'b.com', result: mockResult, createdAt: Date.now(), hits: 0 }
      );
      cache.sessionHits = 3;
      cache.sessionMisses = 7;

      const stats = await cache.getStats();
      expect(stats.entries).toBe(2);
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(7);
    });

    test('evicts expired entries on getStats', async () => {
      cache.ttlMs = 1000; // 1 second TTL
      cache.entries.push({
        key: 'old',
        title: 'Old',
        domain: 'old.com',
        result: mockResult,
        createdAt: Date.now() - 5000, // 5 seconds ago
        hits: 0,
      });
      cache.entries.push({
        key: 'new',
        title: 'New',
        domain: 'new.com',
        result: mockResult,
        createdAt: Date.now(),
        hits: 0,
      });

      const stats = await cache.getStats();
      expect(stats.entries).toBe(1);
      expect(stats.evictions).toBe(1);
    });
  });

  describe('clear', () => {
    test('removes all entries', async () => {
      cache.entries.push(
        { key: 'a', title: 'A', domain: 'a.com', result: mockResult, createdAt: Date.now(), hits: 0 }
      );
      cache.sessionHits = 5;
      cache.sessionMisses = 3;

      await cache.clear();
      expect(cache.entries.length).toBe(0);
      expect(cache.sessionHits).toBe(0);
    });
  });

  describe('getSummary', () => {
    test('returns formatted summary', () => {
      cache.entries = [
        { key: 'a', title: 'A', domain: 'a.com', result: mockResult, createdAt: Date.now(), hits: 0 },
      ];
      cache.sessionHits = 8;
      cache.sessionMisses = 2;

      const summary = cache.getSummary();
      expect(summary).toContain('1 entries');
      expect(summary).toContain('8 hits');
      expect(summary).toContain('2 misses');
      expect(summary).toContain('80%');
    });

    test('handles zero totals', () => {
      const summary = cache.getSummary();
      expect(summary).toContain('0 entries');
      expect(summary).toContain('0%');
    });
  });
});
