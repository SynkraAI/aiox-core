import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Minha Conta',
  description: 'Gerencie sua conta, inscrições e configurações',
}

export default function MinhaContaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 flex gap-6 border-b border-gray-200 pb-4">
        <Link
          href="/minha-conta/inscrições"
          className="text-sm font-medium text-gray-600 hover:text-green-700"
        >
          Minhas Inscrições
        </Link>
        <Link
          href="/minha-conta"
          className="text-sm font-medium text-gray-600 hover:text-green-700"
        >
          Meus Dados
        </Link>
      </nav>
      {children}
    </div>
  )
}
