/**
 * MCP Tool: aios_get_status
 *
 * Queries BullMQ job queue for status, progress, and estimated completion time.
 */
import { z } from 'zod';
export declare const getStatusSchema: {
    readonly name: "aios_get_status";
    readonly description: "Check the status and progress of an async job or pipeline execution. Returns current phase, progress percentage, ETA, and any errors.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly job_id: {
                readonly type: "string";
                readonly description: "The job ID returned by aios_full_pipeline or other async tools";
            };
        };
        readonly required: readonly ["job_id"];
    };
};
export declare const GetStatusInputValidator: z.ZodObject<{
    job_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    job_id: string;
}, {
    job_id: string;
}>;
//# sourceMappingURL=aios-get-status.d.ts.map