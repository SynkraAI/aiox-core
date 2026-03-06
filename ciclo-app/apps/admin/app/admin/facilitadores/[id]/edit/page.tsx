import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFacilitator } from '../../../../../lib/actions/facilitators'
import { FacilitatorForm } from '../../../../../components/facilitators/facilitator-form'

export const metadata: Metadata = {
  title: 'Editar Facilitador',
  description: 'Editar facilitador do Ciclo das Estações',
}

interface EditFacilitatorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditFacilitatorPage({ params }: EditFacilitatorPageProps) {
  const { id } = await params
  const facilitator = await getFacilitator(id)

  if (!facilitator) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/admin/facilitadores" className="hover:text-gray-700">
            Facilitadores
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{facilitator.name}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Editar Facilitador</h1>
      </div>

      <FacilitatorForm
        mode="edit"
        facilitator={{
          id: facilitator.id,
          name: facilitator.name,
          role: facilitator.role,
          bio: facilitator.bio,
          photoUrl: facilitator.photoUrl,
          instagram: facilitator.instagram,
          email: facilitator.email,
          phone: facilitator.phone,
          specialties: facilitator.specialties,
          isFeatured: facilitator.isFeatured,
        }}
      />

      {/* Associated Events (read-only) */}
      {facilitator.eventFacilitators.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Eventos Associados</h2>
          <p className="mb-4 text-sm text-gray-500">
            A associacao evento-facilitador e gerenciada na página do evento.
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Data Inicio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Data Fim
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {facilitator.eventFacilitators.map((ef) => (
                  <tr key={ef.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/eventos/${ef.event.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {ef.event.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(ef.event.startDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(ef.event.endDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          ef.event.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ef.event.isPublished ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
