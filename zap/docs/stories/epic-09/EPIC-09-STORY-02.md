# EPIC-09-STORY-02 — Extend BroadcastWorker for replicated_offers
**Story ID:** ZAP-049
**Epic:** EPIC-09 — Intelligent Replication & Analytics
**Sprint:** 2 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 2
**Status:** Done
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** broadcast worker,
**I want** to be extended to send replicated offers to user groups,
**so that** offers can be distributed via the existing broadcast infrastructure.

---

## Acceptance Criteria

### AC-049.1 — Consumes OfferReplicationQueue jobs
```bash
Worker listens on 'offer-replication' queue
For each job:
- Extract: offerId, targetGroupIds, affiliateUrl
- For each group: send message
```

### AC-049.2 — Message format for offers
```bash
Text sent to group:

"🏪 OFERTA DO DIA

[Product Title]
💰 De: R$[original] Por: R$[discounted] (-[discount]%)

🔗 Clique aqui: [affiliate_url]
[add 1-2 tracked links here]

Shopee | ML | Amazon"
```

### AC-049.3 — Sends via SessionManager
```bash
Use: sessionManager.sendTextToGroup(
  tenantId,
  connectionId,
  groupId,
  messageText
)

Returns: { success: true, message_id: "..." }
```

### AC-049.4 — Tracks sent_at + updates replicated_offers
```bash
After send:
- Update replicated_offers.sent_at = NOW()
- Update replicated_offers.sent_to_count++
- Update replicated_offers.status = 'sent'
```

### AC-049.5 — Error handling: retry or mark failed
```bash
Send fails:
- Max 4 attempts (inherited from queue config)
- Log: "Failed to send offer to group X (attempt 2/4)"
- After 4 attempts: move to dead-letter queue
```

### AC-049.6 — Performance: <100ms per send (excluding delays)
```bash
Sending to 20 groups in parallel:
- Total time: <2 seconds (excluding 2-min delays between each)
```

---

## Technical Notes

### BroadcastWorker Extension
```typescript
// apps/api/src/workers/broadcast.worker.ts (extend existing)

export const offerReplicationWorker = new Worker(
  'offer-replication',
  async (job) => {
    const { offerId, targetGroupIds, affiliateUrl, marketplace, productTitle, discountedPrice, tenantId, connectionId } = job.data

    logger.info('Replicating offer', { offerId, groupCount: targetGroupIds.length })

    const results = []

    for (const groupId of targetGroupIds) {
      try {
        // Build message
        const messageText = formatOfferMessage({
          productTitle,
          discountedPrice,
          affiliateUrl,
          marketplace
        })

        // Send via SessionManager
        const result = await sessionManager.sendTextToGroup(
          tenantId,
          connectionId,
          groupId,
          messageText
        )

        // Update replicated_offers
        await supabaseAdmin
          .from('replicated_offers')
          .update({
            sent_at: new Date(),
            status: 'sent',
            sent_to_count: supabaseAdmin.sql`sent_to_count + 1`
          })
          .eq('id', offerId)

        logger.info('Offer sent to group', { offerId, groupId })
        results.push({ groupId, success: true })

      } catch (error) {
        logger.error('Failed to send to group', { error, offerId, groupId })
        results.push({ groupId, success: false, error: error.message })
        // BullMQ will retry based on queue config
        throw error
      }
    }

    return { offerId, results }
  },
  { connection: redis }
)
```

### Message Formatter
```typescript
function formatOfferMessage(data: {
  productTitle: string
  discountedPrice: number
  affiliateUrl: string
  marketplace: string
}): string {
  return `🏪 OFERTA DO DIA

${data.productTitle}
💰 R$ ${data.discountedPrice.toFixed(2)}

🔗 Clique: ${data.affiliateUrl}

${data.marketplace.toUpperCase()}`
}
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-048 (OfferReplicationQueue) | Hard | Must exist |
| ZAP-047 (LinkSubstitutionService) | Hard | Must generate affiliateUrl |
| SessionManager | Runtime | ✅ Existing |

**Blocks:**
- ZAP-050 (anti-ban delays)
- EPIC testing

---

## Definition of Done

- [x] Worker implemented + listening on offer-replication queue
- [x] Consumes job data correctly
- [x] Message formatting working
- [x] Sends via SessionManager
- [x] Updates replicated_offers after send
- [x] Error handling + retries
- [x] Performance <100ms per send
- [x] Unit tests: formatting, send logic
- [x] `npm run typecheck` → 0 errors
- [x] Linting passes

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/workers/broadcast.worker.ts` | MODIFY | Extended with offerReplicationWorker (AC-049.1, 049.3, 049.4, 049.5) |
| `apps/api/src/services/offers/message-formatter.ts` | CREATE | formatOfferMessage() function (AC-049.2) |
| `apps/api/src/services/offers/message-formatter.test.ts` | CREATE | 5 unit tests for message formatting |
| `apps/api/src/workers/broadcast.worker.test.ts` | CREATE | 6 unit tests for worker logic and job payload |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-27 | Dex (Dev) | Implemented offerReplicationWorker + message formatting + unit tests (all AC met) |
| 2026-02-26 | River (SM) | Story created — extends broadcast |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 4*
