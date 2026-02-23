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
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
export class ArchitectAdapter {
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
            const message = err instanceof Error ? err.message : 'Unknown architect agent error';
            return {
                success: false,
                error: {
                    code: 'AGENT_FAILURE',
                    message: `Architect agent failed: ${message}`,
                },
                duration_ms: Date.now() - start,
            };
        }
    }
    async runAgent(input) {
        // Phase 1: Build a structured architecture from the spec.
        // This is a deterministic scaffold; the real agent integration
        // will replace this method body in Phase 2.
        const stackPref = input.stack_preference ?? 'nextjs-react';
        const frontend = stackPref === 'vite-react'
            ? 'Vite + React + TypeScript + Tailwind'
            : 'Next.js + React + TypeScript + Tailwind';
        const architecture = {
            architecture: {
                stack: {
                    frontend,
                    backend: 'Supabase (PostgreSQL + Auth + Storage + Edge Functions)',
                    deployment: 'Vercel',
                },
                data_model: {
                    entities: [],
                    relationships: [],
                },
                api_design: {
                    endpoints: [],
                },
                security: {
                    auth_strategy: 'Supabase Auth with RLS',
                    rls_policies: ['Users can only access their own data'],
                },
            },
            architecture_markdown: [
                '# System Architecture',
                '',
                `## Overview`,
                '',
                `Architecture generated from spec: "${input.spec.slice(0, 200)}..."`,
                '',
                `## Stack`,
                '',
                `- Frontend: ${frontend}`,
                '- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions)',
                '- Deployment: Vercel',
                '',
                '## Security',
                '',
                '- Authentication: Supabase Auth with RLS',
                '- Row Level Security policies enforced on all tables',
            ].join('\n'),
        };
        return architecture;
    }
    get timeoutMs() {
        return TIMEOUT_MS;
    }
}
//# sourceMappingURL=architect-adapter.js.map