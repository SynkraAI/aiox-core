import { Pool } from 'pg'

export interface SubscriptionStatus {
  status: 'free' | 'pro'
  expires_at: string | null
}

export async function getSubscriptionStatus(pool: Pool, userId: string): Promise<SubscriptionStatus> {
  const { rows } = await pool.query<{ subscription_status: string; subscription_expires_at: string | null }>(
    'SELECT subscription_status, subscription_expires_at FROM users WHERE id = $1',
    [userId]
  )
  if (!rows[0]) throw new Error('User not found')
  return {
    status: rows[0].subscription_status as 'free' | 'pro',
    expires_at: rows[0].subscription_expires_at,
  }
}
