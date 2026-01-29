/**
 * AIOS Monitor Server
 *
 * Real-time event server for monitoring Claude Code activity.
 * Receives events from hooks, stores in SQLite, broadcasts via WebSocket.
 *
 * Based on mmos/squads/monitor - adapted for AIOS Dashboard integration.
 */

import { randomUUID } from 'crypto';
import { existsSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import {
  insertEvent,
  getEvents,
  getSessions,
  getSession,
  upsertSession,
  getStats,
  getRecentEvents,
  cleanup,
} from './db';
import type { Event, EventPayload } from './types';

const PORT = parseInt(process.env.MONITOR_PORT || '4001');
const HOME = process.env.HOME || '';

// WebSocket clients
const clients = new Set<ServerWebSocket<unknown>>();

// Type for Bun's WebSocket
type ServerWebSocket<T> = {
  send: (message: string) => void;
  close: () => void;
  data: T;
};

// Cleanup old events periodically (every hour)
setInterval(
  () => {
    const deleted = cleanup(24);
    if (deleted > 0) {
      console.log(`[Cleanup] Removed ${deleted} old events`);
    }
  },
  60 * 60 * 1000
);

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function _getMimeType(path: string): string {
  const ext = path.substring(path.lastIndexOf('.'));
  return MIME_TYPES[ext] || 'application/octet-stream';
}

// Broadcast event to all WebSocket clients
function broadcast(event: Event) {
  const message = JSON.stringify({ type: 'event', event });
  for (const client of clients) {
    try {
      client.send(message);
    } catch {
      clients.delete(client);
    }
  }
}

// Find Claude transcripts
function findTranscripts(projectPath?: string, days?: number): string[] {
  const claudeProjectsDir = join(HOME, '.claude', 'projects');
  if (!existsSync(claudeProjectsDir)) return [];

  const transcripts: Array<{ path: string; mtime: number }> = [];
  const cutoffTime = days ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;

  try {
    const dirs = readdirSync(claudeProjectsDir);
    for (const dir of dirs) {
      if (projectPath) {
        const encoded = projectPath.replace(/\//g, '-');
        if (!dir.includes(encoded)) continue;
      }

      const fullDir = join(claudeProjectsDir, dir);
      try {
        const dirStat = statSync(fullDir);
        if (dirStat.isDirectory()) {
          const files = readdirSync(fullDir);
          for (const file of files) {
            if (file.endsWith('.jsonl')) {
              const filePath = join(fullDir, file);
              try {
                const fileStat = statSync(filePath);
                if (days && fileStat.mtimeMs < cutoffTime) continue;
                transcripts.push({
                  path: filePath,
                  mtime: fileStat.mtimeMs,
                });
              } catch {
                // Skip inaccessible files
              }
            }
          }
        }
      } catch {
        // Skip inaccessible
      }
    }
  } catch {
    // Skip
  }

  return transcripts.sort((a, b) => b.mtime - a.mtime).map((t) => t.path);
}

// Format duration (exported for future use)
function _formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
}

const _server = Bun.serve({
  port: PORT,

  async fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === '/stream') {
      const upgraded = server.upgrade(req);
      if (!upgraded) {
        return new Response('WebSocket upgrade failed', { status: 400 });
      }
      return undefined;
    }

    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // API: Receive events from hooks
    if (url.pathname === '/events' && req.method === 'POST') {
      try {
        const payload = (await req.json()) as EventPayload;

        const event: Event = {
          id: randomUUID(),
          type: payload.type,
          timestamp: payload.timestamp || Date.now(),
          session_id: (payload.data.session_id as string) || 'unknown',
          project: payload.data.project as string,
          cwd: payload.data.cwd as string,
          tool_name: payload.data.tool_name as string,
          tool_input: payload.data.tool_input as Record<string, unknown>,
          tool_result: payload.data.tool_result as string,
          is_error: payload.data.is_error as boolean,
          aios_agent: payload.data.aios_agent as string,
          aios_story_id: payload.data.aios_story_id as string,
          aios_task_id: payload.data.aios_task_id as string,
          data: payload.data,
        };

        // Save to DB
        insertEvent(event);

        // Update session
        if (event.session_id) {
          upsertSession(event.session_id, event);
        }

        // Broadcast to WebSocket clients
        broadcast(event);

        return new Response(JSON.stringify({ ok: true, id: event.id }), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('[Error] Processing event:', error);
        return new Response(JSON.stringify({ error: 'Invalid payload' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    // API: Get events
    if (url.pathname === '/events' && req.method === 'GET') {
      const params = url.searchParams;
      const events = getEvents({
        session_id: params.get('session_id') || undefined,
        type: params.get('type') || undefined,
        tool_name: params.get('tool_name') || undefined,
        aios_agent: params.get('aios_agent') || undefined,
        limit: parseInt(params.get('limit') || '100'),
        offset: parseInt(params.get('offset') || '0'),
      });

      return new Response(JSON.stringify(events), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // API: Get recent events
    if (url.pathname === '/events/recent') {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const events = getRecentEvents(limit);

      return new Response(JSON.stringify(events), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // API: Get sessions
    if (url.pathname === '/sessions') {
      const sessions = getSessions();
      return new Response(JSON.stringify(sessions), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // API: Get single session
    if (url.pathname.startsWith('/sessions/') && !url.pathname.includes('/events')) {
      const id = url.pathname.replace('/sessions/', '');
      const session = getSession(id);
      if (!session) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(session), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // API: Get events for a session
    if (url.pathname.match(/^\/sessions\/[^/]+\/events$/)) {
      const sessionId = url.pathname.split('/')[2];
      const events = getEvents({
        session_id: sessionId,
        limit: parseInt(url.searchParams.get('limit') || '100'),
      });
      return new Response(JSON.stringify(events), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // API: Get stats
    if (url.pathname === '/stats') {
      const stats = getStats();
      return new Response(JSON.stringify(stats), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // API: List transcripts
    if (url.pathname === '/transcripts') {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const projectPath = url.searchParams.get('project') || undefined;
      const transcripts = findTranscripts(projectPath).slice(0, limit);

      const result = transcripts.map((t) => {
        const stat = statSync(t);
        return {
          path: t,
          session_id: basename(t, '.jsonl'),
          size: stat.size,
          modified: stat.mtime.toISOString(),
        };
      });

      return new Response(JSON.stringify(result), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // API: Health check
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          clients: clients.size,
          uptime: process.uptime(),
        }),
        {
          headers: { ...headers, 'Content-Type': 'application/json' },
        }
      );
    }

    // Root endpoint - API info
    if (url.pathname === '/') {
      return new Response(
        JSON.stringify({
          name: 'AIOS Monitor Server',
          version: '1.0.0',
          endpoints: {
            'POST /events': 'Receive events from hooks',
            'GET /events': 'Query events',
            'GET /events/recent': 'Get recent events',
            'GET /sessions': 'List sessions',
            'GET /sessions/:id': 'Get session by ID',
            'GET /sessions/:id/events': 'Get events for session',
            'GET /stats': 'Aggregated statistics',
            'GET /transcripts': 'List Claude transcripts',
            'WS /stream': 'WebSocket for real-time events',
            'GET /health': 'Health check',
          },
        }),
        {
          headers: { ...headers, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response('Not found', { status: 404 });
  },

  websocket: {
    open(ws) {
      clients.add(ws as unknown as ServerWebSocket<unknown>);
      console.log(`[WS] Client connected (${clients.size} total)`);

      // Send recent events on connect
      const recent = getRecentEvents(20);
      ws.send(JSON.stringify({ type: 'init', events: recent }));
    },
    close(ws) {
      clients.delete(ws as unknown as ServerWebSocket<unknown>);
      console.log(`[WS] Client disconnected (${clients.size} remaining)`);
    },
    message(ws, message) {
      // Handle ping/pong
      if (message === 'ping') {
        ws.send('pong');
      }
    },
  },
});

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              AIOS MONITOR SERVER v1.0                          ║
╠════════════════════════════════════════════════════════════════╣
║  Server:    http://localhost:${PORT}                              ║
║  WebSocket: ws://localhost:${PORT}/stream                         ║
╠════════════════════════════════════════════════════════════════╣
║  API Endpoints:                                                ║
║  POST /events              - Receive events from hooks         ║
║  GET  /events              - Query events                      ║
║  GET  /events/recent       - Get recent events                 ║
║  GET  /sessions            - List sessions                     ║
║  GET  /sessions/:id        - Get session details               ║
║  GET  /sessions/:id/events - Get session events                ║
║  GET  /stats               - Aggregated stats                  ║
║  GET  /transcripts         - List Claude transcripts           ║
║  WS   /stream              - Real-time event stream            ║
║  GET  /health              - Health check                      ║
╚════════════════════════════════════════════════════════════════╝
`);
