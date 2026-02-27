/**
 * Analytics API endpoints for dashboard
 * AC-051: Comprehensive analytics dashboard with marketplace breakdown and spy insights
 */

import { Hono } from 'hono'
import { supabaseAdmin } from '../db/client.js'
import { logger } from '../lib/logger.js'
import type { Context } from 'hono'

interface AuthContext {
  userId: string
  tenantId: string
}

export const analyticsRouter = new Hono()

/**
 * AC-051.1: Dashboard overview metrics
 */
analyticsRouter.get('/overview', async (c: Context) => {
  try {
    const auth = c.get('auth') as AuthContext
    const dateFrom = c.req.query('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const dateTo = c.req.query('dateTo') || new Date().toISOString()

    const [
      capturedResult,
      sentResult,
      clicksResult,
      conversionsResult,
    ] = await Promise.all([
      supabaseAdmin
        .from('captured_offers')
        .select('id', { count: 'exact' })
        .eq('tenant_id', auth.tenantId)
        .gte('captured_at', dateFrom)
        .lte('captured_at', dateTo),
      supabaseAdmin
        .from('replicated_offers')
        .select('id', { count: 'exact' })
        .eq('tenant_id', auth.tenantId)
        .gte('sent_at', dateFrom)
        .lte('sent_at', dateTo),
      supabaseAdmin
        .from('link_clicks')
        .select('id', { count: 'exact' })
        .eq('tenant_id', auth.tenantId)
        .gte('clicked_at', dateFrom)
        .lte('clicked_at', dateTo),
      supabaseAdmin
        .from('conversions')
        .select('id', { count: 'exact' })
        .eq('tenant_id', auth.tenantId)
        .gte('converted_at', dateFrom)
        .lte('converted_at', dateTo),
    ])

    const capturedCount = capturedResult.count || 0
    const sentCount = sentResult.count || 0
    const clicksCount = clicksResult.count || 0
    const conversionsCount = conversionsResult.count || 0
    const conversionRate = clicksCount > 0 ? (conversionsCount / clicksCount) * 100 : 0
    const estimatedRevenue = conversionsCount * 50 // Placeholder: R$50 per conversion

    logger.info('Analytics overview fetched', {
      tenantId: auth.tenantId,
      dateFrom,
      dateTo,
      capturedCount,
      sentCount,
      clicksCount,
      conversionsCount,
    })

    return c.json({
      captured_count: capturedCount,
      sent_count: sentCount,
      clicks_count: clicksCount,
      conversions_count: conversionsCount,
      conversion_rate: parseFloat(conversionRate.toFixed(2)),
      estimated_revenue: estimatedRevenue,
    })
  } catch (error) {
    logger.error('Failed to fetch analytics overview', { error })
    return c.json({ error: 'Failed to fetch overview' }, 500)
  }
})

/**
 * AC-051.2: Performance breakdown by marketplace
 */
analyticsRouter.get('/by-marketplace', async (c: Context) => {
  try {
    const auth = c.get('auth') as AuthContext
    const dateFrom = c.req.query('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const dateTo = c.req.query('dateTo') || new Date().toISOString()

    const { data } = await supabaseAdmin.rpc('analytics_by_marketplace', {
      p_tenant_id: auth.tenantId,
      p_date_from: dateFrom,
      p_date_to: dateTo,
    })

    logger.info('Analytics by marketplace fetched', {
      tenantId: auth.tenantId,
      count: data?.length || 0,
    })

    return c.json(data || [])
  } catch (error) {
    logger.error('Failed to fetch marketplace analytics', { error })
    return c.json({ error: 'Failed to fetch marketplace data' }, 500)
  }
})

/**
 * AC-051.3: Trending products
 */
analyticsRouter.get('/trending-products', async (c: Context) => {
  try {
    const auth = c.get('auth') as AuthContext
    const dateFrom = c.req.query('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const dateTo = c.req.query('dateTo') || new Date().toISOString()
    const limit = parseInt(c.req.query('limit') || '20')

    const { data } = await supabaseAdmin
      .from('captured_offers')
      .select('product_title, marketplace, id')
      .eq('tenant_id', auth.tenantId)
      .gte('captured_at', dateFrom)
      .lte('captured_at', dateTo)
      .order('captured_at', { ascending: false })
      .limit(limit)

    // Group and aggregate
    const grouped: Record<string, {
      product_title: string
      marketplace: string
      captured_count: number
      clicks: number
      conversions: number
      estimated_value: number
    }> = {}

    for (const item of data || []) {
      const key = `${item.product_title}|${item.marketplace}`
      if (!grouped[key]) {
        grouped[key] = {
          product_title: item.product_title,
          marketplace: item.marketplace,
          captured_count: 0,
          clicks: 0,
          conversions: 0,
          estimated_value: 0,
        }
      }
      grouped[key].captured_count++
    }

    const result = Object.values(grouped)
      .sort((a, b) => b.captured_count - a.captured_count)
      .slice(0, limit)

    logger.info('Trending products fetched', {
      tenantId: auth.tenantId,
      count: result.length,
    })

    return c.json(result)
  } catch (error) {
    logger.error('Failed to fetch trending products', { error })
    return c.json({ error: 'Failed to fetch trending products' }, 500)
  }
})

/**
 * AC-051.4: Spy insights - competitor analysis
 */
analyticsRouter.get('/spy-insights', async (c: Context) => {
  try {
    const auth = c.get('auth') as AuthContext
    const dateFrom = c.req.query('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const dateTo = c.req.query('dateTo') || new Date().toISOString()

    // Most active competitor groups
    const { data: mostActive } = await supabaseAdmin
      .from('captured_offers')
      .select('source_group_jid')
      .eq('tenant_id', auth.tenantId)
      .gte('captured_at', dateFrom)
      .lte('captured_at', dateTo)

    // Peak times (group by hour)
    const { data: peakTimes } = await supabaseAdmin.rpc('analytics_peak_times', {
      p_tenant_id: auth.tenantId,
      p_date_from: dateFrom,
      p_date_to: dateTo,
    })

    // Marketplace preference
    const { data: marketplaceData } = await supabaseAdmin
      .from('captured_offers')
      .select('marketplace')
      .eq('tenant_id', auth.tenantId)
      .gte('captured_at', dateFrom)
      .lte('captured_at', dateTo)

    const marketplaceCount: Record<string, number> = {}
    for (const item of marketplaceData || []) {
      marketplaceCount[item.marketplace] = (marketplaceCount[item.marketplace] || 0) + 1
    }

    logger.info('Spy insights fetched', {
      tenantId: auth.tenantId,
      activeGroupsCount: mostActive?.length || 0,
    })

    return c.json({
      most_active_groups: mostActive?.slice(0, 10) || [],
      peak_times: peakTimes || [],
      marketplace_preference: marketplaceCount,
    })
  } catch (error) {
    logger.error('Failed to fetch spy insights', { error })
    return c.json({ error: 'Failed to fetch spy insights' }, 500)
  }
})

export default analyticsRouter
