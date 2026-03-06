'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@ciclo/utils'

interface CancelRegistrationFormProps {
  registrationId: string
  refundAmount: number
  refundPercent: number
}

export function CancelRegistrationForm({
  registrationId,
  refundAmount,
  refundPercent,
}: CancelRegistrationFormProps) {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleCancel() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/registrations/${registrationId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Erro ao cancelar inscrição.')
        return
      }

      setSuccess(true)
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/minha-conta/inscrições')
        router.refresh()
      }, 2000)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          Inscrição cancelada com sucesso.
          {refundAmount > 0 &&
            ` Reembolso de ${formatCurrency(refundAmount)} será processado pelo administrador.`}
        </p>
        <p className="text-sm text-green-600 mt-1">Redirecionando...</p>
      </div>
    )
  }

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        Cancelar Inscrição
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          Tem certeza que deseja cancelar esta inscrição?
        </p>
        {refundAmount > 0 ? (
          <p className="text-sm text-red-600 mt-1">
            Você recebera um reembolso de {refundPercent}% ({formatCurrency(refundAmount)}).
          </p>
        ) : (
          <p className="text-sm text-red-600 mt-1">
            Nenhum reembolso será aplicado conforme a política de cancelamento.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? 'Cancelando...' : 'Confirmar Cancelamento'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsConfirming(false)
            setError(null)
          }}
          disabled={isLoading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
