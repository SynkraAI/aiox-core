/**
 * UX Adapter (Uma)
 *
 * Translates MCP aios_design_ux requests into @ux-design-expert agent
 * execution and parses design system/wireframe output.
 *
 * Phase 2: Executes design operations with component specs, design tokens,
 * and accessibility guidance. Invokes @ux-design-expert.
 */
const TIMEOUT_MS = 8 * 60 * 1000; // 8 minutes
export class UXAdapter {
    async execute(input) {
        const start = Date.now();
        try {
            const result = await this.runAgent(input);
            return {
                success: true,
                data: result,
                duration_ms: Date.now() - start,
            };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown UX agent error';
            return {
                success: false,
                error: {
                    code: 'AGENT_FAILURE',
                    message: `UX agent failed: ${message}`,
                },
                duration_ms: Date.now() - start,
            };
        }
    }
    async runAgent(input) {
        // Phase 2: Build design system from requirements
        // Real agent integration will replace this in Phase 3
        const designSystem = {
            typography: {
                scales: [
                    { name: 'h1', size: '32px', weight: 700, line_height: 1.2 },
                    { name: 'h2', size: '24px', weight: 700, line_height: 1.3 },
                    { name: 'h3', size: '20px', weight: 600, line_height: 1.4 },
                    { name: 'body', size: '16px', weight: 400, line_height: 1.5 },
                    { name: 'small', size: '14px', weight: 400, line_height: 1.5 },
                ],
                font_family: input.design_preferences?.font_family || 'Inter, system-ui',
            },
            colors: {
                primary: input.design_preferences?.primary_color || '#3B82F6',
                secondary: input.design_preferences?.secondary_color || '#10B981',
                neutral: [
                    '#FFFFFF',
                    '#F9FAFB',
                    '#F3F4F6',
                    '#E5E7EB',
                    '#D1D5DB',
                    '#9CA3AF',
                    '#6B7280',
                    '#4B5563',
                    '#1F2937',
                    '#111827',
                ],
                semantic: {
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6',
                },
            },
            spacing: {
                base_unit: '4px',
                scale: [
                    '0px',
                    '4px',
                    '8px',
                    '12px',
                    '16px',
                    '24px',
                    '32px',
                    '48px',
                    '64px',
                    '96px',
                ],
            },
            shadows: {
                none: 'none',
                sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            },
            components: [
                {
                    name: 'Button',
                    variants: [
                        {
                            name: 'primary',
                            background: input.design_preferences?.primary_color || '#3B82F6',
                            text_color: '#FFFFFF',
                            padding: '12px 24px',
                            border_radius: '6px',
                        },
                        {
                            name: 'secondary',
                            background: '#F3F4F6',
                            text_color: '#1F2937',
                            padding: '12px 24px',
                            border_radius: '6px',
                        },
                        {
                            name: 'outline',
                            background: 'transparent',
                            border: '1px solid #D1D5DB',
                            text_color: '#1F2937',
                            padding: '12px 24px',
                            border_radius: '6px',
                        },
                    ],
                    states: {
                        default: {},
                        hover: { opacity: 0.9 },
                        active: { opacity: 0.8 },
                        disabled: { opacity: 0.5 },
                    },
                },
                {
                    name: 'Input',
                    variants: [
                        {
                            name: 'default',
                            border: '1px solid #D1D5DB',
                            padding: '10px 12px',
                            border_radius: '4px',
                            font_size: '14px',
                        },
                        {
                            name: 'error',
                            border: '1px solid #EF4444',
                            padding: '10px 12px',
                            border_radius: '4px',
                            font_size: '14px',
                        },
                        {
                            name: 'success',
                            border: '1px solid #10B981',
                            padding: '10px 12px',
                            border_radius: '4px',
                            font_size: '14px',
                        },
                    ],
                },
                {
                    name: 'Card',
                    default: {
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        border_radius: '8px',
                        padding: '20px',
                        box_shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    },
                },
            ],
        };
        const wireframes = [
            {
                page: 'Home',
                layout: 'hero + features + cta',
                key_elements: [
                    'Header with logo/nav',
                    'Hero section with headline and CTA',
                    'Features grid (3 columns)',
                    'Social proof section',
                    'Call-to-action',
                    'Footer',
                ],
            },
            {
                page: 'Product Page',
                layout: 'overview + details + pricing',
                key_elements: [
                    'Product hero image/video',
                    'Product description',
                    'Feature highlights (tabs)',
                    'Use case examples',
                    'Pricing table',
                    'FAQ accordion',
                ],
            },
            {
                page: 'Dashboard',
                layout: 'sidebar + main content',
                key_elements: [
                    'Left sidebar navigation',
                    'Top header bar',
                    'Main content area',
                    'Cards with metrics',
                    'Charts and graphs',
                    'Quick actions panel',
                ],
            },
        ];
        return {
            design_system: designSystem,
            wireframes,
            design_system_markdown: this.formatDesignMarkdown(designSystem),
            wireframes_markdown: this.formatWireframesMarkdown(wireframes),
            accessibility_guidelines: [
                'WCAG 2.1 AA compliance',
                'Minimum contrast ratio 4.5:1 for text',
                'All interactive elements keyboard accessible',
                'Semantic HTML with proper ARIA labels',
                'Focus indicators visible and distinct',
                'Touch targets minimum 44x44px',
            ],
        };
    }
    formatDesignMarkdown(system) {
        return [
            '# Design System',
            '',
            '## Typography',
            system.typography.scales
                .map((scale) => `- **${scale.name}**: ${scale.size} (weight: ${scale.weight}, line-height: ${scale.line_height})`)
                .join('\n'),
            '',
            '## Colors',
            `**Primary**: ${system.colors.primary}`,
            `**Secondary**: ${system.colors.secondary}`,
            '',
            'Semantic Colors:',
            Object.entries(system.colors.semantic)
                .map(([key, color]) => `- **${key}**: ${color}`)
                .join('\n'),
            '',
            '## Spacing',
            `Base unit: ${system.spacing.base_unit}`,
            `Scale: ${system.spacing.scale.join(', ')}`,
            '',
            '## Components',
            system.components
                .map((comp) => `### ${comp.name}\n${comp.variants?.map((v) => `- ${v.name}`).join('\n')}`)
                .join('\n'),
        ].join('\n');
    }
    formatWireframesMarkdown(wireframes) {
        return [
            '# Wireframes',
            '',
            ...wireframes.map((wf) => `## ${wf.page}\n**Layout**: ${wf.layout}\n\nKey Elements:\n${wf.key_elements.map((e) => `- ${e}`).join('\n')}`),
        ].join('\n\n');
    }
    get timeoutMs() {
        return TIMEOUT_MS;
    }
}
//# sourceMappingURL=ux-adapter.js.map