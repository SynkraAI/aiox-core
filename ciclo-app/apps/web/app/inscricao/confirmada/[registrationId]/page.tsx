/**
 * Registration Confirmation / Success Page
 * Story E3.2 — AC-8: Registration summary after payment confirmation
 *
 * Displays:
 * - Event name and date
 * - Ticket type
 * - Payment confirmation
 * - QR Code placeholder (actual generation in E3.4)
 * - Link to "Minha Conta"
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@ciclo/database'
import { formatCurrency } from '@ciclo/utils'
import { QRDisplay } from '../../../../components/qrcode/qr-display'

interface PageProps {
  params: Promise<{ registrationId: string }>
}

export default async function ConfirmationPage({ params }: PageProps) {
  const { registrationId } = await params

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      event: {
        select: {
          name: true,
          slug: true,
          startDate: true,
          endDate: true,
          venue: true,
        },
      },
      ticketType: {
        select: { name: true },
      },
      payments: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      accommodation: {
        select: { name: true },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  })

  if (!registration) {
    notFound()
  }

  const payment = registration.payments[0]
  const eventDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const methodLabel: Record<string, string> = {
    PIX: 'PIX',
    BOLETO: 'Boleto Bancário',
    CREDIT_CARD: 'Cartão de Crédito',
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Inscrição Confirmada!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua inscrição foi realizada com sucesso.
        </p>
      </div>

      {/* Registration summary */}
      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Resumo da Inscrição
        </h2>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Participante</span>
            <span className="font-medium text-foreground">{registration.user.name}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground">{registration.user.email}</span>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Evento</span>
              <span className="font-medium text-foreground">{registration.event.name}</span>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Data</span>
            <span className="font-medium text-foreground">
              {eventDate.format(registration.event.startDate)}
              {registration.event.endDate && (
                <> a {eventDate.format(registration.event.endDate)}</>
              )}
            </span>
          </div>

          {registration.event.venue && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Local</span>
              <span className="font-medium text-foreground">{registration.event.venue}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ingresso</span>
            <span className="font-medium text-foreground">{registration.ticketType.name}</span>
          </div>

          {registration.accommodation && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hospedagem</span>
              <span className="font-medium text-foreground">
                {registration.accommodation.name}
                {registration.accommodationNights && (
                  <> ({registration.accommodationNights} {registration.accommodationNights === 1 ? 'noite' : 'noites'})</>
                )}
              </span>
            </div>
          )}

          {payment && (
            <>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pagamento</span>
                  <span className="font-medium text-foreground">
                    {methodLabel[payment.method] || payment.method}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor</span>
                <span className="text-lg font-bold text-seasonal-primary">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR Code (E3.4) */}
      {registration.qrCode ? (
        <div className="mt-6">
          <QRDisplay
            signedPayload={registration.qrCode}
            size={200}
            showCard={true}
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-lg bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Seu QR Code de acesso ao evento será gerado em breve.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Você recebera por email quando estiver pronto.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 space-y-3">
        <Link
          href="/minha-conta/inscrições"
          className="flex w-full items-center justify-center rounded-md bg-seasonal-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-seasonal-primary/90"
        >
          Minha Conta
        </Link>
        <Link
          href="/eventos"
          className="flex w-full items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Ver outros eventos
        </Link>
      </div>
    </div>
  )
}
