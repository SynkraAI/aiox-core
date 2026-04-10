'use client'

import { getWhatsAppUrlForModel } from '@/data/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'
import Button from '@/components/ui/button'
import Icon from '@/components/ui/icon'

interface ProductCtaProps {
  productName: string
}

export default function ProductCta({ productName }: ProductCtaProps) {
  return (
    <div className="text-center py-16 px-6 border border-[var(--color-border)] rounded-sm bg-[var(--color-bg-secondary)]">
      <h2 className="font-heading text-3xl md:text-4xl text-[var(--color-text-primary)] mb-4">
        Gostou da {productName}?
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-8 max-w-lg mx-auto">
        Personalize cada detalhe da sua mesa. Fale direto com nosso time.
      </p>
      <Button
        variant="whatsapp"
        size="lg"
        href={getWhatsAppUrlForModel(productName)}
        onClick={() => trackWhatsAppClick(`product-${productName}`)}
        className="text-lg px-10"
      >
        <Icon name="whatsapp" size={24} />
        Solicitar Orçamento
      </Button>
    </div>
  )
}
