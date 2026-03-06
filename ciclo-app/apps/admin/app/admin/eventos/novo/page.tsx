import type { Metadata } from 'next'
import Link from 'next/link'
import { EventForm } from '../../../../components/events/event-form'

export const metadata: Metadata = {
  title: 'Criar Evento',
  description: 'Criar novo evento no Ciclo das Estações',
}

export default function NovoEventoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/admin/eventos" className="hover:text-gray-700">
            Eventos
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Novo</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Criar Evento</h1>
        <p className="mt-1 text-sm text-gray-600">
          Preencha todos os campos para criar um novo evento.
        </p>
      </div>

      <EventForm mode="create" />
    </div>
  )
}
