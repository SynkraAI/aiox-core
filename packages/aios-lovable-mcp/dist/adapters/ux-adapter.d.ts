/**
 * UX Adapter (Uma)
 *
 * Translates MCP aios_design_ux requests into @ux-design-expert agent
 * execution and parses design system/wireframe output.
 *
 * Phase 2: Executes design operations with component specs, design tokens,
 * and accessibility guidance. Invokes @ux-design-expert.
 */
import type { AgentResponse, DesignUXOutput, DesignUXInput } from '../types/lovable.js';
export declare class UXAdapter {
    execute(input: DesignUXInput): Promise<AgentResponse<DesignUXOutput>>;
    private runAgent;
    private formatDesignMarkdown;
    private formatWireframesMarkdown;
    get timeoutMs(): number;
}
//# sourceMappingURL=ux-adapter.d.ts.map