/**
 * Thin typed wrapper around window.gtag.
 * Safe to call on SSR (no-ops), safe to call before script loaded
 * (gtag queues through dataLayer per Google's own init snippet).
 */

import { sha256 } from '@/lib/analytics/hashing'
import { normalizeEmail, normalizePhone } from '@/lib/analytics/normalize'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export interface UserDataInput {
  email?: string | null
  phone?: string | null
}

export type GtagEventParams = Record<string, string | number | boolean | undefined>

/**
 * Send Enhanced Conversions user_data. Hashes email/phone with SHA-256.
 * Omits any key whose hashed value is null.
 * No-op when running on server or when window.gtag is not defined.
 */
export async function setUserData(input: UserDataInput): Promise<void> {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return

  const emailNorm = normalizeEmail(input.email ?? null)
  const phoneNorm = normalizePhone(input.phone ?? null)

  // Hash + dispatch wrapped: sha256 (Web Crypto) and window.gtag are both
  // third-party-ish surfaces that can throw. Analytics must never break UX.
  try {
    const [emailHash, phoneHash] = await Promise.all([sha256(emailNorm), sha256(phoneNorm)])

    const userData: Record<string, string> = {}
    if (emailHash) userData.sha256_email_address = emailHash
    if (phoneHash) userData.sha256_phone_number = phoneHash

    if (Object.keys(userData).length === 0) return

    window.gtag('set', 'user_data', userData)
  } catch {
    /* hash or gtag exception — swallow */
  }
}

/**
 * Safe event dispatcher.
 */
export function gtagEvent(eventName: string, params?: GtagEventParams): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  try {
    window.gtag('event', eventName, params ?? {})
  } catch {
    /* gtag exception — swallow */
  }
}
