import type { ProcessStep } from '@/types'

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'step-1',
    step: 1,
    title: 'Seleção da madeira',
    description:
      'Cada lote é inspecionado manualmente. Verificamos veio, umidade e resistência antes de aprovar uma tábua.',
    icon: 'tree',
  },
  {
    id: 'step-2',
    step: 2,
    title: 'Corte e montagem',
    description:
      'Peças cortadas com precisão milimétrica e montadas com encaixes estruturais reais. Sem grampos cosméticos.',
    icon: 'hammer',
  },
  {
    id: 'step-3',
    step: 3,
    title: 'Acabamento manual',
    description:
      'Lixamento progressivo, selador, tingimento e verniz aplicados à mão. O processo leva dias, não horas.',
    icon: 'hand',
  },
  {
    id: 'step-4',
    step: 4,
    title: 'Entrega e instalação',
    description:
      'Embalagem reforçada, transporte especializado e instalação profissional. A mesa chega pronta para jogar.',
    icon: 'truck',
  },
]
