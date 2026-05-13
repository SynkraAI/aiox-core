const {
  AIOXError,
  ErrorCategory,
  ErrorSeverity,
  sanitizeValue,
  serializeError,
} = require('../../../.aiox-core/core/errors');

describe('error serializer', () => {
  const originalDebugStacks = process.env.DEBUG_ERROR_STACKS;
  const originalStacks = process.env.DEBUG_STACKS;

  afterEach(() => {
    if (originalDebugStacks === undefined) {
      delete process.env.DEBUG_ERROR_STACKS;
    } else {
      process.env.DEBUG_ERROR_STACKS = originalDebugStacks;
    }

    if (originalStacks === undefined) {
      delete process.env.DEBUG_STACKS;
    } else {
      process.env.DEBUG_STACKS = originalStacks;
    }
  });

  test('serializes AIOXError with redacted stack by default', () => {
    const error = new AIOXError('Layer failed', {
      code: 'AIOX_SYNAPSE_LAYER_FAILED',
      metadata: {
        layer: {
          name: 'agent',
        },
      },
    });

    const serialized = serializeError(error);

    expect(serialized).toMatchObject({
      name: 'AIOXError',
      message: 'Layer failed',
      code: 'AIOX_SYNAPSE_LAYER_FAILED',
      category: ErrorCategory.SYNAPSE,
      severity: ErrorSeverity.WARNING,
      retryable: true,
      stack: '[redacted]',
      metadata: {
        layer: {
          name: 'agent',
        },
      },
    });
  });

  test('can expose stacks only when explicitly enabled', () => {
    const error = new Error('debug me');

    expect(serializeError(error).stack).toBe('[redacted]');
    expect(serializeError(error, { includeStack: true }).stack).toContain('Error: debug me');

    process.env.DEBUG_ERROR_STACKS = 'true';
    expect(serializeError(error).stack).toContain('Error: debug me');
  });

  test('preserves generic error own properties and cause', () => {
    const cause = new Error('root');
    const error = new Error('outer', { cause });
    error.code = 'AIOX_EXECUTION_FAILED';
    error.detail = {
      attempt: 2,
    };

    const serialized = serializeError(error);

    expect(serialized).toMatchObject({
      name: 'Error',
      message: 'outer',
      code: 'AIOX_EXECUTION_FAILED',
      stack: '[redacted]',
      detail: {
        attempt: 2,
      },
      cause: {
        name: 'Error',
        message: 'root',
        stack: '[redacted]',
      },
    });
  });

  test('sanitizes circular and non-JSON metadata values', () => {
    const metadata = {
      now: new Date('2026-05-08T12:00:00.000Z'),
      expression: /aiox/gi,
      count: BigInt(3),
      fn: function namedFunction() {},
      symbol: Symbol('token'),
      map: new Map([['key', BigInt(1)]]),
      set: new Set(['a', BigInt(2)]),
    };
    metadata.self = metadata;

    const error = new AIOXError('json safe', {
      code: 'AIOX_EXECUTION_FAILED',
      metadata,
    });

    const serialized = serializeError(error);

    expect(serialized.metadata).toMatchObject({
      now: '2026-05-08T12:00:00.000Z',
      expression: '/aiox/gi',
      count: '3',
      fn: expect.stringContaining('function namedFunction'),
      symbol: 'Symbol(token)',
      map: [['key', '1']],
      set: ['a', '2'],
      self: '[Circular]',
    });
    expect(() => JSON.stringify(serialized)).not.toThrow();
  });

  test('sanitizeValue handles thrown getters without failing serialization', () => {
    const value = {};
    Object.defineProperty(value, 'broken', {
      enumerable: true,
      get() {
        throw new Error('getter exploded');
      },
    });

    expect(sanitizeValue(value)).toEqual({
      broken: '[Unserializable: getter exploded]',
    });
  });
});
