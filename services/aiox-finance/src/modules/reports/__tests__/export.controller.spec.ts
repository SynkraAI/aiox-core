import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ExportController } from '../export.controller';
import { FinancialService } from '../financial.service';
import { ReportPeriod } from '@/common/validators/report-export.validator';

describe('ExportController', () => {
  let controller: ExportController;
  let service: FinancialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [FinancialService],
    }).compile();

    controller = module.get<ExportController>(ExportController);
    service = module.get<FinancialService>(FinancialService);
  });

  describe('exportReport', () => {
    it('should return export report for valid monthly query', async () => {
      const result = await controller.exportReport('monthly');

      expect(result).toBeDefined();
      expect(result.period).toBe(ReportPeriod.MONTHLY);
      expect(result.filters).toEqual({});
      expect(result.data).toBeInstanceOf(Array);
      expect(result.summary).toBeDefined();
      expect(result.generatedAt).toBeDefined();
      expect(result.exportId).toBeDefined();
    });

    it('should return export report with product filter', async () => {
      const result = await controller.exportReport('weekly', '5');

      expect(result.period).toBe(ReportPeriod.WEEKLY);
      expect(result.filters.product_id).toBe(5);
      expect(result.filters.seller_id).toBeUndefined();
    });

    it('should return export report with seller filter', async () => {
      const result = await controller.exportReport('daily', undefined, '12');

      expect(result.period).toBe(ReportPeriod.DAILY);
      expect(result.filters.product_id).toBeUndefined();
      expect(result.filters.seller_id).toBe(12);
    });

    it('should return export report with both filters', async () => {
      const result = await controller.exportReport('monthly', '5', '12');

      expect(result.period).toBe(ReportPeriod.MONTHLY);
      expect(result.filters.product_id).toBe(5);
      expect(result.filters.seller_id).toBe(12);
    });

    it('should throw BadRequestException when period is missing', async () => {
      await expect(controller.exportReport(undefined)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid period', async () => {
      await expect(controller.exportReport('invalid')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid product_id', async () => {
      await expect(controller.exportReport('monthly', 'invalid')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException for invalid seller_id', async () => {
      await expect(controller.exportReport('monthly', undefined, 'invalid')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should generate summary with correct totals', async () => {
      const result = await controller.exportReport('biweekly');

      expect(result.summary).toBeDefined();
      expect(result.summary.totalRevenue).toBeGreaterThan(0);
      expect(result.summary.totalExpense).toBeGreaterThan(0);
      expect(result.summary.totalProfit).toBeGreaterThan(0);
    });
  });
});
