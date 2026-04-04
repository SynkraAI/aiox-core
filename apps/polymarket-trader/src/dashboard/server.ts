/**
 * Dashboard HTTP Server with SSE.
 * Built-in Node.js http module -- ZERO external dependencies.
 * Serves a single-page dark-theme dashboard + JSON APIs + real-time SSE stream.
 */

import { createServer, type IncomingMessage, type ServerResponse, type Server } from 'http';
import { getDashboardHTML } from './html.js';
import { DashboardAPI } from './api.js';
import { eventBus } from '../engine/event-bus.js';
import type { TradingSystem } from '../index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardServerConfig {
  port: number;
  refreshIntervalMs: number;
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardServerConfig = {
  port: 3737,
  refreshIntervalMs: 60_000,
};

type SSEClient = {
  id: number;
  res: ServerResponse;
};

// ---------------------------------------------------------------------------
// DashboardServer
// ---------------------------------------------------------------------------

export class DashboardServer {
  private server: Server | null = null;
  private api: DashboardAPI;
  private config: DashboardServerConfig;
  private clients: SSEClient[] = [];
  private clientIdCounter = 0;
  private pnlInterval: ReturnType<typeof setInterval> | null = null;
  private cachedHTML: string | null = null;

  constructor(system: TradingSystem, config?: Partial<DashboardServerConfig>) {
    this.api = new DashboardAPI(system);
    this.config = { ...DEFAULT_DASHBOARD_CONFIG, ...config };
    this.wireEvents();
  }

  /** Expose the API instance for external module wiring. */
  getAPI(): DashboardAPI {
    return this.api;
  }

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  start(port?: number): Promise<void> {
    const actualPort = port ?? this.config.port;

    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.on('error', (err) => {
        reject(err);
      });

      this.server.listen(actualPort, () => {
        console.log(`[Dashboard] Listening on http://localhost:${actualPort}`);
        resolve();
      });

      // Periodic P&L push
      this.pnlInterval = setInterval(() => {
        const pnl = this.api.getPnl();
        this.broadcast('pnl', pnl);
      }, this.config.refreshIntervalMs);
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.pnlInterval) {
        clearInterval(this.pnlInterval);
        this.pnlInterval = null;
      }

      // Close all SSE clients
      for (const client of this.clients) {
        client.res.end();
      }
      this.clients = [];

      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  isRunning(): boolean {
    return this.server !== null && this.server.listening;
  }

  // -----------------------------------------------------------------------
  // Event wiring
  // -----------------------------------------------------------------------

  private wireEvents(): void {
    eventBus.on('learning:trade-recorded', (trade) => {
      this.broadcast('trade', {
        id: trade.id,
        timestamp: new Date(trade.timestamp).toISOString(),
        marketId: trade.marketId,
        marketQuestion: trade.marketQuestion,
        vertical: trade.vertical,
        strategy: trade.strategy,
        side: trade.side,
        positionSize: trade.positionSize,
        pnl: trade.pnl,
        outcome: trade.outcome,
      });
    });

    eventBus.on('signal:detected', (signal) => {
      this.broadcast('signal', {
        marketId: signal.marketId,
        strategy: signal.strategy,
        side: signal.side,
        edge: signal.edge,
        confidence: signal.confidence,
      });
    });

    eventBus.on('position:opened', (pos) => {
      this.broadcast('position', { type: 'opened', marketId: pos.marketId, side: pos.side, size: pos.size });
    });

    eventBus.on('position:closed', (pos) => {
      this.broadcast('position', { type: 'closed', marketId: pos.marketId, pnl: pos.pnl ?? pos.realizedPnl });
    });

    eventBus.on('learning:drift-detected', (metrics) => {
      this.broadcast('drift', metrics);
    });

    eventBus.on('whale:activity-detected', (signal) => {
      this.broadcast('whale', {
        walletAddress: signal.walletAddress,
        marketId: signal.marketId,
        side: signal.side,
        size: signal.size,
      });
    });
  }

  // -----------------------------------------------------------------------
  // Request handling
  // -----------------------------------------------------------------------

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const urlObj = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const path = urlObj.pathname;
    const query: Record<string, string> = {};
    urlObj.searchParams.forEach((v, k) => { query[k] = v; });

    // CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Route matching
    try {
      if (path === '/') {
        this.serveHTML(res);
      } else if (path === '/events') {
        this.serveSSE(req, res);
      } else if (path === '/api/status') {
        this.sendJSON(res, this.api.getStatus());
      } else if (path === '/api/pnl') {
        const period = (query.period as string) || 'all';
        this.sendJSON(res, this.api.getPnl(period as 'all'));
      } else if (path === '/api/positions') {
        this.sendJSON(res, this.api.getPositions());
      } else if (path === '/api/trades') {
        const limit = parseInt(query.limit as string) || 50;
        const offset = parseInt(query.offset as string) || 0;
        this.sendJSON(res, this.api.getTrades(limit, offset));
      } else if (path === '/api/risk') {
        this.sendJSON(res, this.api.getRisk());
      } else if (path === '/api/health') {
        void this.api.getHealth().then(data => this.sendJSON(res, data));
      } else if (path === '/api/drift') {
        this.sendJSON(res, this.api.getDrift());
      } else if (path === '/api/strategies') {
        this.sendJSON(res, this.api.getStrategies());
      } else if (path === '/api/verticals') {
        this.sendJSON(res, this.api.getVerticals());
      } else if (path === '/api/markets') {
        const q = (query.q as string) || undefined;
        void this.api.getMarkets(q).then(data => this.sendJSON(res, data));
      } else if (path === '/api/gate') {
        void this.api.getGate().then(data => this.sendJSON(res, data));
      } else if (path === '/api/whales') {
        this.sendJSON(res, this.api.getWhales());
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: msg }));
    }
  }

  // -----------------------------------------------------------------------
  // Response helpers
  // -----------------------------------------------------------------------

  private serveHTML(res: ServerResponse): void {
    if (!this.cachedHTML) {
      this.cachedHTML = getDashboardHTML();
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(this.cachedHTML);
  }

  private sendJSON(res: ServerResponse, data: unknown): void {
    const body = JSON.stringify(data);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Content-Length': Buffer.byteLength(body),
    });
    res.end(body);
  }

  // -----------------------------------------------------------------------
  // SSE
  // -----------------------------------------------------------------------

  private serveSSE(req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Send initial ping
    res.write('event: ping\ndata: {}\n\n');

    const client: SSEClient = {
      id: ++this.clientIdCounter,
      res,
    };
    this.clients.push(client);

    req.on('close', () => {
      this.clients = this.clients.filter(c => c.id !== client.id);
    });
  }

  private broadcast(event: string, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const deadClients: number[] = [];

    for (const client of this.clients) {
      try {
        client.res.write(payload);
      } catch {
        deadClients.push(client.id);
      }
    }

    if (deadClients.length > 0) {
      this.clients = this.clients.filter(c => !deadClients.includes(c.id));
    }
  }
}
