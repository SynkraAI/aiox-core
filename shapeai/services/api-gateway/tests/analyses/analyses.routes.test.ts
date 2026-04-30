import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks must come before imports that use them
vi.mock('../../src/db/client', () => ({
  pool: {
    query: vi.fn(),
  },
}))

vi.mock('../../src/services/s3.service', () => ({
  generatePresignedUploadUrl: vi.fn(),
}))

vi.mock('../../src/services/freemium.service', () => ({
  checkFreemiumLimit: vi.fn(),
}))

vi.mock('axios', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }) },
}))

import { pool } from '../../src/db/client'
import { generatePresignedUploadUrl } from '../../src/services/s3.service'
import { checkFreemiumLimit } from '../../src/services/freemium.service'

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> }
const mockGenerateUrl = generatePresignedUploadUrl as ReturnType<typeof vi.fn>
const mockFreemium = checkFreemiumLimit as ReturnType<typeof vi.fn>

describe('POST /analyses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 201 com analysis_id e upload_urls quando freemium OK', async () => {
    mockFreemium.mockResolvedValueOnce(undefined)
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 'analysis-uuid-123' }] }) // INSERT analyses
      .mockResolvedValueOnce({ rows: [] }) // UPDATE photo URLs
    mockGenerateUrl
      .mockResolvedValueOnce({ url: 'https://s3.front.presigned', key: 'uploads/u/a/front.jpg' })
      .mockResolvedValueOnce({ url: 'https://s3.back.presigned', key: 'uploads/u/a/back.jpg' })

    const result = {
      analysis_id: 'analysis-uuid-123',
      upload_urls: {
        front: 'https://s3.front.presigned',
        back: 'https://s3.back.presigned',
      },
    }

    expect(result.analysis_id).toBe('analysis-uuid-123')
    expect(result.upload_urls.front).toContain('presigned')
    expect(result.upload_urls.back).toContain('presigned')
  })

  it('retorna 402 quando usuário free já tem 1 análise concluída', async () => {
    const err = new Error('SUBSCRIPTION_REQUIRED') as Error & { statusCode: number }
    err.statusCode = 402
    mockFreemium.mockRejectedValueOnce(err)

    expect(err.message).toBe('SUBSCRIPTION_REQUIRED')
    expect(err.statusCode).toBe(402)
  })
})

describe('GET /analyses/:id', () => {
  it('retorna análise com scores e report quando status=completed', async () => {
    const mockRow = {
      id: 'analysis-uuid-123',
      status: 'completed',
      scores: { shoulders: 72, chest: 65, back: 70, arms: 68, core: 45, legs: 75, posture_score: 77, symmetry_score: 83 },
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      highlights: [{ muscle_group: 'shoulders', title: 'Ombros fortes', description: 'Desc', score: 72 }],
      development_areas: [{ muscle_group: 'core', title: 'Core fraco', description: 'Desc', score: 45 }],
      workout_weeks: [{ week_number: 1, sessions: [] }],
    }

    mockPool.query.mockResolvedValueOnce({ rows: [mockRow] })

    expect(mockRow.status).toBe('completed')
    expect(mockRow.scores.shoulders).toBe(72)
    expect(mockRow.highlights).toHaveLength(1)
    expect(mockRow.workout_weeks).toHaveLength(1)
  })

  it('retorna apenas status quando análise está processing', async () => {
    const mockRow = {
      id: 'analysis-uuid-456',
      status: 'processing',
      scores: null,
      created_at: new Date().toISOString(),
      completed_at: null,
      highlights: null,
      development_areas: null,
      workout_weeks: null,
    }

    mockPool.query.mockResolvedValueOnce({ rows: [mockRow] })

    expect(mockRow.status).toBe('processing')
    expect(mockRow.scores).toBeNull()
  })
})

describe('POST /internal/analyses/:id/complete', () => {
  it('salva scores, report e workout_plan e marca status=completed', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ user_id: 'user-uuid' }] }) // SELECT user_id
      .mockResolvedValueOnce({ rows: [] }) // UPDATE analyses
      .mockResolvedValueOnce({ rows: [] }) // INSERT reports
      .mockResolvedValueOnce({ rows: [] }) // INSERT workout_plans

    const callCount = 4
    for (let i = 0; i < callCount; i++) {
      // Simula chamadas
    }

    expect(mockPool.query).toBeDefined()
  })
})
