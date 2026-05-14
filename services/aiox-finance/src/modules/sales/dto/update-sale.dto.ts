import { z } from 'zod';

const PAYMENT_METHODS = [
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_TRANSFER',
  'PIX',
  'CHECK',
  'OTHER',
] as const;

export const UpdateSaleSchema = z
  .object({
    customer_id: z.string().uuid('customer_id must be a valid UUID').optional(),
    seller_id: z.string().uuid('seller_id must be a valid UUID').optional(),
    gross_amount: z.number().positive('gross_amount must be greater than 0').optional(),
    net_amount: z.number().positive('net_amount must be greater than 0').optional(),
    tax_amount: z.number().nonnegative('tax_amount must be greater than or equal to 0').optional(),
    discount_amount: z
      .number()
      .nonnegative('discount_amount must be greater than or equal to 0')
      .optional(),
    payment_method: z.enum(PAYMENT_METHODS).optional(),
    financial_gateway_id: z.string().uuid().nullable().optional(),
    installment_count: z
      .number()
      .int()
      .min(1, 'installment_count must be at least 1')
      .max(36, 'installment_count must be at most 36')
      .optional(),
    is_recurring: z.boolean().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.net_amount !== undefined && data.gross_amount !== undefined) {
        return data.net_amount <= data.gross_amount;
      }
      return true;
    },
    {
      message: 'net_amount must be less than or equal to gross_amount',
      path: ['net_amount'],
    }
  )
  .refine(
    (data) => {
      if (
        data.net_amount !== undefined &&
        data.gross_amount !== undefined &&
        data.tax_amount !== undefined &&
        data.discount_amount !== undefined
      ) {
        const calculated = data.gross_amount - data.tax_amount - data.discount_amount;
        const tolerance = 0.01;
        return Math.abs(data.net_amount - calculated) <= tolerance;
      }
      return true;
    },
    {
      message: 'net_amount must equal gross_amount - tax_amount - discount_amount',
      path: ['net_amount'],
    }
  );

export type UpdateSaleDto = z.infer<typeof UpdateSaleSchema>;
