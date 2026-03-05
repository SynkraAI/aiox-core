/**
 * 24-Hour Reminder Email Template
 * Story E4.1 — AC-5: Lembrete urgente, QR Code inline, cronograma do dia
 */

import { emailLayout, infoBox, divider, BRAND } from './shared-styles'
import type { EmailRenderResult } from './confirmation'

export interface Reminder24hEmailData {
  participantName: string
  eventName: string
  eventDate: string
  eventLocation: string
  qrCodeBase64?: string
  schedule?: ScheduleItem[]   // Day schedule
}

export interface ScheduleItem {
  time: string       // e.g., "08:00"
  title: string
  duration?: string  // e.g., "60 min"
}

export function renderReminder24hEmail(data: Reminder24hEmailData): EmailRenderResult {
  const qrSection = data.qrCodeBase64
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 16px 0;">
            <img src="${data.qrCodeBase64}" alt="QR Code do ingresso" width="180" height="180" style="display: block; border: 2px solid ${BRAND.colors.border}; border-radius: 8px;">
          </td>
        </tr>
        <tr>
          <td align="center">
            <p style="margin: 0; font-size: 13px; color: ${BRAND.colors.textLight};">
              Apresente este QR Code na entrada
            </p>
          </td>
        </tr>
      </table>`
    : ''

  const scheduleSection = data.schedule && data.schedule.length > 0
    ? `${divider()}
      <h3 style="margin: 0 0 12px; font-size: 16px; color: ${BRAND.colors.primary};">
        Cronograma do Dia
      </h3>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        ${data.schedule.map(item => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${BRAND.colors.border}; vertical-align: top; width: 70px;">
            <strong style="color: ${BRAND.colors.secondary}; font-size: 14px;">${escapeHtml(item.time)}</strong>
          </td>
          <td style="padding: 8px 0 8px 12px; border-bottom: 1px solid ${BRAND.colors.border};">
            <span style="font-size: 14px; color: ${BRAND.colors.text};">${escapeHtml(item.title)}</span>
            ${item.duration ? `<span style="font-size: 12px; color: ${BRAND.colors.textLight};"> (${escapeHtml(item.duration)})</span>` : ''}
          </td>
        </tr>`).join('')}
      </table>`
    : ''

  const content = `
    <h2 style="margin: 0 0 8px; font-size: 22px; color: ${BRAND.colors.primary};">
      E amanha! 🌟
    </h2>
    <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.colors.text};">
      Ola, <strong>${escapeHtml(data.participantName)}</strong>! Seu evento e <strong>amanha</strong>. Estamos ansiosos para te receber!
    </p>

    ${infoBox(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding: 4px 0;">
            <strong style="color: ${BRAND.colors.secondary};">Evento:</strong>
            <span>${escapeHtml(data.eventName)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <strong style="color: ${BRAND.colors.secondary};">Data:</strong>
            <span>${escapeHtml(data.eventDate)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <strong style="color: ${BRAND.colors.secondary};">Local:</strong>
            <span>${escapeHtml(data.eventLocation)}</span>
          </td>
        </tr>
      </table>
    `)}

    ${qrSection}
    ${scheduleSection}

    ${divider()}

    <p style="margin: 0; font-size: 14px; color: ${BRAND.colors.text}; text-align: center; line-height: 1.6;">
      Chegue com antecedencia para aproveitar ao maximo a experiencia.<br>
      Nos vemos amanha! 🌿
    </p>
  `

  const html = emailLayout(content, `Amanha: ${data.eventName}`)

  const scheduleText = data.schedule && data.schedule.length > 0
    ? `\nCronograma do Dia:\n${data.schedule.map(item => `${item.time} - ${item.title}${item.duration ? ` (${item.duration})` : ''}`).join('\n')}\n`
    : ''

  const text = `LEMBRETE: E AMANHA! - Ciclo das Estacoes

Ola, ${data.participantName}! Seu evento e amanha. Estamos ansiosos para te receber!

Evento: ${data.eventName}
Data: ${data.eventDate}
Local: ${data.eventLocation}
${scheduleText}
Chegue com antecedencia para aproveitar ao maximo a experiencia.
Nos vemos amanha!

---
${BRAND.footer}`

  return { html, text }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
