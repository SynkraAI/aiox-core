import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Processo de Fabricação | Tocks Custom',
  description:
    'Veja como fabricamos nossas mesas de sinuca artesanais. Da seleção da madeira maciça ao acabamento manual — cada etapa feita à mão em Itajaí-SC.',
}

export default function ProcessoLayout({ children }: { children: React.ReactNode }) {
  return children
}
