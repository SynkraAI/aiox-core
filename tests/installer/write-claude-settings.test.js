/**
 * Tests for writeClaudeSettings and getExistingLanguage (Story ACT-12)
 *
 * Test Coverage:
 * - writeClaudeSettings creates .claude/settings.json with language
 * - writeClaudeSettings merges into existing settings.json
 * - writeClaudeSettings preserves other settings
 * - writeClaudeSettings handles missing .claude directory
 * - writeClaudeSettings maps language codes to Claude Code names
 * - getExistingLanguage reads language from settings.json
 * - getExistingLanguage returns null when no settings exist
 */

const path = require('path');
const fse = require('fs-extra');
const os = require('os');

// Import actual production functions via _testing export
const { _testing } = require('../../packages/installer/src/wizard/index');
const { writeClaudeSettings, getExistingLanguage } = _testing;

describe('ACT-12: writeClaudeSettings and getExistingLanguage', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `aiox-test-settings-${Date.now()}`);
    await fse.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fse.remove(tempDir);
  });

  describe('writeClaudeSettings', () => {
    test('should create .claude/settings.json with language', async () => {
      const result = await writeClaudeSettings('pt', tempDir);

      expect(result).toBe(true);

      const settingsPath = path.join(tempDir, '.claude', 'settings.json');
      const content = JSON.parse(await fse.readFile(settingsPath, 'utf8'));

      expect(content.language).toBe('portuguese');
    });

    test('should map en to english', async () => {
      await writeClaudeSettings('en', tempDir);

      const settingsPath = path.join(tempDir, '.claude', 'settings.json');
      const content = JSON.parse(await fse.readFile(settingsPath, 'utf8'));

      expect(content.language).toBe('english');
    });

    test('should map es to spanish', async () => {
      await writeClaudeSettings('es', tempDir);

      const settingsPath = path.join(tempDir, '.claude', 'settings.json');
      const content = JSON.parse(await fse.readFile(settingsPath, 'utf8'));

      expect(content.language).toBe('spanish');
    });

    test('should merge into existing settings.json', async () => {
      const claudeDir = path.join(tempDir, '.claude');
      await fse.ensureDir(claudeDir);
      await fse.writeFile(
        path.join(claudeDir, 'settings.json'),
        JSON.stringify({ permissions: { allow: ['Read'] }, theme: 'dark' }, null, 2) + '\n',
        'utf8',
      );

      const result = await writeClaudeSettings('pt', tempDir);

      expect(result).toBe(true);

      const content = JSON.parse(
        await fse.readFile(path.join(claudeDir, 'settings.json'), 'utf8'),
      );

      expect(content.language).toBe('portuguese');
      expect(content.permissions).toEqual({ allow: ['Read'] });
      expect(content.theme).toBe('dark');
    });

    test('should overwrite existing language value', async () => {
      const claudeDir = path.join(tempDir, '.claude');
      await fse.ensureDir(claudeDir);
      await fse.writeFile(
        path.join(claudeDir, 'settings.json'),
        JSON.stringify({ language: 'english' }, null, 2) + '\n',
        'utf8',
      );

      await writeClaudeSettings('es', tempDir);

      const content = JSON.parse(
        await fse.readFile(path.join(claudeDir, 'settings.json'), 'utf8'),
      );

      expect(content.language).toBe('spanish');
    });

    test('should create .claude directory if it does not exist', async () => {
      const claudeDir = path.join(tempDir, '.claude');
      expect(await fse.pathExists(claudeDir)).toBe(false);

      await writeClaudeSettings('pt', tempDir);

      expect(await fse.pathExists(claudeDir)).toBe(true);
      expect(await fse.pathExists(path.join(claudeDir, 'settings.json'))).toBe(true);
    });
  });

  describe('getExistingLanguage', () => {
    test('should return language code from settings.json', async () => {
      const claudeDir = path.join(tempDir, '.claude');
      await fse.ensureDir(claudeDir);
      await fse.writeFile(
        path.join(claudeDir, 'settings.json'),
        JSON.stringify({ language: 'portuguese' }, null, 2) + '\n',
        'utf8',
      );

      const result = await getExistingLanguage(tempDir);
      expect(result).toBe('pt');
    });

    test('should return null when no settings.json exists', async () => {
      const result = await getExistingLanguage(tempDir);
      expect(result).toBeNull();
    });

    test('should return null when settings.json has no language', async () => {
      const claudeDir = path.join(tempDir, '.claude');
      await fse.ensureDir(claudeDir);
      await fse.writeFile(
        path.join(claudeDir, 'settings.json'),
        JSON.stringify({ theme: 'dark' }, null, 2) + '\n',
        'utf8',
      );

      const result = await getExistingLanguage(tempDir);
      expect(result).toBeNull();
    });

    test('should return null for unknown language', async () => {
      const claudeDir = path.join(tempDir, '.claude');
      await fse.ensureDir(claudeDir);
      await fse.writeFile(
        path.join(claudeDir, 'settings.json'),
        JSON.stringify({ language: 'french' }, null, 2) + '\n',
        'utf8',
      );

      const result = await getExistingLanguage(tempDir);
      expect(result).toBeNull();
    });

    test('should handle malformed JSON gracefully', async () => {
      const claudeDir = path.join(tempDir, '.claude');
      await fse.ensureDir(claudeDir);
      await fse.writeFile(
        path.join(claudeDir, 'settings.json'),
        'not valid json{{{',
        'utf8',
      );

      const result = await getExistingLanguage(tempDir);
      expect(result).toBeNull();
    });

    test('should roundtrip with writeClaudeSettings', async () => {
      await writeClaudeSettings('es', tempDir);

      const result = await getExistingLanguage(tempDir);
      expect(result).toBe('es');
    });
  });
});
