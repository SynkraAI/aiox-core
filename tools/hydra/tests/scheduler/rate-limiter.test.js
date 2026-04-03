import { describe, test, expect } from '@jest/globals';
import { RateLimiter } from '../../src/scheduler/rate-limiter.js';

describe('RateLimiter', () => {
  test('allows requests without config', () => {
    const limiter = new RateLimiter({});
    expect(limiter.tryAcquire('rss')).toBe(true);
    expect(limiter.getWaitTime('rss')).toBe(0);
  });

  test('configures token bucket from requestsPerMinute', () => {
    const limiter = new RateLimiter({
      github: { requestsPerMinute: 30, burstSize: 5 },
    });

    // Should have tokens available initially
    expect(limiter.tryAcquire('github')).toBe(true);
  });

  test('exhausts tokens with rapid requests', () => {
    const limiter = new RateLimiter({
      test: { requestsPerMinute: 2, burstSize: 1 },
    });

    // Get initial tokens
    const bucket = limiter.buckets.get('test');
    const initialTokens = bucket.maxTokens;

    // Drain all tokens
    let consumed = 0;
    while (limiter.tryAcquire('test')) {
      consumed++;
      if (consumed > 100) break; // Safety
    }

    expect(consumed).toBeGreaterThan(0);
    expect(limiter.tryAcquire('test')).toBe(false);
  });

  test('getWaitTime returns 0 when tokens available', () => {
    const limiter = new RateLimiter({
      github: { requestsPerMinute: 60, burstSize: 5 },
    });

    expect(limiter.getWaitTime('github')).toBe(0);
  });

  test('getWaitTime returns positive when no tokens', () => {
    const limiter = new RateLimiter({
      test: { requestsPerMinute: 1, burstSize: 0 },
    });

    // Drain tokens
    while (limiter.tryAcquire('test')) { /* drain */ }

    const waitTime = limiter.getWaitTime('test');
    expect(waitTime).toBeGreaterThan(0);
  });

  test('getTokens returns Infinity for unconfigured types', () => {
    const limiter = new RateLimiter({});
    expect(limiter.getTokens('podcast')).toBe(Infinity);
  });

  test('requestsPerHour configuration', () => {
    const limiter = new RateLimiter({
      youtube: { requestsPerHour: 100, burstSize: 10 },
    });

    expect(limiter.tryAcquire('youtube')).toBe(true);
    expect(limiter.buckets.has('youtube')).toBe(true);
  });

  test('requestsPer15Min configuration', () => {
    const limiter = new RateLimiter({
      twitter: { requestsPer15Min: 15, burstSize: 3 },
    });

    expect(limiter.tryAcquire('twitter')).toBe(true);
    expect(limiter.buckets.has('twitter')).toBe(true);
  });
});
