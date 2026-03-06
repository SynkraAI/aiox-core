'use client'

/**
 * PIX Payment Client Component
 * Story E3.2 — AC-4: QR Code display, Copia e Cola, countdown, polling
 *
 * Polls /api/payments/[paymentId]/status every 5s.
 * Redirects to success page on confirmation.
 * Shows countdown timer until expiration.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PixPaymentClientProps {
  paymentId: string
  registrationId: string
  pixCopiaECola: string
  pixQrCodeBase64: string
  expiresAt: string
  amount: number
}

const POLL_INTERVAL_MS = 5000

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function PixPaymentClient({
  paymentId,
  registrationId,
  pixCopiaECola,
  pixQrCodeBase64,
  expiresAt,
}: PixPaymentClientProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)
  const [status, setStatus] = useState<'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'FAILED'>('PENDING')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return

    const expirationDate = new Date(expiresAt).getTime()

    function updateTimer() {
      const remaining = expirationDate - Date.now()
      if (remaining <= 0) {
        setIsExpired(true)
        setTimeRemaining(0)
        setStatus('EXPIRED')
        if (timerRef.current) clearInterval(timerRef.current)
        if (pollRef.current) clearInterval(pollRef.current)
      } else {
        setTimeRemaining(remaining)
      }
    }

    updateTimer()
    timerRef.current = setInterval(updateTimer, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [expiresAt])

  // Polling for payment status
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/status`)
      if (!response.ok) return

      const data = await response.json() as { status: string; registrationId: string }

      if (data.status === 'CONFIRMED') {
        setStatus('CONFIRMED')
        if (pollRef.current) clearInterval(pollRef.current)
        if (timerRef.current) clearInterval(timerRef.current)
        router.push(`/inscrição/confirmada/${registrationId}`)
      } else if (data.status === 'FAILED') {
        setStatus('FAILED')
        if (pollRef.current) clearInterval(pollRef.current)
      } else if (data.status === 'EXPIRED') {
        setStatus('EXPIRED')
        setIsExpired(true)
        if (pollRef.current) clearInterval(pollRef.current)
        if (timerRef.current) clearInterval(timerRef.current)
      }
    } catch {
      // Silently retry on next interval
    }
  }, [paymentId, registrationId, router])

  useEffect(() => {
    if (isExpired || status === 'CONFIRMED') return

    pollRef.current = setInterval(checkStatus, POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [checkStatus, isExpired, status])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pixCopiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback: select text in hidden input
    }
  }

  if (status === 'CONFIRMED') {
    return (
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-bold text-green-700">Pagamento confirmado!</p>
        <p className="mt-2 text-sm text-green-600">Redirecionando...</p>
      </div>
    )
  }

  if (isExpired || status === 'EXPIRED') {
    return (
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-lg font-bold text-amber-700">PIX expirado</p>
        <p className="mt-2 text-sm text-amber-600">
          O tempo para pagamento via PIX expirou. Você pode tentar novamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-md bg-seasonal-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
        >
          Gerar novo PIX
        </button>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      {/* QR Code */}
      {pixQrCodeBase64 && (
        <div className="flex justify-center">
          <div className="rounded-lg border border-border bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pixQrCodeBase64}
              alt="QR Code PIX"
              className="h-64 w-64"
            />
          </div>
        </div>
      )}

      {/* Copia e Cola */}
      {pixCopiaECola && (
        <div>
          <label className="text-sm font-medium text-foreground">
            Código Copia e Cola
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              readOnly
              value={pixCopiaECola}
              className="flex-1 rounded-md border border-input bg-muted/50 px-3 py-2 text-xs text-foreground"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-md bg-seasonal-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-seasonal-primary/90"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {/* Countdown Timer */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Tempo restante para pagamento</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
          {formatTimeRemaining(timeRemaining)}
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Como pagar com PIX</h3>
        <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>1. Abra o app do seu banco</li>
          <li>2. Selecione a opção PIX</li>
          <li>3. Escaneie o QR Code acima ou copie o código</li>
          <li>4. Confirme o pagamento</li>
          <li>5. Águarde a confirmação automatica nesta pagina</li>
        </ol>
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
        Águardando pagamento...
      </div>
    </div>
  )
}
