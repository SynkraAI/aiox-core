import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@ciclo/database'
import { EventCard, SacredDivider, Triskle } from '@ciclo/ui'
import { getSiteContents } from '../lib/site-content'
import { LeadCaptureForm } from '../components/lead-capture-form'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ciclodaseestacoes.com.br'

export const metadata: Metadata = {
  title: 'Ciclo das Estações — Jornadas de Autoconhecimento | Base Tríade',
  description:
    'Programa de autocuidado cíclico com Medicina Tradicional Chinesa, Ayurveda e Yoga. Eventos sazonais presenciais em Barra Velha, SC.',
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'Ciclo das Estações — Jornadas de Autoconhecimento',
    description:
      'Programa de autocuidado cíclico com MTC, Ayurveda e Yoga. Eventos sazonais em Barra Velha, SC.',
    type: 'website',
    url: BASE_URL,
    images: [{ url: `${BASE_URL}/og-default.svg`, width: 1200, height: 630, alt: 'Ciclo das Estações' }],
  },
}

const SEASONS_MANDALA = [
  { slug: 'primavera', name: 'Primavera', element: 'Madeira', organ: 'Fígado', emoji: '\uD83C\uDF31', color: '#90EE90', nextEvent: 'Equinócio Set 2026', cssClass: 'primavera' },
  { slug: 'verao', name: 'Verão', element: 'Fogo', organ: 'Coração', emoji: '\u2600\uFE0F', color: '#FFD700', nextEvent: 'Solstício Dez 2026', cssClass: 'verao' },
  { slug: 'outono', name: 'Outono', element: 'Metal', organ: 'Pulmão', emoji: '\uD83C\uDF42', color: '#D2691E', nextEvent: 'Equinócio Mar 2026', cssClass: 'outono' },
  { slug: 'inverno', name: 'Inverno', element: 'Água', organ: 'Rins', emoji: '\u2744\uFE0F', color: '#4682B4', nextEvent: 'Solstício Jun 2026', cssClass: 'inverno' },
] as const

const DEFAULT_VALUES = [
  { icon: '\uD83C\uDF3F', title: 'Autocuidado Cíclico', text: 'Práticas ancestrais em harmonia com os ciclos da natureza' },
  { icon: '\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1', title: 'Comunidade de Terapeutas', text: 'Encontros presenciais com terapeutas e buscadores' },
  { icon: '\uD83C\uDF3E', title: 'Reconexão com a Natureza', text: 'Jornada GET137 de 137 dias entre estações' },
] as const

const ELEMENT_MAP: Record<string, string> = {
  Wood: 'Madeira', Fire: 'Fogo', Earth: 'Terra', Metal: 'Metal', Water: 'Água',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function getEventStatus(event: { isSoldOut: boolean; startDate: Date }): 'disponivel' | 'esgotado' | 'em-breve' {
  if (event.isSoldOut) return 'esgotado'
  const diffDays = (event.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (diffDays > 30) return 'em-breve'
  return 'disponivel'
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-base-gold' : 'text-base-cream'} aria-hidden="true">{'\u2605'}</span>
  ))
}

export default async function HomePage() {
  const [events, testimonials, siteContents] = await Promise.all([
    prisma.event.findMany({
      where: { isPublished: true, isDeleted: false, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 4,
      include: { ticketTypes: { orderBy: { regularPrice: 'asc' }, take: 1 } },
    }),
    prisma.testimonial.findMany({
      where: { isApproved: true, isFeatured: true },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    getSiteContents([
      'hero_tagline', 'value_1_title', 'value_1_text', 'value_2_title', 'value_2_text',
      'value_3_title', 'value_3_text', 'about_program',
    ]),
  ])

  const heroTagline = (siteContents.get('hero_tagline') as string | null) ?? 'O programa de autocuidado cíclico da Base Tríade'
  const aboutProgram = (siteContents.get('about_program') as string | null) ?? 'O Ciclo das Estações é um programa da Base Tríade que integra Medicina Tradicional Chinesa, Ayurveda e Yoga em jornadas sazonais de autoconhecimento.'

  const valueProps = DEFAULT_VALUES.map((def, i) => {
    const idx = i + 1
    return {
      icon: def.icon,
      title: (siteContents.get(`value_${idx}_title`) as string | null) ?? def.title,
      text: (siteContents.get(`value_${idx}_text`) as string | null) ?? def.text,
    }
  })

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Base Tríade',
    url: BASE_URL,
    logo: `${BASE_URL}/og-default.svg`,
    sameAs: ['https://instagram.com/podprana', 'https://instagram.com/koch.milenar'],
    contactPoint: { '@type': 'ContactPoint', email: 'contato@basetriade.com', contactType: 'customer service', availableLanguage: 'Portuguese' },
  }

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      {/* ===== HERO — Terroso Base Tríade ===== */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-background px-4 py-24 text-center">
        {/* Conteúdo hero */}
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl" style={{ letterSpacing: '-0.02em' }}>
            Ciclo das Estações
          </h1>
          <p className="mt-3 text-lg text-muted-foreground sm:text-xl">
            {heroTagline}
          </p>
        </div>

        {/* Mandala das 4 Estações — Navegação Central */}
        <nav className="relative z-10 mt-12 w-full max-w-[800px] px-4" aria-label="Mandala de navegação das 4 Estações">
          <h2 className="sr-only">Mandala de navegação das 4 Estações</h2>
          <div className="seasons-mandala">
            {SEASONS_MANDALA.map((season) => (
              <Link
                key={season.slug}
                href={`/eventos?season=${season.slug}`}
                className={`season-card ${season.cssClass}`}
                aria-label={`Estação ${season.name} — Elemento ${season.element}, Órgão ${season.organ}, próximo evento: ${season.nextEvent}`}
              >
                <span className="text-4xl" aria-hidden="true">{season.emoji}</span>
                <span className="mt-3 font-heading text-base font-semibold text-foreground">{season.name}</span>
                <span className="mt-1 text-xs text-muted-foreground">{season.element} / {season.organ}</span>
                <span className="mt-2 text-xs text-[#8B4513]">{season.nextEvent}</span>
              </Link>
            ))}
            {/* Centro: Triskle */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
              <div style={{ animation: 'watermark-rotate 137s linear infinite' }}>
                <Triskle size={56} color="#8B4513" className="opacity-60" />
              </div>
            </div>
          </div>
        </nav>

        {/* CTA */}
        <div className="relative z-10 mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#eventos"
            className="inline-flex items-center gap-2 rounded-lg bg-[#D2691E] px-8 py-3.5 font-medium text-white shadow-sm transition-all hover:brightness-90"
          >
            Conhecer Eventos
          </a>
          <a
            href="#interesse"
            className="inline-flex items-center gap-2 rounded-lg border border-[#d4a574] px-8 py-3.5 font-medium text-foreground transition-all hover:bg-[#d4a574]/10"
          >
            Manifeste Interesse
          </a>
        </div>
      </section>

      <SacredDivider variant="line" />

      {/* ===== PROPOSTA DE VALOR ===== */}
      <section className="bg-background px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-bold sm:text-4xl" style={{ color: '#8B4513' }}>
            Por que participar?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {valueProps.map((item) => (
              <div
                key={item.title}
                className="card-seasonal flex flex-col items-center p-6 text-center"
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

      <SacredDivider variant="sacred" />

      {/* ===== PRÓXIMOS EVENTOS ===== */}
      <section id="eventos" className="bg-background px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-bold sm:text-4xl" style={{ color: '#8B4513' }}>
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
                <Link href="/eventos" className="inline-flex items-center gap-1 text-sm font-medium text-[#8B4513] underline-offset-4 hover:text-foreground hover:underline">
                  Ver Todos os Eventos
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-10 text-center text-muted-foreground">Novos eventos em breve!</p>
          )}
        </div>
      </section>

      <SacredDivider variant="sacred" />

      {/* ===== DEPOIMENTOS ===== */}
      <section className="bg-background px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-bold sm:text-4xl" style={{ color: '#8B4513' }}>
            Depoimentos
          </h2>

          {testimonials.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="card-seasonal p-6"
                >
                  <div className="flex items-center gap-1" aria-label={`${testimonial.rating} de 5 estrelas`}>
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="mt-3 text-sm italic leading-relaxed text-foreground">
                    <span className="text-[#d4a574]" aria-hidden="true">&ldquo;</span>
                    {testimonial.text}
                    <span className="text-[#d4a574]" aria-hidden="true">&rdquo;</span>
                  </p>
                  <p className="mt-4 text-sm font-medium text-[#8B4513]">
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

      <SacredDivider variant="line" />

      {/* ===== FORMULÁRIO DE INTERESSE ===== */}
      <section id="interesse" className="bg-background px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-bold sm:text-4xl" style={{ color: '#2d1810' }}>
            Receba o Chamado das Estações
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Receba novidades sobre os próximos eventos e jornadas
          </p>
          <div className="mt-10">
            <Suspense fallback={<div className="mx-auto h-64 max-w-md animate-pulse rounded-xl border border-[#e8ddd0] bg-white" />}>
              <LeadCaptureForm />
            </Suspense>
          </div>
        </div>
      </section>

      <SacredDivider variant="sacred" />

      {/* ===== SOBRE O PROGRAMA ===== */}
      <section className="bg-background px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl" style={{ color: '#8B4513' }}>
            Sobre o Programa
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground" style={{ maxWidth: '720px', margin: '1.5rem auto 0' }}>
            {aboutProgram}
          </p>
        </div>
      </section>

      {/* ===== FOOTER SECTION — Links adicionais ===== */}
      <section className="border-t border-[#e8ddd0] bg-background px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                Facilitadoras
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://instagram.com/podprana" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B4513] transition-colors">
                    Daniela Lopper — @podprana
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com/koch.milenar" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B4513] transition-colors">
                    Milena Koch — @koch.milenar
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                Contato
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:contato@basetriade.com" className="hover:text-[#8B4513] transition-colors">
                    contato@basetriade.com
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                Legal
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacidade" className="hover:text-[#8B4513] transition-colors">
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
