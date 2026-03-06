'use client'

/**
 * Client component for Step 2 — Participant Data Form
 * Story E3.1 — AC-3, AC-4: Name, email, phone, CPF, optional fields
 *
 * Handles form state, CPF validation and masking,
 * pre-fill for authenticated users, "Voltar" navigation.
 */

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { useRegistration } from '@/registration/registration-provider'
import { validateCPF, formatCPF, maskCPF } from '@/validation/cpf'

interface ParticipantFormClientProps {
  eventSlug: string
  prefillData: {
    name: string
    email: string
    phone: string
    cpf: string // already masked for display
  } | null
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  cpf?: string
}

export function ParticipantFormClient({
  eventSlug,
  prefillData,
}: ParticipantFormClientProps) {
  const router = useRouter()
  const { data, updateData } = useRegistration()

  // Initialize from context (persisted) or prefill data
  const [name, setName] = useState(data.name || prefillData?.name || '')
  const [email, setEmail] = useState(data.email || prefillData?.email || '')
  const [phone, setPhone] = useState(data.phone || prefillData?.phone || '')
  const [cpf, setCpf] = useState(data.cpf || '')
  const [cpfDisplay, setCpfDisplay] = useState(() => {
    if (data.cpf) return formatCPF(data.cpf)
    if (prefillData?.cpf) return prefillData.cpf // Already masked
    return ''
  })
  const [isCpfEditing, setIsCpfEditing] = useState(!prefillData?.cpf)
  const [dietaryRestrictions, setDietaryRestrictions] = useState(
    data.dietaryRestrictions || ''
  )
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(
    data.isFirstTime
  )
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Nome completo é obrigatório.'
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido.'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório.'
    }

    if (!cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório.'
    } else if (!validateCPF(cpf)) {
      newErrors.cpf = 'CPF inválido.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [name, email, phone, cpf])

  function handleCpfChange(value: string) {
    // Allow only digits, dots, and hyphens
    const cleaned = value.replace(/[^\d.-]/g, '')
    setCpfDisplay(cleaned)
    setCpf(cleaned.replace(/\D/g, ''))
  }

  function handleCpfBlur() {
    if (cpf.length === 11) {
      setCpfDisplay(formatCPF(cpf))
    }
  }

  function handleEditCpf() {
    setIsCpfEditing(true)
    setCpfDisplay(formatCPF(cpf))
  }

  function handleContinue() {
    if (!validateForm()) return

    updateData({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      cpf: cpf.replace(/\D/g, ''),
      dietaryRestrictions: dietaryRestrictions.trim(),
      isFirstTime,
    })

    router.push(`/inscrição/${eventSlug}/pagamento`)
  }

  function handleBack() {
    // Save partial data before going back
    updateData({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      cpf: cpf.replace(/\D/g, ''),
      dietaryRestrictions: dietaryRestrictions.trim(),
      isFirstTime,
    })
    router.push(`/inscrição/${eventSlug}`)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        Dados do participante
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Preencha seus dados para a inscrição.
      </p>

      <div className="mt-6 space-y-5">
        {/* Nome completo */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground"
          >
            Nome completo *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className={`mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-seasonal-primary focus:outline-none focus:ring-1 focus:ring-seasonal-primary ${
              errors.name ? 'border-destructive' : 'border-input'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={`mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-seasonal-primary focus:outline-none focus:ring-1 focus:ring-seasonal-primary ${
              errors.email ? 'border-destructive' : 'border-input'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-foreground"
          >
            Telefone *
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(48) 99999-9999"
            className={`mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-seasonal-primary focus:outline-none focus:ring-1 focus:ring-seasonal-primary ${
              errors.phone ? 'border-destructive' : 'border-input'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
          )}
        </div>

        {/* CPF */}
        <div>
          <label
            htmlFor="cpf"
            className="block text-sm font-medium text-foreground"
          >
            CPF *
          </label>
          {!isCpfEditing && prefillData?.cpf ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-foreground">
                {maskCPF(cpf || '00000000000')}
              </span>
              <button
                type="button"
                onClick={handleEditCpf}
                className="text-xs text-seasonal-primary hover:underline"
              >
                Editar
              </button>
            </div>
          ) : (
            <input
              id="cpf"
              type="text"
              value={cpfDisplay}
              onChange={(e) => handleCpfChange(e.target.value)}
              onBlur={handleCpfBlur}
              placeholder="000.000.000-00"
              maxLength={14}
              className={`mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-seasonal-primary focus:outline-none focus:ring-1 focus:ring-seasonal-primary ${
                errors.cpf ? 'border-destructive' : 'border-input'
              }`}
            />
          )}
          {errors.cpf && (
            <p className="mt-1 text-xs text-destructive">{errors.cpf}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-muted-foreground">
            Campos opcionais
          </p>
        </div>

        {/* Restrições alimentares */}
        <div>
          <label
            htmlFor="dietary"
            className="block text-sm font-medium text-foreground"
          >
            Restrições alimentares
          </label>
          <textarea
            id="dietary"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            placeholder="Ex: vegetariano, alergias, intolerância a lactose..."
            rows={3}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-seasonal-primary focus:outline-none focus:ring-1 focus:ring-seasonal-primary"
          />
        </div>

        {/* É sua primeira vez? */}
        <div>
          <span className="block text-sm font-medium text-foreground">
            É sua primeira vez no evento?
          </span>
          <div className="mt-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="firstTime"
                checked={isFirstTime === true}
                onChange={() => setIsFirstTime(true)}
                className="accent-seasonal-primary"
              />
              Sim
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="firstTime"
                checked={isFirstTime === false}
                onChange={() => setIsFirstTime(false)}
                className="accent-seasonal-primary"
              />
              Nao
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="rounded-md bg-seasonal-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-seasonal-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
