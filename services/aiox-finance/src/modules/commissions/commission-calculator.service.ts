import { Injectable, BadRequestException } from '@nestjs/common';
import { Decimal } from 'decimal.js';

@Injectable()
export class CommissionCalculatorService {
  constructor() {
    Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });
  }

  calculateCommission(netAmount: number, percentage: number): Decimal {
    if (netAmount === null || netAmount === undefined) {
      throw new BadRequestException('Net amount is required');
    }
    if (percentage === null || percentage === undefined) {
      throw new BadRequestException('Commission percentage is required');
    }

    if (netAmount < 0) {
      throw new BadRequestException('Net amount must be greater than or equal to 0');
    }
    if (percentage < 0 || percentage > 100) {
      throw new BadRequestException('Commission percentage must be between 0 and 100');
    }

    const amount = new Decimal(netAmount);
    const pct = new Decimal(percentage);
    const hundred = new Decimal(100);

    const result = amount.times(pct).dividedBy(hundred);

    return new Decimal(result.toFixed(2));
  }

  validateCommissionAmount(calculated: Decimal | number, stored: Decimal | number): boolean {
    const calcDecimal = this.toDecimal(calculated);
    const storedDecimal = this.toDecimal(stored);

    const tolerance = new Decimal('0.01');
    const difference = calcDecimal.minus(storedDecimal).abs();

    return difference.lessThanOrEqualTo(tolerance);
  }

  private toDecimal(value: Decimal | number): Decimal {
    if (value instanceof Decimal) {
      return value;
    }
    return new Decimal(value);
  }
}
