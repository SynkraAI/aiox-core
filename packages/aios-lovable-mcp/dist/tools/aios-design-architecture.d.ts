/**
 * MCP Tool: aios_design_architecture
 *
 * Produces system architecture from a product spec by routing
 * to the @architect agent via the adapter layer.
 */
import { z } from 'zod';
export declare const designArchitectureSchema: {
    readonly name: "aios_design_architecture";
    readonly description: "Produce a complete system architecture document including stack selection, data model, API design, and security. Runs the @architect agent.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly spec: {
                readonly type: "string";
                readonly description: "Product spec or requirements JSON";
            };
            readonly requirements: {
                readonly type: "object";
                readonly description: "Output from aios_strategize (optional, enhances quality)";
            };
            readonly stack_preference: {
                readonly type: "string";
                readonly description: "Preferred tech stack (e.g., 'nextjs-react', 'vite-react')";
            };
        };
        readonly required: readonly ["spec"];
    };
};
export declare const DesignArchitectureInputValidator: z.ZodObject<{
    spec: z.ZodString;
    requirements: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    stack_preference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    spec: string;
    requirements?: Record<string, unknown> | undefined;
    stack_preference?: string | undefined;
}, {
    spec: string;
    requirements?: Record<string, unknown> | undefined;
    stack_preference?: string | undefined;
}>;
//# sourceMappingURL=aios-design-architecture.d.ts.map