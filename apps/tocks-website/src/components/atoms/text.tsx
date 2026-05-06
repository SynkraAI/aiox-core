interface TextProps {
  children: React.ReactNode
  variant?: 'body' | 'caption' | 'label'
  className?: string
  as?: 'p' | 'span' | 'div'
}

const VARIANT_STYLES = {
  body: 'font-body text-base md:text-lg leading-[1.7] text-[var(--text-secondary)]',
  caption: 'font-body text-sm leading-[1.6] text-[var(--text-secondary)]',
  label: 'font-display text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent-gold)]',
} as const

export function Text({
  children,
  variant = 'body',
  className = '',
  as: Tag = 'p',
}: TextProps) {
  return (
    <Tag className={`${VARIANT_STYLES[variant]} ${className}`}>
      {children}
    </Tag>
  )
}
