/**
 * Pagina publica do evento — Server Component (SSR/ISR)
 * Story E2.5 — AC-1 a AC-12
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPublicEvent } from '@/events'
import { calculatePricing, centavosToReais } from '@ciclo/utils'
import { CancellationPolicyDisplay } from './cancellation-policy-display'
import { Badge, SeasonalBadge } from '@ciclo/ui'

// ISR: revalida a cada 60 segundos (AC-12, preco dinâmico)
export const revalidate = 60

// ---------------------------------------------------------------------------
// Season mapping: Prisma enum -> CSS data-season attribute (Portuguese)
// ---------------------------------------------------------------------------
const SEASON_MAP: Record<string, string> = {
  SPRING: 'primavera',
  SUMMER: 'verao',
  AUTUMN: 'outono',
  WINTER: 'inverno',
  CROSS_QUARTER: 'primavera',
} as const

const SEASON_LABEL: Record<string, string> = {
  SPRING: 'Primavera',
  SUMMER: 'Verão',
  AUTUMN: 'Outono',
  WINTER: 'Inverno',
  CROSS_QUARTER: 'Entressafra',
} as const

const ELEMENT_ICONS: Record<string, string> = {
  Madeira: '\u6728',
  Fogo: '\u706B',
  Metal: '\u91D1',
  Água: '\u6C34',
  Terra: '\u571F',
} as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDateRange(start: Date, end: Date): string {
  const s = new Date(start)
  const e = new Date(end)
  const months = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  if (
    s.getMonth() === e.getMonth() &&
    s.getFullYear() === e.getFullYear()
  ) {
    return `${s.getDate()}-${e.getDate()} de ${months[s.getMonth()]}, ${s.getFullYear()}`
  }
  return `${s.getDate()} de ${months[s.getMonth()]} - ${e.getDate()} de ${months[e.getMonth()]}, ${e.getFullYear()}`
}

function formatTime(date: Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

// ---------------------------------------------------------------------------
// Metadata (AC-11)
// ---------------------------------------------------------------------------
interface PageProps {
  params: Promise<{ slug: string }>
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ciclodasestações.com.br'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getPublicEvent(slug)
  if (!event) return { title: 'Evento não encontrado' }

  const description = event.subtitle ?? event.description?.slice(0, 160) ?? undefined
  const ogImage = event.images[0]?.url ?? `${BASE_URL}/og-default.jpg`
  const eventUrl = `${BASE_URL}/eventos/${slug}`

  return {
    title: event.name,
    description,
    alternates: {
      canonical: eventUrl,
    },
    openGraph: {
      title: event.name,
      description,
      type: 'article',
      url: eventUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: event.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description,
      images: [ogImage],
    },
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default async function EventPage({ params }: PageProps) {
  const { slug } = await params
  const event = await getPublicEvent(slug)
  if (!event) notFound()

  const seasonCss = SEASON_MAP[event.season] ?? 'primavera'
  const seasonLabel = SEASON_LABEL[event.season] ?? event.season
  const heroImage = event.images[0]
  const now = new Date()

  // Build JSON-LD structured data (AC-4, AC-11)
  const eventUrl = `${BASE_URL}/eventos/${event.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    url: eventUrl,
    description: event.subtitle ?? event.description?.slice(0, 300),
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(event.venue
      ? {
          location: {
            '@type': 'Place',
            name: event.venue,
          },
        }
      : {}),
    ...(heroImage ? { image: heroImage.url } : {}),
    organizer: {
      '@type': 'Organization',
      name: 'Base Tríade',
      url: BASE_URL,
    },
    offers: event.ticketTypes.map((t) => {
      const { price } = calculatePricing(
        {
          earlyBirdPrice: t.earlyBirdPrice,
          earlyBirdDeadline: t.earlyBirdDeadline,
          regularPrice: t.regularPrice,
          lastMinutePrice: t.lastMinutePrice,
          lastMinuteStart: t.lastMinuteStart,
        },
        now,
      )
      const isSoldOut =
        t.quantityAvailable !== null && t.quantitySold >= t.quantityAvailable
      return {
        '@type': 'Offer',
        name: t.name,
        price: (price / 100).toFixed(2),
        priceCurrency: 'BRL',
        availability: isSoldOut
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
        url: `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/inscrição/${event.slug}?ticket=${t.id}`,
      }
    }),
  }

  return (
    <div data-season={seasonCss} className="transition-seasonal">
      {/* JSON-LD (AC-11) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ============================================================ */}
      {/* HERO (AC-2) */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-seasonal-primary/20 to-background">
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage.url}
              alt={heroImage.alt ?? event.name}
              fill
              className="object-cover opacity-30"
              priority
              sizes="100vw"
            />
          </div>
        )}
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <SeasonalBadge variant="filled">{seasonLabel}</SeasonalBadge>
            {event.elementMTC && (
              <SeasonalBadge variant="outline">
                {ELEMENT_ICONS[event.elementMTC] ?? ''} {event.elementMTC}
              </SeasonalBadge>
            )}
            {event.astronomicalEvent && (
              <SeasonalBadge variant="soft">
                {event.astronomicalEvent.replace(/_/g, ' ')}
              </SeasonalBadge>
            )}
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-5xl">
            {event.name}
          </h1>
          {event.subtitle && (
            <p className="mt-3 text-lg text-muted-foreground sm:text-xl">
              {event.subtitle}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{formatDateRange(event.startDate, event.endDate)}</span>
            {event.venue && (
              <>
                <span aria-hidden="true">|</span>
                <span>{event.venue}</span>
              </>
            )}
            {event.capacity && (
              <>
                <span aria-hidden="true">|</span>
                <span>{event.capacity} vagas</span>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-24">
        {/* ============================================================ */}
        {/* DESCRICAO (AC-3) */}
        {/* ============================================================ */}
        {event.description && (
          <section className="mt-12" aria-labelledby="descrição-heading">
            <h2 id="descrição-heading" className="font-heading text-2xl font-semibold text-foreground">
              Sobre o Evento
            </h2>
            <div
              className="prose prose-neutral mt-4 max-w-none text-foreground/90"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </section>
        )}

        {/* ============================================================ */}
        {/* PRATICAS INCLUIDAS (AC-4) */}
        {/* ============================================================ */}
        {event.includedPractices.length > 0 && (
          <section className="mt-12" aria-labelledby="práticas-heading">
            <h2 id="práticas-heading" className="font-heading text-2xl font-semibold text-foreground">
              Práticas Incluídas
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {event.includedPractices.map((practice) => (
                <Badge key={practice} variant="secondary" className="text-sm">
                  {practice}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* CRONOGRAMA (AC-5) */}
        {/* ============================================================ */}
        {event.activities.length > 0 && (
          <section className="mt-12" aria-labelledby="cronograma-heading">
            <h2 id="cronograma-heading" className="font-heading text-2xl font-semibold text-foreground">
              Cronograma
            </h2>
            <div className="mt-6 space-y-4">
              {event.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex w-16 flex-shrink-0 flex-col items-center">
                    <span className="text-lg font-semibold text-seasonal-primary">
                      {formatTime(activity.time)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {activity.durationMinutes}min
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground">
                      {activity.title}
                    </h3>
                    {activity.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    )}
                    {activity.facilitator && (
                      <div className="mt-2 flex items-center gap-2">
                        {activity.facilitator.photoUrl ? (
                          <Image
                            src={activity.facilitator.photoUrl}
                            alt={activity.facilitator.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-seasonal-accent text-xs font-semibold">
                            {activity.facilitator.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {activity.facilitator.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* FACILITADORES (AC-6) */}
        {/* ============================================================ */}
        {event.eventFacilitators.length > 0 && (
          <section className="mt-12" aria-labelledby="facilitadores-heading">
            <h2 id="facilitadores-heading" className="font-heading text-2xl font-semibold text-foreground">
              Facilitadores
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {event.eventFacilitators.map(({ facilitator }) => (
                <div
                  key={facilitator.id}
                  className="flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center"
                >
                  {facilitator.photoUrl ? (
                    <Image
                      src={facilitator.photoUrl}
                      alt={facilitator.name}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-full border-[3px] border-seasonal-primary/40 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-seasonal-primary/40 bg-seasonal-accent text-2xl font-semibold text-foreground">
                      {facilitator.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                  )}
                  <h3 className="mt-3 font-heading text-base font-semibold text-card-foreground">
                    {facilitator.name}
                  </h3>
                  {facilitator.role && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {facilitator.role}
                    </p>
                  )}
                  {facilitator.bio && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {truncate(facilitator.bio, 200)}
                    </p>
                  )}
                  {facilitator.specialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {facilitator.specialties.map((s) => (
                        <span
                          key={s}
                          className="inline-flex rounded-full bg-seasonal-primary/15 px-2 py-0.5 text-xs font-medium text-seasonal-primary"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* INGRESSOS (AC-7) */}
        {/* ============================================================ */}
        {event.ticketTypes.length > 0 && (
          <section id="ingressos" className="mt-12 scroll-mt-24" aria-labelledby="ingressos-heading">
            <h2 id="ingressos-heading" className="font-heading text-2xl font-semibold text-foreground">
              Ingressos
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {event.ticketTypes.map((ticket) => {
                const { price, tier } = calculatePricing(
                  {
                    earlyBirdPrice: ticket.earlyBirdPrice,
                    earlyBirdDeadline: ticket.earlyBirdDeadline,
                    regularPrice: ticket.regularPrice,
                    lastMinutePrice: ticket.lastMinutePrice,
                    lastMinuteStart: ticket.lastMinuteStart,
                  },
                  now,
                )
                const isSoldOut =
                  ticket.quantityAvailable !== null &&
                  ticket.quantitySold >= ticket.quantityAvailable

                return (
                  <div
                    key={ticket.id}
                    className="flex flex-col rounded-lg border border-border bg-card p-6"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-heading text-lg font-semibold text-card-foreground">
                        {ticket.name}
                      </h3>
                      {tier === 'early_bird' && (
                        <Badge variant="secondary" className="text-xs">
                          Early Bird
                        </Badge>
                      )}
                      {tier === 'last_minute' && (
                        <Badge variant="destructive" className="text-xs">
                          Última Hora
                        </Badge>
                      )}
                    </div>
                    {ticket.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {ticket.description}
                      </p>
                    )}
                    {ticket.includes.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {ticket.includes.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-0.5 text-seasonal-primary" aria-hidden="true">
                              *
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto pt-4">
                      <p className="text-2xl font-bold text-foreground">
                        {centavosToReais(price)}
                      </p>
                      {isSoldOut || event.isSoldOut ? (
                        <span className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
                          Esgotado
                        </span>
                      ) : (
                        <Link
                          href={`/inscrição/${event.slug}?ticket=${ticket.id}`}
                          className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-seasonal-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-seasonal-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          Inscrever-se
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* FAQ (AC-8) */}
        {/* ============================================================ */}
        {event.faqs.length > 0 && (
          <section className="mt-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="font-heading text-2xl font-semibold text-foreground">
              Perguntas Frequentes
            </h2>
            <div className="mt-6 space-y-2">
              {event.faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group rounded-lg border border-border bg-card"
                >
                  <summary className="cursor-pointer px-4 py-3 font-semibold text-card-foreground hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between">
                      {faq.question}
                      <span
                        className="ml-2 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        &#9660;
                      </span>
                    </span>
                  </summary>
                  <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* POLITICA DE CANCELAMENTO (AC-4: exibido na página publica) */}
        {/* ============================================================ */}
        <CancellationPolicyDisplay eventId={event.id} eventPolicy={event.cancellationPolicy} />
      </div>

      {/* ============================================================ */}
      {/* MOBILE STICKY CTA (AC-10) */}
      {/* ============================================================ */}
      {!event.isSoldOut && event.ticketTypes.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-3 md:hidden">
          <a
            href="#ingressos"
            className="flex w-full items-center justify-center rounded-md bg-seasonal-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-seasonal-primary/90"
          >
            Inscrever-se
          </a>
        </div>
      )}
    </div>
  )
}
