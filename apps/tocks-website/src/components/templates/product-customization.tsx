'use client'

/**
 * ProductCustomization -- Template sub-component (client).
 *
 * AC-10 S-7.2: step-indicator DINAMICO -- steps = product.customizationOptions.length.
 * swatch-picker demo para a 1a opcao (quando for madeira/cor).
 *
 * Art. VII: < 100 linhas.
 */

import { useState } from 'react'
import { SwatchPicker } from '@/components/molecules/swatch-picker'
import { StepIndicator } from '@/components/molecules/step-indicator'
import { Badge } from '@/components/atoms/badge'
import type { Product } from '@/data/products'

interface ProductCustomizationProps {
  product: Product
}

const DEMO_SWATCHES = [
  { value: 'oak', caption: 'Carvalho' },
  { value: 'walnut', caption: 'Nogueira' },
  { value: 'ebony', caption: 'Ebano' },
  { value: 'cherry', caption: 'Cerejeira' },
] as const

export function ProductCustomization({ product }: ProductCustomizationProps) {
  const total = product.customizationOptions.length
  const [step, setStep] = useState(1)
  const [wood, setWood] = useState<string>('oak')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <span className="block font-display text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent-gold)]">
          Personalizacao
        </span>
        <StepIndicator steps={total} current={step} />
      </div>

      <SwatchPicker value={wood} onChange={setWood} label={product.customizationOptions[0] ?? 'Acabamento'}>
        {DEMO_SWATCHES.map((s) => (
          <SwatchPicker.Option key={s.value} value={s.value} caption={s.caption} />
        ))}
      </SwatchPicker>

      <div className="flex flex-wrap gap-2">
        {product.customizationOptions.map((option, idx) => (
          <button
            key={option}
            type="button"
            onClick={() => setStep(idx + 1)}
            className="cursor-pointer"
            aria-label={`Ir para etapa ${idx + 1}: ${option}`}
          >
            <Badge variant={idx + 1 === step ? 'gold' : 'subtle'}>{option}</Badge>
          </button>
        ))}
      </div>
    </div>
  )
}
