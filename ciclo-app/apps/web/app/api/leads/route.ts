import { NextResponse } from 'next/server'
import { prisma } from '@ciclo/database'

interface LeadPayload {
  name?: string
  email: string
  phone?: string
  interestedSeasons?: string[]
  source?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadPayload

    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Email válido é obrigatório.' },
        { status: 400 },
      )
    }

    const email = body.email.toLowerCase().trim()
    const interestedSeasons = body.interestedSeasons ?? []

    // Check if lead already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email },
    })

    if (existingLead) {
      // Merge interested seasons (union of existing + new)
      const existingSeasons = new Set(existingLead.interestedSeasons)
      for (const season of interestedSeasons) {
        existingSeasons.add(season)
      }

      await prisma.lead.update({
        where: { email },
        data: {
          interestedSeasons: Array.from(existingSeasons),
          ...(body.name && !existingLead.name ? { name: body.name } : {}),
          ...(body.phone && !existingLead.phone ? { phone: body.phone } : {}),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Você já está em nossa lista! Atualizamos suas preferências.',
        isExisting: true,
      })
    }

    // Create new lead
    await prisma.lead.create({
      data: {
        email,
        name: body.name?.trim() || null,
        phone: body.phone?.trim() || null,
        source: body.source ?? 'landing-page',
        utmSource: body.utmSource ?? null,
        utmMedium: body.utmMedium ?? null,
        utmCampaign: body.utmCampaign ?? null,
        interestedSeasons,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Interesse registrado com sucesso! Em breve você recebera novidades.',
      isExisting: false,
    })
  } catch (error) {
    console.error(
      `Failed to process lead: ${error instanceof Error ? error.message : 'Unknown'}`,
    )
    return NextResponse.json(
      { success: false, message: 'Erro ao processar sua solicitação. Tente novamente.' },
      { status: 500 },
    )
  }
}
