import Link from 'next/link'
import { Badge } from '@/components/atoms/badge'
import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'
import { ImagePlaceholder } from '@/components/atoms/image-placeholder'
import type { Product } from '@/data/products'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'editorial'
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  if (variant === 'editorial') {
    return (
      <Link href={`/colecao/${product.slug}`} className="group block">
        <div className="relative overflow-hidden">
          <ImagePlaceholder
            aspectRatio="3/4"
            label={product.name}
            className="transition-transform duration-700 group-hover:scale-105"
          />
          <span
            aria-hidden="true"
            className="absolute top-4 right-4 text-[var(--accent-gold)] opacity-0 translate-x-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
          {product.isNew && (
            <div className="absolute top-4 left-4">
              <Badge>Nova</Badge>
            </div>
          )}
        </div>
        <div className="pt-6">
          <Heading as="h3" className="!text-xl !tracking-normal mb-1">
            {product.name}
          </Heading>
          <Text variant="caption">{product.tagline}</Text>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/colecao/${product.slug}`}
      className="group block bg-[var(--surface)] rounded-[8px] overflow-hidden transition-all duration-500 hover:bg-[var(--surface-hover)]"
    >
      <div className="relative overflow-hidden">
        <ImagePlaceholder
          aspectRatio="4/3"
          label={product.name}
          className="transition-transform duration-700 group-hover:scale-105"
        />
        {product.isNew && (
          <div className="absolute top-4 left-4">
            <Badge>Nova</Badge>
          </div>
        )}
      </div>

      <div className="p-6">
        <Text variant="label" className="mb-2">
          {product.category === 'bilhar' ? 'Mesa de Bilhar' : 'Pebolim'}
        </Text>
        <Heading as="h3" className="!text-xl !tracking-normal mb-1">
          {product.name}
        </Heading>
        <Text variant="caption" className="mb-4">
          {product.tagline}
        </Text>
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-medium text-[var(--accent-gold)]">
            {product.formattedPrice}
          </span>
          <span className="font-display text-xs uppercase tracking-[0.1em] text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)] transition-colors duration-300">
            Ver detalhes
          </span>
        </div>
      </div>
    </Link>
  )
}
