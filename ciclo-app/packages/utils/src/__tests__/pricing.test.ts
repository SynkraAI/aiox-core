import {
  calculateCurrentPrice,
  calculatePricing,
  centavosToReais,
  reaisToCentavos,
} from '../pricing'
import type { TicketPricing } from '../pricing'

// ============================================================
// calculateCurrentPrice / calculatePricing
// ============================================================

describe('calculateCurrentPrice', () => {
  const baseTicket: TicketPricing = {
    earlyBirdPrice: 35000, // R$ 350,00
    earlyBirdDeadline: new Date('2026-04-01T00:00:00Z'),
    regularPrice: 45000, // R$ 450,00
    lastMinutePrice: 55000, // R$ 550,00
    lastMinuteStart: new Date('2026-05-15T00:00:00Z'),
  }

  it('should return earlyBirdPrice when currentDate is before deadline', () => {
    const currentDate = new Date('2026-03-15T00:00:00Z')
    expect(calculateCurrentPrice(baseTicket, currentDate)).toBe(35000)
  })

  it('should return earlyBirdPrice when currentDate equals deadline', () => {
    const currentDate = new Date('2026-04-01T00:00:00Z')
    expect(calculateCurrentPrice(baseTicket, currentDate)).toBe(35000)
  })

  it('should return regularPrice when currentDate is between deadlines', () => {
    const currentDate = new Date('2026-04-15T00:00:00Z')
    expect(calculateCurrentPrice(baseTicket, currentDate)).toBe(45000)
  })

  it('should return lastMinutePrice when currentDate is after lastMinuteStart', () => {
    const currentDate = new Date('2026-05-20T00:00:00Z')
    expect(calculateCurrentPrice(baseTicket, currentDate)).toBe(55000)
  })

  it('should return lastMinutePrice when currentDate equals lastMinuteStart', () => {
    const currentDate = new Date('2026-05-15T00:00:00Z')
    expect(calculateCurrentPrice(baseTicket, currentDate)).toBe(55000)
  })

  it('should return regularPrice when no earlyBirdDeadline is set', () => {
    const ticket: TicketPricing = {
      ...baseTicket,
      earlyBirdDeadline: null,
    }
    const currentDate = new Date('2026-03-01T00:00:00Z')
    expect(calculateCurrentPrice(ticket, currentDate)).toBe(45000)
  })

  it('should return regularPrice when no lastMinuteStart is set and past early bird', () => {
    const ticket: TicketPricing = {
      ...baseTicket,
      lastMinuteStart: null,
      lastMinutePrice: null,
    }
    const currentDate = new Date('2026-04-15T00:00:00Z')
    expect(calculateCurrentPrice(ticket, currentDate)).toBe(45000)
  })

  it('should return regularPrice when lastMinutePrice is null but lastMinuteStart passed', () => {
    const ticket: TicketPricing = {
      ...baseTicket,
      lastMinutePrice: null,
    }
    const currentDate = new Date('2026-05-20T00:00:00Z')
    // Falls back to regularPrice when lastMinutePrice is null
    expect(calculateCurrentPrice(ticket, currentDate)).toBe(45000)
  })

  it('should return regularPrice when both deadlines are null', () => {
    const ticket: TicketPricing = {
      earlyBirdPrice: 35000,
      earlyBirdDeadline: null,
      regularPrice: 45000,
      lastMinutePrice: null,
      lastMinuteStart: null,
    }
    const currentDate = new Date('2026-06-01T00:00:00Z')
    expect(calculateCurrentPrice(ticket, currentDate)).toBe(45000)
  })
})

describe('calculatePricing', () => {
  const baseTicket: TicketPricing = {
    earlyBirdPrice: 35000,
    earlyBirdDeadline: new Date('2026-04-01T00:00:00Z'),
    regularPrice: 45000,
    lastMinutePrice: 55000,
    lastMinuteStart: new Date('2026-05-15T00:00:00Z'),
  }

  it('should return early_bird tier when in early bird period', () => {
    const result = calculatePricing(baseTicket, new Date('2026-03-15T00:00:00Z'))
    expect(result.tier).toBe('early_bird')
    expect(result.price).toBe(35000)
  })

  it('should return regular tier when in regular period', () => {
    const result = calculatePricing(baseTicket, new Date('2026-04-15T00:00:00Z'))
    expect(result.tier).toBe('regular')
    expect(result.price).toBe(45000)
  })

  it('should return last_minute tier when in last minute period', () => {
    const result = calculatePricing(baseTicket, new Date('2026-05-20T00:00:00Z'))
    expect(result.tier).toBe('last_minute')
    expect(result.price).toBe(55000)
  })
})

// ============================================================
// centavosToReais
// ============================================================

describe('centavosToReais', () => {
  it('should format 123456 as R$ 1.234,56', () => {
    const result = centavosToReais(123456)
    // Intl may use non-breaking space
    expect(result.replace(/\s/g, ' ')).toMatch(/R\$\s?1\.234,56/)
  })

  it('should format 0 as R$ 0,00', () => {
    const result = centavosToReais(0)
    expect(result.replace(/\s/g, ' ')).toMatch(/R\$\s?0,00/)
  })

  it('should format 100 as R$ 1,00', () => {
    const result = centavosToReais(100)
    expect(result.replace(/\s/g, ' ')).toMatch(/R\$\s?1,00/)
  })

  it('should format 45000 as R$ 450,00', () => {
    const result = centavosToReais(45000)
    expect(result.replace(/\s/g, ' ')).toMatch(/R\$\s?450,00/)
  })
})

// ============================================================
// reaisToCentavos
// ============================================================

describe('reaisToCentavos', () => {
  it('should convert "1234.56" to 123456', () => {
    expect(reaisToCentavos('1234.56')).toBe(123456)
  })

  it('should convert "450.00" to 45000', () => {
    expect(reaisToCentavos('450.00')).toBe(45000)
  })

  it('should convert "1234,56" (comma) to 123456', () => {
    expect(reaisToCentavos('1234,56')).toBe(123456)
  })

  it('should handle "R$ 1.234,56" with currency prefix', () => {
    expect(reaisToCentavos('R$ 1.234,56')).toBe(123456)
  })

  it('should return 0 for invalid input', () => {
    expect(reaisToCentavos('abc')).toBe(0)
  })

  it('should return 0 for empty string', () => {
    expect(reaisToCentavos('')).toBe(0)
  })

  it('should convert "0.01" to 1', () => {
    expect(reaisToCentavos('0.01')).toBe(1)
  })
})
