/**
 * Pricing utility for dynamic ticket pricing
 * Pure functions — no side effects, fully testable
 * Story E2.3 — CRUD de Tipos de Ingresso (Admin)
 */

// ============================================================
// Types
// ============================================================

export interface TicketPricing {
  earlyBirdPrice: number // centavos
  earlyBirdDeadline: Date | null
  regularPrice: number // centavos
  lastMinutePrice: number | null // centavos
  lastMinuteStart: Date | null
}

export type PricingTier = 'early_bird' | 'regular' | 'last_minute'

export interface PricingResult {
  price: number // centavos
  tier: PricingTier
}

// ============================================================
// Core Pricing Logic
// ============================================================

/**
 * Calcula o preco atual baseado na data e nas faixas de pricing
 *
 * Regras:
 * - Se currentDate <= earlyBirdDeadline -> earlyBirdPrice
 * - Se currentDate >= lastMinuteStart -> lastMinutePrice (ou regularPrice se null)
 * - Caso contrario -> regularPrice
 *
 * @param ticket - Dados de pricing do ingresso
 * @param currentDate - Data atual (injetada para testabilidade)
 * @returns Preco em centavos
 */
export function calculateCurrentPrice(
  ticket: TicketPricing,
  currentDate: Date,
): number {
  return calculatePricing(ticket, currentDate).price
}

/**
 * Calcula preco e faixa de pricing atual
 *
 * @param ticket - Dados de pricing do ingresso
 * @param currentDate - Data atual (injetada para testabilidade)
 * @returns Objeto com preco em centavos e faixa (tier)
 */
export function calculatePricing(
  ticket: TicketPricing,
  currentDate: Date,
): PricingResult {
  // Early bird: se tem deadline e a data atual esta dentro do prazo
  if (ticket.earlyBirdDeadline && currentDate <= ticket.earlyBirdDeadline) {
    return { price: ticket.earlyBirdPrice, tier: 'early_bird' }
  }

  // Last minute: se tem data de inicio e a data atual passou dela
  if (ticket.lastMinuteStart && currentDate >= ticket.lastMinuteStart) {
    return {
      price: ticket.lastMinutePrice ?? ticket.regularPrice,
      tier: 'last_minute',
    }
  }

  // Regular: caso padrao
  return { price: ticket.regularPrice, tier: 'regular' }
}

// ============================================================
// Currency Helpers
// ============================================================

/**
 * Converte valor em centavos para string formatada em Reais
 * @example centavosToReais(123456) => "R$ 1.234,56"
 */
export function centavosToReais(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(centavos / 100)
}

/**
 * Converte string de reais (ex: "1234.56") para centavos
 * Suporta formato brasileiro (1.234,56) e internacional (1234.56)
 * @example reaisToCentavos("1234.56") => 123456
 * @example reaisToCentavos("1.234,56") => 123456
 */
export function reaisToCentavos(reais: string): number {
  // Remove tudo que nao e digito, ponto ou virgula
  let cleaned = reais.replace(/[^\d.,]/g, '')
  if (!cleaned) return 0

  // Detectar formato brasileiro: se tem virgula como ultimo separador decimal
  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')

  if (lastComma > lastDot) {
    // Formato BR: pontos sao milhares, virgula e decimal
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (lastDot > lastComma && lastComma !== -1) {
    // Formato misto: virgulas sao milhares, ponto e decimal
    cleaned = cleaned.replace(/,/g, '')
  }
  // Se so tem ponto, assume formato internacional (ex: "1234.56")

  const value = parseFloat(cleaned)
  if (isNaN(value)) return 0
  return Math.round(value * 100)
}
