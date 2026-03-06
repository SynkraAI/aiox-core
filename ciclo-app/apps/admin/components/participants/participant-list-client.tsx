'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Badge } from '@ciclo/ui'
import type { ParticipantRow, ParticipantFilters } from '../../lib/actions/participants'
import { exportParticipantsCSV } from '../../lib/actions/participants'

// ============================================================
// Types
// ============================================================

interface ParticipantListClientProps {
  participants: ParticipantRow[]
  total: number
  page: number
  totalPages: number
  events: Array<{ id: string; name: string }>
  currentFilters: ParticipantFilters
}

// ============================================================
// Helpers
// ============================================================

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  PENDING: 'Pendente',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
  TRANSFERRED: 'Transferido',
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  TRANSFERRED: 'bg-blue-100 text-blue-800',
}

const ROLE_LABELS: Record<string, string> = {
  USER: 'Participante',
  THERAPIST: 'Terapeuta',
  FACILITATOR: 'Facilitador',
  ADMIN: 'Admin',
}

function formatDate(date: Date | null): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// ============================================================
// Participant List Client Component
// ============================================================

export function ParticipantListClient({
  participants,
  total,
  page,
  totalPages,
  events,
  currentFilters,
}: ParticipantListClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)

  // Local filter state
  const [eventId, setEventId] = useState(currentFilters.eventId ?? '')
  const [status, setStatus] = useState(currentFilters.status ?? '')
  const [isFirstTime, setIsFirstTime] = useState(
    currentFilters.isFirstTime === true ? 'true' : currentFilters.isFirstTime === false ? 'false' : '',
  )
  const [search, setSearch] = useState(currentFilters.search ?? '')

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined> = {}) => {
      const params = new URLSearchParams()
      const merged = {
        eventId: overrides.eventId ?? eventId,
        status: overrides.status ?? status,
        isFirstTime: overrides.isFirstTime ?? isFirstTime,
        search: overrides.search ?? search,
        page: overrides.page ?? '1',
      }

      if (merged.eventId) params.set('eventId', merged.eventId)
      if (merged.status) params.set('status', merged.status)
      if (merged.isFirstTime) params.set('isFirstTime', merged.isFirstTime)
      if (merged.search) params.set('search', merged.search)
      if (merged.page !== '1') params.set('page', merged.page)

      const qs = params.toString()
      return `/admin/participantes${qs ? `?${qs}` : ''}`
    },
    [eventId, status, isFirstTime, search],
  )

  const applyFilters = useCallback(
    (overrides: Record<string, string | undefined> = {}) => {
      startTransition(() => {
        router.push(buildUrl(overrides))
      })
    },
    [router, buildUrl],
  )

  const handleSearch = () => {
    applyFilters()
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyFilters()
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      // adminEmail passed from client -- in production this should be server-validated
      const csv = await exportParticipantsCSV(currentFilters, 'admin@basetriade.com')
      if (!csv) return

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `participantes-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const goToPage = (targetPage: number) => {
    applyFilters({ page: String(targetPage) })
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="eventFilter" className="block text-sm font-medium text-gray-700">
            Evento
          </label>
          <select
            id="eventFilter"
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value)
              applyFilters({ eventId: e.target.value })
            }}
            className="mt-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="statusFilter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              applyFilters({ status: e.target.value })
            }}
            className="mt-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PENDING">Pendente</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        <div>
          <label htmlFor="firstTimeFilter" className="block text-sm font-medium text-gray-700">
            Primeira vez
          </label>
          <select
            id="firstTimeFilter"
            value={isFirstTime}
            onChange={(e) => {
              setIsFirstTime(e.target.value)
              applyFilters({ isFirstTime: e.target.value })
            }}
            className="mt-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            <option value="true">Sim</option>
            <option value="false">Nao</option>
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="searchInput" className="block text-sm font-medium text-gray-700">
            Busca
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="searchInput"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Nome ou email..."
              className="w-full min-w-[200px] rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            <Button variant="outline" size="sm" onClick={handleSearch} disabled={isPending}>
              Buscar
            </Button>
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting || isPending}
          >
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
        </div>
      </div>

      {/* Total indicator */}
      <div className="mb-4 text-sm text-gray-600">
        {total} participante{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
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
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Telefone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Eventos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ultima Inscrição
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
            {participants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhum participante encontrado.
                </td>
              </tr>
            ) : (
              participants.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{ROLE_LABELS[p.role] ?? p.role}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.phone ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.eventsCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(p.lastRegistrationDate)}
                  </td>
                  <td className="px-4 py-3">
                    {p.lastRegistrationStatus ? (
                      <Badge
                        className={
                          STATUS_COLORS[p.lastRegistrationStatus] ?? 'bg-gray-100 text-gray-800'
                        }
                      >
                        {STATUS_LABELS[p.lastRegistrationStatus] ?? p.lastRegistrationStatus}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/participantes/${p.id}`}>
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Pagina {page} de {totalPages} ({total} participantes)
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || isPending}
            >
              Anterior
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (page <= 4) {
                pageNum = i + 1
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i
              } else {
                pageNum = page - 3 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  disabled={isPending}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || isPending}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
