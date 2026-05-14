import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CommissionCalculatorService } from '../commission-calculator.service';
import { Decimal } from 'decimal.js';

describe('CommissionCalculatorService', () => {
  let service: CommissionCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionCalculatorService],
    }).compile();

    service = module.get<CommissionCalculatorService>(CommissionCalculatorService);
  });

  describe('calculateCommission', () => {
    it('should calculate standard 10% commission: 1000 × 10% = 100', () => {
      const result = service.calculateCommission(1000, 10);
      expect(result.toNumber()).toBe(100);
    });

    it('should calculate decimal amounts: 1234.56 × 5.5% = 67.90', () => {
      const result = service.calculateCommission(1234.56, 5.5);
      expect(result.toNumber()).toBeCloseTo(67.9, 2);
    });

    it('should return 0 for zero percentage: 1000 × 0% = 0', () => {
      const result = service.calculateCommission(1000, 0);
      expect(result.toNumber()).toBe(0);
    });

    it('should handle small amounts: 10 × 1% = 0.10', () => {
      const result = service.calculateCommission(10, 1);
      expect(result.toNumber()).toBeCloseTo(0.1, 2);
    });

    it('should handle large amounts: 999999.99 × 10% = 100000.00 (rounded)', () => {
      // 999999.99 * 10 / 100 = 99999.999 → ROUND_HALF_UP → 100000.00
      const result = service.calculateCommission(999999.99, 10);
      expect(result.toFixed(2)).toBe('100000.00');
    });

    it('should round correctly: 1000 × 0.1% = 1.00', () => {
      const result = service.calculateCommission(1000, 0.1);
      expect(result.toFixed(2)).toBe('1.00');
    });

    it('should handle 100% commission: 1000 × 100% = 1000', () => {
      const result = service.calculateCommission(1000, 100);
      expect(result.toNumber()).toBe(1000);
    });

    it('should throw error for negative amount', () => {
      expect(() => service.calculateCommission(-100, 10)).toThrow(BadRequestException);
    });

    it('should throw error for percentage > 100', () => {
      expect(() => service.calculateCommission(1000, 101)).toThrow(BadRequestException);
    });

    it('should throw error for null net amount', () => {
      expect(() => service.calculateCommission(null as any, 10)).toThrow(BadRequestException);
    });

    it('should throw error for null percentage', () => {
      expect(() => service.calculateCommission(1000, null as any)).toThrow(BadRequestException);
    });

    it('should handle very small percentages: 5000 × 0.01% = 0.50', () => {
      const result = service.calculateCommission(5000, 0.01);
      expect(result.toFixed(2)).toBe('0.50');
    });

    it('should round 1000.666 × 5% = 50.03', () => {
      const result = service.calculateCommission(1000.666, 5);
      expect(result.toFixed(2)).toBe('50.03');
    });

    it('should handle edge case with many decimals', () => {
      // 999.999 * 1.111 / 100 = 11.10998889 → ROUND_HALF_UP at 2dp → 11.11
      const result = service.calculateCommission(999.999, 1.111);
      expect(result.toFixed(2)).toBe('11.11');
    });
  });

  describe('validateCommissionAmount', () => {
    it('should return true for exact match', () => {
      const calculated = new Decimal('100.00');
      const stored = new Decimal('100.00');
      expect(service.validateCommissionAmount(calculated, stored)).toBe(true);
    });

    it('should return true for within tolerance (0.01 difference)', () => {
      const calculated = new Decimal('100.00');
      const stored = new Decimal('100.01');
      expect(service.validateCommissionAmount(calculated, stored)).toBe(true);
    });

    it('should return true for within tolerance (negative difference)', () => {
      const calculated = new Decimal('100.00');
      const stored = new Decimal('99.99');
      expect(service.validateCommissionAmount(calculated, stored)).toBe(true);
    });

    it('should return false for mismatch (>0.01 difference)', () => {
      const calculated = new Decimal('100.00');
      const stored = new Decimal('100.02');
      expect(service.validateCommissionAmount(calculated, stored)).toBe(false);
    });

    it('should handle numeric inputs (not just Decimal)', () => {
      expect(service.validateCommissionAmount(100, 100)).toBe(true);
      expect(service.validateCommissionAmount(100, 100.01)).toBe(true);
      expect(service.validateCommissionAmount(100, 100.02)).toBe(false);
    });

    it('should return false for large mismatch', () => {
      const calculated = new Decimal('100.00');
      const stored = new Decimal('200.00');
      expect(service.validateCommissionAmount(calculated, stored)).toBe(false);
    });

    it('should return true for zero amounts', () => {
      const calculated = new Decimal('0');
      const stored = new Decimal('0');
      expect(service.validateCommissionAmount(calculated, stored)).toBe(true);
    });
  });
});
