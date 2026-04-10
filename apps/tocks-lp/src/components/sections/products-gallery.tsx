'use client'

import { useState } from 'react'
import SectionHeader from '@/components/shared/section-header'
import ProductCard from '@/components/shared/product-card'
import { PRODUCTS } from '@/data/products'
import { cn } from '@/lib/utils'

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'criativa', label: 'Linha Criativa' },
  { key: 'premium', label: 'Linha Premium' },
  { key: 'pebolim', label: 'Pebolim' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

const MOBILE_INITIAL_COUNT = 6

export default function ProductsGallery() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [showAll, setShowAll] = useState(false)

  const filtered =
    activeFilter === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.line === activeFilter)

  const visibleProducts = showAll ? filtered : filtered.slice(0, MOBILE_INITIAL_COUNT)
  const hasMore = filtered.length > MOBILE_INITIAL_COUNT

  return (
    <section id="modelos" className="py-24 md:py-32 px-6 bg-bg-secondary/30 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          badge="A colecao"
          title="Oito modelos. Nenhum igual."
          subtitle="De classicos atemporais a designs ousados. Todas feitas sob medida em madeira macica."
        />

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setActiveFilter(f.key)
                setShowAll(false)
              }}
              className={cn(
                'px-5 py-2 rounded-full text-sm transition-all duration-300 cursor-pointer',
                activeFilter === f.key
                  ? 'bg-accent text-bg-primary'
                  : 'bg-bg-card text-text-secondary border border-border hover:border-accent/40'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Desktop: show all; Mobile: show limited with expand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* On lg+, always show all filtered products */}
          {filtered.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                index >= MOBILE_INITIAL_COUNT && !showAll && 'hidden lg:block'
              )}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>

        {/* Show more button - mobile only */}
        {hasMore && !showAll && (
          <div className="flex justify-center mt-10 lg:hidden">
            <button
              onClick={() => setShowAll(true)}
              className="px-8 py-3 rounded-full text-sm border border-accent/40 text-accent hover:bg-accent/10 transition-all duration-300 cursor-pointer"
            >
              Ver todos os modelos ({filtered.length})
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
