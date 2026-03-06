/**
 * Admin constants: labels, options, and mappings for event management.
 * All labels in Portuguese (PT-BR).
 */

export const SEASON_LABELS: Record<string, string> = {
  SPRING: 'Primavera',
  SUMMER: 'Verão',
  AUTUMN: 'Outono',
  WINTER: 'Inverno',
  CROSS_QUARTER: 'Cross-Quarter',
} as const

export const SEASON_OPTIONS = [
  { value: 'SPRING', label: 'Primavera' },
  { value: 'SUMMER', label: 'Verão' },
  { value: 'AUTUMN', label: 'Outono' },
  { value: 'WINTER', label: 'Inverno' },
  { value: 'CROSS_QUARTER', label: 'Cross-Quarter' },
] as const

export const ASTRONOMICAL_EVENT_LABELS: Record<string, string> = {
  SPRING_EQUINOX: 'Equinócio de Primavera',
  SUMMER_SOLSTICE: 'Solstício de Verão',
  AUTUMN_EQUINOX: 'Equinócio de Outono',
  WINTER_SOLSTICE: 'Solstício de Inverno',
  IMBOLC: 'Imbolc',
  BELTANE: 'Beltane',
  LUGHNASADH: 'Lughnasadh',
  SAMHAIN: 'Samhain',
} as const

export const ASTRONOMICAL_EVENT_OPTIONS = [
  { value: '', label: '(Nenhum)' },
  { value: 'SPRING_EQUINOX', label: 'Equinócio de Primavera' },
  { value: 'SUMMER_SOLSTICE', label: 'Solstício de Verão' },
  { value: 'AUTUMN_EQUINOX', label: 'Equinócio de Outono' },
  { value: 'WINTER_SOLSTICE', label: 'Solstício de Inverno' },
  { value: 'IMBOLC', label: 'Imbolc' },
  { value: 'BELTANE', label: 'Beltane' },
  { value: 'LUGHNASADH', label: 'Lughnasadh' },
  { value: 'SAMHAIN', label: 'Samhain' },
] as const

export const SEASON_COLORS: Record<string, string> = {
  SPRING: 'bg-green-100 text-green-800',
  SUMMER: 'bg-amber-100 text-amber-800',
  AUTUMN: 'bg-orange-100 text-orange-800',
  WINTER: 'bg-blue-100 text-blue-800',
  CROSS_QUARTER: 'bg-purple-100 text-purple-800',
} as const

export const STATUS_LABELS = {
  published: 'Publicado',
  draft: 'Rascunho',
  soldout: 'Esgotado',
} as const

export const DEFAULT_VENUE = 'Base Tríade - Barra Velha/SC'

/** Bar fill colors for charts (Tailwind classes) */
export const SEASON_BAR_COLORS: Record<string, string> = {
  SPRING: 'bg-green-400',
  SUMMER: 'bg-amber-400',
  AUTUMN: 'bg-orange-400',
  WINTER: 'bg-blue-400',
  CROSS_QUARTER: 'bg-purple-400',
} as const
