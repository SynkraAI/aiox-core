import { FastifyInstance } from 'fastify'
import { pool } from '../db/client'
import { requireAuth } from '../middleware/auth'
import { getSubscriptionStatus } from '../services/subscription.service'

interface RevenueCatEvent {
  type: string
  app_user_id: string
  expiration_at_ms?: number
}

export async function subscriptionRoutes(app: FastifyInstance) {
  app.get('/subscription/status', { preHandler: requireAuth }, async (request, reply) => {
    const status = await getSubscriptionStatus(pool, request.authUser.id)
    return reply.send(status)
  })

  app.post('/subscription/webhook', async (request, reply) => {
    const secret = request.headers['x-revenuecat-secret']
    if (!secret || secret !== process.env.REVENUECAT_WEBHOOK_SECRET) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const body = request.body as { event: RevenueCatEvent }
    const { type, app_user_id, expiration_at_ms } = body.event

    if (type === 'INITIAL_PURCHASE' || type === 'RENEWAL') {
      const expiresAt = expiration_at_ms ? new Date(expiration_at_ms).toISOString() : null
      await pool.query(
        `UPDATE users SET subscription_status = 'pro', subscription_expires_at = $1 WHERE id = $2`,
        [expiresAt, app_user_id]
      )
    } else if (type === 'EXPIRATION') {
      await pool.query(
        `UPDATE users SET subscription_status = 'free', subscription_expires_at = NULL WHERE id = $1`,
        [app_user_id]
      )
    }

    return reply.status(200).send({ received: true })
  })
}
