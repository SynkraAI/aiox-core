/**
 * Unit Tests: .env Template Generator
 * Story 1.6: Environment Configuration
 *
 * Tests for env-template.js
 */

const { generateEnvContent, generateEnvExample } = require('../../src/config/templates/env-template');

describe('.env Template Generator', () => {
  describe('generateEnvContent', () => {
    it('should generate .env with empty API keys when none provided', () => {
      const content = generateEnvContent();

      expect(content).toContain('NODE_ENV=development');
      // Version-agnostic: check AIOX_VERSION exists with valid semver format
      expect(content).toMatch(/AIOX_VERSION=\d+\.\d+\.\d+/);
      expect(content).toContain('OPENAI_API_KEY=');
      expect(content).toContain('ANTHROPIC_API_KEY=');
      expect(content).toContain('# Synkra AIOX Environment Configuration');
    });

    it('should generate .env with provided API keys', () => {
      const apiKeys = {
        openai: 'sk-test-openai-key',
        anthropic: 'sk-ant-test-anthropic-key',
      };

      const content = generateEnvContent(apiKeys);

      expect(content).toContain('OPENAI_API_KEY=sk-test-openai-key');
      expect(content).toContain('ANTHROPIC_API_KEY=sk-ant-test-anthropic-key');
    });

    it('should generate .env with optional service API keys', () => {
      const apiKeys = {
        clickup: 'clickup-test-key',
        github: 'ghp-test-token',
        exa: 'exa-test-key',
      };

      const content = generateEnvContent(apiKeys);

      expect(content).toContain('CLICKUP_API_KEY=clickup-test-key');
      expect(content).toContain('GITHUB_TOKEN=ghp-test-token');
      expect(content).toContain('EXA_API_KEY=exa-test-key');
    });

    it('should include helpful comments', () => {
      const content = generateEnvContent();

      expect(content).toContain('# LLM Providers');
      expect(content).toContain('# Search & Research Tools');
      expect(content).toContain('Get your key at:');
    });

    it('should not contain sensitive data in comments', () => {
      const content = generateEnvContent();

      // Should not have example API keys or credentials in comments
      expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
      expect(content).not.toMatch(/example.*key.*[a-zA-Z0-9]{20,}/i);
    });

    it('should use KEY=value format without spaces', () => {
      const apiKeys = { openai: 'test-key' };
      const content = generateEnvContent(apiKeys);

      // Check no spaces around =
      const lines = content.split('\n').filter(line => !line.startsWith('#') && line.trim());
      lines.forEach(line => {
        if (line.includes('=')) {
          expect(line).toMatch(/^[A-Z0-9_]+=.*/);
          // Check there are NO spaces before or after the = sign
          expect(line).not.toMatch(/\s=/); // No space before =
          expect(line).not.toMatch(/=\s[^=]*$/); // No space after = (except in comments)
        }
      });
    });
  });

  describe('generateEnvExample', () => {
    it('should generate .env.example with empty values', () => {
      const content = generateEnvExample();

      expect(content).toContain('NODE_ENV=development');
      // Version-agnostic: check AIOX_VERSION exists with valid semver format
      expect(content).toMatch(/AIOX_VERSION=\d+\.\d+\.\d+/);
      expect(content).toContain('OPENAI_API_KEY=');
      expect(content).toContain('ANTHROPIC_API_KEY=');
      expect(content).toContain('CLICKUP_API_KEY=');
    });

    it('should not contain any actual API keys', () => {
      const content = generateEnvExample();

      // All API key fields should be empty
      const apiKeyLines = content.split('\n').filter(line =>
        line.includes('_API_KEY=') || line.includes('_TOKEN='),
      );

      apiKeyLines.forEach(line => {
        const [, value] = line.split('=');
        expect(value.trim()).toBe('');
      });
    });

    it('should include helpful comments with links', () => {
      const content = generateEnvExample();

      expect(content).toContain('https://platform.openai.com');
      expect(content).toContain('https://console.anthropic.com');
      expect(content).toContain('ClickUp Settings');
      expect(content).toContain('https://github.com/settings/tokens');
    });

    it('should be safe to commit', () => {
      const content = generateEnvExample();

      // Should not contain any of these sensitive patterns
      const sensitivePatterns = [
        /sk-[a-zA-Z0-9]{20,}/, // OpenAI keys
        /sk-ant-[a-zA-Z0-9]{30,}/, // Anthropic keys
        /ghp_[a-zA-Z0-9]+/, // GitHub tokens
      ];

      sensitivePatterns.forEach(pattern => {
        expect(content).not.toMatch(pattern);
      });

      // Check that no API key fields have actual values (only empty or commented)
      const lines = content.split('\n').filter(line => !line.trim().startsWith('#'));
      lines.forEach(line => {
        if (line.includes('PASSWORD') || line.includes('SECRET') || line.includes('KEY') || line.includes('TOKEN')) {
          const [key, value] = line.split('=');
          if (value !== undefined) {
            expect(value.trim()).toBe('');
          }
        }
      });
    });

    it('should match .env structure but with empty values', () => {
      const envContent = generateEnvContent({ openai: 'test', anthropic: 'test' });
      const exampleContent = generateEnvExample();

      // Extract non-comment, non-empty lines
      const envKeys = envContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('=')[0]);

      const exampleKeys = exampleContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('=')[0]);

      // Both should have the same keys
      expect(exampleKeys.sort()).toEqual(envKeys.sort());
    });
  });

  describe('Content Quality', () => {
    it('should have proper line endings', () => {
      const content = generateEnvContent();

      // Should use \n for line endings
      expect(content).not.toContain('\r\n');
      expect(content.split('\n').length).toBeGreaterThan(10);
    });

    it('should organize content in sections', () => {
      const content = generateEnvContent();

      // Should have clear section headers
      expect(content).toContain('# AIOX Core Configuration');
      expect(content).toContain('# LLM Providers');
      expect(content).toContain('# Search & Research Tools');
    });

    it('should include usage instructions', () => {
      const content = generateEnvContent();

      // Should help users understand what to do
      expect(content).toContain('DO NOT commit');
      expect(content).toContain('Get yours at:');
    });
  });
});
