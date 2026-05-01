import { FastifyInstance } from 'fastify'
import { pool } from '../db/client'
import { requireAuth } from '../middleware/auth'

interface PushTokenBody {
  token: string
  platform: 'ios' | 'android'
}

export async function pushTokensRoutes(app: FastifyInstance) {
  app.post<{ Body: PushTokenBody }>('/push-tokens', { preHandler: requireAuth }, async (request, reply) => {
    const { token, platform } = request.body
    const userId = request.authUser.id

    if (!token || !platform) {
      return reply.status(400).send({ error: 'token and platform are required' })
    }

    await pool.query(
      `INSERT INTO push_tokens (user_id, token, platform)
       VALUES ($1, $2, $3)
       ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform, updated_at = NOW()`,
      [userId, token, platform]
    )

    return reply.status(201).send({ ok: true })
  })
}
