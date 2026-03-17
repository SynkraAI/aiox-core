/**
 * Testes unitários para RateLimitManager
 *
 * Cobre executeWithRetry, calculateDelay, isRateLimitError,
 * preemptiveThrottle, metrics, events e withRateLimit wrapper.
 *
 * @see .aiox-core/core/execution/rate-limit-manager.js
 * @issue #52
 */

'use strict';

const RateLimitManager = require('../../../.aiox-core/core/execution/rate-limit-manager');
const { withRateLimit, getGlobalManager } = RateLimitManager;

// ============================================================================
// Constructor
// ============================================================================

describe('RateLimitManager — constructor', () => {
  it('deve usar defaults quando sem config', () => {
    const mgr = new RateLimitManager();
    expect(mgr.maxRetries).toBe(5);
    expect(mgr.baseDelay).toBe(1000);
    expect(mgr.maxDelay).toBe(30000);
    expect(mgr.requestsPerMinute).toBe(50);
  });

  it('deve aceitar config custom', () => {
    const mgr = new RateLimitManager({
      maxRetries: 3,
      baseDelay: 500,
      maxDelay: 10000,
      requestsPerMinute: 20,
    });
    expect(mgr.maxRetries).toBe(3);
    expect(mgr.baseDelay).toBe(500);
    expect(mgr.maxDelay).toBe(10000);
    expect(mgr.requestsPerMinute).toBe(20);
  });

  it('deve inicializar metrics zerados', () => {
    const mgr = new RateLimitManager();
    expect(mgr.metrics.rateLimitHits).toBe(0);
    expect(mgr.metrics.totalRetries).toBe(0);
    expect(mgr.metrics.totalRequests).toBe(0);
  });

  it('deve ser EventEmitter', () => {
    const mgr = new RateLimitManager();
    expect(typeof mgr.on).toBe('function');
    expect(typeof mgr.emit).toBe('function');
  });
});

// ============================================================================
// isRateLimitError
// ============================================================================

describe('RateLimitManager — isRateLimitError', () => {
  let mgr;
  beforeEach(() => { mgr = new RateLimitManager(); });

  it('deve detectar HTTP 429 via status', () => {
    expect(mgr.isRateLimitError({ status: 429, message: '' })).toBe(true);
  });

  it('deve detectar HTTP 429 via statusCode', () => {
    expect(mgr.isRateLimitError({ statusCode: 429, message: '' })).toBe(true);
  });

  it('deve detectar "rate limit" na mensagem', () => {
    expect(mgr.isRateLimitError(new Error('rate limit exceeded'))).toBe(true);
  });

  it('deve detectar "too many requests" na mensagem', () => {
    expect(mgr.isRateLimitError(new Error('too many requests'))).toBe(true);
  });

  it('deve detectar "throttl" na mensagem', () => {
    expect(mgr.isRateLimitError(new Error('request throttled'))).toBe(true);
  });

  it('deve detectar "quota exceeded" na mensagem', () => {
    expect(mgr.isRateLimitError(new Error('API quota exceeded'))).toBe(true);
  });

  it('deve detectar "overloaded" (Anthropic)', () => {
    expect(mgr.isRateLimitError(new Error('API is overloaded'))).toBe(true);
  });

  it('deve detectar code RATE_LIMITED', () => {
    const err = new Error('fail');
    err.code = 'RATE_LIMITED';
    expect(mgr.isRateLimitError(err)).toBe(true);
  });

  it('deve detectar code TOO_MANY_REQUESTS', () => {
    const err = new Error('fail');
    err.code = 'TOO_MANY_REQUESTS';
    expect(mgr.isRateLimitError(err)).toBe(true);
  });

  it('deve retornar false para erros normais', () => {
    expect(mgr.isRateLimitError(new Error('connection refused'))).toBe(false);
    expect(mgr.isRateLimitError(new Error('timeout'))).toBe(false);
    expect(mgr.isRateLimitError({ status: 500, message: 'server error' })).toBe(false);
  });
});

// ============================================================================
// calculateDelay
// ============================================================================

describe('RateLimitManager — calculateDelay', () => {
  let mgr;
  beforeEach(() => { mgr = new RateLimitManager({ baseDelay: 1000, maxDelay: 30000 }); });

  it('deve usar retryAfter do erro quando disponível', () => {
    const err = new Error('rate limited');
    err.retryAfter = 5;
    const delay = mgr.calculateDelay(1, err);
    expect(delay).toBe(5000);
  });

  it('deve limitar retryAfter ao maxDelay', () => {
    const err = new Error('rate limited');
    err.retryAfter = 60;
    const delay = mgr.calculateDelay(1, err);
    expect(delay).toBe(30000);
  });

  it('deve extrair retry-after da mensagem de erro', () => {
    const err = new Error('Retry-After: 3');
    const delay = mgr.calculateDelay(1, err);
    expect(delay).toBe(3000);
  });

  it('deve usar backoff exponencial sem retryAfter', () => {
    const err = new Error('rate limited');
    // attempt 1: 1000 * 2^0 = 1000 + jitter(0-1000) ≈ 1000-2000
    const delay1 = mgr.calculateDelay(1, err);
    expect(delay1).toBeGreaterThanOrEqual(1000);
    expect(delay1).toBeLessThanOrEqual(2001);

    // attempt 3: 1000 * 2^2 = 4000 + jitter(0-1000) ≈ 4000-5000
    const delay3 = mgr.calculateDelay(3, err);
    expect(delay3).toBeGreaterThanOrEqual(4000);
    expect(delay3).toBeLessThanOrEqual(5001);
  });

  it('deve limitar ao maxDelay', () => {
    const err = new Error('rate limited');
    // attempt 10: 1000 * 2^9 = 512000 → capped at 30000
    const delay = mgr.calculateDelay(10, err);
    expect(delay).toBeLessThanOrEqual(30000);
  });
});

// ============================================================================
// executeWithRetry
// ============================================================================

describe('RateLimitManager — executeWithRetry', () => {
  let mgr;
  beforeEach(() => {
    mgr = new RateLimitManager({ maxRetries: 3, baseDelay: 1 });
    mgr.sleep = jest.fn().mockResolvedValue(undefined); // Skip delays
  });

  it('deve retornar resultado quando fn sucede na primeira tentativa', async () => {
    const result = await mgr.executeWithRetry(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
    expect(mgr.metrics.totalRequests).toBe(1);
    expect(mgr.metrics.rateLimitHits).toBe(0);
  });

  it('deve fazer retry em rate limit e suceder na segunda', async () => {
    let attempt = 0;
    const fn = () => {
      attempt++;
      if (attempt === 1) {
        const err = new Error('rate limit');
        throw err;
      }
      return Promise.resolve('recovered');
    };

    const result = await mgr.executeWithRetry(fn);
    expect(result).toBe('recovered');
    expect(mgr.metrics.rateLimitHits).toBe(1);
    expect(mgr.metrics.successAfterRetry).toBe(1);
    expect(mgr.metrics.totalRetries).toBe(1);
  });

  it('deve lançar após maxRetries em rate limit', async () => {
    const fn = () => { throw new Error('rate limit exceeded'); };

    await expect(mgr.executeWithRetry(fn)).rejects.toThrow('Rate limit exceeded after 3 retries');
    expect(mgr.metrics.rateLimitHits).toBe(3);
  });

  it('deve lançar imediatamente para erros não-rate-limit', async () => {
    const fn = () => { throw new Error('connection refused'); };

    await expect(mgr.executeWithRetry(fn)).rejects.toThrow('connection refused');
    expect(mgr.metrics.rateLimitHits).toBe(0);
    expect(mgr.metrics.totalRetries).toBe(0);
  });

  it('deve emitir eventos rate_limit_hit e waiting', async () => {
    const events = [];
    mgr.on('rate_limit_hit', (data) => events.push({ type: 'hit', ...data }));
    mgr.on('waiting', (data) => events.push({ type: 'wait', ...data }));

    let attempt = 0;
    const fn = () => {
      attempt++;
      if (attempt <= 2) throw new Error('rate limit');
      return Promise.resolve('ok');
    };

    await mgr.executeWithRetry(fn);
    expect(events.filter((e) => e.type === 'hit')).toHaveLength(2);
    expect(events.filter((e) => e.type === 'wait')).toHaveLength(2);
  });
});

// ============================================================================
// Metrics & Events
// ============================================================================

describe('RateLimitManager — metrics & events', () => {
  let mgr;
  beforeEach(() => { mgr = new RateLimitManager(); });

  it('getMetrics deve calcular averageWaitTime e successRate', () => {
    mgr.metrics.totalRequests = 10;
    mgr.metrics.rateLimitHits = 2;
    mgr.metrics.totalRetries = 3;
    mgr.metrics.totalWaitTime = 9000;

    const m = mgr.getMetrics();
    expect(m.averageWaitTime).toBe(3000);
    expect(m.successRate).toBe(80);
  });

  it('getMetrics deve retornar 100% successRate sem requests', () => {
    const m = mgr.getMetrics();
    expect(m.successRate).toBe(100);
    expect(m.averageWaitTime).toBe(0);
  });

  it('logEvent deve respeitar maxEventLog', () => {
    for (let i = 0; i < 120; i++) {
      mgr.logEvent('test', { i });
    }
    expect(mgr.eventLog.length).toBe(100);
    expect(mgr.eventLog[0].i).toBe(20); // Primeiros 20 descartados
  });

  it('getRecentEvents deve retornar últimos N eventos', () => {
    for (let i = 0; i < 10; i++) {
      mgr.logEvent('test', { i });
    }
    const recent = mgr.getRecentEvents(3);
    expect(recent).toHaveLength(3);
    expect(recent[0].i).toBe(7);
  });

  it('resetMetrics deve zerar tudo', () => {
    mgr.metrics.totalRequests = 10;
    mgr.logEvent('test', {});

    mgr.resetMetrics();
    expect(mgr.metrics.totalRequests).toBe(0);
    expect(mgr.eventLog).toHaveLength(0);
  });

  it('formatStatus deve retornar string formatada', () => {
    mgr.metrics.totalRequests = 5;
    mgr.metrics.rateLimitHits = 1;
    const status = mgr.formatStatus();

    expect(status).toContain('Rate Limit Manager Status');
    expect(status).toContain('Total Requests: 5');
    expect(status).toContain('Rate Limit Hits: 1');
  });
});

// ============================================================================
// withRateLimit wrapper
// ============================================================================

describe('withRateLimit', () => {
  it('deve wrappear função com retry automático', async () => {
    const mgr = new RateLimitManager({ maxRetries: 2, baseDelay: 1 });
    mgr.sleep = jest.fn().mockResolvedValue(undefined);

    const original = jest.fn().mockResolvedValue('result');
    const wrapped = withRateLimit(original, mgr, { label: 'test' });

    const result = await wrapped('arg1', 'arg2');
    expect(result).toBe('result');
    expect(original).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

// ============================================================================
// getGlobalManager singleton
// ============================================================================

describe('getGlobalManager', () => {
  it('deve retornar instância singleton', () => {
    const mgr1 = getGlobalManager({ maxRetries: 10 });
    const mgr2 = getGlobalManager({ maxRetries: 99 });
    expect(mgr1).toBe(mgr2); // Mesmo objeto
  });
});
