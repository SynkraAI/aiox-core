import Link from 'next/link'
import Image from 'next/image'

import ScrollReveal from '@/components/animations/scroll-reveal'
import Counter from '@/components/animations/counter'
import ParallaxImage from '@/components/animations/parallax-image'
import TextReveal from '@/components/animations/text-reveal'
import SectionTracker from '@/components/sections/section-tracker'
import HeroCta from '@/components/sections/hero-cta'
import HeroVideo from '@/components/sections/hero-video'
import FinalCtaButton from '@/components/sections/final-cta-button'
import Icon from '@/components/ui/icon'

import { PRODUCTS } from '@/data/products'
import { getWhatsAppDefault } from '@/data/whatsapp'
import { formatPrice } from '@/lib/utils'

/* ---------- Featured products: 3 most expensive ---------- */
const FEATURED = [...PRODUCTS]
  .sort((a, b) => b.price - a.price)
  .slice(0, 3)

/* ---------- Trust counters ---------- */
const COUNTERS = [
  { end: 1988, label: 'Desde', prefix: '', suffix: '' },
  { end: 250, label: 'Mesas entregues', prefix: '', suffix: '+' },
  { end: 14, label: 'Modelos exclusivos', prefix: '', suffix: '' },
  { end: 5, label: 'Anos de garantia', prefix: '', suffix: '' },
] as const

/* ---------- Trust bar features ---------- */
const TRUST_BAR = [
  { icon: 'shield', label: 'Madeira Maciça' },
  { icon: 'star', label: 'Feita à Mão' },
  { icon: 'settings', label: 'Personalização Total' },
  { icon: 'check', label: '6x Sem Juros' },
] as const

export default function Home() {
  const whatsappUrl = getWhatsAppDefault()

  return (
    <>
      <SectionTracker />

      {/* ============================================================
          HERO — Full-screen cinematic entrance with video
      ============================================================ */}
      <section
        data-section="hero"
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Video / Ken Burns background */}
        <HeroVideo
          videoSrc="/videos/hero-curve.mp4"
          fallbackImage="/images/products/banner-desktop.png"
        />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Logo */}
          <div className="mb-10 opacity-0 animate-[fadeIn_1s_ease_0.3s_forwards]">
            <Image
              src="/images/brand/tocks-logo.svg"
              alt="Tocks Custom"
              width={220}
              height={49}
              priority
              className="h-10 md:h-12 w-auto mx-auto"
            />
          </div>

          {/* Impact phrase */}
          <TextReveal
            as="h1"
            className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-tight text-text-primary"
            delay={0.5}
          >
            Não é uma mesa. É uma declaração.
          </TextReveal>

          <p className="mt-8 text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-0 animate-[fadeIn_1s_ease_1.8s_forwards]">
            Mesas de sinuca artesanais em madeira maciça. 14 modelos exclusivos,
            fabricados à mão em Itajaí-SC. Projeto 3D gratuito.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-[fadeIn_1s_ease_2.2s_forwards]">
            <Link
              href="/colecao"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 bg-accent text-bg-primary hover:bg-accent-hover px-8 py-4 text-lg"
            >
              Explorar Coleção
            </Link>

            <HeroCta whatsappUrl={whatsappUrl} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0 animate-[fadeIn_1s_ease_2.8s_forwards]" aria-hidden="true">
          <span className="text-text-secondary text-xs tracking-[0.3em] uppercase">
            Scroll
          </span>
          <div className="w-[1px] h-12 overflow-hidden relative">
            <div className="absolute w-full h-full bg-accent/60 animate-[scroll-pulse_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST BAR — Quick value props
      ============================================================ */}
      <section data-section="trust-bar" className="py-8 border-y border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {TRUST_BAR.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <Icon name={item.icon} size={20} className="text-accent" />
                <span className="text-text-secondary text-sm tracking-[0.1em] uppercase font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST NUMBERS — Counter animated stats
      ============================================================ */}
      <section data-section="trust" className="py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal
            className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 text-center"
            stagger={0.2}
          >
            {COUNTERS.map((item) => (
              <div key={item.label}>
                <Counter
                  end={item.end}
                  prefix={item.prefix}
                  suffix={item.suffix}
                  duration={2.5}
                  className="font-heading text-5xl md:text-6xl font-semibold text-accent block"
                />
                <span className="mt-3 block text-text-secondary text-sm tracking-[0.15em] uppercase">
                  {item.label}
                </span>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider max-w-4xl mx-auto" />

      {/* ============================================================
          FEATURED PRODUCTS — 3 hero-level cards
      ============================================================ */}
      <section data-section="featured" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="text-center mb-20">
            <p className="text-accent text-sm tracking-[0.3em] uppercase font-medium">
              Destaques
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold mt-4">
              Peças que definem espaços
            </h2>
          </ScrollReveal>

          <ScrollReveal
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6"
            stagger={0.2}
          >
            {FEATURED.map((product) => (
              <Link
                key={product.id}
                href={`/colecao/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-bg-secondary border border-border">
                  <Image
                    src={product.image}
                    alt={`Mesa de sinuca ${product.name} - Tocks Custom`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="mt-6">
                  <h3 className="font-heading text-2xl md:text-3xl font-semibold group-hover:text-accent transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-text-secondary text-sm mt-1">
                    {product.tagline}
                  </p>
                  <p className="text-accent font-heading text-xl mt-3">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </ScrollReveal>

          <ScrollReveal className="text-center mt-16">
            <Link
              href="/colecao"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors duration-300 text-sm tracking-[0.15em] uppercase font-medium group"
            >
              Ver toda a coleção
              <Icon name="arrow-right" size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider max-w-4xl mx-auto" />

      {/* ============================================================
          STORY TEASER — Split layout with parallax
      ============================================================ */}
      <section data-section="story" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
              <ParallaxImage
                src="/images/products/Mesa-de-Bilhar-Aparato-Alto-Padrão-001.jpg"
                alt="Atelier Tocks Custom - tradição artesanal desde 1988"
                width={800}
                height={1067}
                speed={0.2}
                className="w-full h-full"
              />
            </div>

            <div>
              <ScrollReveal stagger={0.15}>
                <span className="inline-block text-accent text-xs tracking-[0.3em] uppercase font-medium border border-accent/30 px-4 py-1.5 rounded-full">
                  Desde 1988
                </span>

                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold mt-8 leading-[1.15]">
                  Do tronco à sua sala
                </h2>

                <p className="text-text-secondary text-lg leading-relaxed mt-6 max-w-md">
                  Em Itajaí, cidade que cresceu construindo embarcações,
                  trabalhar madeira é herança. A Tocks Custom nasceu dessa
                  tradição — cada mesa de sinuca leva semanas para ficar pronta.
                </p>

                <Link
                  href="/atelier"
                  className="inline-flex items-center gap-2 mt-10 text-accent hover:text-accent-hover transition-colors duration-300 text-sm tracking-[0.15em] uppercase font-medium group"
                >
                  Conhecer nossa história
                  <Icon name="arrow-right" size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA FINAL — Dark cinematic close
      ============================================================ */}
      <section data-section="final-cta" className="py-24 md:py-32 bg-bg-secondary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollReveal stagger={0.2}>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.15]">
              Sua próxima mesa não deveria sair de uma fábrica.
            </h2>

            <p className="text-text-secondary text-lg md:text-xl mt-6 max-w-xl mx-auto">
              Receba seu projeto 3D gratuito em até 48h.
              Nossos especialistas estão prontos para criar a mesa perfeita para o seu espaço.
            </p>

            <p className="text-accent/80 text-sm mt-4 tracking-wide">
              Produção limitada — tempo de fabricação atual: 45 a 60 dias
            </p>

            <FinalCtaButton whatsappUrl={whatsappUrl} />
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
