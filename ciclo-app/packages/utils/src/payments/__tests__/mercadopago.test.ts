/**
 * Tests for MercadoPagoGateway
 * Story E3.2 — AC-2: PIX + Boleto payment creation and status
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MercadoPagoGateway } from '../mercadopago'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('MercadoPagoGateway', () => {
  let gateway: MercadoPagoGateway

  beforeEach(() => {
    gateway = new MercadoPagoGateway()
    vi.stubEnv('MP_ACCESS_TOKEN', 'test-token-123')
    mockFetch.mockReset()
  })

  describe('createPayment - PIX', () => {
    it('creates PIX payment and returns QR data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 12345678,
          point_of_interaction: {
            transaction_data: {
              qr_code: '00020101021226860014br.gov.bcb.pix...',
              qr_code_base64: 'iVBORw0KGgoAAAANSUhE...',
              ticket_url: 'https://mp.com/ticket',
            },
          },
        }),
      })

      const result = await gateway.createPayment('reg-123', 'PIX', 15000)

      expect(result.success).toBe(true)
      expect(result.externalId).toBe('12345678')
      expect(result.pixCopiaECola).toContain('00020101')
      expect(result.pixQrCodeBase64).toContain('data:image/png;base64,')
      expect(result.expiresAt).toBeInstanceOf(Date)

      // Verify fetch was called with correct URL and auth
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.mercadopago.com/v1/payments',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      )

      // Verify body includes correct amount (in reais, not centavos)
      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.transaction_amount).toBe(150) // 15000 centavos = 150 BRL
      expect(body.payment_method_id).toBe('pix')
    })

    it('returns error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      })

      const result = await gateway.createPayment('reg-123', 'PIX', 15000)

      expect(result.success).toBe(false)
      expect(result.error).toContain('MercadoPago PIX error')
    })
  })

  describe('createPayment - BOLETO', () => {
    it('creates Boleto payment and returns URL and code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 87654321,
          barcode: { content: '23793.38128 60000.000003 00000.000402 1 84340000015000' },
          transaction_details: {
            external_resource_url: 'https://mp.com/boleto/123',
          },
        }),
      })

      const result = await gateway.createPayment('reg-456', 'BOLETO', 25000)

      expect(result.success).toBe(true)
      expect(result.externalId).toBe('87654321')
      expect(result.boletoUrl).toBe('https://mp.com/boleto/123')
      expect(result.boletoCode).toContain('23793')
      expect(result.boletoDueDate).toBeInstanceOf(Date)
    })
  })

  describe('createPayment - unsupported method', () => {
    it('returns error for unsupported method', async () => {
      const result = await gateway.createPayment('reg-789', 'CREDIT_CARD', 10000)

      expect(result.success).toBe(false)
      expect(result.error).toContain('nao suportado')
    })
  })

  describe('getPaymentStatus', () => {
    it('returns CONFIRMED for approved payment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'approved',
          date_approved: '2026-03-05T10:00:00.000Z',
        }),
      })

      const status = await gateway.getPaymentStatus('12345678')

      expect(status.status).toBe('CONFIRMED')
      expect(status.externalId).toBe('12345678')
      expect(status.paidAt).toBeInstanceOf(Date)
    })

    it('returns PENDING for pending payment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'pending',
        }),
      })

      const status = await gateway.getPaymentStatus('12345678')
      expect(status.status).toBe('PENDING')
    })

    it('returns FAILED for rejected payment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'rejected',
        }),
      })

      const status = await gateway.getPaymentStatus('12345678')
      expect(status.status).toBe('FAILED')
    })

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(gateway.getPaymentStatus('12345678')).rejects.toThrow(
        'MercadoPago API error'
      )
    })
  })

  describe('environment validation', () => {
    it('throws when MP_ACCESS_TOKEN is missing', async () => {
      vi.stubEnv('MP_ACCESS_TOKEN', '')

      await expect(
        gateway.createPayment('reg-123', 'PIX', 10000)
      ).rejects.toThrow('MP_ACCESS_TOKEN')
    })
  })
})
