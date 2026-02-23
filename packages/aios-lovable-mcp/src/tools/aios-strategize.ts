/**
 * MCP Tool: aios_strategize
 *
 * Produces comprehensive product strategy, market analysis, and PRD
 * by routing to the @pm agent via the adapter layer.
 */

import { z } from 'zod';

export const strategizeSchema = {
  name: 'aios_strategize',
  description:
    'Generate comprehensive product strategy, market positioning, and PRD. Runs @pm agent (@analyst for market research).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_name: {
        type: 'string',
        description: 'Name of the product',
      },
      description: {
        type: 'string',
        description: 'Product description and overview',
      },
      target_segments: {
        type: 'array',
        items: { type: 'string' },
        description: 'Target market segments (e.g., ["SMBs", "Enterprise"])',
      },
      key_problems: {
        type: 'array',
        items: { type: 'string' },
        description: 'Key problems the product solves',
      },
      success_metrics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Success metrics and KPIs (e.g., ["DAU growth >20%", "NPS >50"])',
      },
      market_context: {
        type: 'string',
        description: 'Additional market and competitive context',
      },
    },
    required: ['product_name'],
  },
} as const;

export const StrategizeInputValidator = z.object({
  product_name: z.string().min(1, 'product_name is required'),
  description: z.string().optional(),
  target_segments: z.array(z.string()).optional(),
  key_problems: z.array(z.string()).optional(),
  success_metrics: z.array(z.string()).optional(),
  market_context: z.string().optional(),
});
