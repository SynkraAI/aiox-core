/**
 * AIOS Monitor - Database Layer
 *
 * SQLite database for storing events and sessions.
 * Uses Bun's native SQLite for performance.
 */

import { Database } from 'bun:sqlite';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import type { Event, Session, Stats } from './types';

const DB_PATH = process.env.MONITOR_DB || `${process.env.HOME}/.aios/monitor/events.db`;

// Ensure directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Initialize schema
db.run(`
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    session_id TEXT,
    project TEXT,
    cwd TEXT,
    agent TEXT,
    tool_name TEXT,
    tool_input TEXT,
    tool_result TEXT,
    is_error INTEGER,
    duration_ms INTEGER,
    aios_agent TEXT,
    aios_story_id TEXT,
    aios_task_id TEXT,
    data TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    project TEXT,
    cwd TEXT,
    start_time INTEGER,
    last_activity INTEGER,
    status TEXT DEFAULT 'active',
    event_count INTEGER DEFAULT 0,
    tool_calls INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    aios_agent TEXT,
    aios_story_id TEXT
  )
`);

// Create indexes for performance
db.run(`CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_events_type ON events(type)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_events_tool ON events(tool_name)`);

export function insertEvent(event: Event): void {
  const stmt = db.prepare(`
    INSERT INTO events (
      id, type, timestamp, session_id, project, cwd, agent,
      tool_name, tool_input, tool_result, is_error, duration_ms,
      aios_agent, aios_story_id, aios_task_id, data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    event.id,
    event.type,
    event.timestamp,
    event.session_id,
    event.project,
    event.cwd,
    event.agent,
    event.tool_name,
    JSON.stringify(event.tool_input),
    event.tool_result,
    event.is_error ? 1 : 0,
    event.duration_ms,
    event.aios_agent,
    event.aios_story_id,
    event.aios_task_id,
    JSON.stringify(event)
  );
}

export function getEvents(options: {
  session_id?: string;
  type?: string;
  tool_name?: string;
  aios_agent?: string;
  limit?: number;
  offset?: number;
}): Event[] {
  let sql = 'SELECT data FROM events WHERE 1=1';
  const params: unknown[] = [];

  if (options.session_id) {
    sql += ' AND session_id = ?';
    params.push(options.session_id);
  }

  if (options.type) {
    sql += ' AND type = ?';
    params.push(options.type);
  }

  if (options.tool_name) {
    sql += ' AND tool_name = ?';
    params.push(options.tool_name);
  }

  if (options.aios_agent) {
    sql += ' AND aios_agent = ?';
    params.push(options.aios_agent);
  }

  sql += ' ORDER BY timestamp DESC';

  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
  }

  if (options.offset) {
    sql += ' OFFSET ?';
    params.push(options.offset);
  }

  const rows = db.prepare(sql).all(...params) as { data: string }[];
  return rows.map((row) => JSON.parse(row.data));
}

export function getRecentEvents(limit: number = 50): Event[] {
  const rows = db.prepare('SELECT data FROM events ORDER BY timestamp DESC LIMIT ?').all(limit) as {
    data: string;
  }[];
  return rows.map((row) => JSON.parse(row.data));
}

export function getSessions(): Session[] {
  return db.prepare('SELECT * FROM sessions ORDER BY last_activity DESC').all() as Session[];
}

export function getSession(id: string): Session | null {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | null;
}

export function upsertSession(session_id: string, event: Event): void {
  const existing = db
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .get(session_id) as Session | null;

  if (existing) {
    db.prepare(
      `
      UPDATE sessions SET
        last_activity = ?,
        event_count = event_count + 1,
        tool_calls = tool_calls + ?,
        errors = errors + ?,
        aios_agent = COALESCE(?, aios_agent),
        aios_story_id = COALESCE(?, aios_story_id)
      WHERE id = ?
    `
    ).run(
      event.timestamp,
      event.type === 'PostToolUse' ? 1 : 0,
      event.is_error ? 1 : 0,
      event.aios_agent,
      event.aios_story_id,
      session_id
    );
  } else {
    db.prepare(
      `
      INSERT INTO sessions (id, project, cwd, start_time, last_activity, event_count, tool_calls, errors, aios_agent, aios_story_id)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `
    ).run(
      session_id,
      event.project || 'unknown',
      event.cwd || '',
      event.timestamp,
      event.timestamp,
      event.type === 'PostToolUse' ? 1 : 0,
      event.is_error ? 1 : 0,
      event.aios_agent,
      event.aios_story_id
    );
  }
}

export function getStats(): Stats {
  const total = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };

  const byType = db
    .prepare(
      `
    SELECT type, COUNT(*) as count
    FROM events
    GROUP BY type
    ORDER BY count DESC
  `
    )
    .all() as { type: string; count: number }[];

  const byTool = db
    .prepare(
      `
    SELECT tool_name, COUNT(*) as count
    FROM events
    WHERE tool_name IS NOT NULL
    GROUP BY tool_name
    ORDER BY count DESC
    LIMIT 20
  `
    )
    .all() as { tool_name: string; count: number }[];

  const errors = db.prepare('SELECT COUNT(*) as count FROM events WHERE is_error = 1').get() as {
    count: number;
  };

  const sessionsActive = db
    .prepare("SELECT COUNT(*) as count FROM sessions WHERE status = 'active'")
    .get() as { count: number };

  return {
    total: total.count,
    by_type: byType,
    by_tool: byTool,
    errors: errors.count,
    success_rate:
      total.count > 0 ? (((total.count - errors.count) / total.count) * 100).toFixed(1) : '100',
    sessions_active: sessionsActive.count,
  };
}

export function cleanup(retention_hours: number = 24): number {
  const cutoff = Date.now() - retention_hours * 60 * 60 * 1000;
  const result = db.prepare('DELETE FROM events WHERE timestamp < ?').run(cutoff);
  return result.changes;
}

export function clearAll(): void {
  db.run('DELETE FROM events');
  db.run('DELETE FROM sessions');
}
