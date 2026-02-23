/**
 * Orchestrator - Routes MCP tool calls to the appropriate AIOS agent adapter.
 *
 * For Phase 1 (MVP), agent execution is synchronous and in-process.
 * Phase 2 (Current) introduces BullMQ async job processing with webhooks.
 */
import { ArchitectAdapter } from './architect-adapter.js';
import { DevAdapter } from './dev-adapter.js';
import { PMAdapter } from './pm-adapter.js';
import { UXAdapter } from './ux-adapter.js';
export class Orchestrator {
    architectAdapter;
    devAdapter;
    pmAdapter;
    uxAdapter;
    constructor() {
        this.architectAdapter = new ArchitectAdapter();
        this.devAdapter = new DevAdapter();
        this.pmAdapter = new PMAdapter();
        this.uxAdapter = new UXAdapter();
    }
    async designArchitecture(input) {
        return this.architectAdapter.execute(input);
    }
    async generateCode(input) {
        return this.devAdapter.execute(input);
    }
    async strategize(input) {
        return this.pmAdapter.execute(input);
    }
    async designUX(input) {
        return this.uxAdapter.execute(input);
    }
}
//# sourceMappingURL=orchestrator.js.map