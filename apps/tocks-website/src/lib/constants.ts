/** Site-wide brand constants */

export const SITE_NAME = 'Tocks Custom'
export const SITE_URL = 'https://tockscustom.com.br'
export const SITE_DESCRIPTION =
  'Móveis de autor em madeira maciça. Ateliê em Itajaí, entregas para todo o Brasil.'

export const WHATSAPP_NUMBER = '554730419811'
export const WHATSAPP_MESSAGE = encodeURIComponent(
  'Olá, gostaria de conhecer o acervo Tocks Custom.'
)
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`

export const CONTACT_EMAIL = 'contato@tockscustom.com.br'

export const NAV_LINKS = [
  { label: 'Colecao', href: '/colecao' },
  { label: 'Atelier', href: '/atelier' },
  { label: 'Projetos', href: '/projetos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contato', href: '/contato' },
] as const

/**
 * Routes whose TOP surface is bone (section-bone at first paint).
 * Header reads this list to swap to `variant="bone"` (bone-ink text + noir-deep logo)
 * so Logo/NavLinks pass WCAG AAA on bone. When Header becomes scrolled (noir backdrop
 * activates), colors revert to the noir scheme regardless of route.
 *
 * Contract: add a route here ONLY if its top-of-viewport section uses `section-bone`
 * (or equivalent bone background) before any scroll. Product pages are NOT in this list
 * because their hero is noir and bone only appears after scroll.
 */
export const HEADER_BONE_ROUTES = ['/atelier'] as const

export const BRAND_COPY = {
  hero: {
    headline: 'Peças que atravessam gerações.',
    subtitle:
      'Móveis de autor em madeira maciça. Cada peça é um projeto. Cada projeto, uma assinatura.',
    cta: 'Converse com o ateliê',
    cta_primary: 'Agende uma visita ao ateliê',
    cta_secondary: 'Ver o acervo',
  },
  atelier: {
    headline: 'Desde 2008, madeira e autoria.',
    subtitle:
      'Um ateliê onde marcenaria tradicional encontra desenho contemporâneo.',
  },
  collection: {
    headline: 'Acervo',
    subtitle:
      'Mesas, console, aparadores, pebolins — todas sob medida, todas únicas.',
  },
  projects: {
    headline: 'Casas que receberam Tocks',
    subtitle: 'Interiores de autor merecem móveis de autor.',
  },
  faq: {
    headline: 'Dúvidas Frequentes',
    subtitle:
      'Reunimos aqui as perguntas mais comuns sobre o processo de criação das nossas peças.',
  },
  contact: {
    headline: 'Vamos criar sua peça',
    subtitle:
      'Cada projeto começa com uma conversa. Conte-nos sobre seu espaço e criaremos a peça perfeita.',
  },
  footer: {
    tagline: 'Peças que atravessam gerações.',
    location: 'Itajaí, Santa Catarina, Brasil',
  },
} as const
