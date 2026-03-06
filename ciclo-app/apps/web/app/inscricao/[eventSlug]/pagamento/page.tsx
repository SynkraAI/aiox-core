/**
 * Step 3 — Payment Method Selection (Server Component)
 * Story E3.1 — AC-6, AC-7, AC-9: Payment selection, cross-selling, finalize
 *
 * Server Component loads available rooms for cross-selling (AC-9)
 * and computes event duration for nights selector.
 * Delegates interaction to PaymentStepClient.
 */

import { notFound } from 'next/navigation'
import { prisma } from '@ciclo/database'
import { centavosToReais } from '@ciclo/utils'
import { PaymentStepClient } from '@/registration/payment-step-client'

interface PageProps {
  params: Promise<{ eventSlug: string }>
}

export default async function PaymentPage({ params }: PageProps) {
  const { eventSlug } = await params

  // Load event for date calculation + cancellation policy
  const event = await prisma.event.findFirst({
    where: { slug: eventSlug, isPublished: true, isDeleted: false },
    select: {
      id: true,
      slug: true,
      startDate: true,
      endDate: true,
      cancellationPolicy: true,
    },
  })

  if (!event) notFound()

  // Calculate event duration in nights
  const startMs = event.startDate.getTime()
  const endMs = event.endDate.getTime()
  const eventNights = Math.max(
    1,
    Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24))
  )

  // Load available rooms for cross-selling (AC-9)
  const rooms = await prisma.room.findMany({
    where: { isAvailable: true },
    orderBy: { pricePerNight: 'asc' },
    select: {
      id: true,
      name: true,
      theme: true,
      description: true,
      pricePerNight: true,
      capacity: true,
      isAvailable: true,
    },
  })

  const roomOptions = rooms.map((room) => ({
    ...room,
    priceFormatted: centavosToReais(room.pricePerNight),
  }))

  // Load cancellation policy for display (AC-4: show at checkout)
  let policyNote: string | null = null
  if (event.cancellationPolicy) {
    policyNote = `Cancelamento com +${event.cancellationPolicy.earlyDaysThreshold} dias: ${event.cancellationPolicy.earlyRefundPercent}% reembolso. Transferência ${event.cancellationPolicy.transferAllowed ? 'permitida' : 'não permitida'}.`
  } else {
    const globalPolicy = await prisma.cancellationPolicy.findFirst({
      where: { eventId: null, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    if (globalPolicy) {
      policyNote = `Cancelamento com +${globalPolicy.earlyDaysThreshold} dias: ${globalPolicy.earlyRefundPercent}% reembolso. Transferência ${globalPolicy.transferAllowed ? 'permitida' : 'não permitida'}.`
    }
  }

  return (
    <div>
      <PaymentStepClient
        eventSlug={eventSlug}
        rooms={roomOptions}
        eventNights={eventNights}
      />
      {policyNote && (
        <div className="mx-auto mt-4 max-w-2xl px-4">
          <p className="text-xs text-gray-500 text-center">
            Politica de cancelamento: {policyNote}{' '}
            <a
              href={`/eventos/${event.slug}#cancelamento-heading`}
              className="underline hover:text-gray-700"
            >
              Ver detalhes
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
