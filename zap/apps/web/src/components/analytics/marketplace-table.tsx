/**
 * AC-051.2: Marketplace Table Component
 */

'use client'

import { useAnalyticsStore } from '@/stores/analytics'

export function MarketplaceTable() {
  const { byMarketplace } = useAnalyticsStore()

  if (!byMarketplace || byMarketplace.length === 0) {
    return <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-600">No marketplace data available</div>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Marketplace</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Captured</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sent</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Clicks</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Conversion Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {byMarketplace.map((row) => (
            <tr key={row.marketplace} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium capitalize text-gray-900">{row.marketplace}</td>
              <td className="px-6 py-4 text-gray-600">{row.captured_count}</td>
              <td className="px-6 py-4 text-gray-600">{row.sent_count}</td>
              <td className="px-6 py-4 text-gray-600">{row.clicks_count}</td>
              <td className="px-6 py-4 text-gray-600">{row.conversion_rate.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
