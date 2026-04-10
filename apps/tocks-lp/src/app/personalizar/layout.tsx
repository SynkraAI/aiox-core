import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personalizar | Tocks Custom — Monte Sua Mesa Sob Medida',
  description:
    'Configure sua mesa de sinuca sob medida. Escolha modelo, madeira e tecido. Projeto 3D gratuito. Mesas artesanais em madeira maciça desde 1988.',
}

export default function PersonalizarLayout({ children }: { children: React.ReactNode }) {
  return children
}
