const {
  SemanticHandshakeEngine,
  ConstraintSeverity,
  ConstraintType,
} = require('aiox-core/core/synapse/context');

describe('SemanticHandshakeEngine', () => {
  test('exports the engine from the SYNAPSE context surface', () => {
    expect(SemanticHandshakeEngine).toBeDefined();
    expect(typeof SemanticHandshakeEngine).toBe('function');
    expect(ConstraintSeverity.BLOCKER).toBe('BLOCKER');
    expect(ConstraintType.TECH_STACK).toBe('TECH_STACK');
  });

  test('extracts PostgreSQL and serverless constraints from planning text', () => {
    const engine = new SemanticHandshakeEngine();
    const constraints = engine.registerConstraints(
      'Architecture: use a serverless runtime with PostgreSQL for persistence.',
    );

    expect(constraints.map(constraint => constraint.id)).toEqual([
      'TECH-POSTGRESQL',
      'ARCH-SERVERLESS-STATE',
    ]);
    expect(engine.getConstraints()).toHaveLength(2);
  });

  test('blocks code that violates extracted hard constraints', async () => {
    const engine = new SemanticHandshakeEngine();
    engine.registerConstraints('Use serverless functions and PostgreSQL.');

    const result = await engine.validateExecutionIntent({
      files: [
        {
          path: 'src/db.js',
          content: `
            const sqlite = require('sqlite');
            const fs = require('fs');
            fs.writeFileSync('state.json', JSON.stringify({ ok: true }));
          `,
        },
      ],
    });

    expect(result.passed).toBe(false);
    expect(result.blockingViolations).toHaveLength(2);
    expect(result.blockingViolations.map(violation => violation.id)).toEqual([
      'TECH-POSTGRESQL',
      'ARCH-SERVERLESS-STATE',
    ]);
    expect(result.correctionPrompt).toContain('Semantic Handshake failed');
  });

  test('verifies compliant code and constraints without local-state violations', async () => {
    const engine = new SemanticHandshakeEngine();
    engine.registerConstraints('Use PostgreSQL and serverless architecture.');

    const result = await engine.validateExecutionIntent({
      files: [
        {
          path: 'src/db.js',
          content: `
            const { Pool } = require('pg');
            module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
          `,
        },
      ],
    });

    expect(result.passed).toBe(true);
    expect(result.verifiedConstraints.map(constraint => constraint.id)).toContain('TECH-POSTGRESQL');
    expect(result.verifiedConstraints.map(constraint => constraint.id)).toContain('ARCH-SERVERLESS-STATE');
  });

  test('warning constraints report violations without blocking execution', async () => {
    const engine = new SemanticHandshakeEngine({
      constraints: [
        {
          id: 'OBS-CONSOLE',
          source: '@architect',
          type: 'PATTERN',
          severity: 'WARNING',
          description: 'Avoid console logging in production paths.',
          forbiddenPatterns: [/console\.log\s*\(/],
        },
      ],
    });

    const result = await engine.validateExecutionIntent('console.log("debug");');

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(1);
    expect(result.blockingViolations).toHaveLength(0);
    expect(result.warnings[0]).toContain('Avoid console logging');
  });

  test('detects absolute import and no-eval violations', async () => {
    const engine = new SemanticHandshakeEngine();
    engine.registerConstraints('Coding standards: absolute imports only. Security: no eval.');

    const result = await engine.validateExecutionIntent({
      path: 'src/example.js',
      proposedCode: `
        const helper = require('../utils/helper');
        eval('2 + 2');
        module.exports = helper;
      `,
    });

    expect(result.passed).toBe(false);
    expect(result.blockingViolations.map(violation => violation.id)).toEqual([
      'IMPORT-ABSOLUTE',
      'SEC-NO-EVAL',
    ]);
  });

  test('supports custom validators and LLM-ready context messages', async () => {
    const engine = new SemanticHandshakeEngine();
    engine.addConstraint({
      id: 'CUSTOM-NO-TODO',
      severity: 'BLOCKER',
      description: 'Implementation must not leave TODO markers.',
      validator: ({ codeContext }) => ({
        passed: !codeContext.includes('TODO'),
        message: 'Remove TODO markers before execution.',
      }),
    });

    const result = await engine.validateExecutionIntent('// TODO: finish later');
    const report = engine.generateComplianceReport(result);
    const message = engine.toContextMessage(result);

    expect(result.passed).toBe(false);
    expect(report).toContain('Status: FAILED');
    expect(message).toMatchObject({
      role: 'system',
      metadata: {
        aiox: {
          type: 'semantic_handshake_report',
          passed: false,
          blockingViolationCount: 1,
        },
      },
    });
    expect(message.content).toContain('Remove TODO markers');
  });

  test('rejects constraints whose id normalizes to an empty value', () => {
    const engine = new SemanticHandshakeEngine();

    expect(() => engine.addConstraint({
      id: '---',
      description: '---',
    })).toThrow('constraint id normalizes to an empty value');
  });

  test('turns thrown validator errors into deterministic violations', async () => {
    const engine = new SemanticHandshakeEngine();
    engine.addConstraint({
      id: 'CUSTOM-VALIDATOR',
      severity: 'BLOCKER',
      description: 'Validator must be deterministic.',
      validator: () => {
        throw new Error('boom');
      },
    });

    const result = await engine.validateExecutionIntent('const ok = true;');

    expect(result.passed).toBe(false);
    expect(result.blockingViolations).toHaveLength(1);
    expect(result.blockingViolations[0]).toMatchObject({
      id: 'CUSTOM-VALIDATOR',
      message: 'Constraint validator failed: boom',
      matches: ['validator-error'],
      metadata: {
        validatorError: {
          message: 'boom',
        },
      },
    });
    expect(result.correctionPrompt).toContain('CUSTOM-VALIDATOR');
  });
});
