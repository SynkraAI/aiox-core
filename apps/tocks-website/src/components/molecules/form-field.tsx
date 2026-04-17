/**
 * FormField -- Molecule (SSR/client agnostico).
 *
 * Label + input/textarea linkados via htmlFor/id (a11y).
 * Bottom-border vira gold no focus; aria-required/invalid + live region para erro.
 * Art. VII: < 100 linhas.
 */

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

type Base = { label: string; name: string; required?: boolean; error?: string; hint?: string; className?: string }
type InputP = Base & Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'required'> & { as?: 'input' }
type AreaP = Base & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'required'> & { as: 'textarea' }
export type FormFieldProps = InputP | AreaP

const FIELD_BASE =
  'w-full bg-transparent border-0 border-b border-[var(--surface-hover)] text-[var(--text-primary)] font-body text-base pt-2 pb-2 focus:outline-none focus:border-[var(--accent-gold)] transition-colors duration-200 placeholder:text-[var(--text-secondary)]'

export function FormField(props: FormFieldProps) {
  const { label, name, required, error, hint, className = '', as = 'input', ...rest } = props
  const id = useId()
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined
  const aria = {
    id,
    name,
    required,
    'aria-required': required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  } as const

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="font-display text-[10px] uppercase tracking-[var(--tracking-editorial)] text-[var(--accent-gold)]">
        {label}
        {required && <span className="ml-1" aria-hidden="true">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea {...aria} rows={4} className={`${FIELD_BASE} resize-none`} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...aria} className={FIELD_BASE} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint && !error && <span id={hintId} className="font-body text-xs text-[var(--text-secondary)] mt-1">{hint}</span>}
      {error && (
        <span id={errorId} role="alert" aria-live="polite" className="font-body text-xs text-[var(--accent-gold-hover)] mt-1">
          {error}
        </span>
      )}
    </div>
  )
}
