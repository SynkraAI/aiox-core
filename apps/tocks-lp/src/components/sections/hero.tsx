'use client'

import Image from 'next/image'
import Button from '@/components/ui/button'
import { getWhatsAppDefault } from '@/data/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'
import Icon from '@/components/ui/icon'

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with 3-layer overlay system */}
      <div className="absolute inset-0">
        <Image
          src="/images/products/banner-desktop.png"
          alt="Mesa de bilhar artesanal Tocks Custom"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center animate-[ken-burns_20s_ease-out_forwards]"
          quality={85}
        />
        {/* Layer 1: Directional gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-bg-primary" />
        {/* Layer 2: Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6))]" />
        {/* Layer 3: Noise grain for texture depth */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-accent text-sm tracking-[0.35em] uppercase mb-6">
          Desde 1988 &middot; Itajai, SC
        </p>

        <h1 className="font-heading text-[2.5rem] sm:text-6xl md:text-7xl lg:text-8xl font-semibold leading-[1.05] tracking-[-0.03em]">
          Tres geracoes dedicadas
          <br />
          <span className="text-accent">a uma unica arte.</span>
        </h1>

        <p className="mt-6 text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Madeira macica. Acabamento manual. 14 modelos exclusivos
          fabricados sob medida no litoral de Santa Catarina.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="whatsapp"
            size="lg"
            href={getWhatsAppDefault()}
            onClick={() => trackWhatsAppClick('hero')}
          >
            <Icon name="whatsapp" size={20} />
            Receba seu projeto 3D gratis
          </Button>
          <Button variant="secondary" size="lg" href="#modelos">
            Ver modelos
          </Button>
        </div>

        <p className="mt-6 text-text-secondary text-sm">
          A partir de R$ 10.990 &middot; Entrega em todo o Brasil
        </p>
      </div>

      {/* Scroll indicator — luxury pulse line */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-accent/50 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="relative w-[2px] h-10 bg-accent/20 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-accent rounded-full animate-[scroll-pulse_2s_var(--ease-luxury)_infinite]" />
        </div>
      </div>
    </section>
  )
}
