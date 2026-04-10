import { COMPANY } from '@/data/company'
import { PRODUCTS } from '@/data/products'

function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${COMPANY.url}/#business`,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    description: COMPANY.description,
    url: COMPANY.url,
    telephone: COMPANY.phoneDisplay,
    taxID: COMPANY.cnpj,
    priceRange: COMPANY.priceRange,
    foundingDate: String(COMPANY.foundingYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.state,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    sameAs: [COMPANY.socialMedia.instagram],
    image: `${COMPANY.url}/images/og-image.jpg`,
  }
}

function getProductSchemas() {
  return PRODUCTS.map((product) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Mesa de Bilhar ${product.name}`,
    description: product.tagline,
    image: `${COMPANY.url}${product.image}`,
    url: COMPANY.url,
    brand: {
      '@type': 'Brand',
      name: COMPANY.name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: COMPANY.name,
      },
    },
    category: 'Mesas de Bilhar',
    material: 'Madeira Macica',
  }))
}

export default function JsonLd() {
  const localBusiness = getLocalBusinessSchema()
  const products = getProductSchemas()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(products) }}
      />
    </>
  )
}
