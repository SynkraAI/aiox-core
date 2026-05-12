/**
 * PMDR Template Tests
 *
 * Test suite for Product Management Decision Record template.
 *
 * @module tests/pmdr
 * @story 3.9 - Template PMDR
 */

'use strict';

const path = require('path');
const { TemplateEngine } = require('../../.aiox-core/product/templates/engine');

describe('PMDR Template', () => {
  let engine;

  beforeAll(() => {
    engine = new TemplateEngine({
      interactive: false,
      baseDir: path.join(__dirname, '..', '..'),
    });
  });

  /**
   * PMDR-01: Generate PMDR with required fields
   * Priority: P0
   */
  describe('PMDR-01: Generate PMDR with required fields', () => {
    it('should generate a valid PMDR document with all required fields', async () => {
      const context = {
        number: 1,
        title: 'Implement Feature Flag System',
        status: 'Draft',
        owner: 'Product Manager',
        stakeholders: ['Engineering Lead', 'QA Lead', 'Designer'],
        context: 'We need a way to safely roll out new features to production without full deployment risk.',
        decision: 'We will implement a feature flag system using LaunchDarkly to enable gradual rollouts and A/B testing.',
        businessImpact: 'This will reduce deployment risk by 80% and enable faster iteration on features.',
        successMetrics: [
          { metric: 'Deployment failures', current: '15%', target: '3%', timeline: 'Q2 2025' },
          { metric: 'Feature iteration time', current: '2 weeks', target: '3 days', timeline: 'Q3 2025' },
        ],
      };

      const result = await engine.generate('pmdr', context, { validate: true, save: false });

      expect(result.content).toBeDefined();
      expect(result.content).toContain('# PMDR 001: Implement Feature Flag System');
      expect(result.content).toContain('**Status:** Draft');
      expect(result.content).toContain('**Owner:** Product Manager');
      expect(result.content).toContain('## Stakeholders');
      expect(result.content).toContain('- Engineering Lead');
      expect(result.content).toContain('## Context');
      expect(result.content).toContain('## Decision');
      expect(result.content).toContain('## Business Impact');
      expect(result.content).toContain('## Success Metrics');
      expect(result.templateType).toBe('pmdr');
    });

    it('should fail validation without required fields', async () => {
      const incompleteContext = {
        number: 1,
        title: 'Test',
        // Missing: status, owner, stakeholders, context, decision, businessImpact, successMetrics
      };

      await expect(
        engine.generate('pmdr', incompleteContext, { validate: true, save: false }),
      ).rejects.toThrow(/required.*has no default|missing required/i);
    });
  });

  /**
   * PMDR-02: Success metrics table renders
   * Priority: P0
   */
  describe('PMDR-02: Success metrics table renders', () => {
    it('should render success metrics as a table', async () => {
      const context = {
        number: 2,
        title: 'Test Metrics Rendering',
        status: 'Draft',
        owner: 'PM',
        stakeholders: ['Team'],
        context: 'Testing success metrics rendering in PMDR template.',
        decision: 'Verify metrics table renders correctly with all columns.',
        businessImpact: 'Ensures proper documentation of success criteria.',
        successMetrics: [
          { metric: 'Conversion Rate', current: '2%', target: '5%', timeline: 'Q1' },
          { metric: 'User Engagement', current: '10min', target: '20min', timeline: 'Q2' },
          { metric: 'Revenue Growth', target: '25%' }, // No current value
        ],
      };

      const result = await engine.generate('pmdr', context, { validate: true, save: false });

      // Check table headers
      expect(result.content).toContain('| Metric | Current | Target | Timeline |');
      expect(result.content).toContain('|--------|---------|--------|----------|');

      // Check table rows
      expect(result.content).toContain('| Conversion Rate | 2% | 5% | Q1 |');
      expect(result.content).toContain('| User Engagement | 10min | 20min | Q2 |');
      expect(result.content).toContain('Revenue Growth');
      expect(result.content).toContain('25%');
    });
  });

  /**
   * PMDR-03: Approval workflow renders
   * Priority: P1
   */
  describe('PMDR-03: Approval workflow renders', () => {
    it('should render approval tracking table when approvals exist', async () => {
      const context = {
        number: 3,
        title: 'Test Approval Workflow',
        status: 'Under Review',
        owner: 'PM',
        stakeholders: ['CTO', 'CEO', 'Engineering Lead'],
        context: 'Testing approval workflow rendering.',
        decision: 'Test decision for approval workflow.',
        businessImpact: 'Ensures proper approval tracking.',
        successMetrics: [{ metric: 'Test', target: '100%' }],
        approvals: [
          { stakeholder: 'CTO', decision: 'Approved', date: '2025-01-15', notes: 'LGTM' },
          { stakeholder: 'CEO', decision: 'Pending' },
          { stakeholder: 'Engineering Lead', decision: 'Approved', date: '2025-01-14' },
        ],
      };

      const result = await engine.generate('pmdr', context, { validate: true, save: false });

      expect(result.content).toContain('## Approval');
      expect(result.content).toContain('| Stakeholder | Decision | Date | Notes |');
      expect(result.content).toContain('| CTO | Approved | 2025-01-15 | LGTM |');
      expect(result.content).toContain('Engineering Lead');
    });

    it('should show pending approval message when no approvals', async () => {
      const context = {
        number: 4,
        title: 'Test No Approvals',
        status: 'Draft',
        owner: 'PM',
        stakeholders: ['Team'],
        context: 'Testing when no approvals exist.',
        decision: 'Test decision.',
        businessImpact: 'Test impact.',
        successMetrics: [{ metric: 'Test', target: '100%' }],
        // No approvals array
      };

      const result = await engine.generate('pmdr', context, { validate: true, save: false });

      expect(result.content).toContain('_Pending approval._');
    });
  });

  /**
   * PMDR-04: Validation fails without businessImpact
   * Priority: P0
   */
  describe('PMDR-04: Validation fails without businessImpact', () => {
    it('should fail schema validation when businessImpact is empty', async () => {
      const context = {
        number: 5,
        title: 'Test Missing Business Impact',
        status: 'Draft',
        owner: 'PM',
        stakeholders: ['Team'],
        context: 'Testing validation of business impact field.',
        decision: 'Test decision requiring business impact.',
        businessImpact: '', // Empty string - should fail minLength: 20
        successMetrics: [{ metric: 'Test', target: '100%' }],
      };

      await expect(
        engine.generate('pmdr', context, { validate: true, save: false }),
      ).rejects.toThrow();
    });

    it('should fail when businessImpact is too short', async () => {
      const context = {
        number: 6,
        title: 'Test Short Business Impact',
        status: 'Draft',
        owner: 'PM',
        stakeholders: ['Team'],
        context: 'Testing validation of business impact minimum length.',
        decision: 'Test decision with short business impact.',
        businessImpact: 'Too short', // Less than 20 chars
        successMetrics: [{ metric: 'Test', target: '100%' }],
      };

      const result = await engine.generate('pmdr', context, { validate: true, save: false });

      // Should have validation errors
      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('businessImpact'))).toBe(true);
    });
  });

  /**
   * PMDR-05: CLI command executes successfully
   * Priority: P0
   */
  describe('PMDR-05: CLI command executes successfully', () => {
    it('should be included in supported types', () => {
      expect(engine.supportedTypes).toContain('pmdr');
    });

    it('should load template info successfully', async () => {
      const info = await engine.getTemplateInfo('pmdr');

      expect(info.type).toBe('pmdr');
      expect(info.name).toBe('Product Management Decision Record');
      expect(info.version).toBeDefined();
      expect(info.variables).toBeDefined();
      expect(Array.isArray(info.variables)).toBe(true);

      // Check required variables
      const requiredVars = info.variables.filter(v => v.required);
      const requiredNames = requiredVars.map(v => v.name);

      expect(requiredNames).toContain('number');
      expect(requiredNames).toContain('title');
      expect(requiredNames).toContain('businessImpact');
      expect(requiredNames).toContain('successMetrics');
    });

    it('should list pmdr in available templates', async () => {
      const templates = await engine.listTemplates();
      const pmdrTemplate = templates.find(t => t.type === 'pmdr');

      expect(pmdrTemplate).toBeDefined();
      expect(pmdrTemplate.status).not.toBe('missing');
    });
  });

  /**
   * Additional tests for optional sections
   */
  describe('Optional sections rendering', () => {
    it('should render implementation phases when provided', async () => {
      const context = {
        number: 7,
        title: 'Test Implementation Phases',
        status: 'Draft',
        owner: 'PM',
        stakeholders: ['Team'],
        context: 'Testing implementation phases rendering.',
        decision: 'Test decision with implementation phases.',
        businessImpact: 'This will improve our delivery pipeline.',
        successMetrics: [{ metric: 'Test', target: '100%' }],
        implementationPhases: [
          { name: 'Discovery', duration: '2 weeks', description: 'Research and planning' },
          { name: 'Development', duration: '4 weeks', description: 'Build the solution' },
          { name: 'Rollout', duration: '1 week', description: 'Gradual deployment' },
        ],
      };

      const result = await engine.generate('pmdr', context, { validate: true, save: false });

      expect(result.content).toContain('## Implementation');
      expect(result.content).toContain('### Phases');
      expect(result.content).toContain('**Discovery**');
      expect(result.content).toContain('2 weeks');
    });

    it('should render risks table when provided', async () => {
      const context = {
        number: 8,
        title: 'Test Risks Rendering',
        status: 'Draft',
        owner: 'PM',
        stakeholders: ['Team'],
        context: 'Testing risks table rendering.',
        decision: 'Test decision with risks.',
        businessImpact: 'This decision has associated risks.',
        successMetrics: [{ metric: 'Test', target: '100%' }],
        risks: [
          { risk: 'Technical complexity', impact: 'High', mitigation: 'Spike investigation' },
          { risk: 'Resource constraints', impact: 'Medium', mitigation: 'Hire contractors' },
        ],
      };

      const result = await engine.generate('pmdr', context, { validate: true, save: false });

      expect(result.content).toContain('### Risks');
      expect(result.content).toContain('| Risk | Impact | Mitigation |');
      expect(result.content).toContain('Technical complexity');
      expect(result.content).toContain('Spike investigation');
    });

    it('should render alternatives when provided', async () => {
      const context = {
        number: 9,
        title: 'Test Alternatives Rendering',
        status: 'Draft',
        owner: 'PM',
        stakeholders: ['Team'],
        context: 'Testing alternatives section rendering.',
        decision: 'We chose option A over alternatives.',
        businessImpact: 'This is the best option for our needs.',
        successMetrics: [{ metric: 'Test', target: '100%' }],
        alternatives: [
          { name: 'Option B', description: 'Alternative approach', whyNot: 'Too expensive' },
          { name: 'Option C', description: 'Another approach', whyNot: 'Not scalable' },
        ],
      };

      const result = await engine.generate('pmdr', context, { validate: true, save: false });

      expect(result.content).toContain('## Alternatives Considered');
      expect(result.content).toContain('Option B');
      expect(result.content).toContain('Too expensive');
    });
  });
});
