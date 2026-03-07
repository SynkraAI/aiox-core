/**
 * Unit tests for skill-dispatcher module
 *
 * Tests the SkillDispatcher class that maps agent IDs to AIOS Skill
 * invocations and handles dispatch payloads and result parsing.
 */

const SkillDispatcher = require('../../../.aiox-core/core/orchestration/skill-dispatcher');

describe('SkillDispatcher', () => {
  let dispatcher;

  beforeEach(() => {
    dispatcher = new SkillDispatcher();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('initializes with default options', () => {
      expect(dispatcher.options).toEqual({});
      expect(dispatcher.skillMapping).toBeDefined();
      expect(dispatcher.agentPersonas).toBeDefined();
    });

    test('stores custom options', () => {
      const d = new SkillDispatcher({ debug: true });
      expect(d.options).toEqual({ debug: true });
    });

    test('has all primary agents in skill mapping', () => {
      const primary = [
        'architect', 'data-engineer', 'dev', 'qa',
        'pm', 'po', 'sm', 'analyst',
        'ux-design-expert', 'devops', 'aios-master',
      ];
      for (const agent of primary) {
        expect(dispatcher.skillMapping[agent]).toBeDefined();
      }
    });

    test('has aliases in skill mapping', () => {
      expect(dispatcher.skillMapping['ux-expert']).toBe('AIOX:agents:ux-design-expert');
      expect(dispatcher.skillMapping['github-devops']).toBe('AIOX:agents:devops');
    });
  });

  // ============================================================
  // getSkillName
  // ============================================================
  describe('getSkillName', () => {
    test('returns mapped skill name for known agents', () => {
      expect(dispatcher.getSkillName('architect')).toBe('AIOX:agents:architect');
      expect(dispatcher.getSkillName('dev')).toBe('AIOX:agents:dev');
      expect(dispatcher.getSkillName('qa')).toBe('AIOX:agents:qa');
    });

    test('resolves aliases to canonical skill', () => {
      expect(dispatcher.getSkillName('ux-expert')).toBe('AIOX:agents:ux-design-expert');
      expect(dispatcher.getSkillName('github-devops')).toBe('AIOX:agents:devops');
    });

    test('generates fallback skill name for unknown agents', () => {
      expect(dispatcher.getSkillName('custom-agent')).toBe('AIOX:agents:custom-agent');
    });
  });

  // ============================================================
  // getAgentPersona
  // ============================================================
  describe('getAgentPersona', () => {
    test('returns persona for known agents', () => {
      expect(dispatcher.getAgentPersona('architect')).toEqual({
        name: 'Aria', title: 'System Architect',
      });
      expect(dispatcher.getAgentPersona('dev')).toEqual({
        name: 'Dex', title: 'Senior Developer',
      });
      expect(dispatcher.getAgentPersona('qa')).toEqual({
        name: 'Quinn', title: 'QA Guardian',
      });
    });

    test('returns default persona for unknown agents', () => {
      expect(dispatcher.getAgentPersona('unknown')).toEqual({
        name: 'unknown', title: 'AIOS Agent',
      });
    });

    test('returns persona for aliases', () => {
      expect(dispatcher.getAgentPersona('ux-expert')).toEqual({
        name: 'Brad', title: 'UX Design Expert',
      });
    });
  });

  // ============================================================
  // buildDispatchPayload
  // ============================================================
  describe('buildDispatchPayload', () => {
    const baseParams = {
      agentId: 'architect',
      prompt: 'Design the system architecture',
      phase: {
        phase: 1,
        phase_name: 'Architecture',
        step: 'design',
        action: 'create-architecture',
        task: 'design-system.md',
        creates: 'docs/architecture.md',
        checklist: 'arch-review',
        template: 'arch-template',
      },
      context: {
        workflowId: 'wf-123',
        yoloMode: true,
        previousPhases: { 0: { agent: 'pm' } },
        executionProfile: 'fast',
        executionPolicy: { risk: 'low' },
      },
    };

    test('builds complete payload', () => {
      const payload = dispatcher.buildDispatchPayload(baseParams);

      expect(payload.skill).toBe('AIOX:agents:architect');
      expect(payload.context.phase).toBe(1);
      expect(payload.context.phaseName).toBe('Architecture');
      expect(payload.context.step).toBe('design');
      expect(payload.context.action).toBe('create-architecture');
      expect(payload.context.task).toBe('design-system.md');
      expect(payload.context.creates).toBe('docs/architecture.md');
      expect(payload.context.prompt).toBe('Design the system architecture');
      expect(payload.context.workflowId).toBe('wf-123');
      expect(payload.context.yoloMode).toBe(true);
      expect(payload.context.executionProfile).toBe('fast');
    });

    test('builds args string with task and output', () => {
      const payload = dispatcher.buildDispatchPayload(baseParams);

      expect(payload.args).toContain('--task="design-system.md"');
      expect(payload.args).toContain('--output="docs/architecture.md"');
      expect(payload.args).toContain('--phase=1');
      expect(payload.args).toContain('--yolo');
    });

    test('handles array creates (uses first element)', () => {
      const params = {
        ...baseParams,
        phase: { ...baseParams.phase, creates: ['docs/a.md', 'docs/b.md'] },
      };

      const payload = dispatcher.buildDispatchPayload(params);
      expect(payload.args).toContain('--output="docs/a.md"');
    });

    test('omits optional args when not present', () => {
      const params = {
        agentId: 'dev',
        prompt: 'Implement',
        phase: { phase: 2 },
        context: { workflowId: 'wf-1' },
      };

      const payload = dispatcher.buildDispatchPayload(params);
      expect(payload.args).not.toContain('--task');
      expect(payload.args).not.toContain('--output');
      expect(payload.args).not.toContain('--yolo');
      expect(payload.args).toContain('--phase=2');
    });

    test('includes tech stack flags', () => {
      const params = {
        ...baseParams,
        techStackProfile: {
          hasDatabase: true,
          database: { type: 'postgresql' },
          hasFrontend: true,
          frontend: { framework: 'react' },
          hasTypeScript: true,
        },
      };

      const payload = dispatcher.buildDispatchPayload(params);
      expect(payload.args).toContain('--has-database');
      expect(payload.args).toContain('--db-type="postgresql"');
      expect(payload.args).toContain('--has-frontend');
      expect(payload.args).toContain('--frontend="react"');
      expect(payload.args).toContain('--typescript');
      expect(payload.context.techStack).toEqual({
        hasDatabase: true,
        database: { type: 'postgresql' },
        hasFrontend: true,
        frontend: { framework: 'react' },
        hasTypeScript: true,
      });
    });

    test('omits tech stack flags when no profile', () => {
      const payload = dispatcher.buildDispatchPayload(baseParams);
      expect(payload.args).not.toContain('--has-database');
      expect(payload.args).not.toContain('--typescript');
    });

    test('handles partial tech stack (db only)', () => {
      const params = {
        ...baseParams,
        techStackProfile: {
          hasDatabase: true,
          database: { type: 'mysql' },
          hasFrontend: false,
          hasTypeScript: false,
        },
      };

      const payload = dispatcher.buildDispatchPayload(params);
      expect(payload.args).toContain('--has-database');
      expect(payload.args).toContain('--db-type="mysql"');
      expect(payload.args).not.toContain('--has-frontend');
      expect(payload.args).not.toContain('--typescript');
    });

    test('defaults for missing context fields', () => {
      const params = {
        agentId: 'dev',
        prompt: 'Build',
        phase: { phase: 1 },
        context: {},
      };

      const payload = dispatcher.buildDispatchPayload(params);
      expect(payload.context.yoloMode).toBe(false);
      expect(payload.context.previousPhases).toEqual({});
      expect(payload.context.executionProfile).toBeNull();
      expect(payload.context.executionPolicy).toBeNull();
    });
  });

  // ============================================================
  // parseSkillOutput
  // ============================================================
  describe('parseSkillOutput', () => {
    test('handles null result', () => {
      const result = dispatcher.parseSkillOutput(null);
      expect(result.status).toBe('failed');
      expect(result.summary).toContain('No result');
      expect(result.timestamp).toBeDefined();
    });

    test('handles undefined result', () => {
      const result = dispatcher.parseSkillOutput(undefined);
      expect(result.status).toBe('failed');
    });

    test('passes through structured object with status', () => {
      const input = {
        status: 'success',
        output_path: '/out.md',
        summary: 'Done',
        timestamp: '2025-01-01T00:00:00Z',
      };

      const result = dispatcher.parseSkillOutput(input);
      expect(result.status).toBe('success');
      expect(result.output_path).toBe('/out.md');
      expect(result.timestamp).toBe('2025-01-01T00:00:00Z');
    });

    test('adds valid ISO timestamp to structured object if missing', () => {
      const input = { status: 'success', summary: 'Done' };
      const result = dispatcher.parseSkillOutput(input);
      expect(result.timestamp).toBeDefined();
      expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
    });

    test('extracts JSON from markdown code block', () => {
      const input = 'Some text\n```json\n{"status":"success","summary":"Extracted","output_path":"/out.md"}\n```\nMore text';
      const result = dispatcher.parseSkillOutput(input, { creates: '/default.md' });

      expect(result.status).toBe('success');
      expect(result.summary).toBe('Extracted');
      expect(result.output_path).toBe('/out.md');
    });

    test('uses phase.creates when JSON has no output_path', () => {
      const input = '```json\n{"summary":"Done"}\n```';
      const result = dispatcher.parseSkillOutput(input, { creates: '/phase-out.md' });

      expect(result.output_path).toBe('/phase-out.md');
    });

    test('parses plain JSON string', () => {
      const input = '{"status":"success","summary":"Plain JSON"}';
      const result = dispatcher.parseSkillOutput(input);

      expect(result.status).toBe('success');
      expect(result.summary).toBe('Plain JSON');
    });

    test('handles plain text as success with summary', () => {
      const input = 'The architecture has been designed successfully.';
      const result = dispatcher.parseSkillOutput(input, { creates: '/arch.md' });

      expect(result.status).toBe('success');
      expect(result.summary).toBe(input);
      expect(result.output_path).toBe('/arch.md');
    });

    test('truncates long text summaries to 500 chars', () => {
      const input = 'A'.repeat(1000);
      const result = dispatcher.parseSkillOutput(input);

      expect(result.summary.length).toBe(500);
    });

    test('handles invalid JSON in markdown block gracefully', () => {
      const input = '```json\n{invalid json}\n```';
      const result = dispatcher.parseSkillOutput(input);

      // Falls through to plain JSON parse, fails, then plain text
      expect(result.status).toBe('success');
      expect(result.summary).toContain('```json');
    });

    test('wraps unknown types in default structure', () => {
      const input = 42;
      const result = dispatcher.parseSkillOutput(input, { creates: '/out.md' });

      expect(result.status).toBe('success');
      expect(result.output).toBe(42);
      expect(result.output_path).toBe('/out.md');
    });

    test('wraps boolean in default structure', () => {
      const result = dispatcher.parseSkillOutput(true);
      expect(result.status).toBe('success');
      expect(result.output).toBe(true);
    });
  });

  // ============================================================
  // createSkipResult
  // ============================================================
  describe('createSkipResult', () => {
    test('creates skip result with all fields', () => {
      const phase = {
        phase: 3,
        phase_name: 'QA Review',
        agent: 'qa',
      };

      const result = dispatcher.createSkipResult(phase, 'No tests configured');

      expect(result.status).toBe('skipped');
      expect(result.reason).toBe('No tests configured');
      expect(result.phase).toBe(3);
      expect(result.phaseName).toBe('QA Review');
      expect(result.agent).toBe('qa');
      expect(result.timestamp).toBeDefined();
    });
  });

  // ============================================================
  // formatDispatchLog
  // ============================================================
  describe('formatDispatchLog', () => {
    test('formats log with persona and details', () => {
      const payload = {
        skill: 'AIOX:agents:architect',
        args: '--task="design.md"',
        context: {
          phase: 1,
          phaseName: 'Architecture',
          task: 'design-system.md',
          creates: 'docs/arch.md',
        },
      };

      const log = dispatcher.formatDispatchLog(payload);

      expect(log).toContain('Aria');
      expect(log).toContain('@architect');
      expect(log).toContain('AIOX:agents:architect');
      expect(log).toContain('1 - Architecture');
      expect(log).toContain('design-system.md');
      expect(log).toContain('docs/arch.md');
    });

    test('shows N/A for missing task and output', () => {
      const payload = {
        skill: 'AIOX:agents:dev',
        args: '',
        context: { phase: 2, phaseName: 'Dev' },
      };

      const log = dispatcher.formatDispatchLog(payload);
      expect(log).toContain('Task: N/A');
      expect(log).toContain('Output: N/A');
    });

    test('uses agent ID as name for unknown agents', () => {
      const payload = {
        skill: 'AIOX:agents:custom',
        args: '',
        context: { phase: 1, phaseName: 'Custom' },
      };

      const log = dispatcher.formatDispatchLog(payload);
      expect(log).toContain('custom');
    });
  });

  // ============================================================
  // getAvailableAgents
  // ============================================================
  describe('getAvailableAgents', () => {
    test('returns only primary agents (no aliases)', () => {
      const agents = dispatcher.getAvailableAgents();

      expect(agents).toContain('architect');
      expect(agents).toContain('dev');
      expect(agents).toContain('qa');
      expect(agents).toContain('devops');
      expect(agents).toContain('aios-master');

      // Aliases should NOT be included
      expect(agents).not.toContain('ux-expert');
      expect(agents).not.toContain('github-devops');
    });

    test('returns expected count of primary agents', () => {
      const agents = dispatcher.getAvailableAgents();
      expect(agents).toHaveLength(11);
    });
  });

  // ============================================================
  // isValidAgent
  // ============================================================
  describe('isValidAgent', () => {
    test('returns true for known agents', () => {
      expect(dispatcher.isValidAgent('architect')).toBe(true);
      expect(dispatcher.isValidAgent('dev')).toBe(true);
      expect(dispatcher.isValidAgent('ux-expert')).toBe(true);
    });

    test('returns true for AIOX: prefixed agents', () => {
      expect(dispatcher.isValidAgent('AIOX:custom:agent')).toBe(true);
    });

    test('returns false for unknown non-AIOX agents', () => {
      expect(dispatcher.isValidAgent('random-agent')).toBe(false);
      expect(dispatcher.isValidAgent('')).toBe(false);
    });

    test('handles null and undefined without throwing', () => {
      expect(dispatcher.isValidAgent(null)).toBe(false);
      expect(dispatcher.isValidAgent(undefined)).toBe(false);
    });
  });
});
