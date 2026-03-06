'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Badge } from '@ciclo/ui'
import { createEvent, updateEvent } from '../../lib/actions/events'
import type { EventActionResult } from '../../lib/actions/events'
import { generateSlug } from '../../lib/slug'
import { validateEventForm, hasErrors, type EventFormErrors } from '../../lib/validation'
import {
  SEASON_OPTIONS,
  ASTRONOMICAL_EVENT_OPTIONS,
  DEFAULT_VENUE,
} from '../../lib/constants'
import type { Season, AstronomicalEvent } from '@ciclo/database'

// ============================================================
// Types
// ============================================================

interface EventData {
  id?: string
  name: string
  subtitle: string | null
  slug: string
  season: string
  astronomicalEvent: string | null
  startDate: Date | string
  endDate: Date | string
  elementMTC: string | null
  organMTC: string | null
  description: string | null
  includedPractices: string[]
  capacity: number | null
  venue: string | null
  isPublished: boolean
  isSoldOut: boolean
}

interface EventFormProps {
  event?: EventData
  mode: 'create' | 'edit'
}

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 16)
}

// ============================================================
// Practices Tag Input Component
// ============================================================

interface PracticesInputProps {
  practices: string[]
  onChange: (practices: string[]) => void
}

function PracticesInput({ practices, onChange }: PracticesInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addPractice = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !practices.includes(trimmed)) {
      onChange([...practices, trimmed])
    }
    setInputValue('')
  }

  const removePractice = (index: number) => {
    onChange(practices.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addPractice()
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma prática e pressione Enter"
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addPractice}>
          Adicionar
        </Button>
      </div>
      {practices.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {practices.map((practice, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              {practice}
              <button
                type="button"
                onClick={() => removePractice(index)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                aria-label={`Remover ${practice}`}
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
// Main Event Form
// ============================================================

export function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<EventFormErrors>({})
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Form state
  const [name, setName] = useState(event?.name ?? '')
  const [subtitle, setSubtitle] = useState(event?.subtitle ?? '')
  const [slug, setSlug] = useState(event?.slug ?? '')
  const [season, setSeason] = useState(event?.season ?? 'SPRING')
  const [astronomicalEvent, setAstronomicalEvent] = useState(event?.astronomicalEvent ?? '')
  const [startDate, setStartDate] = useState(formatDateForInput(event?.startDate))
  const [endDate, setEndDate] = useState(formatDateForInput(event?.endDate))
  const [elementMTC, setElementMTC] = useState(event?.elementMTC ?? '')
  const [organMTC, setOrganMTC] = useState(event?.organMTC ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [includedPractices, setIncludedPractices] = useState<string[]>(
    event?.includedPractices ?? [],
  )
  const [capacity, setCapacity] = useState(event?.capacity?.toString() ?? '')
  const [venue, setVenue] = useState(event?.venue ?? DEFAULT_VENUE)
  const [isPublished, setIsPublished] = useState(event?.isPublished ?? false)
  const [isSoldOut, setIsSoldOut] = useState(event?.isSoldOut ?? false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value)
      if (!slugManuallyEdited) {
        setSlug(generateSlug(value))
      }
    },
    [slugManuallyEdited],
  )

  const handleSlugChange = useCallback((value: string) => {
    setSlugManuallyEdited(true)
    setSlug(value)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setToast(null)

    const formData = {
      name,
      subtitle,
      slug,
      season,
      astronomicalEvent,
      startDate,
      endDate,
      elementMTC,
      organMTC,
      description,
      includedPractices,
      capacity,
      venue,
      isPublished,
      isSoldOut,
    }

    const validationErrors = validateEventForm(formData)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    const input = {
      name,
      subtitle: subtitle || undefined,
      slug,
      season: season as Season,
      astronomicalEvent: (astronomicalEvent || null) as AstronomicalEvent | null,
      startDate,
      endDate,
      elementMTC: elementMTC || undefined,
      organMTC: organMTC || undefined,
      description: description || undefined,
      includedPractices,
      capacity: capacity ? parseInt(capacity, 10) : null,
      venue: venue || undefined,
      isPublished,
      isSoldOut,
    }

    let result: EventActionResult

    if (mode === 'edit' && event?.id) {
      result = await updateEvent({ ...input, id: event.id })
    } else {
      result = await createEvent(input)
    }

    setIsSubmitting(false)

    if (result.success) {
      setToast({
        type: 'success',
        message: mode === 'create' ? 'Evento criado com sucesso!' : 'Evento atualizado com sucesso!',
      })
      if (mode === 'create' && result.eventId) {
        router.push(`/admin/eventos/${result.eventId}`)
      }
    } else {
      setToast({ type: 'error', message: result.error ?? 'Erro desconhecido' })
      if (result.error?.includes('Slug')) {
        setErrors((prev) => ({ ...prev, slug: result.error }))
      }
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
        <legend className="text-lg font-semibold text-gray-900">Informações Basicas</legend>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome *
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Nome do evento"
            maxLength={100}
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
            Subtítulo
          </label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtítulo opcional"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug *
          </label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="slug-do-evento"
          />
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Gerado automaticamente do nome. Editavel manualmente.
          </p>
        </div>
      </fieldset>

      {/* Season & Astronomical */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Estação e Evento Astronomico</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700">
              Estação *
            </label>
            <select
              id="season"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              {SEASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="astronomicalEvent" className="block text-sm font-medium text-gray-700">
              Evento Astronomico
            </label>
            <select
              id="astronomicalEvent"
              value={astronomicalEvent}
              onChange={(e) => setAstronomicalEvent(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {ASTRONOMICAL_EVENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Dates */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Datas</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Data Inicio *
            </label>
            <input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Data Fim *
            </label>
            <input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
          </div>
        </div>
      </fieldset>

      {/* MTC */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Medicina Tradicional Chinesa</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="elementMTC" className="block text-sm font-medium text-gray-700">
              Elemento MTC
            </label>
            <Input
              id="elementMTC"
              value={elementMTC}
              onChange={(e) => setElementMTC(e.target.value)}
              placeholder="Ex: Madeira, Fogo, Terra, Metal, Água"
            />
          </div>

          <div>
            <label htmlFor="organMTC" className="block text-sm font-medium text-gray-700">
              Sistema de Orgaos MTC
            </label>
            <Input
              id="organMTC"
              value={organMTC}
              onChange={(e) => setOrganMTC(e.target.value)}
              placeholder="Ex: Figado/Vesicula Biliar"
            />
          </div>
        </div>
      </fieldset>

      {/* Description */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Descrição</legend>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição do Evento
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Descreva o evento... (Rich text em fase posterior)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Editor rich text sera adicionado em fase posterior.
          </p>
        </div>
      </fieldset>

      {/* Practices */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Práticas Incluídas</legend>
        <PracticesInput practices={includedPractices} onChange={setIncludedPractices} />
      </fieldset>

      {/* Capacity & Venue */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Local e Capacidade</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
              Capacidade Maxima
            </label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Ex: 30"
            />
            {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Deixe em branco para ilimitado.
            </p>
          </div>

          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
              Local / Venue
            </label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder={DEFAULT_VENUE}
            />
          </div>
        </div>
      </fieldset>

      {/* Toggles */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Status</legend>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Publicado</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSoldOut}
              onChange={(e) => setIsSoldOut(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Esgotado</span>
          </label>
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando...'
            : mode === 'create'
              ? 'Criar Evento'
              : 'Salvar Alterações'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/eventos')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
