'use client'

/**
 * Client component for sold-out / waitlist page
 * Story E3.1 — AC-12: Sold out message + waitlist form
 */

import { useState, useTransition } from 'react'
import { joinWaitlist } from '@/actions/registration'

interface SoldOutClientProps {
  eventSlug: string
  eventName: string
}

export function SoldOutClient({ eventSlug, eventName }: SoldOutClientProps) {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!email.trim()) {
      setError('Email é obrigatório.')
      return
    }

    setError(null)

    startTransition(async () => {
      const result = await joinWaitlist({
        email: email.trim(),
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        eventSlug,
      })

      if (!result.success) {
        setError(result.error || 'Erro ao entrar na lista de espera.')
        return
      }

      setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-seasonal-primary/10">
          <svg
            className="h-8 w-8 text-seasonal-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Você está na lista de espera!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Avisaremos por email caso novas vagas sejam disponibilizadas para{' '}
          <strong>{eventName}</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <svg
          className="h-8 w-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-foreground">
        Evento esgotado
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Infelizmente, todas as vagas para <strong>{eventName}</strong> foram
        preenchidas.
      </p>

      {/* Waitlist form */}
      <div className="mx-auto mt-8 max-w-sm text-left">
        <h3 className="text-sm font-semibold text-foreground">
          Entrar na lista de espera
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Deixe seus dados e avisaremos se abrirem novas vagas.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label
              htmlFor="waitlist-email"
              className="block text-sm font-medium text-foreground"
            >
              Email *
            </label>
            <input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-seasonal-primary focus:outline-none focus:ring-1 focus:ring-seasonal-primary"
            />
          </div>

          <div>
            <label
              htmlFor="waitlist-name"
              className="block text-sm font-medium text-foreground"
            >
              Nome
            </label>
            <input
              id="waitlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-seasonal-primary focus:outline-none focus:ring-1 focus:ring-seasonal-primary"
            />
          </div>

          <div>
            <label
              htmlFor="waitlist-phone"
              className="block text-sm font-medium text-foreground"
            >
              Telefone
            </label>
            <input
              id="waitlist-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(48) 99999-9999"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-seasonal-primary focus:outline-none focus:ring-1 focus:ring-seasonal-primary"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-4 w-full rounded-md bg-seasonal-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-seasonal-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Enviando...' : 'Entrar na lista de espera'}
        </button>
      </div>
    </div>
  )
}
