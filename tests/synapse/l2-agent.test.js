/**
 * L2 Agent Processor Tests
 *
 * Tests for agent detection, trigger matching, authority boundary
 * filtering, graceful degradation, and session state handling.
 *
 * @story SYN-4 - Layer Processors L0-L3
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LayerProcessor = require('../../.aiox-core/core/synapse/layers/layer-processor');
const L2AgentProcessor = require('../../.aiox-core/core/synapse/layers/l2-agent');

jest.setTimeout(30000);

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-l2-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('L2AgentProcessor', () => {
  let tempDir;
  let processor;

  beforeEach(() => {
    tempDir = createTempDir();
    processor = new L2AgentProcessor();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to agent', () => {
      expect(processor.name).toBe('agent');
    });

    test('should set layer to 2', () => {
      expect(processor.layer).toBe(2);
    });

    test('should set timeout to 15ms', () => {
      expect(processor.timeout).toBe(15);
    });
  });

  describe('process()', () => {
    test('should load agent-specific rules when agent is active', () => {
      fs.writeFileSync(path.join(tempDir, 'agent-dev'), [
        'DEV_RULE_1=Follow coding standards',
        'DEV_RULE_2=Only @devops can push (AUTH boundary)',
        'DEV_RULE_3=Write tests for all features',
      ].join('\n'));

      const context = {
        prompt: '',
        session: {
          active_agent: { id: 'dev', activated_at: '2026-02-11', activation_quality: 'full' },
        },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              DEV_AGENT: {
                state: 'active',
                agentTrigger: 'dev',
                file: 'agent-dev',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(3);
      expect(result.metadata.layer).toBe(2);
      expect(result.metadata.source).toBe('agent-dev');
      expect(result.metadata.agentId).toBe('dev');
      expect(result.metadata.hasAuthority).toBe(true);
    });

    test('should return null when no agent is active', () => {
      const context = {
        prompt: '',
        session: { active_agent: { id: null } },
        config: {
          synapsePath: tempDir,
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when session has no active_agent', () => {
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

    test('should return null when no matching agentTrigger in manifest', () => {
      const context = {
        prompt: '',
        session: {
          active_agent: { id: 'unknown-agent' },
        },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              DEV_AGENT: { agentTrigger: 'dev', file: 'agent-dev' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when domain file is missing', () => {
      const context = {
        prompt: '',
        session: {
          active_agent: { id: 'dev' },
        },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              DEV_AGENT: { agentTrigger: 'dev', file: 'nonexistent' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should detect authority boundaries (rules containing AUTH)', () => {
      fs.writeFileSync(path.join(tempDir, 'agent-qa'), [
        'QA_RULE_1=Run quality checks',
        'QA_RULE_2=QA agent AUTH boundary: can approve or reject stories',
      ].join('\n'));

      const context = {
        prompt: '',
        session: {
          active_agent: { id: 'qa' },
        },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              QA_AGENT: { agentTrigger: 'qa', file: 'agent-qa' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result.metadata.hasAuthority).toBe(true);
    });

    test('should set hasAuthority false when no AUTH rules', () => {
      fs.writeFileSync(path.join(tempDir, 'agent-sm'), 'SM_RULE_1=Create stories\n');

      const context = {
        prompt: '',
        session: {
          active_agent: { id: 'sm' },
        },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              SM_AGENT: { agentTrigger: 'sm', file: 'agent-sm' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result.metadata.hasAuthority).toBe(false);
    });

    test('should use default file path when domain has no file property', () => {
      fs.writeFileSync(path.join(tempDir, 'agent-architect'), 'RULE=Architecture rules\n');

      const context = {
        prompt: '',
        session: {
          active_agent: { id: 'architect' },
        },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              ARCH_AGENT: { agentTrigger: 'architect' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).not.toBeNull();
      expect(result.rules[0]).toContain('Architecture rules');
    });
  });
});
