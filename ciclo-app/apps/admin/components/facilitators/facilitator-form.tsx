'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Badge } from '@ciclo/ui'
import { createFacilitator, updateFacilitator } from '../../lib/actions/facilitators'
import type { FacilitatorActionResult } from '../../lib/actions/facilitators'
import {
  validateFacilitatorForm,
  normalizeInstagram,
  hasErrors,
  type FacilitatorFormErrors,
} from '../../lib/validation'

// ============================================================
// Types
// ============================================================

interface FacilitatorData {
  id?: string
  name: string
  role: string | null
  bio: string | null
  photoUrl: string | null
  instagram: string | null
  email: string | null
  phone: string | null
  specialties: string[]
  isFeatured: boolean
}

interface FacilitatorFormProps {
  facilitator?: FacilitatorData
  mode: 'create' | 'edit'
}

// ============================================================
// Specialties Tag Input Component
// ============================================================

interface SpecialtiesInputProps {
  specialties: string[]
  onChange: (specialties: string[]) => void
}

function SpecialtiesInput({ specialties, onChange }: SpecialtiesInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addSpecialty = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !specialties.includes(trimmed)) {
      onChange([...specialties, trimmed])
    }
    setInputValue('')
  }

  const removeSpecialty = (index: number) => {
    onChange(specialties.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSpecialty()
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma especialidade e pressione Enter"
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addSpecialty}>
          Adicionar
        </Button>
      </div>
      {specialties.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              {specialty}
              <button
                type="button"
                onClick={() => removeSpecialty(index)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                aria-label={`Remover ${specialty}`}
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
// Main Facilitator Form
// ============================================================

export function FacilitatorForm({ facilitator, mode }: FacilitatorFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FacilitatorFormErrors>({})
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Form state
  const [name, setName] = useState(facilitator?.name ?? '')
  const [role, setRole] = useState(facilitator?.role ?? '')
  const [bio, setBio] = useState(facilitator?.bio ?? '')
  const [photoUrl, setPhotoUrl] = useState(facilitator?.photoUrl ?? '')
  const [instagram, setInstagram] = useState(facilitator?.instagram ?? '')
  const [email, setEmail] = useState(facilitator?.email ?? '')
  const [phone, setPhone] = useState(facilitator?.phone ?? '')
  const [specialties, setSpecialties] = useState<string[]>(facilitator?.specialties ?? [])
  const [isFeatured, setIsFeatured] = useState(facilitator?.isFeatured ?? false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setToast(null)

    const normalizedInstagram = normalizeInstagram(instagram)

    const formData = {
      name,
      role,
      bio,
      photoUrl,
      instagram: normalizedInstagram,
      email,
      phone,
      specialties,
      isFeatured,
    }

    const validationErrors = validateFacilitatorForm(formData)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    const input = {
      name,
      role: role || undefined,
      bio: bio || undefined,
      photoUrl: photoUrl || undefined,
      instagram: normalizedInstagram || undefined,
      email: email || undefined,
      phone: phone || undefined,
      specialties,
      isFeatured,
    }

    let result: FacilitatorActionResult

    if (mode === 'edit' && facilitator?.id) {
      result = await updateFacilitator({ ...input, id: facilitator.id })
    } else {
      result = await createFacilitator(input)
    }

    setIsSubmitting(false)

    if (result.success) {
      setToast({
        type: 'success',
        message: mode === 'create' ? 'Facilitador criado com sucesso!' : 'Facilitador atualizado com sucesso!',
      })
      if (mode === 'create' && result.facilitatorId) {
        router.push(`/admin/facilitadores/${result.facilitatorId}/edit`)
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
        <legend className="text-lg font-semibold text-gray-900">Informações Basicas</legend>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome *
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do facilitador"
            maxLength={100}
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Papel / Título
          </label>
          <Input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex: Terapeuta Holística, Instrutor de Yoga"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Biografia do facilitador... (Rich text em fase posterior)"
          />
        </div>
      </fieldset>

      {/* Contact */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Contato</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(47) 99999-9999"
            />
          </div>
        </div>

        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
            Instagram
          </label>
          <Input
            id="instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="usuario (sem @)"
          />
          <p className="mt-1 text-xs text-gray-500">
            O @ sera removido automaticamente se informado.
          </p>
        </div>
      </fieldset>

      {/* Photo */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Foto</legend>

        <div>
          <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700">
            URL da Foto
          </label>
          <Input
            id="photoUrl"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://exemplo.com/foto.jpg"
          />
          <p className="mt-1 text-xs text-gray-500">
            Upload via Supabase Storage sera adicionado em fase posterior.
          </p>
        </div>

        {photoUrl && (
          <div className="mt-2">
            <p className="mb-1 text-xs text-gray-500">Preview:</p>
            <img
              src={photoUrl}
              alt="Preview da foto"
              className="h-24 w-24 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </fieldset>

      {/* Specialties */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Especialidades</legend>
        <SpecialtiesInput specialties={specialties} onChange={setSpecialties} />
      </fieldset>

      {/* Featured Toggle */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">Status</legend>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">Destaque</span>
        </label>
        <p className="text-xs text-gray-500">
          Facilitadores em destaque aparecem primeiro na página publica do evento.
        </p>
      </fieldset>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando...'
            : mode === 'create'
              ? 'Criar Facilitador'
              : 'Salvar Alterações'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/facilitadores')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
