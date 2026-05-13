'use strict';

const {
  G5SemanticHandshakeGate,
  G5_DEFAULT_TIMEOUT_MS,
} = require('../../../.aiox-core/core/ids/gates/g5-semantic-handshake');
const { SemanticHandshakeEngine } = require('../../../.aiox-core/core/synapse/context');

function createLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  };
}

describe('G5SemanticHandshakeGate', () => {
  test('is exported with a default timeout', () => {
    expect(G5SemanticHandshakeGate).toBeDefined();
    expect(G5_DEFAULT_TIMEOUT_MS).toBe(2000);
  });

  test('blocks @dev execution when blocker constraints fail', async () => {
    const gate = new G5SemanticHandshakeGate({ logger: createLogger() });

    const result = await gate.verify({
      storyId: '483.1',
      planningText: 'Use serverless architecture with PostgreSQL.',
      files: [
        {
          path: 'src/handler.js',
          content: `
            const sqlite = require('sqlite');
            const fs = require('fs');
            fs.writeFileSync('state.json', '{}');
          `,
        },
      ],
    });

    expect(result.result.passed).toBe(false);
    expect(result.result.blocking).toBe(true);
    expect(result.result.warnings).toEqual(expect.arrayContaining([
      'Must use PostgreSQL adapter, not SQLite or another local database.',
      'Serverless architecture must not write runtime state to the local filesystem.',
    ]));
    expect(result.override.reason).toBe('Semantic Handshake blocker violation');
    expect(result.override.correctionPrompt).toContain('Blocking constraints');
  });

  test('passes when constraints are verified or not applicable', async () => {
    const gate = new G5SemanticHandshakeGate({ logger: createLogger() });

    const result = await gate.verify({
      storyId: '483.1',
      architectureText: 'Use PostgreSQL and serverless.',
      proposedCode: `
        const { Pool } = require('pg');
        module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
      `,
    });

    expect(result.result.passed).toBe(true);
    expect(result.result.blocking).toBe(false);
    expect(result.result.opportunities.some(item => item.entity === 'TECH-POSTGRESQL')).toBe(true);
  });

  test('warns and proceeds when no proposed code is available yet', async () => {
    const gate = new G5SemanticHandshakeGate({ logger: createLogger() });

    const result = await gate.verify({
      storyId: '483.1',
      planningText: 'Use absolute imports only.',
    });

    expect(result.result.passed).toBe(true);
    expect(result.result.blocking).toBe(false);
    expect(result.result.warnings).toContain(
      'Semantic Handshake constraints registered, but no proposed code was provided',
    );

    const nextResult = await gate.verify({
      proposedCode: "const helper = require('../relative-helper');",
    });

    expect(nextResult.result.passed).toBe(true);
    expect(nextResult.result.warnings).toContain('No Semantic Handshake constraints registered');
  });

  test('accepts an injected engine and structured constraints', async () => {
    const engine = new SemanticHandshakeEngine();
    const gate = new G5SemanticHandshakeGate({ engine, logger: createLogger() });

    const result = await gate.verify({
      constraints: [
        {
          id: 'SEC-NO-DYNAMIC-FUNCTION',
          severity: 'BLOCKER',
          description: 'Do not use dynamic Function constructors.',
          forbiddenPatterns: [/new\s+Function\s*\(/],
        },
      ],
      proposedCode: 'const fn = new Function("return true");',
    });

    expect(result.result.passed).toBe(false);
    expect(result.result.blocking).toBe(true);
    expect(result.result.opportunities[0]).toMatchObject({
      entity: 'SEC-NO-DYNAMIC-FUNCTION',
      severity: 'BLOCKER',
    });
  });
});
