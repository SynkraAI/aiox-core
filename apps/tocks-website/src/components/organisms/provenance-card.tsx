/**
 * ProvenanceCard -- organism (SSR-safe, puro).
 *
 * Dossier arquivistico tufteano (story S-8.3 — cherry-pick E, Fase 4a).
 * 4 blocos editoriais sobre --bone-paper:
 *   1. Origem  — especie madeira + UF + mini-mapa Brasil (atom)
 *   2. Criacao — timeline 4 marcos (atom)
 *   3. Serie   — numeral grande Fraunces tabular
 *   4. Dimensoes — isometrico monoline (atom) + string dimensoes
 *
 * Regras ratificadas:
 *   - Tufte data-ink (consultation ccb3c0a4): sem grade, sem shadow, sem fundo.
 *   - S-8.1 WCAG Rule 1: zero texto gold sobre bone. Gold apenas em hairlines
 *     / strokes / dots / border-top.
 *   - Art. VII: <100 linhas. Sub-atoms em atoms/provenance-*.
 *   - SSR-safe: zero hooks, zero interatividade.
 *
 * Integrado em product-layout abaixo de specs/customization, acima de CTA.
 */

import { ProvenanceBrazilMark } from '@/components/atoms/provenance-brazil-mark'
import { ProvenanceIsometric } from '@/components/atoms/provenance-isometric'
import { ProvenanceTimeline } from '@/components/atoms/provenance-timeline'
import type { ProductProvenance } from '@/data/products'

interface ProvenanceCardProps {
  provenance: ProductProvenance
  productName: string
  category: 'bilhar' | 'pebolim'
  dimensions: string
}

const BLOCK_LABEL =
  'font-heading text-[11px] font-medium uppercase tracking-[var(--tracking-editorial)] text-[var(--bone-ink)]/70'

export function ProvenanceCard({
  provenance,
  productName,
  category,
  dimensions,
}: ProvenanceCardProps) {
  const { woodOrigin, timeline, serieNumber } = provenance
  const titleId = `provenance-${productName.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <figure aria-labelledby={titleId} className="border-t border-[var(--bone-rule)] py-16">
      <figcaption id={titleId} className="sr-only">
        Dossie de proveniencia da peca {productName}: origem {woodOrigin.species} de{' '}
        {woodOrigin.region}, serie {serieNumber.current} de {serieNumber.total}, dimensoes{' '}
        {dimensions}.
      </figcaption>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-4">
        {/* Bloco 1 — Origem */}
        <div className="flex flex-col gap-3">
          <span className={BLOCK_LABEL}>Origem</span>
          <span className="font-heading text-2xl font-light leading-[1.1] text-[var(--bone-ink)]">
            {woodOrigin.species}
          </span>
          <ProvenanceBrazilMark region={woodOrigin.region} label={woodOrigin.region} />
        </div>

        {/* Bloco 2 — Criacao */}
        <div className="flex flex-col gap-3 md:col-span-2">
          <span className={BLOCK_LABEL}>Criacao</span>
          <ProvenanceTimeline
            markers={[
              { label: 'Desenho', date: timeline.designed },
              { label: 'Corte', date: timeline.milled },
              { label: 'Acabamento', date: timeline.finished },
              { label: 'Entrega', date: timeline.deliveredEst },
            ]}
          />
        </div>

        {/* Bloco 3 — Serie */}
        <div className="flex flex-col gap-3">
          <span className={BLOCK_LABEL}>Serie</span>
          <span className="font-heading text-5xl font-light leading-[1] tabular-nums text-[var(--bone-ink)]">
            {String(serieNumber.current).padStart(2, '0')}
            <span aria-hidden="true" className="text-[var(--bone-rule)]">/</span>
            {String(serieNumber.total).padStart(2, '0')}
          </span>
          <span className="font-display text-xs uppercase tracking-[0.15em] text-[var(--bone-ink)]/70">
            da serie
          </span>
        </div>

        {/* Bloco 4 — Dimensoes */}
        <div className="flex flex-col gap-3 lg:col-start-4 lg:row-start-1">
          <span className={BLOCK_LABEL}>Dimensoes</span>
          <ProvenanceIsometric category={category} dimensions={dimensions} />
        </div>
      </div>
    </figure>
  )
}
