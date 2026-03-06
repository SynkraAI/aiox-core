/**
 * Cancellation policy calculation utilities
 * Pure functions — no side effects, fully testable
 * Story E3.5 — Política de Cancelamento Editavel
 * PRD Ref: FR-02.3, Apendice A
 */

// ============================================================
// Types
// ============================================================

export interface CancellationRule {
  daysBeforeEvent: number
  refundPercent: number
}

export interface CancellationPolicy {
  rules: CancellationRule[] // sorted by daysBeforeEvent desc
  transferAlwaysAllowed: boolean
}

export interface RefundResult {
  refundPercent: number
  refundAmount: number // centavos
  rule: CancellationRule | null
}

// ============================================================
// Default Policy (Apendice A)
// ============================================================

/**
 * Politica padrão conforme Apendice A do PRD:
 * - +15 dias antes do evento: 80% reembolso
 * - 7 a 14 dias antes do evento: 50% reembolso
 * - <7 dias antes do evento: 0% reembolso
 * Transferência sempre permitida sem custo
 */
export const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  rules: [
    { daysBeforeEvent: 15, refundPercent: 80 },
    { daysBeforeEvent: 7, refundPercent: 50 },
    { daysBeforeEvent: 0, refundPercent: 0 },
  ],
  transferAlwaysAllowed: true,
}

// ============================================================
// Core Logic
// ============================================================

/**
 * Calcula a diferenca em dias entre duas datas (somente parte de data, sem horário).
 * Retorna número inteiro de dias.
 */
function diffInDays(eventDate: Date, cancelDate: Date): number {
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const cancelDay = new Date(cancelDate.getFullYear(), cancelDate.getMonth(), cancelDate.getDate())
  const diffMs = eventDay.getTime() - cancelDay.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Calcula o reembolso de acordo com a política de cancelamento.
 *
 * As regras devem estar ordenadas por daysBeforeEvent descendente.
 * O sistema itera as regras de cima para baixo e aplica a primeira
 * cujo threshold <= daysRemaining.
 *
 * @param eventDate - Data de inicio do evento
 * @param cancelDate - Data do pedido de cancelamento
 * @param policy - Politica de cancelamento a aplicar
 * @param paymentAmount - Valor pago em centavos
 * @returns Resultado com percentual, valor de reembolso e regra aplicada
 */
export function calculateRefund(
  eventDate: Date,
  cancelDate: Date,
  policy: CancellationPolicy,
  paymentAmount: number,
): RefundResult {
  // Evento no passado: sem reembolso
  const daysRemaining = diffInDays(eventDate, cancelDate)

  if (daysRemaining < 0) {
    return { refundPercent: 0, refundAmount: 0, rule: null }
  }

  // Regras ordenadas por daysBeforeEvent desc
  const sortedRules = [...policy.rules].sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent)

  for (const rule of sortedRules) {
    if (daysRemaining >= rule.daysBeforeEvent) {
      const refundPercent = rule.refundPercent
      const refundAmount = Math.round((paymentAmount * refundPercent) / 100)
      return { refundPercent, refundAmount, rule }
    }
  }

  // Nenhuma regra aplicavel (nao deveria acontecer com regra de 0 dias)
  return { refundPercent: 0, refundAmount: 0, rule: null }
}

// ============================================================
// Helpers
// ============================================================

/**
 * Valida que as regras de uma política estão consistentes:
 * - Pelo menos 1 regra
 * - daysBeforeEvent >= 0
 * - refundPercent entre 0 e 100
 * - Sem duplicatas de daysBeforeEvent
 */
export function validateCancellationPolicy(policy: CancellationPolicy): string[] {
  const errors: string[] = []

  if (!policy.rules || policy.rules.length === 0) {
    errors.push('A política deve ter pelo menos uma regra')
    return errors
  }

  const seenDays = new Set<number>()

  for (const rule of policy.rules) {
    if (rule.daysBeforeEvent < 0) {
      errors.push(`daysBeforeEvent deve ser >= 0 (recebido: ${rule.daysBeforeEvent})`)
    }

    if (rule.refundPercent < 0 || rule.refundPercent > 100) {
      errors.push(`refundPercent deve ser entre 0 e 100 (recebido: ${rule.refundPercent})`)
    }

    if (seenDays.has(rule.daysBeforeEvent)) {
      errors.push(`daysBeforeEvent duplicado: ${rule.daysBeforeEvent}`)
    }
    seenDays.add(rule.daysBeforeEvent)
  }

  return errors
}

/**
 * Converte modelo do banco (CancellationPolicy do Prisma) para CancellationPolicy do dominio.
 * O modelo do Prisma usa campos fixos (earlyDaysThreshold, midDaysLowerThreshold, etc.)
 * enquanto o dominio usa array de regras flexivel.
 */
export function dbPolicyToDomain(dbPolicy: {
  earlyDaysThreshold: number
  earlyRefundPercent: number
  midDaysLowerThreshold: number
  midRefundPercent: number
  transferAllowed: boolean
}): CancellationPolicy {
  return {
    rules: [
      { daysBeforeEvent: dbPolicy.earlyDaysThreshold, refundPercent: dbPolicy.earlyRefundPercent },
      {
        daysBeforeEvent: dbPolicy.midDaysLowerThreshold,
        refundPercent: dbPolicy.midRefundPercent,
      },
      { daysBeforeEvent: 0, refundPercent: 0 },
    ],
    transferAlwaysAllowed: dbPolicy.transferAllowed,
  }
}

/**
 * Converte CancellationPolicy do dominio para campos do modelo Prisma.
 * Espera exatamente 3 regras ordenadas por daysBeforeEvent desc.
 */
export function domainPolicyToDb(policy: CancellationPolicy): {
  earlyDaysThreshold: number
  earlyRefundPercent: number
  midDaysLowerThreshold: number
  midRefundPercent: number
  transferAllowed: boolean
} {
  const sorted = [...policy.rules].sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent)

  const early = sorted[0] ?? { daysBeforeEvent: 15, refundPercent: 80 }
  const mid = sorted[1] ?? { daysBeforeEvent: 7, refundPercent: 50 }

  return {
    earlyDaysThreshold: early.daysBeforeEvent,
    earlyRefundPercent: early.refundPercent,
    midDaysLowerThreshold: mid.daysBeforeEvent,
    midRefundPercent: mid.refundPercent,
    transferAllowed: policy.transferAlwaysAllowed,
  }
}
