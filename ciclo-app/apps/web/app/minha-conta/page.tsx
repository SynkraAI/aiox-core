import { redirect } from 'next/navigation'

/**
 * /minha-conta — redireciona para inscrições por padrão
 */
export default function MinhaContaPage() {
  redirect('/minha-conta/inscrições')
}
