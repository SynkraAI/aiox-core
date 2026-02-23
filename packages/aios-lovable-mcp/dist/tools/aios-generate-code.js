/**
 * MCP Tool: aios_generate_code
 *
 * Generates implementation code from spec + architecture + UX
 * by routing to the @dev agent via the adapter layer.
 */
import { z } from 'zod';
export const generateCodeSchema = {
    name: 'aios_generate_code',
    description: 'Generate production-ready implementation code (React/Next.js components, API routes, schemas). Runs the @dev agent.',
    inputSchema: {
        type: 'object',
        properties: {
            spec: {
                type: 'string',
                description: 'Product specification',
            },
            architecture: {
                type: 'object',
                description: 'Output from aios_design_architecture (optional)',
            },
            ux_spec: {
                type: 'object',
                description: 'Output from aios_design_ux (optional)',
            },
            target_files: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific files to generate (optional, generates all if omitted)',
            },
            framework: {
                type: 'string',
                description: "Target framework preset (default: 'nextjs-react')",
            },
        },
        required: ['spec'],
    },
};
export const GenerateCodeInputValidator = z.object({
    spec: z.string().min(1, 'spec is required and must be non-empty'),
    architecture: z.record(z.unknown()).optional(),
    ux_spec: z.record(z.unknown()).optional(),
    target_files: z.array(z.string()).optional(),
    framework: z.string().optional(),
});
//# sourceMappingURL=aios-generate-code.js.map