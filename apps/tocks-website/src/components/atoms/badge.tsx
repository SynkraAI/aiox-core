interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'subtle'
  className?: string
}

export function Badge({ children, variant = 'gold', className = '' }: BadgeProps) {
  const styles =
    variant === 'gold'
      ? 'bg-[var(--accent-gold)] text-[var(--background)]'
      : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--surface-hover)]'

  return (
    <span
      className={`inline-block font-display text-[10px] font-medium uppercase tracking-[0.15em] px-3 py-1 rounded-[4px] ${styles} ${className}`}
    >
      {children}
    </span>
  )
}
