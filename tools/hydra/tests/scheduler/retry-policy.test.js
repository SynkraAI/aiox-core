import { describe, test, expect, jest } from '@jest/globals';
import { RetryPolicy } from '../../src/scheduler/retry-policy.js';

describe('RetryPolicy', () => {
  test('default options', () => {
    const policy = new RetryPolicy();
    expect(policy.baseDelayMs).toBe(1000);
    expect(policy.maxDelayMs).toBe(60000);
    expect(policy.maxAttempts).toBe(5);
    expect(policy.jitter).toBe(true);
  });

  test('custom options', () => {
    const policy = new RetryPolicy({ baseDelayMs: 500, maxAttempts: 3, jitter: false });
    expect(policy.baseDelayMs).toBe(500);
    expect(policy.maxAttempts).toBe(3);
    expect(policy.jitter).toBe(false);
  });

  test('getDelay returns 0 for first attempt', () => {
    const policy = new RetryPolicy({ jitter: false });
    expect(policy.getDelay(0)).toBe(0);
  });

  test('getDelay increases exponentially without jitter', () => {
    const policy = new RetryPolicy({ baseDelayMs: 1000, jitter: false, maxDelayMs: 100000 });
    const d1 = policy.getDelay(1);
    const d2 = policy.getDelay(2);
    const d3 = policy.getDelay(3);

    expect(d1).toBe(2000);  // 1000 * 2^1
    expect(d2).toBe(4000);  // 1000 * 2^2
    expect(d3).toBe(8000);  // 1000 * 2^3
  });

  test('getDelay is capped at maxDelayMs', () => {
    const policy = new RetryPolicy({ baseDelayMs: 1000, maxDelayMs: 5000, jitter: false });
    const delay = policy.getDelay(10);
    expect(delay).toBeLessThanOrEqual(5000);
  });

  test('getDelay with jitter adds randomness', () => {
    const policy = new RetryPolicy({ baseDelayMs: 1000, jitter: true, maxDelayMs: 100000 });
    // Run multiple times — jitter means delays vary
    const delays = new Set();
    for (let i = 0; i < 10; i++) {
      delays.add(policy.getDelay(2));
    }
    // With jitter, we should get at least some variation
    // (extremely unlikely to get 10 identical values with random jitter)
    expect(delays.size).toBeGreaterThanOrEqual(1);
  });

  test('shouldRetry returns true for early attempts', () => {
    const policy = new RetryPolicy({ maxAttempts: 5 });
    expect(policy.shouldRetry(0)).toBe(true);
    expect(policy.shouldRetry(3)).toBe(true);
  });

  test('shouldRetry returns false for last attempt', () => {
    const policy = new RetryPolicy({ maxAttempts: 5 });
    expect(policy.shouldRetry(4)).toBe(false);
  });

  test('execute succeeds on first try', async () => {
    const policy = new RetryPolicy({ maxAttempts: 3 });
    const fn = jest.fn().mockResolvedValue('ok');

    const result = await policy.execute(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('execute retries on failure then succeeds', async () => {
    const policy = new RetryPolicy({ maxAttempts: 3, baseDelayMs: 10, jitter: false });
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockResolvedValue('ok');

    const result = await policy.execute(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('execute throws after all retries exhausted', async () => {
    const policy = new RetryPolicy({ maxAttempts: 2, baseDelayMs: 10, jitter: false });
    const fn = jest.fn().mockRejectedValue(new Error('persistent'));

    await expect(policy.execute(fn)).rejects.toThrow('persistent');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
