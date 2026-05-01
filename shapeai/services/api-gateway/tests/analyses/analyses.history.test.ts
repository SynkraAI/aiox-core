import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/db/client', () => ({
  pool: { query: vi.fn() },
}))

import { pool } from '../../src/db/client'

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> }

async function simulateListAnalyses(userId: string, limit = 10, offset = 0) {
  const { rows } = await mockPool.query(
    `SELECT a.id, a.status, a.scores, a.created_at, a.completed_at,
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
  return { analyses: rows.slice(0, limit), has_more }
}

describe('GET /analyses — paginação e top_development_areas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna paginação correta com limit=10&offset=0', async () => {
    const fakeRows = Array.from({ length: 11 }, (_, i) => ({
      id: `a${i}`,
      status: 'completed',
      scores: null,
      created_at: new Date().toISOString(),
      completed_at: null,
      top_development_areas: [],
    }))
    mockPool.query.mockResolvedValueOnce({ rows: fakeRows })

    const result = await simulateListAnalyses('user-1', 10, 0)
    expect(result.analyses).toHaveLength(10)
    expect(result.has_more).toBe(true)
  })

  it('has_more=false quando há menos itens que o limit', async () => {
    const fakeRows = Array.from({ length: 5 }, (_, i) => ({
      id: `a${i}`,
      status: 'completed',
      scores: null,
      created_at: new Date().toISOString(),
      completed_at: null,
      top_development_areas: [],
    }))
    mockPool.query.mockResolvedValueOnce({ rows: fakeRows })

    const result = await simulateListAnalyses('user-1', 10, 0)
    expect(result.analyses).toHaveLength(5)
    expect(result.has_more).toBe(false)
  })

  it('inclui top_development_areas quando relatório existe', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: 'a1',
        status: 'completed',
        scores: null,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        top_development_areas: ['Costas', 'Core'],
      }],
    })

    const result = await simulateListAnalyses('user-1', 10, 0)
    expect(result.analyses[0].top_development_areas).toEqual(['Costas', 'Core'])
  })
})
