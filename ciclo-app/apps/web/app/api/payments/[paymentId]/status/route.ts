/**
 * GET /api/payments/[paymentId]/status
 * Story E3.2 — AC-4: Payment status endpoint for PIX polling
 *
 * Returns current payment status. PIX pages poll this every 5s.
 * Checks both local DB and gateway status.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@ciclo/database'
import { getPaymentGateway } from '@ciclo/utils'
import type { PaymentMethod as _PaymentMethod } from '@ciclo/database'

interface RouteParams {
  params: Promise<{ paymentId: string }>
}

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { paymentId } = await params

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        status: true,
        method: true,
        mercadoPagoId: true,
        stripeId: true,
        confirmedAt: true,
        expiresAt: true,
        registrationId: true,
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado.' },
        { status: 404 }
      )
    }

    // If already confirmed in DB, return directly
    if (payment.status === 'APPROVED') {
      return NextResponse.json({
        status: 'CONFIRMED',
        paymentId: payment.id,
        registrationId: payment.registrationId,
        confirmedAt: payment.confirmedAt?.toISOString() || null,
      })
    }

    // If expired PIX
    if (
      payment.method === 'PIX' &&
      payment.expiresAt &&
      new Date() > payment.expiresAt
    ) {
      return NextResponse.json({
        status: 'EXPIRED',
        paymentId: payment.id,
        registrationId: payment.registrationId,
      })
    }

    // Check gateway for real-time status
    const externalId = payment.mercadoPagoId || payment.stripeId
    if (externalId) {
      try {
        const gateway = getPaymentGateway(
          payment.method as 'PIX' | 'BOLETO' | 'CREDIT_CARD'
        )
        const gatewayStatus = await gateway.getPaymentStatus(externalId)

        // If confirmed at gateway but not yet in DB, update DB
        if (gatewayStatus.status === 'CONFIRMED') {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'APPROVED',
                confirmedAt: gatewayStatus.paidAt || new Date(),
              },
            }),
            prisma.registration.update({
              where: { id: payment.registrationId },
              data: { status: 'CONFIRMED' },
            }),
          ])

          return NextResponse.json({
            status: 'CONFIRMED',
            paymentId: payment.id,
            registrationId: payment.registrationId,
            confirmedAt: gatewayStatus.paidAt?.toISOString() || new Date().toISOString(),
          })
        }

        if (gatewayStatus.status === 'FAILED') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'DECLINED' },
          })

          return NextResponse.json({
            status: 'FAILED',
            paymentId: payment.id,
            registrationId: payment.registrationId,
          })
        }
      } catch {
        // Gateway check failed — return DB status, don't break polling
      }
    }

    return NextResponse.json({
      status: 'PENDING',
      paymentId: payment.id,
      registrationId: payment.registrationId,
      expiresAt: payment.expiresAt?.toISOString() || null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao verificar status.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
