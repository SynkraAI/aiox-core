import { NextResponse } from 'next/server'
import { prisma, type UserRole } from '@ciclo/database'
import { requireRole } from '@ciclo/auth'

const VALID_ROLES: UserRole[] = ['USER', 'THERAPIST', 'FACILITATOR', 'ADMIN']

/**
 * PATCH /api/admin/users/[id]/role
 * Body: { role: UserRole }
 * Only ADMIN can promote/demote roles (AC-8).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole('ADMIN' as UserRole)
    const { id } = await params

    const body = await request.json()
    const { role } = body

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Role inválido. Valores aceitos: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario não encontrado.' },
        { status: 404 }
      )
    }

    // Prevent self-demotion
    if (targetUser.id === session.user.id && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Você não pode alterar seu próprio role.' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    console.log(
      `[ADMIN] User ${session.user.email} changed role of ${updatedUser.email} to ${role}`
    )

    return NextResponse.json({
      message: `Role atualizado para ${role}.`,
      user: updatedUser,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Acesso negado')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message.includes('Não autorizado')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('[ADMIN_ROLE]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
