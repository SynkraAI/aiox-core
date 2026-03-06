/**
 * GET /api/registrations/[id]/qrcode
 * Story E3.4 — AC-6: QR Code access endpoint
 *
 * Returns the signed QR payload for a registration.
 * Auth: own user, ADMIN, or FACILITATOR only.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@ciclo/database'
import { requireAuth } from '@ciclo/auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: registrationId } = await params

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: {
        id: true,
        userId: true,
        status: true,
        qrCode: true,
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada.' },
        { status: 404 }
      )
    }

    // Authorization: own user, ADMIN, or FACILITATOR
    const isOwner = registration.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    const isFacilitator = session.user.role === 'FACILITATOR'

    if (!isOwner && !isAdmin && !isFacilitator) {
      return NextResponse.json(
        { error: 'Acesso negado. Você não tem permissao para acessar este QR Code.' },
        { status: 403 }
      )
    }

    if (registration.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'QR Code disponível apenas para inscrições confirmadas.' },
        { status: 400 }
      )
    }

    if (!registration.qrCode) {
      return NextResponse.json(
        { error: 'QR Code ainda não foi gerado para esta inscrição.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      registrationId: registration.id,
      qrCode: registration.qrCode,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Não autorizado')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('[GET_QR_CODE]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
