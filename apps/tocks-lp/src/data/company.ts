export const COMPANY = {
  name: 'Tocks Custom',
  legalName: 'Tocks Industria e Comercio Ltda',
  cnpj: '60.996.216/0001-80',
  url: 'https://tockscustom.com.br',
  phone: '+554730419811',
  phoneDisplay: '(47) 3041-9811',
  whatsapp: '554730419811',
  email: 'contato@tockscustom.com.br',
  address: {
    street: 'Rua Augusto Dalago, 1743',
    city: 'Itajai',
    state: 'SC',
    postalCode: '88318-144',
    country: 'BR',
  },
  description:
    'Mesas de bilhar artesanais em madeira macica. Desde 1988, fabricacao propria em Itajai-SC. Design exclusivo e personalizacao completa.',
  priceRange: 'R$10.990 - R$26.900',
  foundingYear: 1988,
  socialMedia: {
    instagram: 'https://www.instagram.com/tockscustom/',
  },
} as const

export type Company = typeof COMPANY
