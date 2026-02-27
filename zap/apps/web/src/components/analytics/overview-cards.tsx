/**
 * AC-051.1: Overview Cards Component
 */

'use client'

import { useAnalyticsStore } from '@/stores/analytics'

export function OverviewCards() {
  const { overview } = useAnalyticsStore()

  if (!overview) return <div className="text-gray-600">No data available</div>

  const cards = [
    { label: 'Total Captured', value: overview.captured_count, color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Sent', value: overview.sent_count, color: 'bg-green-50 text-green-700' },
    { label: 'Clicks', value: overview.clicks_count, color: 'bg-purple-50 text-purple-700' },
    { label: 'Conversion Rate', value: `${overview.conversion_rate.toFixed(2)}%`, color: 'bg-orange-50 text-orange-700' },
    { label: 'Revenue', value: `R$ ${overview.estimated_revenue.toFixed(0)}`, color: 'bg-emerald-50 text-emerald-700' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-lg p-4 ${card.color}`}>
          <p className="text-sm font-medium opacity-80">{card.label}</p>
          <p className="mt-2 text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
