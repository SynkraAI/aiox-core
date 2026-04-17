import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  external?: boolean
}

const VARIANTS = {
  primary:
    'bg-[var(--accent-gold)] text-[var(--background)] hover:bg-[var(--accent-gold-hover)] active:bg-[var(--accent-gold-deep)]',
  secondary:
    'border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-[var(--background)]',
  ghost:
    'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
} as const

const SIZES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
} as const

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  external = false,
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-display font-medium uppercase tracking-[0.1em] rounded-[4px] transition-all duration-300 cursor-pointer'
  const classes = `${baseClasses} ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    )
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
