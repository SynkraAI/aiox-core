'use server'

import { prisma } from '@ciclo/database'
import { revalidatePath } from 'next/cache'

// ============================================================
// Types
// ============================================================

export interface FacilitatorActionResult {
  success: boolean
  error?: string
  facilitatorId?: string
}

interface CreateFacilitatorInput {
  name: string
  role?: string
  bio?: string
  photoUrl?: string
  instagram?: string
  email?: string
  phone?: string
  specialties: string[]
  isFeatured: boolean
}

interface UpdateFacilitatorInput extends CreateFacilitatorInput {
  id: string
}

// ============================================================
// Server Actions
// ============================================================

export async function createFacilitator(input: CreateFacilitatorInput): Promise<FacilitatorActionResult> {
  try {
    const facilitator = await prisma.facilitator.create({
      data: {
        name: input.name,
        role: input.role || null,
        bio: input.bio || null,
        photoUrl: input.photoUrl || null,
        instagram: input.instagram || null,
        email: input.email || null,
        phone: input.phone || null,
        specialties: input.specialties,
        isFeatured: input.isFeatured,
      },
    })

    revalidatePath('/admin/facilitadores')
    return { success: true, facilitatorId: facilitator.id }
  } catch (error) {
    console.error('Failed to create facilitator:', error)
    return {
      success: false,
      error: `Falha ao criar facilitador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function updateFacilitator(input: UpdateFacilitatorInput): Promise<FacilitatorActionResult> {
  try {
    await prisma.facilitator.update({
      where: { id: input.id },
      data: {
        name: input.name,
        role: input.role || null,
        bio: input.bio || null,
        photoUrl: input.photoUrl || null,
        instagram: input.instagram || null,
        email: input.email || null,
        phone: input.phone || null,
        specialties: input.specialties,
        isFeatured: input.isFeatured,
      },
    })

    revalidatePath('/admin/facilitadores')
    revalidatePath(`/admin/facilitadores/${input.id}/edit`)
    return { success: true, facilitatorId: input.id }
  } catch (error) {
    console.error('Failed to update facilitator:', error)
    return {
      success: false,
      error: `Falha ao atualizar facilitador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function deleteFacilitator(id: string): Promise<FacilitatorActionResult> {
  try {
    // Check if facilitator is linked to future activities
    const futureActivities = await prisma.activity.findMany({
      where: {
        facilitatorId: id,
        event: {
          startDate: { gte: new Date() },
        },
      },
      include: {
        event: {
          select: { name: true, startDate: true },
        },
      },
    })

    if (futureActivities.length > 0) {
      const eventNames = futureActivities
        .map((a) => a.event.name)
        .filter((name, index, arr) => arr.indexOf(name) === index)
        .join(', ')
      return {
        success: false,
        error: `Não e possivel excluir. Facilitador associado a atividades em eventos futuros: ${eventNames}`,
      }
    }

    await prisma.facilitator.delete({
      where: { id },
    })

    revalidatePath('/admin/facilitadores')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete facilitator:', error)
    return {
      success: false,
      error: `Falha ao deletar facilitador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function getFacilitators() {
  try {
    const facilitators = await prisma.facilitator.findMany({
      include: {
        _count: {
          select: {
            activities: true,
            eventFacilitators: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { name: 'asc' },
      ],
    })

    return facilitators
  } catch (error) {
    console.error('Failed to fetch facilitators:', error)
    return []
  }
}

export async function getFacilitator(id: string) {
  try {
    const facilitator = await prisma.facilitator.findUnique({
      where: { id },
      include: {
        eventFacilitators: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                isPublished: true,
              },
            },
          },
          orderBy: {
            event: { startDate: 'desc' },
          },
        },
        _count: {
          select: {
            activities: true,
            eventFacilitators: true,
          },
        },
      },
    })

    return facilitator
  } catch (error) {
    console.error('Failed to fetch facilitator:', error)
    return null
  }
}

export async function toggleFeatured(id: string): Promise<FacilitatorActionResult> {
  try {
    const facilitator = await prisma.facilitator.findUnique({
      where: { id },
      select: { isFeatured: true },
    })

    if (!facilitator) {
      return { success: false, error: 'Facilitador não encontrado' }
    }

    await prisma.facilitator.update({
      where: { id },
      data: { isFeatured: !facilitator.isFeatured },
    })

    revalidatePath('/admin/facilitadores')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle featured:', error)
    return {
      success: false,
      error: `Falha ao alterar destaque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}
