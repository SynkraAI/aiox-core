'use client'

import { trackWhatsAppClick } from '@/lib/analytics'
import Icon from '@/components/ui/icon'

interface FinalCtaButtonProps {
  whatsappUrl: string
}

export default function FinalCtaButton({ whatsappUrl }: FinalCtaButtonProps) {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('final-cta')}
      className="inline-flex items-center justify-center gap-3 mt-12 rounded-lg font-medium transition-all duration-300 bg-whatsapp text-white hover:bg-whatsapp-hover px-10 py-5 text-lg"
    >
      <Icon name="whatsapp" size={24} />
      Falar com especialista
    </a>
  )
}
