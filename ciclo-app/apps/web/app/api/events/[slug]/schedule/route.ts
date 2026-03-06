import { NextResponse } from 'next/server'
import { prisma } from '@ciclo/database'

interface ScheduleItem {
  id: string
  time: string
  title: string
  description: string | null
  durationMinutes: number
  facilitator: {
    name: string
    photoUrl: string | null
    specialties: string[]
  } | null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    // Find event by slug
    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        isPublished: true,
        isDeleted: true,
        activities: {
          orderBy: { order: 'asc' },
          include: {
            facilitator: {
              select: {
                name: true,
                photoUrl: true,
                specialties: true,
              },
            },
          },
        },
      },
    })

    if (!event || event.isDeleted || !event.isPublished) {
      return NextResponse.json(
        { error: 'Evento não encontrado.' },
        { status: 404 },
      )
    }

    const schedule: ScheduleItem[] = event.activities.map((activity) => ({
      id: activity.id,
      time: activity.time.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      title: activity.title,
      description: activity.description,
      durationMinutes: activity.durationMinutes,
      facilitator: activity.facilitator
        ? {
            name: activity.facilitator.name,
            photoUrl: activity.facilitator.photoUrl,
            specialties: activity.facilitator.specialties,
          }
        : null,
    }))

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error('[GET /api/events/[slug]/schedule]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 },
    )
  }
}
