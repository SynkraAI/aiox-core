/**
 * Feedback Email Template
 * Story E4.1 — AC-7: Link para formulário de depoimento, pergunta de satisfacao
 */

import { emailLayout, buttonBlock, divider, BRAND } from './shared-styles'
import type { EmailRenderResult } from './confirmation'

export interface FeedbackEmailData {
  participantName: string
  eventName: string
  testimonialUrl: string     // /depoimento/[registrationId]
  ratingUrl: string          // URL with rating param or same testimonial page
}

export function renderFeedbackEmail(data: FeedbackEmailData): EmailRenderResult {
  // Star rating links (1-5)
  const starsHtml = [1, 2, 3, 4, 5].map(n => {
    const starUrl = `${data.ratingUrl}?rating=${n}`
    const filled = '&#9733;'  // Filled star
    return `<a href="${starUrl}" target="_blank" style="text-decoration: none; font-size: 32px; color: ${n <= 3 ? BRAND.colors.accent : BRAND.colors.secondary}; padding: 0 4px;">${filled}</a>`
  }).join('')

  const content = `
    <h2 style="margin: 0 0 8px; font-size: 22px; color: ${BRAND.colors.primary};">
      Como foi sua experiência? 🌿
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.colors.text}; line-height: 1.6;">
      Ola, <strong>${escapeHtml(data.participantName)}</strong>! Esperamos que você tenha tido uma experiência transformadora no <strong>${escapeHtml(data.eventName)}</strong>.
    </p>

    <p style="margin: 0 0 16px; font-size: 14px; color: ${BRAND.colors.text}; line-height: 1.6;">
      Sua opiniao e muito importante para nos. Avalie sua experiência clicando em uma estrela:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 16px 0;">
          ${starsHtml}
        </td>
      </tr>
    </table>

    ${divider()}

    <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.colors.text}; line-height: 1.6;">
      Você também pode deixar um depoimento sobre sua vivencia. Compartilhe o que sentiu, aprendeu e levou consigo:
    </p>

    ${buttonBlock('Deixar Depoimento', data.testimonialUrl)}

    <p style="margin: 16px 0 0; font-size: 13px; color: ${BRAND.colors.textLight}; text-align: center;">
      Obrigado por fazer parte desta jornada! 🙏
    </p>
  `

  const html = emailLayout(content, `Como foi o ${data.eventName}? Deixe sua avaliação`)

  const text = `COMO FOI SUA EXPERIENCIA? - Ciclo das Estações

Ola, ${data.participantName}! Esperamos que você tenha tido uma experiência transformadora no ${data.eventName}.

Avalie sua experiência (1-5 estrelas): ${data.ratingUrl}

Deixe seu depoimento: ${data.testimonialUrl}

Obrigado por fazer parte desta jornada!

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
