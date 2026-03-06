import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@ciclo/database'
import { auth } from '@ciclo/auth'
import {
  formatCurrency,
  calculateRefund,
  dbPolicyToDomain,
} from '@ciclo/utils'
import { CancelRegistrationForm } from './cancel-form'
import { TransferRegistrationForm } from './transfer-form'

export const metadata: Metadata = {
  title: 'Detalhes da Inscrição',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RegistrationDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/minha-conta/inscrições')
  }

  const { id } = await params

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          slug: true,
          startDate: true,
          endDate: true,
          venue: true,
          season: true,
          cancellationPolicy: true,
        },
      },
      ticketType: {
        select: { name: true },
      },
      payments: {
        where: { status: 'APPROVED' },
        select: { amount: true },
        take: 1,
      },
    },
  })

  if (!registration) {
    notFound()
  }

  // Verificar que pertence ao usuario
  if (registration.userId !== session.user.id) {
    redirect('/minha-conta/inscrições')
  }

  const paidAmount = registration.payments[0]?.amount ?? 0
  const eventDate = new Date(registration.event.startDate)
  const now = new Date()
  const isPast = eventDate < now
  const canCancel =
    !isPast &&
    registration.status !== 'CANCELLED' &&
    registration.status !== 'TRANSFERRED' &&
    registration.status !== 'REFUNDED'
  const canTransfer = canCancel

  // Calcular preview do reembolso
  let refundPreview = { refundPercent: 0, refundAmount: 0 }

  if (canCancel && paidAmount > 0) {
    // Carregar política (evento override ou global)
    let policy = null

    if (registration.event.cancellationPolicy) {
      policy = dbPolicyToDomain(registration.event.cancellationPolicy)
    } else {
      const globalPolicy = await prisma.cancellationPolicy.findFirst({
        where: { eventId: null, isActive: true },
        orderBy: { createdAt: 'desc' },
      })
      if (globalPolicy) {
        policy = dbPolicyToDomain(globalPolicy)
      }
    }

    if (policy) {
      const result = calculateRefund(eventDate, now, policy, paidAmount)
      refundPreview = {
        refundPercent: result.refundPercent,
        refundAmount: result.refundAmount,
      }
    }
  }

  const daysUntilEvent = Math.max(
    0,
    Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )

  // Carregar regras da política para exibição
  let policyRules: Array<{ daysBeforeEvent: number; refundPercent: number }> = []
  let transferAllowed = true

  if (registration.event.cancellationPolicy) {
    const p = dbPolicyToDomain(registration.event.cancellationPolicy)
    policyRules = p.rules
    transferAllowed = p.transferAlwaysAllowed
  } else {
    const globalPolicy = await prisma.cancellationPolicy.findFirst({
      where: { eventId: null, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    if (globalPolicy) {
      const p = dbPolicyToDomain(globalPolicy)
      policyRules = p.rules
      transferAllowed = p.transferAlwaysAllowed
    }
  }

  return (
    <div>
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/minha-conta/inscrições" className="hover:text-gray-700">
          Minhas Inscrições
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Detalhes</span>
      </nav>

      {/* Informações da inscrição */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          {registration.event.name}
        </h1>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Data do Evento</dt>
            <dd className="text-sm text-gray-900">
              {eventDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          {registration.event.venue && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Local</dt>
              <dd className="text-sm text-gray-900">{registration.event.venue}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Ingresso</dt>
            <dd className="text-sm text-gray-900">{registration.ticketType.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Valor Pago</dt>
            <dd className="text-sm text-gray-900">
              {paidAmount > 0 ? formatCurrency(paidAmount) : 'Pagamento pendente'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="text-sm text-gray-900 font-semibold">
              {registration.status === 'PENDING' && 'Pendente'}
              {registration.status === 'CONFIRMED' && 'Confirmada'}
              {registration.status === 'CANCELLED' && 'Cancelada'}
              {registration.status === 'REFUNDED' && 'Reembolsada'}
              {registration.status === 'TRANSFERRED' && 'Transferida'}
            </dd>
          </div>
          {canCancel && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Dias até o Evento</dt>
              <dd className="text-sm text-gray-900">{daysUntilEvent} dias</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Politica de cancelamento */}
      {canCancel && policyRules.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Política de Cancelamento
          </h2>
          <div className="space-y-2">
            {[...policyRules]
              .sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent)
              .map((rule, i) => (
                <div
                  key={i}
                  className={`flex justify-between text-sm ${
                    daysUntilEvent >= rule.daysBeforeEvent &&
                    (i === 0 ||
                      daysUntilEvent <
                        [...policyRules].sort(
                          (a, b) => b.daysBeforeEvent - a.daysBeforeEvent
                        )[i - 1]?.daysBeforeEvent ?? 0)
                      ? 'font-semibold text-green-700 bg-green-50 rounded px-2 py-1'
                      : 'text-gray-600'
                  }`}
                >
                  <span>
                    {rule.daysBeforeEvent > 0
                      ? `+${rule.daysBeforeEvent} dias antes do evento`
                      : `Menos de ${[...policyRules].sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent).find((r) => r.daysBeforeEvent > 0 && r !== rule)?.daysBeforeEvent ?? 7} dias`}
                  </span>
                  <span>{rule.refundPercent}% de reembolso</span>
                </div>
              ))}
            {transferAllowed && (
              <p className="text-sm text-gray-500 mt-2">
                Transferência para outra pessoa: sempre permitida, sem custo.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Preview de reembolso */}
      {canCancel && paidAmount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">
            Previa de Reembolso
          </h2>
          <p className="text-sm text-amber-800">
            Se você cancelar agora ({daysUntilEvent} dias antes do evento):
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-2">
            {refundPreview.refundPercent}% = {formatCurrency(refundPreview.refundAmount)}
          </p>
          {refundPreview.refundPercent === 0 && (
            <p className="text-sm text-amber-700 mt-1">
              Nenhum reembolso disponível nesta faixa de dias.
            </p>
          )}
        </div>
      )}

      {/* Acoes */}
      {canCancel && (
        <div className="space-y-6">
          {/* Cancelamento */}
          <div className="rounded-lg border border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Cancelar Inscrição
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Ao cancelar, sua vaga será liberada. O reembolso (se aplicavel) sera
              processado pelo administrador.
            </p>
            <CancelRegistrationForm
              registrationId={registration.id}
              refundAmount={refundPreview.refundAmount}
              refundPercent={refundPreview.refundPercent}
            />
          </div>

          {/* Transferência */}
          {canTransfer && transferAllowed && (
            <div className="rounded-lg border border-blue-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Transferir Inscrição
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Transfira sua inscrição para outra pessoa sem custo adicional.
                A pessoa recebera um email com os detalhes.
              </p>
              <TransferRegistrationForm registrationId={registration.id} />
            </div>
          )}
        </div>
      )}

      {/* Status final para inscrições já canceladas/transferidas */}
      {!canCancel && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-gray-600">
            {registration.status === 'CANCELLED' &&
              'Esta inscrição foi cancelada.'}
            {registration.status === 'TRANSFERRED' &&
              'Esta inscrição foi transferida para outra pessoa.'}
            {registration.status === 'REFUNDED' &&
              'Esta inscrição foi reembolsada.'}
            {isPast && registration.status === 'CONFIRMED' &&
              'Este evento já ocorreu.'}
          </p>
          <Link
            href="/minha-conta/inscrições"
            className="mt-4 inline-block text-sm font-medium text-green-700 hover:text-green-800"
          >
            Voltar para inscrições
          </Link>
        </div>
      )}
    </div>
  )
}
