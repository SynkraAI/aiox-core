import { Test, TestingModule } from '@nestjs/testing';
import { FinancialService } from '../financial.service';
import { ReportPeriod } from '@/common/validators/report-export.validator';

describe('FinancialService', () => {
  let service: FinancialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancialService],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
  });

  describe('generateExportReport', () => {
    it('should generate report with daily period', async () => {
      const result = await service.generateExportReport({
        period: ReportPeriod.DAILY,
      });

      expect(result.period).toBe(ReportPeriod.DAILY);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.summary).toBeDefined();
    });

    it('should generate report with weekly period', async () => {
      const result = await service.generateExportReport({
        period: ReportPeriod.WEEKLY,
      });

      expect(result.period).toBe(ReportPeriod.WEEKLY);
      expect(result.data.length).toBeGreaterThanOrEqual(7);
    });

    it('should generate report with biweekly period', async () => {
      const result = await service.generateExportReport({
        period: ReportPeriod.BIWEEKLY,
      });

      expect(result.period).toBe(ReportPeriod.BIWEEKLY);
      expect(result.data.length).toBeGreaterThanOrEqual(14);
    });

    it('should generate report with monthly period', async () => {
      const result = await service.generateExportReport({
        period: ReportPeriod.MONTHLY,
      });

      expect(result.period).toBe(ReportPeriod.MONTHLY);
      expect(result.data.length).toBe(30);
    });

    it('should respect product_id filter', async () => {
      const result = await service.generateExportReport({
        period: ReportPeriod.WEEKLY,
        product_id: 5,
      });

      expect(result.filters.product_id).toBe(5);
      expect(result.filters.seller_id).toBeUndefined();
    });

    it('should respect seller_id filter', async () => {
      const result = await service.generateExportReport({
        period: ReportPeriod.MONTHLY,
        seller_id: 12,
      });

      expect(result.filters.product_id).toBeUndefined();
      expect(result.filters.seller_id).toBe(12);
    });

    it('should respect both filters', async () => {
      const result = await service.generateExportReport({
        period: ReportPeriod.WEEKLY,
        product_id: 5,
        seller_id: 12,
      });

      expect(result.filters.product_id).toBe(5);
      expect(result.filters.seller_id).toBe(12);
    });

    it('should calculate summary with correct totals', async () => {
      const result = await service.generateExportReport({
        period: ReportPeriod.WEEKLY,
      });

      expect(result.summary.totalRevenue).toBeGreaterThan(0);
      expect(result.summary.totalExpense).toBeGreaterThan(0);
      expect(result.summary.totalProfit).toBeGreaterThan(0);
    });

    it('should include exportId and generatedAt', async () => {
      const result = await service.generateExportReport({
        period: ReportPeriod.DAILY,
      });

      expect(result.exportId).toBeDefined();
      expect(result.generatedAt).toBeDefined();
      expect(typeof result.exportId).toBe('string');
      expect(typeof result.generatedAt).toBe('string');
    });
  });
});
