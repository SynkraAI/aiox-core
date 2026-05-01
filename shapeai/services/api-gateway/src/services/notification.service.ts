import axios from 'axios'
import { pool } from '../db/client'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

const TEMPLATES = [
  'Já faz um mês! Hora de ver sua evolução 💪',
  'Seu shape mudou? Faça uma nova análise e descubra 📊',
  '30 dias de treino. Que tal medir os resultados? 🏋️',
]

interface EligibleUser {
  id: string
  token: string
}

export async function getEligibleUsers(): Promise<EligibleUser[]> {
  const { rows } = await pool.query<EligibleUser>(`
    SELECT DISTINCT u.id, pt.token
    FROM users u
    JOIN push_tokens pt ON pt.user_id = u.id
    JOIN user_profiles up ON up.user_id = u.id AND up.notifications_enabled = true
    JOIN analyses a ON a.user_id = u.id AND a.status = 'completed'
    WHERE a.completed_at = (
      SELECT MAX(completed_at) FROM analyses
      WHERE user_id = u.id AND status = 'completed'
    )
    AND a.completed_at <= NOW() - INTERVAL '30 days'
    AND a.completed_at >= NOW() - INTERVAL '35 days'
    AND NOT EXISTS (
      SELECT 1 FROM analyses a2
      WHERE a2.user_id = u.id AND a2.status = 'completed'
      AND a2.completed_at > NOW() - INTERVAL '25 days'
    )
  `)
  return rows
}

export function pickTemplate(): string {
  return TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
}

export async function sendReanalysisNotifications(): Promise<void> {
  const users = await getEligibleUsers()

  for (const user of users) {
    const body = pickTemplate()
    try {
      const res = await axios.post(EXPO_PUSH_URL, {
        to: user.token,
        title: 'ShapeAI',
        body,
        data: { screen: '/(app)/camera' },
      })
      const result = res.data?.data
      if (result?.status === 'error' && result?.details?.error === 'DeviceNotRegistered') {
        await pool.query('DELETE FROM push_tokens WHERE token = $1', [user.token])
      }
    } catch {
      // log per-user failures silently — don't abort the whole batch
    }
  }
}
