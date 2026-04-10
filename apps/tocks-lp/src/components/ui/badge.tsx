import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'subtle'
  className?: string
}

export default function Badge({ children, variant = 'gold', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase',
        variant === 'gold' && 'bg-accent/15 text-accent border border-accent/30',
        variant === 'subtle' && 'bg-bg-secondary text-text-secondary border border-border',
        className
      )}
    >
      {children}
    </span>
  )
}
