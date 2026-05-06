import type { Metadata } from 'next'
import { fontVariables } from '@/lib/fonts'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'
import { Header } from '@/components/organisms/header'
import { Footer } from '@/components/organisms/footer'
import { WhatsAppCTA } from '@/components/molecules/whatsapp-cta'
import { LenisProvider } from '@/components/providers/lenis-provider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Móveis de Autor em Madeira Maciça`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Móveis de Autor em Madeira Maciça`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Móveis de Autor em Madeira Maciça`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--text-primary)]">
        <LenisProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <WhatsAppCTA variant="fab" />
        </LenisProvider>
      </body>
    </html>
  )
}
