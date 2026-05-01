import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/db/client', () => ({
  pool: { query: vi.fn() },
}))

import { pool } from '../../src/db/client'
import { getSubscriptionStatus } from '../../src/services/subscription.service'

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> }

describe('getSubscriptionStatus', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna status free com expires_at null', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ subscription_status: 'free', subscription_expires_at: null }],
    })
    const result = await getSubscriptionStatus(mockPool as never, 'user-123')
    expect(result).toEqual({ status: 'free', expires_at: null })
  })

  it('retorna status pro com expires_at preenchido', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ subscription_status: 'pro', subscription_expires_at: '2026-06-01T00:00:00Z' }],
    })
    const result = await getSubscriptionStatus(mockPool as never, 'user-123')
    expect(result).toEqual({ status: 'pro', expires_at: '2026-06-01T00:00:00Z' })
  })

  it('lança erro se usuário não encontrado', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] })
    await expect(getSubscriptionStatus(mockPool as never, 'user-404')).rejects.toThrow('User not found')
  })
})
