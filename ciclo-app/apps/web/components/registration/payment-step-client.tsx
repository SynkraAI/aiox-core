'use client'

/**
 * Client component for Step 3 — Payment Method Selection + Cross-selling
 * Story E3.1 — AC-6, AC-7, AC-9: Payment options, Sun House rooms, order summary
 */

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useRegistration } from '@/registration/registration-provider'
import { createRegistration } from '@/actions/registration'
import { centavosToReais } from '@ciclo/utils'
import type { PaymentMethod } from '@ciclo/database'

interface RoomOption {
  id: string
  name: string
  theme: string | null
  description: string | null
  pricePerNight: number // centavos
  priceFormatted: string
  capacity: number
  isAvailable: boolean
}

interface PaymentStepClientProps {
  eventSlug: string
  rooms: RoomOption[]
  eventNights: number
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  {
    value: 'PIX',
    label: 'PIX',
    description: 'Pagamento instantâneo. Confirmação imediata.',
  },
  {
    value: 'BOLETO',
    label: 'Boleto Bancário',
    description: 'Pagamento em até 3 dias úteis.',
  },
  {
    value: 'CREDIT_CARD',
    label: 'Cartão de Crédito',
    description: 'Parcelamento disponível via Stripe.',
  },
]

export function PaymentStepClient({
  eventSlug,
  rooms,
  eventNights,
}: PaymentStepClientProps) {
  const router = useRouter()
  const { data, updateData, clearData } = useRegistration()
  const [isPending, startTransition] = useTransition()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(
    data.paymentMethod || ''
  )
  const [selectedRoom, setSelectedRoom] = useState<string>(
    data.accommodationId || ''
  )
  const [nights, setNights] = useState(data.accommodationNights || eventNights || 1)
  const [error, setError] = useState<string | null>(null)

  // Compute totals
  const ticketTotal = data.ticketPrice
  const selectedRoomData = rooms.find((r) => r.id === selectedRoom)
  const accommodationTotal = selectedRoomData
    ? selectedRoomData.pricePerNight * nights
    : 0
  const grandTotal = ticketTotal + accommodationTotal

  function handleRoomToggle(roomId: string) {
    if (selectedRoom === roomId) {
      setSelectedRoom('')
      updateData({
        accommodationId: '',
        accommodationNights: 0,
        accommodationPrice: 0,
        accommodationName: '',
      })
    } else {
      const room = rooms.find((r) => r.id === roomId)
      if (room) {
        setSelectedRoom(roomId)
        updateData({
          accommodationId: roomId,
          accommodationNights: nights,
          accommodationPrice: room.pricePerNight,
          accommodationName: room.name,
        })
      }
    }
  }

  function handleNightsChange(value: number) {
    const clamped = Math.max(1, Math.min(value, eventNights || 7))
    setNights(clamped)
    if (selectedRoomData) {
      updateData({ accommodationNights: clamped })
    }
  }

  function handleFinalize() {
    if (!paymentMethod) {
      setError('Selecione um método de pagamento.')
      return
    }

    setError(null)

    startTransition(async () => {
      const result = await createRegistration({
        eventSlug,
        ticketTypeId: data.ticketTypeId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        dietaryRestrictions: data.dietaryRestrictions || undefined,
        isFirstTime: data.isFirstTime ?? undefined,
        paymentMethod,
        accommodationId: selectedRoom || undefined,
        accommodationNights: selectedRoom ? nights : undefined,
      })

      if (!result.success) {
        if (result.waitlistAvailable) {
          router.push(`/inscrição/${eventSlug}/esgotado`)
          return
        }
        setError(result.error || 'Erro ao criar inscrição.')
        return
      }

      // Clear session data
      clearData()

      // Redirect to payment page per method (E3.2)
      const methodPath =
        paymentMethod === 'PIX'
          ? 'pix'
          : paymentMethod === 'BOLETO'
            ? 'boleto'
            : 'card'
      router.push(`/pagamento/${result.registrationId}/${methodPath}`)
    })
  }

  function handleBack() {
    updateData({ paymentMethod })
    router.push(`/inscrição/${eventSlug}/dados`)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        Pagamento
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha a forma de pagamento e finalize sua inscrição.
      </p>

      {/* Cross-selling Sun House rooms (AC-9) */}
      {rooms.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">
            Hospedagem Sun House
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Adicione hospedagem ao seu pacote (opcional).
          </p>

          <div className="mt-3 space-y-3">
            {rooms.map((room) => (
              <label
                key={room.id}
                className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                  !room.isAvailable
                    ? 'cursor-not-allowed border-muted bg-muted/20 opacity-60'
                    : selectedRoom === room.id
                      ? 'border-seasonal-primary bg-seasonal-primary/5 ring-1 ring-seasonal-primary'
                      : 'border-border bg-card hover:border-seasonal-primary/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRoom === room.id}
                  onChange={() => handleRoomToggle(room.id)}
                  disabled={!room.isAvailable}
                  className="mt-1 accent-seasonal-primary"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-card-foreground">
                        {room.name}
                      </span>
                      {room.theme && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {room.theme}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {room.priceFormatted}/noite
                    </span>
                  </div>
                  {room.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {room.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Capacidade: {room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}
                  </p>
                  {!room.isAvailable && (
                    <span className="mt-1 inline-block text-xs font-medium text-destructive">
                      Indisponível
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Nights selector (only if a room is selected) */}
          {selectedRoom && (
            <div className="mt-3 flex items-center gap-3">
              <label
                htmlFor="nights"
                className="text-sm font-medium text-foreground"
              >
                Noites:
              </label>
              <input
                id="nights"
                type="number"
                min={1}
                max={eventNights || 7}
                value={nights}
                onChange={(e) => handleNightsChange(parseInt(e.target.value, 10) || 1)}
                className="w-20 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus:border-seasonal-primary focus:outline-none focus:ring-1 focus:ring-seasonal-primary"
              />
            </div>
          )}
        </div>
      )}

      {/* Payment method selection (AC-6) */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground">
          Método de pagamento
        </h3>
        <div className="mt-3 space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.value}
              className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                paymentMethod === method.value
                  ? 'border-seasonal-primary bg-seasonal-primary/5 ring-1 ring-seasonal-primary'
                  : 'border-border bg-card hover:border-seasonal-primary/50'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={() => setPaymentMethod(method.value)}
                className="mt-1 accent-seasonal-primary"
              />
              <div>
                <span className="font-semibold text-card-foreground">
                  {method.label}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {method.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="mt-8 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Resumo do pedido
        </h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{data.ticketName}</span>
            <span className="font-medium text-foreground">
              {centavosToReais(ticketTotal)}
            </span>
          </div>
          {selectedRoomData && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {selectedRoomData.name} ({nights} {nights === 1 ? 'noite' : 'noites'})
              </span>
              <span className="font-medium text-foreground">
                {centavosToReais(accommodationTotal)}
              </span>
            </div>
          )}
          <div className="border-t border-border pt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-seasonal-primary">
                {centavosToReais(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={isPending}
          className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleFinalize}
          disabled={isPending || !paymentMethod}
          className="rounded-md bg-seasonal-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-seasonal-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Processando...' : 'Finalizar Inscrição'}
        </button>
      </div>
    </div>
  )
}
