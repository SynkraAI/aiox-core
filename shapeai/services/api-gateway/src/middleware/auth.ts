import { FastifyRequest, FastifyReply } from 'fastify'
import { pool } from '../db/client'

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

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()

    const payload = request.user as { sub: string; email: string }
    const userId = payload.sub

    // Upsert user from Supabase JWT claims
    const { rows } = await pool.query<AuthUser>(
      `INSERT INTO users (id, email)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, email, subscription_status`,
      [userId, payload.email]
    )

    request.authUser = rows[0]
  } catch {
    reply.status(401).send({ error: 'Unauthorized' })
  }
}
