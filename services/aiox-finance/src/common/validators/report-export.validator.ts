import { BadRequestException } from '@nestjs/common';

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export interface ReportExportQuery {
  period: ReportPeriod;
  product_id?: number;
  seller_id?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export class ReportExportValidator {
  static validatePeriod(period: string): ReportPeriod {
    const validPeriods = Object.values(ReportPeriod);
    if (!validPeriods.includes(period as ReportPeriod)) {
      throw new BadRequestException(
        `Invalid period: '${period}'. Must be one of: ${validPeriods.join(', ')}`
      );
    }
    return period as ReportPeriod;
  }

  static validateProductId(productId?: unknown): number | undefined {
    if (productId === undefined || productId === null) {
      return undefined;
    }
    const id = Number(productId);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(
        `Invalid product_id: '${productId}'. Must be a positive number.`
      );
    }
    return id;
  }

  static validateSellerId(sellerId?: unknown): number | undefined {
    if (sellerId === undefined || sellerId === null) {
      return undefined;
    }
    const id = Number(sellerId);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(`Invalid seller_id: '${sellerId}'. Must be a positive number.`);
    }
    return id;
  }

  static mapPeriodToDateRange(period: ReportPeriod): DateRange {
    const now = new Date();
    const start = new Date();

    switch (period) {
      case ReportPeriod.DAILY:
        start.setDate(now.getDate() - 1);
        break;
      case ReportPeriod.WEEKLY:
        start.setDate(now.getDate() - 7);
        break;
      case ReportPeriod.BIWEEKLY:
        start.setDate(now.getDate() - 14);
        break;
      case ReportPeriod.MONTHLY:
        start.setMonth(now.getMonth() - 1);
        break;
    }

    return {
      start: new Date(start.setHours(0, 0, 0, 0)),
      end: new Date(now.setHours(23, 59, 59, 999)),
    };
  }

  static validate(query: Record<string, unknown>): ReportExportQuery {
    const period = this.validatePeriod(query.period as string);
    const product_id = this.validateProductId(query.product_id);
    const seller_id = this.validateSellerId(query.seller_id);

    return {
      period,
      product_id,
      seller_id,
    };
  }
}
