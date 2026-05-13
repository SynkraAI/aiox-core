/**
 * Testes unitários para env-interpolator
 *
 * Cobre interpolateString, interpolateEnvVars e lintEnvPatterns.
 *
 * @see .aiox-core/core/config/env-interpolator.js
 * @issue #52
 */

'use strict';

const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

const {
  interpolateString,
  interpolateEnvVars,
  lintEnvPatterns,
  ENV_VAR_PATTERN,
} = require(path.join(PROJECT_ROOT, '.aiox-core', 'core', 'config', 'env-interpolator'));

// ============================================================================
// interpolateString
// ============================================================================

describe('interpolateString', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('deve resolver ${VAR} existente', () => {
    process.env.MY_VAR = 'hello';
    expect(interpolateString('${MY_VAR}')).toBe('hello');
  });

  it('deve resolver ${VAR:-default} quando VAR existe', () => {
    process.env.MY_VAR = 'real';
    expect(interpolateString('${MY_VAR:-fallback}')).toBe('real');
  });

  it('deve usar default quando VAR não existe', () => {
    delete process.env.MISSING_VAR;
    expect(interpolateString('${MISSING_VAR:-fallback}')).toBe('fallback');
  });

  it('deve retornar string vazia e gerar warning quando VAR não existe sem default', () => {
    delete process.env.MISSING_VAR;
    const warnings = [];
    const result = interpolateString('${MISSING_VAR}', { warnings });

    expect(result).toBe('');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('MISSING_VAR');
  });

  it('deve resolver múltiplas variáveis na mesma string', () => {
    process.env.HOST = 'localhost';
    process.env.PORT = '3000';
    expect(interpolateString('${HOST}:${PORT}')).toBe('localhost:3000');
  });

  it('deve preservar texto sem padrão ${...}', () => {
    expect(interpolateString('no variables here')).toBe('no variables here');
  });

  it('deve resolver default vazio ${VAR:-}', () => {
    delete process.env.EMPTY_DEFAULT;
    expect(interpolateString('${EMPTY_DEFAULT:-}')).toBe('');
  });
});

// ============================================================================
// interpolateEnvVars
// ============================================================================

describe('interpolateEnvVars', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('deve interpolar strings em objetos aninhados', () => {
    process.env.DB_HOST = 'pg.example.com';
    const config = {
      database: {
        host: '${DB_HOST}',
        port: 5432,
      },
    };

    const result = interpolateEnvVars(config);
    expect(result.database.host).toBe('pg.example.com');
    expect(result.database.port).toBe(5432);
  });

  it('deve interpolar strings em arrays', () => {
    process.env.ITEM = 'resolved';
    const config = ['${ITEM}', 'static'];

    const result = interpolateEnvVars(config);
    expect(result).toEqual(['resolved', 'static']);
  });

  it('deve preservar números, booleanos e null', () => {
    expect(interpolateEnvVars(42)).toBe(42);
    expect(interpolateEnvVars(true)).toBe(true);
    expect(interpolateEnvVars(null)).toBeNull();
  });

  it('deve processar objetos profundamente aninhados', () => {
    process.env.SECRET = 'top-secret';
    const config = {
      l1: { l2: { l3: { key: '${SECRET}' } } },
    };

    const result = interpolateEnvVars(config);
    expect(result.l1.l2.l3.key).toBe('top-secret');
  });

  it('deve coletar warnings de variáveis ausentes', () => {
    delete process.env.UNKNOWN;
    const warnings = [];
    interpolateEnvVars({ key: '${UNKNOWN}' }, { warnings });

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('UNKNOWN');
  });

  it('não deve mutar o config original', () => {
    process.env.VAL = 'new';
    const config = { a: '${VAL}' };
    const configCopy = JSON.parse(JSON.stringify(config));

    interpolateEnvVars(config);
    expect(config).toEqual(configCopy);
  });
});

// ============================================================================
// lintEnvPatterns
// ============================================================================

describe('lintEnvPatterns', () => {
  it('deve detectar padrões ${...} em strings', () => {
    const config = { api: { key: '${API_KEY}' } };
    const findings = lintEnvPatterns(config, 'config.yaml');

    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain('config.yaml');
    expect(findings[0]).toContain('api.key');
    expect(findings[0]).toContain('${API_KEY}');
  });

  it('deve detectar padrões em arrays', () => {
    const config = { hosts: ['static', '${DYNAMIC_HOST}'] };
    const findings = lintEnvPatterns(config, 'test.yaml');

    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain('hosts[1]');
  });

  it('deve retornar array vazio quando não há padrões', () => {
    const config = { name: 'static', port: 3000 };
    const findings = lintEnvPatterns(config, 'clean.yaml');

    expect(findings).toEqual([]);
  });

  it('deve detectar múltiplos padrões', () => {
    const config = {
      db: { host: '${DB_HOST}', pass: '${DB_PASS}' },
      api: '${API_URL}',
    };
    const findings = lintEnvPatterns(config, 'app.yaml');

    expect(findings).toHaveLength(3);
  });

  it('deve funcionar com objetos profundamente aninhados', () => {
    const config = { a: { b: { c: { d: '${DEEP}' } } } };
    const findings = lintEnvPatterns(config, 'deep.yaml');

    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain('a.b.c.d');
  });
});

// ============================================================================
// ENV_VAR_PATTERN
// ============================================================================

describe('ENV_VAR_PATTERN', () => {
  it('deve ser uma regex global', () => {
    expect(ENV_VAR_PATTERN).toBeInstanceOf(RegExp);
    expect(ENV_VAR_PATTERN.global).toBe(true);
  });

  it('deve capturar nome da variável', () => {
    const match = '${MY_VAR}'.match(new RegExp(ENV_VAR_PATTERN.source));
    expect(match[1]).toBe('MY_VAR');
  });

  it('deve capturar valor default', () => {
    const match = '${MY_VAR:-default}'.match(new RegExp(ENV_VAR_PATTERN.source));
    expect(match[1]).toBe('MY_VAR');
    expect(match[2]).toBe('default');
  });
});
