/**
 * Normalization helpers for PII before hashing.
 * - Email: trim + lowercase. Empty → null.
 * - Phone: strip non-digits, normalize Brazilian numbers to E.164 (+55...).
 *   Accepts common BR formats and returns null when input is obviously invalid.
 *
 * Keep pure functions — no side effects, no logging of raw input.
 */

export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim().toLowerCase()
  if (trimmed.length === 0) return null
  if (!trimmed.includes('@')) return null
  return trimmed
}

/**
 * Normalize Brazilian phone numbers to E.164 (+55DDDNNNNNNNN).
 * Accepted inputs:
 *   - 11 digits (cell with DDD):          "11987654321"         → "+5511987654321"
 *   - 10 digits (landline with DDD):      "1133334444"          → "+551133334444"
 *   - 13 digits prefixed with 55:         "5511987654321"       → "+5511987654321"
 *   - already E.164:                       "+5511987654321"      → "+5511987654321"
 * Anything else → null.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D+/g, '')
  if (digits.length === 0) return null

  // 11 digits (BR cell) or 10 digits (BR landline) → prefix +55
  if (digits.length === 11 || digits.length === 10) {
    return `+55${digits}`
  }

  // 13 or 12 digits starting with 55 → just prefix +
  if ((digits.length === 13 || digits.length === 12) && digits.startsWith('55')) {
    return `+${digits}`
  }

  return null
}
