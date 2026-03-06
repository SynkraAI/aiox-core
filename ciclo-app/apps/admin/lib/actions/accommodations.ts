'use server'

import { prisma } from '@ciclo/database'
import { revalidatePath } from 'next/cache'

// ============================================================
// Types
// ============================================================

export interface AccommodationActionResult {
  success: boolean
  error?: string
  roomId?: string
}

interface CreateRoomInput {
  name: string
  theme?: string
  description?: string
  pricePerNight: number // centavos
  capacity: number
  isAvailable: boolean
}

interface UpdateRoomInput extends CreateRoomInput {
  id: string
}

// ============================================================
// Server Actions
// ============================================================

export async function createRoom(input: CreateRoomInput): Promise<AccommodationActionResult> {
  try {
    const room = await prisma.room.create({
      data: {
        name: input.name,
        theme: input.theme || null,
        description: input.description || null,
        pricePerNight: input.pricePerNight,
        capacity: input.capacity,
        isAvailable: input.isAvailable,
      },
    })

    revalidatePath('/admin/espacos')
    return { success: true, roomId: room.id }
  } catch (error) {
    console.error('Failed to create room:', error)
    return {
      success: false,
      error: `Falha ao criar quarto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function updateRoom(input: UpdateRoomInput): Promise<AccommodationActionResult> {
  try {
    await prisma.room.update({
      where: { id: input.id },
      data: {
        name: input.name,
        theme: input.theme || null,
        description: input.description || null,
        pricePerNight: input.pricePerNight,
        capacity: input.capacity,
        isAvailable: input.isAvailable,
      },
    })

    revalidatePath('/admin/espacos')
    revalidatePath(`/admin/espacos/${input.id}/edit`)
    return { success: true, roomId: input.id }
  } catch (error) {
    console.error('Failed to update room:', error)
    return {
      success: false,
      error: `Falha ao atualizar quarto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function deleteRoom(id: string): Promise<AccommodationActionResult> {
  try {
    // Check if room has active registrations (PENDING or CONFIRMED)
    const activeRegistrations = await prisma.registration.findMany({
      where: {
        accommodationId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { id: true },
    })

    if (activeRegistrations.length > 0) {
      return {
        success: false,
        error: `Não e possivel excluir. Quarto possui ${activeRegistrations.length} inscrição(oes) ativa(s).`,
      }
    }

    await prisma.room.delete({
      where: { id },
    })

    revalidatePath('/admin/espacos')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete room:', error)
    return {
      success: false,
      error: `Falha ao deletar quarto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function getRooms() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: [
        { isAvailable: 'desc' },
        { name: 'asc' },
      ],
    })

    return rooms
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    return []
  }
}

export async function getRoom(id: string) {
  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    })

    return room
  } catch (error) {
    console.error('Failed to fetch room:', error)
    return null
  }
}

export async function toggleAvailable(id: string): Promise<AccommodationActionResult> {
  try {
    const room = await prisma.room.findUnique({
      where: { id },
      select: { isAvailable: true },
    })

    if (!room) {
      return { success: false, error: 'Quarto não encontrado' }
    }

    await prisma.room.update({
      where: { id },
      data: { isAvailable: !room.isAvailable },
    })

    revalidatePath('/admin/espacos')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle availability:', error)
    return {
      success: false,
      error: `Falha ao alterar disponibilidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}
