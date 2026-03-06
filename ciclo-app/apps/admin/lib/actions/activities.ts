'use server'

import { prisma } from '@ciclo/database'
import { revalidatePath } from 'next/cache'

// ============================================================
// Types
// ============================================================

export interface ActivityActionResult {
  success: boolean
  error?: string
  activityId?: string
}

interface CreateActivityInput {
  eventId: string
  time: string // ISO datetime string
  title: string
  description?: string
  durationMinutes: number
  facilitatorId?: string | null
}

interface UpdateActivityInput extends CreateActivityInput {
  id: string
}

// ============================================================
// Server Actions
// ============================================================

export async function createActivity(
  input: CreateActivityInput,
): Promise<ActivityActionResult> {
  try {
    if (!input.title.trim()) {
      return { success: false, error: 'Título é obrigatório.' }
    }
    if (input.title.length > 150) {
      return { success: false, error: 'Título deve ter no máximo 150 caracteres.' }
    }
    if (input.durationMinutes < 1) {
      return { success: false, error: 'Duração deve ser no mínimo 1 minuto.' }
    }
    if (!input.time) {
      return { success: false, error: 'Horário é obrigatório.' }
    }

    // Get max order for this event
    const maxOrder = await prisma.activity.findFirst({
      where: { eventId: input.eventId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const activity = await prisma.activity.create({
      data: {
        eventId: input.eventId,
        time: new Date(input.time),
        title: input.title.trim(),
        description: input.description?.trim() || null,
        durationMinutes: input.durationMinutes,
        facilitatorId: input.facilitatorId || null,
        order: (maxOrder?.order ?? -1) + 1,
      },
    })

    revalidatePath(`/admin/eventos/${input.eventId}`)
    return { success: true, activityId: activity.id }
  } catch (error) {
    console.error('Failed to create activity:', error)
    return {
      success: false,
      error: `Falha ao criar atividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function updateActivity(
  input: UpdateActivityInput,
): Promise<ActivityActionResult> {
  try {
    if (!input.title.trim()) {
      return { success: false, error: 'Título é obrigatório.' }
    }
    if (input.title.length > 150) {
      return { success: false, error: 'Título deve ter no máximo 150 caracteres.' }
    }
    if (input.durationMinutes < 1) {
      return { success: false, error: 'Duração deve ser no mínimo 1 minuto.' }
    }
    if (!input.time) {
      return { success: false, error: 'Horário é obrigatório.' }
    }

    await prisma.activity.update({
      where: { id: input.id },
      data: {
        time: new Date(input.time),
        title: input.title.trim(),
        description: input.description?.trim() || null,
        durationMinutes: input.durationMinutes,
        facilitatorId: input.facilitatorId || null,
      },
    })

    revalidatePath(`/admin/eventos/${input.eventId}`)
    return { success: true, activityId: input.id }
  } catch (error) {
    console.error('Failed to update activity:', error)
    return {
      success: false,
      error: `Falha ao atualizar atividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function deleteActivity(id: string): Promise<ActivityActionResult> {
  try {
    const activity = await prisma.activity.delete({
      where: { id },
    })

    revalidatePath(`/admin/eventos/${activity.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete activity:', error)
    return {
      success: false,
      error: `Falha ao deletar atividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function getActivities(eventId: string) {
  try {
    const activities = await prisma.activity.findMany({
      where: { eventId },
      include: {
        facilitator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    return activities
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return []
  }
}

export async function reorderActivities(eventId: string, orderedIds: string[]) {
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.activity.update({
          where: { id },
          data: { order: index },
        }),
      ),
    )

    revalidatePath(`/admin/eventos/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to reorder activities:', error)
    return { success: false, error: 'Falha ao reordenar atividades' }
  }
}
