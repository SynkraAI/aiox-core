#!/usr/bin/env node

/**
 * Synkra AIOS MCP Server for Lovable Integration
 *
 * Exposes AIOS agents as MCP tools that Lovable can invoke.
 * Phase 1 (MVP): 2 tools - aios_design_architecture + aios_generate_code
 *
 * Transport: stdio (standard MCP transport for local dev)
 * Auth: Bearer token via AIOS_API_KEY env var (MVP: hardcoded check)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { Orchestrator } from './adapters/orchestrator.js';

const SERVER_NAME = 'aios-lovable-mcp';
const SERVER_VERSION = '0.1.0';

function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  const orchestrator = new Orchestrator();

  // -------------------------------------------------------------------------
  // Tool: aios_design_architecture
  // -------------------------------------------------------------------------
  server.tool(
    'aios_design_architecture',
    'Produce a complete system architecture document including stack selection, data model, API design, and security. Runs the @architect agent.',
    {
      spec: z.string().min(1).describe('Product spec or requirements JSON'),
      requirements: z
        .record(z.unknown())
        .optional()
        .describe('Output from aios_strategize (optional)'),
      stack_preference: z
        .string()
        .optional()
        .describe("Preferred tech stack (e.g., 'nextjs-react', 'vite-react')"),
    },
    async (args) => {
      const response = await orchestrator.designArchitecture({
        spec: args.spec,
        requirements: args.requirements,
        stack_preference: args.stack_preference,
      });

      if (!response.success) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  error: response.error,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // Tool: aios_generate_code
  // -------------------------------------------------------------------------
  server.tool(
    'aios_generate_code',
    'Generate production-ready implementation code (React/Next.js components, API routes, schemas). Runs the @dev agent.',
    {
      spec: z.string().min(1).describe('Product specification'),
      architecture: z
        .record(z.unknown())
        .optional()
        .describe('Output from aios_design_architecture (optional)'),
      ux_spec: z
        .record(z.unknown())
        .optional()
        .describe('Output from aios_design_ux (optional)'),
      target_files: z
        .array(z.string())
        .optional()
        .describe('Specific files to generate (optional)'),
      framework: z
        .string()
        .optional()
        .describe("Target framework preset (default: 'nextjs-react')"),
    },
    async (args) => {
      const response = await orchestrator.generateCode({
        spec: args.spec,
        architecture: args.architecture,
        ux_spec: args.ux_spec,
        target_files: args.target_files,
        framework: args.framework,
      });

      if (!response.success) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  error: response.error,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // Tool: aios_strategize
  // -------------------------------------------------------------------------
  server.tool(
    'aios_strategize',
    'Generate comprehensive product strategy, market positioning, and PRD. Runs @pm agent (@analyst for market research).',
    {
      product_name: z.string().min(1).describe('Name of the product'),
      description: z
        .string()
        .optional()
        .describe('Product description and overview'),
      target_segments: z
        .array(z.string())
        .optional()
        .describe('Target market segments (e.g., ["SMBs", "Enterprise"])'),
      key_problems: z
        .array(z.string())
        .optional()
        .describe('Key problems the product solves'),
      success_metrics: z
        .array(z.string())
        .optional()
        .describe('Success metrics and KPIs'),
      market_context: z
        .string()
        .optional()
        .describe('Additional market and competitive context'),
    },
    async (args) => {
      const response = await orchestrator.strategize({
        product_name: args.product_name,
        description: args.description,
        target_segments: args.target_segments,
        key_problems: args.key_problems,
        success_metrics: args.success_metrics,
      });

      if (!response.success) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: response.error }, null, 2),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
      };
    }
  );

  // -------------------------------------------------------------------------
  // Tool: aios_design_ux
  // -------------------------------------------------------------------------
  server.tool(
    'aios_design_ux',
    'Generate design system, component specs, wireframes, and accessibility guidelines. Runs @ux-design-expert agent.',
    {
      product_name: z.string().min(1).describe('Name of the product'),
      user_flows: z
        .array(z.string())
        .optional()
        .describe('Key user flows to design'),
      design_preferences: z
        .record(z.unknown())
        .optional()
        .describe('Design preferences (colors, fonts, style)'),
      accessibility_requirements: z
        .array(z.string())
        .optional()
        .describe('Accessibility requirements (WCAG level, etc.)'),
      page_structure: z
        .array(z.string())
        .optional()
        .describe('Pages to design'),
    },
    async (args) => {
      const response = await orchestrator.designUX({
        product_name: args.product_name,
        user_flows: args.user_flows,
        design_preferences: args.design_preferences,
        accessibility_requirements: args.accessibility_requirements,
      });

      if (!response.success) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: response.error }, null, 2),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
      };
    }
  );

  // -------------------------------------------------------------------------
  // Tool: aios_full_pipeline (async orchestration)
  // -------------------------------------------------------------------------
  server.tool(
    'aios_full_pipeline',
    'Execute end-to-end product development pipeline: strategy → design → architecture → code. Returns job_id for async tracking.',
    {
      product_name: z.string().min(1).describe('Name of the product'),
      description: z.string().min(1).describe('Product description and requirements'),
      target_segments: z
        .array(z.string())
        .optional()
        .describe('Target market segments'),
      key_problems: z
        .array(z.string())
        .optional()
        .describe('Key problems the product solves'),
      design_preferences: z
        .record(z.unknown())
        .optional()
        .describe('Design system preferences'),
      tech_stack: z
        .string()
        .optional()
        .describe('Preferred tech stack'),
      webhook_url: z
        .string()
        .optional()
        .describe('Webhook URL for progress updates'),
      phases: z
        .array(z.enum(['strategy', 'design', 'architecture', 'code']))
        .optional()
        .describe('Phases to run'),
    },
    async (args) => {
      // Phase 2+: Would integrate with BullMQ queue
      // For now, return a mock job ID
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                job_id: 'aios-' + Math.random().toString(36).substr(2, 9),
                status: 'queued',
                message: 'Pipeline queued. Use aios_get_status to check progress.',
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // Tool: aios_get_status (async job monitoring)
  // -------------------------------------------------------------------------
  server.tool(
    'aios_get_status',
    'Check the status and progress of an async job or pipeline execution.',
    {
      job_id: z.string().min(1).describe('The job ID to check'),
    },
    async (args) => {
      // Phase 2+: Would query BullMQ queue
      // For now, return mock status
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                job_id: args.job_id,
                status: 'processing',
                progress: 50,
                current_phase: 'design',
                eta_seconds: 120,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // Tool: aios_get_artifact (retrieve outputs)
  // -------------------------------------------------------------------------
  server.tool(
    'aios_get_artifact',
    'Retrieve generated artifacts from a completed job (PRD, strategy, design system, architecture, code).',
    {
      job_id: z.string().min(1).describe('The job ID'),
      artifact_type: z
        .enum(['prd', 'strategy', 'design_system', 'wireframes', 'architecture', 'code_files', 'all'])
        .optional()
        .describe('Type of artifact to retrieve'),
      format: z
        .enum(['json', 'markdown', 'html', 'zip'])
        .optional()
        .describe('Output format'),
    },
    async (args) => {
      // Phase 2+: Would fetch from artifact storage
      // For now, return mock artifact
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                job_id: args.job_id,
                artifact_type: args.artifact_type || 'all',
                format: args.format || 'json',
                url: `https://artifacts.aios.dev/${args.job_id}`,
                message: 'Artifact retrieval available after job completion',
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  console.error(`[${SERVER_NAME}] Starting MCP server v${SERVER_VERSION}...`);
  console.error(`[${SERVER_NAME}] Transport: stdio`);
  console.error(
    `[${SERVER_NAME}] Tools: aios_design_architecture, aios_generate_code, aios_strategize, aios_design_ux, aios_full_pipeline, aios_get_status, aios_get_artifact`
  );

  await server.connect(transport);

  console.error(`[${SERVER_NAME}] Server connected and ready.`);
}

main().catch((err) => {
  console.error(`[${SERVER_NAME}] Fatal error:`, err);
  process.exit(1);
});

export { createServer };
