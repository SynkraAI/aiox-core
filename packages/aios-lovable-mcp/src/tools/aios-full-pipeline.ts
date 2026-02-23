/**
 * MCP Tool: aios_full_pipeline
 *
 * Orchestrates all agents in sequence: strategy → design → architecture → code
 * Returns job ID for async tracking via aios_get_status and aios_get_artifact.
 */

import { z } from 'zod';

export const fullPipelineSchema = {
  name: 'aios_full_pipeline',
  description:
    'Execute end-to-end product development pipeline: strategy → design → architecture → code. Returns job_id for async tracking.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_name: {
        type: 'string',
        description: 'Name of the product',
      },
      description: {
        type: 'string',
        description:
          'Comprehensive product description, goals, and requirements',
      },
      target_segments: {
        type: 'array',
        items: { type: 'string' },
        description: 'Target market segments',
      },
      key_problems: {
        type: 'array',
        items: { type: 'string' },
        description: 'Key problems the product solves',
      },
      design_preferences: {
        type: 'object',
        description: 'Design system preferences',
      },
      tech_stack: {
        type: 'string',
        description:
          'Preferred tech stack (e.g., "nextjs-react", "vite-react")',
      },
      webhook_url: {
        type: 'string',
        description:
          'Webhook URL for real-time progress updates (receives POST with job status)',
      },
      phases: {
        type: 'array',
        items: { type: 'string', enum: ['strategy', 'design', 'architecture', 'code'] },
        description: 'Which phases to run (default: all)',
      },
    },
    required: ['product_name', 'description'],
  },
} as const;

export const FullPipelineInputValidator = z.object({
  product_name: z.string().min(1, 'product_name is required'),
  description: z.string().min(1, 'description is required'),
  target_segments: z.array(z.string()).optional(),
  key_problems: z.array(z.string()).optional(),
  design_preferences: z.record(z.unknown()).optional(),
  tech_stack: z.string().optional(),
  webhook_url: z.string().url().optional(),
  phases: z.array(z.enum(['strategy', 'design', 'architecture', 'code'])).optional(),
});
