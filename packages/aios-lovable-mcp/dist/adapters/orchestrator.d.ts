/**
 * Orchestrator - Routes MCP tool calls to the appropriate AIOS agent adapter.
 *
 * For Phase 1 (MVP), agent execution is synchronous and in-process.
 * Phase 2 (Current) introduces BullMQ async job processing with webhooks.
 */
import type { AgentResponse } from '../types/lovable.js';
export declare class Orchestrator {
    private architectAdapter;
    private devAdapter;
    private pmAdapter;
    private uxAdapter;
    constructor();
    designArchitecture(input: {
        spec: string;
        requirements?: Record<string, unknown>;
        stack_preference?: string;
    }): Promise<AgentResponse>;
    generateCode(input: {
        spec: string;
        architecture?: Record<string, unknown>;
        ux_spec?: Record<string, unknown>;
        target_files?: string[];
        framework?: string;
    }): Promise<AgentResponse>;
    strategize(input: {
        product_name: string;
        description?: string;
        target_segments?: string[];
        key_problems?: string[];
        success_metrics?: string[];
    }): Promise<AgentResponse>;
    designUX(input: {
        product_name: string;
        user_flows?: string[];
        design_preferences?: Record<string, unknown>;
        accessibility_requirements?: string[];
    }): Promise<AgentResponse>;
}
//# sourceMappingURL=orchestrator.d.ts.map