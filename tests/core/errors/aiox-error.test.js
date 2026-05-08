const {
  AIOXError,
  DEFAULT_ERROR_CODE,
  ErrorCategory,
  ErrorSeverity,
  isAIOXError,
  normalizeError,
} = require('../../../.aiox-core/core/errors');

describe('AIOXError', () => {
  test('preserves Error compatibility and registry defaults', () => {
    const cause = new Error('root cause');
    const error = new AIOXError('Could not load registry', {
      code: 'AIOX_REGISTRY_LOAD_FAILED',
      metadata: {
        registry: {
          path: '.aiox-core/data/entity-registry.yaml',
        },
      },
      cause,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AIOXError');
    expect(error.message).toBe('Could not load registry');
    expect(error.code).toBe('AIOX_REGISTRY_LOAD_FAILED');
    expect(error.category).toBe(ErrorCategory.REGISTRY);
    expect(error.severity).toBe(ErrorSeverity.ERROR);
    expect(error.retryable).toBe(false);
    expect(error.cause).toBe(cause);
    expect(error.metadata).toEqual({
      registry: {
        path: '.aiox-core/data/entity-registry.yaml',
      },
    });
    expect(isAIOXError(error)).toBe(true);
  });

  test('supports overrides and deep metadata merge', () => {
    const error = new AIOXError('Filesystem degraded', {
      code: 'AIOX_PERSISTENCE_DEGRADED',
      severity: ErrorSeverity.INFO,
      retryable: false,
      exitCode: 0,
      metadata: {
        persistence: {
          path: 'plan/build-state.json',
          mode: 'memory',
        },
      },
    });

    const normalized = normalizeError(error, {
      metadata: {
        persistence: {
          operation: 'saveState',
        },
      },
    });

    expect(normalized).not.toBe(error);
    expect(normalized.code).toBe('AIOX_PERSISTENCE_DEGRADED');
    expect(normalized.severity).toBe(ErrorSeverity.INFO);
    expect(normalized.retryable).toBe(false);
    expect(normalized.exitCode).toBe(0);
    expect(normalized.metadata).toEqual({
      persistence: {
        path: 'plan/build-state.json',
        mode: 'memory',
        operation: 'saveState',
      },
    });
  });

  test('normalizes generic errors while preserving cause and own properties', () => {
    const generic = new Error('generic failure');
    generic.code = 'AIOX_EXECUTION_FAILED';
    generic.detail = {
      phase: 'run',
    };

    const normalized = normalizeError(generic, {
      metadata: {
        execution: {
          storyId: 'AIOX-ERROR.1',
        },
      },
    });

    expect(normalized).toBeInstanceOf(AIOXError);
    expect(normalized.code).toBe('AIOX_EXECUTION_FAILED');
    expect(normalized.cause).toBe(generic);
    expect(normalized.metadata).toEqual({
      originalError: {
        name: 'Error',
        properties: {
          code: 'AIOX_EXECUTION_FAILED',
          detail: {
            phase: 'run',
          },
        },
      },
      execution: {
        storyId: 'AIOX-ERROR.1',
      },
    });
  });

  test('normalizes non-error thrown values', () => {
    const normalized = normalizeError('boom');

    expect(normalized).toBeInstanceOf(AIOXError);
    expect(normalized.code).toBe(DEFAULT_ERROR_CODE);
    expect(normalized.message).toBe('boom');
    expect(normalized.metadata).toEqual({
      originalValue: {
        type: 'string',
      },
    });
  });
});
