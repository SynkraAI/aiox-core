/**
 * Admin: Resend Transactional Email
 * Story E4.1 — AC-9: Admin pode reenviar qualquer email transacional por inscrição
 *
 * POST /api/admin/registrations/resend-email
 * Body: { registrationId: string, emailType: 'confirmation' | 'reminder7d' | 'reminder24h' | 'feedback' }
 *
 * Requires ADMIN role.
 */

import { NextResponse } from 'next/server'
import { requireRole } from '@ciclo/auth'
import { prisma, type UserRole } from '@ciclo/database'
import {
  sendConfirmationEmail,
  sendReminder7dEmail,
  sendReminder24hEmail,
  sendFeedbackEmail,
} from '@ciclo/email'

const VALID_EMAIL_TYPES = ['confirmation', 'reminder7d', 'reminder24h', 'feedback'] as const
type EmailType = typeof VALID_EMAIL_TYPES[number]

interface ResendRequestBody {
  registrationId: string
  emailType: EmailType
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Auth check: ADMIN only
    const session = await requireRole('ADMIN' as UserRole)

    // Parse body
    const body = await request.json() as ResendRequestBody

    if (!body.registrationId || !body.emailType) {
      return NextResponse.json(
        { error: 'registrationId e emailType são obrigatórios' },
        { status: 400 }
      )
    }

    if (!VALID_EMAIL_TYPES.includes(body.emailType)) {
      return NextResponse.json(
        { error: `emailType inválido. Valores aceitos: ${VALID_EMAIL_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify registration exists
    const registration = await prisma.registration.findUnique({
      where: { id: body.registrationId },
      select: { id: true },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      )
    }

    // Send email (force=true bypasses the "already sent" check for confirmation)
    let result

    switch (body.emailType) {
      case 'confirmation':
        result = await sendConfirmationEmail(body.registrationId, true)
        break
      case 'reminder7d':
        result = await sendReminder7dEmail(body.registrationId)
        break
      case 'reminder24h':
        result = await sendReminder24hEmail(body.registrationId)
        break
      case 'feedback':
        result = await sendFeedbackEmail(body.registrationId)
        break
    }

    if (result.success) {
      console.log(JSON.stringify({
        event_type: 'admin.resend_email.success',
        registration_id: body.registrationId,
        email_type: body.emailType,
        admin_email: session.user.email,
        timestamp: new Date().toISOString(),
      }))

      return NextResponse.json({
        success: true,
        message: `Email de ${body.emailType} reenviado com sucesso`,
      })
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('Acesso negado')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message.includes('Não autorizado')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    const message = error instanceof Error ? error.message : 'Unknown error'

    console.error(JSON.stringify({
      event_type: 'admin.resend_email.error',
      error: message,
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
