/**
 * TextPair -- Atom (puro, presentational, SSR-safe)
 *
 * DRY para padroes label+value usados em:
 *   - stats (hero/sobre): numero grande + legenda
 *   - spec (produto): atributo + valor tecnico
 *   - investimento (produto): "A partir de" + preco
 *
 * Art. VII: arquivo < 100 linhas, componente unico, sem logica.
 * Art. VI: zero 'use client' -- atom visual puro.
 */

type TextPairVariant = 'stat' | 'spec' | 'investimento'

interface TextPairProps {
  label: string
  value: string
  as?: TextPairVariant
  className?: string
}

const LABEL_BASE =
  'font-display uppercase text-[var(--accent-gold)] tracking-[var(--tracking-editorial)]'

const VALUE_STYLES: Record<TextPairVariant, string> = {
  stat: 'font-heading text-5xl md:text-6xl font-semibold text-[var(--text-primary)] leading-[0.95]',
  spec: 'font-body text-base md:text-lg text-[var(--text-primary)] leading-[1.5]',
  investimento:
    'font-heading text-4xl md:text-5xl font-semibold text-[var(--accent-gold)] leading-[1.0]',
}

const LABEL_SIZE: Record<TextPairVariant, string> = {
  stat: 'text-[11px] mb-2',
  spec: 'text-[10px] mb-1',
  investimento: 'text-[11px] mb-2',
}

export function TextPair({
  label,
  value,
  as = 'spec',
  className = '',
}: TextPairProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`${LABEL_BASE} ${LABEL_SIZE[as]}`}>{label}</span>
      <span className={VALUE_STYLES[as]}>{value}</span>
    </div>
  )
}
