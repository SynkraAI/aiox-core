/**
 * Rate Limit Manager - Test Suite
 * Story EXC-1, AC7 - rate-limit-manager.js coverage
 *
 * Tests: constructor, executeWithRetry, calculateDelay, preemptiveThrottle,
 * isRateLimitError, metrics, withRateLimit, getGlobalManager
 */

const {
  collectEvents,
} = require('./execution-test-helpers');

const {
  RateLimitManager,
  withRateLimit,
  getGlobalManager,
} = require('../../.aios-core/core/execution/rate-limit-manager');

describe('RateLimitManager', () => {
  // ── Constructor ─────────────────────────────────────────────────────

  describe('Constructor', () => {
    test('creates with defaults', () => {
      const rlm = new RateLimitManager();
      expect(rlm.maxRetries).toBe(5);
      expect(rlm.baseDelay).toBe(1000);
      expect(rlm.maxDelay).toBe(30000);
      expect(rlm.requestsPerMinute).toBe(50);
    });

    test('accepts custom config', () => {
      const rlm = new RateLimitManager({ maxRetries: 3, baseDelay: 500, maxDelay: 5000, requestsPerMinute: 10 });
      expect(rlm.maxRetries).toBe(3);
      expect(rlm.baseDelay).toBe(500);
      expect(rlm.maxDelay).toBe(5000);
      expect(rlm.requestsPerMinute).toBe(10);
    });

    test('extends EventEmitter', () => {
      const rlm = new RateLimitManager();
      expect(typeof rlm.on).toBe('function');
    });

    test('initializes metrics to zero', () => {
      const rlm = new RateLimitManager();
      expect(rlm.metrics.rateLimitHits).toBe(0);
      expect(rlm.metrics.totalRetries).toBe(0);
      expect(rlm.metrics.totalRequests).toBe(0);
    });
  });

  // ── isRateLimitError ──────────────────────────────────────────────────

  describe('isRateLimitError', () => {
    test('detects HTTP 429', () => {
      const rlm = new RateLimitManager();
      expect(rlm.isRateLimitError({ status: 429, message: '' })).toBe(true);
      expect(rlm.isRateLimitError({ statusCode: 429, message: '' })).toBe(true);
    });

    test('detects rate limit messages', () => {
      const rlm = new RateLimitManager();
      expect(rlm.isRateLimitError({ message: 'Rate limit exceeded' })).toBe(true);
      expect(rlm.isRateLimitError({ message: 'Too many requests' })).toBe(true);
      expect(rlm.isRateLimitError({ message: 'Request throttled' })).toBe(true);
      expect(rlm.isRateLimitError({ message: 'Quota exceeded' })).toBe(true);
      expect(rlm.isRateLimitError({ message: 'API overloaded' })).toBe(true);
    });

    test('detects rate limit error codes', () => {
      const rlm = new RateLimitManager();
      expect(rlm.isRateLimitError({ code: 'RATE_LIMITED', message: '' })).toBe(true);
      expect(rlm.isRateLimitError({ code: 'TOO_MANY_REQUESTS', message: '' })).toBe(true);
    });

    test('returns false for non-rate-limit errors', () => {
      const rlm = new RateLimitManager();
      expect(rlm.isRateLimitError({ message: 'Connection timeout' })).toBe(false);
      expect(rlm.isRateLimitError({ status: 500, message: 'Server error' })).toBe(false);
    });
  });

  // ── calculateDelay ────────────────────────────────────────────────────

  describe('calculateDelay', () => {
    test('uses retryAfter from error', () => {
      const rlm = new RateLimitManager({ maxDelay: 60000 });
      const error = { retryAfter: 5, message: '' };
      expect(rlm.calculateDelay(1, error)).toBe(5000);
    });

    test('caps retryAfter to maxDelay', () => {
      const rlm = new RateLimitManager({ maxDelay: 3000 });
      const error = { retryAfter: 10, message: '' };
      expect(rlm.calculateDelay(1, error)).toBe(3000);
    });

    test('extracts retry-after from error message', () => {
      const rlm = new RateLimitManager({ maxDelay: 60000 });
      const error = { message: 'Please retry after 3 seconds' };
      expect(rlm.calculateDelay(1, error)).toBe(3000);
    });

    test('uses exponential backoff', () => {
      const rlm = new RateLimitManager({ baseDelay: 1000, maxDelay: 60000 });
      const error = { message: '' };
      const delay1 = rlm.calculateDelay(1, error);
      const delay2 = rlm.calculateDelay(2, error);
      // delay1 should be ~1000+jitter, delay2 ~2000+jitter
      expect(delay1).toBeLessThanOrEqual(2000); // 1000 base + up to 1000 jitter
      expect(delay2).toBeLessThanOrEqual(3000); // 2000 base + up to 1000 jitter
    });

    test('caps at maxDelay', () => {
      const rlm = new RateLimitManager({ baseDelay: 1000, maxDelay: 5000 });
      const error = { message: '' };
      const delay = rlm.calculateDelay(10, error); // 2^9 * 1000 = 512000
      expect(delay).toBeLessThanOrEqual(5000);
    });
  });

  // ── executeWithRetry ──────────────────────────────────────────────────

  describe('executeWithRetry', () => {
    test('returns result on success', async () => {
      const rlm = new RateLimitManager();
      const result = await rlm.executeWithRetry(() => Promise.resolve('ok'));
      expect(result).toBe('ok');
      expect(rlm.metrics.totalRequests).toBe(1);
    });

    test('throws non-rate-limit errors immediately', async () => {
      const rlm = new RateLimitManager();
      await expect(
        rlm.executeWithRetry(() => { throw new Error('connection failed'); }),
      ).rejects.toThrow('connection failed');
    });

    test('retries on rate limit error', async () => {
      const rlm = new RateLimitManager({ maxRetries: 2, baseDelay: 1 });
      // Override sleep to be instant
      rlm.sleep = () => Promise.resolve();

      let calls = 0;
      const fn = () => {
        calls++;
        if (calls === 1) {
          const err = new Error('Rate limit exceeded');
          throw err;
        }
        return Promise.resolve('success');
      };

      const result = await rlm.executeWithRetry(fn);
      expect(result).toBe('success');
      expect(calls).toBe(2);
      expect(rlm.metrics.rateLimitHits).toBe(1);
      expect(rlm.metrics.successAfterRetry).toBe(1);
    });

    test('throws after maxRetries exceeded', async () => {
      const rlm = new RateLimitManager({ maxRetries: 2, baseDelay: 1 });
      rlm.sleep = () => Promise.resolve();

      const fn = () => { throw new Error('Rate limit exceeded'); };

      await expect(rlm.executeWithRetry(fn)).rejects.toThrow('Rate limit exceeded after 2 retries');
      expect(rlm.metrics.rateLimitHits).toBe(2);
    });

    test('emits rate_limit_hit and waiting events', async () => {
      const rlm = new RateLimitManager({ maxRetries: 2, baseDelay: 1 });
      rlm.sleep = () => Promise.resolve();

      let calls = 0;
      const fn = () => {
        calls++;
        if (calls === 1) throw new Error('Rate limit exceeded');
        return Promise.resolve('ok');
      };

      const events = collectEvents(rlm, ['rate_limit_hit', 'waiting']);
      await rlm.executeWithRetry(fn);

      expect(events.count('rate_limit_hit')).toBe(1);
      expect(events.count('waiting')).toBe(1);
    });
  });

  // ── Metrics ───────────────────────────────────────────────────────────

  describe('Metrics', () => {
    test('getMetrics returns computed fields', () => {
      const rlm = new RateLimitManager();
      rlm.metrics.totalRequests = 10;
      rlm.metrics.rateLimitHits = 2;
      rlm.metrics.totalRetries = 3;
      rlm.metrics.totalWaitTime = 9000;
      const metrics = rlm.getMetrics();
      expect(metrics.averageWaitTime).toBe(3000);
      expect(metrics.successRate).toBe(80);
      expect(metrics.requestsPerMinuteLimit).toBe(50);
    });

    test('getMetrics handles zero retries', () => {
      const rlm = new RateLimitManager();
      const metrics = rlm.getMetrics();
      expect(metrics.averageWaitTime).toBe(0);
      expect(metrics.successRate).toBe(100);
    });

    test('resetMetrics clears everything', () => {
      const rlm = new RateLimitManager();
      rlm.metrics.totalRequests = 10;
      rlm.logEvent('test', {});
      rlm.resetMetrics();
      expect(rlm.metrics.totalRequests).toBe(0);
      expect(rlm.eventLog.length).toBe(0);
    });
  });

  // ── Event logging ─────────────────────────────────────────────────────

  describe('Event logging', () => {
    test('logEvent stores events', () => {
      const rlm = new RateLimitManager();
      rlm.logEvent('test_event', { key: 'value' });
      expect(rlm.eventLog.length).toBe(1);
      expect(rlm.eventLog[0].type).toBe('test_event');
    });

    test('logEvent trims to maxEventLog', () => {
      const rlm = new RateLimitManager();
      rlm.maxEventLog = 3;
      for (let i = 0; i < 5; i++) {
        rlm.logEvent(`event-${i}`, {});
      }
      expect(rlm.eventLog.length).toBe(3);
    });

    test('getRecentEvents returns limited entries', () => {
      const rlm = new RateLimitManager();
      for (let i = 0; i < 10; i++) {
        rlm.logEvent(`event-${i}`, {});
      }
      expect(rlm.getRecentEvents(3).length).toBe(3);
    });
  });

  // ── formatStatus ──────────────────────────────────────────────────────

  describe('formatStatus', () => {
    test('returns formatted status', () => {
      const rlm = new RateLimitManager();
      const status = rlm.formatStatus();
      expect(status).toContain('Rate Limit Manager');
      expect(status).toContain('Total Requests');
    });
  });

  // ── withRateLimit ─────────────────────────────────────────────────────

  describe('withRateLimit', () => {
    test('wraps function with rate limiting', async () => {
      const rlm = new RateLimitManager();
      const fn = (x) => Promise.resolve(x * 2);
      const wrapped = withRateLimit(fn, rlm);
      const result = await wrapped(5);
      expect(result).toBe(10);
    });
  });

  // ── getGlobalManager ──────────────────────────────────────────────────

  describe('getGlobalManager', () => {
    test('returns singleton instance', () => {
      const m1 = getGlobalManager();
      const m2 = getGlobalManager();
      expect(m1).toBe(m2);
      expect(m1).toBeInstanceOf(RateLimitManager);
    });
  });
});
