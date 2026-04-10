'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import { getWhatsAppDefault } from '@/data/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'

const NAV_LINKS = [
  { label: 'Colecao', href: '/colecao' },
  { label: 'Atelier', href: '/atelier' },
  { label: 'Personalizar', href: '/personalizar' },
  { label: 'Contato', href: '/contato' },
] as const

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-bg-primary/95 backdrop-blur-md border-b border-border py-2'
          : 'bg-transparent py-4'
      )}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/brand/tocks-logo.svg" alt="Tocks Custom" width={120} height={32} className="h-7 md:h-8 w-auto" priority />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-secondary text-sm hover:text-text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="whatsapp"
            size="sm"
            href={getWhatsAppDefault()}
            onClick={() => trackWhatsAppClick('navbar')}
          >
            <Icon name="whatsapp" size={16} />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden bg-bg-primary/98 backdrop-blur-md border-t border-border">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-text-secondary text-lg hover:text-accent transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
