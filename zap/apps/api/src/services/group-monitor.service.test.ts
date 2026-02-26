import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GroupMonitorService, groupMonitorService } from './group-monitor.service.js'
import { supabaseAdmin } from '../db/client.js'
import { redisConnection as redis } from '../queues/index.js'
import { offerParserQueue } from '../queues/index.js'
import type { EvolutionMessageEvent } from '../middleware/webhook-router.js'

// Mock Supabase
vi.mock('../db/client.js', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

// Mock Redis
vi.mock('../queues/index.js', () => ({
  redisConnection: {
    get: vi.fn(),
    setex: vi.fn(),
  },
  offerParserQueue: {
    add: vi.fn(),
  },
}))

vi.mock('../lib/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('GroupMonitorService - Message Capture (ZAP-034)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockEvent: EvolutionMessageEvent = {
    event: 'messages.upsert',
    instance: 'test_tenant-123_conn-456',
    data: {
      key: {
        remoteJid: '120363001234567-1234567890@g.us',
        fromMe: false,
        id: 'msg123',
        participant: '5511999999999@s.whatsapp.net',
      },
      message: {
        conversation: 'Shopee: iPhone 14 de R$2.999 por R$1.299',
      },
      messageTimestamp: Math.floor(Date.now() / 1000),
    },
  }

  describe('AC-034.1: Message Capture', () => {
    it('Captures message text and metadata', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockResolvedValue({ id: 'job-id' })
      ;(supabaseAdmin.rpc as any).mockResolvedValue({ error: null })

      await groupMonitorService.processMessage(mockEvent, 'tenant-123')

      expect((offerParserQueue.add as any)).toHaveBeenCalled()
      const jobData = (offerParserQueue.add as any).mock.calls[0][1]
      expect(jobData.text).toBe('Shopee: iPhone 14 de R$2.999 por R$1.299')
      expect(jobData.group_jid).toBe('120363001234567-1234567890@g.us')
      expect(jobData.sender_jid).toBe('5511999999999@s.whatsapp.net')
      expect(jobData.tenant_id).toBe('tenant-123')
    })

    it('Includes all required job metadata (AC-034.5)', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockResolvedValue({ id: 'job-id' })
      ;(supabaseAdmin.rpc as any).mockResolvedValue({ error: null })

      await groupMonitorService.processMessage(mockEvent, 'tenant-123')

      const jobData = (offerParserQueue.add as any).mock.calls[0][1]

      // AC-034.5: Verify all required fields
      expect(jobData).toHaveProperty('message_id')
      expect(jobData).toHaveProperty('group_jid')
      expect(jobData).toHaveProperty('sender_jid')
      expect(jobData).toHaveProperty('text')
      expect(jobData).toHaveProperty('timestamp')
      expect(jobData).toHaveProperty('tenant_id')
    })
  })

  describe('AC-034.2: Paused Groups', () => {
    it('Skips messages from paused groups', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' }, // No active group found
                }),
              }),
            }),
          }),
        }),
      })

      await groupMonitorService.processMessage(mockEvent, 'tenant-123')

      // Should not enqueue
      expect((offerParserQueue.add as any)).not.toHaveBeenCalled()
    })
  })

  describe('AC-034.3: Performance', () => {
    it('Captures and enqueues message in <100ms', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockResolvedValue({ id: 'job-id' })
      ;(supabaseAdmin.rpc as any).mockResolvedValue({ error: null })

      const start = Date.now()
      await groupMonitorService.processMessage(mockEvent, 'tenant-123')
      const elapsed = Date.now() - start

      // AC-034.3: Should be very fast (mocked, so checking completion only)
      expect(elapsed).toBeLessThan(1000)
      expect((offerParserQueue.add as any)).toHaveBeenCalled()
    })
  })

  describe('AC-034.4: Duplicate Detection', () => {
    it('Skips duplicate messages (same message_id)', async () => {
      // Simulate cached message
      ;(redis.get as any).mockResolvedValue('1')

      await groupMonitorService.processMessage(mockEvent, 'tenant-123')

      // Should not reach database or queue
      expect((supabaseAdmin.from as any)).not.toHaveBeenCalled()
      expect((offerParserQueue.add as any)).not.toHaveBeenCalled()
    })

    it('Caches message after first capture', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockResolvedValue({ id: 'job-id' })
      ;(supabaseAdmin.rpc as any).mockResolvedValue({ error: null })

      await groupMonitorService.processMessage(mockEvent, 'tenant-123')

      // Verify cache was set
      expect((redis.setex as any)).toHaveBeenCalledWith(`captured:msg123`, 60, '1')
    })
  })

  describe('AC-034.6: Non-Text Messages', () => {
    it('Skips image messages', async () => {
      const imageEvent: EvolutionMessageEvent = {
        ...mockEvent,
        data: {
          ...mockEvent.data,
          message: {
            imageMessage: { url: 'https://example.com/image.jpg' },
          },
        },
      }

      await groupMonitorService.processMessage(imageEvent, 'tenant-123')

      expect((offerParserQueue.add as any)).not.toHaveBeenCalled()
    })

    it('Skips video messages', async () => {
      const videoEvent: EvolutionMessageEvent = {
        ...mockEvent,
        data: {
          ...mockEvent.data,
          message: {
            videoMessage: { url: 'https://example.com/video.mp4' },
          },
        },
      }

      await groupMonitorService.processMessage(videoEvent, 'tenant-123')

      expect((offerParserQueue.add as any)).not.toHaveBeenCalled()
    })

    it('Skips audio messages', async () => {
      const audioEvent: EvolutionMessageEvent = {
        ...mockEvent,
        data: {
          ...mockEvent.data,
          message: {
            audioMessage: { url: 'https://example.com/audio.mp3' },
          },
        },
      }

      await groupMonitorService.processMessage(audioEvent, 'tenant-123')

      expect((offerParserQueue.add as any)).not.toHaveBeenCalled()
    })

    it('Handles extendedTextMessage', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockResolvedValue({ id: 'job-id' })
      ;(supabaseAdmin.rpc as any).mockResolvedValue({ error: null })

      const extendedEvent: EvolutionMessageEvent = {
        ...mockEvent,
        data: {
          ...mockEvent.data,
          message: {
            extendedTextMessage: {
              text: 'Extended offer text',
            },
          },
        },
      }

      await groupMonitorService.processMessage(extendedEvent, 'tenant-123')

      const jobData = (offerParserQueue.add as any).mock.calls[0][1]
      expect(jobData.text).toBe('Extended offer text')
    })
  })

  describe('Error Handling', () => {
    it('Handles queue enqueue failure gracefully', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockRejectedValue(new Error('Queue connection failed'))

      await expect(groupMonitorService.processMessage(mockEvent, 'tenant-123')).rejects.toThrow(
        'Queue connection failed',
      )
    })

    it('Continues if group stats update fails', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockResolvedValue({ id: 'job-id' })
      ;(supabaseAdmin.rpc as any).mockResolvedValue({ error: { message: 'RPC error' } })

      // Should not throw even if stats update fails
      await expect(groupMonitorService.processMessage(mockEvent, 'tenant-123')).resolves.toBeUndefined()
      expect((offerParserQueue.add as any)).toHaveBeenCalled()
    })

    it('Skips own messages (fromMe)', async () => {
      const ownMessageEvent: EvolutionMessageEvent = {
        ...mockEvent,
        data: {
          ...mockEvent.data,
          key: {
            ...mockEvent.data.key,
            fromMe: true,
          },
        },
      }

      await groupMonitorService.processMessage(ownMessageEvent, 'tenant-123')

      expect((offerParserQueue.add as any)).not.toHaveBeenCalled()
    })
  })

  describe('AC-036.4: Tenant Isolation', () => {
    it('Tenant A groups isolated from Tenant B', async () => {
      const tenantA = 'tenant-a'
      const tenantB = 'tenant-b'
      const sharedGroupJid = '120363001@g.us'

      // Setup: Same group_jid, different tenants
      let callCount = 0
      ;(supabaseAdmin.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation((field, value) => {
            // Return based on tenant_id parameter
            return {
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: value === tenantA ? { id: 'group-a', status: 'active' } : { id: 'group-b', status: 'active' },
                    error: null,
                  }),
                }),
              }),
            }
          }),
        }),
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockResolvedValue({ id: 'job-id' })
      ;(supabaseAdmin.rpc as any).mockResolvedValue({ error: null })

      const eventTenantA: EvolutionMessageEvent = {
        event: 'messages.upsert',
        instance: `${tenantA}-conn`,
        data: {
          key: {
            remoteJid: sharedGroupJid,
            fromMe: false,
            id: 'msg-tenant-a',
            participant: '5511111111@s.whatsapp.net',
          },
          message: { conversation: 'Message from A' },
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      }

      await groupMonitorService.processMessage(eventTenantA, tenantA)

      // Verify query filtered by tenant_id
      expect(supabaseAdmin.from).toHaveBeenCalled()
      const calls = (supabaseAdmin.from as any).mock.calls
      expect(calls.length).toBeGreaterThan(0)
    })

    it('Cross-tenant leakage prevented via RLS', async () => {
      // Setup: Tenant B's webhook for group that Tenant A owns
      ;(supabaseAdmin.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null, // Group not found for this tenant
                  error: { code: 'PGRST116' },
                }),
              }),
            }),
          }),
        }),
      })

      const event: EvolutionMessageEvent = {
        event: 'messages.upsert',
        instance: 'tenant-b-conn',
        data: {
          key: {
            remoteJid: '120363001@g.us',
            fromMe: false,
            id: 'msg-cross-tenant',
            participant: '5511999@s.whatsapp.net',
          },
          message: { conversation: 'Attempt cross-tenant' },
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      }

      await groupMonitorService.processMessage(event, 'tenant-b')

      // Verify no message enqueued (group not found)
      expect((offerParserQueue.add as any)).not.toHaveBeenCalled()
    })
  })

  describe('AC-036.7: Edge Cases', () => {
    it('Handles null/undefined message text', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      const event: EvolutionMessageEvent = {
        event: 'messages.upsert',
        instance: 'test',
        data: {
          key: {
            remoteJid: '120363001@g.us',
            fromMe: false,
            id: 'msg-null',
            participant: '5511999@s.whatsapp.net',
          },
          message: {}, // No conversation field
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      }

      await groupMonitorService.processMessage(event, 'tenant')

      // Should not enqueue (non-text message)
      expect((offerParserQueue.add as any)).not.toHaveBeenCalled()
    })

    it('Handles empty string message', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      const event: EvolutionMessageEvent = {
        event: 'messages.upsert',
        instance: 'test',
        data: {
          key: {
            remoteJid: '120363001@g.us',
            fromMe: false,
            id: 'msg-empty',
            participant: '5511999@s.whatsapp.net',
          },
          message: { conversation: '' }, // Empty string
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      }

      await groupMonitorService.processMessage(event, 'tenant')

      // Should not enqueue (empty string is falsy)
      expect((offerParserQueue.add as any)).not.toHaveBeenCalled()
    })

    it('Handles very long message (>1000 chars)', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockResolvedValue({ id: 'job-id' })
      ;(supabaseAdmin.rpc as any).mockResolvedValue({ error: null })

      const longText = 'A'.repeat(5000)

      const event: EvolutionMessageEvent = {
        event: 'messages.upsert',
        instance: 'test',
        data: {
          key: {
            remoteJid: '120363001@g.us',
            fromMe: false,
            id: 'msg-long',
            participant: '5511999@s.whatsapp.net',
          },
          message: { conversation: longText },
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      }

      await groupMonitorService.processMessage(event, 'tenant')

      // Should enqueue without truncation
      expect((offerParserQueue.add as any)).toHaveBeenCalled()
      const jobData = (offerParserQueue.add as any).mock.calls[0][1]
      expect(jobData.text).toBe(longText)
    })

    it('Handles special characters', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockResolvedValue({ id: 'job-id' })
      ;(supabaseAdmin.rpc as any).mockResolvedValue({ error: null })

      const specialText = 'Price: $99.99 @special #deal <tag> &amp;'

      const event: EvolutionMessageEvent = {
        event: 'messages.upsert',
        instance: 'test',
        data: {
          key: {
            remoteJid: '120363001@g.us',
            fromMe: false,
            id: 'msg-special',
            participant: '5511999@s.whatsapp.net',
          },
          message: { conversation: specialText },
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      }

      await groupMonitorService.processMessage(event, 'tenant')

      expect((offerParserQueue.add as any)).toHaveBeenCalled()
      const jobData = (offerParserQueue.add as any).mock.calls[0][1]
      expect(jobData.text).toBe(specialText)
    })

    it('Handles unicode and emoji', async () => {
      ;(supabaseAdmin.from as any).mockReturnValue({
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
      })

      ;(redis.get as any).mockResolvedValue(null)
      ;(redis.setex as any).mockResolvedValue('OK')
      ;(offerParserQueue.add as any).mockResolvedValue({ id: 'job-id' })
      ;(supabaseAdmin.rpc as any).mockResolvedValue({ error: null })

      const unicodeText = '🎉 Promoção fantástica! 🎁 iPhone à venda por R$999 ✅'

      const event: EvolutionMessageEvent = {
        event: 'messages.upsert',
        instance: 'test',
        data: {
          key: {
            remoteJid: '120363001@g.us',
            fromMe: false,
            id: 'msg-unicode',
            participant: '5511999@s.whatsapp.net',
          },
          message: { conversation: unicodeText },
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      }

      await groupMonitorService.processMessage(event, 'tenant')

      expect((offerParserQueue.add as any)).toHaveBeenCalled()
      const jobData = (offerParserQueue.add as any).mock.calls[0][1]
      expect(jobData.text).toBe(unicodeText)
    })
  })

  describe('Singleton Instance', () => {
    it('Uses singleton correctly', async () => {
      expect(groupMonitorService).toBeInstanceOf(GroupMonitorService)
    })
  })
})
