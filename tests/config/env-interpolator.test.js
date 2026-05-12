/**
 * Unit tests for env-interpolator.js
 * Story PRO-4 — Config Hierarchy
 */

const {
  interpolateEnvVars,
  interpolateString,
  lintEnvPatterns,
  ENV_VAR_PATTERN,
} = require('../../.aiox-core/core/config/env-interpolator');

describe('env-interpolator', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset env by clearing and restoring — preserves Node's special process.env object
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  afterAll(() => {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  describe('ENV_VAR_PATTERN regex', () => {
    test('matches ${VAR}', () => {
      expect('${MY_VAR}'.match(new RegExp(ENV_VAR_PATTERN.source))).toBeTruthy();
    });

    test('matches ${VAR:-default}', () => {
      const match = '${MY_VAR:-fallback}'.match(new RegExp(ENV_VAR_PATTERN.source));
      expect(match).toBeTruthy();
      expect(match[1]).toBe('MY_VAR');
      expect(match[2]).toBe('fallback');
    });

    test('does not match bare text', () => {
      expect('plain text'.match(new RegExp(ENV_VAR_PATTERN.source))).toBeNull();
    });
  });

  describe('interpolateString', () => {
    test('resolves ${VAR} from process.env', () => {
      process.env.TEST_VAR = 'hello';
      expect(interpolateString('${TEST_VAR}')).toBe('hello');
    });

    test('resolves ${VAR:-default} when env var set', () => {
      process.env.TEST_VAR = 'hello';
      expect(interpolateString('${TEST_VAR:-fallback}')).toBe('hello');
    });

    test('uses default when env var missing', () => {
      delete process.env.MISSING_VAR;
      expect(interpolateString('${MISSING_VAR:-fallback}')).toBe('fallback');
    });

    test('returns empty string when env var missing with no default', () => {
      delete process.env.MISSING_VAR;
      const warnings = [];
      const result = interpolateString('${MISSING_VAR}', { warnings });
      expect(result).toBe('');
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('MISSING_VAR');
    });

    test('interpolates multiple vars in same string', () => {
      process.env.HOST = 'localhost';
      process.env.PORT = '8080';
      expect(interpolateString('${HOST}:${PORT}')).toBe('localhost:8080');
    });

    test('preserves text around variables', () => {
      process.env.NAME = 'world';
      expect(interpolateString('hello ${NAME}!')).toBe('hello world!');
    });

    test('handles empty default value', () => {
      delete process.env.EMPTY;
      expect(interpolateString('${EMPTY:-}')).toBe('');
    });
  });

  describe('interpolateEnvVars (recursive)', () => {
    test('interpolates strings in nested objects', () => {
      process.env.DB_HOST = 'db.example.com';
      const config = {
        database: {
          host: '${DB_HOST}',
          port: 5432,
        },
      };

      const result = interpolateEnvVars(config);
      expect(result.database.host).toBe('db.example.com');
      expect(result.database.port).toBe(5432);
    });

    test('interpolates strings in arrays', () => {
      process.env.ITEM = 'resolved';
      const config = { items: ['${ITEM}', 'static'] };

      const result = interpolateEnvVars(config);
      expect(result.items).toEqual(['resolved', 'static']);
    });

    test('preserves non-string scalars', () => {
      const config = {
        count: 42,
        enabled: true,
        empty: null,
      };

      const result = interpolateEnvVars(config);
      expect(result.count).toBe(42);
      expect(result.enabled).toBe(true);
      expect(result.empty).toBeNull();
    });

    test('collects warnings for missing vars', () => {
      delete process.env.MISSING_A;
      delete process.env.MISSING_B;
      const config = {
        a: '${MISSING_A}',
        nested: { b: '${MISSING_B}' },
      };

      const warnings = [];
      interpolateEnvVars(config, { warnings });
      expect(warnings).toHaveLength(2);
    });

    test('does not mutate original config', () => {
      process.env.VAL = 'new';
      const config = { key: '${VAL}' };
      const original = JSON.parse(JSON.stringify(config));

      interpolateEnvVars(config);
      expect(config).toEqual(original);
    });
  });

  describe('lintEnvPatterns', () => {
    test('detects ${...} in config values', () => {
      const config = {
        url: '${API_URL}',
        name: 'static',
      };

      const findings = lintEnvPatterns(config, 'framework-config.yaml');
      expect(findings).toHaveLength(1);
      expect(findings[0]).toContain('framework-config.yaml');
      expect(findings[0]).toContain('url');
    });

    test('detects nested ${...} patterns', () => {
      const config = {
        db: {
          host: '${DB_HOST}',
          port: 5432,
        },
      };

      const findings = lintEnvPatterns(config, 'project-config.yaml');
      expect(findings).toHaveLength(1);
      expect(findings[0]).toContain('db.host');
    });

    test('detects ${...} in arrays', () => {
      const config = {
        items: ['${ITEM}', 'static'],
      };

      const findings = lintEnvPatterns(config, 'test.yaml');
      expect(findings).toHaveLength(1);
    });

    test('returns empty for clean config', () => {
      const config = {
        name: 'static',
        count: 42,
        nested: { ok: true },
      };

      expect(lintEnvPatterns(config, 'test.yaml')).toHaveLength(0);
    });
  });
});
