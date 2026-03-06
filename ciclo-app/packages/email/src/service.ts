/**
 * Email Service — Orchestrates template rendering + sending via Resend
 * Story E4.1 — AC-3, AC-6, AC-7: Send transactional emails for registrations
 *
 * Each function loads registration data from DB, renders the apprópriate template,
 * sends via Resend, and marks the boolean flag to prevent duplicate sends.
 */

import { prisma } from '@ciclo/database'
import { sendEmail } from './client'
import { renderConfirmationEmail } from './templates/confirmation'
import { renderReminder7dEmail } from './templates/reminder-7d'
import { renderReminder24hEmail } from './templates/reminder-24h'
import { renderFeedbackEmail } from './templates/feedback'
import type { ScheduleItem } from './templates/reminder-24h'

const APP_URL = () => process.env.APP_URL ?? 'https://ciclodaseestações.com.br'

// ============================================================
// Helpers
// ============================================================

function formatDate(date: Date): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

interface RegistrationEmailData {
  id: string
  userId: string
  eventId: string
  qrCode: string | null
  emailConfirmationSent: boolean
  emailReminder7dSent: boolean
  emailReminder24hSent: boolean
  emailFeedbackSent: boolean
  user: { name: string; email: string }
  event: {
    name: string
    slug: string
    startDate: Date
    endDate: Date
    venue: string | null
  }
  ticketType: { name: string }
}

async function loadRegistrationData(registrationId: string): Promise<RegistrationEmailData | null> {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { name: true, slug: true, startDate: true, endDate: true, venue: true } },
      ticketType: { select: { name: true } },
    },
  })

  return registration as RegistrationEmailData | null
}

// ============================================================
// Confirmation Email (AC-3)
// ============================================================

export interface SendEmailServiceResult {
  success: boolean
  error?: string
  alreadySent?: boolean
}

/**
 * Sends confirmation email for a registration.
 * Idempotent: checks emailConfirmationSent flag before sending.
 */
export async function sendConfirmationEmail(
  registrationId: string,
  force = false
): Promise<SendEmailServiceResult> {
  try {
    const reg = await loadRegistrationData(registrationId)

    if (!reg) {
      return { success: false, error: `Registration ${registrationId} not found` }
    }

    if (reg.emailConfirmationSent && !force) {
      return { success: true, alreadySent: true }
    }

    const { html, text } = renderConfirmationEmail({
      participantName: reg.user.name,
      eventName: reg.event.name,
      eventDate: formatDate(reg.event.startDate),
      eventLocation: reg.event.venue ?? 'A confirmar',
      ticketTypeName: reg.ticketType.name,
      qrCodeBase64: reg.qrCode ?? undefined,
      userAreaUrl: `${APP_URL()}/minha-conta/inscrições/${reg.id}`,
    })

    const result = await sendEmail({
      to: reg.user.email,
      subject: `Inscrição Confirmada: ${reg.event.name}`,
      html,
      text,
    })

    if (result.success) {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { emailConfirmationSent: true },
      })
    }

    return { success: result.success, error: result.error }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(JSON.stringify({
      event_type: 'email.confirmation.error',
      registration_id: registrationId,
      error: message,
      timestamp: new Date().toISOString(),
    }))
    return { success: false, error: message }
  }
}

// ============================================================
// 7-Day Reminder Email (AC-4)
// ============================================================

export async function sendReminder7dEmail(registrationId: string): Promise<SendEmailServiceResult> {
  try {
    const reg = await loadRegistrationData(registrationId)

    if (!reg) {
      return { success: false, error: `Registration ${registrationId} not found` }
    }

    if (reg.emailReminder7dSent) {
      return { success: true, alreadySent: true }
    }

    const { html, text } = renderReminder7dEmail({
      participantName: reg.user.name,
      eventName: reg.event.name,
      eventDate: formatDate(reg.event.startDate),
      eventLocation: reg.event.venue ?? 'A confirmar',
      eventPageUrl: `${APP_URL()}/eventos/${reg.event.slug}`,
      // whatToBring and howToGetThere can be loaded from SiteContent/Event in the future
    })

    const result = await sendEmail({
      to: reg.user.email,
      subject: `Lembrete: ${reg.event.name} em 7 dias`,
      html,
      text,
    })

    if (result.success) {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { emailReminder7dSent: true },
      })
    }

    return { success: result.success, error: result.error }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(JSON.stringify({
      event_type: 'email.reminder7d.error',
      registration_id: registrationId,
      error: message,
      timestamp: new Date().toISOString(),
    }))
    return { success: false, error: message }
  }
}

// ============================================================
// 24-Hour Reminder Email (AC-5)
// ============================================================

export async function sendReminder24hEmail(registrationId: string): Promise<SendEmailServiceResult> {
  try {
    const reg = await loadRegistrationData(registrationId)

    if (!reg) {
      return { success: false, error: `Registration ${registrationId} not found` }
    }

    if (reg.emailReminder24hSent) {
      return { success: true, alreadySent: true }
    }

    // Load schedule from activities
    const activities = await prisma.activity.findMany({
      where: { eventId: reg.eventId },
      orderBy: { time: 'asc' },
      select: { time: true, title: true, durationMinutes: true },
    })

    const schedule: ScheduleItem[] = activities.map(a => ({
      time: `${String(a.time.getHours()).padStart(2, '0')}:${String(a.time.getMinutes()).padStart(2, '0')}`,
      title: a.title,
      duration: a.durationMinutes ? `${a.durationMinutes} min` : undefined,
    }))

    const { html, text } = renderReminder24hEmail({
      participantName: reg.user.name,
      eventName: reg.event.name,
      eventDate: formatDate(reg.event.startDate),
      eventLocation: reg.event.venue ?? 'A confirmar',
      qrCodeBase64: reg.qrCode ?? undefined,
      schedule: schedule.length > 0 ? schedule : undefined,
    })

    const result = await sendEmail({
      to: reg.user.email,
      subject: `Amanha: ${reg.event.name}`,
      html,
      text,
    })

    if (result.success) {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { emailReminder24hSent: true },
      })
    }

    return { success: result.success, error: result.error }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(JSON.stringify({
      event_type: 'email.reminder24h.error',
      registration_id: registrationId,
      error: message,
      timestamp: new Date().toISOString(),
    }))
    return { success: false, error: message }
  }
}

// ============================================================
// Feedback Email (AC-7)
// ============================================================

export async function sendFeedbackEmail(registrationId: string): Promise<SendEmailServiceResult> {
  try {
    const reg = await loadRegistrationData(registrationId)

    if (!reg) {
      return { success: false, error: `Registration ${registrationId} not found` }
    }

    if (reg.emailFeedbackSent) {
      return { success: true, alreadySent: true }
    }

    const testimonialUrl = `${APP_URL()}/depoimento/${reg.id}`

    const { html, text } = renderFeedbackEmail({
      participantName: reg.user.name,
      eventName: reg.event.name,
      testimonialUrl,
      ratingUrl: testimonialUrl,
    })

    const result = await sendEmail({
      to: reg.user.email,
      subject: `Como foi o ${reg.event.name}? Deixe sua avaliação`,
      html,
      text,
    })

    if (result.success) {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { emailFeedbackSent: true },
      })
    }

    return { success: result.success, error: result.error }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(JSON.stringify({
      event_type: 'email.feedback.error',
      registration_id: registrationId,
      error: message,
      timestamp: new Date().toISOString(),
    }))
    return { success: false, error: message }
  }
}
