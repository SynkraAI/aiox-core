'use server'

/**
 * Server Actions for registration flow
 * Story E3.1 — AC-7, AC-8, AC-5, AC-12
 *
 * createRegistration: Creates Registration + Payment with PENDING status
 * Uses Prisma $transaction to prevent race conditions (AC-8)
 * Creates guest User when not authenticated (AC-5)
 * joinWaitlist: Creates Lead for sold-out events (AC-12)
 */

import { prisma } from '@ciclo/database'
import { auth } from '@ciclo/auth'
import { encryptCpf } from '@ciclo/auth'
import { calculatePricing } from '@ciclo/utils'
import type { PaymentMethod } from '@ciclo/database'
import { validateCPF } from '@/validation/cpf'

// ============================================================
// Types
// ============================================================

interface RegistrationInput {
  eventSlug: string
  ticketTypeId: string
  name: string
  email: string
  phone: string
  cpf: string
  dietaryRestrictions?: string
  isFirstTime?: boolean
  paymentMethod: PaymentMethod
  accommodationId?: string
  accommodationNights?: number
}

interface RegistrationResult {
  success: boolean
  registrationId?: string
  paymentId?: string
  error?: string
  waitlistAvailable?: boolean
}

interface WaitlistInput {
  email: string
  name?: string
  phone?: string
  eventSlug: string
}

interface WaitlistResult {
  success: boolean
  error?: string
}

// ============================================================
// createRegistration
// ============================================================

export async function createRegistration(
  input: RegistrationInput
): Promise<RegistrationResult> {
  try {
    // Validate CPF server-side
    if (!validateCPF(input.cpf)) {
      return { success: false, error: 'CPF inválido.' }
    }

    // Validate required fields
    if (!input.name || !input.email || !input.phone) {
      return { success: false, error: 'Todos os campos obrigatórios devem ser preenchidos.' }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      return { success: false, error: 'Email inválido.' }
    }

    // Get current session (may be null for guest checkout)
    const session = await auth()

    // Use transaction to prevent race conditions (AC-8)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find event by slug
      const event = await tx.event.findFirst({
        where: { slug: input.eventSlug, isPublished: true, isDeleted: false },
        select: { id: true },
      })

      if (!event) {
        throw new Error('Evento não encontrado.')
      }

      // 2. Check ticket availability with row-level lock
      const ticketType = await tx.ticketType.findUnique({
        where: { id: input.ticketTypeId },
      })

      if (!ticketType) {
        throw new Error('Tipo de ingresso não encontrado.')
      }

      if (ticketType.eventId !== event.id) {
        throw new Error('Ingresso não pertence a este evento.')
      }

      // Check availability (AC-8)
      if (
        ticketType.quantityAvailable !== null &&
        ticketType.quantitySold >= ticketType.quantityAvailable
      ) {
        return {
          success: false as const,
          error: 'Ingressos esgotados para este tipo.',
          waitlistAvailable: true,
        }
      }

      // 3. Calculate current price
      const { price } = calculatePricing(
        {
          earlyBirdPrice: ticketType.earlyBirdPrice,
          earlyBirdDeadline: ticketType.earlyBirdDeadline,
          regularPrice: ticketType.regularPrice,
          lastMinutePrice: ticketType.lastMinutePrice,
          lastMinuteStart: ticketType.lastMinuteStart,
        },
        new Date()
      )

      // 4. Add accommodation cost if selected
      let totalAmount = price
      if (input.accommodationId && input.accommodationNights) {
        const room = await tx.room.findUnique({
          where: { id: input.accommodationId },
        })
        if (room && room.isAvailable) {
          totalAmount += room.pricePerNight * input.accommodationNights
        }
      }

      // 5. Get or create user (AC-5)
      let userId: string

      if (session?.user?.id) {
        userId = session.user.id

        // Update user data if needed
        const encryptedCpf = encryptCpf(input.cpf.replace(/\D/g, ''))
        await tx.user.update({
          where: { id: userId },
          data: {
            phone: input.phone,
            cpf: encryptedCpf,
            name: input.name,
          },
        })
      } else {
        // Guest checkout: create user or find existing by email (AC-5)
        const existingUser = await tx.user.findUnique({
          where: { email: input.email },
        })

        if (existingUser) {
          userId = existingUser.id
        } else {
          const encryptedCpf = encryptCpf(input.cpf.replace(/\D/g, ''))
          const newUser = await tx.user.create({
            data: {
              email: input.email,
              name: input.name,
              phone: input.phone,
              cpf: encryptedCpf,
              role: 'USER',
              // emailVerified is null -> isEmailVerified: false effectively
            },
          })
          userId = newUser.id
        }
      }

      // 6. Create Registration (AC-7)
      const registration = await tx.registration.create({
        data: {
          userId,
          eventId: event.id,
          ticketTypeId: input.ticketTypeId,
          status: 'PENDING',
          dietaryRestrictions: input.dietaryRestrictions || null,
          isFirstTime: input.isFirstTime ?? false,
          accommodationId: input.accommodationId || null,
          accommodationNights: input.accommodationNights || null,
        },
      })

      // 7. Create Payment (AC-7)
      const payment = await tx.payment.create({
        data: {
          registrationId: registration.id,
          amount: totalAmount,
          method: input.paymentMethod,
          status: 'PENDING',
        },
      })

      // 8. Increment sold count (race condition safe inside transaction)
      await tx.ticketType.update({
        where: { id: input.ticketTypeId },
        data: { quantitySold: { increment: 1 } },
      })

      return {
        success: true as const,
        registrationId: registration.id,
        paymentId: payment.id,
      }
    })

    return result
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao criar inscrição.'
    return { success: false, error: message }
  }
}

// ============================================================
// joinWaitlist
// ============================================================

export async function joinWaitlist(
  input: WaitlistInput
): Promise<WaitlistResult> {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      return { success: false, error: 'Email inválido.' }
    }

    // Upsert lead with waitlist source
    await prisma.lead.upsert({
      where: { email: input.email },
      update: {
        source: 'waitlist',
        name: input.name || undefined,
        phone: input.phone || undefined,
      },
      create: {
        email: input.email,
        name: input.name || null,
        phone: input.phone || null,
        source: 'waitlist',
        interestedSeasons: [],
      },
    })

    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro ao entrar na lista de espera.'
    return { success: false, error: message }
  }
}
