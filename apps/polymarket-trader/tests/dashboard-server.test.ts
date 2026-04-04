import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DashboardServer } from '../src/dashboard/server.js';
import type { TradingSystem } from '../src/index.js';

// ---------------------------------------------------------------------------
// Mock system
// ---------------------------------------------------------------------------

function createMockSystem(): TradingSystem {
  return {
    client: {
      getMarkets: vi.fn().mockResolvedValue([]),
      searchMarkets: vi.fn().mockResolvedValue([]),
    } as unknown as TradingSystem['client'],
    risk: {
      getState: vi.fn().mockReturnValue({
        bankroll: 500, dailyPnl: 0, weeklyPnl: 0, openPositions: 0,
        totalExposure: 0, circuitBreakerTripped: false,
        lastUpdated: new Date(),
      }),
    } as unknown as TradingSystem['risk'],
    store: {
      getStats: vi.fn().mockReturnValue({
        total: 0, wins: 0, losses: 0, pending: 0,
        winRate: 0, totalPnl: 0, avgPnl: 0,
        byVertical: {}, byStrategy: {},
      }),
      getRecent: vi.fn().mockReturnValue([]),
    } as unknown as TradingSystem['store'],
    drift: {
      isHealthy: vi.fn().mockReturnValue(true),
      getReport: vi.fn().mockReturnValue({
        baselineEstablished: false, totalTrades: 0,
        metrics: {
          winRate: { current: 0, baseline: 0, zScore: 0, trend: 'stable', sampleSize: 0, alertTriggered: false },
          evPerTrade: { current: 0, baseline: 0, zScore: 0, trend: 'stable', sampleSize: 0, alertTriggered: false },
          edgeAccuracy: { current: 0, baseline: 0, zScore: 0, trend: 'stable', sampleSize: 0, alertTriggered: false },
          executionQuality: { current: 0, baseline: 0, zScore: 0, trend: 'stable', sampleSize: 0, alertTriggered: false },
        },
      }),
    } as unknown as TradingSystem['drift'],
    paper: {
      getStatus: vi.fn().mockReturnValue({
        mode: 'paper', startedAt: new Date(), daysRunning: 0,
        tradeCount: 0, openPositions: 0, readyForLive: false,
      }),
      getOpenPositions: vi.fn().mockReturnValue([]),
    } as unknown as TradingSystem['paper'],
    config: {
      mode: 'paper' as const,
      riskLimits: {
        maxPositionSize: 50, maxBankrollPercent: 0.05, kellyFraction: 0.15,
        dailyLossLimit: 0.10, weeklyLossLimit: 0.20, minEdge: 0.08,
        minLiquidity: 5000, maxOpenPositions: 10,
      },
      enabledVerticals: ['weather', 'crypto'],
      enabledStrategies: ['info_arb'],
      driftMonitorEnabled: true,
      aceEvolutionEnabled: true,
      telegramAlerts: false,
      pollIntervalMs: 60000,
    },
    start: vi.fn(),
    stop: vi.fn(),
  } as unknown as TradingSystem;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchFromServer(port: number, path: string): Promise<Response> {
  return fetch(`http://localhost:${port}${path}`);
}

function getRandomPort(): number {
  return 30000 + Math.floor(Math.random() * 10000);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardServer', () => {
  let server: DashboardServer;
  let port: number;

  beforeEach(() => {
    port = getRandomPort();
    const system = createMockSystem();
    server = new DashboardServer(system, { port, refreshIntervalMs: 600_000 });
  });

  afterEach(async () => {
    if (server.isRunning()) {
      await server.stop();
    }
  });

  // --- Lifecycle ---
  describe('lifecycle', () => {
    it('should start and stop', async () => {
      await server.start(port);
      expect(server.isRunning()).toBe(true);
      await server.stop();
      expect(server.isRunning()).toBe(false);
    });

    it('should be idempotent on stop when not running', async () => {
      await server.stop();
      expect(server.isRunning()).toBe(false);
    });
  });

  // --- HTML ---
  describe('HTML serving', () => {
    it('should serve HTML at root', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/');
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
      const body = await res.text();
      expect(body).toContain('Polymarket Trader');
      expect(body).toContain('<html');
    });
  });

  // --- JSON APIs ---
  describe('JSON APIs', () => {
    it('GET /api/status should return JSON', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/status');
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('application/json');
      const data = await res.json();
      expect(data.mode).toBe('paper');
    });

    it('GET /api/pnl should return P&L data', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/pnl');
      const data = await res.json();
      expect(data).toHaveProperty('totalPnl');
      expect(data).toHaveProperty('dailySeries');
    });

    it('GET /api/pnl with period param', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/pnl?period=7d');
      expect(res.status).toBe(200);
    });

    it('GET /api/positions should return array', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/positions');
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('GET /api/trades should return paginated trades', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/trades?limit=10&offset=0');
      const data = await res.json();
      expect(data).toHaveProperty('trades');
      expect(data).toHaveProperty('total');
    });

    it('GET /api/risk should return risk state', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/risk');
      const data = await res.json();
      expect(data).toHaveProperty('bankroll');
      expect(data).toHaveProperty('circuitBreakerTripped');
      expect(data).toHaveProperty('limits');
    });

    it('GET /api/drift should return drift metrics', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/drift');
      const data = await res.json();
      expect(data).toHaveProperty('baselineEstablished');
      expect(data).toHaveProperty('metrics');
    });

    it('GET /api/strategies should return array', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/strategies');
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('GET /api/verticals should return array', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/verticals');
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('GET /api/whales should return array', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/whales');
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  // --- CORS ---
  describe('CORS', () => {
    it('should set CORS headers', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/status');
      expect(res.headers.get('access-control-allow-origin')).toBe('*');
    });

    it('should handle OPTIONS preflight', async () => {
      await server.start(port);
      const res = await fetch(`http://localhost:${port}/api/status`, { method: 'OPTIONS' });
      expect(res.status).toBe(204);
    });
  });

  // --- 404 ---
  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      await server.start(port);
      const res = await fetchFromServer(port, '/api/nonexistent');
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Not found');
    });
  });

  // --- SSE ---
  describe('SSE', () => {
    it('should accept SSE connection at /events', async () => {
      await server.start(port);
      const controller = new AbortController();
      const res = await fetch(`http://localhost:${port}/events`, {
        signal: controller.signal,
        headers: { Accept: 'text/event-stream' },
      });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/event-stream');
      controller.abort();
    });

    it('should send initial ping', async () => {
      await server.start(port);
      const controller = new AbortController();

      const res = await fetch(`http://localhost:${port}/events`, {
        signal: controller.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      const { value } = await reader.read();
      const text = decoder.decode(value);
      expect(text).toContain('event: ping');

      controller.abort();
      reader.cancel().catch(() => {});
    });
  });

  // --- API instance ---
  describe('getAPI', () => {
    it('should expose the API instance', () => {
      const api = server.getAPI();
      expect(api).toBeDefined();
      expect(typeof api.getStatus).toBe('function');
    });
  });
});
