'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/animations/scroll-reveal'
import Breadcrumbs from '@/components/shared/breadcrumbs'
import { PRODUCTS } from '@/data/products'
import { getWhatsAppUrlCustom } from '@/data/whatsapp'

type LineFilter = 'todas' | 'criativa' | 'premium'

const FILTERS: { label: string; value: LineFilter }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Linha Criativa', value: 'criativa' },
  { label: 'Linha Premium', value: 'premium' },
]

import { formatPrice } from '@/lib/utils'

export default function ColecaoPage() {
  const [activeFilter, setActiveFilter] = useState<LineFilter>('todas')

  const filtered =
    activeFilter === 'todas'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.line === activeFilter)

  return (
    <>
      {/* Breadcrumbs */}
      <div className="pt-28 px-6 max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: 'Coleção' }]} />
      </div>

      {/* Hero */}
      <section className="relative pt-8 pb-20 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-glow)_0%,transparent_70%)] pointer-events-none" />
        <span className="text-accent text-sm uppercase tracking-[0.3em] mb-6 block relative">
          Mesas de sinuca e bilhar artesanais
        </span>
        <h1 className="font-heading text-5xl md:text-7xl font-semibold text-text-primary mb-4 relative">
          Nossa Coleção
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-xl mx-auto relative">
          14 modelos exclusivos em madeira maciça. Fabricação artesanal em Itajaí-SC.
        </p>
      </section>

      {/* Filter Tabs */}
      <nav className="flex justify-center gap-8 pb-12 px-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`
              relative pb-2 text-sm md:text-base tracking-wide uppercase transition-colors duration-300
              ${
                activeFilter === f.value
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            {f.label}
            <span
              className={`
                absolute bottom-0 left-0 h-px bg-accent transition-all duration-500
                ${activeFilter === f.value ? 'w-full' : 'w-0'}
              `}
            />
          </button>
        ))}
      </nav>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <ScrollReveal
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
          stagger={0.1}
        >
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/colecao/${product.slug}`}
              className="group block"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-bg-secondary border border-border flex items-center justify-center">
                <Image
                  src={product.image}
                  alt={`Mesa de sinuca ${product.name} - Tocks Custom`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-contain p-2 transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-105"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
                  <span className="text-text-primary text-sm uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                    Conhecer
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 space-y-1">
                <h2 className="font-heading text-xl md:text-2xl font-semibold text-text-primary">
                  {product.name}
                </h2>
                <p className="text-sm text-accent">
                  A partir de R$ {formatPrice(product.price)}
                </p>
                <p className="text-sm text-text-secondary hidden md:block">
                  {product.tagline}
                </p>
              </div>
            </Link>
          ))}
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="pb-32 px-6 text-center">
        <ScrollReveal>
          <p className="text-text-secondary text-lg mb-6">
            Não encontrou o modelo ideal? Criamos mesas sob medida.
          </p>
          <a
            href={getWhatsAppUrlCustom('Olá! Vi a coleção no site e gostaria de saber mais sobre personalização.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-whatsapp hover:bg-whatsapp-hover text-white font-medium px-8 py-4 rounded-lg transition-colors duration-300"
          >
            Falar com especialista
          </a>
        </ScrollReveal>
      </section>

    </>
  )
}
