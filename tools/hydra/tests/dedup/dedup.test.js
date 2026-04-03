import { normalizeUrl } from '../../src/dedup/url-matcher.js';
import { computeHash } from '../../src/dedup/content-hash.js';

describe('dedup', () => {
  describe('url-matcher', () => {
    test('normalizes URLs to lowercase', () => {
      expect(normalizeUrl('https://Example.COM/Article')).toBe('https://example.com/Article'.toLowerCase());
    });

    test('removes fragments', () => {
      const normalized = normalizeUrl('https://example.com/page#section');
      expect(normalized).not.toContain('#section');
    });

    test('removes trailing slash', () => {
      const normalized = normalizeUrl('https://example.com/page/');
      expect(normalized).not.toMatch(/\/$/);
    });

    test('handles invalid URLs gracefully', () => {
      expect(normalizeUrl('not-a-url')).toBe('not-a-url');
    });
  });

  describe('content-hash', () => {
    test('produces consistent SHA256 hash', () => {
      const hash1 = computeHash('Hello world');
      const hash2 = computeHash('Hello world');
      expect(hash1).toBe(hash2);
    });

    test('produces different hashes for different content', () => {
      const hash1 = computeHash('Content A');
      const hash2 = computeHash('Content B');
      expect(hash1).not.toBe(hash2);
    });

    test('produces 64-character hex string', () => {
      const hash = computeHash('test');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
