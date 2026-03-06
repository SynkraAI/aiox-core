'use client'

import { Badge } from '@ciclo/ui'
import { formatCurrency } from '@ciclo/utils'
import type { RecentRegistrationItem } from '../../lib/actions/dashboard'

interface RecentRegistrationsProps {
  registrations: RecentRegistrationItem[]
}

const STATUS_STYLES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendente', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmada', variant: 'default' },
  CANCELLED: { label: 'Cancelada', variant: 'destructive' },
  REFUNDED: { label: 'Reembolsada', variant: 'outline' },
  TRANSFERRED: { label: 'Transferida', variant: 'outline' },
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `${diffMins}min atras`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h atras`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'ontem'
  return `${diffDays}d atras`
}

export function RecentRegistrations({ registrations }: RecentRegistrationsProps) {
  if (registrations.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-base-dark/40">Nenhuma inscrição recente</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-base-dark/10">
            <th className="pb-2 text-left font-medium text-base-dark/60">Participante</th>
            <th className="pb-2 text-left font-medium text-base-dark/60">Evento</th>
            <th className="pb-2 text-left font-medium text-base-dark/60 hidden sm:table-cell">Ingresso</th>
            <th className="pb-2 text-right font-medium text-base-dark/60">Valor</th>
            <th className="pb-2 text-center font-medium text-base-dark/60">Status</th>
            <th className="pb-2 text-right font-medium text-base-dark/60 hidden md:table-cell">Quando</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => {
            const statusInfo = STATUS_STYLES[reg.status] ?? { label: reg.status, variant: 'secondary' as const }

            return (
              <tr key={reg.id} className="border-b border-base-dark/5 last:border-0">
                <td className="py-2 text-base-dark">{reg.userName}</td>
                <td className="py-2 text-base-dark/80 truncate max-w-[120px]">{reg.eventName}</td>
                <td className="py-2 text-base-dark/60 hidden sm:table-cell">{reg.ticketName}</td>
                <td className="py-2 text-right text-base-dark font-medium">
                  {formatCurrency(reg.amount)}
                </td>
                <td className="py-2 text-center">
                  <Badge variant={statusInfo.variant} className="text-[10px]">
                    {statusInfo.label}
                  </Badge>
                </td>
                <td className="py-2 text-right text-base-dark/40 text-xs hidden md:table-cell">
                  {formatRelativeTime(reg.createdAt)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
