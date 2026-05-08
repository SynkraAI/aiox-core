'use strict';

const {
  DEFAULT_FAST_PATH_CONFIG,
  evaluateFastPath,
  getAutomationPatterns,
  getStructuredFileExtensions,
  normalizeConfig,
} = require('@aiox-core/core/orchestration/fast-path-gate');
const orchestration = require('@aiox-core/core/orchestration');

describe('fast path gate', () => {
  it('exports through the orchestration module', () => {
    expect(orchestration.FastPathGate.evaluateFastPath).toBe(evaluateFastPath);
    expect(orchestration.evaluateFastPath).toBe(evaluateFastPath);
  });

  it('recommends a parallel batch for mechanical YAML population', () => {
    const result = evaluateFastPath({
      description: 'Populate YAML variables from markdown context across multiple files in one shot',
      files: [
        'pro/a.yaml',
        'pro/b.yaml',
        'pro/c.yaml',
        'pro/d.yaml',
      ],
      acceptanceCriteria: ['All YAML fields are completed', 'YAML syntax validates'],
      itemCount: 12,
    });

    expect(result.passed).toBe(true);
    expect(result.mode).toBe('parallel_batch');
    expect(result.parallelizable).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(DEFAULT_FAST_PATH_CONFIG.minConfidence);
    expect(result.reasons).toContain('automation signal: structured-transform');
    expect(result.reasons).toContain('batch size meets threshold: 12');
    expect(result.actions.join(' ')).toMatch(/Map target files/i);
  });

  it('falls back to standard mode when risk signals are present', () => {
    const result = evaluateFastPath({
      description: 'Bulk update production auth permissions and token handling',
      files: ['auth.yaml', 'permissions.yaml', 'secrets.yaml'],
      itemCount: 6,
    });

    expect(result.passed).toBe(false);
    expect(result.mode).toBe('standard');
    expect(result.parallelizable).toBe(false);
    expect(result.riskLevel).toBe('high');
    expect(result.reasons).toContain('risk signal: security');
    expect(result.reasons).toContain('risk signal: production');
  });

  it('can recommend an external executor when enabled and confidence is high', () => {
    const result = evaluateFastPath({
      description: [
        'Batch replace and normalize variables in many YAML and JSON files',
        'Use a script to map fields per file and apply independent changes in parallel',
      ].join('. '),
      files: [
        'data/a.yaml',
        'data/b.yaml',
        'data/c.json',
        'data/d.json',
        'data/e.md',
        'data/f.yml',
      ],
      itemCount: 20,
      externalExecutorsEnabled: true,
    });

    expect(result.passed).toBe(true);
    expect(result.mode).toBe('external_executor');
    expect(result.confidence).toBeGreaterThanOrEqual(DEFAULT_FAST_PATH_CONFIG.externalExecutorThreshold);
    expect(result.actions.join(' ')).toMatch(/delegate/i);
  });

  it('keeps the standard workflow when disabled by configuration', () => {
    const result = evaluateFastPath({
      description: 'Replace variables in multiple YAML files',
      files: ['a.yaml', 'b.yaml', 'c.yaml'],
      config: { enabled: false },
    });

    expect(result.enabled).toBe(false);
    expect(result.passed).toBe(false);
    expect(result.mode).toBe('standard');
    expect(result.reasons).toEqual(['fast path gate disabled by configuration']);
  });

  it('normalizes snake_case config from YAML defaults', () => {
    const config = normalizeConfig({
      min_confidence: 0.6,
      min_batch_items: 4,
      external_executor_threshold: 0.85,
    });

    expect(config.minConfidence).toBe(0.6);
    expect(config.minBatchItems).toBe(4);
    expect(config.externalExecutorThreshold).toBe(0.85);
  });

  it('clamps unsafe config overrides and normalizes explicit booleans', () => {
    const config = normalizeConfig({
      enabled: 'false',
      minConfidence: 2,
      minBatchItems: 0,
      externalExecutorThreshold: -1,
      externalExecutorsEnabled: 'true',
    });

    expect(config.enabled).toBe(false);
    expect(config.minConfidence).toBe(1);
    expect(config.minBatchItems).toBe(1);
    expect(config.externalExecutorThreshold).toBe(0);
    expect(config.externalExecutorsEnabled).toBe(true);

    expect(normalizeConfig({ enabled: 'not-a-boolean' }).enabled).toBe(DEFAULT_FAST_PATH_CONFIG.enabled);
    expect(normalizeConfig({ externalExecutorsEnabled: 'not-a-boolean' }).externalExecutorsEnabled)
      .toBe(DEFAULT_FAST_PATH_CONFIG.externalExecutorsEnabled);
  });

  it('does not treat truthy boolean-like strings as external executor enablement', () => {
    const baseInput = {
      description: [
        'Batch replace and normalize variables in many YAML and JSON files',
        'Use a script to map fields per file and apply independent changes in parallel',
      ].join('. '),
      files: [
        'data/a.yaml',
        'data/b.yaml',
        'data/c.json',
        'data/d.json',
        'data/e.md',
        'data/f.yml',
      ],
      itemCount: 20,
    };

    expect(evaluateFastPath({ ...baseInput, externalExecutorsEnabled: 'false' }).mode).toBe('parallel_batch');
    expect(evaluateFastPath({ ...baseInput, externalExecutorsEnabled: 'yes' }).mode).toBe('parallel_batch');
  });

  it('preserves itemCount zero', () => {
    const result = evaluateFastPath({
      description: 'Replace variables in multiple YAML files',
      files: ['a.yaml', 'b.yaml', 'c.yaml'],
      itemCount: 0,
    });

    expect(result.evidence.batchSize).toBe(0);
  });

  it('exports defensive copies of fast path signal metadata', () => {
    const extensions = getStructuredFileExtensions();
    extensions.add('.mutated');

    expect(getStructuredFileExtensions().has('.mutated')).toBe(false);

    const patterns = getAutomationPatterns();
    patterns[0].id = 'mutated';
    patterns[0].pattern = /mutated/;
    patterns.push({ id: 'new-pattern', weight: 99, pattern: /new-pattern/ });

    const nextPatterns = getAutomationPatterns();
    expect(nextPatterns[0].id).toBe('bulk-edit');
    expect(nextPatterns[0].pattern.test('batch')).toBe(true);
    expect(nextPatterns).toHaveLength(6);
  });
});
