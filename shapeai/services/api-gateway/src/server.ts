import 'dotenv/config'
import { webcrypto } from 'crypto'
// Node.js 18 não expõe `crypto` como global — necessário para jose e AWS SDK
if (typeof (globalThis as Record<string, unknown>).crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: false, configurable: true })
}
import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import cron from 'node-cron'
import { analysesRoutes } from './routes/analyses'
import { chatRoutes } from './routes/chat'
import { profileRoutes } from './routes/profile'
import { subscriptionRoutes } from './routes/subscription'
import { pushTokensRoutes } from './routes/push-tokens'
import { inviteRoutes } from './routes/invite'
import { sendReanalysisNotifications } from './services/notification.service'
import { runMigrations } from './db/migrate'
import { pool } from './db/client'

const app = Fastify({ logger: true })

async function bootstrap() {
  await runMigrations(pool)

  await app.register(cors, { origin: true })

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
  })

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  app.setErrorHandler((error: Error & { statusCode?: number }, request, reply) => {
    console.error('=== ROUTE ERROR ===', error.message, '\n', error.stack)
    reply.status(error.statusCode ?? 500).send({
      error: error.message || 'Internal Server Error',
      stack: error.stack?.split('\n').slice(0, 3).join(' | '),
    })
  })

  app.get('/debug/env', async () => ({
    DATABASE_URL: !!process.env.DATABASE_URL,
    AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET ?? 'NOT SET',
    AWS_REGION: process.env.AWS_REGION ?? 'NOT SET',
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    AI_ENGINE_URL: process.env.AI_ENGINE_URL ?? 'NOT SET',
    INTERNAL_SECRET: !!process.env.INTERNAL_SECRET,
  }))

  await app.register(profileRoutes)
  await app.register(analysesRoutes)
  await app.register(chatRoutes)
  await app.register(subscriptionRoutes)
  await app.register(pushTokensRoutes)
  await app.register(inviteRoutes)

  app.post('/internal/notifications/trigger', async (_req, reply) => {
    sendReanalysisNotifications().catch((err) =>
      console.error('[manual trigger] notification job failed:', err)
    )
    return reply.send({ ok: true, message: 'Notification job triggered' })
  })

  cron.schedule('0 9 * * *', () => {
    sendReanalysisNotifications().catch((err) =>
      console.error('[cron] notification job failed:', err)
    )
  })

  const port = parseInt(process.env.PORT ?? '3000', 10)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`api-gateway listening on :${port}`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})

export { app }
