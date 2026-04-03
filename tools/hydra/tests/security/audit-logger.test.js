import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { AuditLogger, SEVERITY } from '../../src/security/audit-logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);

const TEST_DB_DIR = resolve(__dirname, '..', '__tmp_audit');
const TEST_DB_PATH = resolve(TEST_DB_DIR, 'test-audit.db');

let db;
let logger;

beforeEach(() => {
  // Create fresh database for each test
  if (existsSync(TEST_DB_DIR)) {
    rmSync(TEST_DB_DIR, { recursive: true, force: true });
  }
  mkdirSync(TEST_DB_DIR, { recursive: true });

  const Database = _require('better-sqlite3');
  db = new Database(TEST_DB_PATH);
  db.pragma('journal_mode = WAL');

  logger = new AuditLogger(db);
});

afterEach(() => {
  if (db) {
    try { db.close(); } catch { /* ignore */ }
  }
  if (existsSync(TEST_DB_DIR)) {
    rmSync(TEST_DB_DIR, { recursive: true, force: true });
  }
});

describe('AuditLogger', () => {
  test('creates audit_log table on construction', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_log'").all();
    expect(tables).toHaveLength(1);
  });

  test('logAction writes an entry', () => {
    const runId = AuditLogger.generateRunId();
    logger.logAction(runId, 'test_action', {
      contentId: 'hydra-abc123',
      sourceType: 'rss',
      severity: SEVERITY.INFO,
    });

    const count = logger.getCount();
    expect(count).toBe(1);
  });

  test('logRunStart records a run start event', () => {
    const runId = AuditLogger.generateRunId();
    logger.logRunStart(runId, { sourceCount: 10, configHash: 'abc' });

    const events = logger.getRunEvents(runId);
    expect(events).toHaveLength(1);
    expect(events[0].action).toBe('run_start');
  });

  test('logRunEnd records a run end event', () => {
    const runId = AuditLogger.generateRunId();
    logger.logRunStart(runId, {});
    logger.logRunEnd(runId, { totalFetched: 100, totalIngested: 50 });

    const events = logger.getRunEvents(runId);
    expect(events).toHaveLength(2);
    expect(events[1].action).toBe('run_end');
  });

  test('logSecurityAlert records warning severity', () => {
    const runId = AuditLogger.generateRunId();
    logger.logSecurityAlert(runId, 'injection_suspect', {
      contentId: 'hydra-xyz',
      details: { pattern: 'ignore previous' },
    });

    const events = logger.getRunEvents(runId);
    expect(events[0].severity).toBe('warning');
    expect(events[0].action).toBe('security_injection_suspect');
  });

  test('getRunHistory returns recent runs', () => {
    const run1 = AuditLogger.generateRunId();
    const run2 = AuditLogger.generateRunId();

    logger.logRunStart(run1, {});
    logger.logRunEnd(run1, {});
    logger.logRunStart(run2, {});
    logger.logRunEnd(run2, {});

    const history = logger.getRunHistory(10);
    expect(history.length).toBe(2);
  });

  test('getContentHistory returns history for a content item', () => {
    const runId = AuditLogger.generateRunId();
    const contentId = 'hydra-test123';

    logger.logAction(runId, 'fetch', { contentId, sourceType: 'rss' });
    logger.logAction(runId, 'score', { contentId, tier: 'A', score: 4.2 });
    logger.logAction(runId, 'write_kb', { contentId });

    const history = logger.getContentHistory(contentId);
    expect(history).toHaveLength(3);
    expect(history[0].action).toBe('fetch');
    expect(history[1].action).toBe('score');
    expect(history[2].action).toBe('write_kb');
  });

  test('getActionCounts returns aggregated counts', () => {
    const runId = AuditLogger.generateRunId();

    logger.logAction(runId, 'fetch', {});
    logger.logAction(runId, 'fetch', {});
    logger.logAction(runId, 'score', {});

    const counts = logger.getActionCounts('-1 day');
    const fetchCount = counts.find(c => c.action === 'fetch');
    expect(fetchCount.count).toBe(2);
  });

  test('cleanup removes old entries', () => {
    const runId = AuditLogger.generateRunId();
    logger.logAction(runId, 'old_action', {});

    // Force-insert an old entry
    db.prepare(`
      INSERT INTO audit_log (run_id, action, timestamp)
      VALUES (?, 'ancient_action', datetime('now', '-100 days'))
    `).run(runId);

    const result = logger.cleanup(90);
    expect(result.deleted).toBe(1);
    expect(logger.getCount()).toBe(1); // only the recent one remains
  });

  test('generateRunId returns valid UUID', () => {
    const id = AuditLogger.generateRunId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test('formatRunHistory produces readable output', () => {
    const output = AuditLogger.formatRunHistory([
      { run_id: 'test-123', started: '2026-04-01', ended: '2026-04-01', event_count: 5 },
    ]);
    expect(output).toContain('test-123');
    expect(output).toContain('Events:  5');
  });

  test('logAction does not throw on database errors', () => {
    // Close db to force error
    db.close();
    // Should not throw
    expect(() => {
      logger.logAction('run-id', 'action', {});
    }).not.toThrow();
  });
});
