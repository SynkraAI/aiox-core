'use server'

/**
 * Server Action -- concierge form submission (Next.js 16).
 *
 * AC-8 S-7.2: <form action={submitConcierge}> com useActionState do React 19.
 * Assinatura com prevState OBRIGATORIA para useActionState (ver docs/forms.md).
 * Sem zod instalado -- validacao manual.
 *
 * Redireciona para WhatsApp com texto pre-populado se valido (fallback sem backend).
 */

import { redirect } from 'next/navigation'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import type { ConciergeFormState } from './submit-concierge.types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function str(fd: FormData, key: string): string {
  const v = fd.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

export async function submitConcierge(
  _prev: ConciergeFormState,
  formData: FormData,
): Promise<ConciergeFormState> {
  const name = str(formData, 'name')
  const email = str(formData, 'email')
  const phone = str(formData, 'phone')
  const message = str(formData, 'message')

  const errors: ConciergeFormState['errors'] = {}
  if (name.length < 2) errors.name = 'Informe seu nome completo.'
  if (!EMAIL_RE.test(email)) errors.email = 'Informe um e-mail valido.'
  if (message.length < 10) errors.message = 'Conte um pouco mais sobre sua criacao (minimo 10 caracteres).'

  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Revise os campos destacados.', errors }
  }

  // Fallback: abre WhatsApp com texto pre-populado.
  // Quando o backend (email/CRM) for conectado, substituir por fetch/queue.
  const phoneLine = phone ? `\nTelefone: ${phone}` : ''
  const text = encodeURIComponent(
    `Ola, sou ${name} (${email}).${phoneLine}\n\n${message}`,
  )
  redirect(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`)
}
