'use client'

import { useState, useTransition } from 'react'
import { Button, Input, Badge } from '@ciclo/ui'
import { formatCurrency, toCents, toReais } from '@ciclo/utils'
import {
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from '../../lib/actions/ticket-types'

// ============================================================
// Types
// ============================================================

interface TicketTypeItem {
  id: string
  name: string
  description: string | null
  includes: string[]
  earlyBirdPrice: number
  earlyBirdDeadline: Date | string | null
  regularPrice: number
  lastMinutePrice: number | null
  lastMinuteStart: Date | string | null
  quantityAvailable: number | null
  quantitySold: number
}

interface TicketTypeManagerProps {
  eventId: string
  ticketTypes: TicketTypeItem[]
}

interface TicketFormData {
  name: string
  description: string
  includes: string[]
  regularPrice: string
  earlyBirdPrice: string
  earlyBirdDeadline: string
  lastMinutePrice: string
  lastMinuteStart: string
  quantityAvailable: string
}

const EMPTY_FORM: TicketFormData = {
  name: '',
  description: '',
  includes: [],
  regularPrice: '',
  earlyBirdPrice: '',
  earlyBirdDeadline: '',
  lastMinutePrice: '',
  lastMinuteStart: '',
  quantityAvailable: '',
}

// ============================================================
// Helpers
// ============================================================

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 16)
}

function ticketToFormData(ticket: TicketTypeItem): TicketFormData {
  return {
    name: ticket.name,
    description: ticket.description ?? '',
    includes: ticket.includes,
    regularPrice: toReais(ticket.regularPrice).toFixed(2),
    earlyBirdPrice: ticket.earlyBirdPrice
      ? toReais(ticket.earlyBirdPrice).toFixed(2)
      : '',
    earlyBirdDeadline: formatDateForInput(ticket.earlyBirdDeadline),
    lastMinutePrice: ticket.lastMinutePrice
      ? toReais(ticket.lastMinutePrice).toFixed(2)
      : '',
    lastMinuteStart: formatDateForInput(ticket.lastMinuteStart),
    quantityAvailable: ticket.quantityAvailable?.toString() ?? '',
  }
}

// ============================================================
// Tag Input (reuses PracticesInput pattern)
// ============================================================

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

function TagInput({
  tags,
  onChange,
  placeholder = 'Digite e pressione Enter',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInputValue('')
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag}>
          Adicionar
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                aria-label={`Remover ${tag}`}
              >
                x
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Validation
// ============================================================

interface FormErrors {
  name?: string
  regularPrice?: string
  earlyBirdPrice?: string
  quantityAvailable?: string
  dates?: string
}

function validateForm(form: TicketFormData): FormErrors {
  const errors: FormErrors = {}

  if (!form.name.trim()) {
    errors.name = 'Nome é obrigatório.'
  }

  const regularPrice = parseFloat(form.regularPrice)
  if (!form.regularPrice || isNaN(regularPrice) || regularPrice <= 0) {
    errors.regularPrice = 'Preco regular deve ser maior que zero.'
  }

  if (form.earlyBirdPrice) {
    const ebPrice = parseFloat(form.earlyBirdPrice)
    if (isNaN(ebPrice) || ebPrice <= 0) {
      errors.earlyBirdPrice = 'Preco early bird deve ser maior que zero.'
    } else if (!isNaN(regularPrice) && ebPrice >= regularPrice) {
      // Warning, não bloqueante — usamos console.warn em vez de bloquear
      // AC-11: warning, não bloqueante
    }
  }

  if (form.quantityAvailable) {
    const qty = parseInt(form.quantityAvailable, 10)
    if (isNaN(qty) || qty < 1) {
      errors.quantityAvailable = 'Quantidade deve ser no mínimo 1.'
    }
  }

  // Validar coerencia de datas
  if (form.earlyBirdDeadline && form.lastMinuteStart) {
    const eb = new Date(form.earlyBirdDeadline)
    const lm = new Date(form.lastMinuteStart)
    if (eb >= lm) {
      errors.dates =
        'A data limite do early bird deve ser anterior ao inicio do last minute.'
    }
  }

  return errors
}

function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0
}

// ============================================================
// Ticket Type Form
// ============================================================

interface TicketFormProps {
  form: TicketFormData
  onChange: (form: TicketFormData) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  errors: FormErrors
  saveLabel: string
  warning?: string | null
}

function TicketForm({
  form,
  onChange,
  onSave,
  onCancel,
  isPending,
  errors,
  saveLabel,
  warning,
}: TicketFormProps) {
  const update = (field: keyof TicketFormData, value: string | string[]) => {
    onChange({ ...form, [field]: value })
  }

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-gray-300 p-4">
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nome *
        </label>
        <Input
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Ex: Vivencia Completa"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
          placeholder="Descrição opcional do tipo de ingresso"
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Inclui */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Inclui
        </label>
        <TagInput
          tags={form.includes}
          onChange={(tags) => update('includes', tags)}
          placeholder="Ex: Refeicoes, Workshops, Materiais"
        />
      </div>

      {/* Pricing */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-900">
          Precos (em Reais)
        </legend>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Preco Regular */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preco Regular (R$) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={form.regularPrice}
              onChange={(e) => update('regularPrice', e.target.value)}
              placeholder="Ex: 450.00"
            />
            {errors.regularPrice && (
              <p className="mt-1 text-sm text-red-600">
                {errors.regularPrice}
              </p>
            )}
          </div>

          {/* Quantidade disponível */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantidade Disponível
            </label>
            <Input
              type="number"
              min="1"
              value={form.quantityAvailable}
              onChange={(e) => update('quantityAvailable', e.target.value)}
              placeholder="Ilimitado se vazio"
            />
            {errors.quantityAvailable && (
              <p className="mt-1 text-sm text-red-600">
                {errors.quantityAvailable}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Early Bird */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preco Early Bird (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={form.earlyBirdPrice}
              onChange={(e) => update('earlyBirdPrice', e.target.value)}
              placeholder="Opcional"
            />
            {errors.earlyBirdPrice && (
              <p className="mt-1 text-sm text-red-600">
                {errors.earlyBirdPrice}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data Limite Early Bird
            </label>
            <input
              type="datetime-local"
              value={form.earlyBirdDeadline}
              onChange={(e) => update('earlyBirdDeadline', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Last Minute */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preco Last Minute (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={form.lastMinutePrice}
              onChange={(e) => update('lastMinutePrice', e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data Inicio Last Minute
            </label>
            <input
              type="datetime-local"
              value={form.lastMinuteStart}
              onChange={(e) => update('lastMinuteStart', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {errors.dates && (
          <p className="text-sm text-red-600">{errors.dates}</p>
        )}
      </fieldset>

      {/* Warning (early bird >= regular) */}
      {warning && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
          {warning}
        </div>
      )}

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

export function TicketTypeManager({
  eventId,
  ticketTypes: initialTicketTypes,
}: TicketTypeManagerProps) {
  const [ticketTypes, setTicketTypes] = useState(initialTicketTypes)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newForm, setNewForm] = useState<TicketFormData>({ ...EMPTY_FORM })
  const [editForm, setEditForm] = useState<TicketFormData>({ ...EMPTY_FORM })
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

  const getWarning = (form: TicketFormData): string | null => {
    if (form.earlyBirdPrice && form.regularPrice) {
      const eb = parseFloat(form.earlyBirdPrice)
      const reg = parseFloat(form.regularPrice)
      if (!isNaN(eb) && !isNaN(reg) && eb >= reg) {
        return 'Atenção: o preco early bird esta igual ou maior que o preco regular.'
      }
    }
    return null
  }

  // ---- Add ----
  const handleAdd = () => {
    const errors = validateForm(newForm)
    setFormErrors(errors)
    if (hasErrors(errors)) return

    startTransition(async () => {
      const result = await createTicketType({
        eventId,
        name: newForm.name,
        description: newForm.description || undefined,
        includes: newForm.includes,
        regularPrice: toCents(parseFloat(newForm.regularPrice)),
        earlyBirdPrice: newForm.earlyBirdPrice
          ? toCents(parseFloat(newForm.earlyBirdPrice))
          : 0,
        earlyBirdDeadline: newForm.earlyBirdDeadline || null,
        lastMinutePrice: newForm.lastMinutePrice
          ? toCents(parseFloat(newForm.lastMinutePrice))
          : null,
        lastMinuteStart: newForm.lastMinuteStart || null,
        quantityAvailable: newForm.quantityAvailable
          ? parseInt(newForm.quantityAvailable, 10)
          : null,
      })

      if (result.success) {
        setNewForm({ ...EMPTY_FORM })
        setIsAdding(false)
        setFormErrors({})
        showToast('success', 'Tipo de ingresso criado com sucesso!')
        // Revalidation will refresh data
      } else {
        showToast('error', result.error ?? 'Erro ao criar tipo de ingresso.')
      }
    })
  }

  // ---- Edit ----
  const handleStartEdit = (ticket: TicketTypeItem) => {
    setEditingId(ticket.id)
    setEditForm(ticketToFormData(ticket))
    setFormErrors({})
  }

  const handleSaveEdit = () => {
    if (!editingId) return

    const errors = validateForm(editForm)
    setFormErrors(errors)
    if (hasErrors(errors)) return

    startTransition(async () => {
      const result = await updateTicketType({
        id: editingId,
        eventId,
        name: editForm.name,
        description: editForm.description || undefined,
        includes: editForm.includes,
        regularPrice: toCents(parseFloat(editForm.regularPrice)),
        earlyBirdPrice: editForm.earlyBirdPrice
          ? toCents(parseFloat(editForm.earlyBirdPrice))
          : 0,
        earlyBirdDeadline: editForm.earlyBirdDeadline || null,
        lastMinutePrice: editForm.lastMinutePrice
          ? toCents(parseFloat(editForm.lastMinutePrice))
          : null,
        lastMinuteStart: editForm.lastMinuteStart || null,
        quantityAvailable: editForm.quantityAvailable
          ? parseInt(editForm.quantityAvailable, 10)
          : null,
      })

      if (result.success) {
        setEditingId(null)
        setFormErrors({})
        showToast('success', 'Tipo de ingresso atualizado com sucesso!')
      } else {
        showToast(
          'error',
          result.error ?? 'Erro ao atualizar tipo de ingresso.',
        )
      }
    })
  }

  // ---- Delete ----
  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteTicketType(id)

      if (result.success) {
        setTicketTypes((prev) => prev.filter((t) => t.id !== id))
        setDeleteConfirm(null)
        showToast('success', 'Tipo de ingresso removido com sucesso!')
      } else {
        setDeleteConfirm(null)
        showToast('error', result.error ?? 'Erro ao remover tipo de ingresso.')
      }
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

      {/* Ticket Type List */}
      {ticketTypes.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500">
          Nenhum tipo de ingresso adicionado.
        </p>
      )}

      {ticketTypes.map((ticket) => (
        <div key={ticket.id} className="rounded-lg border border-gray-200 p-4">
          {editingId === ticket.id ? (
            <TicketForm
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
              warning={getWarning(editForm)}
            />
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{ticket.name}</h4>
                  {ticket.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {ticket.description}
                    </p>
                  )}

                  {/* Includes badges */}
                  {ticket.includes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ticket.includes.map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Prices */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <div>
                      <span className="text-gray-500">Regular:</span>{' '}
                      <span className="font-medium">
                        {formatCurrency(ticket.regularPrice)}
                      </span>
                    </div>
                    {ticket.earlyBirdPrice > 0 && (
                      <div>
                        <span className="text-gray-500">Early Bird:</span>{' '}
                        <span className="font-medium text-green-700">
                          {formatCurrency(ticket.earlyBirdPrice)}
                        </span>
                      </div>
                    )}
                    {ticket.lastMinutePrice != null && (
                      <div>
                        <span className="text-gray-500">Last Minute:</span>{' '}
                        <span className="font-medium text-orange-700">
                          {formatCurrency(ticket.lastMinutePrice)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Disponível:</span>{' '}
                      <span className="font-medium">
                        {ticket.quantityAvailable != null
                          ? `${ticket.quantitySold}/${ticket.quantityAvailable}`
                          : `${ticket.quantitySold} vendidos`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(ticket)}
                  >
                    Editar
                  </Button>
                  {deleteConfirm === ticket.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(ticket.id)}
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
                      onClick={() => setDeleteConfirm(ticket.id)}
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
        <TicketForm
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
          saveLabel="Adicionar Ingresso"
          warning={getWarning(newForm)}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
        >
          + Adicionar Tipo de Ingresso
        </Button>
      )}
    </div>
  )
}
