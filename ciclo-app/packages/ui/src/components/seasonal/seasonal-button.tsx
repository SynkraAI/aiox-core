import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const seasonalButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium font-body transition-seasonal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-seasonal-primary text-primary-foreground hover:bg-seasonal-primary/90 shadow-sm',
        secondary: 'bg-seasonal-secondary text-secondary-foreground hover:bg-seasonal-secondary/80 shadow-sm',
        outline: 'border-2 border-seasonal-primary text-seasonal-primary bg-transparent hover:bg-seasonal-primary/10',
        ghost: 'text-seasonal-primary hover:bg-seasonal-primary/10',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

interface SeasonalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof seasonalButtonVariants> {}

const SeasonalButton = React.forwardRef<HTMLButtonElement, SeasonalButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(seasonalButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
SeasonalButton.displayName = 'SeasonalButton'

export { SeasonalButton, seasonalButtonVariants }
export type { SeasonalButtonProps }
