import type { Feature } from '@/types'

export const FEATURES: Feature[] = [
  {
    id: 'feat-1',
    title: '+200 mesas entregues',
    description: 'Clientes em todo o Brasil confiam no nosso trabalho.',
    icon: 'tree',
  },
  {
    id: 'feat-2',
    title: '14 modelos exclusivos',
    description: 'A maior colecao de mesas artesanais do Brasil.',
    icon: 'hand',
  },
  {
    id: 'feat-3',
    title: '5 anos de garantia',
    description: 'Madeira macica com garantia que ninguem mais oferece.',
    icon: 'palette',
  },
  {
    id: 'feat-4',
    title: 'Entrega em todo BR',
    description: 'Frete com seguro total. Montagem inclusa.',
    icon: 'star',
  },
] as const
