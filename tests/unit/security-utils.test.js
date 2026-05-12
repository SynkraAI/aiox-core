/**
 * Unit Tests for Security Utilities
 *
 * Test Coverage:
 * - Path validation and traversal prevention
 * - Input sanitization
 * - JSON validation
 * - Rate limiting
 * - Safe path construction
 *
 * @see .aiox-core/core/utils/security-utils.js
 */

const {
  validatePath,
  sanitizeInput,
  validateJSON,
  RateLimiter,
  safePath,
  isSafeString,
  getObjectDepth,
} = require('../../.aiox-core/core/utils/security-utils');

describe('security-utils', () => {
  describe('validatePath', () => {
    test('should accept valid relative paths', () => {
      const result = validatePath('src/components/Button.js');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject path traversal with ../', () => {
      const result = validatePath('../../../etc/passwd');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Path traversal detected: ".." is not allowed');
    });

    test('should reject path traversal with ..\\', () => {
      const result = validatePath('..\\..\\Windows\\System32');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Path traversal detected: ".." is not allowed');
    });

    test('should reject null bytes in path', () => {
      const result = validatePath('file.txt\0.exe');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Null byte detected in path');
    });

    test('should reject empty string', () => {
      const result = validatePath('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Path must be a non-empty string');
    });

    test('should reject null/undefined', () => {
      expect(validatePath(null).valid).toBe(false);
      expect(validatePath(undefined).valid).toBe(false);
    });

    test('should reject absolute paths by default', () => {
      const result = validatePath('/etc/passwd');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Absolute paths are not allowed');
    });

    test('should allow absolute paths when option is set', () => {
      const result = validatePath('/home/user/file.txt', { allowAbsolute: true });

      expect(result.valid).toBe(true);
    });

    test('should detect path escaping base directory', () => {
      const result = validatePath('subdir/../../../outside.txt', {
        basePath: '/safe/directory',
      });

      expect(result.valid).toBe(false);
    });

    test('should normalize paths correctly', () => {
      // Note: paths with '..' are rejected as path traversal
      const result = validatePath('src//components/./Button.js');

      expect(result.valid).toBe(true);
      expect(result.normalized).toBeDefined();
    });
  });

  describe('sanitizeInput', () => {
    test('should remove null bytes from all input types', () => {
      const result = sanitizeInput('hello\0world', 'general');

      expect(result).toBe('helloworld');
    });

    test('should sanitize filename - allow only safe characters', () => {
      const result = sanitizeInput('my<file>name.txt', 'filename');

      expect(result).toBe('my_file_name.txt');
    });

    test('should sanitize filename - prevent hidden files', () => {
      const result = sanitizeInput('.hidden_file', 'filename');

      expect(result).toBe('hidden_file');
    });

    test('should sanitize identifier - allow alphanumeric and dash/underscore', () => {
      const result = sanitizeInput('user@email.com', 'identifier');

      expect(result).toBe('user_email_com');
    });

    test('should sanitize shell - remove dangerous characters', () => {
      const result = sanitizeInput('echo "test"; rm -rf /', 'shell');

      expect(result).not.toContain(';');
      expect(result).not.toContain('"');
    });

    test('should sanitize html - escape HTML entities', () => {
      const result = sanitizeInput('<script>alert("xss")</script>', 'html');

      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    test('should remove control characters in general mode', () => {
      const result = sanitizeInput('hello\x00\x01\x02world', 'general');

      expect(result).toBe('helloworld');
    });

    test('should return non-string values unchanged', () => {
      expect(sanitizeInput(123, 'general')).toBe(123);
      expect(sanitizeInput(null, 'general')).toBe(null);
      expect(sanitizeInput(undefined, 'general')).toBe(undefined);
    });
  });

  describe('validateJSON', () => {
    test('should parse valid JSON', () => {
      const result = validateJSON('{"name": "test", "value": 42}');

      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ name: 'test', value: 42 });
    });

    test('should reject invalid JSON', () => {
      const result = validateJSON('{invalid json}');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });

    test('should reject empty/null input', () => {
      expect(validateJSON('').valid).toBe(false);
      expect(validateJSON(null).valid).toBe(false);
    });

    test('should reject JSON exceeding max size', () => {
      const largeJSON = JSON.stringify({ data: 'x'.repeat(2000000) });
      const result = validateJSON(largeJSON, { maxSize: 1000000 });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum size');
    });

    test('should reject deeply nested JSON', () => {
      let nested = { value: 'deep' };
      for (let i = 0; i < 15; i++) {
        nested = { nested };
      }
      const result = validateJSON(JSON.stringify(nested), { maxDepth: 10 });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('nesting depth');
    });

    test('should accept JSON within nesting limit', () => {
      const nested = { a: { b: { c: { d: 'value' } } } };
      const result = validateJSON(JSON.stringify(nested), { maxDepth: 10 });

      expect(result.valid).toBe(true);
    });
  });

  describe('RateLimiter', () => {
    test('should allow requests within limit', () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      for (let i = 0; i < 5; i++) {
        const result = limiter.check('user1');
        expect(result.allowed).toBe(true);
      }
    });

    test('should block requests exceeding limit', () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      // Make 3 allowed requests
      for (let i = 0; i < 3; i++) {
        limiter.check('user1');
      }

      // 4th request should be blocked
      const result = limiter.check('user1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test('should track different keys independently', () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      // User1 makes 2 requests
      limiter.check('user1');
      limiter.check('user1');

      // User2 should still be allowed
      const result = limiter.check('user2');
      expect(result.allowed).toBe(true);
    });

    test('should return remaining count', () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      limiter.check('user1');
      limiter.check('user1');
      const result = limiter.check('user1');

      // Remaining is calculated before recording the current request
      // After 2 previous checks, history.length = 2, remaining = 5 - 2 = 3
      expect(result.remaining).toBe(3);
    });

    test('should reset specific key', () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.check('user1');
      limiter.check('user1');

      // Should be blocked
      expect(limiter.check('user1').allowed).toBe(false);

      // Reset
      limiter.reset('user1');

      // Should be allowed again
      expect(limiter.check('user1').allowed).toBe(true);
    });

    test('should clear all data', () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      limiter.check('user1');
      limiter.check('user2');

      limiter.clear();

      // After clear, history is empty for each key
      // remaining = maxRequests - 0 = 5 (calculated before recording)
      expect(limiter.check('user1').remaining).toBe(5);
      expect(limiter.check('user2').remaining).toBe(5);
    });
  });

  describe('safePath', () => {
    test('should return safe path within base directory', () => {
      const result = safePath('/home/user', 'documents', 'file.txt');

      expect(result).not.toBeNull();
      expect(result).toContain('documents');
      expect(result).toContain('file.txt');
    });

    test('should return null for path traversal attempts', () => {
      const result = safePath('/home/user', '..', '..', 'etc', 'passwd');

      expect(result).toBeNull();
    });

    test('should handle nested directories', () => {
      const result = safePath('/base', 'level1', 'level2', 'file.txt');

      expect(result).not.toBeNull();
    });
  });

  describe('isSafeString', () => {
    test('should return true for safe strings', () => {
      expect(isSafeString('hello world')).toBe(true);
      expect(isSafeString('file-name_123.txt')).toBe(true);
    });

    test('should return false for path traversal', () => {
      expect(isSafeString('../secret')).toBe(false);
    });

    test('should return false for template injection', () => {
      expect(isSafeString('${process.env.SECRET}')).toBe(false);
    });

    test('should return false for null bytes', () => {
      expect(isSafeString('file\0.txt')).toBe(false);
    });

    test('should return false for non-strings', () => {
      expect(isSafeString(123)).toBe(false);
      expect(isSafeString(null)).toBe(false);
      expect(isSafeString({})).toBe(false);
    });
  });

  describe('getObjectDepth', () => {
    test('should return 0 for primitives', () => {
      expect(getObjectDepth('string')).toBe(0);
      expect(getObjectDepth(123)).toBe(0);
      expect(getObjectDepth(null)).toBe(0);
    });

    test('should return 0 for flat object', () => {
      expect(getObjectDepth({ a: 1, b: 2 })).toBe(0);
    });

    test('should return correct depth for nested objects', () => {
      expect(getObjectDepth({ a: { b: 1 } })).toBe(1);
      expect(getObjectDepth({ a: { b: { c: 1 } } })).toBe(2);
    });

    test('should handle arrays', () => {
      expect(getObjectDepth([1, 2, 3])).toBe(0);
      expect(getObjectDepth([{ a: 1 }])).toBe(1);
    });
  });
});
