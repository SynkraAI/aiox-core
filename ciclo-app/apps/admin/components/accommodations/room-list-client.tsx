'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button, Input } from '@ciclo/ui'
import { deleteRoom, toggleAvailable } from '../../lib/actions/accommodations'

// ============================================================
// Types
// ============================================================

interface RoomRow {
  id: string
  name: string
  theme: string | null
  description: string | null
  pricePerNight: number // centavos
  capacity: number
  isAvailable: boolean
  _count: {
    registrations: number
  }
}

interface RoomListClientProps {
  rooms: RoomRow[]
}

function formatCentavos(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(centavos / 100)
}

// ============================================================
// Delete Confirmation Modal
// ============================================================

interface DeleteModalProps {
  roomName: string
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

function DeleteModal({ roomName, error, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Confirmar exclusão</h3>
        <p className="mt-2 text-sm text-gray-600">
          Tem certeza que deseja excluir o quarto <strong>{roomName}</strong>?
        </p>
        {error && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
            {error}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Se o quarto possuir inscrições ativas, a exclusão sera impedida.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Room List Client Component
// ============================================================

export function RoomListClient({ rooms }: RoomListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<RoomRow | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredRooms = rooms.filter((r) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      r.name.toLowerCase().includes(query) ||
      (r.theme && r.theme.toLowerCase().includes(query)) ||
      (r.description && r.description.toLowerCase().includes(query))
    )
  })

  const handleDelete = (room: RoomRow) => {
    setDeleteError(null)
    setDeleteTarget(room)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteRoom(deleteTarget.id)
      if (result.success) {
        setDeleteTarget(null)
        setDeleteError(null)
      } else {
        setDeleteError(result.error ?? 'Erro ao excluir quarto')
      }
    })
  }

  const handleToggleAvailable = (id: string) => {
    startTransition(async () => {
      await toggleAvailable(id)
    })
  }

  return (
    <div>
      {/* Search and Create */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, tema ou descrição..."
            className="max-w-sm"
          />
        </div>
        <Link href="/admin/espacos/novo">
          <Button>Criar Quarto</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Quarto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tema
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Preco/Noite
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Capacidade
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Inscrições
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Disponível
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchQuery ? 'Nenhum quarto encontrado para esta busca.' : 'Nenhum quarto cadastrado.'}
                </td>
              </tr>
            ) : (
              filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{room.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {room.theme ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formatCentavos(room.pricePerNight)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {room._count.registrations}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailable(room.id)}
                      disabled={isPending}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        room.isAvailable
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      aria-label={room.isAvailable ? 'Marcar como indisponível' : 'Marcar como disponível'}
                    >
                      {room.isAvailable ? 'Sim' : 'Nao'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/espacos/${room.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(room)}
                        disabled={isPending}
                      >
                        Deletar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          roomName={deleteTarget.name}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteTarget(null)
            setDeleteError(null)
          }}
        />
      )}
    </div>
  )
}
