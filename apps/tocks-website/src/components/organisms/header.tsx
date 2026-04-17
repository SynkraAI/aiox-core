'use client'

import { useEffect } from 'react'
import { Logo } from '@/components/atoms/logo'
import { Button } from '@/components/atoms/button'
import { NavLink } from '@/components/molecules/nav-link'
import { NAV_LINKS, WHATSAPP_URL } from '@/lib/constants'
import { useUIStore } from '@/stores/ui-store'

export function Header() {
  const { isMenuOpen, isScrolled, toggleMenu, closeMenu, setScrolled } = useUIStore()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setScrolled])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? 'bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--surface)]'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom flex items-center justify-between h-20">
        <Logo />

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Menu principal">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
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
          <span
            className={`block h-px w-6 bg-[var(--text-primary)] transition-all duration-300 ${
              isMenuOpen ? 'rotate-45 translate-y-[4px]' : ''
            }`}
          />
          <span
            className={`block h-px w-6 bg-[var(--text-primary)] transition-all duration-300 ${
              isMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-px w-6 bg-[var(--text-primary)] transition-all duration-300 ${
              isMenuOpen ? '-rotate-45 -translate-y-[4px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
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
