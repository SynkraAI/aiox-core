import {
  calculateRefund,
  validateCancellationPolicy,
  dbPolicyToDomain,
  domainPolicyToDb,
  DEFAULT_CANCELLATION_POLICY,
} from '../cancellation'
import type { CancellationPolicy } from '../cancellation'

// ============================================================
// calculateRefund — Tiers padrão (80%, 50%, 0%)
// ============================================================

describe('calculateRefund', () => {
  const eventDate = new Date('2026-06-20')
  const paymentAmount = 45000 // R$ 450,00

  describe('com política padrão (3 tiers)', () => {
    it('deve retornar 80% quando cancelamento e +15 dias antes do evento', () => {
      const cancelDate = new Date('2026-06-01') // 19 dias antes
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, paymentAmount)
      expect(result.refundPercent).toBe(80)
      expect(result.refundAmount).toBe(36000)
      expect(result.rule?.daysBeforeEvent).toBe(15)
    })

    it('deve retornar 80% quando cancelamento e exatamente 15 dias antes', () => {
      const cancelDate = new Date('2026-06-05') // 15 dias antes
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, paymentAmount)
      expect(result.refundPercent).toBe(80)
      expect(result.refundAmount).toBe(36000)
      expect(result.rule?.daysBeforeEvent).toBe(15)
    })

    it('deve retornar 50% quando cancelamento e 14 dias antes', () => {
      const cancelDate = new Date('2026-06-06') // 14 dias antes
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, paymentAmount)
      expect(result.refundPercent).toBe(50)
      expect(result.refundAmount).toBe(22500)
      expect(result.rule?.daysBeforeEvent).toBe(7)
    })

    it('deve retornar 50% quando cancelamento e exatamente 7 dias antes', () => {
      const cancelDate = new Date('2026-06-13') // 7 dias antes
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, paymentAmount)
      expect(result.refundPercent).toBe(50)
      expect(result.refundAmount).toBe(22500)
      expect(result.rule?.daysBeforeEvent).toBe(7)
    })

    it('deve retornar 0% quando cancelamento e 6 dias antes (<7)', () => {
      const cancelDate = new Date('2026-06-14') // 6 dias antes
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, paymentAmount)
      expect(result.refundPercent).toBe(0)
      expect(result.refundAmount).toBe(0)
      expect(result.rule?.daysBeforeEvent).toBe(0)
    })

    it('deve retornar 0% quando cancelamento e no mesmo dia do evento (0 dias)', () => {
      const cancelDate = new Date('2026-06-20') // 0 dias antes
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, paymentAmount)
      expect(result.refundPercent).toBe(0)
      expect(result.refundAmount).toBe(0)
    })

    it('deve retornar 0% quando evento já passou', () => {
      const cancelDate = new Date('2026-06-21') // 1 dia depois
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, paymentAmount)
      expect(result.refundPercent).toBe(0)
      expect(result.refundAmount).toBe(0)
      expect(result.rule).toBeNull()
    })
  })

  // ============================================================
  // Edge cases
  // ============================================================

  describe('edge cases', () => {
    it('deve retornar 0 centavos quando paymentAmount e 0', () => {
      const cancelDate = new Date('2026-06-01')
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, 0)
      expect(result.refundPercent).toBe(80)
      expect(result.refundAmount).toBe(0)
    })

    it('deve arredondar centavos corretamente (sem fracao de centavo)', () => {
      const cancelDate = new Date('2026-06-01')
      // 33333 * 80% = 26666.4 → arredonda para 26666
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, 33333)
      expect(result.refundAmount).toBe(26666)
      expect(Number.isInteger(result.refundAmount)).toBe(true)
    })

    it('deve lidar com valores grandes (R$ 10.000,00)', () => {
      const cancelDate = new Date('2026-06-01')
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, 1000000)
      expect(result.refundAmount).toBe(800000)
    })

    it('deve retornar 80% com 30 dias de antecedência', () => {
      const cancelDate = new Date('2026-05-21') // 30 dias antes
      const result = calculateRefund(eventDate, cancelDate, DEFAULT_CANCELLATION_POLICY, paymentAmount)
      expect(result.refundPercent).toBe(80)
    })
  })

  // ============================================================
  // Politica customizada
  // ============================================================

  describe('com política customizada', () => {
    it('deve aplicar regras de política com 2 tiers apenas', () => {
      const customPolicy: CancellationPolicy = {
        rules: [
          { daysBeforeEvent: 10, refundPercent: 100 },
          { daysBeforeEvent: 0, refundPercent: 0 },
        ],
        transferAlwaysAllowed: false,
      }
      const cancelDate = new Date('2026-06-08') // 12 dias antes
      const result = calculateRefund(eventDate, cancelDate, customPolicy, paymentAmount)
      expect(result.refundPercent).toBe(100)
      expect(result.refundAmount).toBe(45000)
    })

    it('deve aplicar regras de política com 4 tiers', () => {
      const customPolicy: CancellationPolicy = {
        rules: [
          { daysBeforeEvent: 30, refundPercent: 100 },
          { daysBeforeEvent: 15, refundPercent: 75 },
          { daysBeforeEvent: 7, refundPercent: 25 },
          { daysBeforeEvent: 0, refundPercent: 0 },
        ],
        transferAlwaysAllowed: true,
      }

      // 20 dias antes: cai na regra de 15 dias (75%)
      const result1 = calculateRefund(eventDate, new Date('2026-05-31'), customPolicy, paymentAmount)
      expect(result1.refundPercent).toBe(75)

      // 35 dias antes: cai na regra de 30 dias (100%)
      const result2 = calculateRefund(eventDate, new Date('2026-05-16'), customPolicy, paymentAmount)
      expect(result2.refundPercent).toBe(100)
    })

    it('deve funcionar com regras fora de ordem (reordena internamente)', () => {
      const unorderedPolicy: CancellationPolicy = {
        rules: [
          { daysBeforeEvent: 0, refundPercent: 0 },
          { daysBeforeEvent: 15, refundPercent: 80 },
          { daysBeforeEvent: 7, refundPercent: 50 },
        ],
        transferAlwaysAllowed: true,
      }
      const cancelDate = new Date('2026-06-01')
      const result = calculateRefund(eventDate, cancelDate, unorderedPolicy, paymentAmount)
      expect(result.refundPercent).toBe(80)
    })
  })

  // ============================================================
  // transferAlwaysAllowed (flag informativa)
  // ============================================================

  describe('transferAlwaysAllowed', () => {
    it('deve estar true na política padrão', () => {
      expect(DEFAULT_CANCELLATION_POLICY.transferAlwaysAllowed).toBe(true)
    })
  })
})

// ============================================================
// validateCancellationPolicy
// ============================================================

describe('validateCancellationPolicy', () => {
  it('deve retornar vazio para política padrão valida', () => {
    const errors = validateCancellationPolicy(DEFAULT_CANCELLATION_POLICY)
    expect(errors).toHaveLength(0)
  })

  it('deve reportar erro para política sem regras', () => {
    const errors = validateCancellationPolicy({ rules: [], transferAlwaysAllowed: true })
    expect(errors).toContain('A política deve ter pelo menos uma regra')
  })

  it('deve reportar erro para daysBeforeEvent negativo', () => {
    const errors = validateCancellationPolicy({
      rules: [{ daysBeforeEvent: -1, refundPercent: 50 }],
      transferAlwaysAllowed: true,
    })
    expect(errors.some((e) => e.includes('daysBeforeEvent deve ser >= 0'))).toBe(true)
  })

  it('deve reportar erro para refundPercent fora do range', () => {
    const errors = validateCancellationPolicy({
      rules: [{ daysBeforeEvent: 10, refundPercent: 150 }],
      transferAlwaysAllowed: true,
    })
    expect(errors.some((e) => e.includes('refundPercent deve ser entre 0 e 100'))).toBe(true)
  })

  it('deve reportar erro para daysBeforeEvent duplicado', () => {
    const errors = validateCancellationPolicy({
      rules: [
        { daysBeforeEvent: 10, refundPercent: 80 },
        { daysBeforeEvent: 10, refundPercent: 50 },
      ],
      transferAlwaysAllowed: true,
    })
    expect(errors.some((e) => e.includes('daysBeforeEvent duplicado'))).toBe(true)
  })
})

// ============================================================
// dbPolicyToDomain / domainPolicyToDb
// ============================================================

describe('dbPolicyToDomain', () => {
  it('deve converter modelo do banco para dominio corretamente', () => {
    const dbPolicy = {
      earlyDaysThreshold: 15,
      earlyRefundPercent: 80,
      midDaysLowerThreshold: 7,
      midRefundPercent: 50,
      transferAllowed: true,
    }
    const result = dbPolicyToDomain(dbPolicy)
    expect(result.rules).toHaveLength(3)
    expect(result.rules[0]).toEqual({ daysBeforeEvent: 15, refundPercent: 80 })
    expect(result.rules[1]).toEqual({ daysBeforeEvent: 7, refundPercent: 50 })
    expect(result.rules[2]).toEqual({ daysBeforeEvent: 0, refundPercent: 0 })
    expect(result.transferAlwaysAllowed).toBe(true)
  })
})

describe('domainPolicyToDb', () => {
  it('deve converter dominio para modelo do banco corretamente', () => {
    const result = domainPolicyToDb(DEFAULT_CANCELLATION_POLICY)
    expect(result.earlyDaysThreshold).toBe(15)
    expect(result.earlyRefundPercent).toBe(80)
    expect(result.midDaysLowerThreshold).toBe(7)
    expect(result.midRefundPercent).toBe(50)
    expect(result.transferAllowed).toBe(true)
  })

  it('deve ser inversa de dbPolicyToDomain (roundtrip)', () => {
    const db = domainPolicyToDb(DEFAULT_CANCELLATION_POLICY)
    const domain = dbPolicyToDomain(db)
    expect(domain.rules).toEqual(DEFAULT_CANCELLATION_POLICY.rules)
    expect(domain.transferAlwaysAllowed).toBe(DEFAULT_CANCELLATION_POLICY.transferAlwaysAllowed)
  })
})
