import type { Metadata } from 'next'
import { getEvents } from '../../../lib/actions/events'
import { EventListClient } from '../../../components/events/event-list-client'

export const metadata: Metadata = {
  title: 'Eventos',
  description: 'Gerenciar eventos do Ciclo das Estações',
}

export default async function EventosPage() {
  const events = await getEvents()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie todos os eventos do Ciclo das Estações.
        </p>
      </div>

      <EventListClient events={events} />
    </div>
  )
}
