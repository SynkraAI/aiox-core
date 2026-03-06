/**
 * Boleto Payment Page (Server Component)
 * Story E3.2 — AC-5: PDF link, barcode copy, instructions, due date
 *
 * Loads registration + payment, initiates Boleto if needed,
 * then delegates to BoletoPaymentClient.
 */

import { notFound, redirect } from 'next/navigation'
import { prisma } from '@ciclo/database'
import { formatCurrency } from '@ciclo/utils'
import { initiatePayment } from '@/actions/payment'
import { BoletoPaymentClient } from '@/payment/boleto-payment-client'

interface PageProps {
  params: Promise<{ registrationId: string }>
}

export default async function BoletoPaymentPage({ params }: PageProps) {
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

  if (payment.method !== 'BOLETO') {
    redirect(`/pagamento/${registrationId}/${payment.method === 'PIX' ? 'pix' : 'card'}`)
  }

  if (registration.status === 'CONFIRMED' || payment.status === 'APPROVED') {
    redirect(`/inscrição/confirmada/${registrationId}`)
  }

  // Initiate Boleto if not yet initiated
  let boletoData = {
    boletoUrl: '',
    boletoCode: '',
    boletoDueDate: '',
  }

  if (!payment.mercadoPagoId) {
    const result = await initiatePayment({
      registrationId,
      paymentId: payment.id,
    })

    if (!result.success) {
      return (
        <div className="mx-auto max-w-lg p-6">
          <h1 className="text-xl font-bold text-destructive">Erro ao gerar Boleto</h1>
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

    boletoData = {
      boletoUrl: result.boletoUrl || '',
      boletoCode: result.boletoCode || '',
      boletoDueDate: result.boletoDueDate || '',
    }
  } else {
    boletoData = {
      boletoUrl: payment.boletoUrl || '',
      boletoCode: '', // Not stored in DB; user can use PDF
      boletoDueDate: payment.expiresAt?.toISOString() || '',
    }
  }

  // Format due date
  const dueDate = boletoData.boletoDueDate
    ? new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(boletoData.boletoDueDate))
    : 'Em até 3 dias úteis'

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-xl font-bold text-foreground">Pagamento via Boleto</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {registration.event.name} — {registration.ticketType.name}
      </p>
      <p className="mt-2 text-lg font-semibold text-seasonal-primary">
        {formatCurrency(payment.amount)}
      </p>

      <BoletoPaymentClient
        boletoUrl={boletoData.boletoUrl}
        boletoCode={boletoData.boletoCode}
        dueDate={dueDate}
        paymentId={payment.id}
        registrationId={registrationId}
      />
    </div>
  )
}
