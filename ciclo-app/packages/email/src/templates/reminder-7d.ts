/**
 * 7-Day Reminder Email Template
 * Story E4.1 — AC-4: Lembrete do evento, link página publica, o que trazer, como chegar
 */

import { emailLayout, buttonBlock, infoBox, divider, BRAND } from './shared-styles'
import type { EmailRenderResult } from './confirmation'

export interface Reminder7dEmailData {
  participantName: string
  eventName: string
  eventDate: string
  eventLocation: string
  eventPageUrl: string       // Link to /eventos/[slug]
  whatToBring?: string[]     // List of items to bring
  howToGetThere?: string     // Directions / instructions
}

export function renderReminder7dEmail(data: Reminder7dEmailData): EmailRenderResult {
  const whatToBringSection = data.whatToBring && data.whatToBring.length > 0
    ? `${divider()}
      <h3 style="margin: 0 0 12px; font-size: 16px; color: ${BRAND.colors.primary};">
        O que trazer
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: ${BRAND.colors.text}; font-size: 14px; line-height: 1.8;">
        ${data.whatToBring.map(item => `<li>${escapeHtml(item)}</li>`).join('\n        ')}
      </ul>`
    : ''

  const directionsSection = data.howToGetThere
    ? `${divider()}
      <h3 style="margin: 0 0 12px; font-size: 16px; color: ${BRAND.colors.primary};">
        Como chegar
      </h3>
      <p style="margin: 0; font-size: 14px; color: ${BRAND.colors.text}; line-height: 1.6;">
        ${escapeHtml(data.howToGetThere)}
      </p>`
    : ''

  const content = `
    <h2 style="margin: 0 0 8px; font-size: 22px; color: ${BRAND.colors.primary};">
      Falta 1 semana! 🌿
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.colors.text};">
      Ola, <strong>${escapeHtml(data.participantName)}</strong>! Falta apenas uma semana para o seu evento.
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

    ${whatToBringSection}
    ${directionsSection}

    ${divider()}

    <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.colors.text};">
      Veja todos os detalhes do evento:
    </p>

    ${buttonBlock('Ver Pagina do Evento', data.eventPageUrl)}
  `

  const html = emailLayout(content, `Falta 1 semana para ${data.eventName}`)

  const whatToBringText = data.whatToBring && data.whatToBring.length > 0
    ? `\nO que trazer:\n${data.whatToBring.map(item => `- ${item}`).join('\n')}\n`
    : ''

  const directionsText = data.howToGetThere
    ? `\nComo chegar:\n${data.howToGetThere}\n`
    : ''

  const text = `LEMBRETE: FALTA 1 SEMANA - Ciclo das Estações

Ola, ${data.participantName}! Falta apenas uma semana para o seu evento.

Evento: ${data.eventName}
Data: ${data.eventDate}
Local: ${data.eventLocation}
${whatToBringText}${directionsText}
Pagina do evento: ${data.eventPageUrl}

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
