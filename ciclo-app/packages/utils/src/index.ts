/**
 * Formata valor em centavos para exibição em BRL
 * Todos os valores monetarios sao armazenados em centavos (PRD FR-02.2)
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Converte reais para centavos
 */
export function toCents(reais: number): number {
  return Math.round(reais * 100)
}

/**
 * Converte centavos para reais
 */
export function toReais(cents: number): number {
  return cents / 100
}

// Pricing utilities (Story E2.3)
export {
  calculateCurrentPrice,
  calculatePricing,
  centavosToReais,
  reaisToCentavos,
} from './pricing'

export type {
  TicketPricing,
  PricingTier,
  PricingResult,
} from './pricing'

// Cancellation policy utilities (Story E3.5)
export {
  calculateRefund,
  validateCancellationPolicy,
  dbPolicyToDomain,
  domainPolicyToDb,
  DEFAULT_CANCELLATION_POLICY,
} from './cancellation'

export type {
  CancellationRule,
  CancellationPolicy,
  RefundResult,
} from './cancellation'

// Payment gateway utilities (Story E3.2)
export {
  getPaymentGateway,
  PAYMENT_STATUS,
  DEFAULT_PIX_TIMEOUT_MINUTES,
} from './payments'

export type {
  PaymentGateway,
  PaymentResult,
  PaymentStatus,
  PaymentStatusValue,
} from './payments'

// QR Code signing utilities (Story E3.4)
export {
  createSignedQRPayload,
  verifyQRPayload,
} from './qrcode'

export type {
  QRPayload,
  SignedQRData,
  VerifyResult,
} from './qrcode'
