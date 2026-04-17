/**
 * StatsRow -- Molecule (SSR-safe, display-only).
 *
 * Consome atoms/text-pair (S-7.1) com variant='stat' por padrao.
 * AC-5 S-7.2: tipografia sans-serif nos numeros (rams: sem Cormorant).
 *
 * Art. VII: < 100 linhas, zero logica.
 */

import { TextPair } from '@/components/atoms/text-pair'

interface StatItem {
  label: string
  value: string
}

interface StatsRowProps {
  items: StatItem[]
  variant?: 'stat' | 'spec'
  align?: 'start' | 'center' | 'between'
  className?: string
}

const ALIGN_MAP: Record<NonNullable<StatsRowProps['align']>, string> = {
  start: 'justify-start',
  center: 'justify-center',
  between: 'justify-between',
}

export function StatsRow({
  items,
  variant = 'stat',
  align = 'between',
  className = '',
}: StatsRowProps) {
  return (
    <div
      role="list"
      className={`flex flex-wrap items-start gap-x-12 gap-y-8 ${ALIGN_MAP[align]} ${className}`}
    >
      {items.map((item) => (
        <div key={item.label} role="listitem" className="flex-1 min-w-[140px]">
          <TextPair
            label={item.label}
            value={item.value}
            as={variant}
          />
        </div>
      ))}
    </div>
  )
}
