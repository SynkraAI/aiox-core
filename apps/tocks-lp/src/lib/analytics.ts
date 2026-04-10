/* GA4 + Meta Pixel helpers */
/* IDs are injected via env vars at build time */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

export function trackEvent(name: string, params?: Record<string, string | number>): void {
  if (typeof window === 'undefined') return

  /* GA4 */
  if (window.gtag) {
    window.gtag('event', name, params)
  }

  /* Meta Pixel */
  if (window.fbq) {
    window.fbq('track', name, params)
  }
}

export function trackWhatsAppClick(section: string, model?: string): void {
  trackEvent('whatsapp_click', {
    section,
    ...(model ? { model } : {}),
  })
}

export function trackScroll(section: string): void {
  trackEvent('section_view', { section })
}
