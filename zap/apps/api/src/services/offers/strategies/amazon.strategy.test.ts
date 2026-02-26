import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AmazonStrategy } from './amazon.strategy.js'
import { supabaseAdmin } from '../../db/client.js'

vi.mock('../../db/client.js', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}))

vi.mock('../../lib/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('AmazonStrategy', () => {
  let strategy: AmazonStrategy
  const tenantId = 'tenant-456'
  const associatesId = 'synkra-20'
  const asin = 'B012345678' // 10 characters: B + 9 alphanumerics

  beforeEach(() => {
    strategy = new AmazonStrategy()
    vi.clearAllMocks()
  })

  describe('AC-046.1: Link construction works', () => {
    it('builds valid Amazon link with correct format', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: associatesId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink(asin, tenantId)

      expect(link).toBe(`https://amazon.com.br/dp/${asin}?tag=${associatesId}`)
    })

    it('includes ASIN in link', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: associatesId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink('B098765432', tenantId)
      expect(link).toContain('dp/B098765432')
    })

    it('includes associates ID in link as tag parameter', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: 'custom-associates-20',
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink(asin, tenantId)
      expect(link).toContain('tag=custom-associates-20')
    })
  })

  describe('AC-046: Fetches credentials from marketplace_credentials', () => {
    it('queries marketplace_credentials table', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: associatesId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await strategy.buildLink(asin, tenantId)

      expect(supabaseAdmin.from).toHaveBeenCalledWith('marketplace_credentials')
    })

    it('selects correct field (amazon_associates_id)', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: associatesId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await strategy.buildLink(asin, tenantId)

      expect(mockSelect).toHaveBeenCalledWith('amazon_associates_id')
    })

    it('filters by tenant_id', async () => {
      const mockEq = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            amazon_associates_id: associatesId,
          },
          error: null,
        }),
      })

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await strategy.buildLink(asin, tenantId)

      expect(mockEq).toHaveBeenCalledWith('tenant_id', tenantId)
    })
  })

  describe('AC-046.4: Handles missing credentials gracefully', () => {
    it('throws if associates ID not configured', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await expect(strategy.buildLink(asin, tenantId)).rejects.toThrow('Amazon not configured')
    })

    it('throws if database fetch fails', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await expect(strategy.buildLink(asin, tenantId)).rejects.toThrow('Amazon not configured')
    })

    it('throws if associates ID is empty string', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: '',
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await expect(strategy.buildLink(asin, tenantId)).rejects.toThrow('Amazon not configured')
    })

    it('throws if associates ID is null', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: null,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await expect(strategy.buildLink(asin, tenantId)).rejects.toThrow('Amazon not configured')
    })
  })

  describe('AC-046.5: Link construction is deterministic', () => {
    it('produces identical output for same inputs', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: associatesId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link1 = await strategy.buildLink(asin, tenantId)
      const link2 = await strategy.buildLink(asin, tenantId)

      expect(link1).toBe(link2)
      expect(link1).toBe(`https://amazon.com.br/dp/${asin}?tag=${associatesId}`)
    })

    it('produces different output for different ASINs', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: associatesId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link1 = await strategy.buildLink('B011111111', tenantId)
      const link2 = await strategy.buildLink('B022222222', tenantId)

      expect(link1).not.toBe(link2)
      expect(link1).toContain('dp/B011111111')
      expect(link2).toContain('dp/B022222222')
    })

    it('produces different output for different associates IDs', async () => {
      const createMockSelect = (id: string) =>
        vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                amazon_associates_id: id,
              },
              error: null,
            }),
          }),
        })

      ;(supabaseAdmin.from as any)
        .mockReturnValueOnce({ select: createMockSelect('assoc-1-20') })
        .mockReturnValueOnce({ select: createMockSelect('assoc-2-20') })

      const link1 = await strategy.buildLink(asin, tenantId)
      ;(supabaseAdmin.from as any).mockReturnValue({
        select: createMockSelect('assoc-2-20'),
      })
      const link2 = await strategy.buildLink(asin, tenantId)

      expect(link1).not.toBe(link2)
    })
  })

  describe('ASIN validation', () => {
    it('rejects empty ASIN', async () => {
      await expect(strategy.buildLink('', tenantId)).rejects.toThrow('Invalid Amazon ASIN')
    })

    it('rejects ASIN not starting with B', async () => {
      await expect(strategy.buildLink('A0123456789', tenantId)).rejects.toThrow('Invalid Amazon ASIN')
    })

    it('rejects ASIN with incorrect length', async () => {
      await expect(strategy.buildLink('B01234567', tenantId)).rejects.toThrow('Invalid Amazon ASIN') // 9 chars
      await expect(strategy.buildLink('B012345678901', tenantId)).rejects.toThrow('Invalid Amazon ASIN') // 12 chars
    })

    it('rejects ASIN with invalid characters', async () => {
      await expect(strategy.buildLink('B012345678!', tenantId)).rejects.toThrow('Invalid Amazon ASIN')
      await expect(strategy.buildLink('B0123456789-', tenantId)).rejects.toThrow('Invalid Amazon ASIN')
    })

    it('rejects ASIN with lowercase letters', async () => {
      await expect(strategy.buildLink('B0123456abc', tenantId)).rejects.toThrow('Invalid Amazon ASIN')
    })

    it('accepts valid ASIN with uppercase letters and digits', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: associatesId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink('B0ABCDEFGH', tenantId)
      expect(link).toContain('B0ABCDEFGH')
    })

    it('rejects null ASIN', async () => {
      await expect(strategy.buildLink(null as any, tenantId)).rejects.toThrow('Invalid Amazon ASIN')
    })
  })

  describe('Edge cases', () => {
    it('handles very long associates ID', async () => {
      const longId = 'very-long-associates-id-with-many-characters-20'

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: longId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink(asin, tenantId)
      expect(link).toContain(`tag=${longId}`)
    })

    it('handles associates ID with special valid characters', async () => {
      const specialId = 'my-assoc_id-20'

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: specialId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink(asin, tenantId)
      expect(link).toContain(`tag=${specialId}`)
    })

    it('validates ASIN with all uppercase letters', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: associatesId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink('BABCDEFGHI', tenantId)
      expect(link).toContain('BABCDEFGHI')
    })

    it('validates ASIN with all digits after B', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              amazon_associates_id: associatesId,
            },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink('B012345678', tenantId)
      expect(link).toContain('B012345678')
    })
  })
})
