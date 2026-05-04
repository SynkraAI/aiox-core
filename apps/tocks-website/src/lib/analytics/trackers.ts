/**
 * High-level tracking helpers used across UI components.
 * All are safe on SSR. Fire-and-forget semantics — never throws.
 */

import { gtagEvent, setUserData } from '@/lib/analytics/gtag'
import { fbqTrack } from '@/lib/analytics/fbq'
import { captureGclidAndCookies } from '@/lib/analytics/capture-gclid'

const AW_CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_AW_CONVERSION_ID

export interface LeadSubmitInput {
  email?: string | null
  phone?: string | null
  source?: string
  value?: number
}

export interface WhatsAppClickInput {
  source: string
  email?: string | null
  phone?: string | null
}

export interface CtaClickInput {
  label: string
  section: string
}

/**
 * Fire a Lead / conversion event.
 * - Sets Enhanced Conversions user_data (SHA-256 email+phone)
 * - If NEXT_PUBLIC_GOOGLE_AW_CONVERSION_ID set, emits the Google Ads conversion
 * - Always emits a generic 'generate_lead' so GA4 counts it too
 * - Mirrors a Meta Pixel 'Lead' event
 * - STORY-TOCKS-CAPI-D++: forwards _fbp/_fbc cookies (and optional gclid) to
 *   Sales AI so the server-side Purchase CAPI event can populate user_data.fbp
 *   when the buyer eventually completes a Tray order.
 */
export function trackLeadSubmit(input: LeadSubmitInput): void {
  void setUserData({ email: input.email, phone: input.phone }).catch(() => {
    /* swallow hashing errors — tracking must never break UX */
  })

  const value = input.value ?? 13000
  const currency = 'BRL'
  const source = input.source ?? 'unknown'

  if (AW_CONVERSION_ID) {
    gtagEvent('conversion', {
      send_to: AW_CONVERSION_ID,
      value,
      currency,
    })
  }

  gtagEvent('generate_lead', { source, value, currency })
  fbqTrack('Lead', { source, value, currency })

  // STORY-TOCKS-CAPI-D++: forward cookies (+ optional gclid) to Sales AI.
  // Fire-and-forget; never blocks UX.
  void captureGclidAndCookies({
    email: input.email ?? null,
    phone: input.phone ?? null,
  }).catch(() => {
    /* swallow */
  })
}

/**
 * Fire a WhatsApp click event. Does NOT await hashing — click must not be delayed.
 * STORY-TOCKS-CAPI-D++: also forwards _fbp/_fbc to Sales AI on click so we
 * capture cookies for users who route through WhatsApp before checkout.
 */
export function trackWhatsAppClick(input: WhatsAppClickInput): void {
  void setUserData({ email: input.email, phone: input.phone }).catch(() => {
    /* swallow */
  })

  gtagEvent('whatsapp_click', { source: input.source })
  fbqTrack('Contact', { source: input.source })

  void captureGclidAndCookies({
    email: input.email ?? null,
    phone: input.phone ?? null,
  }).catch(() => {
    /* swallow */
  })
}

export function trackCtaClick(input: CtaClickInput): void {
  gtagEvent('cta_click', { cta_label: input.label, section: input.section })
}
