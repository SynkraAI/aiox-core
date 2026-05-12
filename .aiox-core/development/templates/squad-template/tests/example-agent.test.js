/**
 * Example Agent Tests
 * Replace with your actual test cases
 */

import { loadAgent, executeCommand } from '@aiox/testing';

describe('example-agent', () => {
  let agent;

  beforeAll(async () => {
    agent = await loadAgent('./agents/example-agent.yaml');
  });

  describe('initialization', () => {
    test('should load agent successfully', () => {
      expect(agent).toBeDefined();
      expect(agent.name).toBe('example-agent');
    });

    test('should have required persona fields', () => {
      expect(agent.persona.name).toBeDefined();
      expect(agent.persona.role).toBeDefined();
      expect(agent.persona.expertise).toBeInstanceOf(Array);
    });
  });

  describe('commands', () => {
    test('should have example-command registered', () => {
      const command = agent.commands.find(c => c.name === 'example-command');
      expect(command).toBeDefined();
      expect(command.workflow).toBe('example-workflow');
    });
  });

  describe('execution', () => {
    test('should execute example-command successfully', async () => {
      const result = await executeCommand(agent, '*example-command', {
        input1: 'test-input'
      });

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });

    test('should handle invalid input gracefully', async () => {
      const result = await executeCommand(agent, '*example-command', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('input');
    });
  });
});
