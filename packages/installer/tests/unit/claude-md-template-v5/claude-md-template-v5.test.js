'use strict';

const fs = require('fs');
const path = require('path');
const { MarkdownMerger } = require('../../../src/merger/strategies/markdown-merger.js');
const {
  parseMarkdownSections,
  hasAiosMarkers,
} = require('../../../src/merger/parsers/markdown-section-parser.js');

const TEMPLATE_PATH = path.join(
  __dirname, '..', '..', '..', '..', '..', '.aios-core',
  'product', 'templates', 'ide-rules', 'claude-rules.md'
);

describe('CLAUDE.md Template v5 (Story INS-4.4)', () => {
  let templateContent;

  beforeAll(() => {
    templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  });

  describe('template has 4 new sections with AIOS-MANAGED markers', () => {
    test('template file exists and has AIOS markers', () => {
      expect(templateContent).toBeTruthy();
      expect(hasAiosMarkers(templateContent)).toBe(true);
    });

    test('contains framework-boundary section', () => {
      expect(templateContent).toContain('<!-- AIOS-MANAGED-START: framework-boundary -->');
      expect(templateContent).toContain('<!-- AIOS-MANAGED-END: framework-boundary -->');
      expect(templateContent).toContain('## Framework vs Project Boundary');
    });

    test('contains rules-system section', () => {
      expect(templateContent).toContain('<!-- AIOS-MANAGED-START: rules-system -->');
      expect(templateContent).toContain('<!-- AIOS-MANAGED-END: rules-system -->');
      expect(templateContent).toContain('## Rules System');
    });

    test('contains code-intelligence section', () => {
      expect(templateContent).toContain('<!-- AIOS-MANAGED-START: code-intelligence -->');
      expect(templateContent).toContain('<!-- AIOS-MANAGED-END: code-intelligence -->');
      expect(templateContent).toContain('## Code Intelligence');
    });

    test('contains graph-dashboard section', () => {
      expect(templateContent).toContain('<!-- AIOS-MANAGED-START: graph-dashboard -->');
      expect(templateContent).toContain('<!-- AIOS-MANAGED-END: graph-dashboard -->');
      expect(templateContent).toContain('## Graph Dashboard');
    });

    test('template has exactly 11 AIOS-MANAGED sections total', () => {
      const startMatches = templateContent.match(/<!-- AIOS-MANAGED-START:/g);
      const endMatches = templateContent.match(/<!-- AIOS-MANAGED-END:/g);
      expect(startMatches.length).toBe(11);
      expect(endMatches.length).toBe(11);
    });
  });

  describe('section content quality', () => {
    test('framework-boundary has L1-L4 table', () => {
      expect(templateContent).toContain('**L1** Framework Core');
      expect(templateContent).toContain('**L2** Framework Templates');
      expect(templateContent).toContain('**L3** Project Config');
      expect(templateContent).toContain('**L4** Project Runtime');
      expect(templateContent).toContain('frameworkProtection');
    });

    test('rules-system lists all 8 rule files', () => {
      const ruleFiles = [
        'agent-authority.md',
        'agent-handoff.md',
        'agent-memory-imports.md',
        'coderabbit-integration.md',
        'ids-principles.md',
        'mcp-usage.md',
        'story-lifecycle.md',
        'workflow-execution.md',
      ];
      for (const file of ruleFiles) {
        expect(templateContent).toContain(file);
      }
    });

    test('code-intelligence has provider status table', () => {
      expect(templateContent).toContain('**Configured**');
      expect(templateContent).toContain('**Fallback**');
      expect(templateContent).toContain('**Disabled**');
      expect(templateContent).toContain('isCodeIntelAvailable()');
    });

    test('graph-dashboard has CLI commands', () => {
      expect(templateContent).toContain('aios graph --deps');
      expect(templateContent).toContain('--format=json');
      expect(templateContent).toContain('--format=html');
      expect(templateContent).toContain('--watch');
      expect(templateContent).toContain('aios graph --stats');
    });
  });

  describe('existing sections preserved', () => {
    test('original 5 AIOS-MANAGED sections still present', () => {
      expect(templateContent).toContain('<!-- AIOS-MANAGED-START: core-framework -->');
      expect(templateContent).toContain('<!-- AIOS-MANAGED-START: agent-system -->');
      expect(templateContent).toContain('<!-- AIOS-MANAGED-START: framework-structure -->');
      expect(templateContent).toContain('<!-- AIOS-MANAGED-START: aios-patterns -->');
      expect(templateContent).toContain('<!-- AIOS-MANAGED-START: common-commands -->');
    });

    test('non-managed sections still present', () => {
      expect(templateContent).toContain('## Development Methodology');
      expect(templateContent).toContain('## Workflow Execution');
      expect(templateContent).toContain('## Best Practices');
      expect(templateContent).toContain('## Debugging');
    });
  });

  describe('upgrade: new sections added to existing CLAUDE.md', () => {
    let merger;

    beforeEach(() => {
      merger = new MarkdownMerger();
    });

    test('upgrade adds 4 new sections to CLAUDE.md without them', async () => {
      const existingClaudeMd = `# Synkra AIOS

<!-- AIOS-MANAGED-START: core-framework -->
## Core Framework Understanding
Old core content
<!-- AIOS-MANAGED-END: core-framework -->

## My Custom Section
User content that must be preserved`;

      const result = await merger.merge(existingClaudeMd, templateContent);

      // New sections added
      expect(result.content).toContain('## Framework vs Project Boundary');
      expect(result.content).toContain('## Rules System');
      expect(result.content).toContain('## Code Intelligence');
      expect(result.content).toContain('## Graph Dashboard');

      // User content preserved
      expect(result.content).toContain('## My Custom Section');
      expect(result.content).toContain('User content that must be preserved');

      // Stats reflect additions
      expect(result.stats.added).toBeGreaterThanOrEqual(4);
    });

    test('upgrade preserves custom PROJECT-CUSTOMIZED content', async () => {
      const existingClaudeMd = `# My Project Rules

<!-- AIOS-MANAGED-START: core-framework -->
## Core Framework Understanding
Core content
<!-- AIOS-MANAGED-END: core-framework -->

## Padroes de Codigo
My custom coding standards here

## Testes & Quality Gates
My custom testing rules`;

      const result = await merger.merge(existingClaudeMd, templateContent);

      // Custom sections preserved
      expect(result.content).toContain('## Padroes de Codigo');
      expect(result.content).toContain('My custom coding standards here');
      expect(result.content).toContain('## Testes & Quality Gates');
      expect(result.content).toContain('My custom testing rules');

      // Managed sections updated
      expect(result.content).toContain('<!-- AIOS-MANAGED-START: framework-boundary -->');
    });
  });

  describe('section order in template', () => {
    test('4 new sections come after framework-structure and before workflow-execution', () => {
      const frameworkStructureEnd = templateContent.indexOf('<!-- AIOS-MANAGED-END: framework-structure -->');
      const frameworkBoundaryStart = templateContent.indexOf('<!-- AIOS-MANAGED-START: framework-boundary -->');
      const graphDashboardEnd = templateContent.indexOf('<!-- AIOS-MANAGED-END: graph-dashboard -->');
      const workflowExecution = templateContent.indexOf('## Workflow Execution');

      expect(frameworkStructureEnd).toBeLessThan(frameworkBoundaryStart);
      expect(frameworkBoundaryStart).toBeLessThan(graphDashboardEnd);
      expect(graphDashboardEnd).toBeLessThan(workflowExecution);
    });
  });
});
