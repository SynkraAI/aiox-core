import { z } from 'zod';

const PAYMENT_METHODS = [
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_TRANSFER',
  'PIX',
  'CHECK',
  'OTHER',
] as const;

export const CreateSaleSchema = z
  .object({
    customer_id: z.string().uuid('customer_id must be a valid UUID'),
    seller_id: z.string().uuid('seller_id must be a valid UUID'),
    gross_amount: z.number().positive('gross_amount must be greater than 0'),
    net_amount: z.number().positive('net_amount must be greater than 0'),
    tax_amount: z.number().nonnegative('tax_amount must be greater than or equal to 0').default(0),
    discount_amount: z
      .number()
      .nonnegative('discount_amount must be greater than or equal to 0')
      .default(0),
    payment_method: z.enum(PAYMENT_METHODS),
    financial_gateway_id: z.string().uuid().nullable().optional(),
    installment_count: z
      .number()
      .int()
      .min(1, 'installment_count must be at least 1')
      .max(36, 'installment_count must be at most 36')
      .default(1),
    is_recurring: z.boolean().default(false),
    notes: z.string().optional(),
  })
  .refine((data) => data.net_amount <= data.gross_amount, {
    message: 'net_amount must be less than or equal to gross_amount',
    path: ['net_amount'],
  })
  .refine(
    (data) => {
      const calculated = data.gross_amount - data.tax_amount - data.discount_amount;
      const tolerance = 0.01;
      return Math.abs(data.net_amount - calculated) <= tolerance;
    },
    {
      message: `net_amount must equal gross_amount - tax_amount - discount_amount (calculated: ${(0).toFixed(2)})`,
      path: ['net_amount'],
    }
  );

export type CreateSaleDto = z.infer<typeof CreateSaleSchema>;
