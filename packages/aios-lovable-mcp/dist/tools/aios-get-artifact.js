/**
 * MCP Tool: aios_get_artifact
 *
 * Fetches completed job artifacts (PRD, design system, architecture, code files, etc.)
 * by job ID or artifact type.
 */
import { z } from 'zod';
export const getArtifactSchema = {
    name: 'aios_get_artifact',
    description: 'Retrieve generated artifacts from a completed job (PRD, strategy, design system, architecture, code). Returns artifact URL, content, or downloadable package.',
    inputSchema: {
        type: 'object',
        properties: {
            job_id: {
                type: 'string',
                description: 'The job ID returned by aios_full_pipeline or other tools',
            },
            artifact_type: {
                type: 'string',
                enum: ['prd', 'strategy', 'design_system', 'wireframes', 'architecture', 'code_files', 'all'],
                description: 'Type of artifact to retrieve (default: all)',
            },
            format: {
                type: 'string',
                enum: ['json', 'markdown', 'html', 'zip'],
                description: 'Output format - json for structured data, markdown for docs, html for preview, zip for downloadable package (default: json)',
            },
        },
        required: ['job_id'],
    },
};
export const GetArtifactInputValidator = z.object({
    job_id: z.string().min(1, 'job_id is required'),
    artifact_type: z
        .enum(['prd', 'strategy', 'design_system', 'wireframes', 'architecture', 'code_files', 'all'])
        .optional(),
    format: z.enum(['json', 'markdown', 'html', 'zip']).optional(),
});
//# sourceMappingURL=aios-get-artifact.js.map