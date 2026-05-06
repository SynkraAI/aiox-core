'use client'

/**
 * SwatchPicker -- Compound Component (drasner pattern).
 *
 * Uso:
 *   <SwatchPicker value={v} onChange={set} label="Madeira">
 *     <SwatchPicker.Option value="oak" caption="Carvalho" thumbnail="..." />
 *     <SwatchPicker.Option value="walnut" caption="Nogueira" />
 *   </SwatchPicker>
 *
 * Art. VII: split entre root + option (este arquivo ~85 linhas, cabe).
 * AC-2 S-7.2: focus ring var(--ring-swatch-active) full, aria-live polite, hover:scale-105.
 */

import { createContext, useContext, useId, type ReactNode } from 'react'

interface SwatchContextValue {
  value: string
  onChange: (v: string) => void
  groupName: string
}

const SwatchContext = createContext<SwatchContextValue | null>(null)

interface SwatchPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  children: ReactNode
  className?: string
}

export function SwatchPicker({
  value,
  onChange,
  label,
  children,
  className = '',
}: SwatchPickerProps) {
  const groupName = useId()
  return (
    <SwatchContext.Provider value={{ value, onChange, groupName }}>
      <div className={`flex flex-col gap-3 ${className}`} role="radiogroup" aria-label={label}>
        {label && (
          <span className="font-display text-[10px] uppercase tracking-[var(--tracking-editorial)] text-[var(--accent-gold)]">
            {label}
          </span>
        )}
        <div className="flex flex-wrap gap-3">{children}</div>
        <span aria-live="polite" className="sr-only">
          {label ? `${label} selecionada: ${value}` : `Selecionado: ${value}`}
        </span>
      </div>
    </SwatchContext.Provider>
  )
}

interface OptionProps {
  value: string
  caption: string
  thumbnail?: string
}

function Option({ value, caption, thumbnail }: OptionProps) {
  const ctx = useContext(SwatchContext)
  if (!ctx) throw new Error('SwatchPicker.Option must render inside SwatchPicker')
  const active = ctx.value === value

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={caption}
      onClick={() => ctx.onChange(value)}
      className={`group flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105 ${
        active ? 'scale-105' : ''
      }`}
    >
      <span
        aria-hidden="true"
        style={thumbnail ? { backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        className={`block h-12 w-12 rounded-full border transition-all duration-200 ${
          active
            ? 'border-[var(--ring-swatch-active)] ring-2 ring-[var(--ring-swatch-active)] ring-offset-2 ring-offset-[var(--background)]'
            : 'border-[var(--surface-hover)] bg-[var(--surface)]'
        }`}
      />
      <span className="font-display text-[10px] uppercase tracking-[0.1em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
        {caption}
      </span>
    </button>
  )
}

SwatchPicker.Option = Option
