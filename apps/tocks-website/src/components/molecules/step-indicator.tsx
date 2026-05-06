/**
 * StepIndicator -- Molecule (SSR-safe, apresentacional).
 *
 * Consumido por product-customization.tsx: renderiza N dots
 * (N = product.customizationOptions.length, dinamico -- 2 a 4 no catalogo).
 * AC-1 da S-7.2: NUNCA hardcoded 7.
 *
 * Art. VII: < 100 linhas, zero 'use client', zero hooks.
 */

interface StepIndicatorProps {
  steps: number
  current: number
  label?: string
  className?: string
}

export function StepIndicator({
  steps,
  current,
  label = 'Etapa',
  className = '',
}: StepIndicatorProps) {
  const clamped = Math.min(Math.max(current, 1), steps)
  const announce = `${label} ${clamped} de ${steps}`

  return (
    <div
      className={`flex flex-col gap-3 ${className}`}
      aria-label={announce}
    >
      <span
        aria-live="polite"
        className="font-display text-[10px] uppercase tracking-[var(--tracking-editorial)] text-[var(--text-secondary)]"
      >
        {announce}
      </span>

      <ol
        role="list"
        className="flex items-center gap-3"
      >
        {Array.from({ length: steps }).map((_, idx) => {
          const n = idx + 1
          const isActive = n === clamped
          const isDone = n < clamped
          const dotStyle = isActive
            ? 'bg-[var(--accent-gold)] scale-110 shadow-[0_0_0_3px_rgba(212,175,55,0.15)]'
            : isDone
              ? 'bg-[var(--accent-gold-deep)]'
              : 'bg-[var(--surface-hover)]'

          return (
            <li
              key={n}
              aria-current={isActive ? 'step' : undefined}
              className="flex items-center gap-3"
            >
              <span
                className={`block h-2 w-2 rounded-full transition-all duration-300 ${dotStyle}`}
                aria-hidden="true"
              />
              {n < steps && (
                <span
                  className={`h-px w-6 ${isDone ? 'bg-[var(--accent-gold-deep)]' : 'bg-[var(--surface-hover)]'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
