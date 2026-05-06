/**
 * Hero -- Organism (S-8.2 Epic 8 Direção B Gilded Noir Cinemático).
 *
 * AC-9 S-7.2: LEFT-ALIGNED, consome BRAND_COPY.hero.
 * CTAs empilhados (primary gold "consulta" + ghost "colecao").
 * Decisao sessao 9: Atelier em Itajai SEM visita publica -> CTA = "consulta".
 *
 * S-8.2 changes:
 * - Background radial-dot texture swapped for <HeroVideo> layer (LCP = poster).
 * - Gradient noir overlay preserved (legibilidade H1).
 * - H1 recebe classe .heading-display (Fraunces opsz 144, Spiekermann).
 * - Video real pendente (Nano Banana 2 quota) -> videoSrc={undefined} por ora,
 *   poster placeholder renderiza sozinho. Hot-swap via prop quando asset chegar.
 *
 * Art. VII: < 100 linhas.
 * Perf Patch #2b (S-7.3): framer-motion fully removed; CSS-only stagger.
 */

import { Button } from '@/components/atoms/button'
import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'
import { HeroVideo } from '@/components/organisms/hero-video'
import { BRAND_COPY, WHATSAPP_URL } from '@/lib/constants'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background video layer -- LCP is the poster (next/image fill + fetchPriority high). */}
      <HeroVideo
        posterSrc="/images/hero-poster.jpg"
        alt="Ateliê Tocks -- mesa de autor em madeira maciça, chiaroscuro editorial"
        className="absolute inset-0 shadow-cinematic"
      />

      {/* Noir gradient overlay -- preserva contraste do H1 sobre qualquer foto. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--noir-deep)] via-transparent to-[var(--noir-deep)] pointer-events-none" />

      {/* Content -- left-aligned, acima do video (z-10). */}
      <div className="relative z-10 container-custom py-32 max-w-5xl">
        <Text variant="label" className="hero-label mb-8">
          Desde 2008 &middot; Itajai, SC
        </Text>

        <Heading as="h1" className="hero-h1 heading-display mb-8 max-w-3xl">
          {BRAND_COPY.hero.headline}
        </Heading>

        <Text className="hero-subtitle max-w-xl mb-12 text-lg md:text-xl">
          {BRAND_COPY.hero.subtitle}
        </Text>

        <div className="hero-ctas flex flex-col sm:flex-row items-start gap-4">
          <Button href={WHATSAPP_URL} size="lg" external>
            {BRAND_COPY.hero.cta_primary}
          </Button>
          <Button href="/colecao" variant="secondary" size="lg">
            {BRAND_COPY.hero.cta_secondary}
          </Button>
        </div>
      </div>

      {/* Scroll indicator -- below-fold, CSS-only fade-in. */}
      <div className="hero-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-px h-16 bg-gradient-to-b from-[var(--accent-gold)] to-transparent mx-auto" />
      </div>
    </section>
  )
}
