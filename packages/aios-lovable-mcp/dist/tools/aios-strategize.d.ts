/**
 * MCP Tool: aios_strategize
 *
 * Produces comprehensive product strategy, market analysis, and PRD
 * by routing to the @pm agent via the adapter layer.
 */
import { z } from 'zod';
export declare const strategizeSchema: {
    readonly name: "aios_strategize";
    readonly description: "Generate comprehensive product strategy, market positioning, and PRD. Runs @pm agent (@analyst for market research).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly product_name: {
                readonly type: "string";
                readonly description: "Name of the product";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Product description and overview";
            };
            readonly target_segments: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Target market segments (e.g., [\"SMBs\", \"Enterprise\"])";
            };
            readonly key_problems: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Key problems the product solves";
            };
            readonly success_metrics: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Success metrics and KPIs (e.g., [\"DAU growth >20%\", \"NPS >50\"])";
            };
            readonly market_context: {
                readonly type: "string";
                readonly description: "Additional market and competitive context";
            };
        };
        readonly required: readonly ["product_name"];
    };
};
export declare const StrategizeInputValidator: z.ZodObject<{
    product_name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    target_segments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    key_problems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    success_metrics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    market_context: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    product_name: string;
    description?: string | undefined;
    target_segments?: string[] | undefined;
    key_problems?: string[] | undefined;
    success_metrics?: string[] | undefined;
    market_context?: string | undefined;
}, {
    product_name: string;
    description?: string | undefined;
    target_segments?: string[] | undefined;
    key_problems?: string[] | undefined;
    success_metrics?: string[] | undefined;
    market_context?: string | undefined;
}>;
//# sourceMappingURL=aios-strategize.d.ts.map