'use client'

/**
 * Card Payment Client Component
 * Story E3.2 — AC-6: Loads Stripe.js from CDN, creates card element, handles payment
 *
 * No @stripe/react-stripe-js dependency — uses Stripe.js directly via script tag.
 * Only STRIPE_PUBLISHABLE_KEY is used client-side (safe).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@ciclo/utils'

interface CardPaymentClientProps {
  clientSecret: string
  stripePublishableKey: string
  amount: number
  registrationId: string
}

/** Minimal Stripe.js type declarations for what we use */
interface StripeInstance {
  elements: (options: { clientSecret: string }) => StripeElements
  confirmPayment: (options: {
    elements: StripeElements
    confirmParams: { return_url: string }
    redirect?: 'if_required'
  }) => Promise<{
    error?: { message?: string }
    paymentIntent?: { status: string }
  }>
}

interface StripeElements {
  create: (type: string, options?: Record<string, unknown>) => StripeElement
  getElement: (type: string) => StripeElement | null
}

interface StripeElement {
  mount: (selector: string | HTMLElement) => void
  on: (event: string, handler: (event: { complete?: boolean; error?: { message: string } }) => void) => void
  destroy: () => void
}

declare global {
  interface Window {
    Stripe?: (key: string) => StripeInstance
  }
}

export function CardPaymentClient({
  clientSecret,
  stripePublishableKey,
  amount,
  registrationId,
}: CardPaymentClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const stripeRef = useRef<StripeInstance | null>(null)
  const elementsRef = useRef<StripeElements | null>(null)
  const cardMountRef = useRef<HTMLDivElement>(null)

  // Load Stripe.js from CDN
  useEffect(() => {
    if (window.Stripe) {
      initializeStripe()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.async = true
    script.onload = () => initializeStripe()
    script.onerror = () => {
      setError('Erro ao carregar Stripe. Verifique sua conexão.')
      setIsLoading(false)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup: don't remove script as other components may use it
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initializeStripe = useCallback(() => {
    if (!window.Stripe || !clientSecret) {
      setIsLoading(false)
      return
    }

    const stripe = window.Stripe(stripePublishableKey)
    stripeRef.current = stripe

    const elements = stripe.elements({ clientSecret })
    elementsRef.current = elements

    const cardElement = elements.create('payment', {
      layout: 'tabs',
    })

    if (cardMountRef.current) {
      cardElement.mount(cardMountRef.current)
    }

    cardElement.on('change', (event) => {
      setCardComplete(event.complete ?? false)
      if (event.error) {
        setError(event.error.message)
      } else {
        setError(null)
      }
    })

    setIsLoading(false)
  }, [clientSecret, stripePublishableKey])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!stripeRef.current || !elementsRef.current) {
      setError('Stripe não foi carregado corretamente.')
      return
    }

    setIsProcessing(true)
    setError(null)

    const { error: confirmError, paymentIntent } =
      await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        confirmParams: {
          return_url: `${window.location.origin}/inscrição/confirmada/${registrationId}`,
        },
        redirect: 'if_required',
      })

    if (confirmError) {
      setError(confirmError.message || 'Erro ao processar pagamento.')
      setIsProcessing(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      router.push(`/inscrição/confirmada/${registrationId}`)
      return
    }

    // For 3D Secure or other redirects, Stripe handles it via return_url
    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Stripe Elements mount point */}
      <div className="rounded-lg border border-border bg-white p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-seasonal-primary border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">
              Carregando formulário de pagamento...
            </span>
          </div>
        )}
        <div ref={cardMountRef} className={isLoading ? 'hidden' : ''} />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || isProcessing || !cardComplete}
        className="w-full rounded-md bg-seasonal-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-seasonal-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isProcessing
          ? 'Processando...'
          : `Pagar ${formatCurrency(amount)}`}
      </button>

      {/* Security note */}
      <p className="text-center text-xs text-muted-foreground">
        Pagamento seguro processado pelo Stripe. Seus dados de cartao não sao
        armazenados em nossos servidores.
      </p>
    </form>
  )
}
