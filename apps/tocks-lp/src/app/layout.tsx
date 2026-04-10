import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'

import ClientShell from '@/components/layout/client-shell'
import AnalyticsScripts from '@/components/shared/analytics-scripts'
import CookieConsent from '@/components/shared/cookie-consent'
import Footer from '@/components/sections/footer'
import WhatsAppFab from '@/components/sections/whatsapp-fab'
import JsonLd from '@/components/seo/json-ld'
import '@/app/globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const SITE_URL = 'https://tockscustom.com.br'
const SITE_TITLE = 'Tocks Custom | Mesas de Sinuca e Bilhar Artesanais em Madeira Maciça'
const SITE_DESCRIPTION =
  'Mesas de bilhar artesanais em madeira maciça. Design exclusivo, produção sob medida e entrega em todo o Brasil. De R$10.990 a R$26.900.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  themeColor: '#1C1C1A',
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords:
    'mesa de bilhar, sinuca, bilhar artesanal, mesa premium, Tocks Custom, mesa de sinuca, mesa sob medida, madeira maciça',
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'Tocks Custom',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <JsonLd />
      </head>
      <body>
        <ClientShell>
          <main>{children}</main>
        </ClientShell>
        <Footer />
        <WhatsAppFab />
        <AnalyticsScripts />
        <CookieConsent />
      </body>
    </html>
  )
}
