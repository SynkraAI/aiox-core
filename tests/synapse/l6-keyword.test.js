/**
 * L6 Keyword Processor Tests
 *
 * Tests for keyword matching, exclusion, deduplication against
 * previous layers, no-match handling, and metadata correctness.
 *
 * @story SYN-5 - Layer Processors L4-L7
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LayerProcessor = require('../../.aiox-core/core/synapse/layers/layer-processor');
const L6KeywordProcessor = require('../../.aiox-core/core/synapse/layers/l6-keyword');

jest.setTimeout(30000);

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-l6-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('L6KeywordProcessor', () => {
  let tempDir;
  let processor;

  beforeEach(() => {
    tempDir = createTempDir();
    processor = new L6KeywordProcessor();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to keyword', () => {
      expect(processor.name).toBe('keyword');
    });

    test('should set layer to 6', () => {
      expect(processor.layer).toBe(6);
    });

    test('should set timeout to 15ms', () => {
      expect(processor.timeout).toBe(15);
    });
  });

  describe('process()', () => {
    test('should match keyword and load domain rules', () => {
      fs.writeFileSync(path.join(tempDir, 'security'), [
        'SEC_RULE_1=Validate all user inputs',
        'SEC_RULE_2=Use parameterized queries',
      ].join('\n'));

      const context = {
        prompt: 'check the security of this code',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              SECURITY: {
                file: 'security',
                recall: ['security', 'vulnerability'],
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toContain('Validate all user inputs');
      expect(result.metadata.layer).toBe(6);
      expect(result.metadata.matchedDomains).toContain('SECURITY');
      expect(result.metadata.skippedDuplicates).toHaveLength(0);
    });

    test('should match multiple domains with different keywords', () => {
      fs.writeFileSync(path.join(tempDir, 'testing'), 'TEST_RULE_1=Write tests first\n');
      fs.writeFileSync(path.join(tempDir, 'performance'), 'PERF_RULE_1=Optimize hot paths\n');

      const context = {
        prompt: 'I need to write tests and check performance',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              TESTING: { file: 'testing', recall: ['test', 'testing'] },
              PERFORMANCE: { file: 'performance', recall: ['performance', 'optimize'] },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(2);
      expect(result.metadata.matchedDomains).toEqual(
        expect.arrayContaining(['TESTING', 'PERFORMANCE']),
      );
    });

    test('should return null when no keywords match', () => {
      const context = {
        prompt: 'just a random prompt',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              SECURITY: { file: 'security', recall: ['security'] },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when prompt is empty', () => {
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

    test('should return null when no domains have recall keywords', () => {
      const context = {
        prompt: 'some prompt',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              AGENT_DEV: { file: 'agent-dev', agentTrigger: 'dev' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should respect global exclusion', () => {
      fs.writeFileSync(path.join(tempDir, 'security'), 'SEC_RULE_1=Rule\n');

      const context = {
        prompt: 'security skip-rules please',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: ['skip-rules'],
            domains: {
              SECURITY: { file: 'security', recall: ['security'] },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should respect domain-level exclusion', () => {
      fs.writeFileSync(path.join(tempDir, 'security'), 'SEC_RULE_1=Rule\n');

      const context = {
        prompt: 'security but no-inject please',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              SECURITY: {
                file: 'security',
                recall: ['security'],
                exclude: ['no-inject'],
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should deduplicate domains already loaded by previous layers', () => {
      fs.writeFileSync(path.join(tempDir, 'agent-dev'), 'DEV_RULE_1=Dev rule\n');

      const context = {
        prompt: 'dev agent help',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              AGENT_DEV: {
                file: 'agent-dev',
                recall: ['dev'],
              },
            },
          },
        },
        previousLayers: [
          {
            name: 'agent',
            metadata: { layer: 2, source: 'agent-dev', agentId: 'dev' },
          },
        ],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should track skipped duplicates in metadata', () => {
      fs.writeFileSync(path.join(tempDir, 'agent-dev'), 'DEV_RULE_1=Dev rule\n');
      fs.writeFileSync(path.join(tempDir, 'testing'), 'TEST_RULE_1=Test rule\n');

      const context = {
        prompt: 'dev testing help',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              AGENT_DEV: { file: 'agent-dev', recall: ['dev'] },
              TESTING: { file: 'testing', recall: ['testing'] },
            },
          },
        },
        previousLayers: [
          {
            name: 'agent',
            metadata: { layer: 2, source: 'agent-dev', agentId: 'dev' },
          },
        ],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.metadata.matchedDomains).toContain('TESTING');
      expect(result.metadata.skippedDuplicates).toContain('AGENT_DEV');
    });

    test('should handle domain file missing gracefully', () => {
      // Domain matches keyword but file doesn't exist
      const context = {
        prompt: 'security check',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              SECURITY: { file: 'nonexistent-file', recall: ['security'] },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should track domainsLoaded from squad layer in previousLayers', () => {
      fs.writeFileSync(path.join(tempDir, 'testing'), 'TEST_RULE_1=Test rule\n');

      const context = {
        prompt: 'testing help',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              TESTING: { file: 'testing', recall: ['testing'] },
              SQUAD_ALPHA_TESTING: { file: 'testing', recall: ['testing'] },
            },
          },
        },
        previousLayers: [
          {
            name: 'squad',
            metadata: {
              layer: 5,
              squadsFound: 1,
              domainsLoaded: ['SQUAD_ALPHA_TESTING'],
            },
          },
        ],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.metadata.matchedDomains).toContain('TESTING');
      expect(result.metadata.skippedDuplicates).toContain('SQUAD_ALPHA_TESTING');
    });

    test('should handle empty recall array', () => {
      const context = {
        prompt: 'test something',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              TESTING: { file: 'testing', recall: [] },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });
  });
});
