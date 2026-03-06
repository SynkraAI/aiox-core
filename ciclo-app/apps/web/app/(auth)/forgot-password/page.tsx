'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Erro ao processar solicitação.')
        return
      }

      setSuccess(true)
    } catch {
      setError('Erro ao processar solicitação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-center font-serif text-2xl font-bold text-stone-900">
          Email Enviado
        </h1>
        <p className="mb-6 text-center text-stone-600">
          Se o email estiver cadastrado, você recebera instruções para redefinir sua senha.
          Verifique sua caixa de entrada e spam.
        </p>
        <Link
          href="/login"
          className="block w-full rounded-md bg-amber-700 px-4 py-2 text-center font-medium text-white hover:bg-amber-800"
        >
          Voltar para login
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-center font-serif text-2xl font-bold text-stone-900">
        Esqueceu a Senha?
      </h1>
      <p className="mb-6 text-center text-sm text-stone-600">
        Informe seu email para receber um link de redefinição.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="seu@email.com"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
        >
          {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/login" className="font-medium text-amber-700 hover:text-amber-800">
          Voltar para login
        </Link>
      </p>
    </div>
  )
}
