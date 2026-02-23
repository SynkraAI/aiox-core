/**
 * Orchestrator - Routes MCP tool calls to the appropriate AIOS agent adapter.
 *
 * For Phase 1 (MVP), agent execution is synchronous and in-process.
 * Phase 2 (Current) introduces BullMQ async job processing with webhooks.
 */

import type { AgentResponse } from '../types/lovable.js';
import { ArchitectAdapter } from './architect-adapter.js';
import { DevAdapter } from './dev-adapter.js';
import { PMAdapter } from './pm-adapter.js';
import { UXAdapter } from './ux-adapter.js';

export class Orchestrator {
  private architectAdapter: ArchitectAdapter;
  private devAdapter: DevAdapter;
  private pmAdapter: PMAdapter;
  private uxAdapter: UXAdapter;

  constructor() {
    this.architectAdapter = new ArchitectAdapter();
    this.devAdapter = new DevAdapter();
    this.pmAdapter = new PMAdapter();
    this.uxAdapter = new UXAdapter();
  }

  async designArchitecture(input: {
    spec: string;
    requirements?: Record<string, unknown>;
    stack_preference?: string;
  }): Promise<AgentResponse> {
    return this.architectAdapter.execute(input);
  }

  async generateCode(input: {
    spec: string;
    architecture?: Record<string, unknown>;
    ux_spec?: Record<string, unknown>;
    target_files?: string[];
    framework?: string;
  }): Promise<AgentResponse> {
    return this.devAdapter.execute(input);
  }

  async strategize(input: {
    product_name: string;
    description?: string;
    target_segments?: string[];
    key_problems?: string[];
    success_metrics?: string[];
  }): Promise<AgentResponse> {
    return this.pmAdapter.execute(input);
  }

  async designUX(input: {
    product_name: string;
    user_flows?: string[];
    design_preferences?: Record<string, unknown>;
    accessibility_requirements?: string[];
  }): Promise<AgentResponse> {
    return this.uxAdapter.execute(input);
  }
}
