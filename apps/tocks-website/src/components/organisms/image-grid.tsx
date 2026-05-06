/**
 * ImageGrid -- Organism (SSR-safe, presentacional).
 *
 * Consolida 3 grids do v1 (project-showcase + related-products + client-portraits).
 * AC-6 S-7.2: variants 'project' | 'related'. Sem 'client-portrait' (removido no squad).
 * AC-10 S-8.4: variant 'editorial' (broken grid 12col, item 0 col-span-7, item 1
 * col-span-5 col-start-8 com offset vertical mt-16) -- Atelier chapter-corte.
 *
 * NOTE BLOCKED-BY: assets Nano Banana 2 quando gerados. ImagePlaceholder cobre
 * o vazio ate swap para <Image src={item.image}> de next/image em sessao futura.
 *
 * Art. VII: < 100 linhas.
 */

import Link from 'next/link'
import { ImagePlaceholder } from '@/components/atoms/image-placeholder'
import { Text } from '@/components/atoms/text'

export interface ImageGridItem {
  label: string
  caption?: string
  image?: string
  href?: string
}

interface ImageGridProps {
  items: ImageGridItem[]
  variant?: 'project' | 'related' | 'editorial'
  className?: string
}

const PROJECT_ASPECT = '3/4'
const RELATED_ASPECT = '4/3'
const EDITORIAL_ASPECT = '4/5'

// Broken grid positioning per item index (editorial variant) -- NYT Magazine/Gentlewoman
// pattern: primary photo col-span-7, secondary col-span-5 deslocada col-start-8 + mt-16
// Mobile: single column stacked (Tailwind default, no md:col-span).
const EDITORIAL_SLOTS = [
  'md:col-span-7',
  'md:col-span-5 md:col-start-8 md:mt-16',
] as const

export function ImageGrid({ items, variant = 'project', className = '' }: ImageGridProps) {
  const isEditorial = variant === 'editorial'
  const isRelated = variant === 'related'
  const grid = isEditorial
    ? 'grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10'
    : isRelated
      ? 'grid grid-cols-2 md:grid-cols-4 gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
  const aspect = isEditorial ? EDITORIAL_ASPECT : isRelated ? RELATED_ASPECT : PROJECT_ASPECT

  return (
    <div className={`${grid} ${className}`}>
      {items.map((item, idx) => {
        const slot = isEditorial ? (EDITORIAL_SLOTS[idx] ?? '') : ''
        const inner = (
          <div className="flex flex-col gap-3 group">
            <div className="relative overflow-hidden rounded-[4px]">
              <ImagePlaceholder
                aspectRatio={aspect}
                label={item.label}
                className="transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            {item.caption && (
              <Text variant="caption" className="text-[var(--text-primary)]">
                {item.caption}
              </Text>
            )}
            {!item.caption && variant === 'project' && (
              <Text variant="caption">&mdash; {item.label}</Text>
            )}
          </div>
        )
        return item.href ? (
          <Link key={`${item.label}-${idx}`} href={item.href} className={`block ${slot}`}>
            {inner}
          </Link>
        ) : (
          <div key={`${item.label}-${idx}`} className={slot}>
            {inner}
          </div>
        )
      })}
    </div>
  )
}
