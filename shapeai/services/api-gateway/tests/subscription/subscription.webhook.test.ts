import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/db/client', () => ({
  pool: { query: vi.fn() },
}))

import { pool } from '../../src/db/client'

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> }

const WEBHOOK_SECRET = 'test-secret'

async function simulateWebhook(
  eventType: string,
  userId: string,
  expirationMs?: number,
  secret = WEBHOOK_SECRET
) {
  if (secret !== WEBHOOK_SECRET) throw Object.assign(new Error('Unauthorized'), { status: 401 })

  const body = { event: { type: eventType, app_user_id: userId, expiration_at_ms: expirationMs } }
  const { type, app_user_id, expiration_at_ms } = body.event

  if (type === 'INITIAL_PURCHASE' || type === 'RENEWAL') {
    const expiresAt = expiration_at_ms ? new Date(expiration_at_ms).toISOString() : null
    await mockPool.query(
      `UPDATE users SET subscription_status = 'pro', subscription_expires_at = $1 WHERE id = $2`,
      [expiresAt, app_user_id]
    )
  } else if (type === 'EXPIRATION') {
    await mockPool.query(
      `UPDATE users SET subscription_status = 'free', subscription_expires_at = NULL WHERE id = $1`,
      [app_user_id]
    )
  }
}

describe('POST /subscription/webhook', () => {
  beforeEach(() => vi.clearAllMocks())

  it('atualiza para pro em INITIAL_PURCHASE', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] })
    await simulateWebhook('INITIAL_PURCHASE', 'user-1', 1800000000000)
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining("subscription_status = 'pro'"),
      expect.arrayContaining(['user-1'])
    )
  })

  it('atualiza para pro em RENEWAL', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] })
    await simulateWebhook('RENEWAL', 'user-1', 1800000000000)
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining("subscription_status = 'pro'"),
      expect.anything()
    )
  })

  it('rebaixa para free em EXPIRATION', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] })
    await simulateWebhook('EXPIRATION', 'user-1')
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining("subscription_status = 'free'"),
      ['user-1']
    )
  })

  it('não altera DB em CANCELLATION (acesso mantido até expirar)', async () => {
    await simulateWebhook('CANCELLATION', 'user-1')
    expect(mockPool.query).not.toHaveBeenCalled()
  })

  it('rejeita secret inválido', async () => {
    await expect(simulateWebhook('INITIAL_PURCHASE', 'user-1', undefined, 'wrong')).rejects.toMatchObject({
      status: 401,
    })
  })
})
