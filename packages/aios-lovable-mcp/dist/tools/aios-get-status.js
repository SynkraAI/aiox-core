/**
 * MCP Tool: aios_get_status
 *
 * Queries BullMQ job queue for status, progress, and estimated completion time.
 */
import { z } from 'zod';
export const getStatusSchema = {
    name: 'aios_get_status',
    description: 'Check the status and progress of an async job or pipeline execution. Returns current phase, progress percentage, ETA, and any errors.',
    inputSchema: {
        type: 'object',
        properties: {
            job_id: {
                type: 'string',
                description: 'The job ID returned by aios_full_pipeline or other async tools',
            },
        },
        required: ['job_id'],
    },
};
export const GetStatusInputValidator = z.object({
    job_id: z.string().min(1, 'job_id is required'),
});
//# sourceMappingURL=aios-get-status.js.map