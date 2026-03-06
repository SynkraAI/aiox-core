'use server'

import { prisma } from '@ciclo/database'
import { revalidatePath } from 'next/cache'
import { calculateRefund, dbPolicyToDomain } from '@ciclo/utils'
import type { CancellationPolicy } from '@ciclo/utils'

// ============================================================
// Types
// ============================================================

interface MassCancellationResult {
  success: boolean
  error?: string
  cancelledCount?: number
  totalRefund?: number
}

// ============================================================
// Mass Cancellation (AC-8: Contingencia climatica)
// ============================================================

/**
 * Cancela todas as inscrições ativas de um evento.
 * Usado para contingencia climatica ou cancelamento do evento inteiro.
 * Todos os inscritos recebem crédito integral ou conforme política (80%).
 *
 * MVP: reembolso eh placeholder — admin processa manualmente.
 * Notificacao via E4.1 (placeholder — log por enquanto).
 */
export async function massCancelEvent(
  eventId: string,
  options: {
    /** Se true, concede reembolso integral (100%) independente da política */
    fullRefund?: boolean
  } = {}
): Promise<MassCancellationResult> {
  try {
    // 1. Buscar evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        cancellationPolicy: true,
      },
    })

    if (!event) {
      return { success: false, error: 'Evento não encontrado.' }
    }

    // 2. Buscar política de cancelamento
    let policy: CancellationPolicy | null = null

    if (!options.fullRefund) {
      if (event.cancellationPolicy) {
        policy = dbPolicyToDomain(event.cancellationPolicy)
      } else {
        const globalPolicy = await prisma.cancellationPolicy.findFirst({
          where: { eventId: null, isActive: true },
          orderBy: { createdAt: 'desc' },
        })
        if (globalPolicy) {
          policy = dbPolicyToDomain(globalPolicy)
        }
      }
    }

    // 3. Buscar todas as inscrições ativas (PENDING ou CONFIRMED)
    const registrations = await prisma.registration.findMany({
      where: {
        eventId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: {
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

    if (registrations.length === 0) {
      return {
        success: true,
        cancelledCount: 0,
        totalRefund: 0,
      }
    }

    const now = new Date()
    let totalRefund = 0
    const cancellationLogs: Array<{
      registrationId: string
      userId: string
      userEmail: string
      paymentAmount: number
      refundAmount: number
      refundPercent: number
    }> = []

    // 4. Transaction: cancelar todas as inscrições
    await prisma.$transaction(async (tx) => {
      for (const reg of registrations) {
        const paymentAmount = reg.payments[0]?.amount ?? 0
        let refundPercent = 0
        let refundAmount = 0

        if (options.fullRefund && paymentAmount > 0) {
          // Reembolso integral (contingencia climatica)
          refundPercent = 100
          refundAmount = paymentAmount
        } else if (policy && paymentAmount > 0) {
          const result = calculateRefund(event.startDate, now, policy, paymentAmount)
          refundPercent = result.refundPercent
          refundAmount = result.refundAmount
        }

        totalRefund += refundAmount

        // Cancelar inscrição
        await tx.registration.update({
          where: { id: reg.id },
          data: {
            status: 'CANCELLED',
            updatedAt: now,
          },
        })

        // Devolver vaga
        await tx.ticketType.update({
          where: { id: reg.ticketTypeId },
          data: { quantitySold: { decrement: 1 } },
        })

        cancellationLogs.push({
          registrationId: reg.id,
          userId: reg.userId,
          userEmail: reg.user.email,
          paymentAmount,
          refundAmount,
          refundPercent,
        })
      }
    })

    // 5. Logs de auditoria (AC-9)
    console.log(JSON.stringify({
      type: 'MASS_CANCELLATION',
      timestamp: now.toISOString(),
      eventId,
      eventName: event.name,
      reason: options.fullRefund ? 'FULL_REFUND_CONTINGENCY' : 'EVENT_CANCELLED',
      cancelledCount: registrations.length,
      totalRefund,
      registrations: cancellationLogs,
    }))

    // 6. Placeholder: notificação de todos os inscritos (E4.1)
    // TODO: Integrar com sistema de notificações quando E4.1 for implementado
    for (const log of cancellationLogs) {
      console.log(JSON.stringify({
        type: 'NOTIFICATION_PLACEHOLDER',
        timestamp: now.toISOString(),
        to: log.userEmail,
        subject: `Cancelamento do evento: ${event.name}`,
        body: `Sua inscrição foi cancelada. Reembolso: ${log.refundPercent}% (R$ ${(log.refundAmount / 100).toFixed(2)}).`,
      }))
    }

    revalidatePath(`/admin/eventos/${eventId}`)
    revalidatePath('/admin/eventos')

    return {
      success: true,
      cancelledCount: registrations.length,
      totalRefund,
    }
  } catch (error) {
    console.error('[MASS_CANCELLATION]', error)
    return {
      success: false,
      error: `Falha no cancelamento em massa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}
