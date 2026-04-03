import { retryWithBackoff, isRetryableError } from '../../src/utils/retry.js';

// ========== isRetryableError ==========

describe('isRetryableError', () => {
  test('retries on 429 status', () => {
    expect(isRetryableError({ status: 429 })).toBe(true);
  });

  test('retries on 503 status', () => {
    expect(isRetryableError({ status: 503 })).toBe(true);
  });

  test('retries on 502 status', () => {
    expect(isRetryableError({ status: 502 })).toBe(true);
  });

  test('retries on ECONNRESET', () => {
    expect(isRetryableError({ code: 'ECONNRESET' })).toBe(true);
  });

  test('retries on ETIMEDOUT', () => {
    expect(isRetryableError({ code: 'ETIMEDOUT' })).toBe(true);
  });

  test('retries on rate limit message', () => {
    expect(isRetryableError({ message: 'Rate limit exceeded' })).toBe(true);
  });

  test('does NOT retry on 400', () => {
    expect(isRetryableError({ status: 400 })).toBe(false);
  });

  test('does NOT retry on 404', () => {
    expect(isRetryableError({ status: 404, message: 'Not found' })).toBe(false);
  });

  test('does NOT retry on generic error', () => {
    expect(isRetryableError(new Error('Something broke'))).toBe(false);
  });
});

// ========== retryWithBackoff ==========

describe('retryWithBackoff', () => {
  test('succeeds on first attempt', async () => {
    let calls = 0;
    const result = await retryWithBackoff(async () => {
      calls++;
      return 'success';
    });
    expect(result).toBe('success');
    expect(calls).toBe(1);
  });

  test('retries on retryable error and eventually succeeds', async () => {
    let calls = 0;
    const result = await retryWithBackoff(
      async () => {
        calls++;
        if (calls < 3) throw Object.assign(new Error('rate limited'), { status: 429 });
        return 'recovered';
      },
      { maxRetries: 3, baseDelayMs: 10, maxDelayMs: 50 }
    );
    expect(result).toBe('recovered');
    expect(calls).toBe(3);
  });

  test('throws after exhausting retries', async () => {
    await expect(
      retryWithBackoff(
        async () => { throw Object.assign(new Error('always fails'), { status: 503 }); },
        { maxRetries: 2, baseDelayMs: 10 }
      )
    ).rejects.toThrow('always fails');
  });

  test('does NOT retry non-retryable errors', async () => {
    let calls = 0;
    await expect(
      retryWithBackoff(
        async () => {
          calls++;
          throw Object.assign(new Error('bad request'), { status: 400 });
        },
        { maxRetries: 3, baseDelayMs: 10 }
      )
    ).rejects.toThrow('bad request');
    expect(calls).toBe(1);
  });

  test('calls onRetry callback', async () => {
    const retries = [];
    let calls = 0;

    await retryWithBackoff(
      async () => {
        calls++;
        if (calls < 2) throw Object.assign(new Error('retry me'), { status: 429 });
        return 'ok';
      },
      {
        maxRetries: 3,
        baseDelayMs: 10,
        onRetry: (err, attempt, delay) => retries.push({ attempt, delay }),
      }
    );

    expect(retries).toHaveLength(1);
    expect(retries[0].attempt).toBe(1);
  });

  test('respects custom shouldRetry predicate', async () => {
    let calls = 0;

    await expect(
      retryWithBackoff(
        async () => {
          calls++;
          throw new Error('custom error');
        },
        {
          maxRetries: 3,
          baseDelayMs: 10,
          shouldRetry: (err) => err.message === 'retry this',
        }
      )
    ).rejects.toThrow('custom error');

    expect(calls).toBe(1); // No retry because predicate returned false
  });
});
