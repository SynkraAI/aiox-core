'use server'

import { prisma } from '@ciclo/database'
import { revalidatePath } from 'next/cache'

// ============================================================
// Types
// ============================================================

export interface TicketTypeActionResult {
  success: boolean
  error?: string
  ticketTypeId?: string
}

interface CreateTicketTypeInput {
  eventId: string
  name: string
  description?: string
  includes: string[]
  earlyBirdPrice: number // centavos
  earlyBirdDeadline?: string | null
  regularPrice: number // centavos
  lastMinutePrice?: number | null // centavos
  lastMinuteStart?: string | null
  quantityAvailable?: number | null
}

interface UpdateTicketTypeInput extends CreateTicketTypeInput {
  id: string
}

// ============================================================
// Server Actions
// ============================================================

export async function createTicketType(
  input: CreateTicketTypeInput,
): Promise<TicketTypeActionResult> {
  try {
    // Validações
    if (!input.name.trim()) {
      return { success: false, error: 'Nome é obrigatório.' }
    }
    if (input.regularPrice <= 0) {
      return { success: false, error: 'Preco regular deve ser maior que zero.' }
    }

    const ticketType = await prisma.ticketType.create({
      data: {
        eventId: input.eventId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        includes: input.includes,
        earlyBirdPrice: input.earlyBirdPrice,
        earlyBirdDeadline: input.earlyBirdDeadline
          ? new Date(input.earlyBirdDeadline)
          : null,
        regularPrice: input.regularPrice,
        lastMinutePrice: input.lastMinutePrice ?? null,
        lastMinuteStart: input.lastMinuteStart
          ? new Date(input.lastMinuteStart)
          : null,
        quantityAvailable: input.quantityAvailable ?? null,
      },
    })

    revalidatePath(`/admin/eventos/${input.eventId}`)
    return { success: true, ticketTypeId: ticketType.id }
  } catch (error) {
    console.error('Failed to create ticket type:', error)
    return {
      success: false,
      error: `Falha ao criar tipo de ingresso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function updateTicketType(
  input: UpdateTicketTypeInput,
): Promise<TicketTypeActionResult> {
  try {
    // Validações
    if (!input.name.trim()) {
      return { success: false, error: 'Nome é obrigatório.' }
    }
    if (input.regularPrice <= 0) {
      return { success: false, error: 'Preco regular deve ser maior que zero.' }
    }

    await prisma.ticketType.update({
      where: { id: input.id },
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        includes: input.includes,
        earlyBirdPrice: input.earlyBirdPrice,
        earlyBirdDeadline: input.earlyBirdDeadline
          ? new Date(input.earlyBirdDeadline)
          : null,
        regularPrice: input.regularPrice,
        lastMinutePrice: input.lastMinutePrice ?? null,
        lastMinuteStart: input.lastMinuteStart
          ? new Date(input.lastMinuteStart)
          : null,
        quantityAvailable: input.quantityAvailable ?? null,
      },
    })

    revalidatePath(`/admin/eventos/${input.eventId}`)
    return { success: true, ticketTypeId: input.id }
  } catch (error) {
    console.error('Failed to update ticket type:', error)
    return {
      success: false,
      error: `Falha ao atualizar tipo de ingresso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function deleteTicketType(
  id: string,
): Promise<TicketTypeActionResult> {
  try {
    // Verificar se tem inscrições confirmadas
    const registrationCount = await prisma.registration.count({
      where: {
        ticketTypeId: id,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    })

    if (registrationCount > 0) {
      return {
        success: false,
        error: `Este tipo de ingresso possui ${registrationCount} inscrição(oes) ativa(s). Não e possivel remover. Considere desativar o ingresso alterando a quantidade disponível para 0.`,
      }
    }

    const ticketType = await prisma.ticketType.delete({
      where: { id },
    })

    revalidatePath(`/admin/eventos/${ticketType.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete ticket type:', error)
    return {
      success: false,
      error: `Falha ao remover tipo de ingresso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function getTicketTypes(eventId: string) {
  try {
    const ticketTypes = await prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    })

    return ticketTypes
  } catch (error) {
    console.error('Failed to fetch ticket types:', error)
    return []
  }
}
