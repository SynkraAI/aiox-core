import {
  checkUrlBlocklist,
  checkSizeLimits,
  checkEncoding,
  validateContent,
} from '../../src/security/content-validator.js';

// ========== checkUrlBlocklist ==========

describe('checkUrlBlocklist', () => {
  test('blocks URL shortener domains', () => {
    expect(checkUrlBlocklist('https://bit.ly/abc123').blocked).toBe(true);
    expect(checkUrlBlocklist('https://t.co/xyz').blocked).toBe(true);
    expect(checkUrlBlocklist('https://tinyurl.com/short').blocked).toBe(true);
  });

  test('allows shorteners for twitter source type', () => {
    expect(checkUrlBlocklist('https://t.co/xyz', 'twitter').blocked).toBe(false);
  });

  test('allows shorteners for custom override sources', () => {
    const blocklist = { allow_shorteners_from: ['newsletter'] };
    expect(checkUrlBlocklist('https://bit.ly/abc', 'newsletter', blocklist).blocked).toBe(false);
  });

  test('blocks .onion domains', () => {
    expect(checkUrlBlocklist('https://hidden.onion/page').blocked).toBe(true);
  });

  test('blocks .local domains', () => {
    expect(checkUrlBlocklist('https://internal.local/api').blocked).toBe(true);
  });

  test('blocks file:// protocol', () => {
    expect(checkUrlBlocklist('file:///etc/passwd').blocked).toBe(true);
  });

  test('blocks data: URIs', () => {
    expect(checkUrlBlocklist('data:text/html,evil').blocked).toBe(true);
  });

  test('allows normal URLs', () => {
    expect(checkUrlBlocklist('https://example.com/article').blocked).toBe(false);
    expect(checkUrlBlocklist('https://github.com/repo').blocked).toBe(false);
  });

  test('handles custom blocklist patterns', () => {
    const blocklist = { patterns: ['.*\\.evil\\.com$'] };
    expect(checkUrlBlocklist('https://www.evil.com/page', undefined, blocklist).blocked).toBe(true);
  });

  test('handles empty URL', () => {
    expect(checkUrlBlocklist('').blocked).toBe(true);
    expect(checkUrlBlocklist(null).blocked).toBe(true);
  });
});

// ========== checkSizeLimits ==========

describe('checkSizeLimits', () => {
  test('passes normal content', () => {
    const item = {
      title: 'Normal Title',
      url: 'https://example.com',
      contentRaw: 'A'.repeat(100),
    };
    expect(checkSizeLimits(item).valid).toBe(true);
  });

  test('rejects title over 500 chars', () => {
    const item = {
      title: 'X'.repeat(501),
      url: 'https://example.com',
      contentRaw: 'content'.repeat(20),
    };
    expect(checkSizeLimits(item).valid).toBe(false);
    expect(checkSizeLimits(item).reason).toContain('title_too_long');
  });

  test('rejects URL over 2048 chars', () => {
    const item = {
      title: 'Test',
      url: 'https://example.com/' + 'a'.repeat(2100),
      contentRaw: 'content'.repeat(20),
    };
    expect(checkSizeLimits(item).valid).toBe(false);
    expect(checkSizeLimits(item).reason).toContain('url_too_long');
  });

  test('rejects content over 5MB', () => {
    const item = {
      title: 'Test',
      url: 'https://example.com',
      contentRaw: 'X'.repeat(6 * 1024 * 1024),
    };
    expect(checkSizeLimits(item).valid).toBe(false);
    expect(checkSizeLimits(item).reason).toContain('content_too_large');
  });

  test('rejects content under 50 chars', () => {
    const item = {
      title: 'Test',
      url: 'https://example.com',
      contentRaw: 'short',
    };
    expect(checkSizeLimits(item).valid).toBe(false);
    expect(checkSizeLimits(item).reason).toContain('content_too_short');
  });

  test('respects custom limits', () => {
    const item = {
      title: 'Test',
      url: 'https://example.com',
      contentRaw: 'A'.repeat(200),
    };
    expect(checkSizeLimits(item, { minContentLength: 300 }).valid).toBe(false);
  });
});

// ========== checkEncoding ==========

describe('checkEncoding', () => {
  test('passes normal text', () => {
    expect(checkEncoding('Hello, this is normal text with unicode: cafe')).toEqual({ valid: true });
  });

  test('rejects binary content (high non-printable ratio)', () => {
    // Create content that is >10% non-printable
    const binary = '\x01\x02\x03\x04\x05\x06\x07\x08'.repeat(20) + 'text';
    const result = checkEncoding(binary);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('binary_content');
  });

  test('allows text with occasional non-printable chars', () => {
    const text = 'Normal text ' + '\x01' + ' more text'.repeat(100);
    expect(checkEncoding(text).valid).toBe(true);
  });

  test('rejects null/empty content', () => {
    expect(checkEncoding(null).valid).toBe(false);
    expect(checkEncoding('').valid).toBe(false);
  });
});

// ========== validateContent (integration) ==========

describe('validateContent', () => {
  const validItem = {
    title: 'Great Article About AI',
    url: 'https://arxiv.org/abs/2024.1234',
    contentRaw: 'This is a substantial article about artificial intelligence and its applications in modern society. '.repeat(10),
  };

  test('validates a normal item', () => {
    expect(validateContent(validItem).valid).toBe(true);
  });

  test('rejects item with blocked URL', () => {
    const item = { ...validItem, url: 'https://bit.ly/short' };
    const result = validateContent(item);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('blocked_url');
  });

  test('allows blocked URL shortener for twitter source', () => {
    const item = { ...validItem, url: 'https://t.co/abc123' };
    const result = validateContent(item, { sourceType: 'twitter' });
    expect(result.valid).toBe(true);
  });

  test('rejects item with oversized content', () => {
    const item = { ...validItem, contentRaw: 'X'.repeat(6 * 1024 * 1024) };
    expect(validateContent(item).valid).toBe(false);
  });

  test('rejects null item', () => {
    expect(validateContent(null).valid).toBe(false);
  });
});
