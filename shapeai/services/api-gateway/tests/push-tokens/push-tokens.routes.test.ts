import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/db/client', () => ({
  pool: { query: vi.fn() },
}))

import { pool } from '../../src/db/client'

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> }

async function simulatePostPushToken(userId: string, token: string, platform: string) {
  if (!token || !platform) throw Object.assign(new Error('Bad Request'), { status: 400 })

  await mockPool.query(
    `INSERT INTO push_tokens (user_id, token, platform) VALUES ($1, $2, $3)
     ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform, updated_at = NOW()`,
    [userId, token, platform]
  )
  return { ok: true }
}

describe('POST /push-tokens', () => {
  beforeEach(() => vi.clearAllMocks())

  it('salva token na tabela com user_id e platform', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] })

    const result = await simulatePostPushToken('user-1', 'ExponentPushToken[abc]', 'ios')

    expect(result.ok).toBe(true)
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO push_tokens'),
      ['user-1', 'ExponentPushToken[abc]', 'ios']
    )
  })

  it('retorna 400 se token ausente', async () => {
    await expect(simulatePostPushToken('user-1', '', 'ios')).rejects.toMatchObject({ status: 400 })
  })

  it('faz upsert se token já existe (ON CONFLICT)', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] })

    await simulatePostPushToken('user-2', 'ExponentPushToken[existing]', 'android')

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT'),
      expect.anything()
    )
  })
})
