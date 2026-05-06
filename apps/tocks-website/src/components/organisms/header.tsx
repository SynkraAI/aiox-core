'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/atoms/logo'
import { Button } from '@/components/atoms/button'
import { NavLink } from '@/components/molecules/nav-link'
import { HEADER_BONE_ROUTES, NAV_LINKS, WHATSAPP_URL } from '@/lib/constants'
import { useUIStore } from '@/stores/ui-store'

/**
 * Header — FIX-3 bone-adaptation (Epic 8). Detects bone-surfaced routes via
 * HEADER_BONE_ROUTES + usePathname() and swaps Logo/NavLinks/mobile-toggle to the
 * bone palette so WCAG AAA holds (Rules 1 & 2 of s-8.1-wcag-log.md). When scrolled,
 * backdrop becomes noir, so we revert to noir palette regardless of route.
 */
export function Header() {
  const { isMenuOpen, isScrolled, toggleMenu, closeMenu, setScrolled } = useUIStore()
  const pathname = usePathname()
  const isBoneRoute = (HEADER_BONE_ROUTES as readonly string[]).includes(pathname)
  // Bone palette only while backdrop is transparent; once scrolled, noir backdrop wins.
  const variant: 'noir' | 'bone' = isBoneRoute && !isScrolled ? 'bone' : 'noir'
  const toggleBarColor = variant === 'bone' ? 'bg-[var(--bone-ink)]' : 'bg-[var(--text-primary)]'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setScrolled])

  return (
    <header
      data-variant={variant}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? 'bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--surface)]'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom flex items-center justify-between h-20">
        <Logo variant={variant} />

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Menu principal">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} variant={variant} />
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Button href={WHATSAPP_URL} size="sm" external>
            Fale conosco
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={toggleMenu}
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
        >
          {(['rotate-45 translate-y-[4px]', 'opacity-0', '-rotate-45 -translate-y-[4px]'] as const).map(
            (openFx, i) => (
              <span
                key={i}
                className={`block h-px w-6 ${toggleBarColor} transition-all duration-300 ${isMenuOpen ? openFx : ''}`}
              />
            ),
          )}
        </button>
      </div>

      {/* Mobile Menu (always noir — sheet fully covers page, consistent dark context) */}
      <div
        className={`lg:hidden fixed inset-0 top-20 bg-[var(--background)] transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <nav className="flex flex-col items-center gap-8 pt-16" aria-label="Menu mobile">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} onClick={closeMenu} />
          ))}
          <Button href={WHATSAPP_URL} external>
            Fale conosco
          </Button>
        </nav>
      </div>
    </header>
  )
}
