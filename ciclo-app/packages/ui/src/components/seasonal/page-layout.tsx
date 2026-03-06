'use client'

import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { BaseTriadeFooter } from '../base-triade-footer'
import { BaseTriadeWatermark } from '../base-triade-watermark'
import { useSeason } from '../../contexts/season-context'
import type { Season } from '../../contexts/season-context'

interface PageLayoutProps {
  children: ReactNode
  className?: string
  /** Override da estação para o layout (caso não use SeasonProvider) */
  season?: Season
  /** Esconder footer */
  hideFooter?: boolean
  /** Esconder watermark */
  hideWatermark?: boolean
}

export function PageLayout({
  children,
  className,
  season: seasonOverride,
  hideFooter = false,
  hideWatermark = false,
}: PageLayoutProps) {
  let resolvedSeason: Season

  try {
    const ctx = useSeason()
    resolvedSeason = seasonOverride ?? ctx.season
  } catch {
    // SeasonProvider não disponível, usar override ou default
    resolvedSeason = seasonOverride ?? 'primavera'
  }

  return (
    <div
      className={cn('flex min-h-screen flex-col bg-background', className)}
      data-season={resolvedSeason}
    >
      {!hideWatermark && <BaseTriadeWatermark />}
      <main className="relative z-10 flex-1">
        {children}
      </main>
      {!hideFooter && <BaseTriadeFooter className="relative z-10" />}
    </div>
  )
}
