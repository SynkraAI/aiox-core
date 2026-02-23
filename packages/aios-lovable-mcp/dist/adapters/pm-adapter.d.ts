/**
 * PM Adapter (Morgan)
 *
 * Translates MCP aios_strategize requests into @pm (Product Manager) agent
 * execution and parses strategy/PRD output.
 *
 * Phase 2: Executes strategize operation with market research, positioning,
 * and PRD generation. Invokes @pm and @analyst for comprehensive analysis.
 */
import type { AgentResponse, StrategizeOutput, StrategizeInput } from '../types/lovable.js';
export declare class PMAdapter {
    execute(input: StrategizeInput): Promise<AgentResponse<StrategizeOutput>>;
    private runAgent;
    private formatStrategyMarkdown;
    private formatPRDMarkdown;
    get timeoutMs(): number;
}
//# sourceMappingURL=pm-adapter.d.ts.map