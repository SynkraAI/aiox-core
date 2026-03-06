import { NextResponse } from 'next/server'
import { prisma } from '@ciclo/database'
import { requireAuth } from '@ciclo/auth'
import { calculateRefund, dbPolicyToDomain } from '@ciclo/utils'
import type { CancellationPolicy } from '@ciclo/utils'

/**
 * POST /api/registrations/[id]/cancel
 * Story E3.5 - AC-7
 *
 * Cancela inscrição e calcula reembolso automaticamente.
 * Apenas o próprio usuario ou ADMIN pode cancelar.
 * Reembolso no MVP: placeholder manual — admin aprova.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: registrationId } = await params

    // 1. Buscar inscrição com evento e pagamento
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            cancellationPolicy: true,
          },
        },
        payments: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada.' },
        { status: 404 }
      )
    }

    // 2. Verificar autorizacao: próprio usuario ou ADMIN
    const isOwner = registration.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Você só pode cancelar suas próprias inscrições.' },
        { status: 403 }
      )
    }

    // 3. Verificar se inscrição pode ser cancelada
    if (registration.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Esta inscrição já foi cancelada.' },
        { status: 400 }
      )
    }

    if (registration.status === 'TRANSFERRED') {
      return NextResponse.json(
        { error: 'Esta inscrição já foi transferida.' },
        { status: 400 }
      )
    }

    if (registration.status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Esta inscrição já foi reembolsada.' },
        { status: 400 }
      )
    }

    // 4. Carregar política de cancelamento (evento override ou global)
    let policy: CancellationPolicy | null = null

    if (registration.event.cancellationPolicy) {
      policy = dbPolicyToDomain(registration.event.cancellationPolicy)
    } else {
      const globalPolicy = await prisma.cancellationPolicy.findFirst({
        where: { eventId: null, isActive: true },
        orderBy: { createdAt: 'desc' },
      })
      if (globalPolicy) {
        policy = dbPolicyToDomain(globalPolicy)
      }
    }

    // 5. Calcular reembolso
    const paymentAmount = registration.payments[0]?.amount ?? 0
    const now = new Date()
    let refundPercent = 0
    let refundAmount = 0

    if (policy && paymentAmount > 0) {
      const result = calculateRefund(
        registration.event.startDate,
        now,
        policy,
        paymentAmount
      )
      refundPercent = result.refundPercent
      refundAmount = result.refundAmount
    }

    // 6. Atualizar inscrição para CANCELLED
    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: 'CANCELLED',
        updatedAt: now,
      },
    })

    // 7. Devolver vaga no ticket (decrementar quantitySold)
    await prisma.ticketType.update({
      where: { id: registration.ticketTypeId },
      data: { quantitySold: { decrement: 1 } },
    })

    // 8. Log de auditoria (AC-9)
    console.log(JSON.stringify({
      type: 'CANCELLATION',
      timestamp: now.toISOString(),
      registrationId,
      userId: registration.userId,
      userEmail: registration.user.email,
      eventId: registration.event.id,
      eventName: registration.event.name,
      cancelledBy: session.user.id,
      cancelledByRole: session.user.role,
      paymentAmount,
      refundPercent: refundPercent,
      refundAmount: refundAmount,
      daysBeforeEvent: Math.floor(
        (registration.event.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))

    return NextResponse.json({
      success: true,
      message: 'Inscrição cancelada com sucesso.',
      refund: {
        percent: refundPercent,
        amount: refundAmount,
        note: refundAmount > 0
          ? 'Reembolso será processado pelo administrador.'
          : 'Nenhum reembolso aplicavel conforme a política de cancelamento.',
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Não autorizado')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('[CANCEL_REGISTRATION]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
