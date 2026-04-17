/**
 * ProductSpecs -- Template sub-component (SSR-safe).
 *
 * Especificacoes via stats-row (consome text-pair atom).
 * Features com bullet gold.
 *
 * Art. VII: < 100 linhas.
 */

import { Text } from '@/components/atoms/text'
import { StatsRow } from '@/components/molecules/stats-row'
import type { Product } from '@/data/products'

interface ProductSpecsProps {
  product: Product
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  const specs = [
    { label: 'Dimensoes', value: product.specs.dimensions },
    { label: 'Peso', value: product.specs.weight },
    { label: 'Campo de jogo', value: product.specs.playField },
    { label: 'Tecido', value: product.specs.cloth },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-[var(--surface)] rounded-[8px] p-6">
        <span className="block font-display text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent-gold)] mb-6">
          Especificacoes
        </span>
        <StatsRow items={specs} variant="spec" align="start" />
      </div>

      <div>
        <span className="block font-display text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent-gold)] mb-4">
          Diferenciais
        </span>
        <ul className="space-y-2">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span className="text-[var(--accent-gold)] mt-1 text-xs">&#9670;</span>
              <Text variant="caption" as="span">
                {feature}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
