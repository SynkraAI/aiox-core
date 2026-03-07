'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!token) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-center font-serif text-2xl font-bold text-stone-900">
          Link Inválido
        </h1>
        <p className="mb-6 text-center text-stone-600">
          O link de redefinição de senha é inválido ou expirou.
        </p>
        <Link
          href="/forgot-password"
          className="block w-full rounded-md bg-amber-700 px-4 py-2 text-center font-medium text-white hover:bg-amber-800"
        >
          Solicitar novo link
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Erro ao redefinir senha.')
        return
      }

      setSuccess(true)
    } catch {
      setError('Erro ao redefinir senha. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-center font-serif text-2xl font-bold text-stone-900">
          Senha Redefinida
        </h1>
        <p className="mb-6 text-center text-stone-600">
          Sua senha foi redefinida com sucesso. Faça login com sua nova senha.
        </p>
        <Link
          href="/login"
          className="block w-full rounded-md bg-amber-700 px-4 py-2 text-center font-medium text-white hover:bg-amber-800"
        >
          Fazer login
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-center font-serif text-2xl font-bold text-stone-900">
        Redefinir Senha
      </h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">
            Nova senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Repita a nova senha"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
        >
          {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-stone-500">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
