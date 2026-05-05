import { FastifyRequest, FastifyReply } from 'fastify'
import { pool } from '../db/client'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export interface AuthUser {
  id: string
  email: string
  subscription_status: 'free' | 'pro'
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser: AuthUser
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://woszcxqnaulwoilxvnmz.supabase.co'
const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`))

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) throw new Error('No token')

    const token = authHeader.slice(7)
    const { payload } = await jwtVerify(token, JWKS)

    const userId = payload.sub as string
    const email = (payload as Record<string, unknown>).email as string ?? ''

    const { rows } = await pool.query<AuthUser>(
      `INSERT INTO users (id, email)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, email, subscription_status`,
      [userId, email]
    )

    request.authUser = rows[0]
  } catch (err) {
    console.error('[auth] verification failed:', err)
    reply.status(401).send({ error: 'Unauthorized' })
  }
}
