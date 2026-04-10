'use client'

import { useState, useEffect } from 'react'
import Icon from '@/components/ui/icon'
import { getWhatsAppDefault } from '@/data/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export default function WhatsAppFab() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          setVisible((prev) => {
            const next = window.scrollY > 400
            return prev === next ? prev : next
          })
          ticking = false
        })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 transition-all duration-300',
        visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      )}
    >
      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-full bg-whatsapp/40 animate-[fab-pulse_2s_ease-out_infinite]" />
      <a
        href={getWhatsAppDefault()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick('fab')}
        aria-label="Fale conosco no WhatsApp"
        className="group relative w-14 h-14 rounded-full bg-whatsapp hover:bg-whatsapp-hover flex items-center justify-center shadow-lg shadow-whatsapp/25 transition-colors duration-300"
      >
        <Icon name="whatsapp" size={28} className="text-white" />
        {/* Tooltip — desktop only */}
        <span className="hidden md:block absolute right-full mr-3 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-text-primary text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Receba seu projeto 3D
        </span>
      </a>
    </div>
  )
}
