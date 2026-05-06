import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from '@/components/molecules/form-field'

describe('FormField', () => {
  it('renders an input by default with label correctly linked via htmlFor/id', () => {
    render(<FormField label="Seu nome" name="name" />)
    const input = screen.getByLabelText('Seu nome')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('name', 'name')
  })

  it('renders a textarea when as="textarea"', () => {
    render(<FormField as="textarea" label="Mensagem" name="message" />)
    const ta = screen.getByLabelText('Mensagem')
    expect(ta.tagName).toBe('TEXTAREA')
  })

  it('marks required fields with aria-required="true" and asterisk', () => {
    render(<FormField label="E-mail" name="email" required />)
    const input = screen.getByLabelText(/E-mail/)
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('required')
    // asterisk is aria-hidden
    const star = screen.getByText('*', { selector: 'span[aria-hidden="true"]' })
    expect(star).toBeInTheDocument()
  })

  it('renders hint when provided and no error', () => {
    render(<FormField label="Telefone" name="phone" hint="Ligamos no horario comercial." />)
    expect(screen.getByText('Ligamos no horario comercial.')).toBeInTheDocument()
  })

  it('renders error message and sets aria-invalid when error provided', () => {
    render(
      <FormField label="E-mail" name="email" error="Informe um e-mail valido." />,
    )
    const input = screen.getByLabelText('E-mail')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Informe um e-mail valido.')
  })

  it('hides hint when error is present (error takes precedence visually)', () => {
    render(
      <FormField
        label="E-mail"
        name="email"
        hint="Sem spam."
        error="Invalid"
      />,
    )
    expect(screen.queryByText('Sem spam.')).toBeNull()
    expect(screen.getByText('Invalid')).toBeInTheDocument()
  })

  it('forwards extra input props (e.g., type, autoComplete)', () => {
    render(
      <FormField label="E-mail" name="email" type="email" autoComplete="email" />,
    )
    const input = screen.getByLabelText('E-mail') as HTMLInputElement
    expect(input.type).toBe('email')
    expect(input.autocomplete).toBe('email')
  })

  it('links describedby to error and hint ids when both relevant', () => {
    const { rerender } = render(
      <FormField label="X" name="x" hint="hint text" />,
    )
    let input = screen.getByLabelText('X')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()

    rerender(<FormField label="X" name="x" error="oops" />)
    input = screen.getByLabelText('X')
    expect(input.getAttribute('aria-describedby')).toBeTruthy()
  })
})
