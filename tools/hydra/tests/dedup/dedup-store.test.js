/**
 * @module dedup-store.test
 * @description Tests for SQLite-backed deduplication store.
 */

import { jest } from '@jest/globals';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { DedupStore } from '../../src/dedup/dedup-store.js';

/**
 * Create a temporary DB path for isolated testing.
 * @returns {string}
 */
function tmpDbPath() {
  const dir = path.join(os.tmpdir(), `hydra-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'test.db');
}

/**
 * Cleanup a temp DB path.
 * @param {string} dbPath
 */
function cleanupDb(dbPath) {
  const dir = path.dirname(dbPath);
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}

describe('DedupStore', () => {
  let store;
  let dbPath;

  beforeEach(() => {
    dbPath = tmpDbPath();
    store = new DedupStore(dbPath);
    store.init();
  });

  afterEach(() => {
    store.close();
    cleanupDb(dbPath);
  });

  // ─── Initialization ──────────────────────────────────────────

  describe('initialization', () => {
    test('creates database file', () => {
      expect(fs.existsSync(dbPath)).toBe(true);
    });

    test('creates required tables', () => {
      const tables = store.db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all()
        .map((r) => r.name);

      expect(tables).toContain('urls');
      expect(tables).toContain('content_hashes');
      expect(tables).toContain('pipeline_runs');
    });

    test('sets WAL journal mode', () => {
      const mode = store.db.pragma('journal_mode', { simple: true });
      expect(mode).toBe('wal');
    });

    test('init is idempotent', () => {
      // Calling init again should not throw
      store.init();
      const stats = store.getStats();
      expect(stats.urls).toBe(0);
    });
  });

  // ─── URL Operations ──────────────────────────────────────────

  describe('URL operations', () => {
    test('checkUrl returns false for unknown URL', () => {
      const result = store.checkUrl('https://example.com/article');
      expect(result.isDuplicate).toBe(false);
      expect(result.existingId).toBeUndefined();
    });

    test('registerUrl + checkUrl detects duplicate', () => {
      store.registerUrl('https://example.com/article', 'hydra-abc123', 'Test Article');
      const result = store.checkUrl('https://example.com/article');
      expect(result.isDuplicate).toBe(true);
      expect(result.existingId).toBe('hydra-abc123');
    });

    test('registerUrl is idempotent (INSERT OR IGNORE)', () => {
      store.registerUrl('https://example.com/x', 'id-1', 'Title 1');
      store.registerUrl('https://example.com/x', 'id-2', 'Title 2');

      // First insert wins
      const result = store.checkUrl('https://example.com/x');
      expect(result.existingId).toBe('id-1');
    });

    test('registerUrl stores source type', () => {
      store.registerUrl('https://example.com/rss', 'id-1', 'RSS Article', 'rss');

      const row = store.db.prepare('SELECT source_type FROM urls WHERE url = ?').get('https://example.com/rss');
      expect(row.source_type).toBe('rss');
    });

    test('handles many URLs efficiently', () => {
      const count = 1000;
      const start = Date.now();

      for (let i = 0; i < count; i++) {
        store.registerUrl(`https://example.com/article-${i}`, `id-${i}`, `Article ${i}`);
      }

      const elapsed = Date.now() - start;
      const stats = store.getStats();
      expect(stats.urls).toBe(count);
      // Should complete in well under 5 seconds
      expect(elapsed).toBeLessThan(5000);
    });
  });

  // ─── Hash Operations ─────────────────────────────────────────

  describe('Hash operations', () => {
    test('checkHash returns false for unknown hash', () => {
      const result = store.checkHash('abc123def456');
      expect(result.isDuplicate).toBe(false);
    });

    test('registerHash + checkHash detects duplicate', () => {
      store.registerHash('deadbeef', 'hydra-xyz', 'Test Content', 'https://example.com/x');
      const result = store.checkHash('deadbeef');
      expect(result.isDuplicate).toBe(true);
      expect(result.existingId).toBe('hydra-xyz');
    });

    test('registerHash is idempotent', () => {
      store.registerHash('hash1', 'id-1', 'Title 1');
      store.registerHash('hash1', 'id-2', 'Title 2');

      const result = store.checkHash('hash1');
      expect(result.existingId).toBe('id-1');
    });
  });

  // ─── Stats ────────────────────────────────────────────────────

  describe('getStats', () => {
    test('returns zero counts on empty db', () => {
      const stats = store.getStats();
      expect(stats).toEqual({ urls: 0, hashes: 0, pipelineRuns: 0 });
    });

    test('counts reflect inserted data', () => {
      store.registerUrl('https://a.com', 'id-1', 'A');
      store.registerUrl('https://b.com', 'id-2', 'B');
      store.registerHash('hash-1', 'id-1', 'A');

      const stats = store.getStats();
      expect(stats.urls).toBe(2);
      expect(stats.hashes).toBe(1);
    });
  });

  // ─── Pipeline Runs ───────────────────────────────────────────

  describe('Pipeline runs', () => {
    test('recordPipelineRun inserts and returns ID', () => {
      const id = store.recordPipelineRun({
        startedAt: '2026-04-01T10:00:00Z',
        finishedAt: '2026-04-01T10:05:00Z',
        itemsFetched: 100,
        itemsFiltered: 20,
        itemsDuplicates: 30,
        itemsScored: 50,
        itemsStored: 10,
        itemsHallucinated: 2,
        errors: 1,
        errorDetails: ['RSS fetch failed'],
        tierBreakdown: { S: 2, A: 5, B: 3, C: 0, D: 0 },
        durationMs: 30000,
      });

      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    test('getLastRun returns most recent run', () => {
      store.recordPipelineRun({
        itemsFetched: 50,
        durationMs: 1000,
      });
      store.recordPipelineRun({
        itemsFetched: 100,
        durationMs: 2000,
      });

      const last = store.getLastRun();
      expect(last.itemsFetched).toBe(100);
      expect(last.durationMs).toBe(2000);
    });

    test('getLastRun returns null on empty db', () => {
      const last = store.getLastRun();
      expect(last).toBeNull();
    });

    test('getRecentRuns returns limited results', () => {
      for (let i = 0; i < 5; i++) {
        store.recordPipelineRun({ itemsFetched: i, durationMs: i * 100 });
      }

      const runs = store.getRecentRuns(3);
      expect(runs).toHaveLength(3);
      // Most recent first
      expect(runs[0].itemsFetched).toBe(4);
    });

    test('pipeline run parses JSON fields correctly', () => {
      store.recordPipelineRun({
        errorDetails: ['error-1', 'error-2'],
        tierBreakdown: { S: 1, A: 2 },
        durationMs: 500,
      });

      const run = store.getLastRun();
      expect(run.errorDetails).toEqual(['error-1', 'error-2']);
      expect(run.tierBreakdown).toEqual({ S: 1, A: 2 });
    });
  });

  // ─── Cleanup ──────────────────────────────────────────────────

  describe('cleanup', () => {
    test('removes entries older than threshold', () => {
      // Insert entries with old timestamps
      const oldDate = '2020-01-01T00:00:00Z';
      const newDate = new Date().toISOString();

      store.db.prepare(
        'INSERT INTO urls (url, url_normalized, content_id, title, first_seen) VALUES (?, ?, ?, ?, ?)'
      ).run('https://old.com', 'https://old.com', 'old-id', 'Old', oldDate);

      store.db.prepare(
        'INSERT INTO urls (url, url_normalized, content_id, title, first_seen) VALUES (?, ?, ?, ?, ?)'
      ).run('https://new.com', 'https://new.com', 'new-id', 'New', newDate);

      store.db.prepare(
        'INSERT INTO content_hashes (hash, content_id, title, created_at) VALUES (?, ?, ?, ?)'
      ).run('old-hash', 'old-id', 'Old', oldDate);

      store.db.prepare(
        'INSERT INTO content_hashes (hash, content_id, title, created_at) VALUES (?, ?, ?, ?)'
      ).run('new-hash', 'new-id', 'New', newDate);

      const result = store.cleanup(180);
      expect(result.urlsDeleted).toBe(1);
      expect(result.hashesDeleted).toBe(1);

      // New entries should remain
      expect(store.getStats().urls).toBe(1);
      expect(store.getStats().hashes).toBe(1);
    });

    test('cleanup with no old data deletes nothing', () => {
      store.registerUrl('https://fresh.com', 'fresh', 'Fresh');
      store.registerHash('fresh-hash', 'fresh', 'Fresh');

      const result = store.cleanup(180);
      expect(result.urlsDeleted).toBe(0);
      expect(result.hashesDeleted).toBe(0);
    });
  });

  // ─── Migration ────────────────────────────────────────────────

  describe('migrate', () => {
    test('migrates data from JSON index', () => {
      // Create a temporary JSON file
      const jsonDir = path.join(path.dirname(dbPath), 'index');
      fs.mkdirSync(jsonDir, { recursive: true });
      const jsonPath = path.join(jsonDir, 'dedup-index.json');

      const jsonData = {
        urls: {
          'https://example.com/a': { id: 'id-a', title: 'Article A', processedAt: '2026-01-01T00:00:00Z' },
          'https://example.com/b': { id: 'id-b', title: 'Article B', processedAt: '2026-02-01T00:00:00Z' },
        },
        hashes: {
          'hash-aaa': { id: 'id-a', title: 'Article A', processedAt: '2026-01-01T00:00:00Z' },
          'hash-bbb': { id: 'id-b', title: 'Article B', processedAt: '2026-02-01T00:00:00Z' },
        },
        stats: { totalProcessed: 100, totalDuplicates: 50, lastUpdated: '2026-03-01T00:00:00Z' },
      };

      fs.writeFileSync(jsonPath, JSON.stringify(jsonData), 'utf-8');

      const result = store.migrate(jsonPath);
      expect(result.urlsMigrated).toBe(2);
      expect(result.hashesMigrated).toBe(2);
      expect(result.urlsSkipped).toBe(0);
      expect(result.hashesSkipped).toBe(0);

      // Verify data is queryable
      expect(store.checkUrl('https://example.com/a').isDuplicate).toBe(true);
      expect(store.checkHash('hash-aaa').isDuplicate).toBe(true);
    });

    test('migration is idempotent', () => {
      const jsonDir = path.join(path.dirname(dbPath), 'index');
      fs.mkdirSync(jsonDir, { recursive: true });
      const jsonPath = path.join(jsonDir, 'dedup-index.json');

      const jsonData = {
        urls: { 'https://example.com/x': { id: 'id-x', title: 'X', processedAt: '2026-01-01T00:00:00Z' } },
        hashes: { 'hash-x': { id: 'id-x', title: 'X', processedAt: '2026-01-01T00:00:00Z' } },
        stats: { totalProcessed: 1, totalDuplicates: 0 },
      };

      fs.writeFileSync(jsonPath, JSON.stringify(jsonData), 'utf-8');

      const first = store.migrate(jsonPath);
      expect(first.urlsMigrated).toBe(1);

      const second = store.migrate(jsonPath);
      expect(second.urlsSkipped).toBe(1);
      expect(second.urlsMigrated).toBe(0);

      // Still only 1 entry
      expect(store.getStats().urls).toBe(1);
    });

    test('migrate with missing JSON file returns zeros', () => {
      const result = store.migrate('/nonexistent/path/dedup-index.json');
      expect(result.urlsMigrated).toBe(0);
      expect(result.hashesMigrated).toBe(0);
    });
  });

  // ─── Close ────────────────────────────────────────────────────

  describe('close', () => {
    test('close releases database', () => {
      store.close();
      expect(store.db).toBeNull();
      expect(store._statements).toBeNull();
    });

    test('double close does not throw', () => {
      store.close();
      expect(() => store.close()).not.toThrow();
    });
  });
});
