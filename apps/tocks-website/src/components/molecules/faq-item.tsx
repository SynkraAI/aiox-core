/**
 * FaqItem -- Molecule (SSR-safe, zero JS).
 *
 * Usa <details>/<summary> nativo:
 *   - keyboard nav nativa (Tab + Enter + Space)
 *   - aria expanded gerenciado pelo browser
 *   - zero Zustand, zero useState, zero 'use client'
 *
 * Chevron rotacional via CSS group-open (Tailwind v4).
 * Art. VII: < 100 linhas.
 */

interface FaqItemProps {
  question: string
  answer: string
  className?: string
}

export function FaqItem({ question, answer, className = '' }: FaqItemProps) {
  return (
    <details
      className={`group border-b border-[var(--accent-gold-deep)]/30 py-5 last:border-0 ${className}`}
    >
      <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
        <span className="font-display text-sm font-medium uppercase tracking-[0.05em] text-[var(--text-primary)] group-open:text-[var(--accent-gold)] transition-colors duration-200">
          {question}
        </span>
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--accent-gold)] transition-transform duration-300 group-open:rotate-45"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </summary>
      <p className="font-body text-sm md:text-base leading-[1.7] text-[var(--text-secondary)] mt-4 pr-10">
        {answer}
      </p>
    </details>
  )
}
