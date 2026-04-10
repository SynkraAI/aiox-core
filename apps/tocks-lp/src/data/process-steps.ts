import type { ProcessStep } from '@/types'

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'step-1',
    step: 1,
    title: 'Selecao da madeira',
    description:
      'Cada lote e inspecionado manualmente. Verificamos veio, umidade e resistencia antes de aprovar uma tabua.',
    icon: 'tree',
  },
  {
    id: 'step-2',
    step: 2,
    title: 'Corte e montagem',
    description:
      'Pecas cortadas com precisao milimetrica e montadas com encaixes estruturais reais. Sem grampos cosmeticos.',
    icon: 'hammer',
  },
  {
    id: 'step-3',
    step: 3,
    title: 'Acabamento manual',
    description:
      'Lixamento progressivo, selador, tingimento e verniz aplicados a mao. O processo leva dias, nao horas.',
    icon: 'hand',
  },
  {
    id: 'step-4',
    step: 4,
    title: 'Entrega e instalacao',
    description:
      'Embalagem reforcada, transporte especializado e instalacao profissional. A mesa chega pronta para jogar.',
    icon: 'truck',
  },
] as const
