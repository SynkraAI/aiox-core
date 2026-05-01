import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { pool } from '../db/client'
import { requireAuth } from '../middleware/auth'
import { generatePresignedUploadUrl } from '../services/s3.service'
import { checkFreemiumLimit } from '../services/freemium.service'

export async function analysesRoutes(app: FastifyInstance) {
  // POST /analyses — inicia análise e retorna presigned URLs
  app.post('/analyses', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.authUser.id

    try {
      await checkFreemiumLimit(pool, userId)
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number }
      if (e.message === 'SUBSCRIPTION_REQUIRED') {
        return reply.status(402).send({ error: 'SUBSCRIPTION_REQUIRED' })
      }
      throw err
    }

    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO analyses (user_id, status)
       VALUES ($1, 'processing')
       RETURNING id`,
      [userId]
    )

    const analysisId = rows[0].id

    const [frontResult, backResult] = await Promise.all([
      generatePresignedUploadUrl(userId, analysisId, 'front'),
      generatePresignedUploadUrl(userId, analysisId, 'back'),
    ])

    // Salva as URLs para referência do ai-engine
    await pool.query(
      `UPDATE analyses
       SET photo_front_url = $1, photo_back_url = $2
       WHERE id = $3`,
      [frontResult.url, backResult.url, analysisId]
    )

    return reply.status(201).send({
      analysis_id: analysisId,
      upload_urls: {
        front: frontResult.url,
        back: backResult.url,
      },
    })
  })

  // POST /analyses/:id/process — dispara pipeline no ai-engine (async)
  app.post<{ Params: { id: string } }>(
    '/analyses/:id/process',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params
      const userId = request.authUser.id

      const { rows } = await pool.query<{ id: string; user_id: string }>(
        `SELECT id, user_id FROM analyses WHERE id = $1`,
        [id]
      )

      if (!rows[0]) return reply.status(404).send({ error: 'Analysis not found' })
      if (rows[0].user_id !== userId) return reply.status(403).send({ error: 'Forbidden' })

      // Disparo assíncrono — não aguarda resultado
      const aiEngineUrl = process.env.AI_ENGINE_URL ?? 'http://localhost:8000'
      axios
        .post(
          `${aiEngineUrl}/analyze`,
          { analysis_id: id, user_id: userId },
          { headers: { 'x-internal-secret': process.env.AI_ENGINE_SECRET } }
        )
        .catch((err) => {
          console.error(`[ai-engine] Failed to dispatch analysis ${id}:`, err.message)
          pool.query(`UPDATE analyses SET status = 'failed' WHERE id = $1`, [id]).catch(() => {})
        })

      return reply.status(202).send({ status: 'processing' })
    }
  )

  // GET /analyses/:id — polling de status e resultado
  app.get<{ Params: { id: string } }>(
    '/analyses/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params
      const userId = request.authUser.id

      const { rows } = await pool.query(
        `SELECT
           a.id, a.status, a.scores, a.created_at, a.completed_at,
           r.highlights, r.development_areas,
           wp.weeks AS workout_weeks
         FROM analyses a
         LEFT JOIN reports r ON r.analysis_id = a.id
         LEFT JOIN workout_plans wp ON wp.analysis_id = a.id
         WHERE a.id = $1 AND a.user_id = $2`,
        [id, userId]
      )

      if (!rows[0]) return reply.status(404).send({ error: 'Analysis not found' })

      const row = rows[0]
      const response: Record<string, unknown> = {
        id: row.id,
        status: row.status,
        created_at: row.created_at,
        completed_at: row.completed_at,
      }

      if (row.status === 'completed') {
        response.scores = row.scores
        response.report = {
          highlights: row.highlights,
          development_areas: row.development_areas,
        }
        response.workout_plan = { weeks: row.workout_weeks }
      }

      return reply.send(response)
    }
  )

  // GET /analyses — histórico paginado com top_development_areas
  app.get<{ Querystring: { limit?: string; offset?: string } }>(
    '/analyses',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.authUser.id
      const limit = Math.min(parseInt(request.query.limit ?? '10', 10), 50)
      const offset = parseInt(request.query.offset ?? '0', 10)

      const { rows } = await pool.query(
        `SELECT
           a.id, a.status, a.scores, a.created_at, a.completed_at,
           COALESCE(
             (SELECT jsonb_agg(elem->>'title')
              FROM jsonb_array_elements(r.development_areas) WITH ORDINALITY AS t(elem, ord)
              WHERE ord <= 2),
             '[]'::jsonb
           ) AS top_development_areas
         FROM analyses a
         LEFT JOIN reports r ON r.analysis_id = a.id
         WHERE a.user_id = $1
         ORDER BY a.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit + 1, offset]
      )

      const has_more = rows.length > limit
      return reply.send({ analyses: rows.slice(0, limit), has_more })
    }
  )

  // POST /internal/analyses/:id/complete — callback do ai-engine
  app.post<{ Params: { id: string }; Body: {
    scores: Record<string, number>
    report: { highlights: unknown[]; development_areas: unknown[] }
    workout_plan: { weeks: unknown[] }
  } }>(
    '/internal/analyses/:id/complete',
    async (request, reply) => {
      const secret = request.headers['x-internal-secret']
      if (secret !== process.env.INTERNAL_SECRET) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const { id } = request.params
      const { scores, report, workout_plan } = request.body

      // Busca análise e user_id
      const { rows: analysisRows } = await pool.query<{ user_id: string }>(
        `SELECT user_id FROM analyses WHERE id = $1`,
        [id]
      )
      if (!analysisRows[0]) return reply.status(404).send({ error: 'Analysis not found' })

      const userId = analysisRows[0].user_id

      // Atualiza análise com scores e status completed
      await pool.query(
        `UPDATE analyses
         SET status = 'completed', scores = $1, completed_at = NOW(),
             photo_front_url = NULL, photo_back_url = NULL, photos_deleted_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(scores), id]
      )

      // Insere relatório
      await pool.query(
        `INSERT INTO reports (analysis_id, highlights, development_areas)
         VALUES ($1, $2, $3)
         ON CONFLICT (analysis_id) DO UPDATE
           SET highlights = EXCLUDED.highlights,
               development_areas = EXCLUDED.development_areas`,
        [id, JSON.stringify(report.highlights), JSON.stringify(report.development_areas)]
      )

      // Insere plano de treino
      const weeks = workout_plan.weeks
      await pool.query(
        `INSERT INTO workout_plans (analysis_id, user_id, duration_weeks, sessions_per_week, weeks)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (analysis_id) DO UPDATE
           SET weeks = EXCLUDED.weeks`,
        [id, userId, 4, 4, JSON.stringify(weeks)]
      )

      return reply.send({ ok: true })
    }
  )
}
