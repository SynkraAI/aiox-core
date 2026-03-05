/**
 * MercadoPago Gateway implementation (PIX + Boleto)
 * Story E3.2 — AC-2: Creates preference with PIX/Boleto via HTTP API
 *
 * Uses fetch() to MercadoPago REST API — no external SDK dependency.
 * Requires MP_ACCESS_TOKEN env var.
 */

import type { PaymentGateway, PaymentResult, PaymentStatus } from './gateway'
import { PAYMENT_STATUS, DEFAULT_PIX_TIMEOUT_MINUTES } from './gateway'

const MP_API_BASE = 'https://api.mercadopago.com'

function getAccessToken(): string {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) {
    throw new Error('MP_ACCESS_TOKEN environment variable is not set')
  }
  return token
}

/**
 * Maps MercadoPago payment status to our PaymentStatus enum.
 */
function mapMPStatus(mpStatus: string): PaymentStatus['status'] {
  switch (mpStatus) {
    case 'approved':
      return PAYMENT_STATUS.CONFIRMED
    case 'rejected':
    case 'cancelled':
      return PAYMENT_STATUS.FAILED
    case 'refunded':
      return PAYMENT_STATUS.REFUNDED
    case 'pending':
    case 'in_process':
    case 'authorized':
    default:
      return PAYMENT_STATUS.PENDING
  }
}

export class MercadoPagoGateway implements PaymentGateway {
  async createPayment(
    registrationId: string,
    method: string,
    amount: number
  ): Promise<PaymentResult> {
    const accessToken = getAccessToken()

    if (method === 'PIX') {
      return this.createPixPayment(registrationId, amount, accessToken)
    }

    if (method === 'BOLETO') {
      return this.createBoletoPayment(registrationId, amount, accessToken)
    }

    return {
      success: false,
      paymentId: '',
      externalId: '',
      error: `Metodo de pagamento nao suportado pelo MercadoPago: ${method}`,
    }
  }

  async getPaymentStatus(externalId: string): Promise<PaymentStatus> {
    const accessToken = getAccessToken()

    const response = await fetch(`${MP_API_BASE}/v1/payments/${externalId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`MercadoPago API error: HTTP ${response.status}`)
    }

    const data = await response.json() as {
      status: string
      date_approved?: string
    }

    return {
      status: mapMPStatus(data.status),
      externalId,
      paidAt: data.date_approved ? new Date(data.date_approved) : undefined,
    }
  }

  // ============================================================
  // PIX
  // ============================================================

  private async createPixPayment(
    registrationId: string,
    amount: number,
    accessToken: string
  ): Promise<PaymentResult> {
    const expirationMinutes = Number(
      process.env.PIX_TIMEOUT_MINUTES || DEFAULT_PIX_TIMEOUT_MINUTES
    )
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000)

    const body = {
      transaction_amount: amount / 100, // MP expects BRL, not centavos
      description: `Inscricao ${registrationId}`,
      payment_method_id: 'pix',
      payer: {
        email: 'pagamento@ciclodasestacoes.com.br', // placeholder; webhook updates
      },
      date_of_expiration: expiresAt.toISOString(),
      external_reference: registrationId,
    }

    const response = await fetch(`${MP_API_BASE}/v1/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pix-${registrationId}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return {
        success: false,
        paymentId: '',
        externalId: '',
        error: `MercadoPago PIX error: HTTP ${response.status} - ${errorBody}`,
      }
    }

    const data = await response.json() as {
      id: number
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string
          qr_code_base64?: string
          ticket_url?: string
        }
      }
    }

    const txData = data.point_of_interaction?.transaction_data

    return {
      success: true,
      paymentId: registrationId,
      externalId: String(data.id),
      pixKey: txData?.qr_code || undefined,
      pixCopiaECola: txData?.qr_code || undefined,
      pixQrCodeBase64: txData?.qr_code_base64
        ? `data:image/png;base64,${txData.qr_code_base64}`
        : undefined,
      expiresAt,
    }
  }

  // ============================================================
  // Boleto
  // ============================================================

  private async createBoletoPayment(
    registrationId: string,
    amount: number,
    accessToken: string
  ): Promise<PaymentResult> {
    // Boleto due date: 3 business days from now (simplified: +3 calendar days)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)

    const body = {
      transaction_amount: amount / 100,
      description: `Inscricao ${registrationId}`,
      payment_method_id: 'bolbradesco', // Bradesco boleto (most common)
      payer: {
        email: 'pagamento@ciclodasestacoes.com.br',
        first_name: 'Participante',
        last_name: 'Ciclo',
        identification: {
          type: 'CPF',
          number: '00000000000', // Placeholder; real CPF set via webhook/update
        },
      },
      date_of_expiration: dueDate.toISOString(),
      external_reference: registrationId,
    }

    const response = await fetch(`${MP_API_BASE}/v1/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `boleto-${registrationId}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return {
        success: false,
        paymentId: '',
        externalId: '',
        error: `MercadoPago Boleto error: HTTP ${response.status} - ${errorBody}`,
      }
    }

    const data = await response.json() as {
      id: number
      barcode?: { content?: string }
      transaction_details?: { external_resource_url?: string }
    }

    return {
      success: true,
      paymentId: registrationId,
      externalId: String(data.id),
      boletoUrl: data.transaction_details?.external_resource_url || undefined,
      boletoCode: data.barcode?.content || undefined,
      boletoDueDate: dueDate,
    }
  }
}
