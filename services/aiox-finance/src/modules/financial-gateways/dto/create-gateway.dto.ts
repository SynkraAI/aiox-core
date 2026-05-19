import { z } from 'zod';

export const CreateGatewaySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .describe('Gateway name (e.g., Stripe, Mercado Pago)'),
  active: z.boolean().optional().default(true).describe('Whether gateway is active'),
});

export type CreateGatewayDto = z.infer<typeof CreateGatewaySchema>;
