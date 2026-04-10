'use client'

import { trackWhatsAppClick } from '@/lib/analytics'

interface HeroCtaProps {
  whatsappUrl: string
}

export default function HeroCta({ whatsappUrl }: HeroCtaProps) {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('hero')}
      className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 bg-transparent border border-text-primary/30 text-text-primary hover:border-accent hover:text-accent px-8 py-4 text-lg"
    >
      Solicitar Orçamento
    </a>
  )
}
