import { ProductCard } from '@/components/molecules/product-card'
import type { Product } from '@/data/products'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3
}

export function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-6 md:gap-8`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} staggerIndex={index} />
      ))}
    </div>
  )
}
