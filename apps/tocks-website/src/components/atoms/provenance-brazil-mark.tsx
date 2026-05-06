/**
 * ProvenanceBrazilMark -- atom SVG (SSR-safe, puro).
 *
 * Small multiple Tufte (story S-8.3 AC-5): contorno Brasil simplificado +
 * dot na regiao woodOrigin. Opcao B do Dev Notes — "less ink, more info".
 * Rotulo UF em Space Grotesk ao lado.
 *
 * Dots pre-posicionados aproximados por UF (normalizados ao viewBox 0-100).
 * Sem dependencia externa, sem asset — SVG inline.
 *
 * Art. VII: < 100 linhas.
 */

interface ProvenanceBrazilMarkProps {
  region: string
  label?: string
}

// Posicoes aproximadas dos 8 estados usados em S-8.3 (x,y no viewBox 100x100).
// Fidelidade Tufte: ponto honesto > mapa fake-preciso.
const REGION_DOTS: Record<string, { x: number; y: number }> = {
  MT: { x: 40, y: 50 },
  RO: { x: 28, y: 48 },
  PA: { x: 48, y: 30 },
  BA: { x: 70, y: 55 },
  SC: { x: 58, y: 82 },
  MG: { x: 68, y: 68 },
  SP: { x: 60, y: 75 },
  RS: { x: 52, y: 90 },
}

// Contorno Brasil stylizado monoline — um path simples que sugere a silhueta.
const BRAZIL_OUTLINE =
  'M 35 18 L 55 15 L 68 22 L 78 35 L 82 48 L 80 62 L 72 74 L 64 82 L 54 90 L 44 88 L 36 80 L 28 68 L 22 55 L 20 42 L 24 30 Z'

export function ProvenanceBrazilMark({ region, label }: ProvenanceBrazilMarkProps) {
  const dot = REGION_DOTS[region]
  return (
    <figure className="flex items-center gap-3" aria-label={`Origem: ${label ?? region}`}>
      <svg
        viewBox="0 0 100 100"
        width="56"
        height="56"
        role="img"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d={BRAZIL_OUTLINE}
          fill="none"
          stroke="var(--bone-rule)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {dot && (
          <circle
            cx={dot.x}
            cy={dot.y}
            r="3"
            fill="var(--gold-500)"
          />
        )}
      </svg>
      {label && (
        <span className="font-display text-xs tabular-nums tracking-[0.15em] uppercase text-[var(--bone-ink)]">
          {label}
        </span>
      )}
    </figure>
  )
}
