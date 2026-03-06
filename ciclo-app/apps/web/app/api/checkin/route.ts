/**
 * POST /api/checkin
 * Story E3.4 — AC-7: Check-in endpoint with HMAC verification
 *
 * Receives a signed QR payload, verifies the HMAC signature,
 * and marks Registration.checkedInAt if DB is available.
 *
 * Offline-capable: HMAC verification works without DB.
 * If DB is unavailable, returns valid=true with offline_mode flag.
 *
 * Auth: FACILITATOR or ADMIN only.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@ciclo/database'
import { requireAuth } from '@ciclo/auth'
import { verifyQRPayload } from '@ciclo/utils'

export async function POST(request: Request) {
  try {
    // Auth check: FACILITATOR or ADMIN only
    const session = await requireAuth()
    const isAdmin = session.user.role === 'ADMIN'
    const isFacilitator = session.user.role === 'FACILITATOR'

    if (!isAdmin && !isFacilitator) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas facilitadores e administradores podem realizar check-in.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json().catch(() => null)

    if (!body?.signedPayload || typeof body.signedPayload !== 'string') {
      return NextResponse.json(
        { error: 'Campo signedPayload é obrigatório.' },
        { status: 400 }
      )
    }

    const { signedPayload } = body as { signedPayload: string }

    // Verify HMAC signature (works offline — only crypto, no DB)
    const secret = process.env.QR_SECRET

    if (!secret) {
      return NextResponse.json(
        { error: 'Configuração de seguranca QR ausente no servidor.' },
        { status: 500 }
      )
    }

    const verification = verifyQRPayload(signedPayload, secret)

    if (!verification.valid || !verification.data) {
      console.log(JSON.stringify({
        event_type: 'checkin.invalid_qr',
        checked_by: session.user.id,
        timestamp: new Date().toISOString(),
      }))

      return NextResponse.json(
        { valid: false, error: 'QR Code inválido ou assinatura incorreta.' },
        { status: 400 }
      )
    }

    const { data } = verification

    // Try to update DB (mark check-in)
    try {
      const registration = await prisma.registration.findUnique({
        where: { id: data.registrationId },
        select: {
          id: true,
          status: true,
          checkedInAt: true,
          user: { select: { name: true } },
          event: { select: { name: true } },
          ticketType: { select: { name: true } },
        },
      })

      if (!registration) {
        // Valid signature but registration not found in DB
        return NextResponse.json({
          valid: true,
          offline_mode: false,
          warning: 'Inscrição não encontrada no banco de dados. QR válido mas registro ausente.',
          data,
        })
      }

      // Check if already checked in
      if (registration.checkedInAt) {
        return NextResponse.json({
          valid: true,
          offline_mode: false,
          already_checked_in: true,
          checked_in_at: registration.checkedInAt.toISOString(),
          data: {
            ...data,
            participantName: registration.user.name ?? data.participantName,
            eventName: registration.event.name,
            ticketTypeName: registration.ticketType.name,
          },
        })
      }

      // Check registration status
      if (registration.status !== 'CONFIRMED') {
        return NextResponse.json({
          valid: true,
          offline_mode: false,
          error: `Inscrição com status ${registration.status}. Apenas inscrições confirmadas podem fazer check-in.`,
          data,
        }, { status: 400 })
      }

      // Mark check-in
      const now = new Date()
      await prisma.registration.update({
        where: { id: data.registrationId },
        data: { checkedInAt: now },
      })

      console.log(JSON.stringify({
        event_type: 'checkin.success',
        registration_id: data.registrationId,
        event_slug: data.eventSlug,
        checked_by: session.user.id,
        timestamp: now.toISOString(),
      }))

      return NextResponse.json({
        valid: true,
        offline_mode: false,
        checked_in_at: now.toISOString(),
        data: {
          ...data,
          participantName: registration.user.name ?? data.participantName,
          eventName: registration.event.name,
          ticketTypeName: registration.ticketType.name,
        },
      })
    } catch (dbError) {
      // DB unavailable — return offline mode response
      console.warn(JSON.stringify({
        event_type: 'checkin.offline_mode',
        registration_id: data.registrationId,
        reason: 'Database unavailable',
        error: dbError instanceof Error ? dbError.message : 'Unknown DB error',
        checked_by: session.user.id,
        timestamp: new Date().toISOString(),
      }))

      return NextResponse.json({
        valid: true,
        offline_mode: true,
        data,
        message: 'Check-in validado offline. Assinatura HMAC correta. Sincronizacao com banco pendente.',
      })
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Não autorizado')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('[CHECKIN_ERROR]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
