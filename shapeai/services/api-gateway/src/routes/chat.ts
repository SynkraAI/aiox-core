import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { pool } from '../db/client'
import { requireAuth } from '../middleware/auth'

type Persona = 'rafael' | 'marina' | 'bruno'

const FREE_DAILY_LIMIT = 20

const PERSONA_SYSTEM_PROMPTS: Record<Persona, string> = {
  rafael: `Você é Rafael, personal trainer com 12 anos de experiência, especializado em musculação e composição corporal.
Tom: técnico, direto e baseado em dados. Cite números, progressão e ciência do exercício.
Ao elogiar evolução: "Excelente dado — progressão consistente."
Ao tratar ausência de treino: "Ajuste o volume e retome o protocolo."
REGRAS INEGOCIÁVEIS:
- Responda SEMPRE em português brasileiro
- Sem markdown excessivo — use linguagem direta e objetiva
- Referencie os dados reais do usuário sempre que relevante
- Não invente dados — se não souber, diga claramente
- Questões médicas: indique "consulte um profissional de saúde"
- Escopo restrito: fitness, treino e atividade física (sem nutrição detalhada ou diagnósticos médicos)`,

  marina: `Você é Marina, personal trainer com 10 anos de experiência, especializada em treino funcional e bem-estar.
Tom: motivacional, empático e encorajador. Celebre cada conquista e compreenda limitações.
Ao elogiar evolução: "Você conseguiu! Isso é resultado do seu esforço."
Ao tratar ausência de treino: "Tudo bem, o importante é retomar. O progresso acontece no longo prazo."
REGRAS INEGOCIÁVEIS:
- Responda SEMPRE em português brasileiro
- Sem markdown excessivo — use linguagem acessível e calorosa
- Referencie os dados reais do usuário sempre que relevante
- Não invente dados — se não souber, diga claramente
- Questões médicas: indique "consulte um profissional de saúde"
- Escopo restrito: fitness, treino e atividade física (sem nutrição detalhada ou diagnósticos médicos)`,

  bruno: `Você é Bruno, personal trainer com 15 anos de experiência, especializado em alta performance e superação de limites.
Tom: intenso, desafiador e sem rodeios. Exija o máximo e não aceite desculpas.
Ao elogiar evolução: "Isso é o mínimo esperado. Agora suba o nível."
Ao tratar ausência de treino: "Sem desculpas. Reorganize sua agenda e não falhe de novo."
REGRAS INEGOCIÁVEIS:
- Responda SEMPRE em português brasileiro
- Sem markdown excessivo — seja direto e contundente
- Referencie os dados reais do usuário sempre que relevante
- Não invente dados — se não souber, diga claramente
- Questões médicas: indique "consulte um profissional de saúde"
- Escopo restrito: fitness, treino e atividade física (sem nutrição detalhada ou diagnósticos médicos)`,
}

const GOAL_LABEL: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  fat_loss: 'Emagrecimento',
  conditioning: 'Condicionamento',
}

function buildUserContext(
  profile: Record<string, unknown> | null,
  analysis: Record<string, unknown> | null
): string {
  if (!profile && !analysis) {
    return 'O usuário ainda não possui perfil ou análise cadastrada. Ofereça orientações gerais de fitness.'
  }

  const lines: string[] = ['=== CONTEXTO DO USUÁRIO ===']

  if (profile) {
    lines.push(
      `Perfil: sexo=${profile.biological_sex}, altura=${profile.height_cm}cm, ` +
      `peso=${profile.weight_kg}kg, objetivo=${GOAL_LABEL[profile.primary_goal as string] ?? profile.primary_goal}`
    )
  }

  if (analysis) {
    const scores = analysis.scores as Record<string, number> | null
    if (scores) {
      lines.push(
        `Scores musculares: Ombros=${scores.shoulders}, Peitoral=${scores.chest}, ` +
        `Costas=${scores.back}, Braços=${scores.arms}, Core=${scores.core}, Pernas=${scores.legs}`
      )
      lines.push(
        `Scores posturais: Postura=${scores.posture_score}, Simetria=${scores.symmetry_score}, ` +
        `V-Taper=${scores.v_taper_score}, Proporção=${scores.proportion_balance}`
      )
      if (scores.body_fat_estimate_pct !== undefined) {
        lines.push(`Gordura corporal estimada: ${scores.body_fat_estimate_pct}%`)
      }
    }

    const bc = analysis.body_composition as Record<string, unknown> | null
    if (bc) {
      lines.push(
        `Composição corporal: gordura=${bc.body_fat_estimate}%, ` +
        `categoria=${bc.body_fat_category}, tipo_físico=${bc.body_type}`
      )
      if (Array.isArray(bc.fat_areas) && bc.fat_areas.length > 0) {
        lines.push(`Gordura localizada: ${(bc.fat_areas as string[]).join(', ')}`)
      }
      if (bc.strengths_summary) {
        lines.push(`Pontos fortes: ${bc.strengths_summary}`)
      }
      if (bc.weaknesses_summary) {
        lines.push(`Pontos a desenvolver: ${bc.weaknesses_summary}`)
      }
      const ms = bc.muscle_scores as Record<string, { score: number; note: string }> | null
      if (ms) {
        const scoreList = Object.entries(ms)
          .map(([k, v]) => `${k}=${v.score}`)
          .join(', ')
        lines.push(`Scores musculares: ${scoreList}`)
      }
    }

    const highlights = analysis.highlights as Array<{ title: string }> | null
    const devAreas = analysis.development_areas as Array<{ title: string }> | null
    if (highlights?.length) {
      lines.push(`Destaques positivos: ${highlights.map((h) => h.title).join(', ')}`)
    }
    if (devAreas?.length) {
      lines.push(`Áreas a trabalhar: ${devAreas.map((d) => d.title).join(', ')}`)
    }

    type Exercise = { name: string; sets: number; reps: string; rest_seconds: number; notes?: string }
    type Session = { day: number; muscle_groups: string[]; exercises: Exercise[] }
    type Week = { week_number: number; sessions: Session[] }
    const workoutWeeks = analysis.workout_weeks as Week[] | null

    if (workoutWeeks?.length) {
      const DAY_NAME: Record<number, string> = { 1: 'Segunda', 2: 'Terça', 3: 'Quarta', 4: 'Quinta', 5: 'Sexta', 6: 'Sábado', 7: 'Domingo' }
      lines.push(`Plano de treino: ${workoutWeeks.length} semanas. Semana 1 (resumo):`)
      const week1 = workoutWeeks[0]
      for (const session of week1.sessions) {
        const day = DAY_NAME[session.day] ?? `Dia ${session.day}`
        const groups = session.muscle_groups.join(', ')
        // Limita a 4 exercícios por sessão para manter o prompt compacto
        const exList = session.exercises.slice(0, 4)
          .map((ex) => `${ex.name} ${ex.sets}x${ex.reps}`)
          .join(', ')
        lines.push(`  ${day} (${groups}): ${exList}`)
      }
    }
  } else {
    lines.push('O usuário ainda não realizou análise de shape. Use o perfil disponível para orientações.')
  }

  lines.push('=== FIM DO CONTEXTO ===')
  return lines.join('\n')
}

type HistoryEntry = { role: 'user' | 'assistant'; content: string }

export async function chatRoutes(app: FastifyInstance) {
  app.post<{ Body: { message: string; history?: HistoryEntry[] } }>(
    '/chat',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.authUser.id
      const isPro = request.authUser.subscription_status === 'pro'
      const { message, history } = request.body

      if (!message?.trim()) {
        return reply.status(400).send({ error: 'Message is required' })
      }

      // Check rate limit for Free users before processing
      if (!isPro) {
        const { rows: usageRows } = await pool.query<{ message_count: string }>(
          `SELECT message_count FROM chat_usage WHERE user_id = $1 AND date = CURRENT_DATE`,
          [userId]
        )
        const currentCount = usageRows[0] ? parseInt(usageRows[0].message_count) : 0
        if (currentCount >= FREE_DAILY_LIMIT) {
          return reply.status(402).send({
            error: 'CHAT_LIMIT_REACHED',
            usage: { count: currentCount, limit: FREE_DAILY_LIMIT },
          })
        }
      }

      // Fetch last completed analysis + report + workout plan
      const { rows: analysisRows } = await pool.query(
        `SELECT
           a.scores,
           r.highlights, r.development_areas, r.body_composition,
           wp.weeks AS workout_weeks
         FROM analyses a
         LEFT JOIN reports r ON r.analysis_id = a.id
         LEFT JOIN workout_plans wp ON wp.analysis_id = a.id
         WHERE a.user_id = $1 AND a.status = 'completed'
         ORDER BY a.created_at DESC
         LIMIT 1`,
        [userId]
      )

      // Fetch profile with coach persona
      const { rows: profileRows } = await pool.query(
        `SELECT biological_sex, height_cm, weight_kg, primary_goal, coach_persona
         FROM user_profiles WHERE user_id = $1`,
        [userId]
      )

      const analysis = analysisRows[0] ?? null
      const profile = profileRows[0] ?? null
      const persona = ((profile?.coach_persona as string) ?? 'rafael') as Persona
      const systemPrompt = PERSONA_SYSTEM_PROMPTS[persona] ?? PERSONA_SYSTEM_PROMPTS.rafael
      const contextText = buildUserContext(profile, analysis)

      // Build messages: cap history at last 20 entries to keep tokens reasonable
      const priorMessages: HistoryEntry[] = (history ?? []).slice(-20)
      const allMessages: HistoryEntry[] = [
        ...priorMessages,
        { role: 'user', content: message.trim() },
      ]

      // Call Claude API
      let replyText: string
      try {
        const claudeRes = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: `${systemPrompt}\n\n${contextText}`,
            messages: allMessages,
          },
          {
            headers: {
              'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            timeout: 30_000,
          }
        )
        replyText = claudeRes.data.content[0].text
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        const errData = (err as { response?: { data?: unknown } })?.response?.data
        app.log.error({ status, errData }, 'Claude API error in /chat')

        if (status === 529) {
          return reply.status(503).send({ error: 'CLAUDE_OVERLOADED' })
        }
        if (status === 429) {
          return reply.status(503).send({ error: 'CLAUDE_RATE_LIMIT' })
        }
        return reply.status(503).send({ error: 'CLAUDE_UNAVAILABLE' })
      }

      // Increment usage counter (atomic upsert)
      const { rows: newUsageRows } = await pool.query<{ message_count: string }>(
        `INSERT INTO chat_usage (user_id, date, message_count)
         VALUES ($1, CURRENT_DATE, 1)
         ON CONFLICT (user_id, date) DO UPDATE
           SET message_count = chat_usage.message_count + 1
         RETURNING message_count`,
        [userId]
      )

      const newCount = parseInt(newUsageRows[0].message_count)

      return reply.send({
        reply: replyText,
        persona,
        usage: {
          count: newCount,
          limit: isPro ? null : FREE_DAILY_LIMIT,
        },
      })
    }
  )

  // GET /chat/usage — current day usage (for UI counter on screen load)
  app.get(
    '/chat/usage',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.authUser.id
      const isPro = request.authUser.subscription_status === 'pro'

      const { rows } = await pool.query<{ message_count: string }>(
        `SELECT message_count FROM chat_usage WHERE user_id = $1 AND date = CURRENT_DATE`,
        [userId]
      )

      return reply.send({
        count: rows[0] ? parseInt(rows[0].message_count) : 0,
        limit: isPro ? null : FREE_DAILY_LIMIT,
      })
    }
  )
}
