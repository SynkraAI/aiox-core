interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  children: React.ReactNode
  className?: string
  gradient?: boolean
}

const TAG_STYLES = {
  h1: 'font-heading text-6xl md:text-7xl lg:text-[96px] font-semibold leading-[0.95]',
  h2: 'font-heading text-4xl md:text-5xl lg:text-[64px] font-medium leading-[1.0]',
  h3: 'font-display text-2xl md:text-[28px] lg:text-[32px] font-light tracking-[0.05em]',
  h4: 'font-display text-xl md:text-2xl font-light tracking-[0.05em]',
} as const

export function Heading({
  as: Tag = 'h2',
  children,
  className = '',
  gradient = false,
}: HeadingProps) {
  const gradientClass = gradient ? 'text-gradient-gold' : 'text-[var(--text-primary)]'
  return (
    <Tag className={`${TAG_STYLES[Tag]} ${gradientClass} ${className}`}>
      {children}
    </Tag>
  )
}
