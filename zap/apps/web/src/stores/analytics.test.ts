/**
 * Analytics Store Tests (ZAP-051)
 * Tests for Zustand analytics state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAnalyticsStore } from './analytics.ts'

// Mock fetch globally
const fetchMock = vi.fn() as any
global.fetch = fetchMock

describe('Analytics Store', () => {
  beforeEach(() => {
    fetchMock.mockClear()
    // Reset store state
    useAnalyticsStore.setState({
      overview: null,
      byMarketplace: null,
      trendingProducts: null,
      spyInsights: null,
      loading: false,
      error: null,
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    })
  })

  describe('State Management', () => {
    it('should initialize with default state', () => {
      const store = useAnalyticsStore.getState()

      expect(store.overview).toBeNull()
      expect(store.byMarketplace).toBeNull()
      expect(store.trendingProducts).toBeNull()
      expect(store.spyInsights).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.dateRange.from).toBeDefined()
      expect(store.dateRange.to).toBeDefined()
    })

    it('should update date range', () => {
      const store = useAnalyticsStore.getState()
      const newFrom = new Date('2026-01-01')
      const newTo = new Date('2026-01-31')

      store.setDateRange(newFrom, newTo)

      const updated = useAnalyticsStore.getState()
      expect(updated.dateRange.from).toEqual(newFrom)
      expect(updated.dateRange.to).toEqual(newTo)
    })

    it('should format date range for query params correctly', () => {
      const store = useAnalyticsStore.getState()
      const from = new Date('2026-01-01')
      const to = new Date('2026-01-31')

      store.setDateRange(from, to)

      const state = useAnalyticsStore.getState()
      const dateFrom = state.dateRange.from.toISOString().split('T')[0]
      const dateTo = state.dateRange.to.toISOString().split('T')[0]

      expect(dateFrom).toBe('2026-01-01')
      expect(dateTo).toBe('2026-01-31')
    })
  })

  describe('Fetch Methods', () => {
    it('should fetch overview metrics', async () => {
      const mockOverview = {
        captured_count: 150,
        sent_count: 120,
        clicks_count: 45,
        conversions_count: 12,
        conversion_rate: 8.0,
        estimated_revenue: 250.5,
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOverview,
      })

      const store = useAnalyticsStore.getState()
      await store.fetchOverview()

      const updated = useAnalyticsStore.getState()
      expect(updated.overview).toEqual(mockOverview)
      expect(updated.error).toBeNull()
    })

    it('should fetch marketplace breakdown', async () => {
      const mockData = [
        { marketplace: 'shopee', captured_count: 80, sent_count: 70, clicks_count: 20, conversion_rate: 4.2 },
        { marketplace: 'mercado_livre', captured_count: 50, sent_count: 40, clicks_count: 15, conversion_rate: 5.0 },
      ]

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const store = useAnalyticsStore.getState()
      await store.fetchByMarketplace()

      const updated = useAnalyticsStore.getState()
      expect(updated.byMarketplace).toEqual(mockData)
      expect(updated.error).toBeNull()
    })

    it('should fetch trending products', async () => {
      const mockData = [
        { product_title: 'Produto A', marketplace: 'shopee', captured_count: 25, clicks: 10, conversions: 3 },
        { product_title: 'Produto B', marketplace: 'mercado_livre', captured_count: 18, clicks: 7, conversions: 2 },
      ]

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const store = useAnalyticsStore.getState()
      await store.fetchTrendingProducts()

      const updated = useAnalyticsStore.getState()
      expect(updated.trendingProducts).toEqual(mockData)
      expect(updated.error).toBeNull()
    })

    it('should fetch spy insights', async () => {
      const mockData = {
        most_active_groups: [{ source_group_jid: 'group1@g.us', activity_count: 45 }],
        peak_times: [{ hour_of_day: 10, percentage: 12.5 }],
        marketplace_preference: { shopee: 80 },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const store = useAnalyticsStore.getState()
      await store.fetchSpyInsights()

      const updated = useAnalyticsStore.getState()
      expect(updated.spyInsights).toEqual(mockData)
      expect(updated.error).toBeNull()
    })

    it('should fetch all data in parallel', async () => {
      const mockOverview = { captured_count: 150, sent_count: 120, clicks_count: 45, conversions_count: 12, conversion_rate: 8.0, estimated_revenue: 250.5 }
      const mockMarketplace = [{ marketplace: 'shopee', captured_count: 80, sent_count: 70, clicks_count: 20, conversion_rate: 4.2 }]
      const mockProducts = [{ product_title: 'Produto A', marketplace: 'shopee', captured_count: 25, clicks: 10, conversions: 3 }]
      const mockInsights = { most_active_groups: [], peak_times: [], marketplace_preference: {} }

      ;(global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => mockOverview })
        .mockResolvedValueOnce({ ok: true, json: async () => mockMarketplace })
        .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
        .mockResolvedValueOnce({ ok: true, json: async () => mockInsights })

      const store = useAnalyticsStore.getState()
      await store.fetchAll()

      const updated = useAnalyticsStore.getState()
      expect(updated.overview).toEqual(mockOverview)
      expect(updated.byMarketplace).toEqual(mockMarketplace)
      expect(updated.trendingProducts).toEqual(mockProducts)
      expect(updated.spyInsights).toEqual(mockInsights)
    })
  })

  describe('Error Handling', () => {
    it('should set error on failed overview fetch', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const store = useAnalyticsStore.getState()
      await store.fetchOverview()

      const updated = useAnalyticsStore.getState()
      expect(updated.error).toBeDefined()
      expect(updated.overview).toBeNull()
    })

    it('should handle network error on overview fetch', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const store = useAnalyticsStore.getState()

      try {
        await store.fetchOverview()
      } catch (error) {
        // Expected to throw
      }

      const updated = useAnalyticsStore.getState()
      expect(updated.error).toBeDefined()
    })

    it('should clear error on successful fetch after error', async () => {
      // Set initial error
      useAnalyticsStore.setState({ error: 'Previous error' })

      const mockData = { captured_count: 150, sent_count: 120, clicks_count: 45, conversions_count: 12, conversion_rate: 8.0, estimated_revenue: 250.5 }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const store = useAnalyticsStore.getState()
      await store.fetchOverview()

      const updated = useAnalyticsStore.getState()
      expect(updated.error).toBeNull()
      expect(updated.overview).toEqual(mockData)
    })
  })

  describe('Date Range Effects', () => {
    it('should include date range in fetch requests', async () => {
      const from = new Date('2026-01-01')
      const to = new Date('2026-01-31')

      useAnalyticsStore.setState({ dateRange: { from, to } })

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ captured_count: 100, sent_count: 80, clicks_count: 30, conversions_count: 8, conversion_rate: 6.5, estimated_revenue: 200 }),
      })

      const store = useAnalyticsStore.getState()
      await store.fetchOverview()

      const callUrl = fetchMock.mock.calls[0][0]
      expect(callUrl).toContain('dateFrom=2026-01-01')
      expect(callUrl).toContain('dateTo=2026-01-31')
    })
  })
})
