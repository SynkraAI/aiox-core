import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Atelier | Tocks Custom — Desde 1988 em Itajaí-SC',
  description:
    'Conheça o atelier da Tocks Custom. Desde 1988, três gerações dedicadas à fabricação artesanal de mesas de sinuca em madeira maciça.',
}

export default function AtelierLayout({ children }: { children: React.ReactNode }) {
  return children
}
