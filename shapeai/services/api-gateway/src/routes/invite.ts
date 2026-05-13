import { FastifyInstance } from 'fastify'
import { pool } from '../db/client'
import { requireAuth } from '../middleware/auth'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'SHAPE-'
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function inviteRoutes(app: FastifyInstance) {
  // Gerar códigos — INTERNAL_SECRET (server-to-server) ou JWT + email admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminOrInternalAuth = async (request: any, reply: any) => {
    const internalSecret = process.env.INTERNAL_SECRET
    if (internalSecret && request.headers['x-internal-secret'] === internalSecret) return
    await requireAuth(request, reply)
  }

  app.post<{ Body: { quantity?: number } }>(
    '/invite/generate',
    { preHandler: adminOrInternalAuth },
    async (request, reply) => {
      const internalSecret = process.env.INTERNAL_SECRET
      const isInternal = internalSecret && request.headers['x-internal-secret'] === internalSecret

      if (!isInternal) {
        const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
        const { rows: user } = await pool.query('SELECT email FROM users WHERE id = $1', [request.authUser.id])
        if (!adminEmails.includes(user[0]?.email)) {
          return reply.status(403).send({ error: 'Acesso restrito' })
        }
      }

      const quantity = Math.min(request.body?.quantity ?? 1, 50)
      const createdBy = (request as { authUser?: { id: string } }).authUser?.id ?? null
      const codes: string[] = []

      for (let i = 0; i < quantity; i++) {
        let code = generateCode()
        let attempts = 0
        while (attempts < 5) {
          try {
            await pool.query(
              'INSERT INTO invite_codes (code, created_by) VALUES ($1, $2)',
              [code, createdBy]
            )
            codes.push(code)
            break
          } catch {
            code = generateCode()
            attempts++
          }
        }
      }

      return reply.send({ codes })
    }
  )

  // Resgatar código — qualquer usuário autenticado
  app.post<{ Body: { code: string } }>(
    '/invite/redeem',
    { preHandler: requireAuth },
    async (request, reply) => {
      const code = (request.body?.code ?? '').trim().toUpperCase()
      if (!code) return reply.status(400).send({ error: 'Código inválido' })

      const { rows } = await pool.query(
        'SELECT * FROM invite_codes WHERE code = $1',
        [code]
      )

      if (!rows.length) return reply.status(404).send({ error: 'Código não encontrado' })

      const invite = rows[0]
      if (invite.used_by) return reply.status(409).send({ error: 'Código já utilizado' })
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        return reply.status(410).send({ error: 'Código expirado' })
      }

      await pool.query('BEGIN')
      try {
        await pool.query(
          'UPDATE invite_codes SET used_by = $1, used_at = NOW() WHERE code = $2',
          [request.authUser.id, code]
        )
        await pool.query(
          "UPDATE users SET subscription_status = 'pro', subscription_expires_at = '2099-12-31' WHERE id = $1",
          [request.authUser.id]
        )
        await pool.query('COMMIT')
      } catch (e) {
        await pool.query('ROLLBACK')
        throw e
      }

      return reply.send({ ok: true, message: 'Plano Pro ativado com sucesso!' })
    }
  )
}
