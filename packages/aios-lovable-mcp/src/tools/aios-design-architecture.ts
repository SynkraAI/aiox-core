/**
 * MCP Tool: aios_design_architecture
 *
 * Produces system architecture from a product spec by routing
 * to the @architect agent via the adapter layer.
 */

import { z } from 'zod';

export const designArchitectureSchema = {
  name: 'aios_design_architecture',
  description:
    'Produce a complete system architecture document including stack selection, data model, API design, and security. Runs the @architect agent.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      spec: {
        type: 'string',
        description: 'Product spec or requirements JSON',
      },
      requirements: {
        type: 'object',
        description:
          'Output from aios_strategize (optional, enhances quality)',
      },
      stack_preference: {
        type: 'string',
        description:
          "Preferred tech stack (e.g., 'nextjs-react', 'vite-react')",
      },
    },
    required: ['spec'],
  },
} as const;

export const DesignArchitectureInputValidator = z.object({
  spec: z.string().min(1, 'spec is required and must be non-empty'),
  requirements: z.record(z.unknown()).optional(),
  stack_preference: z.string().optional(),
});
