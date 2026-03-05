/**
 * Tests for Payment Gateway Factory
 * Story E3.2 — AC-1: getPaymentGateway routes to correct implementation
 */

import { describe, expect, it } from 'vitest'
import { getPaymentGateway } from '../index'
import { MercadoPagoGateway } from '../mercadopago'
import { StripeGateway } from '../stripe'

describe('getPaymentGateway', () => {
  it('returns MercadoPagoGateway for PIX', () => {
    const gateway = getPaymentGateway('PIX')
    expect(gateway).toBeInstanceOf(MercadoPagoGateway)
  })

  it('returns MercadoPagoGateway for BOLETO', () => {
    const gateway = getPaymentGateway('BOLETO')
    expect(gateway).toBeInstanceOf(MercadoPagoGateway)
  })

  it('returns StripeGateway for CREDIT_CARD', () => {
    const gateway = getPaymentGateway('CREDIT_CARD')
    expect(gateway).toBeInstanceOf(StripeGateway)
  })

  it('returns same instance for same method (singleton per gateway)', () => {
    const gw1 = getPaymentGateway('PIX')
    const gw2 = getPaymentGateway('BOLETO')
    expect(gw1).toBe(gw2)
  })

  it('throws for unsupported method', () => {
    // @ts-expect-error Testing invalid input
    expect(() => getPaymentGateway('BITCOIN')).toThrow('Unsupported payment method')
  })
})
