/**
 * Confirmation Email Template
 * Story E4.1 — AC-2: ConfirmationEmail com QR Code, dados do evento, link para area do usuario
 *
 * Renders HTML + plain text for confirmed registration.
 */

import { emailLayout, buttonBlock, infoBox, divider, BRAND } from './shared-styles'

export interface ConfirmationEmailData {
  participantName: string
  eventName: string
  eventDate: string        // Formatted date string (e.g., "22 de Dezembro de 2026")
  eventLocation: string
  ticketTypeName: string
  qrCodeBase64?: string    // Base64-encoded QR code image (data:image/png;base64,...)
  userAreaUrl: string      // Link to /minha-conta/inscrições/[id]
}

export interface EmailRenderResult {
  html: string
  text: string
}

export function renderConfirmationEmail(data: ConfirmationEmailData): EmailRenderResult {
  const qrSection = data.qrCodeBase64
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 16px 0;">
            <img src="${data.qrCodeBase64}" alt="QR Code do ingresso" width="200" height="200" style="display: block; border: 2px solid ${BRAND.colors.border}; border-radius: 8px;">
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 0 0 8px;">
            <p style="margin: 0; font-size: 13px; color: ${BRAND.colors.textLight};">
              Apresente este QR Code na entrada do evento
            </p>
          </td>
        </tr>
      </table>`
    : ''

  const content = `
    <h2 style="margin: 0 0 8px; font-size: 22px; color: ${BRAND.colors.primary};">
      Inscrição Confirmada!
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.colors.text};">
      Ola, <strong>${escapeHtml(data.participantName)}</strong>! Sua inscrição foi confirmada com sucesso.
    </p>

    ${infoBox(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding: 4px 0;">
            <strong style="color: ${BRAND.colors.secondary};">Evento:</strong>
            <span style="color: ${BRAND.colors.text};">${escapeHtml(data.eventName)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <strong style="color: ${BRAND.colors.secondary};">Data:</strong>
            <span style="color: ${BRAND.colors.text};">${escapeHtml(data.eventDate)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <strong style="color: ${BRAND.colors.secondary};">Local:</strong>
            <span style="color: ${BRAND.colors.text};">${escapeHtml(data.eventLocation)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <strong style="color: ${BRAND.colors.secondary};">Ingresso:</strong>
            <span style="color: ${BRAND.colors.text};">${escapeHtml(data.ticketTypeName)}</span>
          </td>
        </tr>
      </table>
    `)}

    ${qrSection}

    ${divider()}

    <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.colors.text};">
      Acesse sua area para ver todos os detalhes da inscrição:
    </p>

    ${buttonBlock('Minha Inscrição', data.userAreaUrl)}

    <p style="margin: 16px 0 0; font-size: 13px; color: ${BRAND.colors.textLight}; text-align: center;">
      Nos vemos no evento! 🌿
    </p>
  `

  const html = emailLayout(content, `Inscrição confirmada para ${data.eventName}`)

  const text = `INSCRICAO CONFIRMADA - Ciclo das Estações

Ola, ${data.participantName}! Sua inscrição foi confirmada com sucesso.

Evento: ${data.eventName}
Data: ${data.eventDate}
Local: ${data.eventLocation}
Ingresso: ${data.ticketTypeName}

Acesse sua area: ${data.userAreaUrl}

Nos vemos no evento!

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
