'use client'

import { getWhatsAppUrlForModel } from '@/data/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'
import Icon from '@/components/ui/icon'

interface ProductCtaProps {
  productName: string
}

export default function ProductCta({ productName }: ProductCtaProps) {
  return (
    <div className="text-center py-16 px-6 border border-[var(--color-border)] rounded-sm bg-[var(--color-bg-secondary)]">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-[var(--color-text-primary)] mb-4">
        Gostou da {productName}?
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-8 max-w-lg mx-auto">
        Personalize cada detalhe da sua mesa. Fale direto com nosso time.
      </p>
      <a
        href={getWhatsAppUrlForModel(productName)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick(`product-${productName}`)}
        className="inline-flex items-center gap-3 bg-whatsapp hover:bg-whatsapp-hover text-white font-semibold text-lg px-10 py-4 rounded-lg transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
      >
        <Icon name="whatsapp" size={24} />
        Solicitar Orçamento
      </a>
    </div>
  )
}
