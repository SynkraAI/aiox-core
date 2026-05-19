import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  ReportPeriod,
  ReportExportQuery,
  ReportExportValidator,
} from '@/common/validators/report-export.validator';
import { ExportReportDto, ExportDataRow, ExportSummary } from './dto/export-report.dto';

@Injectable()
export class FinancialService {
  /**
   * Generate financial report with filters.
   * Currently returns mock data. Will integrate with Supabase later.
   */
  async generateExportReport(query: ReportExportQuery): Promise<ExportReportDto> {
    const dateRange = ReportExportValidator.mapPeriodToDateRange(query.period);

    // Mock data - will be replaced with Supabase queries
    const data = this.generateMockData(
      query.period,
      query.product_id,
      query.seller_id,
      dateRange.start,
      dateRange.end
    );

    const summary = this.calculateSummary(data);

    return {
      period: query.period,
      filters: {
        product_id: query.product_id,
        seller_id: query.seller_id,
      },
      data,
      summary,
      generatedAt: new Date().toISOString(),
      exportId: uuidv4(),
    };
  }

  /**
   * Calculate summary (totals) from data array
   */
  private calculateSummary(data: ExportDataRow[]): ExportSummary {
    if (data.length === 0) {
      return {};
    }

    const summary: ExportSummary = {};

    // Sum all numeric fields
    const numericFields = ['revenue', 'expense', 'profit', 'cash_in', 'cash_out', 'net_cash'];

    for (const field of numericFields) {
      const total = data.reduce(
        (sum, row) => sum + (typeof row[field] === 'number' ? row[field] : 0),
        0
      );
      if (total > 0) {
        summary[`total${this.capitalize(field)}`] = total;
      }
    }

    // Calculate averages
    if (data.some((row) => typeof row.commission_rate === 'number')) {
      const avg =
        data.reduce(
          (sum, row) => sum + (typeof row.commission_rate === 'number' ? row.commission_rate : 0),
          0
        ) / data.length;
      summary.averageCommissionRate = Math.round(avg * 100) / 100;
    }

    if (data.some((row) => typeof row.avg_order_value === 'number')) {
      const avg =
        data.reduce(
          (sum, row) => sum + (typeof row.avg_order_value === 'number' ? row.avg_order_value : 0),
          0
        ) / data.length;
      summary.averageOrderValue = Math.round(avg * 100) / 100;
    }

    return summary;
  }

  /**
   * Generate mock data for testing and CLI
   */
  private generateMockData(
    period: ReportPeriod,
    productId?: number,
    sellerId?: number,
    start?: Date,
    end?: Date
  ): ExportDataRow[] {
    const data: ExportDataRow[] = [];
    const rowCount = this.getRowCountByPeriod(period);

    for (let i = 0; i < rowCount; i++) {
      data.push({
        date: this.formatDateForPeriod(period, i),
        revenue: Math.floor(Math.random() * 100000 + 10000),
        expense: Math.floor(Math.random() * 50000 + 5000),
        profit: Math.floor(Math.random() * 50000 + 5000),
        cash_in: Math.floor(Math.random() * 80000 + 10000),
        cash_out: Math.floor(Math.random() * 40000 + 5000),
        net_cash: Math.floor(Math.random() * 40000 + 5000),
        commission_rate: Math.round((Math.random() * 20 + 5) * 100) / 100,
        avg_order_value: Math.round((Math.random() * 500 + 100) * 100) / 100,
        seller_count: Math.floor(Math.random() * 50 + 5),
      });
    }

    return data;
  }

  private getRowCountByPeriod(period: ReportPeriod): number {
    switch (period) {
      case ReportPeriod.DAILY:
        return 1;
      case ReportPeriod.WEEKLY:
        return 7;
      case ReportPeriod.BIWEEKLY:
        return 14;
      case ReportPeriod.MONTHLY:
        return 30;
      default:
        return 1;
    }
  }

  private formatDateForPeriod(period: ReportPeriod, index: number): string {
    const date = new Date();
    switch (period) {
      case ReportPeriod.DAILY:
        return date.toISOString().split('T')[0];
      case ReportPeriod.WEEKLY:
      case ReportPeriod.BIWEEKLY:
        date.setDate(date.getDate() - (30 - index));
        return date.toISOString().split('T')[0];
      case ReportPeriod.MONTHLY:
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(index + 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
      default:
        return date.toISOString().split('T')[0];
    }
  }

  private capitalize(str: string): string {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
