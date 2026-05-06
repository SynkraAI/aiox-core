'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavLinkVariant = 'noir' | 'bone'

interface NavLinkProps {
  href: string
  label: string
  onClick?: () => void
  variant?: NavLinkVariant
}

/**
 * NavLink molecule.
 *
 * `variant="noir"` (default) — text-secondary inactive, text-primary hover, gold-500 active.
 *   WCAG: all pass AAA on noir (7.11:1, 18.80:1, 9.03:1).
 * `variant="bone"` — bone-ink inactive, gold-900 hover/active.
 *   WCAG: bone-ink 15.20:1 AAA; gold-900 9.5:1 AAA. Rule 2 (text on bone = bone-ink).
 */
export function NavLink({ href, label, onClick, variant = 'noir' }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)
  const isBone = variant === 'bone'

  const activeColor = isBone ? 'text-[var(--gold-900)]' : 'text-[var(--accent-gold)]'
  const inactiveColor = isBone
    ? 'text-[var(--bone-ink)] hover:text-[var(--gold-900)]'
    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`font-display text-xs font-medium uppercase tracking-[0.1em] transition-colors duration-300 ${
        isActive ? activeColor : inactiveColor
      }`}
    >
      {label}
    </Link>
  )
}
