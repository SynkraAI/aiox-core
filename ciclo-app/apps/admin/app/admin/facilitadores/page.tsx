import type { Metadata } from 'next'
import { getFacilitators } from '../../../lib/actions/facilitators'
import { FacilitatorListClient } from '../../../components/facilitators/facilitator-list-client'

export const metadata: Metadata = {
  title: 'Facilitadores',
  description: 'Gerenciar facilitadores do Ciclo das Estações',
}

export default async function FacilitadoresPage() {
  const facilitators = await getFacilitators()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Facilitadores</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie facilitadores e suas especialidades.
        </p>
      </div>

      <FacilitatorListClient facilitators={facilitators} />
    </div>
  )
}
