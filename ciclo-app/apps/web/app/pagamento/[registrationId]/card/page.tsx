/**
 * Card Payment Page (Server Component)
 * Story E3.2 — AC-6: Stripe Elements card form
 *
 * Loads registration + payment, creates PaymentIntent if needed,
 * passes clientSecret to CardPaymentClient which loads Stripe.js from CDN.
 */

import { notFound, redirect } from 'next/navigation'
import { prisma } from '@ciclo/database'
import { formatCurrency } from '@ciclo/utils'
import { initiatePayment } from '@/actions/payment'
import { CardPaymentClient } from '@/payment/card-payment-client'

interface PageProps {
  params: Promise<{ registrationId: string }>
}

export default async function CardPaymentPage({ params }: PageProps) {
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

  if (payment.method !== 'CREDIT_CARD') {
    redirect(`/pagamento/${registrationId}/${payment.method === 'PIX' ? 'pix' : 'boleto'}`)
  }

  if (registration.status === 'CONFIRMED' || payment.status === 'APPROVED') {
    redirect(`/inscrição/confirmada/${registrationId}`)
  }

  // Create PaymentIntent if not yet created
  let clientSecret = ''

  if (!payment.stripeId) {
    const result = await initiatePayment({
      registrationId,
      paymentId: payment.id,
    })

    if (!result.success) {
      return (
        <div className="mx-auto max-w-lg p-6">
          <h1 className="text-xl font-bold text-destructive">Erro ao processar cartao</h1>
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

    clientSecret = result.clientSecret || ''
  }

  // STRIPE_PUBLISHABLE_KEY is safe for client — it's the public key
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

  if (!stripePublishableKey) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <h1 className="text-xl font-bold text-destructive">Configuração incompleta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chave pública do Stripe não configurada. Contate o administrador.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-xl font-bold text-foreground">Pagamento com Cartão</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {registration.event.name} — {registration.ticketType.name}
      </p>
      <p className="mt-2 text-lg font-semibold text-seasonal-primary">
        {formatCurrency(payment.amount)}
      </p>

      <CardPaymentClient
        clientSecret={clientSecret}
        stripePublishableKey={stripePublishableKey}
        amount={payment.amount}
        registrationId={registrationId}
      />
    </div>
  )
}
