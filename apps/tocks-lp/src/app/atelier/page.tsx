'use client'

import Image from 'next/image'
import ScrollReveal from '@/components/animations/scroll-reveal'
import Counter from '@/components/animations/counter'
import Button from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import { COMPANY } from '@/data/company'
import { getWhatsAppUrlCustom } from '@/data/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'

const MILESTONES = [
  {
    year: '1988',
    title: 'Milton funda a Tocks, alugando mesas para bares',
  },
  {
    year: '1999',
    title: 'Transicao para venda direta de mesas',
  },
  {
    year: '2015',
    title: 'Nova geracao moderniza as operacoes',
  },
  {
    year: '2026',
    title: '14 modelos, +250 mesas entregues em todo Brasil',
  },
] as const

const VALUES = [
  {
    title: 'Tradicao',
    description: '38 anos de marcenaria transmitidos de pai para filho. Cada tecnica carrega a historia da nossa familia.',
    icon: 'tree',
  },
  {
    title: 'Artesanato',
    description: 'Cada mesa e unica. Trabalhamos a madeira macica com as maos, respeitando cada veio e cada no.',
    icon: 'hand',
  },
  {
    title: 'Personalizacao',
    description: 'Voce escolhe cada detalhe: madeira, acabamento, cor do pano, dimensoes. Sua mesa, do seu jeito.',
    icon: 'palette',
  },
] as const

export default function AtelierPage() {
  return (
    <>
      {/* Hero — 100vh */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-glow)_0%,transparent_70%)] pointer-events-none" />

        <span className="text-[var(--color-accent)] text-sm uppercase tracking-[0.3em] mb-6 relative">
          Desde {COMPANY.foundingYear}
        </span>
        <h1 className="font-[family-name:var(--font-heading)] text-6xl md:text-7xl lg:text-[5.5rem] font-semibold text-[var(--color-text-primary)] leading-[0.95] relative">
          Nosso Atelier
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[var(--color-text-secondary)] max-w-md relative">
          Desde 1988, Itajai — Santa Catarina
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-px h-16 overflow-hidden">
          <div className="w-full h-full bg-[var(--color-accent)] animate-[scroll-pulse_2s_ease-in-out_infinite]" />
        </div>
      </section>

      {/* Origin Story — split layout */}
      <section className="py-32 md:py-48 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Text */}
          <ScrollReveal>
            <div>
              <span className="text-[var(--color-accent)] text-sm uppercase tracking-[0.2em]">
                A Origem
              </span>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--color-text-primary)] mt-4 leading-tight">
                Uma historia escrita em madeira
              </h2>
              <div className="mt-8 space-y-6 text-[var(--color-text-secondary)] text-base md:text-lg leading-relaxed">
                <p>
                  Em 1988, Milton de Cerqueira fundou a Tocks em Itajai, Santa Catarina.
                  O oficio veio do pai, Martinho — um marceneiro respeitado na regiao, que
                  ensinou Milton a ouvir a madeira antes de trabalha-la.
                </p>
                <p>
                  O que comecou como um pequeno negocio de aluguel de mesas para bares e
                  saloes, evoluiu para uma fabrica artesanal que hoje entrega mesas de
                  bilhar sob medida para todo o Brasil.
                </p>
                <p>
                  Cada mesa que sai do nosso atelier carrega a heranca de Martinho, a visao
                  de Milton, e o compromisso de uma familia que ha quase quatro decadas
                  transforma troncos em obras que duram geracoes.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Image placeholder */}
          <ScrollReveal delay={0.2}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src="/images/products/banner-desktop.png"
                alt="Atelier Tocks Custom"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)]/60 to-transparent" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-16 border-y border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <Counter end={38} suffix=" anos" className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-semibold text-[var(--color-accent)]" />
            <p className="text-[var(--color-text-secondary)] text-sm mt-2">de tradicao</p>
          </div>
          <div>
            <Counter end={250} prefix="+" className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-semibold text-[var(--color-accent)]" />
            <p className="text-[var(--color-text-secondary)] text-sm mt-2">mesas entregues</p>
          </div>
          <div>
            <Counter end={14} className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-semibold text-[var(--color-accent)]" />
            <p className="text-[var(--color-text-secondary)] text-sm mt-2">modelos exclusivos</p>
          </div>
          <div>
            <Counter end={12} className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-semibold text-[var(--color-accent)]" />
            <p className="text-[var(--color-text-secondary)] text-sm mt-2">camadas de verniz</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 md:py-48 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[var(--color-accent)] text-sm uppercase tracking-[0.2em]">
              Nossa Trajetoria
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--color-text-primary)] mt-4">
              Marcos que nos definem
            </h2>
          </div>

          <ScrollReveal className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12" stagger={0.2}>
            {MILESTONES.map((m) => (
              <div key={m.year} className="text-center md:text-left">
                <span className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-semibold text-[var(--color-accent)] block">
                  {m.year}
                </span>
                <div className="w-8 h-px bg-[var(--color-accent)]/40 my-4 mx-auto md:mx-0" />
                <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed">
                  {m.title}
                </p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 md:py-48 px-6 bg-[var(--color-bg-secondary)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[var(--color-accent)] text-sm uppercase tracking-[0.2em]">
              Nossos Valores
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--color-text-primary)] mt-4">
              O que nos move
            </h2>
          </div>

          <ScrollReveal className="grid md:grid-cols-3 gap-8 md:gap-12" stagger={0.15}>
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-8 md:p-10 text-center"
              >
                <div className="w-14 h-14 rounded-full border border-[var(--color-accent)]/30 flex items-center justify-center mx-auto mb-6 text-[var(--color-accent)]">
                  <Icon name={v.icon} size={24} />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-text-primary)]">
                  {v.title}
                </h3>
                <p className="mt-4 text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* CTA — Visit the Atelier */}
      <section className="py-32 md:py-48 px-6 text-center">
        <ScrollReveal>
          <div>
            <span className="text-[var(--color-accent)] text-sm uppercase tracking-[0.2em]">
              Venha nos visitar
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--color-text-primary)] mt-4">
              Visite Nosso Atelier
            </h2>
            <p className="mt-6 text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
              {COMPANY.address.street} — {COMPANY.address.city}, {COMPANY.address.state}
            </p>
            <p className="mt-2 text-[var(--color-text-secondary)] text-sm">
              Segunda a Sexta, 8h as 18h
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="whatsapp"
                size="lg"
                href={getWhatsAppUrlCustom('Ola! Gostaria de agendar uma visita ao atelier da Tocks.')}
                onClick={() => trackWhatsAppClick('atelier-cta')}
              >
                <Icon name="whatsapp" size={20} />
                Agendar visita
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="https://www.google.com/maps/search/?api=1&query=Tocks+Custom+Itajai+SC"
              >
                <Icon name="map" size={20} />
                Ver no mapa
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </>
  )
}
