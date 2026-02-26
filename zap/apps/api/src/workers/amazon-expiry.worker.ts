import { logger } from '../lib/logger.js'
import { supabaseAdmin } from '../db/client.js'

/**
 * AC-046.2 & AC-046.3: Amazon Link Expiry Worker
 *
 * Runs daily at 1 AM UTC (cron: 0 1 * * *)
 * - Finds all Amazon offers that have expired (expires_at < NOW and status != 'expired')
 * - Updates their status to 'expired'
 * - Logs the count of expired offers
 *
 * Amazon offers expire after 90 days:
 * - captured_offers.expires_at = captured_at + 90 days (set by offer-parser.worker)
 * - This worker marks them as expired and prevents sending to users
 */
export async function checkAmazonExpiry() {
  const now = new Date()
  const logContext = {
    worker: 'amazon-expiry',
    executedAt: now.toISOString(),
  }

  try {
    logger.info('Amazon expiry check started', logContext)

    // AC-046.3: Query expired Amazon offers
    // WHERE marketplace='amazon' AND expires_at < NOW() AND status != 'expired'
    const { data: expiredOffers, error: fetchError } = await supabaseAdmin
      .from('captured_offers')
      .select('id, product_id, tenant_id')
      .eq('marketplace', 'amazon')
      .lt('expires_at', now.toISOString())
      .neq('status', 'expired')

    if (fetchError) {
      logger.error('Failed to fetch expired Amazon offers', {
        ...logContext,
        error: fetchError.message,
      })
      throw fetchError
    }

    const count = expiredOffers?.length || 0

    if (count === 0) {
      logger.info('No Amazon offers to expire', logContext)
      return { expired_count: 0, message: 'No offers expired' }
    }

    // AC-046.3: Update status to 'expired' for expired offers
    const offerIds = expiredOffers!.map((offer) => offer.id)

    const { error: updateError } = await supabaseAdmin
      .from('captured_offers')
      .update({
        status: 'expired',
        updated_at: now.toISOString(),
      })
      .in('id', offerIds)

    if (updateError) {
      logger.error('Failed to update expired Amazon offers', {
        ...logContext,
        error: updateError.message,
        count,
      })
      throw updateError
    }

    // AC-046.2: Log that expired offers will not be sent
    logger.info(`Amazon offer expiry check: ${count} offers marked as expired`, {
      ...logContext,
      expired_count: count,
      offer_ids: offerIds,
    })

    // Log which tenants had offers expire (for monitoring)
    const tenantCounts = expiredOffers!.reduce(
      (acc, offer) => {
        acc[offer.tenant_id] = (acc[offer.tenant_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    logger.debug('Expired offers by tenant', {
      ...logContext,
      tenant_counts: tenantCounts,
    })

    return {
      expired_count: count,
      message: `${count} Amazon offers expired`,
      tenants_affected: Object.keys(tenantCounts).length,
    }
  } catch (error) {
    logger.error('Amazon expiry worker failed', {
      ...logContext,
      error: error instanceof Error ? error.message : error,
    })
    throw error
  }
}

/**
 * Export as default for potential cron scheduling
 * Usage: import { checkAmazonExpiry } from './amazon-expiry.worker.js'
 * Then schedule with: scheduleJob('0 1 * * *', checkAmazonExpiry)
 */
export default checkAmazonExpiry
