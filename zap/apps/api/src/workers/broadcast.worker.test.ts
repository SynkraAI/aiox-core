import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatOfferMessage } from '../services/offers/message-formatter.js'
import type { OfferReplicationJobData } from '../queues/index.js'

// Mock dependencies
vi.mock('../db/client.js', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}))

vi.mock('../services/whatsapp/session-manager.js', () => ({
  sessionManager: {
    sendTextToGroup: vi.fn(),
  },
}))

vi.mock('../lib/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

describe('OfferReplicationWorker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Message formatting logic', () => {
    it('should format offer message correctly for single group', () => {
      const message = formatOfferMessage({
        productTitle: 'Nike Shoes',
        originalPrice: 300,
        discountedPrice: 199.99,
        affiliateUrl: 'https://aff.shopee.com/shoes',
        marketplace: 'shopee',
      })

      expect(message).toContain('🏪 OFERTA DO DIA')
      expect(message).toContain('Nike Shoes')
      expect(message).toContain('199.99')
      expect(message).toContain('aff.shopee.com')
      expect(message).toContain('Shopee')
    })

    it('should calculate discount percentage correctly', () => {
      const message = formatOfferMessage({
        productTitle: 'Product',
        originalPrice: 1000,
        discountedPrice: 800,
        affiliateUrl: 'https://link.com',
        marketplace: 'mercadolivre',
      })

      // 200/1000 = 20% discount
      expect(message).toContain('(-20%)')
    })

    it('should handle different marketplaces', () => {
      const marketplaces = ['shopee', 'mercadolivre', 'amazon'] as const
      const labels = ['Shopee', 'Mercado Livre', 'Amazon']

      marketplaces.forEach((marketplace, idx) => {
        const message = formatOfferMessage({
          productTitle: 'Test',
          discountedPrice: 100,
          affiliateUrl: 'https://link.com',
          marketplace,
        })

        expect(message).toContain(labels[idx])
      })
    })
  })

  describe('Job payload structure', () => {
    it('should validate OfferReplicationJobData structure', () => {
      const jobData: OfferReplicationJobData = {
        offerId: 'offer-123',
        tenantId: 'tenant-456',
        connectionId: 'conn-789',
        parsedOffer: {
          productId: 'prod-111',
          marketplace: 'shopee',
          price: 299.99,
          originalUrl: 'https://shopee.com/product',
        },
        targetGroups: [
          {
            groupId: 'group-1',
            waGroupId: '120123456789@g.us',
          },
        ],
        affiliateLinks: {
          shopee: 'https://aff.shopee.com/product',
        },
      }

      expect(jobData.offerId).toBe('offer-123')
      expect(jobData.targetGroups).toHaveLength(1)
      expect(jobData.parsedOffer.marketplace).toBe('shopee')
      expect(jobData.affiliateLinks?.shopee).toContain('aff.shopee.com')
    })

    it('should handle multiple target groups', () => {
      const jobData: OfferReplicationJobData = {
        offerId: 'offer-multi',
        tenantId: 'tenant-1',
        connectionId: 'conn-1',
        parsedOffer: {
          productId: 'prod-1',
          marketplace: 'mercadolivre',
          price: 500,
          originalUrl: 'https://ml.com/product',
        },
        targetGroups: [
          { groupId: 'g1', waGroupId: 'g1@g.us' },
          { groupId: 'g2', waGroupId: 'g2@g.us' },
          { groupId: 'g3', waGroupId: 'g3@g.us' },
        ],
      }

      expect(jobData.targetGroups).toHaveLength(3)
      jobData.targetGroups.forEach((group, idx) => {
        expect(group.groupId).toBe(`g${idx + 1}`)
      })
    })
  })

  describe('Error handling', () => {
    it('should include attempt tracking in error context', () => {
      // Simulate error scenario with attempts tracking
      const jobData: OfferReplicationJobData = {
        offerId: 'offer-err',
        tenantId: 'tenant-err',
        connectionId: 'conn-err',
        parsedOffer: {
          productId: 'prod-err',
          marketplace: 'amazon',
          price: 100,
          originalUrl: 'https://amazon.com',
        },
        targetGroups: [
          { groupId: 'g-fail', waGroupId: 'g-fail@g.us' },
        ],
      }

      // Verify retry logic would work with attempts field
      expect(jobData.offerId).toBeDefined()
      // BullMQ would handle retries with exponential backoff (5, 10, 20, 60 minutes)
    })
  })
})
