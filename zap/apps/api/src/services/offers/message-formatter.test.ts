import { describe, it, expect } from 'vitest'
import { formatOfferMessage, FormatOfferMessageInput } from './message-formatter.js'

describe('formatOfferMessage', () => {
  it('should format message with discount percentage', () => {
    const input: FormatOfferMessageInput = {
      productTitle: 'iPhone 15 Pro',
      originalPrice: 5000,
      discountedPrice: 3990,
      affiliateUrl: 'https://aff.shopee.com/item/123',
      marketplace: 'shopee',
    }

    const result = formatOfferMessage(input)

    expect(result).toContain('🏪 OFERTA DO DIA')
    expect(result).toContain('iPhone 15 Pro')
    expect(result).toContain('💰 De: R$5000.00 Por: R$3990.00 (-20%)')
    expect(result).toContain('https://aff.shopee.com/item/123')
    expect(result).toContain('Shopee')
  })

  it('should format message without original price', () => {
    const input: FormatOfferMessageInput = {
      productTitle: 'Samsung Galaxy S24',
      discountedPrice: 2999,
      affiliateUrl: 'https://aff.mercadolivre.com/item/456',
      marketplace: 'mercadolivre',
    }

    const result = formatOfferMessage(input)

    expect(result).toContain('Samsung Galaxy S24')
    expect(result).toContain('💰 Preço: R$2999.00')
    expect(result).toContain('Mercado Livre')
    expect(result).not.toContain('(-')
  })

  it('should format Amazon marketplace correctly', () => {
    const input: FormatOfferMessageInput = {
      productTitle: 'MacBook Air M3',
      originalPrice: 8000,
      discountedPrice: 6500,
      affiliateUrl: 'https://aff.amazon.com/item/789',
      marketplace: 'amazon',
    }

    const result = formatOfferMessage(input)

    expect(result).toContain('Amazon')
    expect(result).toContain('(-19%)')
  })

  it('should include clickable link', () => {
    const affiliateUrl = 'https://my-aff-link.com/special-offer'
    const input: FormatOfferMessageInput = {
      productTitle: 'Test Product',
      discountedPrice: 99.99,
      affiliateUrl,
      marketplace: 'shopee',
    }

    const result = formatOfferMessage(input)

    expect(result).toContain(`🔗 Clique aqui: ${affiliateUrl}`)
  })

  it('should handle zero discount correctly', () => {
    const input: FormatOfferMessageInput = {
      productTitle: 'Product',
      originalPrice: 100,
      discountedPrice: 100,
      affiliateUrl: 'https://link.com',
      marketplace: 'mercadolivre',
    }

    const result = formatOfferMessage(input)

    expect(result).toContain('💰 Preço: R$100.00')
    expect(result).not.toContain('(-0%)')
  })
})
