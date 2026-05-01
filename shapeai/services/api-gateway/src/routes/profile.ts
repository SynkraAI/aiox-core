import { FastifyInstance } from 'fastify'
import { pool } from '../db/client'
import { requireAuth } from '../middleware/auth'

interface ProfileBody {
  height_cm: number
  weight_kg: number
  biological_sex: 'M' | 'F'
  primary_goal: 'hypertrophy' | 'fat_loss' | 'conditioning'
  notifications_enabled: boolean
}

export async function profileRoutes(app: FastifyInstance) {
  app.get('/profile', { preHandler: requireAuth }, async (request, reply) => {
    const { rows } = await pool.query(
      `SELECT * FROM user_profiles WHERE user_id = $1`,
      [request.authUser.id]
    )
    if (!rows[0]) return reply.status(404).send({ error: 'Profile not found' })
    return reply.send(rows[0])
  })

  app.post<{ Body: ProfileBody }>('/profile', { preHandler: requireAuth }, async (request, reply) => {
    const { height_cm, weight_kg, biological_sex, primary_goal } = request.body
    const userId = request.authUser.id

    try {
      const { rows } = await pool.query(
        `INSERT INTO user_profiles (user_id, height_cm, weight_kg, biological_sex, primary_goal)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, height_cm, weight_kg, biological_sex, primary_goal]
      )
      return reply.status(201).send(rows[0])
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e.code === '23505') return reply.status(409).send({ error: 'Profile already exists' })
      throw err
    }
  })

  app.patch<{ Body: Partial<ProfileBody> }>('/profile', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.authUser.id
    const updates = request.body
    const fields = Object.keys(updates) as (keyof ProfileBody)[]

    if (fields.length === 0) return reply.status(400).send({ error: 'No fields to update' })

    const setClauses = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
    const values = [userId, ...fields.map((f) => updates[f])]

    const { rows } = await pool.query(
      `UPDATE user_profiles SET ${setClauses}, updated_at = NOW()
       WHERE user_id = $1 RETURNING *`,
      values
    )

    if (!rows[0]) return reply.status(404).send({ error: 'Profile not found' })
    return reply.send(rows[0])
  })
}
