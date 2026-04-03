import { stripHtml, removeBoilerplate, normalizeWhitespace, numberParagraphs, normalize } from '../../src/processor/normalizer.js';

describe('normalizer', () => {
  describe('stripHtml', () => {
    test('removes HTML tags', () => {
      const result = stripHtml('<p>Hello <b>world</b></p>');
      expect(result).toContain('Hello');
      expect(result).toContain('world');
      expect(result).not.toContain('<p>');
      expect(result).not.toContain('<b>');
    });

    test('removes script and style tags', () => {
      const result = stripHtml('<script>alert("x")</script><p>Content</p><style>.a{}</style>');
      expect(result).toContain('Content');
      expect(result).not.toContain('alert');
      expect(result).not.toContain('.a{}');
    });

    test('decodes HTML entities', () => {
      const result = stripHtml('A &amp; B &lt; C &gt; D &quot;E&quot;');
      expect(result).toContain('A & B < C > D "E"');
    });

    test('handles empty/null input', () => {
      expect(stripHtml('')).toBe('');
      expect(stripHtml(null)).toBe('');
      expect(stripHtml(undefined)).toBe('');
    });
  });

  describe('removeBoilerplate', () => {
    test('removes subscription CTAs', () => {
      const result = removeBoilerplate('Great article. Subscribe to our newsletter for more.');
      expect(result).not.toContain('Subscribe to our newsletter');
    });

    test('removes social follow CTAs', () => {
      const result = removeBoilerplate('Thanks! Follow us on Twitter for updates.');
      expect(result).not.toContain('Follow us on Twitter');
    });

    test('preserves normal content', () => {
      const text = 'Machine learning models have improved significantly in 2026.';
      expect(removeBoilerplate(text)).toBe(text);
    });
  });

  describe('normalizeWhitespace', () => {
    test('collapses multiple spaces', () => {
      expect(normalizeWhitespace('hello    world')).toBe('hello world');
    });

    test('collapses multiple newlines to double', () => {
      expect(normalizeWhitespace('para1\n\n\n\npara2')).toBe('para1\n\npara2');
    });

    test('trims lines', () => {
      expect(normalizeWhitespace('  hello  \n  world  ')).toBe('hello\nworld');
    });
  });

  describe('numberParagraphs', () => {
    test('numbers paragraphs correctly', () => {
      const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      const { numbered, paragraphs } = numberParagraphs(text);
      expect(paragraphs).toHaveLength(3);
      expect(numbered).toContain('[P1]');
      expect(numbered).toContain('[P2]');
      expect(numbered).toContain('[P3]');
    });

    test('filters empty paragraphs', () => {
      const text = 'Content.\n\n\n\n\nMore content.';
      const { paragraphs } = numberParagraphs(text);
      expect(paragraphs).toHaveLength(2);
    });
  });

  describe('normalize (full pipeline)', () => {
    test('processes raw HTML content', () => {
      const rawContent = {
        contentRaw: '<p>This is a <b>test article</b> about machine learning.</p><p>It has multiple paragraphs with important content.</p>',
      };
      const result = normalize(rawContent);
      expect(result.normalizedText).toContain('test article');
      expect(result.wordCount).toBeGreaterThan(5);
      expect(result.paragraphs.length).toBeGreaterThan(0);
      expect(result.numberedText).toContain('[P1]');
    });

    test('handles empty content', () => {
      const result = normalize({ contentRaw: '' });
      expect(result.normalizedText).toBe('');
      expect(result.wordCount).toBe(0);
    });
  });
});
