'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type Season = 'primavera' | 'verao' | 'outono' | 'inverno'

export interface SeasonInfo {
  season: Season
  label: string
  element: string
  organ: string
}

const SEASON_MAP: Record<Season, Omit<SeasonInfo, 'season'>> = {
  primavera: { label: 'Primavera', element: 'Madeira', organ: 'Figado' },
  verao: { label: 'Verao', element: 'Fogo', organ: 'Coracao' },
  outono: { label: 'Outono', element: 'Metal', organ: 'Pulmao' },
  inverno: { label: 'Inverno', element: 'Agua', organ: 'Rim' },
} as const

/**
 * Determina a estacao atual baseado na data.
 * Hemisferio Sul (Brasil):
 * - Primavera: Set 22 - Dez 20
 * - Verao: Dez 21 - Mar 19
 * - Outono: Mar 20 - Jun 20
 * - Inverno: Jun 21 - Set 21
 */
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1 // 1-12
  const day = date.getDate()

  // Hemisferio Sul
  if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day <= 20)) {
    return 'primavera'
  }
  if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day <= 19)) {
    return 'verao'
  }
  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
    return 'outono'
  }
  return 'inverno'
}

export function getSeasonInfo(season: Season): SeasonInfo {
  return { season, ...SEASON_MAP[season] }
}

interface SeasonContextValue {
  season: Season
  seasonInfo: SeasonInfo
}

const SeasonContext = createContext<SeasonContextValue | null>(null)

interface SeasonProviderProps {
  children: ReactNode
  /** Forcar uma estacao especifica (para preview/testing) */
  forceSeason?: Season
}

export function SeasonProvider({ children, forceSeason }: SeasonProviderProps) {
  const value = useMemo<SeasonContextValue>(() => {
    const season = forceSeason ?? getCurrentSeason()
    return {
      season,
      seasonInfo: getSeasonInfo(season),
    }
  }, [forceSeason])

  return (
    <SeasonContext.Provider value={value}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason(): SeasonContextValue {
  const context = useContext(SeasonContext)
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider')
  }
  return context
}
