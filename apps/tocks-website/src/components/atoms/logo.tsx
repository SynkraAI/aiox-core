import Link from 'next/link'

export type LogoVariant = 'noir' | 'bone'

interface LogoProps {
  className?: string
  variant?: LogoVariant
}

/**
 * Logo atom.
 *
 * `variant="noir"` (default) — TOCKS white + Custom gold (for dark backgrounds).
 * `variant="bone"` — TOCKS bone-ink + Custom gold-900 (for bone surfaces per WCAG
 * Rule 1: gold-500 on bone is 2.37:1 FAIL; gold-900 on bone is 9.5:1 AAA).
 */
export function Logo({ className = '', variant = 'noir' }: LogoProps) {
  const isBone = variant === 'bone'
  const primaryColor = isBone ? 'text-[var(--bone-ink)]' : 'text-[var(--text-primary)]'
  const accentColor = isBone ? 'text-[var(--gold-900)]' : 'text-[var(--accent-gold)]'

  return (
    <Link href="/" className={`inline-block ${className}`} aria-label="Tocks Custom - Pagina inicial">
      <span className={`font-heading text-2xl md:text-3xl font-semibold ${primaryColor} tracking-wide`}>
        TOCKS
      </span>
      <span className={`block font-display text-[10px] font-medium uppercase tracking-[0.25em] ${accentColor} -mt-1`}>
        Custom
      </span>
    </Link>
  )
}
