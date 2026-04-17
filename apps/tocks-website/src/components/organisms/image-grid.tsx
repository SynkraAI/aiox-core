/**
 * ImageGrid -- Organism (SSR-safe, presentacional).
 *
 * Consolida 3 grids do v1 (project-showcase + related-products + client-portraits).
 * AC-6 S-7.2: variants 'project' | 'related'. Sem 'client-portrait' (removido no squad).
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
  variant?: 'project' | 'related'
  className?: string
}

const PROJECT_ASPECT = '3/4'
const RELATED_ASPECT = '4/3'

export function ImageGrid({ items, variant = 'project', className = '' }: ImageGridProps) {
  const grid =
    variant === 'related'
      ? 'grid grid-cols-2 md:grid-cols-4 gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
  const aspect = variant === 'related' ? RELATED_ASPECT : PROJECT_ASPECT

  return (
    <div className={`${grid} ${className}`}>
      {items.map((item, idx) => {
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
          <Link key={`${item.label}-${idx}`} href={item.href} className="block">
            {inner}
          </Link>
        ) : (
          <div key={`${item.label}-${idx}`}>{inner}</div>
        )
      })}
    </div>
  )
}
