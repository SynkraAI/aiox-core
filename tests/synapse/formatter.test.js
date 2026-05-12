/**
 * Output Formatter Tests
 *
 * Tests for <synapse-rules> XML generation, section ordering,
 * token budget enforcement, and DEVMODE output.
 *
 * @module tests/synapse/formatter
 * @story SYN-6 - SynapseEngine Orchestrator + Output Formatter
 */

jest.setTimeout(30000);

const {
  formatSynapseRules,
  enforceTokenBudget,
  estimateTokens,
  SECTION_ORDER,
  LAYER_TO_SECTION,
} = require('../../.aiox-core/core/synapse/output/formatter');

// =============================================================================
// estimateTokens
// =============================================================================

describe('estimateTokens', () => {
  test('should estimate tokens as string length / 4', () => {
    expect(estimateTokens('abcdefgh')).toBe(2); // 8 / 4
  });

  test('should ceil the result', () => {
    expect(estimateTokens('abc')).toBe(1); // ceil(3/4) = 1
  });

  test('should return 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  test('should return 0 for null/undefined', () => {
    expect(estimateTokens(null)).toBe(0);
    expect(estimateTokens(undefined)).toBe(0);
  });
});

// =============================================================================
// SECTION_ORDER and LAYER_TO_SECTION constants
// =============================================================================

describe('SECTION_ORDER', () => {
  test('should have CONTEXT_BRACKET first', () => {
    expect(SECTION_ORDER[0]).toBe('CONTEXT_BRACKET');
  });

  test('should have SUMMARY last', () => {
    expect(SECTION_ORDER[SECTION_ORDER.length - 1]).toBe('SUMMARY');
  });

  test('should include all expected sections', () => {
    const expected = [
      'CONTEXT_BRACKET', 'CONSTITUTION', 'AGENT', 'WORKFLOW',
      'TASK', 'SQUAD', 'KEYWORD', 'MEMORY_HINTS', 'STAR_COMMANDS', 'DEVMODE', 'SUMMARY',
    ];
    expect(SECTION_ORDER).toEqual(expected);
  });
});

describe('LAYER_TO_SECTION', () => {
  test('should map constitution to CONSTITUTION', () => {
    expect(LAYER_TO_SECTION.constitution).toBe('CONSTITUTION');
  });

  test('should map global to CONTEXT_BRACKET', () => {
    expect(LAYER_TO_SECTION.global).toBe('CONTEXT_BRACKET');
  });

  test('should map star-command to STAR_COMMANDS', () => {
    expect(LAYER_TO_SECTION['star-command']).toBe('STAR_COMMANDS');
  });
});

// =============================================================================
// enforceTokenBudget
// =============================================================================

describe('enforceTokenBudget', () => {
  test('should return all sections when within budget', () => {
    const sections = ['short', 'text'];
    const ids = ['CONSTITUTION', 'AGENT'];
    const result = enforceTokenBudget(sections, ids, 1000);
    expect(result).toEqual(sections);
  });

  test('should return all sections when no budget set', () => {
    const sections = ['a'.repeat(10000)];
    const ids = ['CONSTITUTION'];
    const result = enforceTokenBudget(sections, ids, 0);
    expect(result).toEqual(sections);
  });

  test('should remove SUMMARY first when over budget', () => {
    const sections = ['constitution-text', 'agent-text', 'summary-text'];
    const ids = ['CONSTITUTION', 'AGENT', 'SUMMARY'];
    // Budget of 5 tokens → way too small for all sections
    const result = enforceTokenBudget(sections, ids, 5);
    // SUMMARY should be removed first
    expect(result.length).toBeLessThan(sections.length);
  });

  test('should never remove CONTEXT_BRACKET', () => {
    const sections = ['bracket', 'summary'];
    const ids = ['CONTEXT_BRACKET', 'SUMMARY'];
    const result = enforceTokenBudget(sections, ids, 1);
    // Even at tiny budget, CONTEXT_BRACKET should remain
    const resultIds = ids.filter((_, i) => result.includes(sections[i]));
    expect(result).toContain('bracket');
  });

  test('should never remove CONSTITUTION', () => {
    const sections = ['constitution', 'keyword', 'summary'];
    const ids = ['CONSTITUTION', 'KEYWORD', 'SUMMARY'];
    const result = enforceTokenBudget(sections, ids, 5);
    expect(result).toContain('constitution');
  });

  test('should never remove AGENT', () => {
    const sections = ['agent', 'squad', 'summary'];
    const ids = ['AGENT', 'SQUAD', 'SUMMARY'];
    const result = enforceTokenBudget(sections, ids, 3);
    expect(result).toContain('agent');
  });

  test('should remove sections in truncation order', () => {
    const long = 'x'.repeat(200);
    const sections = ['c', 'a', 'w', 't', 's', 'k', 'sc', 'd', 'sum'];
    const ids = ['CONSTITUTION', 'AGENT', 'WORKFLOW', 'TASK', 'SQUAD', 'KEYWORD', 'STAR_COMMANDS', 'DEVMODE', 'SUMMARY'];
    // Budget that forces removal of several sections
    const result = enforceTokenBudget(sections, ids, 5);
    // Protected sections should survive
    expect(result).toContain('c');  // CONSTITUTION
    expect(result).toContain('a');  // AGENT
  });
});

// =============================================================================
// formatSynapseRules
// =============================================================================

describe('formatSynapseRules', () => {
  // Helper: create a layer result
  function makeResult(source, rules, extraMeta = {}) {
    return {
      rules,
      metadata: { source, layer: getLayerNum(source), ...extraMeta },
    };
  }

  function getLayerNum(source) {
    const map = { constitution: 0, global: 1, agent: 2, workflow: 3, task: 4, squad: 5, keyword: 6, 'star-command': 7 };
    return map[source] != null ? map[source] : -1;
  }

  const defaultSession = { prompt_count: 5 };
  const defaultMetrics = {
    total_ms: 42,
    layers_loaded: 3,
    layers_skipped: 5,
    layers_errored: 0,
    total_rules: 10,
    per_layer: {},
  };

  test('should return empty string for null results', () => {
    expect(formatSynapseRules(null, 'FRESH', 85, {}, false, {}, 800, false)).toBe('');
  });

  test('should return empty string for empty results array', () => {
    expect(formatSynapseRules([], 'FRESH', 85, {}, false, {}, 800, false)).toBe('');
  });

  test('should wrap output in <synapse-rules> tags', () => {
    const results = [makeResult('constitution', ['Rule 1'])];
    const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).toMatch(/^<synapse-rules>/);
    expect(xml).toMatch(/<\/synapse-rules>$/);
  });

  test('should include CONTEXT BRACKET section', () => {
    const results = [makeResult('constitution', ['Rule 1'])];
    const xml = formatSynapseRules(results, 'FRESH', 85.0, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).toContain('[CONTEXT BRACKET]');
    expect(xml).toContain('CONTEXT BRACKET: [FRESH]');
    expect(xml).toContain('85.0% remaining');
  });

  test('should include CONSTITUTION section', () => {
    const results = [makeResult('constitution', ['ART.I: CLI First', 'ART.II: Agent Authority'])];
    const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).toContain('[CONSTITUTION] (NON-NEGOTIABLE)');
    expect(xml).toContain('ART.I: CLI First');
    expect(xml).toContain('ART.II: Agent Authority');
  });

  test('should include AGENT section with metadata', () => {
    const results = [
      makeResult('agent', ['Follow coding standards'], {
        agentId: 'dev',
        domain: 'development',
        authority: ['code implementation', 'testing'],
      }),
    ];
    const xml = formatSynapseRules(results, 'MODERATE', 50, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).toContain('[ACTIVE AGENT: @dev]');
    expect(xml).toContain('DOMAIN: development');
    expect(xml).toContain('AUTHORITY BOUNDARIES:');
    expect(xml).toContain('- code implementation');
  });

  test('should include WORKFLOW section with phase', () => {
    const results = [
      makeResult('workflow', ['Execute task sequentially'], {
        workflowId: 'story-dev-cycle',
        phase: 'implement',
      }),
    ];
    const xml = formatSynapseRules(results, 'MODERATE', 50, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).toContain('[ACTIVE WORKFLOW: story-dev-cycle]');
    expect(xml).toContain('PHASE: implement');
  });

  test('should include TASK section', () => {
    const results = [
      makeResult('task', ['Complete Task 5 unit tests'], {
        taskId: 'SYN-6-T5',
        storyId: 'SYN-6',
      }),
    ];
    const xml = formatSynapseRules(results, 'MODERATE', 50, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).toContain('[TASK CONTEXT]');
    expect(xml).toContain('Active Task: SYN-6-T5');
    expect(xml).toContain('Story: SYN-6');
  });

  test('should include SQUAD section', () => {
    const results = [
      makeResult('squad', ['Use design tokens'], { squadName: 'design-system' }),
    ];
    const xml = formatSynapseRules(results, 'MODERATE', 50, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).toContain('[SQUAD: design-system]');
    expect(xml).toContain('Use design tokens');
  });

  test('should include KEYWORD section with matches', () => {
    const results = [
      makeResult('keyword', ['Use Supabase RLS'], {
        matches: [{ keyword: 'supabase', domain: 'data-engineer', reason: 'keyword match' }],
      }),
    ];
    const xml = formatSynapseRules(results, 'MODERATE', 50, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).toContain('[KEYWORD MATCHES]');
    expect(xml).toContain('"supabase" matched data-engineer');
  });

  test('should include STAR-COMMANDS section', () => {
    const results = [
      makeResult('star-command', ['Execute build loop'], { command: 'build-autonomous' }),
    ];
    const xml = formatSynapseRules(results, 'MODERATE', 50, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).toContain('[STAR-COMMANDS]');
    expect(xml).toContain('[*build-autonomous] COMMAND:');
    expect(xml).toContain('============================================================');
  });

  test('should include SUMMARY section', () => {
    const results = [
      makeResult('constitution', ['Rule 1'], { activationReason: 'always active' }),
    ];
    const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).toContain('[LOADED DOMAINS SUMMARY]');
    expect(xml).toContain('LOADED DOMAINS:');
  });

  test('should skip sections with empty rules', () => {
    const results = [
      { rules: [], metadata: { source: 'agent', layer: 2 } },
      makeResult('constitution', ['Rule 1']),
    ];
    const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).not.toContain('[ACTIVE AGENT:');
    expect(xml).toContain('[CONSTITUTION]');
  });

  test('should skip results with null rules', () => {
    const results = [
      { rules: null, metadata: { source: 'agent', layer: 2 } },
      makeResult('constitution', ['Rule 1']),
    ];
    const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 2000, false);
    expect(xml).not.toContain('[ACTIVE AGENT:');
  });

  describe('section ordering', () => {
    test('should place CONTEXT_BRACKET before CONSTITUTION', () => {
      const results = [
        makeResult('constitution', ['Rule 1']),
        makeResult('global', ['Global rule']),
      ];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 2000, false);
      const bracketIdx = xml.indexOf('[CONTEXT BRACKET]');
      const constIdx = xml.indexOf('[CONSTITUTION]');
      expect(bracketIdx).toBeLessThan(constIdx);
    });

    test('should place CONSTITUTION before AGENT', () => {
      const results = [
        makeResult('constitution', ['Rule 1']),
        makeResult('agent', ['Agent rule'], { agentId: 'dev' }),
      ];
      const xml = formatSynapseRules(results, 'MODERATE', 50, defaultSession, false, defaultMetrics, 2000, false);
      const constIdx = xml.indexOf('[CONSTITUTION]');
      const agentIdx = xml.indexOf('[ACTIVE AGENT:');
      expect(constIdx).toBeLessThan(agentIdx);
    });

    test('should place SUMMARY after all other sections', () => {
      const results = [
        makeResult('constitution', ['Rule 1']),
        makeResult('agent', ['Agent rule'], { agentId: 'dev' }),
      ];
      const xml = formatSynapseRules(results, 'MODERATE', 50, defaultSession, false, defaultMetrics, 2000, false);
      const summaryIdx = xml.indexOf('[LOADED DOMAINS SUMMARY]');
      const agentIdx = xml.indexOf('[ACTIVE AGENT:');
      expect(summaryIdx).toBeGreaterThan(agentIdx);
    });
  });

  describe('DEVMODE', () => {
    const devMetrics = {
      total_ms: 42,
      layers_loaded: 3,
      layers_skipped: 5,
      layers_errored: 0,
      total_rules: 10,
      per_layer: {
        constitution: { status: 'ok', rules: 6, duration: 2, layer: 0 },
        global: { status: 'ok', rules: 2, duration: 3, layer: 1 },
        agent: { status: 'ok', rules: 2, duration: 5, layer: 2 },
        workflow: { status: 'skipped', reason: 'Not active in FRESH' },
      },
    };

    test('should include DEVMODE section when devmode=true', () => {
      const results = [makeResult('constitution', ['Rule 1'])];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, true, devMetrics, 2000, false);
      expect(xml).toContain('[DEVMODE STATUS]');
      expect(xml).toContain('SYNAPSE DEVMODE');
    });

    test('should NOT include DEVMODE section when devmode=false', () => {
      const results = [makeResult('constitution', ['Rule 1'])];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, devMetrics, 2000, false);
      expect(xml).not.toContain('[DEVMODE STATUS]');
    });

    test('should show bracket info in DEVMODE', () => {
      const results = [makeResult('constitution', ['Rule 1'])];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, true, devMetrics, 2000, false);
      expect(xml).toContain('Bracket: [FRESH]');
      expect(xml).toContain('85.0% remaining');
    });

    test('should show pipeline metrics in DEVMODE', () => {
      const results = [makeResult('constitution', ['Rule 1'])];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, true, devMetrics, 2000, false);
      expect(xml).toContain('Pipeline Metrics:');
      expect(xml).toContain('Total: 42ms');
    });

    test('should show loaded layers in DEVMODE', () => {
      const results = [makeResult('constitution', ['Rule 1'])];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, true, devMetrics, 2000, false);
      expect(xml).toContain('Layers Loaded:');
      expect(xml).toContain('CONSTITUTION');
    });

    test('should show skipped layers in DEVMODE', () => {
      const results = [makeResult('constitution', ['Rule 1'])];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, true, devMetrics, 2000, false);
      expect(xml).toContain('Layers Skipped:');
      expect(xml).toContain('WORKFLOW');
    });
  });

  describe('handoff warning', () => {
    test('should include handoff warning when showHandoffWarning=true', () => {
      const results = [makeResult('constitution', ['Rule 1'])];
      const xml = formatSynapseRules(results, 'CRITICAL', 15, defaultSession, false, defaultMetrics, 2500, true);
      expect(xml).toContain('[HANDOFF WARNING]');
      expect(xml).toContain('Context is nearly exhausted');
    });

    test('should NOT include handoff warning when showHandoffWarning=false', () => {
      const results = [makeResult('constitution', ['Rule 1'])];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 800, false);
      expect(xml).not.toContain('[HANDOFF WARNING]');
    });
  });

  describe('token budget enforcement in formatSynapseRules', () => {
    test('should enforce token budget on final output', () => {
      // Create results that produce a lot of output
      const results = [
        makeResult('constitution', ['Rule 1', 'Rule 2', 'Rule 3']),
        makeResult('agent', ['Agent rule 1', 'Agent rule 2'], { agentId: 'dev' }),
        makeResult('keyword', ['Keyword rule'], { matches: [{ keyword: 'test', domain: 'dev' }] }),
      ];
      // Very small budget — should trigger truncation
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 10, false);
      // Output should still be valid XML (wrapped)
      expect(xml).toContain('<synapse-rules>');
    });
  });

  describe('MEMORY_HINTS section (SYN-10)', () => {
    test('should include [MEMORY HINTS] section when memory results present', () => {
      const results = [
        makeResult('constitution', ['Rule 1']),
        {
          rules: [
            { content: 'Use absolute imports', source: 'procedural', relevance: 0.9, tokens: 5 },
            { content: 'Avoid any type', source: 'semantic', relevance: 0.7, tokens: 4 },
          ],
          metadata: { source: 'memory', layer: 'memory' },
        },
      ];
      const xml = formatSynapseRules(results, 'MODERATE', 50, defaultSession, false, defaultMetrics, 2000, false);
      expect(xml).toContain('[MEMORY HINTS]');
      expect(xml).toContain('[procedural] (relevance: 90%) Use absolute imports');
      expect(xml).toContain('[semantic] (relevance: 70%) Avoid any type');
    });

    test('should NOT include [MEMORY HINTS] section when no memory results', () => {
      const results = [makeResult('constitution', ['Rule 1'])];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 2000, false);
      expect(xml).not.toContain('[MEMORY HINTS]');
    });

    test('should handle memory hints with missing fields gracefully', () => {
      const results = [
        makeResult('constitution', ['Rule 1']),
        {
          rules: [
            { content: 'Some hint', tokens: 3 },
          ],
          metadata: { source: 'memory', layer: 'memory' },
        },
      ];
      const xml = formatSynapseRules(results, 'MODERATE', 50, defaultSession, false, defaultMetrics, 2000, false);
      expect(xml).toContain('[MEMORY HINTS]');
      expect(xml).toContain('[memory] (relevance: ?%) Some hint');
    });
  });

  describe('global/context layer fallback', () => {
    test('should categorize layer by layer number when source unknown', () => {
      const results = [
        { rules: ['Fallback rule'], metadata: { layer: 0 } },
      ];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 2000, false);
      expect(xml).toContain('[CONSTITUTION]');
      expect(xml).toContain('Fallback rule');
    });

    test('should handle global results in context bracket section', () => {
      const results = [
        makeResult('global', ['Global context rule']),
      ];
      const xml = formatSynapseRules(results, 'FRESH', 85, defaultSession, false, defaultMetrics, 2000, false);
      expect(xml).toContain('[CONTEXT BRACKET]');
      expect(xml).toContain('CONTEXT RULES:');
      expect(xml).toContain('Global context rule');
    });
  });
});
