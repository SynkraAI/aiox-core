'use server'

import { prisma } from '@ciclo/database'
import type { Season, AstronomicalEvent } from '@ciclo/database'
import { revalidatePath } from 'next/cache'

// ============================================================
// Types
// ============================================================

export interface EventActionResult {
  success: boolean
  error?: string
  eventId?: string
}

interface CreateEventInput {
  name: string
  subtitle?: string
  slug: string
  season: Season
  astronomicalEvent?: AstronomicalEvent | null
  startDate: string
  endDate: string
  elementMTC?: string
  organMTC?: string
  description?: string
  includedPractices: string[]
  capacity?: number | null
  venue?: string
  isPublished: boolean
  isSoldOut: boolean
}

interface UpdateEventInput extends CreateEventInput {
  id: string
}

// ============================================================
// Server Actions
// ============================================================

export async function createEvent(input: CreateEventInput): Promise<EventActionResult> {
  try {
    // Check slug uniqueness
    const existing = await prisma.event.findUnique({
      where: { slug: input.slug },
    })
    if (existing) {
      return { success: false, error: 'Slug já existe. Escolha outro.' }
    }

    const event = await prisma.event.create({
      data: {
        name: input.name,
        subtitle: input.subtitle || null,
        slug: input.slug,
        season: input.season,
        astronomicalEvent: input.astronomicalEvent || null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        elementMTC: input.elementMTC || null,
        organMTC: input.organMTC || null,
        description: input.description || null,
        includedPractices: input.includedPractices,
        capacity: input.capacity ?? null,
        venue: input.venue || null,
        isPublished: input.isPublished,
        isSoldOut: input.isSoldOut,
      },
    })

    revalidatePath('/admin/eventos')
    return { success: true, eventId: event.id }
  } catch (error) {
    console.error('Failed to create event:', error)
    return {
      success: false,
      error: `Falha ao criar evento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function updateEvent(input: UpdateEventInput): Promise<EventActionResult> {
  try {
    // Check slug uniqueness (exclude current event)
    const existing = await prisma.event.findFirst({
      where: {
        slug: input.slug,
        id: { not: input.id },
      },
    })
    if (existing) {
      return { success: false, error: 'Slug já existe. Escolha outro.' }
    }

    await prisma.event.update({
      where: { id: input.id },
      data: {
        name: input.name,
        subtitle: input.subtitle || null,
        slug: input.slug,
        season: input.season,
        astronomicalEvent: input.astronomicalEvent || null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        elementMTC: input.elementMTC || null,
        organMTC: input.organMTC || null,
        description: input.description || null,
        includedPractices: input.includedPractices,
        capacity: input.capacity ?? null,
        venue: input.venue || null,
        isPublished: input.isPublished,
        isSoldOut: input.isSoldOut,
      },
    })

    revalidatePath('/admin/eventos')
    revalidatePath(`/admin/eventos/${input.id}`)
    return { success: true, eventId: input.id }
  } catch (error) {
    console.error('Failed to update event:', error)
    return {
      success: false,
      error: `Falha ao atualizar evento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function deleteEvent(id: string): Promise<EventActionResult> {
  try {
    // Check if event has registrations
    const registrationCount = await prisma.registration.count({
      where: { eventId: id },
    })

    if (registrationCount > 0) {
      // Soft delete - has registrations
      await prisma.event.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          isPublished: false,
        },
      })
    } else {
      // Hard delete - no registrations
      await prisma.event.delete({
        where: { id },
      })
    }

    revalidatePath('/admin/eventos')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete event:', error)
    return {
      success: false,
      error: `Falha ao deletar evento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function getEvents(filters?: {
  season?: Season
  status?: 'published' | 'draft' | 'soldout'
}) {
  try {
    const where: Record<string, unknown> = {
      isDeleted: false,
    }

    if (filters?.season) {
      where.season = filters.season
    }

    if (filters?.status === 'published') {
      where.isPublished = true
      where.isSoldOut = false
    } else if (filters?.status === 'draft') {
      where.isPublished = false
    } else if (filters?.status === 'soldout') {
      where.isSoldOut = true
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        ticketTypes: {
          select: {
            quantityAvailable: true,
            quantitySold: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    })

    return events
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return []
  }
}

export async function getEvent(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
        ticketTypes: true,
        cancellationPolicy: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    })

    return event
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return null
  }
}

export async function togglePublish(id: string): Promise<EventActionResult> {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { isPublished: true },
    })

    if (!event) {
      return { success: false, error: 'Evento não encontrado' }
    }

    await prisma.event.update({
      where: { id },
      data: { isPublished: !event.isPublished },
    })

    revalidatePath('/admin/eventos')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle publish:', error)
    return {
      success: false,
      error: `Falha ao alterar publicacao: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

export async function toggleSoldOut(id: string): Promise<EventActionResult> {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { isSoldOut: true },
    })

    if (!event) {
      return { success: false, error: 'Evento não encontrado' }
    }

    await prisma.event.update({
      where: { id },
      data: { isSoldOut: !event.isSoldOut },
    })

    revalidatePath('/admin/eventos')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle sold out:', error)
    return {
      success: false,
      error: `Falha ao alterar esgotamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

// ============================================================
// FAQ Actions
// ============================================================

export async function createFAQ(eventId: string, question: string, answer: string) {
  try {
    const maxOrder = await prisma.fAQ.findFirst({
      where: { eventId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    await prisma.fAQ.create({
      data: {
        eventId,
        question,
        answer,
        order: (maxOrder?.order ?? -1) + 1,
      },
    })

    revalidatePath(`/admin/eventos/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to create FAQ:', error)
    return { success: false, error: 'Falha ao criar FAQ' }
  }
}

export async function updateFAQ(id: string, question: string, answer: string) {
  try {
    const faq = await prisma.fAQ.update({
      where: { id },
      data: { question, answer },
    })

    revalidatePath(`/admin/eventos/${faq.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update FAQ:', error)
    return { success: false, error: 'Falha ao atualizar FAQ' }
  }
}

export async function deleteFAQ(id: string) {
  try {
    const faq = await prisma.fAQ.delete({
      where: { id },
    })

    revalidatePath(`/admin/eventos/${faq.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete FAQ:', error)
    return { success: false, error: 'Falha ao deletar FAQ' }
  }
}

export async function reorderFAQs(eventId: string, orderedIds: string[]) {
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.fAQ.update({
          where: { id },
          data: { order: index },
        }),
      ),
    )

    revalidatePath(`/admin/eventos/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to reorder FAQs:', error)
    return { success: false, error: 'Falha ao reordenar FAQs' }
  }
}

// ============================================================
// Image Actions
// ============================================================

export async function createImage(eventId: string, url: string, alt?: string) {
  try {
    const maxOrder = await prisma.image.findFirst({
      where: { eventId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    await prisma.image.create({
      data: {
        eventId,
        url,
        alt: alt || null,
        order: (maxOrder?.order ?? -1) + 1,
      },
    })

    revalidatePath(`/admin/eventos/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to create image:', error)
    return { success: false, error: 'Falha ao adicionar imagem' }
  }
}

export async function deleteImage(id: string) {
  try {
    const image = await prisma.image.delete({
      where: { id },
    })

    revalidatePath(`/admin/eventos/${image.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete image:', error)
    return { success: false, error: 'Falha ao remover imagem' }
  }
}

export async function reorderImages(eventId: string, orderedIds: string[]) {
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.image.update({
          where: { id },
          data: { order: index },
        }),
      ),
    )

    revalidatePath(`/admin/eventos/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to reorder images:', error)
    return { success: false, error: 'Falha ao reordenar imagens' }
  }
}
