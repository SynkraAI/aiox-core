import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@ciclo/database'
import { checkRateLimit, getClientIp } from '@ciclo/auth'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateCheck = checkRateLimit(`forgot:${ip}`)
    if (rateCheck.limited) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email é obrigatório.' },
        { status: 400 }
      )
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: 'Se o email estiver cadastrado, você recebera instruções para redefinir sua senha.',
    })

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user || !user.isActive || user.isDeleted) {
      return successResponse
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    })

    // Generate new token (expires in 1 hour)
    const token = randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    })

    // TODO: Send email via Resend (E4.1)
    // For now, log the token in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Password reset token for ${user.email}: ${token}`)
    }

    return successResponse
  } catch (error) {
    console.error('[FORGOT_PASSWORD]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
