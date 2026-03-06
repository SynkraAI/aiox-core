'use client'

import { useState, useTransition } from 'react'
import { Button, Input } from '@ciclo/ui'
import {
  createActivity,
  updateActivity,
  deleteActivity,
  reorderActivities,
} from '../../lib/actions/activities'

// ============================================================
// Types
// ============================================================

interface ActivityItem {
  id: string
  time: Date | string
  title: string
  description: string | null
  durationMinutes: number
  facilitatorId: string | null
  facilitator: { id: string; name: string } | null
  order: number
}

interface FacilitatorOption {
  id: string
  name: string
}

interface ActivityManagerProps {
  eventId: string
  activities: ActivityItem[]
  facilitators: FacilitatorOption[]
}

interface ActivityFormData {
  time: string
  title: string
  description: string
  durationMinutes: string
  facilitatorId: string
}

const EMPTY_FORM: ActivityFormData = {
  time: '',
  title: '',
  description: '',
  durationMinutes: '',
  facilitatorId: '',
}

// ============================================================
// Helpers
// ============================================================

function formatTimeForDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDatetimeForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function activityToFormData(activity: ActivityItem): ActivityFormData {
  return {
    time: formatDatetimeForInput(activity.time),
    title: activity.title,
    description: activity.description ?? '',
    durationMinutes: activity.durationMinutes.toString(),
    facilitatorId: activity.facilitatorId ?? '',
  }
}

// ============================================================
// Validation
// ============================================================

interface FormErrors {
  time?: string
  title?: string
  durationMinutes?: string
}

function validateForm(form: ActivityFormData): FormErrors {
  const errors: FormErrors = {}

  if (!form.title.trim()) {
    errors.title = 'Título é obrigatório'
  } else if (form.title.length > 150) {
    errors.title = 'Título deve ter no máximo 150 caracteres'
  }

  if (!form.time) {
    errors.time = 'Horário é obrigatório'
  }

  const duration = parseInt(form.durationMinutes, 10)
  if (!form.durationMinutes || isNaN(duration) || duration < 1) {
    errors.durationMinutes = 'Duração deve ser no mínimo 1 minuto'
  }

  return errors
}

function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0
}

// ============================================================
// Activity Form
// ============================================================

interface ActivityFormProps {
  form: ActivityFormData
  onChange: (form: ActivityFormData) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  errors: FormErrors
  saveLabel: string
  facilitators: FacilitatorOption[]
}

function ActivityForm({
  form,
  onChange,
  onSave,
  onCancel,
  isPending,
  errors,
  saveLabel,
  facilitators,
}: ActivityFormProps) {
  const update = (field: keyof ActivityFormData, value: string) => {
    onChange({ ...form, [field]: value })
  }

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-gray-300 p-4">
      {/* Horário */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Horário *
        </label>
        <input
          type="datetime-local"
          value={form.time}
          onChange={(e) => update('time', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {errors.time && (
          <p className="mt-1 text-sm text-red-600">{errors.time}</p>
        )}
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Título *
        </label>
        <Input
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Ex: Yoga Matinal"
          maxLength={150}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Descrição opcional da atividade"
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Duração */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Duração (minutos) *
        </label>
        <Input
          type="number"
          min="1"
          value={form.durationMinutes}
          onChange={(e) => update('durationMinutes', e.target.value)}
          placeholder="Ex: 60"
        />
        {errors.durationMinutes && (
          <p className="mt-1 text-sm text-red-600">{errors.durationMinutes}</p>
        )}
      </div>

      {/* Facilitador */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Facilitador
        </label>
        <select
          value={form.facilitatorId}
          onChange={(e) => update('facilitatorId', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Nenhum</option>
          {facilitators.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={isPending}>
          {isPending ? 'Salvando...' : saveLabel}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function ActivityManager({
  eventId,
  activities: initialActivities,
  facilitators,
}: ActivityManagerProps) {
  const [activities, setActivities] = useState(initialActivities)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newForm, setNewForm] = useState<ActivityFormData>({ ...EMPTY_FORM })
  const [editForm, setEditForm] = useState<ActivityFormData>({ ...EMPTY_FORM })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // ---- Add ----
  const handleAdd = () => {
    const errors = validateForm(newForm)
    setFormErrors(errors)
    if (hasErrors(errors)) return

    startTransition(async () => {
      const result = await createActivity({
        eventId,
        time: newForm.time,
        title: newForm.title,
        description: newForm.description || undefined,
        durationMinutes: parseInt(newForm.durationMinutes, 10),
        facilitatorId: newForm.facilitatorId || null,
      })

      if (result.success) {
        setNewForm({ ...EMPTY_FORM })
        setIsAdding(false)
        setFormErrors({})
        showToast('success', 'Atividade criada com sucesso!')
      } else {
        showToast('error', result.error ?? 'Erro ao criar atividade.')
      }
    })
  }

  // ---- Edit ----
  const handleStartEdit = (activity: ActivityItem) => {
    setEditingId(activity.id)
    setEditForm(activityToFormData(activity))
    setFormErrors({})
  }

  const handleSaveEdit = () => {
    if (!editingId) return

    const errors = validateForm(editForm)
    setFormErrors(errors)
    if (hasErrors(errors)) return

    startTransition(async () => {
      const result = await updateActivity({
        id: editingId,
        eventId,
        time: editForm.time,
        title: editForm.title,
        description: editForm.description || undefined,
        durationMinutes: parseInt(editForm.durationMinutes, 10),
        facilitatorId: editForm.facilitatorId || null,
      })

      if (result.success) {
        setEditingId(null)
        setFormErrors({})
        showToast('success', 'Atividade atualizada com sucesso!')
      } else {
        showToast('error', result.error ?? 'Erro ao atualizar atividade.')
      }
    })
  }

  // ---- Delete ----
  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteActivity(id)

      if (result.success) {
        setActivities((prev) => prev.filter((a) => a.id !== id))
        setDeleteConfirm(null)
        showToast('success', 'Atividade removida com sucesso!')
      } else {
        setDeleteConfirm(null)
        showToast('error', result.error ?? 'Erro ao remover atividade.')
      }
    })
  }

  // ---- Reorder ----
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...activities]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index]!, newOrder[index - 1]!]
    setActivities(newOrder)

    startTransition(async () => {
      await reorderActivities(
        eventId,
        newOrder.map((a) => a.id),
      )
    })
  }

  const handleMoveDown = (index: number) => {
    if (index >= activities.length - 1) return
    const newOrder = [...activities]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1]!, newOrder[index]!]
    setActivities(newOrder)

    startTransition(async () => {
      await reorderActivities(
        eventId,
        newOrder.map((a) => a.id),
      )
    })
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`rounded-md p-3 text-sm ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Activity List */}
      {activities.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500">
          Nenhuma atividade adicionada ao cronograma.
        </p>
      )}

      {activities.map((activity, index) => (
        <div key={activity.id} className="rounded-lg border border-gray-200 p-4">
          {editingId === activity.id ? (
            <ActivityForm
              form={editForm}
              onChange={setEditForm}
              onSave={handleSaveEdit}
              onCancel={() => {
                setEditingId(null)
                setFormErrors({})
              }}
              isPending={isPending}
              errors={formErrors}
              saveLabel="Salvar"
              facilitators={facilitators}
            />
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">
                      {formatTimeForDisplay(activity.time)}
                    </span>
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <span className="text-xs text-gray-500">
                      {activity.durationMinutes} min
                    </span>
                  </div>
                  {activity.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {activity.description}
                    </p>
                  )}
                  {activity.facilitator && (
                    <p className="mt-1 text-xs text-gray-500">
                      Facilitador: {activity.facilitator.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="ml-4 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || isPending}
                    aria-label="Mover para cima"
                  >
                    ^
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                    disabled={index >= activities.length - 1 || isPending}
                    aria-label="Mover para baixo"
                  >
                    v
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(activity)}
                  >
                    Editar
                  </Button>
                  {deleteConfirm === activity.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(activity.id)}
                        disabled={isPending}
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Nao
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => setDeleteConfirm(activity.id)}
                      disabled={isPending}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Form */}
      {isAdding ? (
        <ActivityForm
          form={newForm}
          onChange={setNewForm}
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false)
            setNewForm({ ...EMPTY_FORM })
            setFormErrors({})
          }}
          isPending={isPending}
          errors={formErrors}
          saveLabel="Adicionar Atividade"
          facilitators={facilitators}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
        >
          + Adicionar Atividade
        </Button>
      )}
    </div>
  )
}
