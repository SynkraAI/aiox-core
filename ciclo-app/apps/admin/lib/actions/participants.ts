'use server'

import { prisma } from '@ciclo/database'
import type { Prisma, RegistrationStatus, UserRole } from '@ciclo/database'
import { revalidatePath } from 'next/cache'

// ============================================================
// Types
// ============================================================

export interface ParticipantFilters {
  eventId?: string
  status?: RegistrationStatus
  isFirstTime?: boolean
  search?: string
}

export interface ParticipantRow {
  id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  createdAt: Date
  eventsCount: number
  lastRegistrationDate: Date | null
  lastRegistrationStatus: RegistrationStatus | null
}

export interface ParticipantListResult {
  participants: ParticipantRow[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

interface InternalNote {
  text: string
  adminEmail: string
  createdAt: string
}

export interface ParticipantDetail {
  id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  createdAt: Date
  internalNotes: InternalNote[]
  registrations: Array<{
    id: string
    eventName: string
    eventDate: Date
    ticketTypeName: string
    amountPaid: number
    status: RegistrationStatus
    dietaryRestrictions: string | null
    isFirstTime: boolean
    createdAt: Date
  }>
}

export interface ParticipantActionResult {
  success: boolean
  error?: string
}

// ============================================================
// Server Actions
// ============================================================

/**
 * Lista participantes com filtros e paginacao (offset-based)
 * AC-1, AC-2, AC-3
 */
export async function getParticipants(
  filters: ParticipantFilters = {},
  page: number = 1,
  perPage: number = 25,
): Promise<ParticipantListResult> {
  try {
    const skip = (page - 1) * perPage

    // Build the where clause for users who have registrations
    const registrationWhere: Record<string, unknown> = {}

    if (filters.eventId) {
      registrationWhere.eventId = filters.eventId
    }
    if (filters.status) {
      registrationWhere.status = filters.status
    }
    if (filters.isFirstTime !== undefined) {
      registrationWhere.isFirstTime = filters.isFirstTime
    }

    const hasRegistrationFilters = Object.keys(registrationWhere).length > 0

    const userWhere: Record<string, unknown> = {
      isDeleted: false,
      registrations: hasRegistrationFilters
        ? { some: registrationWhere }
        : { some: {} },
    }

    if (filters.search) {
      const searchTerm = filters.search.trim()
      userWhere.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: userWhere,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          registrations: {
            select: {
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: perPage,
      }),
      prisma.user.count({ where: userWhere }),
    ])

    const participants: ParticipantRow[] = users.map((user) => {
      const lastReg = user.registrations[0] ?? null
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        eventsCount: user.registrations.length,
        lastRegistrationDate: lastReg?.createdAt ?? null,
        lastRegistrationStatus: lastReg?.status ?? null,
      }
    })

    return {
      participants,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  } catch (error) {
    console.error('Failed to fetch participants:', error)
    return {
      participants: [],
      total: 0,
      page: 1,
      perPage,
      totalPages: 0,
    }
  }
}

/**
 * Busca perfil completo do participante com historico de inscrições
 * AC-4
 */
export async function getParticipant(id: string): Promise<ParticipantDetail | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        internalNotes: true,
        registrations: {
          select: {
            id: true,
            status: true,
            dietaryRestrictions: true,
            isFirstTime: true,
            createdAt: true,
            event: {
              select: {
                name: true,
                startDate: true,
              },
            },
            ticketType: {
              select: {
                name: true,
              },
            },
            payments: {
              where: { status: 'APPROVED' },
              select: {
                amount: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) return null

    const notes = Array.isArray(user.internalNotes)
      ? (user.internalNotes as unknown as InternalNote[])
      : []

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      internalNotes: notes,
      registrations: user.registrations.map((reg) => ({
        id: reg.id,
        eventName: reg.event.name,
        eventDate: reg.event.startDate,
        ticketTypeName: reg.ticketType.name,
        amountPaid: reg.payments.reduce((sum, p) => sum + p.amount, 0),
        status: reg.status,
        dietaryRestrictions: reg.dietaryRestrictions,
        isFirstTime: reg.isFirstTime,
        createdAt: reg.createdAt,
      })),
    }
  } catch (error) {
    console.error('Failed to fetch participant:', error)
    return null
  }
}

/**
 * Salva anotações internas (append-only com timestamp e autor)
 * AC-5 — LGPD: notas internas, não visiveis ao participante
 */
export async function updateParticipantNotes(
  userId: string,
  notes: string,
  adminEmail: string,
): Promise<ParticipantActionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { internalNotes: true },
    })

    if (!user) {
      return { success: false, error: 'Participante não encontrado' }
    }

    const existingNotes = Array.isArray(user.internalNotes)
      ? (user.internalNotes as unknown as InternalNote[])
      : []

    const newNote = {
      text: notes,
      adminEmail,
      createdAt: new Date().toISOString(),
    }

    const updatedNotes = [...existingNotes, newNote] as unknown as Prisma.InputJsonValue

    await prisma.user.update({
      where: { id: userId },
      data: {
        internalNotes: updatedNotes,
      },
    })

    revalidatePath(`/admin/participantes/${userId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update participant notes:', error)
    return {
      success: false,
      error: `Falha ao salvar anotações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

/**
 * Promove role do usuario
 * AC-8: USER -> THERAPIST, THERAPIST -> FACILITATOR
 */
export async function promoteRole(
  userId: string,
  newRole: UserRole,
): Promise<ParticipantActionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) {
      return { success: false, error: 'Participante não encontrado' }
    }

    // Validate promotion path
    const validPromotions: Record<string, string[]> = {
      USER: ['THERAPIST'],
      THERAPIST: ['FACILITATOR'],
    }

    const allowed = validPromotions[user.role] ?? []
    if (!allowed.includes(newRole)) {
      return {
        success: false,
        error: `Promoção invalida: ${user.role} -> ${newRole}. Permitido: ${allowed.join(', ') || 'nenhuma'}`,
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    })

    revalidatePath(`/admin/participantes/${userId}`)
    revalidatePath('/admin/participantes')
    return { success: true }
  } catch (error) {
    console.error('Failed to promote role:', error)
    return {
      success: false,
      error: `Falha ao promover role: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    }
  }
}

/**
 * Exporta participantes como CSV (server-side)
 * AC-6, AC-7 — LGPD: CPF NUNCA incluido
 */
export async function exportParticipantsCSV(
  filters: ParticipantFilters = {},
  adminEmail: string,
): Promise<string> {
  try {
    const registrationWhere: Record<string, unknown> = {}

    if (filters.eventId) {
      registrationWhere.eventId = filters.eventId
    }
    if (filters.status) {
      registrationWhere.status = filters.status
    }
    if (filters.isFirstTime !== undefined) {
      registrationWhere.isFirstTime = filters.isFirstTime
    }

    const hasRegistrationFilters = Object.keys(registrationWhere).length > 0

    const userWhere: Record<string, unknown> = {
      isDeleted: false,
      registrations: hasRegistrationFilters
        ? { some: registrationWhere }
        : { some: {} },
    }

    if (filters.search) {
      const searchTerm = filters.search.trim()
      userWhere.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        name: true,
        email: true,
        phone: true,
        registrations: {
          select: {
            payments: {
              where: { status: 'APPROVED' },
              select: { amount: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Header informativo (AC-7)
    const exportDate = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date())

    const headerInfo = `# Exportado em ${exportDate} por ${adminEmail} — Dados confidenciais — Uso interno Base Tríade`

    // CSV header
    const csvHeader = 'Nome,Email,Telefone,Eventos,Total Pago'

    // CSV rows — CPF NUNCA incluido (LGPD)
    const csvRows = users.map((user) => {
      const eventsCount = user.registrations.length
      const totalPaid = user.registrations.reduce(
        (sum, reg) => sum + reg.payments.reduce((s, p) => s + p.amount, 0),
        0,
      )
      const totalFormatted = (totalPaid / 100).toFixed(2).replace('.', ',')

      // Escape CSV fields
      const escapeCsv = (val: string) => {
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`
        }
        return val
      }

      return [
        escapeCsv(user.name),
        escapeCsv(user.email),
        escapeCsv(user.phone ?? ''),
        String(eventsCount),
        `R$ ${totalFormatted}`,
      ].join(',')
    })

    return [headerInfo, csvHeader, ...csvRows].join('\n')
  } catch (error) {
    console.error('Failed to export participants CSV:', error)
    return ''
  }
}

/**
 * Lista eventos para uso nos filtros de participantes
 */
export async function getEventsForFilter(): Promise<Array<{ id: string; name: string }>> {
  try {
    const events = await prisma.event.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { startDate: 'desc' },
    })
    return events
  } catch (error) {
    console.error('Failed to fetch events for filter:', error)
    return []
  }
}
