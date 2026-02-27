/**
 * AC-051.5: Date Range Filter Component
 */

'use client'

import { useAnalyticsStore } from '@/stores/analytics'

export function DateRangeFilter() {
  const { dateRange, setDateRange } = useAnalyticsStore()

  const handlePreset = (days: number) => {
    const to = new Date()
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
    setDateRange(from, to)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handlePreset(1)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Today
      </button>
      <button
        onClick={() => handlePreset(7)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        7 days
      </button>
      <button
        onClick={() => handlePreset(30)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        30 days
      </button>
      <input
        type="date"
        value={dateRange.from.toISOString().split('T')[0]}
        onChange={(e) => setDateRange(new Date(e.target.value), dateRange.to)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <span className="flex items-center text-gray-500">to</span>
      <input
        type="date"
        value={dateRange.to.toISOString().split('T')[0]}
        onChange={(e) => setDateRange(dateRange.from, new Date(e.target.value))}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  )
}
