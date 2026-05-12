/**
 * L0 Constitution Processor Tests
 *
 * Tests for constitution rule loading, nonNegotiable validation,
 * graceful degradation on missing files, and ALWAYS_ON behavior.
 *
 * @story SYN-4 - Layer Processors L0-L3
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LayerProcessor = require('../../.aiox-core/core/synapse/layers/layer-processor');
const L0ConstitutionProcessor = require('../../.aiox-core/core/synapse/layers/l0-constitution');

jest.setTimeout(30000);

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-l0-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('L0ConstitutionProcessor', () => {
  let tempDir;
  let processor;

  beforeEach(() => {
    tempDir = createTempDir();
    processor = new L0ConstitutionProcessor();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to constitution', () => {
      expect(processor.name).toBe('constitution');
    });

    test('should set layer to 0', () => {
      expect(processor.layer).toBe(0);
    });

    test('should set timeout to 5ms', () => {
      expect(processor.timeout).toBe(5);
    });
  });

  describe('process()', () => {
    test('should load constitution rules from domain file', () => {
      // Given: constitution domain file with rules
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, [
        'CONSTITUTION_RULE_ART1_0=CLI First (NON-NEGOTIABLE)',
        'CONSTITUTION_RULE_ART2_0=Agent Authority (NON-NEGOTIABLE)',
        'CONSTITUTION_RULE_ART3_0=Story-Driven (MUST)',
      ].join('\n'));

      const context = {
        prompt: 'test prompt',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: {
                state: 'active',
                alwaysOn: true,
                nonNegotiable: true,
                file: 'constitution',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(3);
      expect(result.rules[0]).toContain('CLI First');
      expect(result.metadata.layer).toBe(0);
      expect(result.metadata.source).toBe('constitution');
      expect(result.metadata.nonNegotiable).toBe(true);
    });

    test('should validate nonNegotiable flag from manifest', () => {
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, 'RULE_1=Test rule\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: {
                state: 'active',
                nonNegotiable: true,
                file: 'constitution',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result.metadata.nonNegotiable).toBe(true);
    });

    test('should set nonNegotiable false when not in manifest', () => {
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, 'RULE_1=Test rule\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: {
                state: 'active',
                file: 'constitution',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result.metadata.nonNegotiable).toBe(false);
    });

    test('should return null when domain file is missing', () => {
      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: {
                state: 'active',
                file: 'nonexistent-file',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when domain file is empty', () => {
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, '');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: {
                state: 'active',
                file: 'constitution',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should use default path when domain has no file property', () => {
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, 'RULE_1=Default path rule\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: { state: 'active', nonNegotiable: true },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).not.toBeNull();
      expect(result.rules[0]).toContain('Default path rule');
    });

    test('should process regardless of session state (ALWAYS_ON)', () => {
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, 'RULE=Always on rule\n');

      // Session with no agent, no workflow
      const context = {
        prompt: '',
        session: { active_agent: { id: null }, active_workflow: null },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: { state: 'active', file: 'constitution', nonNegotiable: true },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(1);
    });

    test('should handle manifest with no domains', () => {
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, 'RULE=Fallback\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      // Should use default path since no domain key matches
      const result = processor.process(context);
      expect(result).not.toBeNull();
    });
  });

  describe('_safeProcess()', () => {
    test('should return result via safe wrapper', () => {
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, 'RULE=Safe test\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: { state: 'active', file: 'constitution', nonNegotiable: true },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor._safeProcess(context);
      expect(result).not.toBeNull();
      expect(result.rules[0]).toContain('Safe test');
    });
  });
});
