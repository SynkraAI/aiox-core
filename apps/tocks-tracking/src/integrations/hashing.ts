/**
 * SHA-256 + normalization helpers for user_data hashing.
 * Server-side equivalent of apps/tocks-website/src/lib/analytics/hashing.ts and
 * identical to @tocks/sales-ai src/integrations/meta-capi-hashing.ts.
 *
 * NEVER pass raw PII into logs. Use `hashPreview(h)` if you need to correlate
 * events by hash without exposing anything reversible.
 */

import { createHash } from 'node:crypto';

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.length === 0) return null;
  if (!trimmed.includes('@')) return null;
  return trimmed;
}

/**
 * Normalize BR phone numbers to E.164 (+55DDDNNNNNNNN).
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  if (/^\+[1-9]\d{6,14}$/.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D+/g, '');
  if (digits.length === 0) return null;
  if (digits.length === 11 || digits.length === 10) return `+55${digits}`;
  if ((digits.length === 13 || digits.length === 12) && digits.startsWith('55')) {
    return `+${digits}`;
  }
  return null;
}

export function hashEmail(raw: string | null | undefined): string | null {
  const norm = normalizeEmail(raw);
  return norm ? sha256Hex(norm) : null;
}

export function hashPhone(raw: string | null | undefined): string | null {
  const norm = normalizePhone(raw);
  return norm ? sha256Hex(norm) : null;
}

/** Safe log preview: returns first 8 hex chars of a hash (irreversible). */
export function hashPreview(hash: string | null | undefined): string {
  if (!hash) return '[none]';
  return `${hash.slice(0, 8)}…`;
}
