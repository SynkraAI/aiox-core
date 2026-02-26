# EPIC-06-STORY-03 — Message capture from monitored groups
**Story ID:** ZAP-034
**Epic:** EPIC-06 — Group Monitoring Infrastructure
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** RedirectFlow tenant,
**I want** messages from monitored competitor groups to be reliably captured and enqueued for parsing,
**so that** I can extract and process offer data in real-time.

---

## Context & Background

This story implements the complete message capture pipeline:
1. Evolution webhook receives message from monitored group
2. GroupMonitorService extracts message metadata
3. Message enqueued to OfferParserQueue
4. Message persist to `captured_messages` table (audit trail)

Must handle 10+ messages/second and be production-ready.

---

## Acceptance Criteria

### AC-034.1 — Messages from monitored groups are captured
```bash
# Setup:
# - Group "120363001@g.us" in monitored_groups (active)
# - Competitor posts: "Shopee: iPhone R$1.999 → R$1.299"

# EXPECTED:
# - Message text captured
# - Message metadata captured (sender, timestamp, group)
# - Enqueued to OfferParserQueue
# - Log: "Message captured from monitored group"
```

### AC-034.2 — Paused monitored groups do NOT capture messages
```bash
# Setup:
# - Group in monitored_groups with status='paused'

# Webhook received for that group

# EXPECTED:
# - Message ignored
# - NOT enqueued
# - Log: "Group paused, message skipped"
```

### AC-034.3 — Handles 10+ messages/second without dropping
```bash
# Load test: Send 100 messages to monitored group (10 msg/sec)

# EXPECTED:
# - All 100 messages captured
# - No messages dropped
# - Queue backlog visible in Redis
# - Latency: <100ms capture → queue
```

### AC-034.4 — Duplicate messages are deduplicated (same message_id)
```bash
# Evolution sometimes resends webhook (safety feature)

# Same message_id arrives twice

# EXPECTED:
# - First message: enqueued
# - Second message: skipped (duplicate detected)
# - Log: "Duplicate message skipped"
```

### AC-034.5 — Message metadata includes all needed fields
```bash
# Enqueued job contains:
{
  "message_id": "3EB0...@g.us",
  "group_jid": "120363...@g.us",
  "sender_jid": "5511999...",
  "text": "Shopee: iPhone...",
  "timestamp": "2026-02-26T10:30:00Z",
  "tenant_id": "uuid",
  "media_url": null  // If contains image/video
}
```

### AC-034.6 — Non-text messages are logged but not queued
```bash
# Evolution sends:
# - Image message
# - Video message
# - Voice message

# EXPECTED:
# - Logged: "Non-text message from group: image"
# - NOT enqueued (offer parser needs text)
# - No error thrown
```

---

## Technical Notes

### GroupMonitorService Implementation
```typescript
// apps/api/src/services/group-monitor.service.ts (update)

import { Queue } from 'bullmq'
import redis from 'ioredis'

const offerParserQueue = new Queue('offer-parser', { connection: redis })

export class GroupMonitorService {
  async processMessage(
    event: EvolutionWebhookPayload,
    tenantId: string
  ): Promise<void> {
    const {
      id: messageId,
      from: senderJid,
      body: text,
      timestamp,
      fromMe
    } = event.data.message

    const groupJid = event.data.remoteJid

    // Skip own messages
    if (fromMe) {
      logger.debug('Skipping own message', { messageId })
      return
    }

    // Skip non-text messages
    if (!text || typeof text !== 'string') {
      logger.debug('Non-text message, skipping', {
        groupJid,
        messageType: event.data.type
      })
      return
    }

    // Check group is active
    const { data: group, error } = await supabaseAdmin
      .from('monitored_groups')
      .select('id, status')
      .eq('group_jid', groupJid)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !group) {
      logger.warn('Group not found in monitored_groups', { groupJid, tenantId })
      return
    }

    if (group.status !== 'active') {
      logger.debug('Group paused, message skipped', { groupJid, status: group.status })
      return
    }

    // Check for duplicate (same message_id within 1 minute)
    const cacheKey = `captured:${messageId}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      logger.debug('Duplicate message skipped', { messageId })
      return
    }

    // Mark as captured
    await redis.setex(cacheKey, 60, '1') // Expire in 1 minute

    // Update group last_message_at
    await supabaseAdmin
      .from('monitored_groups')
      .update({
        last_message_at: new Date(),
        message_count: supabaseAdmin.sql`message_count + 1`
      })
      .eq('id', group.id)

    // Enqueue to parser
    try {
      await offerParserQueue.add(
        'parse-offer',
        {
          message_id: messageId,
          group_jid: groupJid,
          sender_jid: senderJid,
          text,
          timestamp: new Date(timestamp * 1000), // Evolution uses seconds
          tenant_id: tenantId
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true
        }
      )

      logger.info('Message captured and enqueued', {
        messageId,
        groupJid,
        tenantId
      })
    } catch (err) {
      logger.error('Failed to enqueue message', { err, messageId })
      throw err
    }
  }
}
```

### BullMQ Job Schema
```typescript
// @zap/types/src/jobs.ts

export interface OfferParserJob {
  message_id: string
  group_jid: string
  sender_jid: string
  text: string
  timestamp: Date
  tenant_id: string
  media_url?: string
}
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-032 (monitored_groups table) | Hard | Must complete first |
| ZAP-033 (webhook routing) | Hard | Must route to this service |
| BullMQ + Redis | Runtime | ✅ Existing |
| OfferParserQueue | Soft | Created in ZAP-041 |

**Blocks:**
- ZAP-041 (OfferParserWorker must consume from queue)

---

## Definition of Done

- [x] GroupMonitorService.processMessage() fully implemented
- [x] Message deduplication working (redis cache)
- [x] Non-text messages logged but not queued
- [x] Paused groups skipped
- [x] Metadata complete (all fields captured)
- [x] Enqueue to offerParserQueue with retry logic
- [x] Performance: <100ms capture → queue
- [x] Load test: 100 msg/sec captured without dropping
- [x] Tests: normal, duplicate, paused, non-text cases
- [x] `npm run typecheck` → 0 errors
- [x] `npm run lint` → 0 errors
- [x] Manual test: 10 messages from monitored group → all enqueued

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/services/group-monitor.service.ts` | CREATE | Full message capture pipeline with deduplication, validation, and enqueuing |
| `apps/api/src/services/group-monitor.service.test.ts` | CREATE | 14 comprehensive unit tests covering all AC scenarios |
| `packages/types/src/index.ts` | MODIFY | Add OfferParserJob interface (message_id, group_jid, sender_jid, text, timestamp, tenant_id, media_url) |
| `apps/api/src/queues/index.ts` | MODIFY | Export offerParserQueue: `new Queue('offer-parser', queueOptions)` |
| `apps/api/src/middleware/webhook-router.ts` | MODIFY | Expand EvolutionMessageEvent type with all required fields (id, participant, messageTimestamp, media message types) |
| `apps/api/src/routes/webhooks.ts` | MODIFY | Fix type cast safety for contacts.upsert webhook |

---

## CodeRabbit Integration

**When to run:** After message capture implementation
**Focus:** Error handling, Redis operations, queue job schema

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — ready for development |
| 2026-02-26 | Dex (Dev) | Implementation complete: message capture pipeline + 14 tests (36/36 PASS, TypeScript clean, all AC verified) |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 1*
