/**
 * Type definitions for the Lovable-AIOS MCP Server.
 *
 * These types define the input/output contracts for tools exposed
 * to Lovable via MCP protocol, matching the API contract in
 * docs/integration/lovable-api-contract.md.
 */
export interface AiosError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    request_id?: string;
}
export interface ErrorResponse {
    error: AiosError;
}
export interface DesignArchitectureInput {
    spec: string;
    requirements?: Record<string, unknown>;
    stack_preference?: string;
}
export interface StackDefinition {
    frontend: string;
    backend: string;
    deployment: string;
}
export interface EntityField {
    name: string;
    type: string;
    primary?: boolean;
    unique?: boolean;
}
export interface DataEntity {
    name: string;
    fields: EntityField[];
}
export interface DataRelationship {
    from: string;
    to: string;
    type: string;
}
export interface DataModel {
    entities: DataEntity[];
    relationships: DataRelationship[];
}
export interface ApiEndpoint {
    method: string;
    path: string;
    description: string;
}
export interface SecurityDesign {
    auth_strategy: string;
    rls_policies: string[];
}
export interface Architecture {
    stack: StackDefinition;
    data_model: DataModel;
    api_design: {
        endpoints: ApiEndpoint[];
    };
    security: SecurityDesign;
}
export interface DesignArchitectureOutput {
    architecture: Architecture;
    architecture_markdown: string;
}
export interface GenerateCodeInput {
    spec: string;
    architecture?: Record<string, unknown>;
    ux_spec?: Record<string, unknown>;
    target_files?: string[];
    framework?: string;
}
export interface GeneratedFile {
    path: string;
    content: string;
    language: string;
}
export interface GenerateCodeOutput {
    files: GeneratedFile[];
    dependencies: {
        production: Record<string, string>;
        development: Record<string, string>;
    };
    setup_instructions: string;
}
export interface StrategizeInput {
    product_name: string;
    description?: string;
    target_segments?: string[];
    key_problems?: string[];
    success_metrics?: string[];
    market_context?: string;
}
export interface Strategy {
    product_vision: string;
    target_segments: Array<{
        segment: string;
        size: string;
        growth: string;
    }>;
    positioning: {
        unique_value_prop: string;
        competitive_advantage: string;
        market_positioning: string;
    };
    roadmap: {
        phase_1_3months: string[];
        phase_2_6months: string[];
        phase_3_12months: string[];
    };
}
export interface PRD {
    title: string;
    version: string;
    created_at: string;
    overview: {
        product_name: string;
        description: string;
        target_users: string;
    };
    functional_requirements: Array<{
        id: string;
        category: string;
        requirement: string;
        priority: string;
    }>;
    non_functional_requirements: Array<{
        id: string;
        requirement: string;
        priority: string;
    }>;
    success_metrics: string[];
}
export interface StrategizeOutput {
    strategy: Strategy;
    prd: PRD;
    strategy_markdown: string;
    prd_markdown: string;
}
export interface DesignUXInput {
    product_name: string;
    user_flows?: string[];
    design_preferences?: Record<string, unknown>;
    accessibility_requirements?: string[];
}
export interface DesignSystem {
    typography: Record<string, unknown>;
    colors: Record<string, unknown>;
    spacing: Record<string, unknown>;
    shadows: Record<string, unknown>;
    components: Array<Record<string, unknown>>;
}
export interface Wireframe {
    page: string;
    layout: string;
    key_elements: string[];
}
export interface DesignUXOutput {
    design_system: DesignSystem;
    wireframes: Wireframe[];
    design_system_markdown: string;
    wireframes_markdown: string;
    accessibility_guidelines: string[];
}
export interface JobData {
    tool: string;
    input: Record<string, unknown>;
    priority?: 'low' | 'normal' | 'high';
    webhook_url?: string;
}
export interface JobResult {
    job_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    output?: unknown;
    error?: AiosError;
}
export interface AgentTask {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
}
export interface AgentRequest {
    tool: string;
    input: Record<string, unknown>;
    timeout_ms: number;
}
export interface AgentResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: AiosError;
    duration_ms: number;
}
//# sourceMappingURL=lovable.d.ts.map