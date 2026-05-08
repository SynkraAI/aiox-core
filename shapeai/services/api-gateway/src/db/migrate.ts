import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'

export async function runMigrations(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  const { rows: applied } = await pool.query<{ filename: string }>(
    `SELECT filename FROM _migrations`
  )
  const appliedSet = new Set(applied.map((r) => r.filename))

  for (const file of files) {
    if (appliedSet.has(file)) continue

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    console.log(`[migrate] applying ${file}`)

    await pool.query('BEGIN')
    try {
      await pool.query(sql)
      await pool.query(`INSERT INTO _migrations (filename) VALUES ($1)`, [file])
      await pool.query('COMMIT')
      console.log(`[migrate] applied ${file}`)
    } catch (err) {
      await pool.query('ROLLBACK')
      console.error(`[migrate] failed on ${file}:`, err)
      throw err
    }
  }
}
