import 'dotenv/config'
import Fastify from 'fastify'
import fjwt from '@fastify/jwt'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { analysesRoutes } from './routes/analyses'
import { profileRoutes } from './routes/profile'

const app = Fastify({ logger: true })

async function bootstrap() {
  await app.register(cors, { origin: true })

  await app.register(fjwt, {
    secret: process.env.SUPABASE_JWT_SECRET!,
    verify: { algorithms: ['HS256'] },
  })

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

  const port = parseInt(process.env.PORT ?? '3000', 10)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`api-gateway listening on :${port}`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})

export { app }
