import type { Metadata } from 'next'
import { getRooms } from '../../../lib/actions/accommodations'
import { RoomListClient } from '../../../components/accommodations/room-list-client'

export const metadata: Metadata = {
  title: 'Espacos — Sun House',
  description: 'Gerenciar quartos da Sun House para hospedagem',
}

export default async function EspacosPage() {
  const rooms = await getRooms()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Espacos — Sun House</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie os quartos da Sun House disponíveis para hospedagem durante eventos.
        </p>
      </div>

      <RoomListClient rooms={rooms} />
    </div>
  )
}
