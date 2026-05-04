/**
 * SHA-256 hashing helper for Enhanced Conversions (Google) and Meta CAPI.
 * Uses Web Crypto API — runs only in browser. Returns null in SSR or when
 * input is empty so callers can omit user_data keys cleanly.
 *
 * NEVER log raw inputs from here — only hash output or "[empty]".
 */

const HEX_LENGTH = 64

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i] as number
    hex += (byte < 16 ? '0' : '') + byte.toString(16)
  }
  return hex
}

/**
 * Compute SHA-256 hex digest of a UTF-8 string.
 * Returns null if running on server (no `crypto.subtle`) or input is empty.
 */
export async function sha256(value: string | null | undefined): Promise<string | null> {
  if (!value) return null
  if (typeof window === 'undefined') return null
  if (typeof window.crypto === 'undefined' || !window.crypto.subtle) return null

  const encoded = new TextEncoder().encode(value)
  const buffer = await window.crypto.subtle.digest('SHA-256', encoded)
  const hex = toHex(buffer)
  return hex.length === HEX_LENGTH ? hex : null
}
