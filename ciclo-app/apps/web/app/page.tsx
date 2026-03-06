import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@ciclo/database'
import { EventCard } from '@ciclo/ui'
import { getSiteContents } from '../lib/site-content'
import { LeadCaptureForm } from '../components/lead-capture-form'

export const revalidate = 300

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ciclodasestações.com.br'

export const metadata: Metadata = {
  title: 'Ciclo das Estações — Jornadas de Autoconhecimento | Base Tríade',
  description:
    'Programa de autocuidado cíclico com Medicina Tradicional Chinesa, Ayurveda e Yoga. Eventos sazonais presenciais em Barra Velha, SC.',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'Ciclo das Estações — Jornadas de Autoconhecimento',
    description:
      'Programa de autocuidado cíclico com Medicina Tradicional Chinesa, Ayurveda e Yoga. Eventos sazonais presenciais em Barra Velha, SC.',
    type: 'website',
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Ciclo das Estações — Base Tríade',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ciclo das Estações — Jornadas de Autoconhecimento',
    description:
      'Programa de autocuidado cíclico com MTC, Ayurveda e Yoga. Eventos sazonais em Barra Velha, SC.',
    images: [`${BASE_URL}/og-default.jpg`],
  },
}

// --- Value proposition defaults ---
const DEFAULT_VALUES = [
  {
    icon: '\uD83C\uDF3F',
    title: 'Reconexão Natural',
    text: 'Práticas ancestrais em harmonia com os ciclos da natureza',
  },
  {
    icon: '\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1',
    title: 'Comunidade',
    text: 'Encontros presenciais com terapeutas e buscadores',
  },
  {
    icon: '\uD83D\uDD2E',
    title: 'Autoconhecimento',
    text: 'Jornada GET137 de 137 dias entre estações',
  },
  {
    icon: '\u2728',
    title: 'Transformação',
    text: 'Medicina Tradicional Chinesa + Ayurveda + Yoga',
  },
] as const

// --- MTC Element map for EventCard ---
const ELEMENT_MAP: Record<string, string> = {
  Wood: 'Madeira',
  Fire: 'Fogo',
  Earth: 'Terra',
  Metal: 'Metal',
  Water: 'Água',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getEventStatus(event: { isSoldOut: boolean; startDate: Date }): 'disponível' | 'esgotado' | 'em-breve' {
  if (event.isSoldOut) return 'esgotado'
  const now = new Date()
  const diffDays = (event.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > 30) return 'em-breve'
  return 'disponível'
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={i < rating ? 'text-amber-400' : 'text-gray-300'}
      aria-hidden="true"
    >
      {'\u2605'}
    </span>
  ))
}

export default async function HomePage() {
  // Parallel data fetching
  const [events, testimonials, siteContents] = await Promise.all([
    prisma.event.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: 'asc' },
      take: 4,
      include: {
        ticketTypes: {
          orderBy: { regularPrice: 'asc' },
          take: 1,
        },
      },
    }),
    prisma.testimonial.findMany({
      where: {
        isApproved: true,
        isFeatured: true,
      },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    getSiteContents([
      'hero_tagline',
      'value_1_title',
      'value_1_text',
      'value_2_title',
      'value_2_text',
      'value_3_title',
      'value_3_text',
      'value_4_title',
      'value_4_text',
      'about_program',
    ]),
  ])

  const heroTagline =
    (siteContents.get('hero_tagline') as string | null) ??
    'Desperte a sabedoria dos ciclos e reconecte-se com sua natureza interior'

  const aboutProgram =
    (siteContents.get('about_program') as string | null) ??
    'O Ciclo das Estações é um programa da Base Tríade que integra Medicina Tradicional Chinesa, Ayurveda e Yoga em jornadas sazonais de autoconhecimento. Cada estação oferece práticas, rituais e encontros presenciais em Barra Velha, SC, guiados por terapeutas experientes. Nosso objetivo e reconectar você com os ciclos naturais, promovendo equilíbrio, saúde e transformação pessoal ao longo do ano.'

  // Build value propositions with possible SiteContent overrides
  const valueProps = DEFAULT_VALUES.map((def, i) => {
    const idx = i + 1
    const title = (siteContents.get(`value_${idx}_title`) as string | null) ?? def.title
    const text = (siteContents.get(`value_${idx}_text`) as string | null) ?? def.text
    return { icon: def.icon, title, text }
  })

  // JSON-LD Organization structured data (AC-5)
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Base Tríade',
    url: BASE_URL,
    logo: `${BASE_URL}/og-default.jpg`,
    sameAs: [
      'https://instagram.com/podprana',
      'https://instagram.com/koch.milenar',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contato@basetriade.com',
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
    },
  }

  return (
    <div className="flex flex-col">
      {/* JSON-LD Organization (AC-5) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-seasonal-primary/30 via-seasonal-secondary/20 to-seasonal-accent/40 transition-seasonal" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Ciclo das Estações
          </h1>
          <p className="mt-4 text-lg text-foreground/80 sm:text-xl">
            Jornadas de autoconhecimento e reconexão com os ciclos da natureza
          </p>
          <p className="mt-3 text-base text-muted-foreground">
            {heroTagline}
          </p>
          <a
            href="#eventos"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-seasonal-primary px-6 py-3 font-medium text-primary-foreground shadow-md transition-colors hover:bg-seasonal-primary/90"
          >
            Conhecer Eventos
          </a>
        </div>
      </section>

      {/* ===== PROXIMOS EVENTOS ===== */}
      <section id="eventos" className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Próximos Eventos
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Jornadas sazonais para reconexão e transformação
          </p>

          {events.length > 0 ? (
            <>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {events.map((event) => {
                  const lowestPrice = event.ticketTypes[0]?.earlyBirdPrice ?? event.ticketTypes[0]?.regularPrice
                  return (
                    <Link key={event.id} href={`/eventos/${event.slug}`}>
                      <EventCard
                        title={event.name}
                        date={formatDate(event.startDate)}
                        element={event.elementMTC ? ELEMENT_MAP[event.elementMTC] ?? event.elementMTC : undefined}
                        status={getEventStatus(event)}
                        priceFrom={lowestPrice ? lowestPrice / 100 : undefined}
                      />
                    </Link>
                  )
                })}
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/eventos"
                  className="inline-flex items-center gap-1 text-sm font-medium text-seasonal-primary underline-offset-4 hover:underline"
                >
                  Ver Todos
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-10 text-center text-muted-foreground">
              Novos eventos em breve!
            </p>
          )}
        </div>
      </section>

      {/* ===== PROPOSTA DE VALOR ===== */}
      <section className="bg-muted/50 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Por que participar?
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-4xl" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FORMULARIO DE INTERESSE ===== */}
      <section id="interesse" className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Manifeste seu Interesse
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Receba novidades sobre os próximos eventos e jornadas
          </p>
          <div className="mt-10">
            <Suspense fallback={<div className="mx-auto h-64 max-w-md animate-pulse rounded-lg bg-muted" />}>
              <LeadCaptureForm />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ===== DEPOIMENTOS ===== */}
      <section className="bg-muted/50 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Depoimentos
          </h2>

          {testimonials.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-1" aria-label={`${testimonial.rating} de 5 estrelas`}>
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="mt-3 text-sm text-foreground leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    {testimonial.user.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-muted-foreground">
              Depoimentos em breve — participe de um evento!
            </p>
          )}
        </div>
      </section>

      {/* ===== SOBRE O PROGRAMA ===== */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Sobre o Programa
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            {aboutProgram}
          </p>
        </div>
      </section>

      {/* ===== FOOTER SECTION (facilitators + links) ===== */}
      <section className="border-t border-border bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Facilitadoras */}
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                Facilitadoras
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://instagram.com/podprana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    Daniela Lopper — @podprana
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/koch.milenar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    Milena Koch — @koch.milenar
                  </a>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                Contato
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="mailto:contato@basetriade.com"
                    className="hover:text-foreground"
                  >
                    contato@basetriade.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                Legal
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacidade" className="hover:text-foreground">
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
