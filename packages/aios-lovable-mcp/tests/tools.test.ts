import { describe, it, expect } from 'vitest';
import {
  DesignArchitectureInputValidator,
  GenerateCodeInputValidator,
} from '../src/tools/index.js';

describe('DesignArchitectureInputValidator', () => {
  it('accepts valid input', () => {
    const result = DesignArchitectureInputValidator.safeParse({
      spec: 'Build a quiz app',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty spec', () => {
    const result = DesignArchitectureInputValidator.safeParse({ spec: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing spec', () => {
    const result = DesignArchitectureInputValidator.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = DesignArchitectureInputValidator.safeParse({
      spec: 'Build a quiz app',
      requirements: { functional: [] },
      stack_preference: 'vite-react',
    });
    expect(result.success).toBe(true);
  });
});

describe('GenerateCodeInputValidator', () => {
  it('accepts valid input', () => {
    const result = GenerateCodeInputValidator.safeParse({
      spec: 'Build a quiz app',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty spec', () => {
    const result = GenerateCodeInputValidator.safeParse({ spec: '' });
    expect(result.success).toBe(false);
  });

  it('accepts all optional fields', () => {
    const result = GenerateCodeInputValidator.safeParse({
      spec: 'Build a quiz app',
      architecture: { stack: {} },
      ux_spec: { pages: [] },
      target_files: ['src/app/page.tsx'],
      framework: 'vite-react',
    });
    expect(result.success).toBe(true);
  });
});
