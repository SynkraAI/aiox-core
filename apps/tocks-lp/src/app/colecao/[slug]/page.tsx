import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Breadcrumbs from '@/components/shared/breadcrumbs'
import { PRODUCTS } from '@/data/products'
import { WOOD_FINISHES, FABRIC_FINISHES } from '@/data/finishes'
import ProductCta from './product-cta'

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const product = PRODUCTS.find((p) => p.slug === slug)
    if (!product) return {}
    return {
      title: `Mesa ${product.name} | Tocks Custom`,
      description: `${product.tagline}. Mesa de bilhar artesanal em madeira macica a partir de R$ ${product.price.toLocaleString('pt-BR')}.`,
    }
  })
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR')
}

function formatInstallment(price: number): string {
  return Math.ceil(price / 6).toLocaleString('pt-BR')
}

function getProductSpecs(product: (typeof PRODUCTS)[number]) {
  return [
    { label: 'Dimensões', value: product.specs.dimensions, icon: '↔' },
    { label: 'Material', value: product.specs.material, icon: '◆' },
    { label: 'Peso', value: product.specs.weight, icon: '◎' },
    { label: 'Ardósia', value: product.specs.slate, icon: '▣' },
    { label: 'Tecido', value: product.specs.fabric, icon: '◐' },
    { label: 'Garantia', value: '5 anos', icon: '✓' },
  ]
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = PRODUCTS.find((p) => p.slug === slug)

  if (!product) notFound()

  const lineLabel = product.line === 'criativa' ? 'Linha Criativa' : 'Linha Premium'

  const related = PRODUCTS.filter(
    (p) => p.line === product.line && p.id !== product.id
  ).slice(0, 3)

  return (
    <>
      {/* Hero Image */}
      <section className="relative w-full h-[60vh] md:h-[75vh] bg-bg-secondary">
        <Image
          src={product.image}
          alt={`Mesa de sinuca ${product.name} - Tocks Custom`}
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent" />

        {/* Breadcrumbs */}
        <div className="absolute top-28 left-6 md:left-12">
          <Breadcrumbs items={[
            { label: 'Coleção', href: '/colecao' },
            { label: product.name },
          ]} />
        </div>
      </section>

      {/* Product Info */}
      <section className="max-w-5xl mx-auto px-6 -mt-32 relative z-10 pb-24">
        {/* Line Badge */}
        <span className="inline-block text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-4 py-1.5 rounded-full mb-6">
          {lineLabel}
        </span>

        <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl lg:text-8xl font-semibold text-[var(--color-text-primary)] mb-4">
          {product.name}
        </h1>

        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mb-4">
          {product.tagline}
        </p>

        <p className="text-base text-[var(--color-text-secondary)]/80 max-w-2xl mb-10 leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <div className="mb-16">
          <p className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            A partir de R$ {formatPrice(product.price)}
          </p>
          <p className="text-[var(--color-text-secondary)] mt-2">
            ou 6x de R$ {formatInstallment(product.price)} sem juros
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-24">
          {getProductSpecs(product).map((spec) => (
            <div
              key={spec.label}
              className="border border-[var(--color-border)] rounded-sm p-6 text-center"
            >
              <span className="text-2xl mb-3 block text-[var(--color-accent)]">
                {spec.icon}
              </span>
              <p className="text-sm text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">
                {spec.label}
              </p>
              <p className="font-[family-name:var(--font-heading)] text-lg text-[var(--color-text-primary)]">
                {spec.value}
              </p>
            </div>
          ))}
        </div>

        {/* Finishes: Wood */}
        <div className="mb-16">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-[var(--color-text-primary)] mb-2">
            Acabamentos em Madeira
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8">
            10 opcoes de acabamento em madeira macica
          </p>
          <div className="flex flex-wrap gap-4">
            {WOOD_FINISHES.map((finish) => (
              <div key={finish.name} className="group text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors duration-300 mx-auto">
                  <Image
                    src={finish.image}
                    alt={finish.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2 max-w-[80px] mx-auto">
                  {finish.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Finishes: Fabric */}
        <div className="mb-24">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-[var(--color-text-primary)] mb-2">
            Tecidos do Pano
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8">
            16 cores de tecido profissional
          </p>
          <div className="flex flex-wrap gap-4">
            {FABRIC_FINISHES.map((finish) => (
              <div key={finish.name} className="group text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors duration-300 mx-auto">
                  <Image
                    src={finish.image}
                    alt={finish.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2 max-w-[64px] mx-auto">
                  {finish.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scarcity */}
        <p className="text-center text-accent/70 text-sm tracking-wide mb-16">
          Produção artesanal limitada — tempo de fabricação atual: 45 a 60 dias
        </p>

        {/* CTA */}
        <ProductCta productName={product.name} />
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-[var(--color-border)] py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-[var(--color-text-primary)] mb-12 text-center">
              Outros modelos da {lineLabel}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/colecao/${item.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-bg-secondary border border-border flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={`Mesa de sinuca ${item.name} - Tocks Custom`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain p-2 transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-text-primary)]">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[var(--color-accent)]">
                      A partir de R$ {formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </>
  )
}
