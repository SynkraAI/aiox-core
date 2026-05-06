'use client'

/**
 * ConciergeForm -- Organism.
 *
 * AC-8 S-7.2: usa <form action={formAction}> + useActionState (Next 16 / React 19).
 * 'use client' exigido por useActionState + useFormStatus.
 *
 * Consome molecules/form-field. Submit = ghost gold (ver ConciergeSubmit).
 * Art. VII: < 100 linhas (submit button isolado em helper).
 */

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { FormField } from '@/components/molecules/form-field'
import { submitConcierge } from '@/app/actions/submit-concierge'
import {
  INITIAL_CONCIERGE_STATE,
  type ConciergeFormState,
} from '@/app/actions/submit-concierge.types'

function ConciergeSubmit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 inline-flex items-center justify-center font-display font-medium uppercase tracking-[0.1em] rounded-[4px] border border-[var(--accent-gold)] text-[var(--accent-gold)] bg-transparent px-8 py-4 text-sm transition-all duration-300 cursor-pointer hover:bg-[var(--accent-gold)] hover:text-[var(--background)] disabled:opacity-50 disabled:cursor-wait"
    >
      {pending ? 'Enviando...' : 'Iniciar conversa'}
    </button>
  )
}

export function ConciergeForm() {
  const [state, formAction] = useActionState<ConciergeFormState, FormData>(
    submitConcierge,
    INITIAL_CONCIERGE_STATE,
  )

  return (
    <form
      action={formAction}
      noValidate
      className="bg-[var(--surface)] rounded-[8px] p-8 md:p-10 flex flex-col gap-6"
    >
      <FormField
        label="Seu nome"
        name="name"
        required
        autoComplete="name"
        error={state.errors?.name}
      />
      <FormField
        label="E-mail"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={state.errors?.email}
      />
      <FormField
        label="Telefone (opcional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        hint="Se preferir, retornamos via WhatsApp."
      />
      <FormField
        as="textarea"
        label="Sua criacao"
        name="message"
        required
        hint="Conte sobre o espaco, o estilo desejado e qualquer referencia."
        error={state.errors?.message}
      />

      {state.status === 'error' && state.message && (
        <p role="alert" aria-live="polite" className="font-body text-sm text-[var(--accent-gold-hover)]">
          {state.message}
        </p>
      )}

      <ConciergeSubmit />
    </form>
  )
}
