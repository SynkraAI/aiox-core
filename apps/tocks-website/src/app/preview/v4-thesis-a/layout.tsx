import type { Metadata } from 'next'
import localFont from 'next/font/local'

/**
 * Thesis A — Editorial Magazine
 * v4-fantastic project, squad Uma (aios-ux).
 *
 * Layout dedicado para a thesis A. Carrega as fontes OFICIAIS Tocks via
 * next/font/local: Libre Caslon Text (display) + Poppins (body/UI).
 * Source dos arquivos TTF: docs/projects/tocks/assets/master-drive/Identidade Visual/Tocks/Fontes/
 *
 * Hide root Header/Footer/Fab via CSS escopado nesta sub-árvore só pra preview.
 */

const libreCaslon = localFont({
  src: [
    { path: '../../../../../public/fonts/libre-caslon-text/LibreCaslonText-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../../../../public/fonts/libre-caslon-text/LibreCaslonText-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../../../../../public/fonts/libre-caslon-text/LibreCaslonText-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-thesis-a-display',
  display: 'swap',
})

const poppins = localFont({
  src: [
    { path: '../../../../../public/fonts/poppins/Poppins-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../../../../public/fonts/poppins/Poppins-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../../../../public/fonts/poppins/Poppins-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../../../../public/fonts/poppins/Poppins-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-thesis-a-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Thesis A — Editorial Magazine | Tocks v4',
  description: 'Preview Thesis A: Tocks como spread editorial de revista de design contemporâneo brasileiro.',
  robots: { index: false, follow: false },
}

export default function ThesisALayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${libreCaslon.variable} ${poppins.variable} thesis-a-shell`}>
      {/* Hide root Header/Footer/Fab inside this preview. Editorial frame requires uncluttered chrome. */}
      <style>{`
        body > header,
        body > footer,
        body > a[aria-label*="WhatsApp"],
        body > a[aria-label*="whatsapp"],
        body > .flex-1 ~ a,
        body > div.flex-1 ~ a {
          display: none !important;
        }
        html, body {
          background-color: #fef7ef !important;
          color: #1a1612 !important;
        }
        body > div.flex-1 {
          background-color: #fef7ef !important;
        }
      `}</style>
      {children}
    </div>
  )
}
