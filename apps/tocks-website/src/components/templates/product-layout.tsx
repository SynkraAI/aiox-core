/**
 * ProductLayout -- Template orquestrador (SSR-safe).
 *
 * AC-10 S-7.2: split em 3 sub-components (<100 linhas cada).
 *   - ProductGallery
 *   - ProductSpecs
 *   - ProductCustomization (client, step-indicator dinamico)
 *
 * Hero + preco + CTA + related grid ficam neste arquivo (<100 linhas).
 */

import Link from 'next/link'
import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { ImageGrid } from '@/components/organisms/image-grid'
import { ProductGallery } from '@/components/templates/product-gallery'
import { ProductSpecs } from '@/components/templates/product-specs'
import { ProductCustomization } from '@/components/templates/product-customization'
import { ProvenanceCard } from '@/components/organisms/provenance-card'
import { WHATSAPP_URL } from '@/lib/constants'
import { PRODUCTS, type Product } from '@/data/products'

interface ProductLayoutProps {
  product: Product
}

export function ProductLayout({ product }: ProductLayoutProps) {
  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4).map((p) => ({
    label: p.name,
    caption: p.formattedPrice,
    href: `/colecao/${p.slug}`,
  }))

  return (
    <main className="pt-32 pb-20">
      <div className="container-custom">
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 font-body text-sm text-[var(--text-secondary)]">
            <li><Link href="/" className="hover:text-[var(--text-primary)]">Inicio</Link></li>
            <li>/</li>
            <li><Link href="/colecao" className="hover:text-[var(--text-primary)]">Colecao</Link></li>
            <li>/</li>
            <li className="text-[var(--text-primary)]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <ProductGallery product={product} />

          <div className="flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Text variant="label">{product.category === 'bilhar' ? 'Mesa de Bilhar' : 'Pebolim'}</Text>
                {product.isNew && <Badge>Nova</Badge>}
              </div>
              <Heading as="h1" className="!text-4xl md:!text-5xl mb-2">{product.name}</Heading>
              <Text variant="body" className="text-xl italic text-[var(--accent-ivory)] mb-6">{product.tagline}</Text>
              <span className="block font-heading text-3xl font-semibold text-[var(--accent-gold)]">A partir de {product.formattedPrice}</span>
              <div className="gold-separator my-6" />
              <Text>{product.description}</Text>
            </div>

            <ProductSpecs product={product} />
            <ProductCustomization product={product} />

            <Button href={WHATSAPP_URL} size="lg" external className="w-full">
              Solicitar orcamento
            </Button>
          </div>
        </div>
      </div>

      <section className="section-bone mt-20">
        <div className="container-editorial">
          <ProvenanceCard
            provenance={product.provenance}
            productName={product.name}
            category={product.category}
            dimensions={product.specs.dimensions}
          />
        </div>
      </section>

      <div className="container-custom">
        <section className="mt-24">
          <div className="mb-8">
            <Text variant="label" className="mb-3">Tambem da colecao</Text>
            <Heading as="h2" className="!text-3xl md:!text-4xl">Pecas relacionadas</Heading>
          </div>
          <ImageGrid items={related} variant="related" />
        </section>
      </div>
    </main>
  )
}
