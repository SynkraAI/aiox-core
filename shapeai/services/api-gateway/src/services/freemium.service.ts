import { Pool } from 'pg'

export async function checkFreemiumLimit(pool: Pool, userId: string): Promise<void> {
  const { rows } = await pool.query<{ count: string; subscription_status: string }>(
    `SELECT
       (SELECT COUNT(*) FROM analyses WHERE user_id = $1 AND status = 'completed') AS count,
       subscription_status
     FROM users WHERE id = $1`,
    [userId]
  )

  if (!rows[0]) throw new Error('User not found')

  const { count, subscription_status } = rows[0]
  if (parseInt(count) >= 1 && subscription_status === 'free') {
    const err = new Error('SUBSCRIPTION_REQUIRED') as Error & { statusCode: number }
    err.statusCode = 402
    throw err
  }
}
