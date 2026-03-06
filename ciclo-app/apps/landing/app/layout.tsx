import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { BaseTriadeFooter, BaseTriadeWatermark } from '@ciclo/ui'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ciclo das Estações | Autocuidado Ciclico para Terapeutas',
  description:
    'O primeiro programa de autocuidado cíclico do Brasil. Eventos sazonais, comunidade e jornada de transformação para terapeutas holísticos.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Ciclo das Estações',
  },
}

export const viewport: Viewport = {
  themeColor: '#2d1810',
  width: 'device-width',
  initialScale: 1,
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`} data-season="primavera">
      <body className="flex min-h-screen flex-col">
        <BaseTriadeWatermark />
        <main className="relative z-10 flex-1">{children}</main>
        <BaseTriadeFooter className="relative z-10" />
      </body>
    </html>
  )
}
