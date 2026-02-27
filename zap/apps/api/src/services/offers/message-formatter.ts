/**
 * Format offer messages for WhatsApp distribution
 * AC-049.2: Message format for offers
 */

export interface FormatOfferMessageInput {
  productTitle: string
  originalPrice?: number
  discountedPrice: number
  affiliateUrl: string
  marketplace: 'shopee' | 'mercadolivre' | 'amazon'
}

export function formatOfferMessage(data: FormatOfferMessageInput): string {
  const discountPercent =
    data.originalPrice && data.discountedPrice
      ? Math.round(((data.originalPrice - data.discountedPrice) / data.originalPrice) * 100)
      : 0

  const marketplaceLabel = {
    shopee: 'Shopee',
    mercadolivre: 'Mercado Livre',
    amazon: 'Amazon',
  }[data.marketplace]

  const priceSection =
    data.originalPrice && discountPercent > 0
      ? `💰 De: R$${data.originalPrice.toFixed(2)} Por: R$${data.discountedPrice.toFixed(2)} (-${discountPercent}%)`
      : `💰 Preço: R$${data.discountedPrice.toFixed(2)}`

  return `🏪 OFERTA DO DIA

${data.productTitle}
${priceSection}

🔗 Clique aqui: ${data.affiliateUrl}

${marketplaceLabel}`
}
