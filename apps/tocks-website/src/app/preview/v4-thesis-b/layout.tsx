/**
 * Tocks v4 — Thesis B (Dark Gallery) layout override.
 *
 * Hides root-layout chrome (Header / Footer / WhatsApp FAB) so the void
 * background is complete and the curated gallery experience is preserved.
 *
 * Carrega Poppins (oficial Tocks) via next/font/local pra body/UI; deixa
 * Big Shoulders Display fallback web-safe pra display headlines.
 * Libre Caslon Text também disponível como acento literário italic.
 */

import type { ReactNode } from 'react'
import localFont from 'next/font/local'

const poppins = localFont({
  src: [
    { path: '../../../../../public/fonts/poppins/Poppins-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../../../../public/fonts/poppins/Poppins-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../../../../public/fonts/poppins/Poppins-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../../../../public/fonts/poppins/Poppins-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-tocks-poppins',
  display: 'swap',
})

const libreCaslon = localFont({
  src: [
    { path: '../../../../../public/fonts/libre-caslon-text/LibreCaslonText-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../../../../../public/fonts/libre-caslon-text/LibreCaslonText-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../../../../public/fonts/libre-caslon-text/LibreCaslonText-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-tocks-caslon',
  display: 'swap',
})

export default function V4ThesisBLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${poppins.variable} ${libreCaslon.variable}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Tocks v4 Thesis B — kill root-layout chrome (header/footer/whatsapp FAB are direct children of body) */
            html, body { background: #0a0a0c !important; }
            body > header,
            body > footer,
            body > a[aria-label*="WhatsApp"] {
              display: none !important;
            }
            /* Neutralize root flex column so the gallery flows as expected */
            body { display: block !important; }
            body > div.flex-1 { display: block !important; }
            /* Wire Poppins as body fallback within thesis B (--font-sans is already set in globals-v4-b.css) */
            [class*="${poppins.variable}"] { font-family: var(--font-tocks-poppins), 'Inter', system-ui, sans-serif; }
          `,
        }}
      />
      {children}
    </div>
  )
}
