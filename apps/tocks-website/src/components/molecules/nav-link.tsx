'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  label: string
  onClick?: () => void
}

export function NavLink({ href, label, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`font-display text-xs font-medium uppercase tracking-[0.1em] transition-colors duration-300 ${
        isActive
          ? 'text-[var(--accent-gold)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {label}
    </Link>
  )
}
