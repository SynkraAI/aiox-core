/**
 * ProductGallery -- Template sub-component (SSR-safe).
 *
 * Usado por product-layout. Principal + 3 thumbs.
 * BLOCKED-BY: assets Nano Banana 2; placeholders ok ate swap.
 *
 * Art. VII: < 100 linhas.
 */

import { ImagePlaceholder } from '@/components/atoms/image-placeholder'
import type { Product } from '@/data/products'

interface ProductGalleryProps {
  product: Product
}

export function ProductGallery({ product }: ProductGalleryProps) {
  return (
    <div className="space-y-4">
      <ImagePlaceholder aspectRatio="4/3" label={`${product.name} — Principal`} />
      <div className="grid grid-cols-3 gap-4">
        <ImagePlaceholder aspectRatio="1/1" label="Detalhe 1" />
        <ImagePlaceholder aspectRatio="1/1" label="Detalhe 2" />
        <ImagePlaceholder aspectRatio="1/1" label="Detalhe 3" />
      </div>
    </div>
  )
}
