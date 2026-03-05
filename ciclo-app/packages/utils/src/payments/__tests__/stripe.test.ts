/**
 * Tests for StripeGateway
 * Story E3.2 — AC-3: PaymentIntent creation and status
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StripeGateway } from '../stripe'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('StripeGateway', () => {
  let gateway: StripeGateway

  beforeEach(() => {
    gateway = new StripeGateway()
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123')
    mockFetch.mockReset()
  })

  describe('createPayment', () => {
    it('creates PaymentIntent and returns clientSecret', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'pi_abc123',
          client_secret: 'pi_abc123_secret_xyz',
        }),
      })

      const result = await gateway.createPayment('reg-123', 'CREDIT_CARD', 15000)

      expect(result.success).toBe(true)
      expect(result.externalId).toBe('pi_abc123')
      expect(result.clientSecret).toBe('pi_abc123_secret_xyz')

      // Verify Stripe API call
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.stripe.com/v1/payment_intents',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      )

      // Verify body params
      const body = mockFetch.mock.calls[0][1].body as string
      expect(body).toContain('amount=15000') // centavos direct
      expect(body).toContain('currency=brl')
    })

    it('returns error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 402,
        text: async () => '{"error": {"message": "Card declined"}}',
      })

      const result = await gateway.createPayment('reg-123', 'CREDIT_CARD', 15000)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Stripe error')
    })
  })

  describe('getPaymentStatus', () => {
    it('returns CONFIRMED for succeeded PaymentIntent', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'pi_abc123',
          status: 'succeeded',
          charges: {
            data: [{ paid: true, created: 1709625600 }],
          },
        }),
      })

      const status = await gateway.getPaymentStatus('pi_abc123')

      expect(status.status).toBe('CONFIRMED')
      expect(status.externalId).toBe('pi_abc123')
      expect(status.paidAt).toBeInstanceOf(Date)
    })

    it('returns PENDING for processing PaymentIntent', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'pi_abc123',
          status: 'processing',
        }),
      })

      const status = await gateway.getPaymentStatus('pi_abc123')
      expect(status.status).toBe('PENDING')
    })

    it('returns FAILED for canceled PaymentIntent', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'pi_abc123',
          status: 'canceled',
        }),
      })

      const status = await gateway.getPaymentStatus('pi_abc123')
      expect(status.status).toBe('FAILED')
    })

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(gateway.getPaymentStatus('pi_abc123')).rejects.toThrow(
        'Stripe API error'
      )
    })
  })

  describe('environment validation', () => {
    it('throws when STRIPE_SECRET_KEY is missing', async () => {
      vi.stubEnv('STRIPE_SECRET_KEY', '')

      await expect(
        gateway.createPayment('reg-123', 'CREDIT_CARD', 10000)
      ).rejects.toThrow('STRIPE_SECRET_KEY')
    })
  })
})
