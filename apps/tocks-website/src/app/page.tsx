import { Hero } from '@/components/organisms/hero'
import { CtaBlock } from '@/components/organisms/cta-block'
import { ImageGrid } from '@/components/organisms/image-grid'
import { ProductCard } from '@/components/molecules/product-card'
import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'
import { Button } from '@/components/atoms/button'
import { PRODUCTS } from '@/data/products'
import { BRAND_COPY, WHATSAPP_URL } from '@/lib/constants'

const PROJECTS = [
  { label: 'Residencia em Sao Paulo', caption: '\u2014 Ricardo, Sao Paulo' },
  { label: 'Casa em Florianopolis', caption: '\u2014 Beatriz, Florianopolis' },
  { label: 'Apto em Curitiba', caption: '\u2014 Henrique, Curitiba' },
]

export default function HomePage() {
  const featured = [
    ...PRODUCTS.filter((p) => p.isNew),
    ...PRODUCTS.filter((p) => !p.isNew),
  ].slice(0, 4)

  return (
    <>
      <Hero />

      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <div>
              <Text variant="label" className="mb-3">Acervo</Text>
              <Heading as="h2">{BRAND_COPY.collection.headline}</Heading>
            </div>
            <Button href="/colecao" variant="ghost">
              Ver todas as pecas &rarr;
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((p, index) => (
              <ProductCard key={p.slug} product={p} variant="editorial" staggerIndex={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-[var(--surface)]">
        <div className="container-custom">
          <div className="mb-12 max-w-xl">
            <Text variant="label" className="mb-3">Ambientes transformados</Text>
            <Heading as="h2">{BRAND_COPY.projects.headline}</Heading>
            <Text className="mt-4">{BRAND_COPY.projects.subtitle}</Text>
          </div>
          <ImageGrid items={PROJECTS} variant="project" />
        </div>
      </section>

      <CtaBlock
        headline="Transforme seu espaco"
        subtitle={BRAND_COPY.contact.subtitle}
        ctaLabel={BRAND_COPY.hero.cta_primary}
        ctaHref={WHATSAPP_URL}
        external
      />
    </>
  )
}
