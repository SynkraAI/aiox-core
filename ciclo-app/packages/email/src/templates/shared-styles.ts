/**
 * Shared email styles and layout components
 * Story E4.1 — Base Triade branding for all email templates
 *
 * All styles are inline CSS for maximum email client compatibility.
 */

export const BRAND = {
  name: 'Ciclo das Estacoes',
  tagline: 'Reconecte-se com os ciclos da natureza',
  colors: {
    primary: '#2D5016',     // Forest green
    secondary: '#8B6914',   // Golden earth
    accent: '#C4A84B',      // Light gold
    background: '#FDFBF5',  // Warm cream
    text: '#1A1A1A',        // Near black
    textLight: '#666666',   // Gray
    border: '#E8E0D0',      // Light tan
    white: '#FFFFFF',
  },
  footer: 'iAi - ECOssistema Base Triade',
} as const

export function emailLayout(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Ciclo das Estacoes</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.colors.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: ${BRAND.colors.text}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  ${preheader ? `<div style="display:none;font-size:1px;color:${BRAND.colors.background};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}

  <!-- Main container -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${BRAND.colors.background};">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: ${BRAND.colors.white}; border-radius: 8px; overflow: hidden; border: 1px solid ${BRAND.colors.border};">
          <!-- Header -->
          <tr>
            <td style="background-color: ${BRAND.colors.primary}; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${BRAND.colors.white}; letter-spacing: 0.5px;">
                🌿 Ciclo das Estacoes
              </h1>
              <p style="margin: 4px 0 0; font-size: 13px; color: ${BRAND.colors.accent}; letter-spacing: 1px;">
                ${BRAND.tagline}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F0E6; padding: 20px 32px; text-align: center; border-top: 1px solid ${BRAND.colors.border};">
              <p style="margin: 0 0 8px; font-size: 12px; color: ${BRAND.colors.textLight};">
                ${BRAND.footer}
              </p>
              <p style="margin: 0; font-size: 11px; color: ${BRAND.colors.textLight};">
                Este email foi enviado porque voce esta inscrito em um evento Ciclo das Estacoes.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buttonBlock(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td align="center" style="padding: 24px 0;">
      <a href="${href}" target="_blank" style="display: inline-block; background-color: ${BRAND.colors.primary}; color: ${BRAND.colors.white}; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 6px; letter-spacing: 0.3px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`
}

export function infoBox(content: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 16px 0;">
  <tr>
    <td style="background-color: #F5F0E6; padding: 16px 20px; border-radius: 6px; border-left: 4px solid ${BRAND.colors.secondary};">
      ${content}
    </td>
  </tr>
</table>`
}

export function divider(): string {
  return `<hr style="border: none; border-top: 1px solid ${BRAND.colors.border}; margin: 24px 0;">`
}
