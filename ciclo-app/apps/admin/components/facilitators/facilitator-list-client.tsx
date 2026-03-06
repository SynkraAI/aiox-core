'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button, Badge, Avatar, AvatarImage, AvatarFallback, Input } from '@ciclo/ui'
import { deleteFacilitator, toggleFeatured } from '../../lib/actions/facilitators'

// ============================================================
// Types
// ============================================================

interface FacilitatorRow {
  id: string
  name: string
  role: string | null
  photoUrl: string | null
  specialties: string[]
  isFeatured: boolean
  email: string | null
  instagram: string | null
  _count: {
    activities: number
    eventFacilitators: number
  }
}

interface FacilitatorListClientProps {
  facilitators: FacilitatorRow[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ============================================================
// Delete Confirmation Modal
// ============================================================

interface DeleteModalProps {
  facilitatorName: string
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

function DeleteModal({ facilitatorName, error, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Confirmar exclusão</h3>
        <p className="mt-2 text-sm text-gray-600">
          Tem certeza que deseja excluir o facilitador <strong>{facilitatorName}</strong>?
        </p>
        {error && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
            {error}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Se o facilitador estiver associado a atividades em eventos futuros, a exclusão sera impedida.
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
// Facilitator List Client Component
// ============================================================

export function FacilitatorListClient({ facilitators }: FacilitatorListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<FacilitatorRow | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredFacilitators = facilitators.filter((f) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      f.name.toLowerCase().includes(query) ||
      (f.role && f.role.toLowerCase().includes(query)) ||
      f.specialties.some((s) => s.toLowerCase().includes(query))
    )
  })

  const handleDelete = (facilitator: FacilitatorRow) => {
    setDeleteError(null)
    setDeleteTarget(facilitator)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteFacilitator(deleteTarget.id)
      if (result.success) {
        setDeleteTarget(null)
        setDeleteError(null)
      } else {
        setDeleteError(result.error ?? 'Erro ao excluir facilitador')
      }
    })
  }

  const handleToggleFeatured = (id: string) => {
    startTransition(async () => {
      await toggleFeatured(id)
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
            placeholder="Buscar por nome, papel ou especialidade..."
            className="max-w-sm"
          />
        </div>
        <Link href="/admin/facilitadores/novo">
          <Button>Criar Facilitador</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Facilitador
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Papel
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Especialidades
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Eventos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Destaque
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredFacilitators.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchQuery ? 'Nenhum facilitador encontrado para esta busca.' : 'Nenhum facilitador cadastrado.'}
                </td>
              </tr>
            ) : (
              filteredFacilitators.map((facilitator) => (
                <tr key={facilitator.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        {facilitator.photoUrl ? (
                          <AvatarImage src={facilitator.photoUrl} alt={facilitator.name} />
                        ) : null}
                        <AvatarFallback>{getInitials(facilitator.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{facilitator.name}</div>
                        {facilitator.email && (
                          <div className="text-xs text-gray-500">{facilitator.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {facilitator.role ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {facilitator.specialties.length > 0 ? (
                        facilitator.specialties.slice(0, 3).map((specialty, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                      {facilitator.specialties.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{facilitator.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {facilitator._count.eventFacilitators}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(facilitator.id)}
                      disabled={isPending}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        facilitator.isFeatured
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      aria-label={facilitator.isFeatured ? 'Remover destaque' : 'Adicionar destaque'}
                    >
                      {facilitator.isFeatured ? 'Sim' : 'Nao'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/facilitadores/${facilitator.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(facilitator)}
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
          facilitatorName={deleteTarget.name}
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
