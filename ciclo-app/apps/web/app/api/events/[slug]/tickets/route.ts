import { NextResponse } from 'next/server'
import { prisma } from '@ciclo/database'
import { calculatePricing, centavosToReais } from '@ciclo/utils'
import type { TicketPricing, PricingTier } from '@ciclo/utils'

interface TicketResponse {
  id: string
  name: string
  description: string | null
  includes: string[]
  currentPrice: number
  currentPriceFormatted: string
  pricingTier: PricingTier
  quantityAvailable: number | null
  quantitySold: number
  available: boolean
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    // Buscar evento pelo slug
    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        isPublished: true,
        isDeleted: true,
        ticketTypes: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!event || event.isDeleted || !event.isPublished) {
      return NextResponse.json(
        { error: 'Evento não encontrado.' },
        { status: 404 },
      )
    }

    const currentDate = new Date()

    const tickets: TicketResponse[] = event.ticketTypes.map((tt) => {
      const pricing: TicketPricing = {
        earlyBirdPrice: tt.earlyBirdPrice,
        earlyBirdDeadline: tt.earlyBirdDeadline,
        regularPrice: tt.regularPrice,
        lastMinutePrice: tt.lastMinutePrice,
        lastMinuteStart: tt.lastMinuteStart,
      }

      const result = calculatePricing(pricing, currentDate)

      const isAvailable =
        tt.quantityAvailable == null ||
        tt.quantitySold < tt.quantityAvailable

      return {
        id: tt.id,
        name: tt.name,
        description: tt.description,
        includes: tt.includes,
        currentPrice: result.price,
        currentPriceFormatted: centavosToReais(result.price),
        pricingTier: result.tier,
        quantityAvailable: tt.quantityAvailable,
        quantitySold: tt.quantitySold,
        available: isAvailable,
      }
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('[GET /api/events/[slug]/tickets]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 },
    )
  }
}
