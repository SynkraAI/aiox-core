'use client'

/**
 * ChapterAcabamento -- Template S-8.4 / AC-7
 *
 * Ato 3 do longform. 4-up grid textural (verniz, lixa, detalhe pe, bolso couro)
 * + legenda tecnica single-line Space Grotesk uppercase tracking-extreme.
 *
 * AC-2: root recebe .chapter-target via useChapterScroll.
 *
 * Art. VII: < 100 linhas.
 * Art. IV: conteudo migrado de MATERIALS/PROCESS_STEPS Acabamento (passo 04).
 */

import { ImagePlaceholder } from '@/components/atoms/image-placeholder'
import { Text } from '@/components/atoms/text'
import { useChapterScroll } from '@/hooks/use-chapter-scroll'

const TEXTURES = [
  { label: 'Verniz PU acetinado', caption: '04 camadas · aplicação manual' },
  { label: 'Lixa d\u2019água 800', caption: 'Entre camadas · polimento fino' },
  { label: 'Pé torneado detalhe', caption: 'Madeira maciça · encaixe seco' },
  { label: 'Bolso em couro legítimo', caption: 'Costura à mão · peça única' },
] as const

export function ChapterAcabamento() {
  const ref = useChapterScroll<HTMLElement>()

  return (
    <section
      ref={ref}
      className="chapter-target section-bone section-padding-editorial"
    >
      <div className="container-editorial">
        <Text variant="label" className="mb-6 !text-[color:var(--gold-900)]">
          Ato 3 · Acabamento
        </Text>

        <h2 className="font-heading text-3xl md:text-4xl leading-[var(--leading-snug)] text-[var(--bone-ink)] mb-12 max-w-xl">
          O último gesto é manual.
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {TEXTURES.map((t) => (
            <figure key={t.label} className="flex flex-col gap-3">
              <ImagePlaceholder aspectRatio="1/1" label={t.label} />
              <figcaption className="font-display text-[10px] md:text-xs uppercase tracking-[var(--tracking-extreme)] text-[var(--bone-ink)] opacity-70">
                {t.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="font-body text-sm text-[var(--bone-ink)] opacity-60 mt-10 max-w-xl">
          Cada peça recebe quatro camadas de verniz aplicadas à mão, com lixa d&rsquo;água
          entre demãos. O último polimento é feito com cera natural. Tempo total desde o
          bruto: cerca de oito semanas.
        </p>
      </div>
    </section>
  )
}
