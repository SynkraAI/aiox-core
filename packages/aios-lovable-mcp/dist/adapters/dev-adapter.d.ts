/**
 * Dev Adapter
 *
 * Translates MCP aios_generate_code requests into @dev agent execution
 * and parses the result back into structured file output.
 *
 * Phase 1 (MVP): Returns scaffold code files based on the spec.
 * In production, this will invoke the actual @dev agent via AIOS.
 */
import type { AgentResponse, GenerateCodeOutput, GenerateCodeInput } from '../types/lovable.js';
export declare class DevAdapter {
    execute(input: GenerateCodeInput): Promise<AgentResponse<GenerateCodeOutput>>;
    private runAgent;
    get timeoutMs(): number;
}
//# sourceMappingURL=dev-adapter.d.ts.map