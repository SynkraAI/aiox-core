import { validateEnv } from '../../src/security/env-validator.js';

describe('validateEnv', () => {
  test('passes with valid DEEPSEEK_API_KEY', () => {
    const result = validateEnv({
      env: { DEEPSEEK_API_KEY: 'sk-1234567890abcdef1234567890abcdef' },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('passes with valid ANTHROPIC_API_KEY', () => {
    const result = validateEnv({
      env: { ANTHROPIC_API_KEY: 'sk-ant-abc123def456ghi789jkl012mno345pqr678' },
    });
    expect(result.valid).toBe(true);
  });

  test('passes with valid OPENAI_API_KEY', () => {
    const result = validateEnv({
      env: { OPENAI_API_KEY: 'sk-proj-1234567890abcdef1234567890' },
    });
    expect(result.valid).toBe(true);
  });

  test('fails when no LLM API key is present', () => {
    const result = validateEnv({ env: {} });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('No LLM API key');
  });

  test('warns on short DEEPSEEK key', () => {
    const result = validateEnv({
      env: { DEEPSEEK_API_KEY: 'short' },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('too short'))).toBe(true);
  });

  test('warns on ANTHROPIC key without sk-ant- prefix', () => {
    const result = validateEnv({
      env: { ANTHROPIC_API_KEY: 'wrong-prefix-but-long-enough-1234567890' },
    });
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.includes('sk-ant-'))).toBe(true);
  });

  test('warns on GITHUB_TOKEN without valid prefix', () => {
    const result = validateEnv({
      env: {
        DEEPSEEK_API_KEY: 'sk-1234567890abcdef1234567890abcdef',
        GITHUB_TOKEN: 'invalid-token-format-12345',
      },
    });
    expect(result.warnings.some(w => w.includes('GITHUB_TOKEN'))).toBe(true);
  });

  test('accepts valid GITHUB_TOKEN format', () => {
    const result = validateEnv({
      env: {
        DEEPSEEK_API_KEY: 'sk-1234567890abcdef1234567890abcdef',
        GITHUB_TOKEN: 'ghp_1234567890abcdef1234567890abcdef12',
      },
    });
    expect(result.warnings.filter(w => w.includes('GITHUB_TOKEN'))).toHaveLength(0);
  });

  test('warns on invalid TELEGRAM_BOT_TOKEN format', () => {
    const result = validateEnv({
      env: {
        DEEPSEEK_API_KEY: 'sk-1234567890abcdef1234567890abcdef',
        TELEGRAM_BOT_TOKEN: 'not-a-valid-token',
      },
    });
    expect(result.warnings.some(w => w.includes('TELEGRAM_BOT_TOKEN'))).toBe(true);
  });

  test('accepts valid TELEGRAM_BOT_TOKEN format', () => {
    const result = validateEnv({
      env: {
        DEEPSEEK_API_KEY: 'sk-1234567890abcdef1234567890abcdef',
        TELEGRAM_BOT_TOKEN: '123456789:ABCDefGhIjKlMnOpQrStUvWxYz',
      },
    });
    expect(result.warnings.filter(w => w.includes('TELEGRAM_BOT_TOKEN'))).toHaveLength(0);
  });

  test('warns on empty API key values', () => {
    const result = validateEnv({
      env: { DEEPSEEK_API_KEY: '  ' },
    });
    expect(result.warnings.some(w => w.includes('empty'))).toBe(true);
  });
});
