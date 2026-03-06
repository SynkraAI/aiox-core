/**
 * PIX Payment Page (Server Component)
 * Story E3.2 — AC-4: QR Code + Copia e Cola + Countdown + Polling
 *
 * Loads registration + payment data, initiates PIX if needed,
 * then delegates to PixPaymentClient for interactive elements.
 */

import { notFound, redirect } from 'next/navigation'
import { prisma } from '@ciclo/database'
import { formatCurrency } from '@ciclo/utils'
import { initiatePayment } from '@/actions/payment'
import { PixPaymentClient } from '@/payment/pix-payment-client'

interface PageProps {
  params: Promise<{ registrationId: string }>
}

export default async function PixPaymentPage({ params }: PageProps) {
  const { registrationId } = await params

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      event: {
        select: { name: true, slug: true },
      },
      ticketType: {
        select: { name: true },
      },
    },
  })

  if (!registration || registration.payments.length === 0) {
    notFound()
  }

  const payment = registration.payments[0]!

  if (payment.method !== 'PIX') {
    redirect(`/pagamento/${registrationId}/${payment.method === 'BOLETO' ? 'boleto' : 'card'}`)
  }

  // If already confirmed, redirect to success
  if (registration.status === 'CONFIRMED' || payment.status === 'APPROVED') {
    redirect(`/inscrição/confirmada/${registrationId}`)
  }

  // Initiate PIX payment if not yet initiated
  let pixData = {
    pixCopiaECola: '',
    pixQrCodeBase64: '',
    expiresAt: '',
    externalId: '',
  }

  if (!payment.mercadoPagoId) {
    const result = await initiatePayment({
      registrationId,
      paymentId: payment.id,
    })

    if (!result.success) {
      return (
        <div className="mx-auto max-w-lg p-6">
          <h1 className="text-xl font-bold text-destructive">Erro ao gerar PIX</h1>
          <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
          <a
            href={`/inscrição/${registration.event.slug}/pagamento`}
            className="mt-4 inline-block text-sm text-seasonal-primary underline"
          >
            Tentar novamente
          </a>
        </div>
      )
    }

    pixData = {
      pixCopiaECola: result.pixCopiaECola || '',
      pixQrCodeBase64: result.pixQrCodeBase64 || '',
      expiresAt: result.expiresAt || '',
      externalId: result.externalId || '',
    }
  } else {
    pixData = {
      pixCopiaECola: payment.pixKey || '',
      pixQrCodeBase64: '', // Base64 not stored; client can regenerate
      expiresAt: payment.expiresAt?.toISOString() || '',
      externalId: payment.mercadoPagoId,
    }
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-xl font-bold text-foreground">Pagamento via PIX</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {registration.event.name} — {registration.ticketType.name}
      </p>
      <p className="mt-2 text-lg font-semibold text-seasonal-primary">
        {formatCurrency(payment.amount)}
      </p>

      <PixPaymentClient
        paymentId={payment.id}
        registrationId={registrationId}
        pixCopiaECola={pixData.pixCopiaECola}
        pixQrCodeBase64={pixData.pixQrCodeBase64}
        expiresAt={pixData.expiresAt}
        amount={payment.amount}
      />
    </div>
  )
}
