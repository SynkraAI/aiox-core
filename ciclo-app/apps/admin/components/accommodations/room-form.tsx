'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@ciclo/ui'
import { createRoom, updateRoom } from '../../lib/actions/accommodations'
import type { AccommodationActionResult } from '../../lib/actions/accommodations'
import {
  validateRoomForm,
  hasErrors,
  type RoomFormErrors,
} from '../../lib/validation'

// ============================================================
// Types
// ============================================================

interface RoomData {
  id?: string
  name: string
  theme: string | null
  description: string | null
  pricePerNight: number // centavos
  capacity: number
  isAvailable: boolean
}

interface RoomFormProps {
  room?: RoomData
  mode: 'create' | 'edit'
}

// ============================================================
// Main Room Form
// ============================================================

export function RoomForm({ room, mode }: RoomFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<RoomFormErrors>({})
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Form state — pricePerNight displayed in reais (R$) but stored in centavos
  const [name, setName] = useState(room?.name ?? '')
  const [theme, setTheme] = useState(room?.theme ?? '')
  const [description, setDescription] = useState(room?.description ?? '')
  const [priceReais, setPriceReais] = useState(
    room ? (room.pricePerNight / 100).toFixed(2) : ''
  )
  const [capacity, setCapacity] = useState(String(room?.capacity ?? 2))
  const [isAvailable, setIsAvailable] = useState(room?.isAvailable ?? true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setToast(null)

    const formData = {
      name,
      theme,
      description,
      priceReais,
      capacity,
      isAvailable,
    }

    const validationErrors = validateRoomForm(formData)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    // Convert reais to centavos
    const pricePerNight = Math.round(parseFloat(priceReais.replace(',', '.')) * 100)

    const input = {
      name,
      theme: theme || undefined,
      description: description || undefined,
      pricePerNight,
      capacity: parseInt(capacity, 10),
      isAvailable,
    }

    let result: AccommodationActionResult

    if (mode === 'edit' && room?.id) {
      result = await updateRoom({ ...input, id: room.id })
    } else {
      result = await createRoom(input)
    }

    setIsSubmitting(false)

    if (result.success) {
      setToast({
        type: 'success',
        message: mode === 'create' ? 'Quarto criado com sucesso!' : 'Quarto atualizado com sucesso!',
      })
      if (mode === 'create' && result.roomId) {
        router.push(`/admin/espacos/${result.roomId}/edit`)
      }
    } else {
      setToast({ type: 'error', message: result.error ?? 'Erro desconhecido' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Toast */}
      {toast && (
        <div
          className={`rounded-md p-4 text-sm ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Basic Info */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Informações do Quarto</legend>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome *
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Quarto Terra"
            maxLength={100}
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
            Tema
          </label>
          <Input
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: Elemento Terra, Elemento Água"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Descrição do quarto, ambientacao e diferenciais..."
          />
        </div>
      </fieldset>

      {/* Pricing & Capacity */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Preco e Capacidade</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="priceReais" className="block text-sm font-medium text-gray-700">
              Preco por noite (R$) *
            </label>
            <Input
              id="priceReais"
              value={priceReais}
              onChange={(e) => setPriceReais(e.target.value)}
              placeholder="250.00"
              type="text"
              inputMode="decimal"
            />
            <p className="mt-1 text-xs text-gray-500">
              Informe o valor em reais. Sera armazenado em centavos internamente.
            </p>
            {errors.priceReais && <p className="mt-1 text-sm text-red-600">{errors.priceReais}</p>}
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
              Capacidade (pessoas) *
            </label>
            <Input
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="2"
              type="number"
              min={1}
            />
            {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
          </div>
        </div>
      </fieldset>

      {/* Available Toggle */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Disponibilidade</legend>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">Disponível para reserva</span>
        </label>
        <p className="text-xs text-gray-500">
          Quartos indisponíveis não aparecem no checkout para os participantes.
        </p>
      </fieldset>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando...'
            : mode === 'create'
              ? 'Criar Quarto'
              : 'Salvar Alterações'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/espacos')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
