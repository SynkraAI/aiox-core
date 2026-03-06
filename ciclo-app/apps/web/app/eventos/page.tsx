import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedEvents } from '@/events'
import { calculatePricing } from '@ciclo/utils'
import { EventCard } from '@ciclo/ui'

export const revalidate = 60

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ciclodasestações.com.br'

export const metadata: Metadata = {
  title: 'Eventos — Jornadas Sazonais de Autoconhecimento',
  description:
    'Confira todos os eventos do Ciclo das Estações. Jornadas presenciais com Medicina Tradicional Chinesa, Ayurveda e Yoga em Barra Velha, SC.',
  alternates: {
    canonical: `${BASE_URL}/eventos`,
  },
  openGraph: {
    title: 'Eventos — Ciclo das Estações',
    description:
      'Jornadas sazonais de autoconhecimento. Eventos presenciais com MTC, Ayurveda e Yoga em Barra Velha, SC.',
    type: 'website',
    url: `${BASE_URL}/eventos`,
    images: [
      {
        url: `${BASE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Eventos — Ciclo das Estações',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventos — Ciclo das Estações',
    description:
      'Jornadas sazonais de autoconhecimento com MTC, Ayurveda e Yoga.',
    images: [`${BASE_URL}/og-default.jpg`],
  },
}

const ELEMENT_MAP: Record<string, string> = {
  Wood: 'Madeira',
  Fire: 'Fogo',
  Earth: 'Terra',
  Metal: 'Metal',
  Water: 'Água',
} as const

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getEventStatus(event: {
  isSoldOut: boolean
  startDate: Date
}): 'disponível' | 'esgotado' | 'em-breve' {
  if (event.isSoldOut) return 'esgotado'
  const now = new Date()
  const diffDays =
    (event.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > 30) return 'em-breve'
  return 'disponível'
}

export default async function EventosPage() {
  const events = await getPublishedEvents()
  const now = new Date()
  const upcomingEvents = events.filter((e) => e.startDate >= now)
  const pastEvents = events.filter((e) => e.startDate < now)

  return (
    <div className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Eventos
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Jornadas sazonais de autoconhecimento e reconexão
        </p>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Próximos Eventos
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => {
                let lowestPrice: number | undefined
                for (const t of event.ticketTypes) {
                  const { price } = calculatePricing(t, now)
                  if (lowestPrice === undefined || price < lowestPrice) {
                    lowestPrice = price
                  }
                }
                return (
                  <Link key={event.id} href={`/eventos/${event.slug}`}>
                    <EventCard
                      title={event.name}
                      date={formatDate(event.startDate)}
                      element={
                        event.elementMTC
                          ? (ELEMENT_MAP[event.elementMTC] ?? event.elementMTC)
                          : undefined
                      }
                      status={getEventStatus(event)}
                      priceFrom={lowestPrice !== undefined ? lowestPrice / 100 : undefined}
                      imageUrl={event.images[0]?.url}
                    />
                  </Link>
                )
              })}
            </div>
          </section>
        ) : (
          <p className="mt-12 text-center text-muted-foreground">
            Novos eventos em breve! Cadastre seu interesse na{' '}
            <Link
              href="/#interesse"
              className="text-seasonal-primary underline"
            >
              página principal
            </Link>
            .
          </p>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section className="mt-16">
            <h2 className="font-heading text-xl font-semibold text-muted-foreground">
              Eventos Anteriores
            </h2>
            <div className="mt-6 grid gap-6 opacity-60 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <Link key={event.id} href={`/eventos/${event.slug}`}>
                  <EventCard
                    title={event.name}
                    date={formatDate(event.startDate)}
                    element={
                      event.elementMTC
                        ? (ELEMENT_MAP[event.elementMTC] ?? event.elementMTC)
                        : undefined
                    }
                    status="esgotado"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
