'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { gsap } from '@/lib/gsap-config'

const NAV_LINKS = [
  { href: '/colecao', label: 'Coleção' },
  { href: '/atelier', label: 'Atelier' },
  { href: '/processo', label: 'Processo' },
  { href: '/projetos', label: 'Projetos' },
  { href: '/contato', label: 'Contato' },
]

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const currentY = window.scrollY
        setScrolled(currentY > 80)

        if (navRef.current) {
          const hide = currentY > lastScrollY.current && currentY > 200 && !menuOpen
          gsap.to(navRef.current, {
            yPercent: hide ? -100 : 0,
            duration: 0.3,
            ease: hide ? 'power2.inOut' : 'power2.out',
            overwrite: true,
          })
        }
        lastScrollY.current = currentY
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [menuOpen])

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'mx-4 mt-3 rounded-full px-8 py-3 backdrop-blur-xl'
            : 'px-8 py-6'
        }`}
        style={{
          backgroundColor: scrolled ? 'rgba(var(--color-bg-primary-rgb, 10,10,10),0.7)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(var(--color-accent-rgb, 201,169,110),0.1)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left links (desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-[0.2em] uppercase transition-colors duration-300 hover:text-accent ${
                  pathname === link.href ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Logo center */}
          <Link href="/" className="text-center">
            <span className="font-heading text-xl lg:text-2xl tracking-[0.15em]" style={{ color: 'var(--color-text-primary)' }}>
              TOCKS CUSTOM
            </span>
          </Link>

          {/* Right links (desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-[0.2em] uppercase transition-colors duration-300 hover:text-accent ${
                  pathname === link.href ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`block w-6 h-px bg-text-primary transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
            <span className={`block w-6 h-px bg-text-primary transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-text-primary transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-heading text-3xl tracking-wider text-[var(--color-text-primary)] hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
