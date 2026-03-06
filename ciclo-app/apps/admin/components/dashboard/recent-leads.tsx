'use client'

import { Badge } from '@ciclo/ui'
import { SEASON_LABELS } from '../../lib/constants'
import type { RecentLeadItem } from '../../lib/actions/dashboard'

interface RecentLeadsProps {
  leads: RecentLeadItem[]
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-base-dark/40">Nenhum lead recente</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-base-dark/10">
            <th className="pb-2 text-left font-medium text-base-dark/60">Email</th>
            <th className="pb-2 text-left font-medium text-base-dark/60">Estações de Interesse</th>
            <th className="pb-2 text-right font-medium text-base-dark/60">Data</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-base-dark/5 last:border-0">
              <td className="py-2 text-base-dark truncate max-w-[180px]">{lead.email}</td>
              <td className="py-2">
                <div className="flex flex-wrap gap-1">
                  {lead.interestedSeasons.length > 0 ? (
                    lead.interestedSeasons.map((season) => (
                      <Badge key={season} variant="secondary" className="text-[10px]">
                        {SEASON_LABELS[season] ?? season}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-base-dark/40">--</span>
                  )}
                </div>
              </td>
              <td className="py-2 text-right text-base-dark/60 text-xs">
                {formatDate(lead.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
