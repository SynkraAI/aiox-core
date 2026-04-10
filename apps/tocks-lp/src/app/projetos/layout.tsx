import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projetos | Tocks Custom — Mesas Instaladas em Todo o Brasil',
  description:
    'Galeria de mesas de sinuca Tocks Custom instaladas em residências de todo o Brasil. Veja depoimentos reais e projetos concluídos.',
}

export default function ProjetosLayout({ children }: { children: React.ReactNode }) {
  return children
}
