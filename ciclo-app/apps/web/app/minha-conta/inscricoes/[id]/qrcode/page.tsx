/**
 * Full-Screen QR Code Page
 * Story E3.4 — AC-4: Large QR display for scanning at event entrance
 *
 * Accessible from /minha-conta/inscrições/[id]/qrcode
 * Shows large QR code optimized for scanning by facilitators.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@ciclo/database'
import { auth } from '@ciclo/auth'
import { QRDisplay } from '../../../../../components/qrcode/qr-display'

export const metadata: Metadata = {
  title: 'QR Code - Ingresso Digital',
  description: 'Apresente este QR Code na entrada do evento',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QRCodePage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/minha-conta/inscrições')
  }

  const { id } = await params

  const registration = await prisma.registration.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
      qrCode: true,
      event: {
        select: {
          name: true,
          startDate: true,
        },
      },
    },
  })

  if (!registration) {
    notFound()
  }

  // Only the owner can view their QR code on this page
  if (registration.userId !== session.user.id) {
    redirect('/minha-conta/inscrições')
  }

  if (registration.status !== 'CONFIRMED') {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <h1 className="text-xl font-bold text-foreground mb-4">
          QR Code Indisponível
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          O QR Code só está disponível para inscrições confirmadas.
          Status atual: {registration.status}
        </p>
        <Link
          href="/minha-conta/inscrições"
          className="text-sm font-medium text-seasonal-primary hover:text-seasonal-primary/80"
        >
          Voltar para inscrições
        </Link>
      </div>
    )
  }

  if (!registration.qrCode) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <h1 className="text-xl font-bold text-foreground mb-4">
          QR Code em Geração
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Seu QR Code está sendo gerado. Tente novamente em alguns instantes.
        </p>
        <Link
          href="/minha-conta/inscrições"
          className="text-sm font-medium text-seasonal-primary hover:text-seasonal-primary/80"
        >
          Voltar para inscrições
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/minha-conta/inscrições" className="hover:text-foreground">
          Minhas Inscrições
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">QR Code</span>
      </nav>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-foreground">
          {registration.event.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(registration.event.startDate).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <QRDisplay
        signedPayload={registration.qrCode}
        size={280}
        showCard={true}
      />

      <div className="mt-8 text-center">
        <Link
          href={`/minha-conta/inscrições/${registration.id}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Voltar para detalhes da inscrição
        </Link>
      </div>
    </div>
  )
}
