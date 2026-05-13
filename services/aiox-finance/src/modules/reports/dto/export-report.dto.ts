import { ReportPeriod } from '@/common/validators/report-export.validator';

export interface ExportDataRow {
  date: string;
  revenue?: number;
  expense?: number;
  profit?: number;
  cash_in?: number;
  cash_out?: number;
  net_cash?: number;
  commission_rate?: number;
  avg_order_value?: number;
  seller_count?: number;
  [key: string]: string | number | undefined;
}

export interface ExportSummary {
  totalRevenue?: number;
  totalExpense?: number;
  totalProfit?: number;
  totalCashIn?: number;
  totalCashOut?: number;
  totalNetCash?: number;
  averageCommissionRate?: number;
  averageOrderValue?: number;
  totalSellers?: number;
  [key: string]: number | undefined;
}

export interface ExportReportDto {
  period: ReportPeriod;
  filters: {
    product_id?: number;
    seller_id?: number;
  };
  data: ExportDataRow[];
  summary: ExportSummary;
  generatedAt: string;
  exportId: string;
}
