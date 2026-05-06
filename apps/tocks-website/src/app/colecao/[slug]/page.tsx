import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductLayout } from '@/components/templates/product-layout'
import { PRODUCTS, getProductBySlug } from '@/data/products'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return {}

  return {
    title: `${product.name} — ${product.tagline}`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Tocks Custom`,
      description: product.description,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return <ProductLayout product={product} />
}
