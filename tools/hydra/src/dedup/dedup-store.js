/**
 * @module dedup-store
 * @description SQLite-backed deduplication store for HYDRA.
 * Replaces the JSON-based dedup-index.js with O(1) lookups via B-tree indexes,
 * ACID transactions, and prepared statements for ~500x faster operations.
 *
 * Uses better-sqlite3 (synchronous, no callbacks) for maximum throughput.
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = path.resolve(__dirname, '../../hydra-data/hydra.db');
const _require = createRequire(import.meta.url);

/** @type {DedupStore|null} */
let _instance = null;

/**
 * SQLite-backed dedup store.
 */
export class DedupStore {
  /**
   * @param {string} [dbPath] - Path to SQLite database file
   */
  constructor(dbPath) {
    this.dbPath = dbPath || DEFAULT_DB_PATH;
    this.db = null;
    this._statements = null;
  }

  /**
   * Initialize database connection and schema.
   * @returns {DedupStore}
   */
  init() {
    if (this.db) return this;

    // Ensure parent directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Dynamic import workaround: better-sqlite3 is CJS
    const Database = DedupStore._loadDatabase();
    this.db = new Database(this.dbPath);

    // Performance pragmas
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -8000'); // 8MB cache
    this.db.pragma('foreign_keys = ON');

    this._createSchema();
    this._prepareStatements();

    return this;
  }

  /**
   * Load better-sqlite3 module. Separated for testability.
   * @returns {Function} Database constructor
   */
  static _loadDatabase() {
    return _require('better-sqlite3');
  }

  /**
   * Create database schema.
   * @private
   */
  _createSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS urls (
        url TEXT PRIMARY KEY,
        url_normalized TEXT,
        content_id TEXT,
        title TEXT,
        source_type TEXT,
        first_seen TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS content_hashes (
        hash TEXT PRIMARY KEY,
        content_id TEXT,
        url TEXT,
        title TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS pipeline_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        started_at TEXT,
        finished_at TEXT,
        items_fetched INTEGER DEFAULT 0,
        items_filtered INTEGER DEFAULT 0,
        items_duplicates INTEGER DEFAULT 0,
        items_scored INTEGER DEFAULT 0,
        items_stored INTEGER DEFAULT 0,
        items_hallucinated INTEGER DEFAULT 0,
        errors INTEGER DEFAULT 0,
        error_details TEXT,
        tier_breakdown TEXT,
        duration_ms INTEGER,
        extra_summary TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_urls_content_id ON urls(content_id);
      CREATE INDEX IF NOT EXISTS idx_urls_first_seen ON urls(first_seen);
      CREATE INDEX IF NOT EXISTS idx_hashes_content_id ON content_hashes(content_id);
      CREATE INDEX IF NOT EXISTS idx_hashes_created_at ON content_hashes(created_at);
      CREATE INDEX IF NOT EXISTS idx_runs_started_at ON pipeline_runs(started_at);
    `);
  }

  /**
   * Prepare reusable statements for maximum performance.
   * @private
   */
  _prepareStatements() {
    this._statements = {
      checkUrl: this.db.prepare('SELECT content_id, title FROM urls WHERE url = ?'),
      insertUrl: this.db.prepare(
        'INSERT OR IGNORE INTO urls (url, url_normalized, content_id, title, source_type, first_seen) VALUES (?, ?, ?, ?, ?, ?)'
      ),
      checkHash: this.db.prepare('SELECT content_id, title FROM content_hashes WHERE hash = ?'),
      insertHash: this.db.prepare(
        'INSERT OR IGNORE INTO content_hashes (hash, content_id, url, title, created_at) VALUES (?, ?, ?, ?, ?)'
      ),
      countUrls: this.db.prepare('SELECT COUNT(*) as count FROM urls'),
      countHashes: this.db.prepare('SELECT COUNT(*) as count FROM content_hashes'),
      countRuns: this.db.prepare('SELECT COUNT(*) as count FROM pipeline_runs'),
      insertRun: this.db.prepare(`
        INSERT INTO pipeline_runs
          (started_at, finished_at, items_fetched, items_filtered, items_duplicates,
           items_scored, items_stored, items_hallucinated, errors, error_details,
           tier_breakdown, duration_ms, extra_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      lastRun: this.db.prepare('SELECT * FROM pipeline_runs ORDER BY id DESC LIMIT 1'),
      recentRuns: this.db.prepare('SELECT * FROM pipeline_runs ORDER BY id DESC LIMIT ?'),
      deleteUrlsOlderThan: this.db.prepare('DELETE FROM urls WHERE first_seen < ?'),
      deleteHashesOlderThan: this.db.prepare('DELETE FROM content_hashes WHERE created_at < ?'),
      deleteRunsOlderThan: this.db.prepare('DELETE FROM pipeline_runs WHERE started_at < ?'),
    };
  }

  // ─── URL Operations ────────────────────────────────────────────

  /**
   * Check if a URL has already been processed.
   * @param {string} normalizedUrl - Normalized URL
   * @returns {{ isDuplicate: boolean, existingId?: string }}
   */
  checkUrl(normalizedUrl) {
    const row = this._statements.checkUrl.get(normalizedUrl);
    if (row) {
      return { isDuplicate: true, existingId: row.content_id };
    }
    return { isDuplicate: false };
  }

  /**
   * Register a URL as processed.
   * @param {string} normalizedUrl - Normalized URL
   * @param {string} contentId - Content ID
   * @param {string} title - Content title
   * @param {string} [sourceType] - Source type (rss, github, etc.)
   */
  registerUrl(normalizedUrl, contentId, title, sourceType) {
    this._statements.insertUrl.run(
      normalizedUrl,
      normalizedUrl,
      contentId,
      title,
      sourceType || null,
      new Date().toISOString()
    );
  }

  // ─── Hash Operations ───────────────────────────────────────────

  /**
   * Check if a content hash has already been registered.
   * @param {string} hash - SHA256 hash
   * @returns {{ isDuplicate: boolean, existingId?: string }}
   */
  checkHash(hash) {
    const row = this._statements.checkHash.get(hash);
    if (row) {
      return { isDuplicate: true, existingId: row.content_id };
    }
    return { isDuplicate: false };
  }

  /**
   * Register a content hash.
   * @param {string} hash - SHA256 hash
   * @param {string} contentId - Content ID
   * @param {string} title - Content title
   * @param {string} [url] - Source URL
   */
  registerHash(hash, contentId, title, url) {
    this._statements.insertHash.run(
      hash,
      contentId,
      url || null,
      title,
      new Date().toISOString()
    );
  }

  // ─── Stats ─────────────────────────────────────────────────────

  /**
   * Get store statistics.
   * @returns {{ urls: number, hashes: number, pipelineRuns: number }}
   */
  getStats() {
    return {
      urls: this._statements.countUrls.get().count,
      hashes: this._statements.countHashes.get().count,
      pipelineRuns: this._statements.countRuns.get().count,
    };
  }

  // ─── Pipeline Runs ─────────────────────────────────────────────

  /**
   * Record a pipeline run.
   * @param {Object} run - Pipeline run data
   * @returns {number} Inserted row ID
   */
  recordPipelineRun(run) {
    const info = this._statements.insertRun.run(
      run.startedAt || new Date().toISOString(),
      run.finishedAt || new Date().toISOString(),
      run.itemsFetched || 0,
      run.itemsFiltered || 0,
      run.itemsDuplicates || 0,
      run.itemsScored || 0,
      run.itemsStored || 0,
      run.itemsHallucinated || 0,
      run.errors || 0,
      run.errorDetails ? JSON.stringify(run.errorDetails) : null,
      run.tierBreakdown ? JSON.stringify(run.tierBreakdown) : null,
      run.durationMs || 0,
      run.extraSummary || null
    );
    return info.lastInsertRowid;
  }

  /**
   * Get the last pipeline run.
   * @returns {Object|null}
   */
  getLastRun() {
    const row = this._statements.lastRun.get();
    if (!row) return null;
    return this._parseRunRow(row);
  }

  /**
   * Get recent pipeline runs.
   * @param {number} [limit=10] - Max runs to return
   * @returns {Object[]}
   */
  getRecentRuns(limit = 10) {
    const rows = this._statements.recentRuns.all(limit);
    return rows.map((r) => this._parseRunRow(r));
  }

  /**
   * Parse a pipeline run row from SQLite.
   * @param {Object} row - Raw row
   * @returns {Object}
   * @private
   */
  _parseRunRow(row) {
    return {
      id: row.id,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      itemsFetched: row.items_fetched,
      itemsFiltered: row.items_filtered,
      itemsDuplicates: row.items_duplicates,
      itemsScored: row.items_scored,
      itemsStored: row.items_stored,
      itemsHallucinated: row.items_hallucinated,
      errors: row.errors,
      errorDetails: row.error_details ? JSON.parse(row.error_details) : [],
      tierBreakdown: row.tier_breakdown ? JSON.parse(row.tier_breakdown) : {},
      durationMs: row.duration_ms,
      extraSummary: row.extra_summary,
    };
  }

  // ─── Cleanup ───────────────────────────────────────────────────

  /**
   * Remove entries older than the specified number of days.
   * @param {number} [olderThanDays=180] - Days threshold
   * @returns {{ urlsDeleted: number, hashesDeleted: number, runsDeleted: number }}
   */
  cleanup(olderThanDays = 180) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    const cutoffStr = cutoff.toISOString();

    const urlsResult = this._statements.deleteUrlsOlderThan.run(cutoffStr);
    const hashesResult = this._statements.deleteHashesOlderThan.run(cutoffStr);
    const runsResult = this._statements.deleteRunsOlderThan.run(cutoffStr);

    return {
      urlsDeleted: urlsResult.changes,
      hashesDeleted: hashesResult.changes,
      runsDeleted: runsResult.changes,
    };
  }

  // ─── Migration ─────────────────────────────────────────────────

  /**
   * Migrate data from old JSON dedup-index.json into SQLite.
   * Idempotent: uses INSERT OR IGNORE so can be run multiple times safely.
   * @param {string} [jsonPath] - Path to dedup-index.json
   * @returns {{ urlsMigrated: number, hashesMigrated: number, urlsSkipped: number, hashesSkipped: number }}
   */
  migrate(jsonPath) {
    const indexPath = jsonPath || path.resolve(__dirname, '../../hydra-data/index/dedup-index.json');

    if (!fs.existsSync(indexPath)) {
      console.warn(`[DedupStore] JSON index not found at ${indexPath}, nothing to migrate.`);
      return { urlsMigrated: 0, hashesMigrated: 0, urlsSkipped: 0, hashesSkipped: 0 };
    }

    const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    let urlsMigrated = 0;
    let hashesMigrated = 0;
    let urlsSkipped = 0;
    let hashesSkipped = 0;

    // Wrap in transaction for atomicity and speed
    const migrateTransaction = this.db.transaction(() => {
      // Migrate URLs
      if (data.urls) {
        for (const [url, entry] of Object.entries(data.urls)) {
          const info = this._statements.insertUrl.run(
            url,
            url,
            entry.id || '',
            entry.title || '',
            null,
            entry.processedAt || new Date().toISOString()
          );
          if (info.changes > 0) urlsMigrated++;
          else urlsSkipped++;
        }
      }

      // Migrate hashes
      if (data.hashes) {
        for (const [hash, entry] of Object.entries(data.hashes)) {
          const info = this._statements.insertHash.run(
            hash,
            entry.id || '',
            null,
            entry.title || '',
            entry.processedAt || new Date().toISOString()
          );
          if (info.changes > 0) hashesMigrated++;
          else hashesSkipped++;
        }
      }
    });

    migrateTransaction();

    console.log(`[DedupStore] Migration complete: ${urlsMigrated} URLs, ${hashesMigrated} hashes migrated (${urlsSkipped} URLs, ${hashesSkipped} hashes already existed).`);

    return { urlsMigrated, hashesMigrated, urlsSkipped, hashesSkipped };
  }

  // ─── Lifecycle ─────────────────────────────────────────────────

  /**
   * Close the database connection.
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this._statements = null;
    }
  }
}

// ─── Module-level singleton helpers ────────────────────────────────

/**
 * Get the singleton DedupStore instance, initialized if needed.
 * @param {string} [dbPath] - Override DB path (only used on first call)
 * @returns {DedupStore}
 */
export function getDedupStore(dbPath) {
  if (!_instance) {
    _instance = new DedupStore(dbPath);
    _instance.init();
  }
  return _instance;
}

/**
 * Reset the singleton (for testing).
 */
export function resetDedupStore() {
  if (_instance) {
    _instance.close();
    _instance = null;
  }
}

/**
 * Check if SQLite (better-sqlite3) is available.
 * @returns {boolean}
 */
export function isSqliteAvailable() {
  try {
    DedupStore._loadDatabase();
    return true;
  } catch {
    return false;
  }
}
