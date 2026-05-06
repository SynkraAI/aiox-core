'use client'

/**
 * ChapterMadeira -- Template S-8.4 / AC-5
 *
 * Ato 1 do longform. Broken 2-col: main 7 + sidebar 3 (mobile stacked).
 * Main: foto full-bleed B&W placeholder + 3 paragrafos sobre origem/certificacao.
 * Sidebar: small multiple 8 origens (reusa woodOrigin dos 8 produtos S-8.3).
 *
 * AC-2: root recebe .chapter-target via useChapterScroll.
 *
 * Art. VII: < 100 linhas.
 * Art. IV: conteudo textual migrado de MATERIALS/PROCESS_STEPS, nao inventado.
 */

import { ImagePlaceholder } from '@/components/atoms/image-placeholder'
import { Text } from '@/components/atoms/text'
import { PRODUCTS } from '@/data/products'
import { useChapterScroll } from '@/hooks/use-chapter-scroll'

export function ChapterMadeira() {
  const ref = useChapterScroll<HTMLElement>()
  const origins = PRODUCTS.map((p) => p.provenance.woodOrigin)

  return (
    <section
      ref={ref}
      className="chapter-target section-bone section-padding-editorial"
    >
      <div className="container-editorial grid grid-cols-1 md:grid-cols-10 gap-10 md:gap-12">
        <div className="md:col-span-7">
          {/* NOTE BLOCKED-BY Nano Banana 2 — foto B&W atelier. Hot-swap when ready. */}
          <ImagePlaceholder
            aspectRatio="21/9"
            label="Madeira maciça — ateliê Itajaí"
            className="mb-10"
          />

          <Text variant="label" className="mb-4 !text-[color:var(--gold-900)]">
            Ato 1 · Madeira
          </Text>

          <h2 className="font-heading text-3xl md:text-4xl leading-[var(--leading-snug)] text-[var(--bone-ink)] mb-8 max-w-xl">
            Começa pela árvore.
          </h2>

          <div className="space-y-5 text-[var(--bone-ink)] max-w-xl">
            <p className="font-body text-base leading-[var(--leading-relaxed)]">
              Trabalhamos apenas com madeira maciça de reflorestamento certificado.
              Peroba, ipê, jatobá, sucupira, freijó, imbuia, cumaru, cedro — cada espécie
              escolhida pela dureza, pelo veio e pela cor.
            </p>
            <p className="font-body text-base leading-[var(--leading-relaxed)]">
              Jamais MDF. Jamais compensado. A madeira chega em pranchas brutas e descansa no
              ateliê por semanas antes do primeiro corte — tempo necessário para que respire o
              clima daqui.
            </p>
            <p className="font-body text-base leading-[var(--leading-relaxed)]">
              Quando ela está pronta, a peça começa a existir.
            </p>
          </div>
        </div>

        <aside className="md:col-span-3 md:pt-16">
          <Text
            variant="label"
            className="mb-6 !text-[color:var(--gold-900)] tracking-[var(--tracking-extreme)]"
          >
            Origens
          </Text>
          <ul className="space-y-4 border-l border-[var(--bone-rule)] pl-5">
            {origins.map((o, i) => (
              <li key={`${o.species}-${i}`} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--gold-500)' }}
                />
                <span className="font-display text-xs uppercase tracking-[var(--tracking-editorial)] text-[var(--bone-ink)]">
                  {o.species}
                </span>
                <span className="font-body text-xs text-[var(--bone-ink)] opacity-60">
                  {o.region}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
