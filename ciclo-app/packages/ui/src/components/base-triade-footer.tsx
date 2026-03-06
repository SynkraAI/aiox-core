import type { HTMLAttributes } from 'react'
import { cn } from '../lib/utils'

interface BaseTriadeFooterProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'minimal'
}

export function BaseTriadeFooter({ variant = 'default', className, ...props }: BaseTriadeFooterProps) {
  return (
    <footer
      className={cn(
        'w-full border-t border-base-gold/20 bg-base-dark/5 py-4 text-center',
        className,
      )}
      {...props}
    >
      <p
        className={cn(
          'font-body text-base-dark/60',
          variant === 'default' ? 'text-sm' : 'text-xs',
        )}
      >
        iAi &middot; ECOssistema Base Tríade&trade;
      </p>
    </footer>
  )
}
