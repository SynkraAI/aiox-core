'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  copySkillFiles,
  copyExtraCommandFiles,
  createClaudeSettingsLocal,
  HOOK_EVENT_MAP,
  DEFAULT_HOOK_CONFIG,
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

        // Create AIOS/stories/story.md (should be EXCLUDED — project-specific)
        const storiesDir = path.join(cmdDir, 'AIOS', 'stories');
        fs.mkdirSync(storiesDir, { recursive: true });
        fs.writeFileSync(path.join(storiesDir, 'story.md'), '# Story', 'utf8');

        // Create squad directory (should be EXCLUDED — private)
        const squadDir = path.join(cmdDir, 'cohort-squad');
        fs.mkdirSync(squadDir, { recursive: true });
        fs.writeFileSync(path.join(squadDir, 'manager.md'), '# Squad', 'utf8');

        // Call the REAL exported function with _sourceRoot override
        const result = await copyExtraCommandFiles(targetRoot, sourceRoot);

        expect(result.count).toBe(3); // greet.md, manager.md, add-rule.md
        expect(result.skipped).toBe(false);

        // Verify distributable entries copied
        const targetCmd = path.join(targetRoot, '.claude', 'commands');
        expect(fs.existsSync(path.join(targetCmd, 'greet.md'))).toBe(true);
        expect(fs.existsSync(path.join(targetCmd, 'synapse', 'manager.md'))).toBe(true);
        expect(fs.existsSync(path.join(targetCmd, 'synapse', 'tasks', 'add-rule.md'))).toBe(true);

        // Verify AIOS/agents/ was excluded (handled by copyAgentFiles)
        expect(fs.existsSync(path.join(targetCmd, 'AIOS', 'agents', 'dev.md'))).toBe(false);

        // Verify AIOS/stories/ was excluded (project-specific)
        expect(fs.existsSync(path.join(targetCmd, 'AIOS', 'stories', 'story.md'))).toBe(false);

        // Verify squad directories not copied (private)
        expect(fs.existsSync(path.join(targetCmd, 'cohort-squad'))).toBe(false);
      } finally {
        cleanup(sourceRoot);
        cleanup(targetRoot);
      }
    });
  });

  describe('HOOK_EVENT_MAP (Story MIS-3.1)', () => {
    test('maps synapse-engine.cjs to UserPromptSubmit', () => {
      const config = HOOK_EVENT_MAP['synapse-engine.cjs'];
      expect(config).toBeDefined();
      expect(config.event).toBe('UserPromptSubmit');
      expect(config.matcher).toBeNull();
      expect(config.timeout).toBe(10);
    });

    test('maps code-intel-pretool.cjs to PreToolUse with Write|Edit matcher', () => {
      const config = HOOK_EVENT_MAP['code-intel-pretool.cjs'];
      expect(config).toBeDefined();
      expect(config.event).toBe('PreToolUse');
      expect(config.matcher).toBe('Write|Edit');
      expect(config.timeout).toBe(10);
    });

    test('maps precompact-session-digest.cjs to PreCompact', () => {
      const config = HOOK_EVENT_MAP['precompact-session-digest.cjs'];
      expect(config).toBeDefined();
      expect(config.event).toBe('PreCompact');
      expect(config.matcher).toBeNull();
      expect(config.timeout).toBe(10);
    });

    test('covers all 3 known hooks', () => {
      const keys = Object.keys(HOOK_EVENT_MAP);
      expect(keys).toHaveLength(3);
      expect(keys).toContain('synapse-engine.cjs');
      expect(keys).toContain('code-intel-pretool.cjs');
      expect(keys).toContain('precompact-session-digest.cjs');
    });

    test('DEFAULT_HOOK_CONFIG falls back to UserPromptSubmit', () => {
      expect(DEFAULT_HOOK_CONFIG.event).toBe('UserPromptSubmit');
      expect(DEFAULT_HOOK_CONFIG.matcher).toBeNull();
      expect(DEFAULT_HOOK_CONFIG.timeout).toBe(10);
    });
  });

  describe('createClaudeSettingsLocal — hook event routing (Story MIS-3.1)', () => {
    test('registers hooks under correct events using HOOK_EVENT_MAP', async () => {
      const tmpDir = createTempDir();

      try {
        const hooksDir = path.join(tmpDir, '.claude', 'hooks');
        fs.mkdirSync(hooksDir, { recursive: true });
        fs.writeFileSync(path.join(hooksDir, 'synapse-engine.cjs'), '// hook 1', 'utf8');
        fs.writeFileSync(path.join(hooksDir, 'code-intel-pretool.cjs'), '// hook 2', 'utf8');
        fs.writeFileSync(path.join(hooksDir, 'precompact-session-digest.cjs'), '// hook 3', 'utf8');
        fs.writeFileSync(path.join(hooksDir, 'README.md'), '# Hooks', 'utf8');

        const result = await createClaudeSettingsLocal(tmpDir);
        expect(result).not.toBeNull();

        const settingsContent = fs.readFileSync(path.join(tmpDir, '.claude', 'settings.local.json'), 'utf8');
        const settings = JSON.parse(settingsContent);

        // synapse-engine → UserPromptSubmit
        expect(settings.hooks.UserPromptSubmit).toBeDefined();
        expect(settings.hooks.UserPromptSubmit.length).toBe(1);
        const upsCommands = settings.hooks.UserPromptSubmit.flatMap(e => e.hooks.map(h => h.command));
        expect(upsCommands.some(c => c.includes('synapse-engine'))).toBe(true);

        // code-intel-pretool → PreToolUse with matcher
        expect(settings.hooks.PreToolUse).toBeDefined();
        expect(settings.hooks.PreToolUse.length).toBe(1);
        expect(settings.hooks.PreToolUse[0].matcher).toBe('Write|Edit');
        const ptuCommands = settings.hooks.PreToolUse.flatMap(e => e.hooks.map(h => h.command));
        expect(ptuCommands.some(c => c.includes('code-intel-pretool'))).toBe(true);

        // precompact-session-digest → PreCompact
        expect(settings.hooks.PreCompact).toBeDefined();
        expect(settings.hooks.PreCompact.length).toBe(1);
        const pcCommands = settings.hooks.PreCompact.flatMap(e => e.hooks.map(h => h.command));
        expect(pcCommands.some(c => c.includes('precompact-session-digest'))).toBe(true);

        // PreCompact should NOT have a matcher
        expect(settings.hooks.PreCompact[0].matcher).toBeUndefined();
      } finally {
        cleanup(tmpDir);
      }
    });

    test('unknown hooks fall back to UserPromptSubmit (backwards compatible)', async () => {
      const tmpDir = createTempDir();

      try {
        const hooksDir = path.join(tmpDir, '.claude', 'hooks');
        fs.mkdirSync(hooksDir, { recursive: true });
        fs.writeFileSync(path.join(hooksDir, 'custom-future-hook.cjs'), '// future hook', 'utf8');

        await createClaudeSettingsLocal(tmpDir);

        const settingsContent = fs.readFileSync(path.join(tmpDir, '.claude', 'settings.local.json'), 'utf8');
        const settings = JSON.parse(settingsContent);

        // Unknown hook should fall back to UserPromptSubmit
        expect(settings.hooks.UserPromptSubmit).toBeDefined();
        expect(settings.hooks.UserPromptSubmit.length).toBe(1);
        const commands = settings.hooks.UserPromptSubmit.flatMap(e => e.hooks.map(h => h.command));
        expect(commands.some(c => c.includes('custom-future-hook'))).toBe(true);
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
        fs.writeFileSync(path.join(hooksDir, 'precompact-session-digest.cjs'), '// hook', 'utf8');

        // Run twice
        await createClaudeSettingsLocal(tmpDir);
        await createClaudeSettingsLocal(tmpDir);

        const settingsContent = fs.readFileSync(path.join(tmpDir, '.claude', 'settings.local.json'), 'utf8');
        const settings = JSON.parse(settingsContent);

        // Should still have only 1 entry per event
        expect(settings.hooks.UserPromptSubmit.length).toBe(1);
        expect(settings.hooks.PreCompact.length).toBe(1);
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

    test('synapse-engine regression: still registered as UserPromptSubmit after refactor', async () => {
      const tmpDir = createTempDir();

      try {
        const hooksDir = path.join(tmpDir, '.claude', 'hooks');
        fs.mkdirSync(hooksDir, { recursive: true });
        fs.writeFileSync(path.join(hooksDir, 'synapse-engine.cjs'), '// hook', 'utf8');

        await createClaudeSettingsLocal(tmpDir);

        const settingsContent = fs.readFileSync(path.join(tmpDir, '.claude', 'settings.local.json'), 'utf8');
        const settings = JSON.parse(settingsContent);

        expect(settings.hooks.UserPromptSubmit).toBeDefined();
        expect(settings.hooks.UserPromptSubmit.length).toBe(1);

        const commands = settings.hooks.UserPromptSubmit.flatMap(e => e.hooks.map(h => h.command));
        expect(commands.some(c => c.includes('synapse-engine'))).toBe(true);

        // No PreCompact or PreToolUse should exist for synapse
        expect(settings.hooks.PreCompact).toBeUndefined();
        expect(settings.hooks.PreToolUse).toBeUndefined();
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
