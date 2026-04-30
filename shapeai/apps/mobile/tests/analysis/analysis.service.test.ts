import { pollAnalysis } from '../../src/services/analysis.service'

jest.mock('../../src/services/api.client', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}))

import { apiGet, apiPost } from '../../src/services/api.client'

const mockGet = apiGet as jest.Mock
const mockPost = apiPost as jest.Mock

describe('analysis.service', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('pollAnalysis', () => {
    it('resolve quando status = completed', async () => {
      const completed = { id: 'a1', status: 'completed', created_at: new Date().toISOString() }
      mockGet.mockResolvedValue(completed)

      const result = await pollAnalysis('a1', { intervalMs: 10, maxAttempts: 5 })
      expect(result.status).toBe('completed')
    })

    it('resolve quando status = failed', async () => {
      const failed = { id: 'a1', status: 'failed', created_at: new Date().toISOString() }
      mockGet.mockResolvedValue(failed)

      const result = await pollAnalysis('a1', { intervalMs: 10, maxAttempts: 5 })
      expect(result.status).toBe('failed')
    })

    it('rejeita quando maxAttempts atingido sem conclusão', async () => {
      mockGet.mockResolvedValue({ id: 'a1', status: 'processing', created_at: new Date().toISOString() })

      await expect(
        pollAnalysis('a1', { intervalMs: 10, maxAttempts: 3 })
      ).rejects.toThrow('Tempo limite')
    })
  })
})
