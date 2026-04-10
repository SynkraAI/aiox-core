import { cn } from '@/lib/utils'
import Badge from '@/components/ui/badge'

interface SectionHeaderProps {
  badge?: string
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export default function SectionHeader({
  badge,
  title,
  subtitle,
  centered = true,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(centered && 'text-center', 'mb-14 md:mb-20', className)}>
      {badge && (
        <Badge className="mb-4">{badge}</Badge>
      )}
      <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary mt-3 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-text-secondary text-lg md:text-xl max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}
