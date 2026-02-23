/**
 * MCP Tool: aios_generate_code
 *
 * Generates implementation code from spec + architecture + UX
 * by routing to the @dev agent via the adapter layer.
 */
import { z } from 'zod';
export declare const generateCodeSchema: {
    readonly name: "aios_generate_code";
    readonly description: "Generate production-ready implementation code (React/Next.js components, API routes, schemas). Runs the @dev agent.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly spec: {
                readonly type: "string";
                readonly description: "Product specification";
            };
            readonly architecture: {
                readonly type: "object";
                readonly description: "Output from aios_design_architecture (optional)";
            };
            readonly ux_spec: {
                readonly type: "object";
                readonly description: "Output from aios_design_ux (optional)";
            };
            readonly target_files: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Specific files to generate (optional, generates all if omitted)";
            };
            readonly framework: {
                readonly type: "string";
                readonly description: "Target framework preset (default: 'nextjs-react')";
            };
        };
        readonly required: readonly ["spec"];
    };
};
export declare const GenerateCodeInputValidator: z.ZodObject<{
    spec: z.ZodString;
    architecture: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    ux_spec: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    target_files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    framework: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    spec: string;
    architecture?: Record<string, unknown> | undefined;
    ux_spec?: Record<string, unknown> | undefined;
    target_files?: string[] | undefined;
    framework?: string | undefined;
}, {
    spec: string;
    architecture?: Record<string, unknown> | undefined;
    ux_spec?: Record<string, unknown> | undefined;
    target_files?: string[] | undefined;
    framework?: string | undefined;
}>;
//# sourceMappingURL=aios-generate-code.d.ts.map