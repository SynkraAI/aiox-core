import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const seasonalBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-body transition-seasonal',
  {
    variants: {
      variant: {
        filled: 'border-transparent bg-seasonal-primary text-primary-foreground',
        outline: 'border-seasonal-primary text-seasonal-primary bg-transparent',
        soft: 'border-transparent bg-seasonal-primary/15 text-seasonal-primary',
      },
    },
    defaultVariants: {
      variant: 'filled',
    },
  },
)

interface SeasonalBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof seasonalBadgeVariants> {}

function SeasonalBadge({ className, variant, ...props }: SeasonalBadgeProps) {
  return (
    <span className={cn(seasonalBadgeVariants({ variant }), className)} {...props} />
  )
}

export { SeasonalBadge, seasonalBadgeVariants }
export type { SeasonalBadgeProps }
