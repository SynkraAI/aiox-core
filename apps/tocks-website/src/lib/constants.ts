/** Site-wide brand constants */

export const SITE_NAME = 'Tocks Custom'
export const SITE_URL = 'https://tockscustom.com.br'
export const SITE_DESCRIPTION =
  'Mesas de bilhar artesanais em madeira macica. Projetadas sob medida em Itajai, entregues para todo o Brasil.'

export const WHATSAPP_NUMBER = '554730419811'
export const WHATSAPP_MESSAGE = encodeURIComponent(
  'Ola! Gostaria de saber mais sobre as mesas de bilhar Tocks Custom.'
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

export const BRAND_COPY = {
  hero: {
    headline: 'Cada mesa, uma obra. Cada detalhe, uma assinatura.',
    subtitle:
      'Mesas de bilhar artesanais em madeira macica. Projetadas sob medida em Itajai, entregues para todo o Brasil.',
    cta: 'Converse com nosso atelier',
  },
  atelier: {
    headline: 'O atelier onde madeira vira arte',
    subtitle:
      'Desde 2008, cada peca nasce do encontro entre marcenaria artesanal e design contemporaneo.',
  },
  collection: {
    headline: 'Colecao',
    subtitle: 'Cada modelo e uma expressao unica de design e funcionalidade.',
  },
  projects: {
    headline: 'Projetos Realizados',
    subtitle: 'Ambientes transformados por pecas que contam historias.',
  },
  faq: {
    headline: 'Dúvidas Frequentes',
    subtitle:
      'Reunimos aqui as perguntas mais comuns sobre o processo de criacao das nossas mesas.',
  },
  contact: {
    headline: 'Vamos criar sua mesa',
    subtitle:
      'Cada projeto comeca com uma conversa. Conte-nos sobre seu espaco e criaremos a peca perfeita.',
  },
  footer: {
    tagline: 'Mesas que transcendem o jogo.',
    location: 'Itajai, Santa Catarina, Brasil',
  },
} as const
