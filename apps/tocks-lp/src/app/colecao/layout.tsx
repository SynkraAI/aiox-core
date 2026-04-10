import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coleção | Tocks Custom — 14 Mesas de Sinuca Artesanais',
  description:
    'Conheça nossos 14 modelos de mesas de sinuca artesanais em madeira maciça. Linha Criativa e Premium. De R$10.990 a R$26.900. Fabricação em Itajaí-SC.',
}

export default function ColecaoLayout({ children }: { children: React.ReactNode }) {
  return children
}
