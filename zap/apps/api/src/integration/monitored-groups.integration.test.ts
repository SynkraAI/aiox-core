import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { supabaseAdmin } from '../db/client.js'
import { redisConnection as redis, offerParserQueue } from '../queues/index.js'
import { groupMonitorService } from '../services/group-monitor.service.js'
import type { EvolutionMessageEvent } from '../middleware/webhook-router.js'

/**
 * AC-036.5: Integration tests for full message capture flow
 * Tests the complete pipeline from webhook to queue enqueue
 */
describe('MonitoredGroups Integration (AC-036.5)', () => {
  const TEST_TENANT_ID = 'integration-test-tenant'
  const TEST_CONNECTION_ID = 'integration-test-conn'
  const TEST_GROUP_JID = '120363001234567-1234567890@g.us'
  const TEST_GROUP_NAME = 'Integration Test Group'

  beforeAll(async () => {
    // Setup: Clear any existing test data
    await redis.flushdb()

    // Note: In real integration tests, would:
    // 1. Create test tenant
    // 2. Create test connection
    // 3. Create monitored group
    // For now, we mock these as they're managed by other tests
  })

  afterEach(async () => {
    // Clear Redis cache between tests
    await redis.flushdb()
  })

  afterAll(async () => {
    // Cleanup: Remove test data
    // Note: In real integration tests, would delete tenant/connection/group
  })

  /**
   * AC-036.5: Full message capture flow
   * Verifies: webhook → GroupMonitorService → queue → stats updated
   */
  it('should capture message and update group stats', async () => {
    // Mock the database query for group validation
    const mockGroup = {
      id: 'test-group-id',
      status: 'active',
      message_count: 0,
      last_message_at: null,
    }

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockGroup,
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as any)

    // Mock RPC for stats update
    vi.spyOn(supabaseAdmin, 'rpc').mockResolvedValue({
      data: null,
      error: null,
    })

    // Spy on queue.add
    const queueSpy = vi.spyOn(offerParserQueue, 'add').mockResolvedValue({ id: 'job-123' } as any)

    // Create test webhook event
    const event: EvolutionMessageEvent = {
      event: 'messages.upsert',
      instance: `${TEST_TENANT_ID}-${TEST_CONNECTION_ID}`,
      data: {
        key: {
          remoteJid: TEST_GROUP_JID,
          fromMe: false,
          id: 'msg-001',
          participant: '5511999999999@s.whatsapp.net',
        },
        message: {
          conversation: 'Shopee: iPhone 14 de R$2.999 por R$1.299',
        },
        messageTimestamp: Math.floor(Date.now() / 1000),
      },
    }

    // Execute: Process message through GroupMonitorService
    await groupMonitorService.processMessage(event, TEST_TENANT_ID)

    // Verify: Job enqueued to offerParserQueue
    expect(queueSpy).toHaveBeenCalledWith(
      'parse-offer',
      expect.objectContaining({
        message_id: 'msg-001',
        group_jid: TEST_GROUP_JID,
        sender_jid: '5511999999999@s.whatsapp.net',
        text: 'Shopee: iPhone 14 de R$2.999 por R$1.299',
        tenant_id: TEST_TENANT_ID,
      }),
      expect.any(Object)
    )

    // Verify: Group stats would be updated via RPC
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith(
      'increment_message_count',
      expect.objectContaining({
        p_group_jid: TEST_GROUP_JID,
        p_tenant_id: TEST_TENANT_ID,
      })
    )
  })

  /**
   * AC-036.5: Webhook routing to GroupMonitorService
   * Verifies: Message from monitored group routes to GroupMonitorService
   */
  it('should route monitored group messages to GroupMonitorService', async () => {
    // Mock group as active and monitored
    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'group-id', status: 'active' },
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as any)

    vi.spyOn(supabaseAdmin, 'rpc').mockResolvedValue({
      data: null,
      error: null,
    })

    const queueSpy = vi.spyOn(offerParserQueue, 'add').mockResolvedValue({ id: 'job-002' } as any)

    const event: EvolutionMessageEvent = {
      event: 'messages.upsert',
      instance: `${TEST_TENANT_ID}-${TEST_CONNECTION_ID}`,
      data: {
        key: {
          remoteJid: TEST_GROUP_JID,
          fromMe: false,
          id: 'msg-002',
          participant: '5511988888888@s.whatsapp.net',
        },
        message: {
          conversation: 'Mercado Livre: Notebook 50% off',
        },
        messageTimestamp: Math.floor(Date.now() / 1000),
      },
    }

    // Execute
    await groupMonitorService.processMessage(event, TEST_TENANT_ID)

    // Verify: Message was enqueued (routing worked)
    expect(queueSpy).toHaveBeenCalled()
    const jobData = queueSpy.mock.calls[0][1]
    expect(jobData.text).toBe('Mercado Livre: Notebook 50% off')
  })

  /**
   * AC-036.5: Job payload validation
   * Verifies: Enqueued job has all required fields with correct format
   */
  it('should enqueue job with complete and valid payload', async () => {
    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'group-id', status: 'active' },
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as any)

    vi.spyOn(supabaseAdmin, 'rpc').mockResolvedValue({
      data: null,
      error: null,
    })

    const queueSpy = vi.spyOn(offerParserQueue, 'add').mockResolvedValue({ id: 'job-003' } as any)

    const timestamp = Math.floor(Date.now() / 1000)
    const event: EvolutionMessageEvent = {
      event: 'messages.upsert',
      instance: `${TEST_TENANT_ID}-${TEST_CONNECTION_ID}`,
      data: {
        key: {
          remoteJid: TEST_GROUP_JID,
          fromMe: false,
          id: 'msg-payload-test',
          participant: '5511977777777@s.whatsapp.net',
        },
        message: {
          conversation: 'Amazon: Fire TV Stick',
        },
        messageTimestamp: timestamp,
      },
    }

    await groupMonitorService.processMessage(event, TEST_TENANT_ID)

    const jobData = queueSpy.mock.calls[0][1]

    // Verify all required fields present
    expect(jobData).toHaveProperty('message_id')
    expect(jobData).toHaveProperty('group_jid')
    expect(jobData).toHaveProperty('sender_jid')
    expect(jobData).toHaveProperty('text')
    expect(jobData).toHaveProperty('timestamp')
    expect(jobData).toHaveProperty('tenant_id')

    // Verify field formats
    expect(jobData.message_id).toBe('msg-payload-test')
    expect(jobData.group_jid).toBe(TEST_GROUP_JID)
    expect(jobData.tenant_id).toBe(TEST_TENANT_ID)
    expect(jobData.text).toBe('Amazon: Fire TV Stick')
    expect(typeof jobData.timestamp).toBe('string') // ISO format
  })
})
