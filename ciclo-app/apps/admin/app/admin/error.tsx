'use client'

import { Button } from '@ciclo/ui'

/**
 * Error boundary for admin routes (AC-9).
 * Captures unhandled errors and shows a friendly message.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-heading font-semibold text-base-dark">
          Algo deu errado
        </h2>
        <p className="mt-2 text-base-dark/60">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        {error.digest ? (
          <p className="mt-1 text-xs text-base-dark/40">
            Código: {error.digest}
          </p>
        ) : null}
        <Button onClick={reset} className="mt-6">
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}
