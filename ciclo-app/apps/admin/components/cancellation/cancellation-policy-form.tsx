'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateGlobalPolicy,
  updateEventPolicy,
  removeEventPolicy,
} from '../../lib/actions/cancellation-policy'
import type { CancellationPolicy } from '@ciclo/utils'

interface CancellationPolicyFormProps {
  mode: 'global' | 'event'
  eventId?: string
  initialPolicy?: {
    earlyDaysThreshold: number
    earlyRefundPercent: number
    midDaysLowerThreshold: number
    midRefundPercent: number
    transferAllowed: boolean
  }
}

const DEFAULTS = {
  earlyDaysThreshold: 15,
  earlyRefundPercent: 80,
  midDaysLowerThreshold: 7,
  midRefundPercent: 50,
  transferAllowed: true,
}

export function CancellationPolicyForm({
  mode,
  eventId,
  initialPolicy,
}: CancellationPolicyFormProps) {
  const router = useRouter()
  const initial = initialPolicy ?? DEFAULTS

  const [earlyDays, setEarlyDays] = useState(initial.earlyDaysThreshold)
  const [earlyPercent, setEarlyPercent] = useState(initial.earlyRefundPercent)
  const [midDays, setMidDays] = useState(initial.midDaysLowerThreshold)
  const [midPercent, setMidPercent] = useState(initial.midRefundPercent)
  const [transferAllowed, setTransferAllowed] = useState(initial.transferAllowed)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Validações basicas
    if (earlyDays <= midDays) {
      setMessage({ type: 'error', text: 'Prazo 1 deve ser maior que Prazo 2.' })
      setIsLoading(false)
      return
    }
    if (midDays < 0 || earlyDays < 0) {
      setMessage({ type: 'error', text: 'Os prazos devem ser números positivos.' })
      setIsLoading(false)
      return
    }
    if (earlyPercent < 0 || earlyPercent > 100 || midPercent < 0 || midPercent > 100) {
      setMessage({ type: 'error', text: 'Percentuais devem estar entre 0 e 100.' })
      setIsLoading(false)
      return
    }

    const policy: CancellationPolicy = {
      rules: [
        { daysBeforeEvent: earlyDays, refundPercent: earlyPercent },
        { daysBeforeEvent: midDays, refundPercent: midPercent },
        { daysBeforeEvent: 0, refundPercent: 0 },
      ],
      transferAlwaysAllowed: transferAllowed,
    }

    try {
      const result =
        mode === 'global'
          ? await updateGlobalPolicy(policy)
          : await updateEventPolicy(eventId!, policy)

      if (result.success) {
        setMessage({ type: 'success', text: 'Politica salva com sucesso.' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Erro ao salvar.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro inesperado ao salvar a política.' })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemoveOverride() {
    if (!eventId) return
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await removeEventPolicy(eventId)
      if (result.success) {
        setMessage({ type: 'success', text: 'Override removido. Evento usara a política global.' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Erro ao remover override.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro inesperado.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Faixa 1: Antecedencia alta */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Faixa 1: Cancelamento com antecedência
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="early-days" className="block text-sm text-gray-600">
              Dias antes do evento (mínimo)
            </label>
            <input
              id="early-days"
              type="number"
              min={1}
              value={earlyDays}
              onChange={(e) => setEarlyDays(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="early-percent" className="block text-sm text-gray-600">
              Reembolso (%)
            </label>
            <input
              id="early-percent"
              type="number"
              min={0}
              max={100}
              value={earlyPercent}
              onChange={(e) => setEarlyPercent(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Faixa 2: Antecedencia media */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Faixa 2: Cancelamento com antecedência media
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="mid-days" className="block text-sm text-gray-600">
              Dias antes do evento (mínimo)
            </label>
            <input
              id="mid-days"
              type="number"
              min={0}
              value={midDays}
              onChange={(e) => setMidDays(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="mid-percent" className="block text-sm text-gray-600">
              Reembolso (%)
            </label>
            <input
              id="mid-percent"
              type="number"
              min={0}
              max={100}
              value={midPercent}
              onChange={(e) => setMidPercent(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Faixa 3: Sem reembolso (implicita) */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">
          Faixa 3: Menos de {midDays} dias antes do evento
        </h3>
        <p className="text-sm text-gray-400">0% de reembolso (automatico)</p>
      </div>

      {/* Transferência */}
      <div className="flex items-center gap-3">
        <input
          id="transfer-allowed"
          type="checkbox"
          checked={transferAllowed}
          onChange={(e) => setTransferAllowed(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="transfer-allowed" className="text-sm text-gray-700">
          Permitir transferência de inscrição (sem custo)
        </label>
      </div>

      {/* Mensagem */}
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Botoes */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar Politica'}
        </button>

        {mode === 'event' && initialPolicy && (
          <button
            type="button"
            onClick={handleRemoveOverride}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Remover Override (Usar Global)
          </button>
        )}
      </div>
    </form>
  )
}
