/**
 * Hashing helpers — deterministic vectors.
 */

import { describe, it, expect } from 'vitest';

import {
  sha256Hex,
  normalizeEmail,
  normalizePhone,
  hashEmail,
  hashPhone,
  hashPreview,
} from '../../src/integrations/hashing.js';

describe('sha256Hex', () => {
  it('matches a well-known vector', () => {
    expect(sha256Hex('test')).toBe(
      '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    );
  });
});

describe('normalizeEmail', () => {
  it('lowercases and trims', () => {
    expect(normalizeEmail('  Breno@Tocks.COM  ')).toBe('breno@tocks.com');
  });
  it('returns null for invalid', () => {
    expect(normalizeEmail('')).toBeNull();
    expect(normalizeEmail('not-an-email')).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
  });
});

describe('normalizePhone', () => {
  it('accepts E.164 as-is', () => {
    expect(normalizePhone('+5547999991234')).toBe('+5547999991234');
  });
  it('prefixes +55 for 11-digit BR', () => {
    expect(normalizePhone('(47) 99999-1234')).toBe('+5547999991234');
  });
  it('returns null for garbage', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('abc')).toBeNull();
  });
});

describe('hashEmail / hashPhone', () => {
  it('returns hex string', () => {
    const h = hashEmail('breno@tocks.com');
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });
  it('returns null for null input', () => {
    expect(hashEmail(null)).toBeNull();
    expect(hashPhone(null)).toBeNull();
  });
  it('is deterministic', () => {
    expect(hashEmail('Breno@Tocks.COM')).toBe(hashEmail('  breno@tocks.com  '));
  });
});

describe('hashPreview', () => {
  it('returns first 8 chars with ellipsis', () => {
    expect(hashPreview('abcdef1234567890')).toBe('abcdef12…');
  });
  it('returns [none] for null', () => {
    expect(hashPreview(null)).toBe('[none]');
  });
});
