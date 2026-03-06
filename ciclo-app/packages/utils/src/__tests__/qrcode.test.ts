import { describe, it, expect } from 'vitest'
import {
  createSignedQRPayload,
  verifyQRPayload,
} from '../qrcode'
import type { QRPayload } from '../qrcode'

const TEST_SECRET = 'test-secret-key-for-hmac-256-signing'

const samplePayload: QRPayload = {
  registrationId: '550e8400-e29b-41d4-a716-446655440000',
  eventSlug: 'solstício-inverno-2026',
  participantName: 'Maria Silva',
  ticketTypeName: 'Integral',
  eventDate: '2026-06-21',
}

describe('QR Code Signing & Verification', () => {
  describe('createSignedQRPayload', () => {
    it('should create a valid JSON string with payload and signature', () => {
      const result = createSignedQRPayload(samplePayload, TEST_SECRET)
      const parsed = JSON.parse(result)

      expect(parsed).toHaveProperty('payload')
      expect(parsed).toHaveProperty('signature')
      expect(parsed.payload).toEqual(samplePayload)
      expect(typeof parsed.signature).toBe('string')
      expect(parsed.signature).toHaveLength(64) // SHA-256 hex = 64 chars
    })

    it('should produce deterministic output for same input', () => {
      const result1 = createSignedQRPayload(samplePayload, TEST_SECRET)
      const result2 = createSignedQRPayload(samplePayload, TEST_SECRET)

      expect(result1).toBe(result2)
    })

    it('should produce different signatures for different secrets', () => {
      const result1 = createSignedQRPayload(samplePayload, 'secret-a')
      const result2 = createSignedQRPayload(samplePayload, 'secret-b')

      const parsed1 = JSON.parse(result1)
      const parsed2 = JSON.parse(result2)

      expect(parsed1.signature).not.toBe(parsed2.signature)
    })

    it('should produce different signatures for different payloads', () => {
      const modified = { ...samplePayload, participantName: 'Joao Santos' }
      const result1 = createSignedQRPayload(samplePayload, TEST_SECRET)
      const result2 = createSignedQRPayload(modified, TEST_SECRET)

      const parsed1 = JSON.parse(result1)
      const parsed2 = JSON.parse(result2)

      expect(parsed1.signature).not.toBe(parsed2.signature)
    })

    it('should throw if secret is empty', () => {
      expect(() => createSignedQRPayload(samplePayload, '')).toThrow(
        'QR_SECRET is required'
      )
    })
  })

  describe('verifyQRPayload', () => {
    it('should return valid=true for correctly signed payload', () => {
      const signed = createSignedQRPayload(samplePayload, TEST_SECRET)
      const result = verifyQRPayload(signed, TEST_SECRET)

      expect(result.valid).toBe(true)
      expect(result.data).toEqual(samplePayload)
    })

    it('should return valid=false for wrong secret', () => {
      const signed = createSignedQRPayload(samplePayload, TEST_SECRET)
      const result = verifyQRPayload(signed, 'wrong-secret')

      expect(result.valid).toBe(false)
      expect(result.data).toBeUndefined()
    })

    it('should return valid=false for tampered payload', () => {
      const signed = createSignedQRPayload(samplePayload, TEST_SECRET)
      const parsed = JSON.parse(signed)
      parsed.payload.participantName = 'Hacker'
      const tampered = JSON.stringify(parsed)

      const result = verifyQRPayload(tampered, TEST_SECRET)

      expect(result.valid).toBe(false)
    })

    it('should return valid=false for tampered signature', () => {
      const signed = createSignedQRPayload(samplePayload, TEST_SECRET)
      const parsed = JSON.parse(signed)
      parsed.signature = 'a'.repeat(64)
      const tampered = JSON.stringify(parsed)

      const result = verifyQRPayload(tampered, TEST_SECRET)

      expect(result.valid).toBe(false)
    })

    it('should return valid=false for invalid JSON', () => {
      const result = verifyQRPayload('not-json', TEST_SECRET)

      expect(result.valid).toBe(false)
    })

    it('should return valid=false for empty secret', () => {
      const signed = createSignedQRPayload(samplePayload, TEST_SECRET)
      const result = verifyQRPayload(signed, '')

      expect(result.valid).toBe(false)
    })

    it('should return valid=false for missing payload field', () => {
      const result = verifyQRPayload(
        JSON.stringify({ signature: 'abc123' }),
        TEST_SECRET
      )

      expect(result.valid).toBe(false)
    })

    it('should return valid=false for missing signature field', () => {
      const result = verifyQRPayload(
        JSON.stringify({ payload: samplePayload }),
        TEST_SECRET
      )

      expect(result.valid).toBe(false)
    })

    it('should return valid=false for signature with wrong length', () => {
      const signed = createSignedQRPayload(samplePayload, TEST_SECRET)
      const parsed = JSON.parse(signed)
      parsed.signature = 'abc' // wrong length
      const tampered = JSON.stringify(parsed)

      const result = verifyQRPayload(tampered, TEST_SECRET)

      expect(result.valid).toBe(false)
    })
  })

  describe('round-trip integration', () => {
    it('should sign and verify multiple payloads correctly', () => {
      const payloads: QRPayload[] = [
        samplePayload,
        {
          registrationId: '11111111-1111-1111-1111-111111111111',
          eventSlug: 'equinócio-primavera-2026',
          participantName: 'Carlos Oliveira',
          ticketTypeName: 'Meia',
          eventDate: '2026-09-22',
        },
        {
          registrationId: '22222222-2222-2222-2222-222222222222',
          eventSlug: 'imbolc-2026',
          participantName: 'Ana Costa',
          ticketTypeName: 'VIP',
          eventDate: '2026-02-01',
        },
      ]

      for (const payload of payloads) {
        const signed = createSignedQRPayload(payload, TEST_SECRET)
        const result = verifyQRPayload(signed, TEST_SECRET)

        expect(result.valid).toBe(true)
        expect(result.data).toEqual(payload)
      }
    })
  })
})
