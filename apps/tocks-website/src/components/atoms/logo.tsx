import Link from 'next/link'

interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`inline-block ${className}`} aria-label="Tocks Custom - Pagina inicial">
      <span className="font-heading text-2xl md:text-3xl font-semibold text-[var(--text-primary)] tracking-wide">
        TOCKS
      </span>
      <span className="block font-display text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--accent-gold)] -mt-1">
        Custom
      </span>
    </Link>
  )
}
