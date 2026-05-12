/**
 * Integration tests for Wizard IDE Flow
 *
 * Story 1.4: IDE Selection
 * Tests complete flow from selection to config generation
 *
 * Synkra AIOX v2.1 supports 6 IDEs:
 * - Claude Code, Codex CLI, Gemini CLI, Cursor, GitHub Copilot, AntiGravity
 */

const fs = require('fs-extra');
const path = require('path');
const { generateIDEConfigs } = require('../../packages/installer/src/wizard/ide-config-generator');
const { getIDEConfig, getIDEKeys } = require('../../packages/installer/src/config/ide-configs');

describe('Wizard IDE Flow Integration', () => {
  const testDir = path.join(__dirname, '..', '..', '.test-temp-integration');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('Full flow: select -> generate -> verify', () => {
    it('should complete flow for single IDE (Cursor)', async () => {
      // Simulate wizard state after IDE selection
      const wizardState = {
        projectType: 'greenfield',
        projectName: 'test-project',
        selectedIDEs: ['cursor'],
      };

      // Generate configs
      const result = await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      // Verify result
      expect(result.success).toBe(true);
      // Now includes config file + agent files (16+ files)
      expect(result.files.length).toBeGreaterThanOrEqual(1);

      // Verify config file exists (now in .cursor/rules.md)
      const configPath = path.join(testDir, '.cursor', 'rules.md');
      expect(await fs.pathExists(configPath)).toBe(true);

      // Verify agent folder was created with agents
      const agentFolder = path.join(testDir, '.cursor', 'rules');
      expect(await fs.pathExists(agentFolder)).toBe(true);

      // Verify content has AIOX branding
      const content = await fs.readFile(configPath, 'utf8');
      expect(content).toContain('Synkra AIOX');
      expect(content).toContain('Development Rules');
    });

    it('should complete flow for multiple IDEs', async () => {
      const wizardState = {
        projectType: 'brownfield',
        projectName: 'multi-ide-project',
        selectedIDEs: ['cursor', 'gemini', 'github-copilot'],
      };

      const result = await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      expect(result.success).toBe(true);
      // 3 config files + agent files for each IDE
      expect(result.files.length).toBeGreaterThanOrEqual(3);

      // Verify all config files exist
      expect(await fs.pathExists(path.join(testDir, '.cursor', 'rules.md'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, '.gemini', 'rules.md'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, '.github', 'copilot-instructions.md'))).toBe(
        true,
      );

      // Verify agent folders were created
      expect(await fs.pathExists(path.join(testDir, '.cursor', 'rules'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, '.gemini', 'rules', 'AIOX', 'agents'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, '.github', 'agents'))).toBe(true);
    });

    it('should complete flow for all 6 IDEs', async () => {
      const wizardState = {
        projectType: 'greenfield',
        projectName: 'all-ides-project',
        selectedIDEs: getIDEKeys(),
      };

      const result = await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      expect(result.success).toBe(true);
      // 6 config files + agent files for each IDE
      expect(result.files.length).toBeGreaterThanOrEqual(6);

      // Verify all config files and agent folders based on IDE configuration
      for (const ideKey of getIDEKeys()) {
        const config = getIDEConfig(ideKey);
        const configPath = path.join(testDir, config.configFile);
        expect(await fs.pathExists(configPath)).toBe(true);

        // Verify agent folder exists
        const agentFolder = path.join(testDir, config.agentFolder);
        expect(await fs.pathExists(agentFolder)).toBe(true);
      }
    });
  });

  describe('Directory structure', () => {
    it('should create directories for IDEs that need them', async () => {
      const wizardState = {
        projectType: 'greenfield',
        projectName: 'dir-test',
        selectedIDEs: ['claude-code', 'cursor', 'github-copilot', 'antigravity'],
      };

      const result = await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      expect(result.success).toBe(true);

      // Verify directories created for IDEs that require them
      expect(await fs.pathExists(path.join(testDir, '.claude'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, '.cursor'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, '.github'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, '.antigravity'))).toBe(true);
    });

    it('should NOT create directories for IDEs that do not need them', async () => {
      const wizardState = {
        projectType: 'greenfield',
        projectName: 'no-dir-test',
        selectedIDEs: ['codex'], // Root file IDE
      };

      const result = await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      expect(result.success).toBe(true);

      // Codex should be a file at root, not directory
      const codexStat = await fs.stat(path.join(testDir, 'AGENTS.md'));
      expect(codexStat.isFile()).toBe(true);
    });
  });

  describe('Content and formatting', () => {
    it('should generate valid content from templates', async () => {
      const wizardState = {
        projectType: 'greenfield',
        projectName: 'content-test',
        selectedIDEs: ['cursor', 'gemini'],
      };

      const result = await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      expect(result.success).toBe(true);

      // Check Cursor content (now in .cursor/rules.md)
      const cursorContent = await fs.readFile(path.join(testDir, '.cursor', 'rules.md'), 'utf8');
      expect(cursorContent).toContain('Synkra AIOX');
      expect(cursorContent).toContain('Story-Driven Development');

      // Check Gemini content
      const geminiContent = await fs.readFile(path.join(testDir, '.gemini', 'rules.md'), 'utf8');
      expect(geminiContent).toContain('Synkra AIOX');
    });

    it('should generate Claude Code config as recommended', async () => {
      const wizardState = {
        projectType: 'greenfield',
        projectName: 'claude-test',
        selectedIDEs: ['claude-code'],
      };

      const result = await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      expect(result.success).toBe(true);

      const claudePath = path.join(testDir, '.claude', 'CLAUDE.md');
      expect(await fs.pathExists(claudePath)).toBe(true);

      const content = await fs.readFile(claudePath, 'utf8');
      expect(content).toContain('Synkra AIOX');
    });

    it('should generate Gemini settings and hooks for lifecycle integration', async () => {
      const wizardState = {
        projectType: 'greenfield',
        projectName: 'gemini-hooks-test',
        selectedIDEs: ['gemini'],
      };

      const result = await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      expect(result.success).toBe(true);
      expect(await fs.pathExists(path.join(testDir, '.gemini', 'settings.json'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, '.gemini', 'hooks', 'before-agent.js'))).toBe(
        true,
      );
      expect(await fs.pathExists(path.join(testDir, '.gemini', 'hooks', 'session-start.js'))).toBe(
        true,
      );
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle directory creation for nested configs', async () => {
      const wizardState = {
        projectType: 'greenfield',
        projectName: 'nested-test',
        selectedIDEs: ['github-copilot', 'antigravity'],
      };

      const result = await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      expect(result.success).toBe(true);

      // Verify directories created
      expect(await fs.pathExists(path.join(testDir, '.github'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, '.antigravity'))).toBe(true);
    });

    it('should handle all IDEs with text format', async () => {
      const wizardState = {
        projectType: 'greenfield',
        projectName: 'format-test',
        selectedIDEs: ['cursor', 'github-copilot', 'antigravity'],
      };

      const result = await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      expect(result.success).toBe(true);
      // 3 config files + agent files for each IDE
      expect(result.files.length).toBeGreaterThanOrEqual(3);

      // All formats should be text (markdown)
      const cursorContent = await fs.readFile(path.join(testDir, '.cursor', 'rules.md'), 'utf8');
      expect(typeof cursorContent).toBe('string');

      const copilotContent = await fs.readFile(
        path.join(testDir, '.github', 'copilot-instructions.md'),
        'utf8',
      );
      expect(typeof copilotContent).toBe('string');

      const antigravityContent = await fs.readFile(
        path.join(testDir, '.antigravity', 'rules.md'),
        'utf8',
      );
      expect(typeof antigravityContent).toBe('string');
    });
  });

  describe('Template content validation', () => {
    it('should generate config from template without errors', async () => {
      const wizardState = {
        projectType: 'brownfield',
        projectName: 'my-awesome-project',
        selectedIDEs: ['cursor'],
      };

      await generateIDEConfigs(wizardState.selectedIDEs, wizardState, {
        projectRoot: testDir,
      });

      const configPath = path.join(testDir, '.cursor', 'rules.md');
      const content = await fs.readFile(configPath, 'utf8');

      // Template should be generated with AIOX content
      expect(content).toContain('Synkra AIOX');
      expect(content).toContain('Development Rules');
      expect(content).toContain('Story-Driven Development');
      expect(content).not.toContain('{{'); // No uninterpolated variables
    });

    it('should handle default values when wizard state is minimal', async () => {
      const wizardState = {}; // No projectName or projectType

      const result = await generateIDEConfigs(['cursor'], wizardState, {
        projectRoot: testDir,
      });

      expect(result.success).toBe(true);

      const configPath = path.join(testDir, '.cursor', 'rules.md');
      const content = await fs.readFile(configPath, 'utf8');

      // Template should be generated without errors
      expect(content).toContain('Synkra AIOX');
      expect(content).toContain('Development Rules');
    });
  });
});
