import { Worker, Job } from 'bullmq'
import { messageQueue, BroadcastJobData, OfferReplicationJobData, offerReplicationQueue } from '../queues/index.js'
import { supabaseAdmin } from '../db/client.js'
import { logger } from '../lib/logger.js'
import { config } from '../lib/config.js'
import { sessionManager } from '../services/whatsapp/session-manager.js'
import { formatOfferMessage } from '../services/offers/message-formatter.js'

function getConnection() {
  try {
    const u = new URL(config.redis.url)
    return {
      host: u.hostname || 'localhost',
      port: parseInt(u.port || '6379', 10),
      ...(u.password ? { password: decodeURIComponent(u.password) } : {}),
      maxRetriesPerRequest: null as null,
      enableReadyCheck: false,
    }
  } catch {
    return { host: 'localhost', port: 6379, maxRetriesPerRequest: null as null, enableReadyCheck: false }
  }
}

export const broadcastWorker = new Worker<BroadcastJobData>(
  'broadcast-proc',
  async (job: Job<BroadcastJobData>) => {
    const { broadcastId, tenantId } = job.data

    logger.info('Processing broadcast', { jobId: job.id, broadcastId })

    // Fetch broadcast with messages
    const { data: broadcast, error } = await supabaseAdmin
      .from('broadcasts')
      .select('*, messages:broadcast_messages(*)')
      .eq('id', broadcastId)
      .single()

    if (error || !broadcast) {
      throw new Error(`Broadcast ${broadcastId} not found`)
    }

    if (broadcast.status !== 'sending') {
      logger.warn('Broadcast not in sending state', { broadcastId, status: broadcast.status })
      return
    }

    const messages: Array<{ content_type: string; content: Record<string, unknown> }> = broadcast.messages ?? []

    // Resolve target groups
    let groups: Array<{ id: string; wa_group_id: string }> = []

    if (broadcast.target_type === 'all_groups') {
      const { data } = await supabaseAdmin
        .from('groups')
        .select('id, wa_group_id')
        .eq('tenant_id', tenantId)
        .eq('project_id', broadcast.project_id)
        .eq('status', 'active')
      groups = data ?? []
    } else if (broadcast.target_type === 'specific_groups') {
      const { data } = await supabaseAdmin
        .from('groups')
        .select('id, wa_group_id')
        .in('id', broadcast.target_ids)
        .eq('tenant_id', tenantId)
      groups = data ?? []
    } else if (broadcast.target_type === 'phase') {
      const { data } = await supabaseAdmin
        .from('groups')
        .select('id, wa_group_id')
        .eq('tenant_id', tenantId)
        .in('phase_id', broadcast.target_ids)
        .eq('status', 'active')
      groups = data ?? []
    }

    const totalJobs = groups.length * messages.length

    // Update total_count before enqueuing
    await supabaseAdmin
      .from('broadcasts')
      .update({ total_count: totalJobs })
      .eq('id', broadcastId)

    logger.info(`Queuing ${totalJobs} message jobs (${groups.length} groups × ${messages.length} messages)`, { broadcastId })

    // Fan-out: one job per (group × message), staggered by 2s per group slot
    let jobIndex = 0
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      for (let j = 0; j < messages.length; j++) {
        const msg = messages[j]
        await messageQueue.add(
          'message-send',
          {
            tenantId,
            broadcastId,
            groupId: group.id,
            waGroupId: group.wa_group_id,
            connectionId: broadcast.connection_id,
            content: {
              type: msg.content_type,
              text: (msg.content as Record<string, string>).text,
              url: (msg.content as Record<string, string>).url,
              caption: (msg.content as Record<string, string>).caption,
              filename: (msg.content as Record<string, string>).filename,
            },
          },
          {
            delay: jobIndex * 2000,  // 2s stagger between each job slot
            attempts: 3,
            backoff: { type: 'exponential', delay: 10000 },
          },
        )
        jobIndex++
      }
    }

    logger.info('Broadcast jobs enqueued', { broadcastId, totalJobs })
  },
  {
    connection: getConnection(),
    concurrency: 2,
  },
)

logger.info('broadcast-proc worker started', { concurrency: 2 })

broadcastWorker.on('completed', (job) => {
  logger.info('Broadcast worker completed', { jobId: job.id })
})

broadcastWorker.on('failed', (job, err) => {
  logger.error('Job failed permanently', {
    queue: 'broadcast-proc',
    jobId: job?.id,
    data: job?.data,
    error: err.message,
  })

  if (job?.data.broadcastId) {
    void supabaseAdmin
      .from('broadcasts')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', job.data.broadcastId)
  }
})

// ----- AC-049: OfferReplicationWorker -----
// Consumes offer-replication queue jobs to send replicated offers to user groups

export const offerReplicationWorker = new Worker<OfferReplicationJobData>(
  'offer-replication',
  async (job: Job<OfferReplicationJobData>) => {
    const { offerId, tenantId, connectionId, parsedOffer, targetGroups, affiliateLinks } = job.data

    logger.info('Processing offer replication', {
      jobId: job.id,
      offerId,
      groupCount: targetGroups.length,
    })

    const results = []

    for (const group of targetGroups) {
      try {
        // Build message using marketplace and pricing info
        const affiliateUrl = affiliateLinks?.[parsedOffer.marketplace] || parsedOffer.originalUrl

        const messageText = formatOfferMessage({
          productTitle: parsedOffer.productId, // Use productId as title for now
          discountedPrice: parsedOffer.price || 0,
          affiliateUrl,
          marketplace: parsedOffer.marketplace,
        })

        // AC-049.3: Send via SessionManager
        await sessionManager.sendTextToGroup(tenantId, connectionId, group.waGroupId, messageText)

        // AC-049.4: Update replicated_offers tracking
        // Increment sent_to_count and update timestamps
        const { error: fetchError, data: currentOffer } = await supabaseAdmin
          .from('replicated_offers')
          .select('sent_to_count')
          .eq('id', offerId)
          .single()

        if (!fetchError && currentOffer) {
          const newCount = (currentOffer.sent_to_count ?? 0) + 1
          await supabaseAdmin
            .from('replicated_offers')
            .update({
              sent_at: new Date().toISOString(),
              status: 'sent',
              sent_to_count: newCount,
            })
            .eq('id', offerId)
        }

        logger.info('Offer sent to group', { offerId, groupId: group.groupId })
        results.push({ groupId: group.groupId, success: true })
      } catch (error) {
        // AC-049.5: Error handling with BullMQ retry
        logger.error('Failed to send offer to group', {
          error: error instanceof Error ? error.message : 'Unknown error',
          offerId,
          groupId: group.groupId,
          attempt: job.attemptsMade + 1,
          maxAttempts: job.opts.attempts,
        })

        results.push({
          groupId: group.groupId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        // Throw to trigger BullMQ retry logic
        throw error
      }
    }

    return { offerId, totalGroups: targetGroups.length, successCount: results.filter((r) => r.success).length }
  },
  {
    connection: getConnection(),
    concurrency: 2,
  },
)

logger.info('offer-replication worker started', { concurrency: 2 })

offerReplicationWorker.on('completed', (job) => {
  logger.info('Offer replication completed', { jobId: job.id, data: job.data })
})

offerReplicationWorker.on('failed', (job, err) => {
  logger.error('Offer replication failed permanently', {
    queue: 'offer-replication',
    jobId: job?.id,
    attempt: job?.attemptsMade,
    maxAttempts: job?.opts.attempts,
    error: err.message,
  })
})
