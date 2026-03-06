import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@ciclo/database'
import { auth } from '@ciclo/auth'
import { formatCurrency } from '@ciclo/utils'

export const metadata: Metadata = {
  title: 'Minhas Inscrições',
  description: 'Veja e gerencie suas inscrições em eventos',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Reembolsada', color: 'bg-blue-100 text-blue-800' },
  TRANSFERRED: { label: 'Transferida', color: 'bg-purple-100 text-purple-800' },
}

export default async function InscriçõesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/minha-conta/inscrições')
  }

  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
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
        },
      },
      ticketType: {
        select: {
          name: true,
        },
      },
      payments: {
        where: { status: 'APPROVED' },
        select: { amount: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Minhas Inscrições
        </h1>
        <p className="text-gray-500 mb-6">
          Você ainda não tem inscrições em eventos.
        </p>
        <Link
          href="/eventos"
          className="inline-block rounded-md bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800"
        >
          Ver Eventos Disponíveis
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Minhas Inscrições
      </h1>

      <div className="space-y-4">
        {registrations.map((reg) => {
          const status = STATUS_LABELS[reg.status] ?? {
            label: reg.status,
            color: 'bg-gray-100 text-gray-800',
          }
          const paidAmount = reg.payments[0]?.amount ?? 0
          const eventDate = new Date(reg.event.startDate)
          const isPast = eventDate < new Date()
          const canManage =
            !isPast &&
            reg.status !== 'CANCELLED' &&
            reg.status !== 'TRANSFERRED' &&
            reg.status !== 'REFUNDED'

          return (
            <div
              key={reg.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {reg.event.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {eventDate.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {reg.event.venue && ` - ${reg.event.venue}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ingresso: {reg.ticketType.name}
                    {paidAmount > 0 && ` | Valor: ${formatCurrency(paidAmount)}`}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="mt-4 flex gap-3">
                {/* E3.4: QR Code link for confirmed registrations */}
                {reg.status === 'CONFIRMED' && reg.qrCode && (
                  <Link
                    href={`/minha-conta/inscrições/${reg.id}/qrcode`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-seasonal-primary hover:text-seasonal-primary/80"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    QR Code
                  </Link>
                )}
                {canManage && (
                  <Link
                    href={`/minha-conta/inscrições/${reg.id}`}
                    className="text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    Gerenciar inscrição
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
