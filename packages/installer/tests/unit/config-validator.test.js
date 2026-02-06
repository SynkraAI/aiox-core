/**
 * Unit Tests: Configuration Validator
 * Story 1.6: Environment Configuration
 *
 * Tests for config-validator.js
 */

const {
  validateEnvFormat,
  validateApiKeyFormat,
  validateYamlSyntax,
  validateCoreConfigStructure,
  validatePath,
  sanitizeInput,
} = require('../../src/config/validation/config-validator');

describe('Configuration Validator', () => {
  describe('validateEnvFormat', () => {
    it('should validate correct .env format', () => {
      const content = `# Comment
NODE_ENV=development
API_KEY=sk-12345
DATABASE_URL=postgresql://localhost`;

      const result = validateEnvFormat(content);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject spaces around =', () => {
      const content = 'NODE_ENV = development';
      const result = validateEnvFormat(content);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('spaces around =');
    });

    it('should reject invalid key names', () => {
      const content = 'invalid-key=value';
      const result = validateEnvFormat(content);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid format');
    });

    it('should allow empty values', () => {
      const content = 'API_KEY=';
      const result = validateEnvFormat(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should skip comments and empty lines', () => {
      const content = `# Comment

      NODE_ENV=development
      # Another comment
      `;

      const result = validateEnvFormat(content);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateApiKeyFormat', () => {
    it('should allow empty keys (skip logic)', () => {
      const result = validateApiKeyFormat('');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject whitespace-only keys', () => {
      const result = validateApiKeyFormat('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('whitespace');
    });

    it('should validate OpenAI key format', () => {
      const validKey = 'sk-1234567890abcdefghij';
      const result = validateApiKeyFormat(validKey, 'openai');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject invalid OpenAI key format', () => {
      const invalidKey = 'invalid-key';
      const result = validateApiKeyFormat(invalidKey, 'openai');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('sk-');
    });

    it('should validate Anthropic key format', () => {
      const validKey = 'sk-ant-1234567890abcdefghijklmnopqrstuv';
      const result = validateApiKeyFormat(validKey, 'anthropic');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject invalid Anthropic key format', () => {
      const invalidKey = 'sk-1234';
      const result = validateApiKeyFormat(invalidKey, 'anthropic');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('sk-ant-');
    });

    it('should validate GitHub token format', () => {
      const validToken = 'ghp_1234567890abcdefghij';
      const result = validateApiKeyFormat(validToken, 'github');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject keys with spaces', () => {
      const keyWithSpace = 'sk-12345 67890';
      const result = validateApiKeyFormat(keyWithSpace);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('spaces');
    });

    it('should reject too short keys', () => {
      const shortKey = 'sk-123';
      const result = validateApiKeyFormat(shortKey);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('too short');
    });
  });

  describe('validateYamlSyntax', () => {
    it('should validate correct YAML', () => {
      const content = `
project:
  type: GREENFIELD
  version: 2.1.0
qa:
  qaLocation: docs/qa
`;

      const result = validateYamlSyntax(content);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.parsed).toBeDefined();
      expect(result.parsed.project.type).toBe('GREENFIELD');
    });

    it('should reject invalid YAML', () => {
      // Use truly invalid YAML syntax that js-yaml will reject
      const content = `
project:
  type: GREENFIELD
  {invalid: syntax
`;

      const result = validateYamlSyntax(content);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('YAML syntax error');
      expect(result.parsed).toBeNull();
    });

    it('should handle empty YAML', () => {
      const content = '';
      const result = validateYamlSyntax(content);

      expect(result.valid).toBe(true);
      expect(result.parsed).toBeUndefined();
    });
  });

  describe('validateCoreConfigStructure', () => {
    it('should validate correct core config structure', () => {
      const config = {
        project: { type: 'GREENFIELD' },
        qa: { qaLocation: 'docs/qa' },
        prd: { prdFile: 'docs/prd.md' },
        architecture: { architectureFile: 'docs/architecture.md' },
      };

      const result = validateCoreConfigStructure(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing required fields', () => {
      const config = {
        project: { type: 'GREENFIELD' },
        // Missing qa, prd, architecture
      };

      const result = validateCoreConfigStructure(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Missing required field: qa');
    });

    it('should reject invalid project type', () => {
      const config = {
        project: { type: 'INVALID_TYPE' },
        qa: {},
        prd: {},
        architecture: {},
      };

      const result = validateCoreConfigStructure(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid project.type: INVALID_TYPE. Expected greenfield, brownfield, or existing_aios');
    });

    it('should validate IDE section if present', () => {
      const config = {
        project: { type: 'GREENFIELD' },
        qa: {},
        prd: {},
        architecture: {},
        ide: { selected: 'not-an-array' }, // Should be array
      };

      const result = validateCoreConfigStructure(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('ide.selected must be an array');
    });
  });

  describe('validatePath', () => {
    it('should validate correct paths', () => {
      const paths = [
        '/absolute/path/to/file',
        'relative/path/to/file',
        'C:\\Windows\\Path\\File.txt',
        './current/directory',
      ];

      paths.forEach(p => {
        const result = validatePath(p);
        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    it('should reject empty paths', () => {
      const result = validatePath('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject path traversal', () => {
      const result = validatePath('../../../etc/passwd');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Path traversal');
    });

    it('should reject invalid characters', () => {
      const invalidPaths = [
        'path/with<angle>brackets',
        'path/with|pipe',
        'path/with"quote',
        'path/with?question',
      ];

      invalidPaths.forEach(p => {
        const result = validatePath(p);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('invalid characters');
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should remove null bytes', () => {
      const input = 'text\0with\0nulls';
      const result = sanitizeInput(input);

      expect(result).toBe('textwithnulls');
    });

    it('should trim whitespace', () => {
      const input = '  whitespace around  ';
      const result = sanitizeInput(input);

      expect(result).toBe('whitespace around');
    });

    it('should limit length', () => {
      const input = 'a'.repeat(20000); // Exceeds max length
      const result = sanitizeInput(input);

      expect(result.length).toBeLessThanOrEqual(10000);
    });

    it('should handle non-string input', () => {
      const inputs = [null, undefined, 123, {}, []];

      inputs.forEach(input => {
        const result = sanitizeInput(input);
        expect(result).toBe('');
      });
    });

    it('should preserve valid input', () => {
      const input = 'Valid API Key sk-1234567890';
      const result = sanitizeInput(input);

      expect(result).toBe(input);
    });
  });
});
