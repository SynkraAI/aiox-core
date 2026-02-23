/**
 * MCP Tool: aios_full_pipeline
 *
 * Orchestrates all agents in sequence: strategy → design → architecture → code
 * Returns job ID for async tracking via aios_get_status and aios_get_artifact.
 */
import { z } from 'zod';
export declare const fullPipelineSchema: {
    readonly name: "aios_full_pipeline";
    readonly description: "Execute end-to-end product development pipeline: strategy → design → architecture → code. Returns job_id for async tracking.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly product_name: {
                readonly type: "string";
                readonly description: "Name of the product";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Comprehensive product description, goals, and requirements";
            };
            readonly target_segments: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Target market segments";
            };
            readonly key_problems: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Key problems the product solves";
            };
            readonly design_preferences: {
                readonly type: "object";
                readonly description: "Design system preferences";
            };
            readonly tech_stack: {
                readonly type: "string";
                readonly description: "Preferred tech stack (e.g., \"nextjs-react\", \"vite-react\")";
            };
            readonly webhook_url: {
                readonly type: "string";
                readonly description: "Webhook URL for real-time progress updates (receives POST with job status)";
            };
            readonly phases: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                    readonly enum: readonly ["strategy", "design", "architecture", "code"];
                };
                readonly description: "Which phases to run (default: all)";
            };
        };
        readonly required: readonly ["product_name", "description"];
    };
};
export declare const FullPipelineInputValidator: z.ZodObject<{
    product_name: z.ZodString;
    description: z.ZodString;
    target_segments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    key_problems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    design_preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tech_stack: z.ZodOptional<z.ZodString>;
    webhook_url: z.ZodOptional<z.ZodString>;
    phases: z.ZodOptional<z.ZodArray<z.ZodEnum<["strategy", "design", "architecture", "code"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    product_name: string;
    target_segments?: string[] | undefined;
    key_problems?: string[] | undefined;
    design_preferences?: Record<string, unknown> | undefined;
    tech_stack?: string | undefined;
    webhook_url?: string | undefined;
    phases?: ("code" | "strategy" | "architecture" | "design")[] | undefined;
}, {
    description: string;
    product_name: string;
    target_segments?: string[] | undefined;
    key_problems?: string[] | undefined;
    design_preferences?: Record<string, unknown> | undefined;
    tech_stack?: string | undefined;
    webhook_url?: string | undefined;
    phases?: ("code" | "strategy" | "architecture" | "design")[] | undefined;
}>;
//# sourceMappingURL=aios-full-pipeline.d.ts.map