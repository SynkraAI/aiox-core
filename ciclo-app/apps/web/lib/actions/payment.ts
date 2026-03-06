'use server'

/**
 * Server Actions for payment processing
 * Story E3.2 — AC-2, AC-3: Creates payment via gateway abstraction
 *
 * Called after registration is created (E3.1) to initiate
 * the actual payment with MercadoPago or Stripe.
 */

import { prisma } from '@ciclo/database'
import { getPaymentGateway } from '@ciclo/utils'
import type { PaymentMethod as _PaymentMethod } from '@ciclo/database'

interface InitiatePaymentInput {
  registrationId: string
  paymentId: string
}

interface InitiatePaymentResult {
  success: boolean
  error?: string
  /** PIX fields */
  pixKey?: string
  pixCopiaECola?: string
  pixQrCodeBase64?: string
  expiresAt?: string // ISO string for serialization
  /** Boleto fields */
  boletoUrl?: string
  boletoCode?: string
  boletoDueDate?: string // ISO string
  /** Card fields */
  clientSecret?: string
  /** Common */
  externalId?: string
}

export async function initiatePayment(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult> {
  try {
    // Load payment record
    const payment = await prisma.payment.findUnique({
      where: { id: input.paymentId },
      include: { registration: true },
    })

    if (!payment) {
      return { success: false, error: 'Pagamento não encontrado.' }
    }

    if (payment.registrationId !== input.registrationId) {
      return { success: false, error: 'Pagamento não pertence a esta inscrição.' }
    }

    // If already has an external ID, payment was already initiated
    if (payment.mercadoPagoId || payment.stripeId) {
      return {
        success: true,
        externalId: payment.mercadoPagoId || payment.stripeId || undefined,
        pixKey: payment.pixKey || undefined,
        boletoUrl: payment.boletoUrl || undefined,
        expiresAt: payment.expiresAt?.toISOString(),
      }
    }

    const gateway = getPaymentGateway(payment.method as 'PIX' | 'BOLETO' | 'CREDIT_CARD')
    const result = await gateway.createPayment(
      input.registrationId,
      payment.method,
      payment.amount
    )

    if (!result.success) {
      return { success: false, error: result.error || 'Erro ao criar pagamento no gateway.' }
    }

    // Update payment record with external IDs and gateway data
    const updateData: Record<string, unknown> = {
      status: 'PROCESSING',
    }

    if (payment.method === 'PIX' || payment.method === 'BOLETO') {
      updateData.mercadoPagoId = result.externalId
    } else {
      updateData.stripeId = result.externalId
    }

    if (result.pixKey) {
      updateData.pixKey = result.pixKey
    }
    if (result.boletoUrl) {
      updateData.boletoUrl = result.boletoUrl
    }
    if (result.expiresAt) {
      updateData.expiresAt = result.expiresAt
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: updateData,
    })

    return {
      success: true,
      externalId: result.externalId,
      pixKey: result.pixKey,
      pixCopiaECola: result.pixCopiaECola,
      pixQrCodeBase64: result.pixQrCodeBase64,
      expiresAt: result.expiresAt?.toISOString(),
      boletoUrl: result.boletoUrl,
      boletoCode: result.boletoCode,
      boletoDueDate: result.boletoDueDate?.toISOString(),
      clientSecret: result.clientSecret,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao iniciar pagamento.'
    return { success: false, error: message }
  }
}
