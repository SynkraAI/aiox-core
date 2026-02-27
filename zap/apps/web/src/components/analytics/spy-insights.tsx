/**
 * AC-051.4: Spy Insights Component
 */

'use client'

import { useAnalyticsStore } from '@/stores/analytics'

export function SpyInsights() {
  const { spyInsights } = useAnalyticsStore()

  if (!spyInsights) return <div className="text-gray-600">No insights available</div>

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Most Active Groups */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900">Most Active Competitor Groups</h3>
        <div className="mt-4 space-y-2">
          {spyInsights.most_active_groups.slice(0, 5).map((group, idx) => (
            <div key={idx} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">{group.source_group_jid}</span>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          ))}
          {spyInsights.most_active_groups.length === 0 && (
            <p className="text-sm text-gray-500">No data</p>
          )}
        </div>
      </div>

      {/* Peak Times */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900">Peak Offering Times</h3>
        <div className="mt-4 space-y-2">
          {spyInsights.peak_times.slice(0, 5).map((time) => (
            <div key={time.hour_of_day} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">{`${time.hour_of_day}:00 - ${time.hour_of_day + 1}:00`}</span>
              <span className="text-sm font-medium text-gray-900">{time.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Marketplace Preference */}
      <div className="rounded-lg border border-gray-200 p-6 md:col-span-2">
        <h3 className="font-semibold text-gray-900">Marketplace Preference</h3>
        <div className="mt-4 flex gap-6">
          {Object.entries(spyInsights.marketplace_preference).map(([market, count]) => (
            <div key={market} className="text-center">
              <p className="text-2xl font-bold text-blue-600">{count}</p>
              <p className="text-sm capitalize text-gray-600">{market}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
