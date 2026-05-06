/**
 * Thin typed wrapper around window.fbq (Meta Pixel).
 * Mirror behavior of gtag.ts: safe on SSR, safe before script loaded.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
  }
}

export type FbqEventParams = Record<string, string | number | boolean | undefined>

/**
 * STORY-TOCKS-CAPI-D++: track() with optional eventID for browser/server dedup.
 * When eventID is supplied, Meta dedups against a CAPI event with the same id
 * inside a 48h window — both sides must compute the same hash from the same
 * (orderId, eventName, hour-bucket) triple. See `meta-capi-hashing.buildEventId`
 * in tocks-sales-ai for the canonical implementation.
 */
export function fbqTrack(
  eventName: string,
  params?: FbqEventParams,
  eventID?: string,
): void {
  if (typeof window === 'undefined') return
  if (typeof window.fbq !== 'function') return
  if (eventID) {
    window.fbq('track', eventName, params ?? {}, { eventID })
  } else {
    window.fbq('track', eventName, params ?? {})
  }
}

export function fbqTrackCustom(eventName: string, params?: FbqEventParams): void {
  if (typeof window === 'undefined') return
  if (typeof window.fbq !== 'function') return
  window.fbq('trackCustom', eventName, params ?? {})
}

/**
 * STORY-TOCKS-CAPI-D++: read Meta browser cookies for forwarding to Sales AI.
 *   _fbp — set by Meta Pixel script on page load. Format: fb.{subdomain_idx}.{ts}.{rand}
 *   _fbc — set when the user lands with `?fbclid=...`. Format: fb.{subdomain_idx}.{ts}.{fbclid}
 *
 * Both should be passed UNHASHED to the server (per Meta CAPI spec). Returns
 * `{}` on SSR or when cookies are absent.
 */
export interface MetaCookies {
  fbp?: string
  fbc?: string
}

export function getMetaCookies(): MetaCookies {
  if (typeof document === 'undefined') return {}
  const out: MetaCookies = {}
  // document.cookie looks like: "_fbp=fb.1.123.456; _fbc=fb.1.789.abc; foo=bar"
  // We deliberately avoid a regex to keep this allocation-light.
  const raw = document.cookie
  if (!raw) return out
  const parts = raw.split(';')
  for (const part of parts) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const name = part.slice(0, eq).trim()
    const value = part.slice(eq + 1).trim()
    if (name === '_fbp') out.fbp = value
    else if (name === '_fbc') out.fbc = value
  }
  return out
}
