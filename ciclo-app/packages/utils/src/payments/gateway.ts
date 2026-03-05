/**
 * Payment Gateway abstraction layer
 * Story E3.2 — AC-1: Interface PaymentGateway + types PaymentResult, PaymentStatus
 *
 * All gateway implementations (MercadoPago, Stripe) implement this interface.
 * Never call SDK/API directly from components — always via PaymentGateway.
 */

// ============================================================
// Enums & Constants
// ============================================================

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export type PaymentStatusValue = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

/** Default PIX timeout in minutes */
export const DEFAULT_PIX_TIMEOUT_MINUTES = 30

// ============================================================
// Types
// ============================================================

export interface PaymentResult {
  success: boolean
  paymentId: string
  externalId: string
  /** PIX: chave para geracao de QR Code */
  pixKey?: string
  /** PIX: string copia-e-cola */
  pixCopiaECola?: string
  /** PIX: QR Code em base64 (data URI) */
  pixQrCodeBase64?: string
  /** PIX: data de expiracao */
  expiresAt?: Date
  /** Boleto: URL do PDF */
  boletoUrl?: string
  /** Boleto: codigo de barras / linha digitavel */
  boletoCode?: string
  /** Boleto: data de vencimento */
  boletoDueDate?: Date
  /** Card: Stripe client secret para frontend */
  clientSecret?: string
  /** Error message when success=false */
  error?: string
}

export interface PaymentStatus {
  status: PaymentStatusValue
  externalId: string
  paidAt?: Date
}

// ============================================================
// Interface
// ============================================================

export interface PaymentGateway {
  /**
   * Creates a payment for a registration.
   * @param registrationId - Internal registration UUID
   * @param method - PIX, BOLETO, or CREDIT_CARD
   * @param amount - Amount in centavos
   * @returns PaymentResult with gateway-specific data
   */
  createPayment(
    registrationId: string,
    method: string,
    amount: number
  ): Promise<PaymentResult>

  /**
   * Checks the current status of a payment.
   * @param externalId - The gateway's external payment ID
   * @returns PaymentStatus with current state
   */
  getPaymentStatus(externalId: string): Promise<PaymentStatus>
}
