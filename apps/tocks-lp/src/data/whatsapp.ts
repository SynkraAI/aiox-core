const WHATSAPP_NUMBER = '554730419811'

function getUtmParams(): string {
  if (typeof window === 'undefined') return ''

  const params = new URLSearchParams(window.location.search)
  const utmSource = params.get('utm_source')
  const utmMedium = params.get('utm_medium')
  const utmCampaign = params.get('utm_campaign')

  const parts: string[] = []
  if (utmSource) parts.push(`Origem: ${utmSource}`)
  if (utmMedium) parts.push(`Midia: ${utmMedium}`)
  if (utmCampaign) parts.push(`Campanha: ${utmCampaign}`)

  return parts.length > 0 ? `\n\n[${parts.join(' | ')}]` : ''
}

function buildWhatsAppUrl(message: string): string {
  const fullMessage = message + getUtmParams()
  const encoded = encodeURIComponent(fullMessage)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
}

export function getWhatsAppDefault(): string {
  return buildWhatsAppUrl(
    'Ola! Vi as mesas no site e gostaria de saber mais sobre personalizacao e orcamento.'
  )
}

/** @deprecated Use getWhatsAppDefault() for UTM support */
export const WHATSAPP_DEFAULT = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Ola! Vi as mesas no site e gostaria de saber mais sobre personalizacao e orcamento.')}`

export function getWhatsAppUrlForModel(modelName: string): string {
  return buildWhatsAppUrl(
    `Ola! Tenho interesse na Mesa ${modelName}. Gostaria de saber mais sobre personalizacao.`
  )
}

export function getWhatsAppUrlCustom(message: string): string {
  return buildWhatsAppUrl(message)
}
