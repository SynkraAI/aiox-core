'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button, Badge } from '@ciclo/ui'
import { deleteEvent, togglePublish } from '../../lib/actions/events'
import {
  SEASON_LABELS,
  SEASON_COLORS,
  SEASON_OPTIONS,
} from '../../lib/constants'

// ============================================================
// Types
// ============================================================

interface EventRow {
  id: string
  name: string
  slug: string
  season: string
  startDate: Date
  endDate: Date
  capacity: number | null
  isPublished: boolean
  isSoldOut: boolean
  ticketTypes: Array<{
    quantityAvailable: number | null
    quantitySold: number
  }>
  _count: {
    registrations: number
  }
}

interface EventListClientProps {
  events: EventRow[]
}

function getEventStatus(event: EventRow): { label: string; color: string } {
  if (event.isSoldOut) {
    return { label: 'Esgotado', color: 'bg-red-100 text-red-800' }
  }
  if (event.isPublished) {
    return { label: 'Publicado', color: 'bg-green-100 text-green-800' }
  }
  return { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' }
}

function getTotalCapacity(event: EventRow): { sold: number; total: number | null } {
  const sold = event.ticketTypes.reduce((sum, tt) => sum + tt.quantitySold, 0)
  const total = event.capacity
  return { sold, total }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ============================================================
// Delete Confirmation Modal
// ============================================================

interface DeleteModalProps {
  eventName: string
  onConfirm: () => void
  onCancel: () => void
}

function DeleteModal({ eventName, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Confirmar exclusão</h3>
        <p className="mt-2 text-sm text-gray-600">
          Tem certeza que deseja excluir o evento <strong>{eventName}</strong>?
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Se houver inscrições, o evento sera marcado como deletado (soft delete).
          Caso contrario, sera removido permanentemente.
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
// Event List Client Component
// ============================================================

export function EventListClient({ events }: EventListClientProps) {
  const [seasonFilter, setSeasonFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredEvents = events.filter((event) => {
    if (seasonFilter && event.season !== seasonFilter) return false
    if (statusFilter === 'published' && !event.isPublished) return false
    if (statusFilter === 'draft' && event.isPublished) return false
    if (statusFilter === 'soldout' && !event.isSoldOut) return false
    return true
  })

  const handleDelete = (event: EventRow) => {
    setDeleteTarget(event)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteEvent(deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  const handleTogglePublish = (id: string) => {
    startTransition(async () => {
      await togglePublish(id)
    })
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="seasonFilter" className="mr-2 text-sm font-medium text-gray-700">
            Estação:
          </label>
          <select
            id="seasonFilter"
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Todas</option>
            {SEASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">
            Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
            <option value="soldout">Esgotado</option>
          </select>
        </div>

        <div className="ml-auto">
          <Link href="/admin/eventos/novo">
            <Button>Criar Evento</Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estação
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Capacidade
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Vendidos/Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhum evento encontrado.
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => {
                const status = getEventStatus(event)
                const { sold, total } = getTotalCapacity(event)

                return (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{event.name}</div>
                      <div className="text-xs text-gray-500">/{event.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={SEASON_COLORS[event.season] ?? 'bg-gray-100 text-gray-800'}>
                        {SEASON_LABELS[event.season] ?? event.season}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(event.startDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {total ?? 'Ilimitado'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {sold}/{total ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={status.color}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/eventos/${event.id}`}>
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <Link href={`/admin/eventos/${event.id}/preview`}>
                          <Button variant="ghost" size="sm">
                            Preview
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(event.id)}
                          disabled={isPending}
                        >
                          {event.isPublished ? 'Despublicar' : 'Publicar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(event)}
                          disabled={isPending}
                        >
                          Deletar
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          eventName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
