/**
 * Hero -- Organism.
 *
 * AC-9 S-7.2: LEFT-ALIGNED (nao mais centered), consome BRAND_COPY.hero.
 * CTAs empilhados (primary gold "consulta" + ghost "colecao").
 * Decisao sessao 9: Atelier em Itajai SEM visita publica -> CTA = "consulta".
 *
 * Art. VII: < 100 linhas.
 *
 * Perf Patch #2b (S-7.3): framer-motion fully removed.
 * - H1/label/subtitle/CTAs already CSS-animated (Patches #1 + #1b).
 * - The previous motion.div stagger wrapper was a no-op (children animate via CSS).
 * - Scroll indicator now uses .hero-scroll-indicator CSS keyframe.
 * Result: framer-motion (~126KB chunk, 64% unused on /) drops from production bundle.
 * No 'use client' needed -- pure server component.
 */

import { Button } from '@/components/atoms/button'
import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'
import { BRAND_COPY, WHATSAPP_URL } from '@/lib/constants'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[var(--background)]">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--accent-gold) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)]" />

      {/* Content -- left-aligned */}
      <div className="relative container-custom py-32 max-w-5xl">
        <Text variant="label" className="hero-label mb-8">
          Desde 2008 &middot; Itajai, SC
        </Text>

        <Heading as="h1" className="hero-h1 mb-8 max-w-3xl">
          {BRAND_COPY.hero.headline}
        </Heading>

        <Text className="hero-subtitle max-w-xl mb-12 text-lg md:text-xl">
          {BRAND_COPY.hero.subtitle}
        </Text>

        <div className="hero-ctas flex flex-col sm:flex-row items-start gap-4">
          <Button href={WHATSAPP_URL} size="lg" external>
            Agende uma consulta
          </Button>
          <Button href="/colecao" variant="secondary" size="lg">
            Ver a colecao
          </Button>
        </div>
      </div>

      {/* Scroll indicator -- below-fold, CSS-only fade-in (was motion.div with 2s delay) */}
      <div className="hero-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-px h-16 bg-gradient-to-b from-[var(--accent-gold)] to-transparent mx-auto" />
      </div>
    </section>
  )
}
