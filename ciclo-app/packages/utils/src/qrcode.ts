/**
 * QR Code Payload Signing & Verification
 * Story E3.4 — AC-1, AC-5: HMAC-SHA256 signed payload for offline-first QR codes
 *
 * The QR payload contains all data needed for offline check-in verification.
 * No network connection required to validate the HMAC signature.
 */

import { createHmac } from 'crypto'

// ============================================================
// Types
// ============================================================

export interface QRPayload {
  registrationId: string
  eventSlug: string
  participantName: string
  ticketTypeName: string
  eventDate: string
}

export interface SignedQRData {
  payload: QRPayload
  signature: string
}

export interface VerifyResult {
  valid: boolean
  data?: QRPayload
}

// ============================================================
// Core Functions
// ============================================================

/**
 * Creates an HMAC-SHA256 signed QR payload.
 * The output is a JSON string containing payload + signature,
 * suitable for embedding in a QR code.
 *
 * @param data - Registration data to sign
 * @param secret - QR_SECRET from environment
 * @returns JSON string with payload and HMAC signature
 */
export function createSignedQRPayload(data: QRPayload, secret: string): string {
  if (!secret) {
    throw new Error('QR_SECRET is required for signing')
  }

  const payloadString = JSON.stringify(data)
  const signature = createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex')

  const signed: SignedQRData = { payload: data, signature }
  return JSON.stringify(signed)
}

/**
 * Verifies an HMAC-SHA256 signed QR payload.
 * Works completely offline — only needs the secret key.
 *
 * @param signedPayload - JSON string from QR code scan
 * @param secret - QR_SECRET from environment
 * @returns Object with valid flag and parsed data if valid
 */
export function verifyQRPayload(
  signedPayload: string,
  secret: string
): VerifyResult {
  if (!secret) {
    return { valid: false }
  }

  try {
    const parsed: SignedQRData = JSON.parse(signedPayload)

    if (!parsed.payload || !parsed.signature) {
      return { valid: false }
    }

    const payloadString = JSON.stringify(parsed.payload)
    const expectedSignature = createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex')

    // Constant-time comparison to prevent timing attacks
    if (parsed.signature.length !== expectedSignature.length) {
      return { valid: false }
    }

    const sigBuffer = Buffer.from(parsed.signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (sigBuffer.length !== expectedBuffer.length) {
      return { valid: false }
    }

    const isValid = require('crypto').timingSafeEqual(sigBuffer, expectedBuffer)

    if (isValid) {
      return { valid: true, data: parsed.payload }
    }

    return { valid: false }
  } catch {
    return { valid: false }
  }
}
