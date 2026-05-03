import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import cron from 'node-cron'
import { analysesRoutes } from './routes/analyses'
import { chatRoutes } from './routes/chat'
import { profileRoutes } from './routes/profile'
import { subscriptionRoutes } from './routes/subscription'
import { pushTokensRoutes } from './routes/push-tokens'
import { sendReanalysisNotifications } from './services/notification.service'

const app = Fastify({ logger: true })

async function bootstrap() {
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

  await app.register(profileRoutes)
  await app.register(analysesRoutes)
  await app.register(chatRoutes)
  await app.register(subscriptionRoutes)
  await app.register(pushTokensRoutes)

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
