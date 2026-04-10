'use client'

import Image from 'next/image'
import type { Product } from '@/types'
import { formatPrice, getLineName } from '@/lib/utils'
import { getWhatsAppUrlForModel } from '@/data/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const handleClick = () => {
    trackWhatsAppClick('gallery', product.name)
  }

  return (
    <div
      className="group bg-bg-card border border-border rounded-2xl overflow-hidden transition-all duration-500 hover:border-accent/50 hover:shadow-[0_0_40px_var(--color-accent-glow),0_0_0_1px_var(--color-accent-glow-soft)] hover:-translate-y-1"
      style={{ transitionTimingFunction: 'var(--ease-luxury)', transitionDelay: `${index * 80}ms` }}
    >
      <div className="aspect-[4/5] sm:aspect-[3/4] bg-bg-secondary relative overflow-hidden">
        <Image
          src={product.image}
          alt={`Mesa ${product.name} - Tocks Custom`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
          style={{ transitionTimingFunction: 'var(--ease-luxury)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
        {/* Inner glow ring on hover */}
        <div className="absolute inset-0 ring-1 ring-inset ring-accent/0 group-hover:ring-accent/20 transition-all duration-500 rounded-t-2xl" />
        <div className="absolute bottom-4 left-4">
          <Badge variant="subtle" className="transition-all duration-300 group-hover:bg-accent/30 group-hover:text-text-primary">{getLineName(product.line)}</Badge>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-heading text-2xl font-semibold tracking-tight">{product.name}</h3>
        <p className="text-accent text-xl font-medium mt-1">
          {formatPrice(product.price)}
        </p>
        <p className="text-text-secondary text-xs mt-1">
          ou 6x de {formatPrice(Math.ceil(product.price / 6))} sem juros
        </p>

        <Button
          variant="whatsapp"
          size="sm"
          href={getWhatsAppUrlForModel(product.name)}
          onClick={handleClick}
          className="w-full mt-4"
        >
          Quero saber mais
        </Button>
      </div>
    </div>
  )
}
