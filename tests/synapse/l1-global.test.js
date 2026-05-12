/**
 * L1 Global Processor Tests
 *
 * Tests for dual domain file loading, rule combining,
 * partial missing files, and ALWAYS_ON behavior.
 *
 * @story SYN-4 - Layer Processors L0-L3
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LayerProcessor = require('../../.aiox-core/core/synapse/layers/layer-processor');
const L1GlobalProcessor = require('../../.aiox-core/core/synapse/layers/l1-global');

jest.setTimeout(30000);

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-l1-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('L1GlobalProcessor', () => {
  let tempDir;
  let processor;

  beforeEach(() => {
    tempDir = createTempDir();
    processor = new L1GlobalProcessor();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to global', () => {
      expect(processor.name).toBe('global');
    });

    test('should set layer to 1', () => {
      expect(processor.layer).toBe(1);
    });

    test('should set timeout to 10ms', () => {
      expect(processor.timeout).toBe(10);
    });
  });

  describe('process()', () => {
    test('should load and combine both global and context rules', () => {
      fs.writeFileSync(path.join(tempDir, 'global'), 'GLOBAL_RULE_1=Use TypeScript\nGLOBAL_RULE_2=Use ESLint\n');
      fs.writeFileSync(path.join(tempDir, 'context'), 'CONTEXT_RULE_1=FRESH bracket: lean injection\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              GLOBAL: { state: 'active', alwaysOn: true, file: 'global' },
              CONTEXT: { state: 'active', alwaysOn: true, file: 'context' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(3);
      expect(result.rules[0]).toContain('Use TypeScript');
      expect(result.rules[1]).toContain('Use ESLint');
      expect(result.rules[2]).toContain('FRESH bracket');
      expect(result.metadata.layer).toBe(1);
      expect(result.metadata.sources).toEqual(['global', 'context']);
    });

    test('should return rules from global only when context file is missing', () => {
      fs.writeFileSync(path.join(tempDir, 'global'), 'RULE_1=Global only rule\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              GLOBAL: { state: 'active', file: 'global' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(1);
      expect(result.rules[0]).toContain('Global only rule');
      expect(result.metadata.sources).toEqual(['global']);
    });

    test('should return rules from context only when global file is missing', () => {
      fs.writeFileSync(path.join(tempDir, 'context'), 'RULE_1=Context only rule\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONTEXT: { state: 'active', file: 'context' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(1);
      expect(result.rules[0]).toContain('Context only rule');
      expect(result.metadata.sources).toEqual(['context']);
    });

    test('should return null when both files are missing', () => {
      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should order global rules before context rules', () => {
      fs.writeFileSync(path.join(tempDir, 'global'), 'FIRST=Global comes first\n');
      fs.writeFileSync(path.join(tempDir, 'context'), 'SECOND=Context comes second\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              GLOBAL: { state: 'active', file: 'global' },
              CONTEXT: { state: 'active', file: 'context' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result.rules[0]).toContain('Global comes first');
      expect(result.rules[1]).toContain('Context comes second');
    });

    test('should use default file paths when domain has no file property', () => {
      fs.writeFileSync(path.join(tempDir, 'global'), 'RULE=Default global\n');
      fs.writeFileSync(path.join(tempDir, 'context'), 'RULE=Default context\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              GLOBAL: { state: 'active' },
              CONTEXT: { state: 'active' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(2);
    });

    test('should process regardless of session state (ALWAYS_ON)', () => {
      fs.writeFileSync(path.join(tempDir, 'global'), 'RULE=Always active\n');

      const context = {
        prompt: '',
        session: { active_agent: { id: null }, active_workflow: null },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              GLOBAL: { state: 'active', file: 'global' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).not.toBeNull();
    });
  });
});
