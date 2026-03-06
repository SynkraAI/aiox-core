'use client'

/**
 * Client component for Step 1 — Ticket Selection
 * Story E3.1 — AC-2: Confirm ticket with visible price, "Continuar" button
 */

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRegistration } from '@/registration/registration-provider'
import type { PricingTier } from '@ciclo/utils'

interface TicketOption {
  id: string
  name: string
  description: string | null
  includes: string[]
  price: number
  priceFormatted: string
  tier: PricingTier
  isSoldOut: boolean
  remaining: number | null
}

interface TicketSelectionClientProps {
  eventSlug: string
  tickets: TicketOption[]
  preselectedTicketId: string | null
}

const TIER_LABELS: Record<string, string> = {
  early_bird: 'Early Bird',
  regular: 'Regular',
  last_minute: 'Última Hora',
}

export function TicketSelectionClient({
  eventSlug,
  tickets,
  preselectedTicketId,
}: TicketSelectionClientProps) {
  const router = useRouter()
  const { data, updateData } = useRegistration()

  // Initialize selection from URL param or existing state
  const [selectedId, setSelectedId] = useState<string>(
    data.ticketTypeId || preselectedTicketId || ''
  )

  // Sync preselected ticket on mount
  useEffect(() => {
    if (preselectedTicketId && !data.ticketTypeId) {
      setSelectedId(preselectedTicketId)
    }
  }, [preselectedTicketId, data.ticketTypeId])

  const selectedTicket = tickets.find((t) => t.id === selectedId)

  function handleContinue() {
    if (!selectedTicket || selectedTicket.isSoldOut) return

    updateData({
      ticketTypeId: selectedTicket.id,
      ticketName: selectedTicket.name,
      ticketPrice: selectedTicket.price,
      pricingTier: selectedTicket.tier,
    })

    router.push(`/inscrição/${eventSlug}/dados`)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        Selecione seu ingresso
      </h2>

      <div className="mt-4 space-y-3">
        {tickets.map((ticket) => (
          <label
            key={ticket.id}
            className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
              ticket.isSoldOut
                ? 'cursor-not-allowed border-muted bg-muted/20 opacity-60'
                : selectedId === ticket.id
                  ? 'border-seasonal-primary bg-seasonal-primary/5 ring-1 ring-seasonal-primary'
                  : 'border-border bg-card hover:border-seasonal-primary/50'
            }`}
          >
            <input
              type="radio"
              name="ticket"
              value={ticket.id}
              checked={selectedId === ticket.id}
              onChange={() => setSelectedId(ticket.id)}
              disabled={ticket.isSoldOut}
              className="mt-1 accent-seasonal-primary"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-semibold text-card-foreground">
                    {ticket.name}
                  </span>
                  {ticket.tier !== 'regular' && (
                    <span
                      className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        ticket.tier === 'early_bird'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {TIER_LABELS[ticket.tier]}
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-foreground">
                  {ticket.priceFormatted}
                </span>
              </div>

              {ticket.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {ticket.description}
                </p>
              )}

              {ticket.includes.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {ticket.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5 text-xs text-muted-foreground"
                    >
                      <span className="mt-0.5 text-seasonal-primary">*</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {ticket.isSoldOut ? (
                <span className="mt-2 inline-block text-xs font-medium text-destructive">
                  Esgotado
                </span>
              ) : ticket.remaining !== null && ticket.remaining <= 10 ? (
                <span className="mt-2 inline-block text-xs font-medium text-orange-600">
                  Apenas {ticket.remaining} vagas restantes
                </span>
              ) : null}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={handleContinue}
          disabled={!selectedTicket || selectedTicket.isSoldOut}
          className="w-full rounded-md bg-seasonal-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-seasonal-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
