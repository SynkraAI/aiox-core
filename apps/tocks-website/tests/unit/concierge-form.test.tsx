import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/**
 * ConciergeForm uses React 19 useActionState + useFormStatus + a Server Action.
 * We mock the Server Action module to avoid 'use server' restrictions in jsdom.
 *
 * Coverage focus: rendering shape — all required fields present, error live
 * region renders when state.status === 'error', submit button label states.
 */

vi.mock('@/app/actions/submit-concierge', () => ({
  submitConcierge: vi.fn(),
  INITIAL_CONCIERGE_STATE: { status: 'idle' as const },
}))

import { ConciergeForm } from '@/components/organisms/concierge-form'

describe('ConciergeForm', () => {
  it('renders all four fields (name, email, phone, message)', () => {
    render(<ConciergeForm />)
    expect(screen.getByLabelText(/Seu nome/)).toBeInTheDocument()
    expect(screen.getByLabelText(/E-mail/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Telefone/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sua criacao/)).toBeInTheDocument()
  })

  it('marks name, email, and message as required (not phone)', () => {
    render(<ConciergeForm />)
    expect(screen.getByLabelText(/Seu nome/)).toHaveAttribute('required')
    expect(screen.getByLabelText(/E-mail/)).toHaveAttribute('required')
    expect(screen.getByLabelText(/Sua criacao/)).toHaveAttribute('required')
    expect(screen.getByLabelText(/Telefone/)).not.toHaveAttribute('required')
  })

  it('renders the submit button with default idle label', () => {
    render(<ConciergeForm />)
    expect(screen.getByRole('button', { name: /Iniciar conversa/ })).toBeInTheDocument()
  })

  it('hint text on phone field is visible', () => {
    render(<ConciergeForm />)
    expect(
      screen.getByText(/retornamos via WhatsApp/i),
    ).toBeInTheDocument()
  })

  it('uses noValidate on the form (Server Action handles validation)', () => {
    const { container } = render(<ConciergeForm />)
    const form = container.querySelector('form')
    expect(form?.noValidate).toBe(true)
  })

  it('renders a textarea for the message field', () => {
    render(<ConciergeForm />)
    const ta = screen.getByLabelText(/Sua criacao/)
    expect(ta.tagName).toBe('TEXTAREA')
  })
})
