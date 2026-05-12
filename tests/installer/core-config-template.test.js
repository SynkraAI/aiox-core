/**
 * Unit Tests for core-config-template
 *
 * Story ACT-12: Language removed from core-config (delegated to Claude Code settings.json)
 *
 * Test Coverage:
 * - generateCoreConfig no longer includes language field
 * - Config still includes user_profile and other fields
 * - YAML output parses correctly without language
 */

const yaml = require('js-yaml');
const { generateCoreConfig } = require('../../packages/installer/src/config/templates/core-config-template');

describe('core-config-template', () => {
  describe('ACT-12: language removed from core-config', () => {
    test('should NOT include language field in generated config', () => {
      const output = generateCoreConfig();
      const parsed = yaml.load(output);

      expect(parsed).not.toHaveProperty('language');
    });

    test('should ignore language option if passed (backward compat)', () => {
      const output = generateCoreConfig({ language: 'pt' });
      const parsed = yaml.load(output);

      // language param is no longer destructured, so it's just ignored
      expect(parsed).not.toHaveProperty('language');
    });

    test('should still include user_profile', () => {
      const output = generateCoreConfig({ userProfile: 'bob' });
      const parsed = yaml.load(output);

      expect(parsed.user_profile).toBe('bob');
    });

    test('should generate valid YAML without language', () => {
      const output = generateCoreConfig({
        projectType: 'BROWNFIELD',
        selectedIDEs: ['vscode', 'cursor'],
        userProfile: 'bob',
        aioxVersion: '3.0.0',
      });
      const parsed = yaml.load(output);

      expect(parsed).toBeDefined();
      expect(typeof parsed).toBe('object');
      expect(parsed).not.toHaveProperty('language');
      expect(parsed.user_profile).toBe('bob');
      expect(parsed.project.type).toBe('BROWNFIELD');
      expect(parsed.ide.selected).toContain('vscode');
      expect(parsed.ide.selected).toContain('cursor');
    });
  });
});
