'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  copySkillFiles,
  copyExtraCommandFiles,
  createClaudeSettingsLocal,
} = require('../../../../../packages/installer/src/wizard/ide-config-generator');

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'artifact-copy-'));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('artifact-copy-pipeline (Story INS-4.3)', () => {
  describe('copySkillFiles', () => {
    test('copies skill directories from source to target via real function', async () => {
      const sourceRoot = createTempDir();
      const targetRoot = createTempDir();

      try {
        // Create source skills
        const skillsDir = path.join(sourceRoot, '.claude', 'skills');
        for (const skill of ['skill-a', 'skill-b', 'skill-c']) {
          const dir = path.join(skillsDir, skill);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, 'SKILL.md'), `# ${skill}`, 'utf8');
        }

        // Call the REAL exported function with _sourceRoot override
        const result = await copySkillFiles(targetRoot, sourceRoot);

        expect(result.count).toBe(3);
        expect(result.skipped).toBe(false);

        // Verify files actually copied to target
        const targetSkills = path.join(targetRoot, '.claude', 'skills');
        const copied = fs.readdirSync(targetSkills);
        expect(copied).toContain('skill-a');
        expect(copied).toContain('skill-b');
        expect(copied).toContain('skill-c');
        expect(copied.length).toBe(3);

        // Verify SKILL.md content preserved
        const skillMd = fs.readFileSync(path.join(targetSkills, 'skill-a', 'SKILL.md'), 'utf8');
        expect(skillMd).toBe('# skill-a');
      } finally {
        cleanup(sourceRoot);
        cleanup(targetRoot);
      }
    });

    test('returns skipped when source does not exist', async () => {
      const targetRoot = createTempDir();
      const fakeSourceRoot = path.join(os.tmpdir(), 'nonexistent-source-' + Date.now());

      try {
        // Call the REAL function with a non-existent source
        const result = await copySkillFiles(targetRoot, fakeSourceRoot);

        expect(result.skipped).toBe(true);
        expect(result.count).toBe(0);
      } finally {
        cleanup(targetRoot);
      }
    });

    test('copy is idempotent — re-copy overwrites without corruption', async () => {
      const sourceRoot = createTempDir();
      const targetRoot = createTempDir();

      try {
        const skillsDir = path.join(sourceRoot, '.claude', 'skills', 'test-skill');
        fs.mkdirSync(skillsDir, { recursive: true });
        fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), '# v1', 'utf8');

        // First copy
        await copySkillFiles(targetRoot, sourceRoot);

        // Update source to v2
        fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), '# v2', 'utf8');

        // Second copy (idempotent overwrite)
        const result = await copySkillFiles(targetRoot, sourceRoot);

        expect(result.count).toBe(1);
        const content = fs.readFileSync(
          path.join(targetRoot, '.claude', 'skills', 'test-skill', 'SKILL.md'),
          'utf8'
        );
        expect(content).toBe('# v2');
      } finally {
        cleanup(sourceRoot);
        cleanup(targetRoot);
      }
    });
  });

  describe('copyExtraCommandFiles', () => {
    test('copies .md files recursively excluding AIOS/agents/ via real function', async () => {
      const sourceRoot = createTempDir();
      const targetRoot = createTempDir();

      try {
        const cmdDir = path.join(sourceRoot, '.claude', 'commands');

        // Create greet.md (root level)
        fs.mkdirSync(cmdDir, { recursive: true });
        fs.writeFileSync(path.join(cmdDir, 'greet.md'), '# Greet', 'utf8');

        // Create synapse/manager.md
        const synapseDir = path.join(cmdDir, 'synapse');
        fs.mkdirSync(synapseDir, { recursive: true });
        fs.writeFileSync(path.join(synapseDir, 'manager.md'), '# Manager', 'utf8');

        // Create synapse/tasks/add-rule.md
        const tasksDir = path.join(synapseDir, 'tasks');
        fs.mkdirSync(tasksDir, { recursive: true });
        fs.writeFileSync(path.join(tasksDir, 'add-rule.md'), '# Add Rule', 'utf8');

        // Create AIOS/agents/dev.md (should be EXCLUDED)
        const agentsDir = path.join(cmdDir, 'AIOS', 'agents');
        fs.mkdirSync(agentsDir, { recursive: true });
        fs.writeFileSync(path.join(agentsDir, 'dev.md'), '# Dev Agent', 'utf8');

        // Create AIOS/stories/story.md (should be INCLUDED)
        const storiesDir = path.join(cmdDir, 'AIOS', 'stories');
        fs.mkdirSync(storiesDir, { recursive: true });
        fs.writeFileSync(path.join(storiesDir, 'story.md'), '# Story', 'utf8');

        // Call the REAL exported function with _sourceRoot override
        const result = await copyExtraCommandFiles(targetRoot, sourceRoot);

        expect(result.count).toBe(4); // greet.md, manager.md, add-rule.md, story.md
        expect(result.skipped).toBe(false);

        // Verify extras copied
        const targetCmd = path.join(targetRoot, '.claude', 'commands');
        expect(fs.existsSync(path.join(targetCmd, 'greet.md'))).toBe(true);
        expect(fs.existsSync(path.join(targetCmd, 'synapse', 'manager.md'))).toBe(true);
        expect(fs.existsSync(path.join(targetCmd, 'synapse', 'tasks', 'add-rule.md'))).toBe(true);
        expect(fs.existsSync(path.join(targetCmd, 'AIOS', 'stories', 'story.md'))).toBe(true);

        // Verify AIOS/agents/ was excluded
        expect(fs.existsSync(path.join(targetCmd, 'AIOS', 'agents', 'dev.md'))).toBe(false);
      } finally {
        cleanup(sourceRoot);
        cleanup(targetRoot);
      }
    });
  });

  describe('createClaudeSettingsLocal — hooks registration', () => {
    test('registers ALL .cjs hooks in settings.local.json', async () => {
      const tmpDir = createTempDir();

      try {
        // Create hooks directory with 2 .cjs files
        const hooksDir = path.join(tmpDir, '.claude', 'hooks');
        fs.mkdirSync(hooksDir, { recursive: true });
        fs.writeFileSync(path.join(hooksDir, 'synapse-engine.cjs'), '// hook 1', 'utf8');
        fs.writeFileSync(path.join(hooksDir, 'precompact-session-digest.cjs'), '// hook 2', 'utf8');
        fs.writeFileSync(path.join(hooksDir, 'README.md'), '# Hooks', 'utf8');

        const result = await createClaudeSettingsLocal(tmpDir);

        expect(result).not.toBeNull();

        const settingsContent = fs.readFileSync(path.join(tmpDir, '.claude', 'settings.local.json'), 'utf8');
        const settings = JSON.parse(settingsContent);

        // Should have hooks.UserPromptSubmit with 2 entries
        expect(settings.hooks).toBeDefined();
        expect(settings.hooks.UserPromptSubmit).toBeDefined();
        expect(settings.hooks.UserPromptSubmit.length).toBe(2);

        // Both hooks registered
        const commands = settings.hooks.UserPromptSubmit.flatMap(entry =>
          entry.hooks.map(h => h.command)
        );
        expect(commands.some(c => c.includes('synapse-engine'))).toBe(true);
        expect(commands.some(c => c.includes('precompact-session-digest'))).toBe(true);
      } finally {
        cleanup(tmpDir);
      }
    });

    test('returns null when no hooks directory exists', async () => {
      const tmpDir = createTempDir();

      try {
        fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
        const result = await createClaudeSettingsLocal(tmpDir);
        expect(result).toBeNull();
      } finally {
        cleanup(tmpDir);
      }
    });

    test('does not duplicate hooks on re-run (idempotent)', async () => {
      const tmpDir = createTempDir();

      try {
        const hooksDir = path.join(tmpDir, '.claude', 'hooks');
        fs.mkdirSync(hooksDir, { recursive: true });
        fs.writeFileSync(path.join(hooksDir, 'synapse-engine.cjs'), '// hook', 'utf8');

        // Run twice
        await createClaudeSettingsLocal(tmpDir);
        await createClaudeSettingsLocal(tmpDir);

        const settingsContent = fs.readFileSync(path.join(tmpDir, '.claude', 'settings.local.json'), 'utf8');
        const settings = JSON.parse(settingsContent);

        // Should still have only 1 entry
        expect(settings.hooks.UserPromptSubmit.length).toBe(1);
      } finally {
        cleanup(tmpDir);
      }
    });

    test('preserves existing settings when merging hooks', async () => {
      const tmpDir = createTempDir();

      try {
        const hooksDir = path.join(tmpDir, '.claude', 'hooks');
        fs.mkdirSync(hooksDir, { recursive: true });
        fs.writeFileSync(path.join(hooksDir, 'synapse-engine.cjs'), '// hook', 'utf8');

        // Create existing settings
        const settingsPath = path.join(tmpDir, '.claude', 'settings.local.json');
        fs.writeFileSync(settingsPath, JSON.stringify({ customKey: 'preserved' }, null, 2), 'utf8');

        await createClaudeSettingsLocal(tmpDir);

        const settingsContent = fs.readFileSync(settingsPath, 'utf8');
        const settings = JSON.parse(settingsContent);

        expect(settings.customKey).toBe('preserved');
        expect(settings.hooks.UserPromptSubmit.length).toBe(1);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('generator failure graceful degradation', () => {
    test('generate-settings-json throws on missing config — install should catch', () => {
      const { generate } = require('../../../../../.aios-core/infrastructure/scripts/generate-settings-json');

      // Calling generate on a non-existent path should throw
      expect(() => generate('/nonexistent/path')).toThrow();
    });
  });
});
