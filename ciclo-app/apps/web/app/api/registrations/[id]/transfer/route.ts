import { NextResponse } from 'next/server'
import { prisma } from '@ciclo/database'
import { requireAuth } from '@ciclo/auth'

/**
 * POST /api/registrations/[id]/transfer
 * Story E3.5 - AC-6
 *
 * Transfere inscrição para outra pessoa.
 * Cria novo usuario (ou vincula existente), cria nova Registration,
 * marca original como TRANSFERRED.
 * Sem custo. Transferência sempre permitida (política default).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: registrationId } = await params

    // Parse body
    const body = await request.json()
    const { name, email } = body as { name?: string; email?: string }

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email do novo participante são obrigatórios.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido.' },
        { status: 400 }
      )
    }

    // 1. Buscar inscrição original
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

    // 2. Verificar autorizacao
    const isOwner = registration.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Você só pode transferir suas próprias inscrições.' },
        { status: 403 }
      )
    }

    // 3. Verificar se inscrição pode ser transferida
    if (registration.status === 'CANCELLED' || registration.status === 'TRANSFERRED') {
      return NextResponse.json(
        { error: `Inscrição com status ${registration.status} não pode ser transferida.` },
        { status: 400 }
      )
    }

    if (registration.status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Inscrição reembolsada não pode ser transferida.' },
        { status: 400 }
      )
    }

    // 4. Verificar política de transferência
    if (registration.event.cancellationPolicy && !registration.event.cancellationPolicy.transferAllowed) {
      // Checar política global como fallback
      const globalPolicy = await prisma.cancellationPolicy.findFirst({
        where: { eventId: null, isActive: true },
      })
      if (globalPolicy && !globalPolicy.transferAllowed) {
        return NextResponse.json(
          { error: 'Transferência não permitida pela política de cancelamento.' },
          { status: 400 }
        )
      }
    }

    // 5. Não pode transferir para si mesmo
    if (email.toLowerCase() === registration.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Não e possivel transferir a inscrição para você mesmo.' },
        { status: 400 }
      )
    }

    // 6. Transaction: criar novo usuario + nova inscrição + marcar original
    const now = new Date()

    const result = await prisma.$transaction(async (tx) => {
      // Get or create target user
      let targetUser = await tx.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (!targetUser) {
        targetUser = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            name,
            role: 'USER',
          },
        })
      }

      // Verificar se target user já tem inscrição para este evento
      const existingRegistration = await tx.registration.findFirst({
        where: {
          userId: targetUser.id,
          eventId: registration.eventId,
          status: { notIn: ['CANCELLED', 'TRANSFERRED', 'REFUNDED'] },
        },
      })

      if (existingRegistration) {
        throw new Error('O novo participante já possui uma inscrição ativa para este evento.')
      }

      // Criar nova inscrição com referencia ao original
      const newRegistration = await tx.registration.create({
        data: {
          userId: targetUser.id,
          eventId: registration.eventId,
          ticketTypeId: registration.ticketTypeId,
          status: 'CONFIRMED',
          dietaryRestrictions: null,
          isFirstTime: false,
          transferredFrom: registrationId,
        },
      })

      // Marcar inscrição original como TRANSFERRED
      await tx.registration.update({
        where: { id: registrationId },
        data: {
          status: 'TRANSFERRED',
          updatedAt: now,
        },
      })

      return {
        newRegistrationId: newRegistration.id,
        targetUserId: targetUser.id,
        targetUserEmail: targetUser.email,
        targetUserName: targetUser.name,
      }
    })

    // 7. Log de auditoria (AC-9)
    console.log(JSON.stringify({
      type: 'TRANSFER',
      timestamp: now.toISOString(),
      originalRegistrationId: registrationId,
      newRegistrationId: result.newRegistrationId,
      fromUserId: registration.userId,
      fromUserEmail: registration.user.email,
      toUserId: result.targetUserId,
      toUserEmail: result.targetUserEmail,
      toUserName: result.targetUserName,
      eventId: registration.event.id,
      eventName: registration.event.name,
      transferredBy: session.user.id,
      transferredByRole: session.user.role,
    }))

    return NextResponse.json({
      success: true,
      message: `Inscrição transferida com sucesso para ${name} (${email}).`,
      newRegistrationId: result.newRegistrationId,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Não autorizado')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('já possui')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[TRANSFER_REGISTRATION]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
