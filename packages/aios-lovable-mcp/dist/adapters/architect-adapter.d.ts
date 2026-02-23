/**
 * Architect Adapter
 *
 * Translates MCP aios_design_architecture requests into @architect agent
 * execution and parses the result back into structured JSON.
 *
 * Phase 1 (MVP): Returns a structured architecture document built from
 * the input spec. In production, this will invoke the actual @architect
 * agent via the AIOS orchestration engine.
 */
import type { AgentResponse, DesignArchitectureOutput, DesignArchitectureInput } from '../types/lovable.js';
export declare class ArchitectAdapter {
    execute(input: DesignArchitectureInput): Promise<AgentResponse<DesignArchitectureOutput>>;
    private runAgent;
    get timeoutMs(): number;
}
//# sourceMappingURL=architect-adapter.d.ts.map