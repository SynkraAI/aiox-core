// Lib
export { cn } from './lib/utils'

// Branding Components
export { BaseTriadeFooter } from './components/base-triade-footer'
export { BaseTriadeWatermark } from './components/base-triade-watermark'

// shadcn/ui Base Components
export { Button, buttonVariants } from './components/ui/button'
export type { ButtonProps } from './components/ui/button'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/ui/card'

export { Input } from './components/ui/input'
export type { InputProps } from './components/ui/input'

export { Badge, badgeVariants } from './components/ui/badge'
export type { BadgeProps } from './components/ui/badge'

export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar'
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps } from './components/ui/avatar'

export { Skeleton } from './components/ui/skeleton'
export type { SkeletonProps } from './components/ui/skeleton'

export { Sheet, SheetContent } from './components/ui/sheet'
export type { SheetProps, SheetContentProps } from './components/ui/sheet'

// Seasonal Components
export { SeasonalButton, seasonalButtonVariants } from './components/seasonal/seasonal-button'
export type { SeasonalButtonProps } from './components/seasonal/seasonal-button'

export { EventCard } from './components/seasonal/event-card'
export type { EventCardProps, EventStatus } from './components/seasonal/event-card'

export { FacilitatorAvatar } from './components/seasonal/facilitator-avatar'
export type { FacilitatorAvatarProps } from './components/seasonal/facilitator-avatar'

export { SeasonalBadge, seasonalBadgeVariants } from './components/seasonal/seasonal-badge'
export type { SeasonalBadgeProps } from './components/seasonal/seasonal-badge'

export { PageLayout } from './components/seasonal/page-layout'

// Contexts
export { SeasonProvider, useSeason, getCurrentSeason, getSeasonInfo } from './contexts/season-context'
export type { Season, SeasonInfo } from './contexts/season-context'
