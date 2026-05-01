import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/db/client', () => ({
  pool: { query: vi.fn() },
}))

vi.mock('axios', () => ({
  default: { post: vi.fn() },
}))

import { pool } from '../../src/db/client'
import axios from 'axios'
import { getEligibleUsers, pickTemplate, sendReanalysisNotifications } from '../../src/services/notification.service'

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> }
const mockAxios = axios as unknown as { post: ReturnType<typeof vi.fn> }

const TEMPLATES = [
  'Já faz um mês! Hora de ver sua evolução 💪',
  'Seu shape mudou? Faça uma nova análise e descubra 📊',
  '30 dias de treino. Que tal medir os resultados? 🏋️',
]

describe('notification.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getEligibleUsers()', () => {
    it('retorna usuários com análise entre 30 e 35 dias atrás', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1', token: 'ExponentPushToken[a]' }],
      })

      const users = await getEligibleUsers()

      expect(users).toHaveLength(1)
      expect(users[0].id).toBe('user-1')
      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('30 days'))
    })

    it('exclui usuários com análise nos últimos 25 dias (janela de tolerância)', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] })

      const users = await getEligibleUsers()

      expect(users).toHaveLength(0)
      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('25 days'))
    })
  })

  describe('pickTemplate()', () => {
    it('retorna um dos 3 templates definidos', () => {
      for (let i = 0; i < 20; i++) {
        const template = pickTemplate()
        expect(TEMPLATES).toContain(template)
      }
    })
  })

  describe('sendReanalysisNotifications()', () => {
    it('envia notificação para usuários elegíveis', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1', token: 'ExponentPushToken[abc]' }],
      })
      mockAxios.post.mockResolvedValueOnce({ data: { data: { status: 'ok' } } })

      await sendReanalysisNotifications()

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({ to: 'ExponentPushToken[abc]', title: 'ShapeAI' })
      )
    })

    it('remove token inválido (DeviceNotRegistered)', async () => {
      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ id: 'user-1', token: 'ExponentPushToken[invalid]' }],
        })
        .mockResolvedValueOnce({ rows: [] })

      mockAxios.post.mockResolvedValueOnce({
        data: { data: { status: 'error', details: { error: 'DeviceNotRegistered' } } },
      })

      await sendReanalysisNotifications()

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM push_tokens WHERE token = $1',
        ['ExponentPushToken[invalid]']
      )
    })

    it('não envia nada se não há usuários elegíveis', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] })

      await sendReanalysisNotifications()

      expect(mockAxios.post).not.toHaveBeenCalled()
    })
  })
})
