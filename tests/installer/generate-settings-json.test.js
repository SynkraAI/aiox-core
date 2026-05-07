const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const { writeSettingsJson } = require('../../.aiox-core/infrastructure/scripts/generate-settings-json');

describe('generate-settings-json', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-settings-json-'));
    await fs.ensureDir(path.join(tempDir, '.claude'));
  });

  afterEach(async () => {
    if (tempDir && await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  it('should merge permissions without dropping existing security rules', async () => {
    const settingsPath = path.join(tempDir, '.claude', 'settings.json');
    await fs.writeFile(
      settingsPath,
      JSON.stringify({
        defaultMode: 'acceptEdits',
        permissions: {
          allow: ['Bash(git status:*)'],
          deny: ['Bash(git push --force:*)'],
        },
      }, null, 2) + '\n',
      'utf8',
    );

    writeSettingsJson(tempDir, {
      allow: ['Read(./.aiox-core/**)'],
      deny: ['Bash(--no-verify:*)'],
    });

    const settings = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
    expect(settings.defaultMode).toBe('acceptEdits');
    expect(settings.permissions.allow).toEqual(
      expect.arrayContaining(['Bash(git status:*)', 'Read(./.aiox-core/**)']),
    );
    expect(settings.permissions.deny).toEqual(
      expect.arrayContaining(['Bash(git push --force:*)', 'Bash(--no-verify:*)']),
    );
  });

  it('should preserve existing permissions when no new permissions are generated', async () => {
    const settingsPath = path.join(tempDir, '.claude', 'settings.json');
    await fs.writeFile(
      settingsPath,
      JSON.stringify({
        defaultMode: 'acceptEdits',
        permissions: {
          allow: ['Bash(git push origin main)'],
          deny: ['Bash(git push --force)'],
        },
      }, null, 2) + '\n',
      'utf8',
    );

    writeSettingsJson(tempDir, {
      allow: [],
      deny: [],
    });

    const settings = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
    expect(settings.defaultMode).toBe('acceptEdits');
    expect(settings.permissions).toEqual({
      allow: ['Bash(git push origin main)'],
      deny: ['Bash(git push --force)'],
    });
  });
});
