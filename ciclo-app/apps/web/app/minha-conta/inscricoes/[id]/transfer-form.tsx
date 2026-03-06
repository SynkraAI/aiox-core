'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TransferRegistrationFormProps {
  registrationId: string
}

export function TransferRegistrationForm({
  registrationId,
}: TransferRegistrationFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!name.trim() || !email.trim()) {
      setError('Nome e email são obrigatórios.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(
        `/api/registrations/${registrationId}/transfer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Erro ao transferir inscrição.')
        return
      }

      setSuccess(true)
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
          Inscrição transferida com sucesso para {name} ({email}).
        </p>
        <p className="text-sm text-green-600 mt-1">Redirecionando...</p>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
      >
        Transferir Inscrição
      </button>
    )
  }

  return (
    <form onSubmit={handleTransfer} className="space-y-4">
      <div>
        <label htmlFor="transfer-name" className="block text-sm font-medium text-gray-700">
          Nome completo do novo participante
        </label>
        <input
          id="transfer-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="transfer-email" className="block text-sm font-medium text-gray-700">
          Email do novo participante
        </label>
        <input
          id="transfer-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemplo.com"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Transferindo...' : 'Confirmar Transferência'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            setError(null)
            setName('')
            setEmail('')
          }}
          disabled={isLoading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Voltar
        </button>
      </div>
    </form>
  )
}
