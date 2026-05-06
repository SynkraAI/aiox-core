import type { Metadata } from 'next'
import { PageLayout } from '@/components/templates/page-layout'
import { ProductGrid } from '@/components/organisms/product-grid'
import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'
import { PRODUCTS, getProductsByCategory } from '@/data/products'
import { BRAND_COPY } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Acervo',
  description: 'Acervo Tocks Custom — móveis de autor em madeira maciça, sob medida, assinados no ateliê de Itajaí.',
}

export default function ColecaoPage() {
  const bilharProducts = getProductsByCategory('bilhar')
  const pebolimProducts = getProductsByCategory('pebolim')

  return (
    <PageLayout title={BRAND_COPY.collection.headline} subtitle={BRAND_COPY.collection.subtitle}>
      {/* Bilhar Section */}
      <div className="mb-20">
        <div className="mb-8">
          <Text variant="label" className="mb-2">Mesas de Bilhar</Text>
          <Heading as="h3">{bilharProducts.length} modelos exclusivos</Heading>
        </div>
        <ProductGrid products={bilharProducts} />
      </div>

      {/* Pebolim Section */}
      <div>
        <div className="mb-8">
          <Text variant="label" className="mb-2">Pebolim</Text>
          <Heading as="h3">{pebolimProducts.length} modelos exclusivos</Heading>
        </div>
        <ProductGrid products={pebolimProducts} columns={2} />
      </div>
    </PageLayout>
  )
}
