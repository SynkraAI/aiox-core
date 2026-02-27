/**
 * Zustand store for analytics dashboard state
 * AC-051: Analytics dashboard with date range filtering
 */

import { create } from 'zustand'

export interface OverviewMetrics {
  captured_count: number
  sent_count: number
  clicks_count: number
  conversions_count: number
  conversion_rate: number
  estimated_revenue: number
}

export interface MarketplaceMetrics {
  marketplace: string
  captured_count: number
  sent_count: number
  clicks_count: number
  conversion_rate: number
}

export interface TrendingProduct {
  product_title: string
  marketplace: string
  captured_count: number
  clicks: number
  conversions: number
  estimated_value: number
}

export interface SpyInsights {
  most_active_groups: Array<{ source_group_jid: string }>
  peak_times: Array<{ hour_of_day: number; offer_count: number; percentage: number }>
  marketplace_preference: Record<string, number>
}

export interface AnalyticsStore {
  overview: OverviewMetrics | null
  byMarketplace: MarketplaceMetrics[] | null
  trendingProducts: TrendingProduct[] | null
  spyInsights: SpyInsights | null
  loading: boolean
  error: string | null
  dateRange: { from: Date; to: Date }

  setDateRange: (from: Date, to: Date) => void
  fetchOverview: () => Promise<void>
  fetchByMarketplace: () => Promise<void>
  fetchTrendingProducts: () => Promise<void>
  fetchSpyInsights: () => Promise<void>
  fetchAll: () => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => {
  const getQueryParams = () => {
    const { dateRange } = get()
    return {
      dateFrom: dateRange.from.toISOString(),
      dateTo: dateRange.to.toISOString(),
    }
  }

  return {
    overview: null,
    byMarketplace: null,
    trendingProducts: null,
    spyInsights: null,
    loading: false,
    error: null,
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date(),
    },

    setDateRange: (from: Date, to: Date) => {
      set({ dateRange: { from, to } })
      get().fetchAll() // Refetch all data
    },

    fetchOverview: async () => {
      try {
        set({ loading: true, error: null })
        const params = getQueryParams()
        const response = await fetch(
          `/api/analytics/overview?dateFrom=${params.dateFrom}&dateTo=${params.dateTo}`,
        )
        if (!response.ok) throw new Error('Failed to fetch overview')
        const data = (await response.json()) as OverviewMetrics
        set({ overview: data })
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        set({ loading: false })
      }
    },

    fetchByMarketplace: async () => {
      try {
        set({ loading: true, error: null })
        const params = getQueryParams()
        const response = await fetch(
          `/api/analytics/by-marketplace?dateFrom=${params.dateFrom}&dateTo=${params.dateTo}`,
        )
        if (!response.ok) throw new Error('Failed to fetch marketplace data')
        const data = (await response.json()) as MarketplaceMetrics[]
        set({ byMarketplace: data })
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        set({ loading: false })
      }
    },

    fetchTrendingProducts: async () => {
      try {
        set({ loading: true, error: null })
        const params = getQueryParams()
        const response = await fetch(
          `/api/analytics/trending-products?dateFrom=${params.dateFrom}&dateTo=${params.dateTo}&limit=20`,
        )
        if (!response.ok) throw new Error('Failed to fetch trending products')
        const data = (await response.json()) as TrendingProduct[]
        set({ trendingProducts: data })
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        set({ loading: false })
      }
    },

    fetchSpyInsights: async () => {
      try {
        set({ loading: true, error: null })
        const params = getQueryParams()
        const response = await fetch(
          `/api/analytics/spy-insights?dateFrom=${params.dateFrom}&dateTo=${params.dateTo}`,
        )
        if (!response.ok) throw new Error('Failed to fetch spy insights')
        const data = (await response.json()) as SpyInsights
        set({ spyInsights: data })
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        set({ loading: false })
      }
    },

    fetchAll: async () => {
      set({ loading: true })
      await Promise.all([
        get().fetchOverview(),
        get().fetchByMarketplace(),
        get().fetchTrendingProducts(),
        get().fetchSpyInsights(),
      ])
      set({ loading: false })
    },
  }
})
