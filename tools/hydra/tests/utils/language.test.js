import { describe, it, expect } from '@jest/globals';
import { detectLanguage } from '../../src/utils/language.js';

describe('detectLanguage', () => {
  it('returns "en" for null/undefined/empty input', () => {
    expect(detectLanguage(null)).toBe('en');
    expect(detectLanguage(undefined)).toBe('en');
    expect(detectLanguage('')).toBe('en');
  });

  it('returns "en" for English text', () => {
    const text = 'This is a sample text about software engineering and best practices for building scalable applications';
    expect(detectLanguage(text)).toBe('en');
  });

  it('returns "pt" for Portuguese text', () => {
    const text = 'Este artigo sobre como pode melhorar para uma aplicacao com mais escalabilidade quando necessario';
    expect(detectLanguage(text)).toBe('pt');
  });

  it('returns "en" when Portuguese word count is below threshold', () => {
    const text = 'This text has como and para but is mostly English content about technology';
    expect(detectLanguage(text)).toBe('en');
  });

  it('only samples the first 500 characters', () => {
    const englishPart = 'A'.repeat(500);
    const ptPart = ' para como que uma com mais sobre pode quando nao este esta pelo pela';
    expect(detectLanguage(englishPart + ptPart)).toBe('en');
  });

  it('detects extended Portuguese words like pelo and pela', () => {
    const text = 'pelo pela para como que uma com mais sobre pode quando nao este esta';
    expect(detectLanguage(text)).toBe('pt');
  });
});
