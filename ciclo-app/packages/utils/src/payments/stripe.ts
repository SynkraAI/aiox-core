/**
 * Stripe Gateway implementation (Credit Card)
 * Story E3.2 — AC-3: Creates PaymentIntent via Stripe HTTP API
 *
 * Uses fetch() to Stripe REST API — no external SDK dependency.
 * Requires STRIPE_SECRET_KEY env var.
 * Frontend uses STRIPE_PUBLISHABLE_KEY (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).
 */

import type { PaymentGateway, PaymentResult, PaymentStatus } from './gateway'
import { PAYMENT_STATUS } from './gateway'

const STRIPE_API_BASE = 'https://api.stripe.com/v1'

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return key
}

/**
 * Maps Stripe PaymentIntent status to our PaymentStatus enum.
 */
function mapStripeStatus(stripeStatus: string): PaymentStatus['status'] {
  switch (stripeStatus) {
    case 'succeeded':
      return PAYMENT_STATUS.CONFIRMED
    case 'canceled':
      return PAYMENT_STATUS.FAILED
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
    case 'processing':
    default:
      return PAYMENT_STATUS.PENDING
  }
}

/**
 * Encodes params as x-www-form-urlencoded (Stripe API format).
 */
function encodeParams(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

export class StripeGateway implements PaymentGateway {
  async createPayment(
    registrationId: string,
    _method: string,
    amount: number
  ): Promise<PaymentResult> {
    const secretKey = getSecretKey()

    const params = encodeParams({
      amount: String(amount), // Stripe expects smallest currency unit (centavos for BRL)
      currency: 'brl',
      'metadata[registration_id]': registrationId,
      description: `Inscrição ${registrationId}`,
      'automatic_payment_methods[enabled]': 'true',
    })

    const response = await fetch(`${STRIPE_API_BASE}/payment_intents`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${secretKey}:`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': `card-${registrationId}`,
      },
      body: params,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return {
        success: false,
        paymentId: '',
        externalId: '',
        error: `Stripe error: HTTP ${response.status} - ${errorBody}`,
      }
    }

    const data = await response.json() as {
      id: string
      client_secret: string
    }

    return {
      success: true,
      paymentId: registrationId,
      externalId: data.id,
      clientSecret: data.client_secret,
    }
  }

  async getPaymentStatus(externalId: string): Promise<PaymentStatus> {
    const secretKey = getSecretKey()

    const response = await fetch(
      `${STRIPE_API_BASE}/payment_intents/${externalId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${btoa(`${secretKey}:`)}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Stripe API error: HTTP ${response.status}`)
    }

    const data = await response.json() as {
      id: string
      status: string
      charges?: {
        data?: Array<{
          paid?: boolean
          created?: number
        }>
      }
    }

    const charge = data.charges?.data?.[0]
    const paidAt = charge?.paid && charge?.created
      ? new Date(charge.created * 1000)
      : undefined

    return {
      status: mapStripeStatus(data.status),
      externalId,
      paidAt,
    }
  }
}
