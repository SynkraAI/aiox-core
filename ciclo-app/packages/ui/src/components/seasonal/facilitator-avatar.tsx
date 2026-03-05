import * as React from 'react'
import { cn } from '../../lib/utils'

interface FacilitatorAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  title?: string
  imageUrl?: string
  specialty?: string
}

const FacilitatorAvatar = React.forwardRef<HTMLDivElement, FacilitatorAvatarProps>(
  ({ className, name, title, imageUrl, specialty, ...props }, ref) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center gap-2 text-center', className)}
        {...props}
      >
        {/* Avatar circular com borda dourada */}
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-base-gold shadow-md sm:h-24 sm:w-24">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-seasonal-accent text-lg font-semibold text-base-dark transition-seasonal">
              {initials}
            </div>
          )}
        </div>

        {/* Nome */}
        <h4 className="font-heading text-sm font-semibold text-card-foreground sm:text-base">
          {name}
        </h4>

        {/* Titulo/Papel */}
        {title && (
          <p className="text-xs text-muted-foreground sm:text-sm">
            {title}
          </p>
        )}

        {/* Especialidade */}
        {specialty && (
          <span className="inline-flex items-center rounded-full bg-seasonal-primary/15 px-2 py-0.5 text-xs font-medium text-seasonal-primary transition-seasonal">
            {specialty}
          </span>
        )}
      </div>
    )
  },
)
FacilitatorAvatar.displayName = 'FacilitatorAvatar'

export { FacilitatorAvatar }
export type { FacilitatorAvatarProps }
