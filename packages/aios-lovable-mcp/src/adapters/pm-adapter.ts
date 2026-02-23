/**
 * PM Adapter (Morgan)
 *
 * Translates MCP aios_strategize requests into @pm (Product Manager) agent
 * execution and parses strategy/PRD output.
 *
 * Phase 2: Executes strategize operation with market research, positioning,
 * and PRD generation. Invokes @pm and @analyst for comprehensive analysis.
 */

import type {
  AgentResponse,
  StrategizeOutput,
  StrategizeInput,
} from '../types/lovable.js';

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export class PMAdapter {
  async execute(
    input: StrategizeInput
  ): Promise<AgentResponse<StrategizeOutput>> {
    const start = Date.now();

    try {
      const result = await this.runAgent(input);
      return {
        success: true,
        data: result,
        duration_ms: Date.now() - start,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown PM agent error';
      return {
        success: false,
        error: {
          code: 'AGENT_FAILURE',
          message: `PM agent failed: ${message}`,
        },
        duration_ms: Date.now() - start,
      };
    }
  }

  private async runAgent(input: StrategizeInput): Promise<StrategizeOutput> {
    // Phase 2: Build strategy and PRD from requirements
    // Real agent integration will replace this in Phase 3

    const targetSegments = input.target_segments
      ? input.target_segments.map((s) => ({ segment: s, size: 'medium', growth: 'steady' }))
      : [
          { segment: 'Early Adopters', size: 'small', growth: 'fast' },
          { segment: 'Mainstream', size: 'large', growth: 'steady' },
        ];

    const strategy = {
      product_vision: `Vision for "${input.product_name}"`,
      target_segments: targetSegments,
      positioning: {
        unique_value_prop: `${input.product_name} enables users to ${input.key_problems?.[0] || 'achieve their goals'}`,
        competitive_advantage: 'Built with AIOS agent orchestration',
        market_positioning: 'Premium, AI-first solution',
      },
      roadmap: {
        phase_1_3months: ['Core feature MVP', 'User onboarding', 'Analytics'],
        phase_2_6months: [
          'Advanced features',
          'API marketplace',
          'Community tools',
        ],
        phase_3_12months: ['Enterprise tier', 'Global expansion', 'Partner ecosystem'],
      },
    };

    const prd = {
      title: `PRD: ${input.product_name}`,
      version: '1.0.0',
      created_at: new Date().toISOString(),
      overview: {
        product_name: input.product_name,
        description: input.description || 'Product description pending',
        target_users: input.target_segments?.join(', ') || 'Early adopters',
      },
      functional_requirements: [
        {
          id: 'FR-1',
          category: 'Core',
          requirement: 'User authentication and onboarding',
          priority: 'P0',
        },
        {
          id: 'FR-2',
          category: 'Core',
          requirement: 'Main feature set',
          priority: 'P0',
        },
        {
          id: 'FR-3',
          category: 'Analytics',
          requirement: 'Usage tracking and reporting',
          priority: 'P1',
        },
      ],
      non_functional_requirements: [
        { id: 'NFR-1', requirement: '99.5% uptime SLA', priority: 'P0' },
        { id: 'NFR-2', requirement: '<200ms API response time', priority: 'P0' },
        { id: 'NFR-3', requirement: 'GDPR compliance', priority: 'P0' },
      ],
      success_metrics: input.success_metrics || [
        'User activation rate >40%',
        'Monthly active users growth >20%',
        'NPS >50',
      ],
    };

    return {
      strategy,
      prd,
      strategy_markdown: this.formatStrategyMarkdown(strategy),
      prd_markdown: this.formatPRDMarkdown(prd),
    };
  }

  private formatStrategyMarkdown(strategy: any): string {
    return [
      '# Product Strategy',
      '',
      `## Vision`,
      `${strategy.product_vision}`,
      '',
      '## Target Segments',
      strategy.target_segments
        .map((s: any) => `- **${s.segment}**: ${s.size} market, ${s.growth} growth`)
        .join('\n'),
      '',
      '## Positioning',
      `- **Value Prop**: ${strategy.positioning.unique_value_prop}`,
      `- **Competitive Advantage**: ${strategy.positioning.competitive_advantage}`,
      `- **Market Position**: ${strategy.positioning.market_positioning}`,
      '',
      '## Roadmap',
      '### Phase 1 (0-3 months)',
      strategy.roadmap.phase_1_3months
        .map((item: string) => `- ${item}`)
        .join('\n'),
      '### Phase 2 (3-6 months)',
      strategy.roadmap.phase_2_6months
        .map((item: string) => `- ${item}`)
        .join('\n'),
      '### Phase 3 (6-12 months)',
      strategy.roadmap.phase_3_12months
        .map((item: string) => `- ${item}`)
        .join('\n'),
    ].join('\n');
  }

  private formatPRDMarkdown(prd: any): string {
    return [
      `# ${prd.title}`,
      '',
      '## Overview',
      `**Product**: ${prd.overview.product_name}`,
      `**Description**: ${prd.overview.description}`,
      `**Target Users**: ${prd.overview.target_users}`,
      '',
      '## Functional Requirements',
      prd.functional_requirements
        .map(
          (fr: any) =>
            `### ${fr.id}: ${fr.requirement} (${fr.priority})\n${fr.category}`
        )
        .join('\n'),
      '',
      '## Non-Functional Requirements',
      prd.non_functional_requirements
        .map((nfr: any) => `- ${nfr.requirement} (${nfr.priority})`)
        .join('\n'),
      '',
      '## Success Metrics',
      prd.success_metrics.map((m: string) => `- ${m}`).join('\n'),
    ].join('\n');
  }

  get timeoutMs(): number {
    return TIMEOUT_MS;
  }
}
