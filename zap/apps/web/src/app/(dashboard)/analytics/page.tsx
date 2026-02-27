/**
 * Analytics Dashboard Page
 * AC-051: Comprehensive analytics dashboard with metrics and spy insights
 */

'use client'

import { useEffect } from 'react'
import { useAnalyticsStore } from '@/stores/analytics'
import { OverviewCards } from '@/components/analytics/overview-cards'
import { MarketplaceTable } from '@/components/analytics/marketplace-table'
import { TrendingProducts } from '@/components/analytics/trending-products'
import { SpyInsights } from '@/components/analytics/spy-insights'
import { DateRangeFilter } from '@/components/analytics/date-range-filter'

export default function AnalyticsDashboard() {
  const { loading, error, fetchAll } = useAnalyticsStore()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Performance metrics and market insights</p>
        </div>
        <DateRangeFilter />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <p className="font-medium">Error loading analytics</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-2">Loading analytics...</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* AC-051.1: Overview Cards */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Performance Overview</h2>
            <OverviewCards />
          </section>

          {/* AC-051.2: Marketplace Breakdown */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Performance by Marketplace</h2>
            <MarketplaceTable />
          </section>

          {/* AC-051.3: Trending Products */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Trending Products</h2>
            <TrendingProducts />
          </section>

          {/* AC-051.4: Spy Insights */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Competitor Insights</h2>
            <SpyInsights />
          </section>
        </>
      )}
    </div>
  )
}
