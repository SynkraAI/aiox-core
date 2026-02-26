// =============================================================================
// tok6-filters.test.js — Unit tests for TOK-6 Dynamic Filtering
// =============================================================================
// Tests content-filter.js, schema-filter.js, field-filter.js, and index.js
// Covers: HTML stripping, token truncation, field projection, row limiting,
//         filter dispatch, registry lookup, edge cases
// =============================================================================

'use strict';

const { filterContent, stripHtml, truncateAtBoundary, extractFields, CHARS_PER_TOKEN } = require('../../.aios-core/utils/filters/content-filter');
const { filterSchema, projectFields } = require('../../.aios-core/utils/filters/schema-filter');
const { filterFields } = require('../../.aios-core/utils/filters/field-filter');
const { applyFilter, loadFilterConfig } = require('../../.aios-core/utils/filters/index');
const path = require('path');

// =============================================================================
// content-filter.js tests
// =============================================================================
describe('content-filter.js', () => {
  describe('stripHtml', () => {
    it('removes script tags and content', () => {
      const result = stripHtml('<p>Hello</p><script>alert("xss")</script><p>World</p>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('removes nav, footer, header, aside elements', () => {
      const html = '<nav>menu</nav><main><p>Content</p></main><footer>copy</footer>';
      const result = stripHtml(html);
      expect(result).not.toContain('menu');
      expect(result).not.toContain('copy');
      expect(result).toContain('Content');
    });

    it('removes style tags', () => {
      const result = stripHtml('<style>.red{color:red}</style><p>Text</p>');
      expect(result).not.toContain('.red');
      expect(result).toContain('Text');
    });

    it('removes HTML comments', () => {
      const result = stripHtml('<!-- hidden comment --><p>Visible</p>');
      expect(result).not.toContain('hidden');
      expect(result).toContain('Visible');
    });

    it('decodes HTML entities', () => {
      const result = stripHtml('<p>&amp; &lt; &gt; &quot; &#39; &nbsp;</p>');
      expect(result).toContain('&');
      expect(result).toContain('<');
      expect(result).toContain('>');
    });

    it('handles non-string input', () => {
      expect(stripHtml(null)).toBe('');
      expect(stripHtml(undefined)).toBe('');
      expect(stripHtml(42)).toBe('42');
    });
  });

  describe('truncateAtBoundary', () => {
    it('returns text unchanged when under limit', () => {
      const text = 'Short text.';
      expect(truncateAtBoundary(text, 1000)).toBe(text);
    });

    it('truncates at paragraph boundary', () => {
      const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph with lots more text.';
      const result = truncateAtBoundary(text, 10); // ~40 chars
      expect(result).toContain('First paragraph');
      expect(result).toContain('[...truncated]');
    });

    it('truncates at sentence boundary when no paragraph break', () => {
      const text = 'First sentence. Second sentence. Third sentence that goes on for a while.';
      const result = truncateAtBoundary(text, 12); // ~48 chars
      expect(result).toContain('[...truncated]');
    });
  });

  describe('extractFields', () => {
    it('extracts specified fields', () => {
      const result = extractFields({ a: 1, b: 2, c: 3 }, ['a', 'c']);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('handles missing fields gracefully', () => {
      const result = extractFields({ a: 1 }, ['a', 'z']);
      expect(result).toEqual({ a: 1 });
    });

    it('returns input for non-objects', () => {
      expect(extractFields('string', ['a'])).toBe('string');
      expect(extractFields(null, ['a'])).toBe(null);
    });
  });

  describe('filterContent', () => {
    it('filters HTML content and measures reduction', () => {
      const html = '<html><nav>nav</nav><p>Real content.</p><footer>foot</footer></html>';
      const result = filterContent(html, { max_tokens: 1000 });
      expect(result.filtered).toContain('Real content');
      expect(result.filtered).not.toContain('nav');
      expect(result.reduction_pct).toBeGreaterThan(0);
    });

    it('extracts fields from object input', () => {
      const input = { title: 'Test', snippet: 'Summary', fullBody: 'Very long...' };
      const result = filterContent(input, { extract: ['title', 'snippet'], max_tokens: 1000 });
      expect(result.filtered).toContain('Test');
      expect(result.filtered).toContain('Summary');
    });

    it('uses content/text/body property from object', () => {
      const input = { content: 'Hello world' };
      const result = filterContent(input, { max_tokens: 1000 });
      expect(result.filtered).toBe('Hello world');
    });

    it('handles plain text without HTML', () => {
      const result = filterContent('Just plain text.', { max_tokens: 1000 });
      expect(result.filtered).toBe('Just plain text.');
      expect(result.reduction_pct).toBe(0);
    });

    it('returns 0% reduction for empty input', () => {
      const result = filterContent('', { max_tokens: 1000 });
      expect(result.reduction_pct).toBe(0);
    });
  });
});

// =============================================================================
// schema-filter.js tests
// =============================================================================
describe('schema-filter.js', () => {
  describe('projectFields', () => {
    it('projects specified fields', () => {
      const result = projectFields({ name: 'John', age: 30, ssn: '123' }, ['name', 'age']);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('returns non-object input unchanged', () => {
      expect(projectFields('text', ['a'])).toBe('text');
      expect(projectFields(null, ['a'])).toBe(null);
    });
  });

  describe('filterSchema', () => {
    it('filters object by field whitelist', () => {
      const input = { name: 'John', age: 30, ssn: '123-45-6789', email: 'john@test.com' };
      const result = filterSchema(input, { fields: ['name', 'age'] });
      expect(result.filtered).toEqual({ name: 'John', age: 30 });
      expect(result.reduction_pct).toBeGreaterThan(0);
    });

    it('filters array of objects', () => {
      const input = [
        { name: 'John', ssn: '123' },
        { name: 'Jane', ssn: '456' },
      ];
      const result = filterSchema(input, { fields: ['name'] });
      expect(result.filtered).toEqual([{ name: 'John' }, { name: 'Jane' }]);
    });

    it('passes through when no fields specified', () => {
      const input = { a: 1, b: 2 };
      const result = filterSchema(input, { fields: [] });
      expect(result.reduction_pct).toBe(0);
    });

    it('passes through when fields is empty array', () => {
      const result = filterSchema({ a: 1 }, {});
      expect(result.reduction_pct).toBe(0);
    });

    it('truncates array by removing trailing items when max_tokens exceeded', () => {
      const input = [];
      for (let i = 0; i < 20; i++) {
        input.push({ name: 'Item ' + i, value: i });
      }
      const result = filterSchema(input, { fields: ['name', 'value'], max_tokens: 50 });
      expect(result.filtered.length).toBeLessThan(20);
      // Result should still be a valid array
      expect(Array.isArray(result.filtered)).toBe(true);
      expect(result.filtered[0]).toHaveProperty('name');
    });

    it('truncates single object gracefully when max_tokens exceeded', () => {
      const input = { name: 'A'.repeat(500), description: 'B'.repeat(500) };
      const result = filterSchema(input, { fields: ['name', 'description'], max_tokens: 20 });
      expect(result.filtered_length).toBeLessThanOrEqual(20 * 4 + 20); // maxChars + truncation marker
    });
  });
});

// =============================================================================
// constants.js tests
// =============================================================================
describe('constants.js', () => {
  it('exports CHARS_PER_TOKEN as 4', () => {
    const { CHARS_PER_TOKEN } = require('../../.aios-core/utils/filters/constants');
    expect(CHARS_PER_TOKEN).toBe(4);
  });

  it('is the same value used by content-filter and schema-filter', () => {
    const { CHARS_PER_TOKEN: contentCPT } = require('../../.aios-core/utils/filters/content-filter');
    const { CHARS_PER_TOKEN: schemaCPT } = require('../../.aios-core/utils/filters/schema-filter');
    const { CHARS_PER_TOKEN: sharedCPT } = require('../../.aios-core/utils/filters/constants');
    expect(contentCPT).toBe(sharedCPT);
    expect(schemaCPT).toBe(sharedCPT);
  });
});

// =============================================================================
// field-filter.js tests
// =============================================================================
describe('field-filter.js', () => {
  describe('filterFields', () => {
    it('projects columns and limits rows', () => {
      const input = [
        { a: 1, b: 2, c: 3 },
        { a: 4, b: 5, c: 6 },
        { a: 7, b: 8, c: 9 },
      ];
      const result = filterFields(input, { fields: ['a', 'b'], max_rows: 2 });
      expect(result.filtered).toEqual([{ a: 1, b: 2 }, { a: 4, b: 5 }]);
      expect(result.rows_original).toBe(3);
      expect(result.rows_filtered).toBe(2);
      expect(result.reduction_pct).toBeGreaterThan(0);
    });

    it('limits rows without field projection', () => {
      const input = [{ a: 1 }, { a: 2 }, { a: 3 }];
      const result = filterFields(input, { fields: [], max_rows: 1 });
      expect(result.rows_filtered).toBe(1);
    });

    it('wraps non-array input in array', () => {
      const result = filterFields({ a: 1, b: 2 }, { fields: ['a'] });
      expect(result.filtered).toEqual([{ a: 1 }]);
    });

    it('handles empty array', () => {
      const result = filterFields([], { fields: ['a'], max_rows: 10 });
      expect(result.filtered).toEqual([]);
      expect(result.rows_original).toBe(0);
      expect(result.rows_filtered).toBe(0);
    });

    it('handles max_rows larger than array', () => {
      const input = [{ a: 1 }, { a: 2 }];
      const result = filterFields(input, { fields: ['a'], max_rows: 100 });
      expect(result.rows_filtered).toBe(2);
    });

    it('achieves >50% reduction on realistic Apify data', () => {
      const data = [];
      for (let i = 0; i < 50; i++) {
        data.push({
          username: 'user_' + i,
          caption: 'Caption text ' + i,
          likes: i * 100,
          timestamp: '2026-02-01T00:00:00Z',
          url: 'https://example.com/' + i,
          fullName: 'Name ' + i,
          bio: 'Bio text ' + i,
          profilePicUrl: 'https://cdn.example.com/' + i + '.jpg',
          followerCount: i * 1000,
          followingCount: i * 50,
          postCount: i * 10,
          hashtags: ['#a', '#b', '#c'],
          commentsCount: i * 5,
        });
      }
      const result = filterFields(data, {
        fields: ['username', 'caption', 'likes', 'timestamp', 'url'],
        max_rows: 20,
      });
      expect(result.reduction_pct).toBeGreaterThanOrEqual(50);
      expect(result.filtered[0].username).toBe('user_0');
    });
  });
});

// =============================================================================
// index.js tests
// =============================================================================
describe('index.js (filter dispatcher)', () => {
  const registryPath = path.join(__dirname, '..', '..', '.aios-core', 'data', 'tool-registry.yaml');

  describe('loadFilterConfig', () => {
    it('loads filter config for exa from registry', () => {
      const config = loadFilterConfig('exa', registryPath);
      expect(config).not.toBeNull();
      expect(config.type).toBe('content');
      expect(config.max_tokens).toBe(2000);
    });

    it('loads filter config for apify from registry', () => {
      const config = loadFilterConfig('apify', registryPath);
      expect(config).not.toBeNull();
      expect(config.type).toBe('field');
      expect(config.max_rows).toBe(20);
    });

    it('returns null for tool without filter', () => {
      const config = loadFilterConfig('Read', registryPath);
      expect(config).toBeNull();
    });

    it('returns null for nonexistent tool', () => {
      const config = loadFilterConfig('nonexistent-tool', registryPath);
      expect(config).toBeNull();
    });
  });

  describe('applyFilter', () => {
    it('dispatches content filter for exa', () => {
      const result = applyFilter('exa', '<html><p>Content</p></html>', null, registryPath);
      expect(result.filter_type).toBe('content');
      expect(result.filtered).toContain('Content');
    });

    it('dispatches field filter for apify', () => {
      const data = [
        { username: 'u1', caption: 'c1', likes: 10, timestamp: 't1', url: 'u', extra: 'x' },
      ];
      const result = applyFilter('apify', data, null, registryPath);
      expect(result.filter_type).toBe('field');
      expect(result.filtered[0]).toHaveProperty('username');
      expect(result.filtered[0]).not.toHaveProperty('extra');
    });

    it('dispatches schema filter for playwright', () => {
      const data = { url: 'http://x.com', title: 'T', status: 200, content: 'C', cookies: [] };
      const result = applyFilter('playwright', data, null, registryPath);
      expect(result.filter_type).toBe('schema');
      expect(result.filtered).toHaveProperty('url');
      expect(result.filtered).not.toHaveProperty('cookies');
    });

    it('passes through for tools without filter config', () => {
      const result = applyFilter('Read', 'some data', null, registryPath);
      expect(result.filter_type).toBe('none');
      expect(result.reduction_pct).toBe(0);
    });

    it('accepts override config', () => {
      const config = { type: 'schema', fields: ['name'] };
      const result = applyFilter('anything', { name: 'test', extra: 'data' }, config);
      expect(result.filter_type).toBe('schema');
      expect(result.filtered).toEqual({ name: 'test' });
    });

    it('handles unknown filter type gracefully', () => {
      const config = { type: 'unknown_type' };
      const result = applyFilter('test', { data: 'value' }, config);
      expect(result.filter_type).toBe('unknown');
      expect(result.reduction_pct).toBe(0);
    });
  });
});

// =============================================================================
// Cross-cutting: reduction targets
// =============================================================================
describe('payload reduction targets', () => {
  it('content filter achieves >= -24% on HTML', () => {
    const html = '<html><head><title>T</title></head><body><nav>N</nav><p>Content paragraph.</p><footer>F</footer><script>s()</script></body></html>';
    const result = filterContent(html, { max_tokens: 1000 });
    expect(result.reduction_pct).toBeGreaterThanOrEqual(24);
  });

  it('schema filter achieves >= -50% on typical API response', () => {
    const data = {
      id: 1, name: 'Item', description: 'D', category: 'C',
      metadata: { created: 'x', updated: 'y', tags: ['a', 'b'] },
      permissions: { read: true, write: false, admin: false },
    };
    const result = filterSchema(data, { fields: ['id', 'name'] });
    expect(result.reduction_pct).toBeGreaterThanOrEqual(50);
  });

  it('field filter achieves >= -50% on array data with row+column reduction', () => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({ a: i, b: i * 2, c: i * 3, d: 'extra_' + i, e: 'more_' + i });
    }
    const result = filterFields(data, { fields: ['a', 'b'], max_rows: 10 });
    expect(result.reduction_pct).toBeGreaterThanOrEqual(50);
  });
});
