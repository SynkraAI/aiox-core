/**
 * MCP Tool: aios_design_ux
 *
 * Produces design system, component specs, and wireframes
 * by routing to the @ux-design-expert agent via the adapter layer.
 */
import { z } from 'zod';
export declare const designUXSchema: {
    readonly name: "aios_design_ux";
    readonly description: "Generate design system, component specs, wireframes, and accessibility guidelines. Runs @ux-design-expert agent.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly product_name: {
                readonly type: "string";
                readonly description: "Name of the product";
            };
            readonly user_flows: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Key user flows to design (e.g., [\"Sign Up\", \"Create Project\", \"Share\"])";
            };
            readonly design_preferences: {
                readonly type: "object";
                readonly description: "Design preferences (colors, fonts, style) - e.g., {\"primary_color\": \"#3B82F6\", \"font_family\": \"Inter\", \"style\": \"modern\"}";
            };
            readonly accessibility_requirements: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Specific accessibility requirements (e.g., [\"WCAG 2.1 AA\", \"Dark mode support\"])";
            };
            readonly page_structure: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Pages to design (e.g., [\"Home\", \"Product\", \"Dashboard\", \"Settings\"])";
            };
        };
        readonly required: readonly ["product_name"];
    };
};
export declare const DesignUXInputValidator: z.ZodObject<{
    product_name: z.ZodString;
    user_flows: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    design_preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    accessibility_requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    page_structure: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    product_name: string;
    user_flows?: string[] | undefined;
    design_preferences?: Record<string, unknown> | undefined;
    accessibility_requirements?: string[] | undefined;
    page_structure?: string[] | undefined;
}, {
    product_name: string;
    user_flows?: string[] | undefined;
    design_preferences?: Record<string, unknown> | undefined;
    accessibility_requirements?: string[] | undefined;
    page_structure?: string[] | undefined;
}>;
//# sourceMappingURL=aios-design-ux.d.ts.map