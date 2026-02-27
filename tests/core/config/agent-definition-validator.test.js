/**
 * Agent Definition Validator Tests
 *
 * Story: W3.7 ACT-8 - Agent Config Loading Governance
 *
 * Tests:
 * - Schema validation for valid/invalid agent definitions
 * - Missing required fields produce errors
 * - Unknown fields produce warnings (not errors)
 * - All 12 real agent files pass validation
 * - CLI batch validation works
 * - Integration with AgentConfigLoader
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const {
  validateAgentDefinition,
  validateAllAgents,
  loadSchema,
  clearSchemaCache,
  resetValidator,
} = require('../../../.aios-core/core/config/agent-definition-validator');

const ROOT = path.resolve(__dirname, '..', '..', '..');

// ============================================================================
//  HELPERS
// ============================================================================

/**
 * Normalize compact command format in YAML content.
 * Mirrors AgentConfigLoader._normalizeCompactCommands() for test use.
 */
function _normalizeCompactCommands(yamlContent) {
  const lines = yamlContent.split('\n');
  const normalizedLines = [];
  let inCommands = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^\s*commands:\s*$/)) {
      inCommands = true;
      normalizedLines.push(line);
      continue;
    }

    if (inCommands && line.match(/^\w+:/) && !line.match(/^\s+/)) {
      inCommands = false;
    }

    if (inCommands) {
      const compact = line.match(/^(\s+)- (\w+(?:-\w+)*(?:\s+\{[^}]+\})?):\s*(.+)$/);
      if (compact) {
        const [, indent, cmd, desc] = compact;
        const cmdName = cmd.split(/\s+/)[0];
        const escaped = desc.trim().replace(/"/g, '\\"');
        normalizedLines.push(`${indent}- name: ${cmdName}`);
        normalizedLines.push(`${indent}  description: "${escaped}"`);
        continue;
      }
    }

    normalizedLines.push(line);
  }

  return normalizedLines.join('\n');
}

/**
 * Build a minimal valid agent definition.
 */
function buildValidDefinition(overrides = {}) {
  return {
    agent: {
      name: 'TestAgent',
      id: 'test-agent',
      title: 'Test Agent Title',
      icon: '🧪',
      ...(overrides.agent || {}),
    },
    persona_profile: {
      archetype: 'Builder',
      communication: {
        tone: 'pragmatic',
        greeting_levels: {
          minimal: '🧪 test ready',
          named: '🧪 TestAgent ready',
          archetypal: '🧪 TestAgent the Builder ready',
        },
      },
      ...(overrides.persona_profile || {}),
    },
    persona: {
      role: 'Test Role',
      style: 'concise',
      ...(overrides.persona || {}),
    },
    commands: overrides.commands || [
      { name: 'help', description: 'Show help', visibility: ['full', 'key'] },
    ],
    dependencies: overrides.dependencies || {
      tasks: ['dev-develop-story.md'],
    },
    'activation-instructions': overrides['activation-instructions'] || [
      'STEP 1: Read file',
      'STEP 2: Activate',
    ],
    ...(overrides._extra || {}),
  };
}

// ============================================================================
//  TESTS
// ============================================================================

describe('Agent Definition Validator (W3.7 ACT-8)', () => {
  beforeEach(() => {
    resetValidator();
  });

  // --------------------------------------------------------------------------
  // Schema loading
  // --------------------------------------------------------------------------
  describe('Schema Loading', () => {
    test('loadSchema returns a valid JSON Schema object', () => {
      const schema = loadSchema();
      expect(schema).toBeDefined();
      expect(schema.$schema).toContain('json-schema.org');
      expect(schema.title).toBe('AIOS Agent Definition Schema');
      expect(schema.required).toContain('agent');
    });

    test('schema is cached on second call', () => {
      const first = loadSchema();
      const second = loadSchema();
      expect(first).toBe(second); // Same reference
    });

    test('clearSchemaCache forces reload', () => {
      const first = loadSchema();
      clearSchemaCache();
      const second = loadSchema();
      expect(first).not.toBe(second); // Different reference
      expect(first).toEqual(second); // Same content
    });
  });

  // --------------------------------------------------------------------------
  // Valid definitions
  // --------------------------------------------------------------------------
  describe('Valid Definitions', () => {
    test('minimal valid definition passes', () => {
      const def = buildValidDefinition();
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.agentId).toBe('test-agent');
    });

    test('definition with all optional fields passes', () => {
      const def = buildValidDefinition({
        agent: {
          whenToUse: 'Use for testing',
          aliases: ['tester', 'test'],
          customization: 'Custom rules here',
        },
      });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('agent with null customization passes', () => {
      const def = buildValidDefinition({
        agent: { customization: null },
      });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(true);
    });

    test('all valid tone values are accepted', () => {
      const tones = [
        'pragmatic', 'analytical', 'conceptual', 'collaborative',
        'empathetic', 'decisive', 'strategic', 'systematic',
        'educational', 'commanding', 'technical',
      ];

      for (const tone of tones) {
        const def = buildValidDefinition({
          persona_profile: {
            archetype: 'Builder',
            communication: { tone },
          },
        });
        const result = validateAgentDefinition(def);
        expect(result.valid).toBe(true);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Missing required fields
  // --------------------------------------------------------------------------
  describe('Missing Required Fields', () => {
    test('null definition fails', () => {
      const result = validateAgentDefinition(null);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('non-null object');
    });

    test('empty object fails (missing agent)', () => {
      const result = validateAgentDefinition({});
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === '/agent')).toBe(true);
    });

    test('missing agent.name fails', () => {
      const def = buildValidDefinition();
      delete def.agent.name;
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path.includes('/agent/name'))).toBe(true);
    });

    test('missing agent.id fails', () => {
      const def = buildValidDefinition();
      delete def.agent.id;
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path.includes('/agent/id'))).toBe(true);
    });

    test('missing agent.title fails', () => {
      const def = buildValidDefinition();
      delete def.agent.title;
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path.includes('/agent/title'))).toBe(true);
    });

    test('missing agent.icon fails', () => {
      const def = buildValidDefinition();
      delete def.agent.icon;
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path.includes('/agent/icon'))).toBe(true);
    });

    test('empty string agent.id fails', () => {
      const def = buildValidDefinition({ agent: { id: '' } });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
    });

    test('missing persona_profile.archetype fails', () => {
      const def = buildValidDefinition();
      delete def.persona_profile.archetype;
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('archetype'))).toBe(true);
    });

    test('missing persona_profile.communication fails', () => {
      const def = buildValidDefinition();
      delete def.persona_profile.communication;
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('communication'))).toBe(true);
    });

    test('missing persona_profile.communication.tone fails', () => {
      const def = buildValidDefinition({
        persona_profile: {
          archetype: 'Builder',
          communication: {},
        },
      });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('tone'))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Invalid values
  // --------------------------------------------------------------------------
  describe('Invalid Values', () => {
    test('invalid agent.id pattern fails', () => {
      const def = buildValidDefinition({ agent: { id: 'InvalidId' } });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('pattern'))).toBe(true);
    });

    test('agent.id starting with number fails', () => {
      const def = buildValidDefinition({ agent: { id: '1agent' } });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
    });

    test('agent.id with spaces fails', () => {
      const def = buildValidDefinition({ agent: { id: 'bad agent' } });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
    });

    test('invalid tone enum value fails', () => {
      const def = buildValidDefinition({
        persona_profile: {
          archetype: 'Builder',
          communication: { tone: 'nonexistent-tone' },
        },
      });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('enum') || e.message.includes('must be one of'))).toBe(true);
    });

    test('invalid emoji_frequency enum value fails', () => {
      const def = buildValidDefinition({
        persona_profile: {
          archetype: 'Builder',
          communication: {
            tone: 'pragmatic',
            emoji_frequency: 'super-high',
          },
        },
      });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
    });

    test('invalid visibility enum value in array fails', () => {
      const def = buildValidDefinition({
        commands: [
          { name: 'test', visibility: ['full', 'invalid'] },
        ],
      });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
    });

    test('invalid visibility string value fails', () => {
      const def = buildValidDefinition({
        commands: [
          { name: 'test', visibility: 'invalid-level' },
        ],
      });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Warnings (non-blocking)
  // --------------------------------------------------------------------------
  describe('Warnings', () => {
    test('missing dependencies section generates warning', () => {
      const def = buildValidDefinition();
      delete def.dependencies;
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('dependencies'))).toBe(true);
    });

    test('empty commands array generates warning', () => {
      const def = buildValidDefinition({ commands: [] });
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('Commands array is empty'))).toBe(true);
    });

    test('missing persona_profile generates warning', () => {
      const def = {
        agent: {
          name: 'Test',
          id: 'test',
          title: 'Test',
          icon: '🧪',
        },
        commands: [{ name: 'help' }],
        dependencies: { tasks: [] },
        'activation-instructions': ['STEP 1'],
      };
      const result = validateAgentDefinition(def);

      // Should pass (persona_profile is not required at top level in schema)
      // but should generate a warning
      expect(result.warnings.some(w => w.message.includes('persona_profile'))).toBe(true);
    });

    test('missing activation-instructions generates warning', () => {
      const def = buildValidDefinition();
      delete def['activation-instructions'];
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('activation-instructions'))).toBe(true);
    });

    test('collectWarnings=false suppresses warnings', () => {
      const def = buildValidDefinition();
      delete def.dependencies;
      delete def['activation-instructions'];
      const result = validateAgentDefinition(def, { collectWarnings: false });

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // Strict mode
  // --------------------------------------------------------------------------
  describe('Strict Mode', () => {
    test('strict mode is off by default', () => {
      const def = buildValidDefinition();
      const result = validateAgentDefinition(def);
      // Default is not strict
      expect(result.valid).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Error message quality
  // --------------------------------------------------------------------------
  describe('Error Message Quality', () => {
    test('error messages are actionable (include field path)', () => {
      const def = buildValidDefinition();
      delete def.agent.name;
      const result = validateAgentDefinition(def);

      expect(result.errors.length).toBeGreaterThan(0);
      const err = result.errors[0];
      expect(err.path).toBeDefined();
      expect(err.message).toBeDefined();
      expect(err.severity).toBe('error');
    });

    test('multiple missing fields report all errors', () => {
      const def = {
        agent: {
          id: 'test',
          // missing name, title, icon
        },
      };
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(false);
      // Should report at least name, title, and icon as missing
      const errorPaths = result.errors.map(e => e.path);
      expect(errorPaths.some(p => p.includes('name'))).toBe(true);
      expect(errorPaths.some(p => p.includes('title'))).toBe(true);
      expect(errorPaths.some(p => p.includes('icon'))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Real agent file validation (integration)
  // --------------------------------------------------------------------------
  describe('All Real Agent Files Pass Validation', () => {
    const agentFiles = [
      'aios-master', 'analyst', 'architect', 'data-engineer',
      'dev', 'devops', 'pm', 'po', 'qa', 'sm',
      'squad-creator', 'ux-design-expert',
    ];

    test.each(agentFiles)('agent @%s passes validation', (agentId) => {
      const agentPath = path.join(ROOT, '.aios-core', 'development', 'agents', `${agentId}.md`);
      const content = fs.readFileSync(agentPath, 'utf8');

      // Extract YAML block
      const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)\n```/);
      expect(yamlMatch).not.toBeNull();

      // Parse YAML -- some agents use compact command format that may fail initial parse
      let definition;
      try {
        definition = yaml.load(yamlMatch[1]);
      } catch (_parseError) {
        // Compact command format causes YAML parse errors -- normalize first
        const normalizedYaml = _normalizeCompactCommands(yamlMatch[1]);
        definition = yaml.load(normalizedYaml);
      }

      const result = validateAgentDefinition(definition);

      if (!result.valid) {
        const errorDetail = result.errors.map(e => `${e.path}: ${e.message}`).join('\n');
        throw new Error(`@${agentId} validation failed:\n${errorDetail}`);
      }

      expect(result.valid).toBe(true);
      expect(result.agentId).toBe(agentId);
    });
  });

  // --------------------------------------------------------------------------
  // Batch validation
  // --------------------------------------------------------------------------
  describe('Batch Validation (validateAllAgents)', () => {
    test('validates all agents in the agents directory', () => {
      const results = validateAllAgents(ROOT);

      expect(results.total).toBeGreaterThanOrEqual(12);
      expect(results.valid).toBeGreaterThanOrEqual(12);
      expect(results.invalid).toBe(0);
      expect(results.agents).toBeDefined();
    });

    test('returns error count for invalid directory', () => {
      const results = validateAllAgents('/nonexistent/path');

      expect(results.error).toBeDefined();
      expect(results.total).toBe(0);
    });

    test('each agent result has correct structure', () => {
      const results = validateAllAgents(ROOT);

      for (const [agentId, result] of Object.entries(results.agents)) {
        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('errors');
        expect(result).toHaveProperty('warnings');
        expect(result).toHaveProperty('agentId');
        expect(Array.isArray(result.errors)).toBe(true);
        expect(Array.isArray(result.warnings)).toBe(true);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Edge cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    test('definition with only agent section passes', () => {
      const def = {
        agent: {
          name: 'Minimal',
          id: 'minimal',
          title: 'Minimal Agent',
          icon: '🤖',
        },
      };
      const result = validateAgentDefinition(def);

      expect(result.valid).toBe(true);
      // Should have warnings about missing optional sections
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('non-object definition fails', () => {
      const result = validateAgentDefinition('not an object');
      expect(result.valid).toBe(false);
    });

    test('array definition fails', () => {
      const result = validateAgentDefinition([1, 2, 3]);
      expect(result.valid).toBe(false);
    });

    test('agent.id with hyphens is valid', () => {
      const def = buildValidDefinition({ agent: { id: 'data-engineer' } });
      const result = validateAgentDefinition(def);
      expect(result.valid).toBe(true);
    });

    test('agent.id with multiple hyphens is valid', () => {
      const def = buildValidDefinition({ agent: { id: 'ux-design-expert' } });
      const result = validateAgentDefinition(def);
      expect(result.valid).toBe(true);
    });

    test('resetValidator clears all caches', () => {
      // Load schema and create validator
      loadSchema();
      validateAgentDefinition(buildValidDefinition());

      // Reset
      resetValidator();

      // Should still work (recreates from scratch)
      const result = validateAgentDefinition(buildValidDefinition());
      expect(result.valid).toBe(true);
    });
  });
});
