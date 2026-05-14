import { z } from 'zod';

const SALE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED'] as const;

const PAYMENT_METHODS = [
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_TRANSFER',
  'PIX',
  'CHECK',
  'OTHER',
] as const;

export const SaleResponseSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  seller_id: z.string().uuid(),
  gross_amount: z.number(),
  net_amount: z.number(),
  tax_amount: z.number(),
  discount_amount: z.number(),
  payment_method: z.enum(PAYMENT_METHODS),
  financial_gateway_id: z.string().uuid().nullable(),
  installment_count: z.number().int(),
  is_recurring: z.boolean(),
  status: z.enum(SALE_STATUSES),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type SaleResponseDto = z.infer<typeof SaleResponseSchema>;
