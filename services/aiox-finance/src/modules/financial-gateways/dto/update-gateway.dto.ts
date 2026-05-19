import { z } from 'zod';

export const UpdateGatewaySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional()
    .describe('Gateway name'),
  active: z.boolean().optional().describe('Whether gateway is active'),
});

export type UpdateGatewayDto = z.infer<typeof UpdateGatewaySchema>;
