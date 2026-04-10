'use client'

import { useState } from 'react'
import Image from 'next/image'
import ScrollReveal from '@/components/animations/scroll-reveal'
import Breadcrumbs from '@/components/shared/breadcrumbs'
import Lightbox from '@/components/shared/lightbox'
import Button from '@/components/ui/button'
import { PRODUCTS } from '@/data/products'
import { TESTIMONIALS } from '@/data/testimonials'
import { getWhatsAppUrlCustom } from '@/data/whatsapp'

interface ProjectCard {
  id: string
  image: string
  model: string
  location: string
  span: 'tall' | 'wide' | 'normal'
}

function findProductImage(slug: string): string {
  return PRODUCTS.find((p) => p.slug === slug)?.image ?? '/images/products/banner-desktop.png'
}

const PROJECTS: ProjectCard[] = [
  {
    id: 'proj-1',
    image: findProductImage('curve'),
    model: 'Curve',
    location: 'Residência em Balneário Camboriú, SC',
    span: 'tall',
  },
  {
    id: 'proj-2',
    image: findProductImage('harley'),
    model: 'Harley',
    location: 'Apartamento em São Paulo, SP',
    span: 'wide',
  },
  {
    id: 'proj-3',
    image: findProductImage('gabe'),
    model: 'Gabe',
    location: 'Casa em Curitiba, PR',
    span: 'normal',
  },
  {
    id: 'proj-4',
    image: findProductImage('elipse'),
    model: 'Elipse',
    location: 'Residência em Brasília, DF',
    span: 'tall',
  },
  {
    id: 'proj-5',
    image: findProductImage('monaco'),
    model: 'Mônaco',
    location: 'Casa de Praia em Florianópolis, SC',
    span: 'wide',
  },
  {
    id: 'proj-6',
    image: findProductImage('aparato'),
    model: 'Aparato',
    location: 'Apartamento em Belo Horizonte, MG',
    span: 'normal',
  },
  {
    id: 'proj-7',
    image: findProductImage('design'),
    model: 'Design',
    location: 'Residência em Goiânia, GO',
    span: 'normal',
  },
  {
    id: 'proj-8',
    image: findProductImage('rustic'),
    model: 'Rustic',
    location: 'Casa em Porto Alegre, RS',
    span: 'wide',
  },
]

const SELECTED_TESTIMONIALS = TESTIMONIALS.slice(0, 3)

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-[var(--color-accent)]' : 'text-[var(--color-border)]'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function getGridSpanClass(span: ProjectCard['span']): string {
  switch (span) {
    case 'tall':
      return 'row-span-2'
    case 'wide':
      return 'md:col-span-2'
    case 'normal':
    default:
      return ''
  }
}

export default function ProjetosPage() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)
  const ctaWhatsApp = getWhatsAppUrlCustom(
    'Olá! Vi a galeria de projetos no site e quero saber como ter minha mesa personalizada.'
  )

  return (
    <>
      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      {/* Breadcrumbs */}
      <div className="pt-28 px-6 max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: 'Projetos' }]} />
      </div>

      {/* Hero */}
      <section className="pt-8 pb-20 px-6 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl font-semibold text-[var(--color-text-primary)] mb-4">
          Projetos
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          Mesas de sinuca instaladas em residências por todo o Brasil
        </p>
      </section>

      {/* Bento Gallery Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <ScrollReveal
          className="grid grid-cols-1 md:grid-cols-3 auto-rows-[280px] md:auto-rows-[300px] gap-4"
          stagger={0.1}
        >
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              onClick={() => setLightbox({ src: project.image, alt: `Mesa ${project.model} — ${project.location}` })}
              className={`
                group relative overflow-hidden rounded-sm bg-[var(--color-bg-secondary)] cursor-zoom-in
                ${getGridSpanClass(project.span)}
              `}
            >
              <Image
                src={project.image}
                alt={`Mesa ${project.model} — ${project.location}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-105"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                <p className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-text-primary)]">
                  {project.model}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {project.location}
                </p>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* Divider */}
      <div className="section-divider max-w-4xl mx-auto" />

      {/* Testimonials */}
      <section className="py-24 px-6">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-semibold text-center text-[var(--color-text-primary)] mb-16">
          O que nossos clientes dizem
        </h2>
        <ScrollReveal
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
          stagger={0.15}
        >
          {SELECTED_TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-sm p-8 space-y-4"
            >
              <StarRating rating={testimonial.rating} />
              <blockquote className="text-[var(--color-text-secondary)] text-sm leading-relaxed italic">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>
              <div className="pt-2 border-t border-[var(--color-border)]">
                <p className="text-[var(--color-text-primary)] font-medium text-sm">
                  {testimonial.name}
                </p>
                <p className="text-[var(--color-accent)] text-xs">
                  {testimonial.model} &mdash; {testimonial.city}
                </p>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* Divider */}
      <div className="section-divider max-w-4xl mx-auto" />

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <ScrollReveal className="space-y-8" stagger={0.2}>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-semibold text-[var(--color-text-primary)]">
            Quer ver sua mesa nesta galeria?
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
            Cada projeto é único. Conte-nos sua visão e transformamos em realidade.
          </p>
          <div>
            <Button variant="whatsapp" size="lg" href={ctaWhatsApp}>
              Solicitar Projeto
            </Button>
          </div>
        </ScrollReveal>
      </section>

    </>
  )
}
