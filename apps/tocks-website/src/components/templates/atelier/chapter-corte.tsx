'use client'

/**
 * ChapterCorte -- Template S-8.4 / AC-6
 *
 * Ato 2 do longform. Broken grid editorial (2 fotos assymmetric via
 * ImageGrid variant="editorial") + pull-quote Fraunces display entre fotos.
 *
 * AC-2: root recebe .chapter-target via useChapterScroll.
 *
 * Art. VII: < 100 linhas.
 */

import { ImageGrid } from '@/components/organisms/image-grid'
import { Text } from '@/components/atoms/text'
import { useChapterScroll } from '@/hooks/use-chapter-scroll'

const CORTE_ITEMS = [
  {
    label: 'Bancada de corte — serra de esquadria',
    caption: 'Corte seco, sem emenda visível.',
  },
  {
    label: 'Marceneiro ajustando encaixe',
    caption: 'Encaixes macho-e-fêmea, sem prego aparente.',
  },
] as const

export function ChapterCorte() {
  const ref = useChapterScroll<HTMLElement>()

  return (
    <section
      ref={ref}
      className="chapter-target section-bone section-padding-editorial"
    >
      <div className="container-editorial">
        <Text variant="label" className="mb-6 !text-[color:var(--gold-900)]">
          Ato 2 · Corte
        </Text>

        <h2 className="font-heading text-3xl md:text-4xl leading-[var(--leading-snug)] text-[var(--bone-ink)] mb-12 max-w-xl">
          Cada milímetro é decisão.
        </h2>

        <ImageGrid variant="editorial" items={[...CORTE_ITEMS]} className="mb-20" />

        <blockquote className="max-w-3xl mx-auto text-center py-8">
          <p className="font-heading text-3xl md:text-5xl leading-[var(--leading-tight)] text-[var(--bone-ink)] italic tracking-[var(--tracking-headline)]">
            &ldquo;A madeira tem tempo. Respeitamos.&rdquo;
          </p>
          <footer className="mt-6">
            <Text
              variant="label"
              className="!text-[color:var(--gold-900)] tracking-[var(--tracking-extreme)]"
            >
              Marceneiro-chefe · ateliê Tocks
            </Text>
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
