/**
 * Payment Gateway Factory
 * Story E3.2 — AC-1, AC-2, AC-3: Routes payment methods to correct gateway
 *
 * PIX, BOLETO → MercadoPagoGateway
 * CREDIT_CARD → StripeGateway
 */

export type { PaymentGateway, PaymentResult, PaymentStatus } from './gateway'
export { PAYMENT_STATUS, DEFAULT_PIX_TIMEOUT_MINUTES } from './gateway'
export type { PaymentStatusValue } from './gateway'

import type { PaymentGateway } from './gateway'
import { MercadoPagoGateway } from './mercadopago'
import { StripeGateway } from './stripe'

type PaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD'

const mercadoPagoGateway = new MercadoPagoGateway()
const stripeGateway = new StripeGateway()

/**
 * Returns the apprópriate PaymentGateway for the given payment method.
 *
 * @param method - PIX, BOLETO, or CREDIT_CARD
 * @returns PaymentGateway instance
 * @throws Error if method is unsupported
 */
export function getPaymentGateway(method: PaymentMethod): PaymentGateway {
  switch (method) {
    case 'PIX':
    case 'BOLETO':
      return mercadoPagoGateway
    case 'CREDIT_CARD':
      return stripeGateway
    default: {
      const _exhaustive: never = method
      throw new Error(`Unsupported payment method: ${_exhaustive}`)
    }
  }
}
