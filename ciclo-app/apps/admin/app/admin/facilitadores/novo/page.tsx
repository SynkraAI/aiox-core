import type { Metadata } from 'next'
import Link from 'next/link'
import { FacilitatorForm } from '../../../../components/facilitators/facilitator-form'

export const metadata: Metadata = {
  title: 'Criar Facilitador',
  description: 'Criar novo facilitador no Ciclo das Estações',
}

export default function NovoFacilitadorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/admin/facilitadores" className="hover:text-gray-700">
            Facilitadores
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Novo</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Criar Facilitador</h1>
        <p className="mt-1 text-sm text-gray-600">
          Preencha os campos para cadastrar um novo facilitador.
        </p>
      </div>

      <FacilitatorForm mode="create" />
    </div>
  )
}
