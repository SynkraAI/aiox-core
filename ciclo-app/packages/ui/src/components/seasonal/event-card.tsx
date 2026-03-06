import * as React from 'react'
import { cn } from '../../lib/utils'
import type { Season } from '../../contexts/season-context'

type EventStatus = 'disponível' | 'esgotado' | 'em-breve'

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> = {
  disponível: {
    label: 'Disponível',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  esgotado: {
    label: 'Esgotado',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  'em-breve': {
    label: 'Em breve',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
} as const

const ELEMENT_ICONS: Record<string, string> = {
  Madeira: '\u6728', // 木
  Fogo: '\u706B',   // 火
  Metal: '\u91D1',   // 金
  Água: '\u6C34',    // 水
  Terra: '\u571F',   // 土
} as const

interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  date: string
  season?: Season
  element?: string
  status?: EventStatus
  priceFrom?: number
  imageUrl?: string
}

const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  (
    {
      className,
      title,
      date,
      element,
      status = 'disponível',
      priceFrom,
      imageUrl,
      ...props
    },
    ref,
  ) => {
    const statusConfig = STATUS_CONFIG[status]
    const elementIcon = element ? ELEMENT_ICONS[element] : undefined

    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-seasonal hover:shadow-md',
          className,
        )}
        {...props}
      >
        {/* Gradiente sazonal de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-seasonal-primary/10 via-seasonal-secondary/5 to-seasonal-accent/10 transition-seasonal" />

        {/* Imagem opcional */}
        {imageUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="relative p-4 sm:p-6">
          {/* Header: Elemento MTC + Status Badge */}
          <div className="mb-3 flex items-center justify-between">
            {elementIcon && (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-seasonal-primary/20 text-base font-bold text-seasonal-primary transition-seasonal"
                aria-label={`Elemento ${element}`}
              >
                {elementIcon}
              </span>
            )}
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                statusConfig.className,
              )}
              role="status"
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Título */}
          <h3 className="font-heading text-lg font-semibold text-card-foreground sm:text-xl">
            {title}
          </h3>

          {/* Data */}
          <p className="mt-1 text-sm text-muted-foreground">
            {date}
          </p>

          {/* Preco */}
          {priceFrom !== undefined && (
            <p className="mt-3 text-sm text-muted-foreground">
              A partir de{' '}
              <span className="font-semibold text-card-foreground">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(priceFrom)}
              </span>
            </p>
          )}
        </div>
      </div>
    )
  },
)
EventCard.displayName = 'EventCard'

export { EventCard }
export type { EventCardProps, EventStatus }
