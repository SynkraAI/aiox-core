'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, Input } from '@ciclo/ui'

const SEASONS = [
  { value: 'Primavera', label: 'Primavera' },
  { value: 'Verão', label: 'Verão' },
  { value: 'Outono', label: 'Outono' },
  { value: 'Inverno', label: 'Inverno' },
] as const

interface FormState {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

export function LeadCaptureForm() {
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])
  const [formState, setFormState] = useState<FormState>({
    status: 'idle',
    message: '',
  })

  function handleSeasonToggle(season: string) {
    setSelectedSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season],
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim()) {
      setFormState({ status: 'error', message: 'Email é obrigatório.' })
      return
    }

    setFormState({ status: 'submitting', message: '' })

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          interestedSeasons: selectedSeasons,
          source: 'landing-page',
          utmSource: searchParams.get('utm_source') ?? undefined,
          utmMedium: searchParams.get('utm_medium') ?? undefined,
          utmCampaign: searchParams.get('utm_campaign') ?? undefined,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message ?? `HTTP ${response.status}`)
      }

      const data = (await response.json()) as { success: boolean; message: string }

      setFormState({ status: 'success', message: data.message })
      // Reset form on success
      setName('')
      setEmail('')
      setSelectedSeasons([])
    } catch (error) {
      setFormState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Erro ao enviar. Tente novamente.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
      <div>
        <label htmlFor="lead-name" className="mb-1 block text-sm font-medium text-foreground">
          Nome <span className="text-muted-foreground">(opcional)</span>
        </label>
        <Input
          id="lead-name"
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={formState.status === 'submitting'}
        />
      </div>

      <div>
        <label htmlFor="lead-email" className="mb-1 block text-sm font-medium text-foreground">
          Email <span className="text-destructive">*</span>
        </label>
        <Input
          id="lead-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={formState.status === 'submitting'}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">
          Estações de interesse
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {SEASONS.map((season) => (
            <label
              key={season.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                selectedSeasons.includes(season.value)
                  ? 'border-seasonal-primary bg-seasonal-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-seasonal-primary/50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSeasons.includes(season.value)}
                onChange={() => handleSeasonToggle(season.value)}
                className="sr-only"
                disabled={formState.status === 'submitting'}
              />
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  selectedSeasons.includes(season.value)
                    ? 'border-seasonal-primary bg-seasonal-primary text-white'
                    : 'border-muted-foreground'
                }`}
                aria-hidden="true"
              >
                {selectedSeasons.includes(season.value) && (
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium">{season.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="text-xs text-muted-foreground">
        Ao enviar, você concorda com nossa{' '}
        <a href="/privacidade" className="underline hover:text-foreground">
          política de privacidade
        </a>
        .
      </p>

      <Button
        type="submit"
        className="w-full"
        disabled={formState.status === 'submitting'}
      >
        {formState.status === 'submitting' ? 'Enviando...' : 'Quero receber novidades'}
      </Button>

      {formState.status === 'success' && (
        <div
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800"
          role="status"
        >
          {formState.message}
        </div>
      )}

      {formState.status === 'error' && (
        <div
          className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center text-sm text-destructive"
          role="alert"
        >
          {formState.message}
        </div>
      )}
    </form>
  )
}
