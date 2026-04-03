import { checkWordCount, checkRecency, checkLanguage, checkContentSize, applyHeuristicFilters } from '../../src/curator/heuristic-filter.js';

describe('heuristic-filter', () => {
  describe('checkWordCount', () => {
    test('passes content with enough words', () => {
      expect(checkWordCount(200).passed).toBe(true);
    });

    test('fails content with too few words', () => {
      const result = checkWordCount(50);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('too short');
    });

    test('respects custom threshold', () => {
      expect(checkWordCount(30, 20).passed).toBe(true);
      expect(checkWordCount(30, 50).passed).toBe(false);
    });
  });

  describe('checkRecency', () => {
    test('passes recent content', () => {
      expect(checkRecency(new Date()).passed).toBe(true);
    });

    test('fails old content', () => {
      const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); // 100 days ago
      const result = checkRecency(oldDate, 90);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('too old');
    });

    test('warns when approaching limit', () => {
      const nearLimit = new Date(Date.now() - 80 * 24 * 60 * 60 * 1000); // 80 days ago
      const result = checkRecency(nearLimit, 90);
      expect(result.passed).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('checkLanguage', () => {
    test('passes English content', () => {
      expect(checkLanguage('en').passed).toBe(true);
    });

    test('passes Portuguese content', () => {
      expect(checkLanguage('pt').passed).toBe(true);
    });

    test('fails unsupported languages', () => {
      const result = checkLanguage('zh');
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('not allowed');
    });
  });

  describe('checkContentSize', () => {
    test('passes normal content', () => {
      expect(checkContentSize('Hello world').passed).toBe(true);
    });

    test('fails oversized content', () => {
      const huge = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const result = checkContentSize(huge);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('too large');
    });
  });

  describe('applyHeuristicFilters', () => {
    test('passes valid content', () => {
      const result = applyHeuristicFilters({
        wordCount: 500,
        publishedAt: new Date(),
        language: 'en',
        contentRaw: 'Some content here',
      });
      expect(result.passed).toBe(true);
    });

    test('fails on first failing filter', () => {
      const result = applyHeuristicFilters({
        wordCount: 10, // too short
        publishedAt: new Date(),
        language: 'en',
        contentRaw: 'Short',
      });
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('too short');
    });
  });
});
