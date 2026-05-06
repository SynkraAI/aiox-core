'use client'

/**
 * ChapterLead -- Template S-8.4 / AC-4
 *
 * Primeiro chapter do Atelier longform. Label + H1 display Fraunces + paragrafo
 * unico (~60 palavras). Consome BRAND_COPY.atelier (copy v2 spec 7b).
 *
 * AC-2: root recebe .chapter-target (S-8.5b GSAP ScrollTrigger wiring via useChapterScroll).
 *   'use client' necessario pois hook depende de window + useEffect.
 *
 * Art. VII: < 100 linhas.
 */

import { Text } from '@/components/atoms/text'
import { useChapterScroll } from '@/hooks/use-chapter-scroll'
import { BRAND_COPY } from '@/lib/constants'

export function ChapterLead() {
  const ref = useChapterScroll<HTMLElement>()

  return (
    <section
      ref={ref}
      className="chapter-target section-bone section-padding-editorial"
    >
      <div className="container-editorial">
        <Text
          variant="label"
          className="mb-6 !text-[color:var(--gold-900)] tracking-[var(--tracking-extreme)]"
        >
          Ateliê
        </Text>

        <h1 className="heading-display mb-10 !text-[color:var(--bone-ink)] max-w-3xl">
          {BRAND_COPY.atelier.headline}
        </h1>

        <p className="font-body text-xl md:text-2xl leading-[var(--leading-relaxed)] text-[var(--bone-ink)] max-w-2xl">
          {BRAND_COPY.atelier.subtitle} Em Itajaí, desenhamos, cortamos e
          acabamos cada peça sob medida — madeira maciça, séries curtas, assinatura do ateliê.
        </p>

        <div
          className="mt-10 h-px w-16"
          style={{ backgroundColor: 'var(--bone-rule)' }}
        />
      </div>
    </section>
  )
}
