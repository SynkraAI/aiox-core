import { BadRequestException } from '@nestjs/common';
import { ReportExportValidator, ReportPeriod, DateRange } from '../report-export.validator';

describe('ReportExportValidator', () => {
  describe('validatePeriod', () => {
    it('should accept valid period: daily', () => {
      expect(ReportExportValidator.validatePeriod('daily')).toBe(ReportPeriod.DAILY);
    });

    it('should accept valid period: weekly', () => {
      expect(ReportExportValidator.validatePeriod('weekly')).toBe(ReportPeriod.WEEKLY);
    });

    it('should accept valid period: biweekly', () => {
      expect(ReportExportValidator.validatePeriod('biweekly')).toBe(ReportPeriod.BIWEEKLY);
    });

    it('should accept valid period: monthly', () => {
      expect(ReportExportValidator.validatePeriod('monthly')).toBe(ReportPeriod.MONTHLY);
    });

    it('should reject invalid period', () => {
      expect(() => ReportExportValidator.validatePeriod('invalid')).toThrow(BadRequestException);
    });
  });

  describe('validateProductId', () => {
    it('should return undefined for null/undefined', () => {
      expect(ReportExportValidator.validateProductId(undefined)).toBeUndefined();
      expect(ReportExportValidator.validateProductId(null)).toBeUndefined();
    });

    it('should accept valid positive number', () => {
      expect(ReportExportValidator.validateProductId(5)).toBe(5);
      expect(ReportExportValidator.validateProductId('10')).toBe(10);
    });

    it('should reject zero or negative numbers', () => {
      expect(() => ReportExportValidator.validateProductId(0)).toThrow(BadRequestException);
      expect(() => ReportExportValidator.validateProductId(-5)).toThrow(BadRequestException);
    });

    it('should reject non-numeric values', () => {
      expect(() => ReportExportValidator.validateProductId('abc')).toThrow(BadRequestException);
    });
  });

  describe('validateSellerId', () => {
    it('should return undefined for null/undefined', () => {
      expect(ReportExportValidator.validateSellerId(undefined)).toBeUndefined();
      expect(ReportExportValidator.validateSellerId(null)).toBeUndefined();
    });

    it('should accept valid positive number', () => {
      expect(ReportExportValidator.validateSellerId(12)).toBe(12);
      expect(ReportExportValidator.validateSellerId('15')).toBe(15);
    });

    it('should reject zero or negative numbers', () => {
      expect(() => ReportExportValidator.validateSellerId(0)).toThrow(BadRequestException);
      expect(() => ReportExportValidator.validateSellerId(-10)).toThrow(BadRequestException);
    });

    it('should reject non-numeric values', () => {
      expect(() => ReportExportValidator.validateSellerId('xyz')).toThrow(BadRequestException);
    });
  });

  describe('mapPeriodToDateRange', () => {
    it('should return date range for daily', () => {
      const range = ReportExportValidator.mapPeriodToDateRange(ReportPeriod.DAILY);
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
      expect(range.end.getTime()).toBeGreaterThan(range.start.getTime());
    });

    it('should return date range for weekly', () => {
      const range = ReportExportValidator.mapPeriodToDateRange(ReportPeriod.WEEKLY);
      const daysDiff = (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(7);
    });

    it('should return date range for biweekly', () => {
      const range = ReportExportValidator.mapPeriodToDateRange(ReportPeriod.BIWEEKLY);
      const daysDiff = (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(14);
    });

    it('should return date range for monthly', () => {
      const range = ReportExportValidator.mapPeriodToDateRange(ReportPeriod.MONTHLY);
      const daysDiff = (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(28);
    });
  });

  describe('validate', () => {
    it('should validate complete query with all params', () => {
      const result = ReportExportValidator.validate({
        period: 'monthly',
        product_id: 5,
        seller_id: 12,
      });
      expect(result.period).toBe(ReportPeriod.MONTHLY);
      expect(result.product_id).toBe(5);
      expect(result.seller_id).toBe(12);
    });

    it('should validate query with only period', () => {
      const result = ReportExportValidator.validate({
        period: 'weekly',
      });
      expect(result.period).toBe(ReportPeriod.WEEKLY);
      expect(result.product_id).toBeUndefined();
      expect(result.seller_id).toBeUndefined();
    });

    it('should throw if period is missing', () => {
      expect(() =>
        ReportExportValidator.validate({
          product_id: 5,
        })
      ).toThrow();
    });

    it('should throw if period is invalid', () => {
      expect(() =>
        ReportExportValidator.validate({
          period: 'invalid',
          product_id: 5,
        })
      ).toThrow(BadRequestException);
    });
  });
});
