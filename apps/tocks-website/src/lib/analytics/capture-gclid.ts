/**
 * STORY-TOCKS-CAPI-D++: forward gclid + Meta cookies (_fbp/_fbc) to Sales AI
 * via POST /api/capture-gclid so the server-side Meta CAPI Purchase event
 * (fired later when the Tray pedido-pago webhook arrives) can populate
 * `user_data.fbp` / `user_data.fbc`.
 *
 * Design:
 *   - Fire-and-forget. Never throws. Never delays UX.
 *   - SSR-safe (no-ops on server).
 *   - LGPD: only hashed email/phone leave the browser. Cookies are first-party
 *     identifiers Meta itself sets — no additional consent surface needed
 *     beyond the existing pixel consent (handled by analytics-scripts.tsx).
 *   - Endpoint base URL is configurable via NEXT_PUBLIC_SALES_AI_BASE_URL.
 *     When unset, we default to "/api" (assumes Sales AI is reverse-proxied
 *     onto the same origin in production via tracking.tockscustom.com.br).
 *     Callers can override via the `endpoint` arg for tests.
 */

import { sha256 } from '@/lib/analytics/hashing'
import { getMetaCookies } from '@/lib/analytics/fbq'

const SALES_AI_BASE = process.env.NEXT_PUBLIC_SALES_AI_BASE_URL

export interface CaptureGclidInput {
  /** Optional gclid (when present in URL). When missing, we still forward
   *  cookies so the row is still useful for Meta CAPI matching. */
  gclid?: string | null
  email?: string | null
  phone?: string | null
  /** Override endpoint (tests). */
  endpoint?: string
  /** fetch impl (tests). */
  fetchImpl?: typeof fetch
}

/**
 * Resolve the gclid currently present in the URL (?gclid=...). Returns null
 * when SSR or when the param is absent. Also reads from sessionStorage so a
 * gclid captured on landing survives subsequent SPA navigations.
 */
export function readGclidFromContext(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    const param = url.searchParams.get('gclid')
    if (param && param.length >= 5) {
      // Persist for subsequent form submits within the same tab session
      try {
        window.sessionStorage.setItem('tocks_gclid', param)
      } catch {
        /* sessionStorage may be blocked — ignore */
      }
      return param
    }
    try {
      const cached = window.sessionStorage.getItem('tocks_gclid')
      if (cached && cached.length >= 5) return cached
    } catch {
      /* ignore */
    }
    return null
  } catch {
    return null
  }
}

/**
 * Fire-and-forget POST to Sales AI /api/capture-gclid. Returns a promise that
 * resolves to `true` when the request was dispatched (NOT when it succeeded —
 * we never await the network for UX reasons). Returns `false` on SSR or when
 * we have nothing useful to send (no gclid AND no cookies).
 *
 * The server endpoint enforces minimum gclid length (≥5). When no gclid is
 * present, we synthesize a marker prefixed with `nogclid_` so the row exists
 * for the email/phone hash → cookie lookup path used by Meta CAPI Purchase.
 *
 * NOTE: server captureGclidSchema currently requires `gclid: z.string().min(5)`.
 * To keep the wire contract narrow, we ONLY POST when we have a real gclid OR
 * at least one Meta cookie — the latter case uses a synthetic marker so the
 * row passes validation. The server is intentionally tolerant of the prefix.
 */
export async function captureGclidAndCookies(
  input: CaptureGclidInput = {},
): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const gclid = input.gclid ?? readGclidFromContext()
  const cookies = getMetaCookies()

  // Bail out if we have absolutely nothing to forward.
  if (!gclid && !cookies.fbp && !cookies.fbc) return false

  // Hash PII before it leaves the browser (Enhanced Conversions parity).
  const [emailHash, phoneHash] = await Promise.all([
    input.email ? sha256(input.email.trim().toLowerCase()) : Promise.resolve(null),
    input.phone ? sha256(input.phone.replace(/\D+/g, '')) : Promise.resolve(null),
  ])

  // Build a payload-safe marker when no real gclid exists.
  const wireGclid = gclid ?? `nogclid_${Date.now()}_${cookies.fbp?.slice(-6) ?? 'na'}`

  const body: Record<string, string> = { gclid: wireGclid }
  if (emailHash) body.email = emailHash
  if (phoneHash) body.phone = phoneHash
  if (cookies.fbp) body.fbp = cookies.fbp
  if (cookies.fbc) body.fbc = cookies.fbc
  try {
    body.session_id = window.sessionStorage.getItem('tocks_session_id') ?? ''
    body.source_url = window.location.href.slice(0, 2048)
  } catch {
    /* ignore storage failures */
  }

  const endpoint = input.endpoint ?? `${SALES_AI_BASE ?? '/api'}/capture-gclid`
  const fetchImpl = input.fetchImpl ?? fetch

  // Fire-and-forget. Use keepalive so the request survives a rapid navigation
  // (e.g. WhatsApp click that opens wa.me in same tab).
  try {
    void fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'omit',
      mode: 'cors',
    }).catch(() => {
      /* swallow — analytics must never break UX */
    })
    return true
  } catch {
    return false
  }
}
