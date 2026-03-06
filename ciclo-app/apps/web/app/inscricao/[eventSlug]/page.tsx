/**
 * Step 1 — Ticket Selection (Server Component + Client interactive part)
 * Story E3.1 — AC-1, AC-2: Show event summary + selected ticket + current price
 *
 * Receives ?ticket=ticketTypeId from event page.
 * "Continuar" button navigates to step 2.
 */

import { notFound, redirect } from 'next/navigation'
import { prisma } from '@ciclo/database'
import { calculatePricing, centavosToReais } from '@ciclo/utils'
import { TicketSelectionClient } from '@/registration/ticket-selection-client'

interface PageProps {
  params: Promise<{ eventSlug: string }>
  searchParams: Promise<{ ticket?: string }>
}

export default async function TicketSelectionPage({
  params,
  searchParams,
}: PageProps) {
  const { eventSlug } = await params
  const { ticket: ticketId } = await searchParams

  // Load event with ticket types
  const event = await prisma.event.findFirst({
    where: { slug: eventSlug, isPublished: true, isDeleted: false },
    include: { ticketTypes: true },
  })

  if (!event) notFound()

  // Check if event is sold out
  const allSoldOut =
    event.isSoldOut ||
    event.ticketTypes.every(
      (t) =>
        t.quantityAvailable !== null && t.quantitySold >= t.quantityAvailable
    )

  if (allSoldOut) {
    redirect(`/inscrição/${eventSlug}/esgotado`)
  }

  const now = new Date()

  // Build ticket data for client
  const tickets = event.ticketTypes.map((t) => {
    const { price, tier } = calculatePricing(
      {
        earlyBirdPrice: t.earlyBirdPrice,
        earlyBirdDeadline: t.earlyBirdDeadline,
        regularPrice: t.regularPrice,
        lastMinutePrice: t.lastMinutePrice,
        lastMinuteStart: t.lastMinuteStart,
      },
      now,
    )
    const isSoldOut =
      t.quantityAvailable !== null && t.quantitySold >= t.quantityAvailable

    return {
      id: t.id,
      name: t.name,
      description: t.description,
      includes: t.includes,
      price,
      priceFormatted: centavosToReais(price),
      tier,
      isSoldOut,
      remaining:
        t.quantityAvailable !== null
          ? t.quantityAvailable - t.quantitySold
          : null,
    }
  })

  return (
    <TicketSelectionClient
      eventSlug={eventSlug}
      tickets={tickets}
      preselectedTicketId={ticketId ?? null}
    />
  )
}
