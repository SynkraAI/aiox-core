'use strict';

const {
  resolveExecutionProfile,
} = require('../../.aios-core/core/orchestration/execution-profile-resolver');

describe('execution-profile-resolver', () => {
  it('enforces safe profile for production context', () => {
    const result = resolveExecutionProfile({
      context: 'production',
      yolo: true,
    });

    expect(result.profile).toBe('safe');
    expect(result.source).toBe('context');
    expect(result.policy.require_confirmation).toBe(true);
  });

  it('enforces balanced profile for migration context', () => {
    const result = resolveExecutionProfile({
      context: 'migration',
      yolo: true,
    });

    expect(result.profile).toBe('balanced');
    expect(result.source).toBe('context');
    expect(result.policy.max_parallel_changes).toBe(3);
  });

  it('uses explicit profile when provided', () => {
    const result = resolveExecutionProfile({
      explicitProfile: 'aggressive',
      context: 'production',
      yolo: false,
    });

    expect(result.profile).toBe('aggressive');
    expect(result.source).toBe('explicit');
  });

  it('defaults to aggressive in yolo development context', () => {
    const result = resolveExecutionProfile({
      context: 'development',
      yolo: true,
    });

    expect(result.profile).toBe('aggressive');
    expect(result.source).toBe('yolo');
  });

  it('defaults to balanced when nothing is specified', () => {
    const result = resolveExecutionProfile({});

    expect(result.profile).toBe('balanced');
    expect(result.source).toBe('default');
  });
});
