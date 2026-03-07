import { NextResponse } from 'next/server'
import { prisma } from '@ciclo/database'
import { requireRole } from '@ciclo/auth'

/**
 * PATCH /api/admin/users/[id]/status
 * Body: { isActive: boolean }
 * Soft-delete: deactivated users receive 401 on next request (AC-9).
 * Only ADMIN can deactivate/reactivate accounts.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole('ADMIN')
    const { id } = await params

    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo isActive (boolean) é obrigatório.' },
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

    // Prevent self-deactivation
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'Você não pode desativar sua própria conta.' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive,
        ...(isActive === false ? { isDeleted: true, deletedAt: new Date() } : { isDeleted: false, deletedAt: null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    })

    const action = isActive ? 'reativada' : 'desativada'
    console.log(
      `[ADMIN] User ${session.user.email} ${action} conta de ${updatedUser.email}`
    )

    return NextResponse.json({
      message: `Conta ${action} com sucesso.`,
      user: updatedUser,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Acesso negado')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message.includes('Não autorizado')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('[ADMIN_STATUS]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
