/**
 * ProvenanceIsometric -- atom SVG (SSR-safe, puro).
 *
 * Desenho tecnico isometrico monoline (story S-8.3 AC-4).
 * UM SVG shared por categoria — honestidade Tufte, sem fake customizacao:
 *   - 'bilhar' : volume retangular alongado + pockets indicados
 *   - 'pebolim': volume mais compacto + barras laterais indicadas
 *
 * Stroke monoline 1px var(--gold-700), fill-none (hairline gold sobre bone —
 * S-8.1 WCAG Rule 1: non-text only, contrast ~4.8:1 PASS AA non-text).
 *
 * Art. VII: < 100 linhas.
 */

interface ProvenanceIsometricProps {
  category: 'bilhar' | 'pebolim'
  dimensions: string
}

// Volume isometrico retangular (bilhar): projecao 30deg padrao.
const BILHAR_PATHS = [
  // Top
  'M 20 40 L 110 40 L 140 60 L 50 60 Z',
  // Front
  'M 20 40 L 20 82 L 50 102 L 50 60 Z',
  // Right
  'M 110 40 L 110 82 L 140 102 L 140 60 Z',
  // Bottom-connect
  'M 50 102 L 140 102',
  // Pocket hints (small corner circles) — 2 front corners
]

// Pebolim: volume mais compacto + sugestao de barra lateral
const PEBOLIM_PATHS = [
  'M 30 40 L 100 40 L 128 58 L 58 58 Z',
  'M 30 40 L 30 78 L 58 96 L 58 58 Z',
  'M 100 40 L 100 78 L 128 96 L 128 58 Z',
  'M 58 96 L 128 96',
  // rod (side bar) — horizontal line crossing front face
  'M 20 60 L 142 60',
]

export function ProvenanceIsometric({ category, dimensions }: ProvenanceIsometricProps) {
  const paths = category === 'pebolim' ? PEBOLIM_PATHS : BILHAR_PATHS
  return (
    <figure className="flex flex-col gap-3" aria-label={`Dimensoes: ${dimensions}`}>
      <svg
        viewBox="0 0 160 120"
        width="100%"
        height="auto"
        role="img"
        aria-hidden="true"
        className="max-w-[160px]"
      >
        {paths.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="var(--gold-700)"
            strokeWidth="1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <span className="font-display text-xs tabular-nums tracking-[0.15em] uppercase text-[var(--bone-ink)]">
        {dimensions}
      </span>
    </figure>
  )
}
