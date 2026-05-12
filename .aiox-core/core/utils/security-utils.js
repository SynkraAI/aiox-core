/**
 * Security Utilities for Synkra AIOX
 * Provides centralized security functions for input validation and sanitization
 *
 * @module security-utils
 * @version 1.0.0
 * @created 2025-12-05 (Story 4.1)
 */

const path = require('path');

/**
 * Validates a file path to prevent path traversal attacks
 *
 * @param {string} filePath - The path to validate
 * @param {Object} options - Validation options
 * @param {string} [options.basePath] - Base path to restrict operations to
 * @param {boolean} [options.allowAbsolute=false] - Whether to allow absolute paths
 * @returns {Object} Validation result with {valid: boolean, normalized: string, errors: string[]}
 */
function validatePath(filePath, options = {}) {
  const result = {
    valid: true,
    normalized: null,
    errors: [],
  };

  // Check for null/undefined input
  if (!filePath || typeof filePath !== 'string') {
    result.valid = false;
    result.errors.push('Path must be a non-empty string');
    return result;
  }

  // Normalize the path
  const normalized = path.normalize(filePath);
  result.normalized = normalized;

  // Check for path traversal attempts (../ or ..\)
  if (filePath.includes('..') || normalized.includes('..')) {
    result.valid = false;
    result.errors.push('Path traversal detected: ".." is not allowed');
  }

  // Check for null bytes (null byte injection)
  if (filePath.includes('\0')) {
    result.valid = false;
    result.errors.push('Null byte detected in path');
  }

  // Check for absolute paths if not allowed
  if (!options.allowAbsolute && path.isAbsolute(normalized)) {
    result.valid = false;
    result.errors.push('Absolute paths are not allowed');
  }

  // If basePath is provided, ensure the resolved path stays within it
  if (options.basePath && result.valid) {
    const resolvedPath = path.resolve(options.basePath, normalized);
    const resolvedBase = path.resolve(options.basePath);

    if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
      result.valid = false;
      result.errors.push('Path escapes the allowed base directory');
    }
  }

  return result;
}

/**
 * Sanitizes user input to prevent injection attacks
 *
 * @param {string} input - The input to sanitize
 * @param {string} type - Type of sanitization ('general'|'filename'|'identifier'|'shell'|'html')
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, type = 'general') {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove null bytes from all inputs
  let sanitized = input.replace(/\0/g, '');

  switch (type) {
    case 'filename':
      // Allow only safe filename characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9\-_.]/g, '_');
      // Prevent hidden files/directories
      sanitized = sanitized.replace(/^\.+/, '');
      break;

    case 'identifier':
      // Allow only alphanumeric, dash, and underscore
      sanitized = sanitized.replace(/[^a-zA-Z0-9\-_]/g, '_');
      break;

    case 'shell':
      // Escape shell special characters
      sanitized = sanitized.replace(/[;&|`$(){}[\]<>!#*?\\'"]/g, '');
      break;

    case 'html':
      // Escape HTML entities
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
      break;

    case 'general':
    default:
      // Basic sanitization - remove control characters except newlines and tabs
      // eslint-disable-next-line no-control-regex
      sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      break;
  }

  return sanitized;
}

/**
 * Validates JSON input safely
 *
 * @param {string} jsonString - JSON string to validate and parse
 * @param {Object} options - Options
 * @param {number} [options.maxSize=1048576] - Maximum allowed size in bytes (default 1MB)
 * @param {number} [options.maxDepth=10] - Maximum allowed nesting depth
 * @returns {Object} Result with {valid: boolean, data: any, error: string}
 */
function validateJSON(jsonString, options = {}) {
  const { maxSize = 1048576, maxDepth = 10 } = options;
  const result = {
    valid: true,
    data: null,
    error: null,
  };

  // Check for null/undefined input
  if (!jsonString || typeof jsonString !== 'string') {
    result.valid = false;
    result.error = 'JSON input must be a non-empty string';
    return result;
  }

  // Check size limit
  if (jsonString.length > maxSize) {
    result.valid = false;
    result.error = `JSON exceeds maximum size of ${maxSize} bytes`;
    return result;
  }

  // Parse JSON
  try {
    result.data = JSON.parse(jsonString);
  } catch (error) {
    result.valid = false;
    result.error = `Invalid JSON: ${error.message}`;
    return result;
  }

  // Check nesting depth
  const depth = getObjectDepth(result.data);
  if (depth > maxDepth) {
    result.valid = false;
    result.error = `JSON nesting depth (${depth}) exceeds maximum of ${maxDepth}`;
    return result;
  }

  return result;
}

/**
 * Gets the maximum depth of a nested object
 * @private
 */
function getObjectDepth(obj, currentDepth = 0) {
  if (typeof obj !== 'object' || obj === null) {
    return currentDepth;
  }

  let maxDepth = currentDepth;
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      const depth = getObjectDepth(value, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }

  return maxDepth;
}

/**
 * Simple in-memory rate limiter
 *
 * @class RateLimiter
 */
class RateLimiter {
  /**
   * @param {Object} options - Rate limiter options
   * @param {number} [options.maxRequests=100] - Maximum requests per window
   * @param {number} [options.windowMs=60000] - Time window in milliseconds
   */
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 100;
    this.windowMs = options.windowMs || 60000; // 1 minute default
    this.requests = new Map();
  }

  /**
   * Check if a request should be allowed
   *
   * @param {string} key - Unique identifier for the requester (e.g., user ID, IP)
   * @returns {Object} Result with {allowed: boolean, remaining: number, resetTime: number}
   */
  check(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request history for this key
    let history = this.requests.get(key);
    if (!history) {
      history = [];
      this.requests.set(key, history);
    }

    // Remove old requests outside the window
    history = history.filter(timestamp => timestamp > windowStart);
    this.requests.set(key, history);

    // Check if limit exceeded
    const allowed = history.length < this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - history.length);
    const resetTime = history.length > 0 ? history[0] + this.windowMs : now + this.windowMs;

    // Record this request if allowed
    if (allowed) {
      history.push(now);
    }

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? 0 : Math.ceil((resetTime - now) / 1000),
    };
  }

  /**
   * Reset the rate limiter for a specific key
   * @param {string} key - Key to reset
   */
  reset(key) {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limit data
   */
  clear() {
    this.requests.clear();
  }

  /**
   * Clean up expired entries (call periodically for memory management)
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, history] of this.requests.entries()) {
      const filtered = history.filter(timestamp => timestamp > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
}

/**
 * Creates a safe path within a base directory
 *
 * @param {string} basePath - The base directory
 * @param {...string} segments - Path segments to join
 * @returns {string|null} Safe path or null if validation fails
 */
function safePath(basePath, ...segments) {
  const joinedPath = path.join(...segments);
  const validation = validatePath(joinedPath, { basePath });

  if (!validation.valid) {
    return null;
  }

  return path.join(basePath, validation.normalized);
}

/**
 * Checks if a value is a safe string (no injection attempts)
 *
 * @param {any} value - Value to check
 * @returns {boolean} True if safe
 */
function isSafeString(value) {
  if (typeof value !== 'string') {
    return false;
  }

  // Check for common injection patterns
  const dangerousPatterns = [
    // eslint-disable-next-line no-control-regex
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, // Control characters
    /\.\.\//,  // Path traversal
    /\$\{/,    // Template injection
    /\0/,      // Null byte
  ];

  return !dangerousPatterns.some(pattern => pattern.test(value));
}

module.exports = {
  validatePath,
  sanitizeInput,
  validateJSON,
  RateLimiter,
  safePath,
  isSafeString,
  getObjectDepth,
};
