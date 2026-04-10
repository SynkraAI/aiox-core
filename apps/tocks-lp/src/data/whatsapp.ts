const WHATSAPP_NUMBER = '554730419811'

function getUtmParams(): string {
  if (typeof window === 'undefined') return ''

  const params = new URLSearchParams(window.location.search)
  const utmSource = params.get('utm_source')
  const utmMedium = params.get('utm_medium')
  const utmCampaign = params.get('utm_campaign')

  const parts: string[] = []
  if (utmSource) parts.push(`Origem: ${utmSource}`)
  if (utmMedium) parts.push(`Mídia: ${utmMedium}`)
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
    'Olá! Vi as mesas no site e gostaria de saber mais sobre personalização e orçamento.'
  )
}

export function getWhatsAppUrlForModel(modelName: string): string {
  return buildWhatsAppUrl(
    `Olá! Tenho interesse na Mesa ${modelName}. Gostaria de receber o projeto 3D personalizado gratuito.`
  )
}

export function getWhatsAppUrlCustom(message: string): string {
  return buildWhatsAppUrl(message)
}
