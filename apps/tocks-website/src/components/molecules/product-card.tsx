'use client'

/**
 * ProductCard -- S-8.5b: useReveal + .product-reveal-target (IO); .product-card-image hover.
 * FIX-5 (gate): optional staggerIndex → .delay-{1,2,3} cycle (index % 4) for scarcity-of-motion.
 * Reduced-motion neutralized by Patch #2c. Art. VII <100L.
 */

import Link from 'next/link'
import { Badge } from '@/components/atoms/badge'
import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'
import { ImagePlaceholder } from '@/components/atoms/image-placeholder'
import { useReveal } from '@/hooks/use-reveal'
import type { Product } from '@/data/products'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'editorial'
  staggerIndex?: number
}

const STAGGER_CLASSES = ['', 'delay-1', 'delay-2', 'delay-3'] as const

export function ProductCard({ product, variant = 'default', staggerIndex }: ProductCardProps) {
  const ref = useReveal<HTMLAnchorElement>()
  const delayClass = typeof staggerIndex === 'number' ? STAGGER_CLASSES[staggerIndex % 4] : ''

  if (variant === 'editorial') {
    return (
      <Link
        ref={ref}
        href={`/colecao/${product.slug}`}
        className={`product-card product-reveal-target${delayClass ? ` ${delayClass}` : ''} block`}
      >
        <div className="relative overflow-hidden">
          <div className="product-card-image">
            <ImagePlaceholder aspectRatio="3/4" label={product.name} />
          </div>
          <span
            aria-hidden="true"
            className="product-card-chevron absolute top-4 right-4 text-[var(--accent-gold)] opacity-0 translate-x-1 transition-all duration-500"
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
      ref={ref}
      href={`/colecao/${product.slug}`}
      className={`product-card product-reveal-target${delayClass ? ` ${delayClass}` : ''} block bg-[var(--surface)] rounded-[8px] overflow-hidden transition-colors duration-500 hover:bg-[var(--surface-hover)]`}
    >
      <div className="relative overflow-hidden">
        <div className="product-card-image">
          <ImagePlaceholder aspectRatio="4/3" label={product.name} />
        </div>
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
        <Text variant="caption" className="mb-4">{product.tagline}</Text>
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-medium text-[var(--accent-gold)]">
            {product.formattedPrice}
          </span>
          <span className="font-display text-xs uppercase tracking-[0.1em] text-[var(--text-secondary)] transition-colors duration-300">
            Ver detalhes
          </span>
        </div>
      </div>
    </Link>
  )
}
