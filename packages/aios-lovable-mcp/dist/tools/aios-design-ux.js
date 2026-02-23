/**
 * MCP Tool: aios_design_ux
 *
 * Produces design system, component specs, and wireframes
 * by routing to the @ux-design-expert agent via the adapter layer.
 */
import { z } from 'zod';
export const designUXSchema = {
    name: 'aios_design_ux',
    description: 'Generate design system, component specs, wireframes, and accessibility guidelines. Runs @ux-design-expert agent.',
    inputSchema: {
        type: 'object',
        properties: {
            product_name: {
                type: 'string',
                description: 'Name of the product',
            },
            user_flows: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key user flows to design (e.g., ["Sign Up", "Create Project", "Share"])',
            },
            design_preferences: {
                type: 'object',
                description: 'Design preferences (colors, fonts, style) - e.g., {"primary_color": "#3B82F6", "font_family": "Inter", "style": "modern"}',
            },
            accessibility_requirements: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific accessibility requirements (e.g., ["WCAG 2.1 AA", "Dark mode support"])',
            },
            page_structure: {
                type: 'array',
                items: { type: 'string' },
                description: 'Pages to design (e.g., ["Home", "Product", "Dashboard", "Settings"])',
            },
        },
        required: ['product_name'],
    },
};
export const DesignUXInputValidator = z.object({
    product_name: z.string().min(1, 'product_name is required'),
    user_flows: z.array(z.string()).optional(),
    design_preferences: z.record(z.unknown()).optional(),
    accessibility_requirements: z.array(z.string()).optional(),
    page_structure: z.array(z.string()).optional(),
});
//# sourceMappingURL=aios-design-ux.js.map