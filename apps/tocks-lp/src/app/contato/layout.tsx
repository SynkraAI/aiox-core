import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato | Tocks Custom — Fale com Nossa Equipe',
  description:
    'Entre em contato com a Tocks Custom. Solicite seu projeto 3D gratuito, agende uma visita ao atelier em Itajaí-SC ou tire dúvidas pelo WhatsApp.',
}

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return children
}
