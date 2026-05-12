/**
 * Wizard Integration Tests
 *
 * Story 1.7: Dependency Installation Integration
 * Tests the full wizard flow including dependency installation
 */

const inquirer = require('inquirer');
const fse = require('fs-extra');
const { runWizard } = require('../../packages/installer/src/wizard/index');
const {
  installDependencies,
  detectPackageManager,
} = require('../../packages/installer/src/installer/dependency-installer');
const {
  configureEnvironment,
} = require('../../packages/installer/src/config/configure-environment');
const { generateIDEConfigs } = require('../../packages/installer/src/wizard/ide-config-generator');
const { installAioxCore, hasPackageJson } = require('../../packages/installer/src/installer/aiox-core-installer');

// Mock dependencies
jest.mock('inquirer');
jest.mock('fs-extra');
jest.mock('../../packages/installer/src/installer/dependency-installer');
jest.mock('../../packages/installer/src/config/configure-environment');
jest.mock('../../packages/installer/src/wizard/ide-config-generator');
jest.mock('../../packages/installer/src/installer/aiox-core-installer');
jest.mock('../../bin/modules/mcp-installer', () => ({
  installProjectMCPs: jest.fn().mockResolvedValue({
    success: true,
    installedMCPs: {},
    configPath: '.mcp.json',
    errors: [],
  }),
}));
jest.mock('../../packages/installer/src/wizard/validation', () => ({
  validateInstallation: jest.fn().mockResolvedValue({
    valid: true,
    errors: [],
    warnings: [],
  }),
  displayValidationReport: jest.fn().mockResolvedValue(),
  provideTroubleshooting: jest.fn().mockResolvedValue(),
}));
jest.mock('../../packages/installer/src/wizard/feedback', () => ({
  showWelcome: jest.fn(),
  showCompletion: jest.fn(),
  showCancellation: jest.fn(),
}));

describe('Wizard Integration - Story 1.7', () => {
  let consoleLogSpy, consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Default mocks for successful flow
    inquirer.prompt.mockResolvedValue({
      projectType: 'greenfield',
      selectedIDEs: ['vscode'],
    });

    generateIDEConfigs.mockResolvedValue({
      success: true,
      configs: [{ ide: 'vscode', path: '.vscode/settings.json' }],
    });

    configureEnvironment.mockResolvedValue({
      envCreated: true,
      envExampleCreated: true,
      coreConfigCreated: true,
      gitignoreUpdated: true,
      errors: [],
    });

    // Mock AIOX core installer
    installAioxCore.mockResolvedValue({
      success: true,
      installedFiles: ['agents/dev.md', 'tasks/create-story.yaml'],
      installedFolders: ['agents', 'tasks', 'workflows', 'templates'],
      errors: [],
    });

    // Mock hasPackageJson - default to true (brownfield project)
    hasPackageJson.mockResolvedValue(true);

    // Mock detectPackageManager
    detectPackageManager.mockReturnValue('npm');

    installDependencies.mockResolvedValue({
      success: true,
      packageManager: 'npm',
    });

    // Mock fs-extra for getExistingUserProfile() - Story 10.2
    // Default: no existing core-config.yaml (forces user profile prompt)
    fse.pathExists.mockResolvedValue(false);
    fse.existsSync.mockReturnValue(false);
    fse.ensureDir.mockResolvedValue();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Full Wizard Flow (AC Integration)', () => {
    it('should complete full wizard with dependency installation', async () => {
      const answers = await runWizard();

      expect(answers.projectType).toBe('greenfield');
      expect(answers.selectedIDEs).toContain('vscode');
      expect(answers.packageManager).toBe('npm'); // Auto-detected
      expect(answers.envConfigured).toBe(true);
      expect(answers.depsInstalled).toBe(true);
      expect(answers.depsResult.success).toBe(true);
    });

    it('should install AIOX core before IDE configs', async () => {
      await runWizard();

      // Verify AIOX core was installed
      expect(installAioxCore).toHaveBeenCalled();

      // Verify order: AIOX core before IDE configs
      const aioxCoreCallOrder = installAioxCore.mock.invocationCallOrder[0];
      const ideConfigCallOrder = generateIDEConfigs.mock.invocationCallOrder[0];

      expect(aioxCoreCallOrder).toBeLessThan(ideConfigCallOrder);
    });

    it('should install dependencies after env configuration', async () => {
      await runWizard();

      // Verify order of operations
      const envCallOrder = configureEnvironment.mock.invocationCallOrder[0];
      const depsCallOrder = installDependencies.mock.invocationCallOrder[0];

      expect(envCallOrder).toBeLessThan(depsCallOrder);
    });

    it('should use auto-detected package manager for installDependencies', async () => {
      detectPackageManager.mockReturnValue('yarn');

      await runWizard();

      expect(installDependencies).toHaveBeenCalledWith({
        packageManager: 'yarn',
        projectPath: process.cwd(),
      });
    });
  });

  describe('Package Manager Auto-Detection (AC1)', () => {
    it('should auto-detect npm', async () => {
      detectPackageManager.mockReturnValue('npm');

      const answers = await runWizard();
      expect(answers.packageManager).toBe('npm');
    });

    it('should auto-detect yarn', async () => {
      detectPackageManager.mockReturnValue('yarn');

      const answers = await runWizard();
      expect(answers.packageManager).toBe('yarn');
    });

    it('should auto-detect pnpm', async () => {
      detectPackageManager.mockReturnValue('pnpm');

      const answers = await runWizard();
      expect(answers.packageManager).toBe('pnpm');
    });

    it('should auto-detect bun', async () => {
      detectPackageManager.mockReturnValue('bun');

      const answers = await runWizard();
      expect(answers.packageManager).toBe('bun');
    });
  });

  describe('Greenfield Projects (No package.json)', () => {
    it('should skip dependency installation when no package.json exists', async () => {
      hasPackageJson.mockResolvedValue(false);

      const answers = await runWizard();

      expect(installDependencies).not.toHaveBeenCalled();
      expect(answers.depsInstalled).toBe(true);
      expect(answers.depsResult.skipped).toBe(true);
      expect(answers.depsResult.reason).toBe('no-package-json');
    });

    it('should still set packageManager when skipping dependencies', async () => {
      hasPackageJson.mockResolvedValue(false);
      detectPackageManager.mockReturnValue('pnpm');

      const answers = await runWizard();

      expect(answers.packageManager).toBe('pnpm');
    });
  });

  describe('User Profile Selection (Story 10.2)', () => {
    it('should include userProfile in wizard answers', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ language: 'en' })
        .mockResolvedValueOnce({ userProfile: 'advanced' })
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          selectedIDEs: ['vscode'],
          selectedTechPreset: 'none',
        });

      const answers = await runWizard();

      expect(answers.userProfile).toBeDefined();
      expect(['bob', 'advanced']).toContain(answers.userProfile);
    });

    it('should pass userProfile to configureEnvironment', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ language: 'en' })
        .mockResolvedValueOnce({ userProfile: 'bob' })
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          selectedIDEs: ['vscode'],
          selectedTechPreset: 'none',
        });

      await runWizard();

      expect(configureEnvironment).toHaveBeenCalledWith(
        expect.objectContaining({
          userProfile: 'bob',
        }),
      );
    });

    it('should use existing profile when core-config.yaml exists (idempotency)', async () => {
      // Mock existing core-config.yaml with user_profile
      fse.pathExists.mockResolvedValue(true);
      fse.readFile.mockResolvedValue('user_profile: bob\nmarkdownExploder: true');

      // Only 2 prompts needed: language + remaining questions (no user profile prompt)
      inquirer.prompt
        .mockResolvedValueOnce({ language: 'en' })
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          selectedIDEs: ['vscode'],
          selectedTechPreset: 'none',
        });

      const answers = await runWizard();

      // Should use existing profile without prompting
      expect(answers.userProfile).toBe('bob');
      // Console should show skipped message
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('bob'));
    });

    it('should default to advanced when user_profile is missing from existing config', async () => {
      // Mock existing core-config.yaml WITHOUT user_profile
      fse.pathExists.mockResolvedValue(true);
      fse.readFile.mockResolvedValue('markdownExploder: true\nproject:\n  type: GREENFIELD');

      // Need all 3 prompts since user_profile doesn't exist
      inquirer.prompt
        .mockResolvedValueOnce({ language: 'en' })
        .mockResolvedValueOnce({ userProfile: 'advanced' })
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          selectedIDEs: ['vscode'],
          selectedTechPreset: 'none',
        });

      const answers = await runWizard();

      expect(answers.userProfile).toBe('advanced');
    });

    it('should handle invalid user_profile in existing config gracefully', async () => {
      // Mock existing core-config.yaml with INVALID user_profile
      fse.pathExists.mockResolvedValue(true);
      fse.readFile.mockResolvedValue('user_profile: invalid_value\nmarkdownExploder: true');

      // Need all 3 prompts since user_profile is invalid
      inquirer.prompt
        .mockResolvedValueOnce({ language: 'en' })
        .mockResolvedValueOnce({ userProfile: 'advanced' })
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          selectedIDEs: ['vscode'],
          selectedTechPreset: 'none',
        });

      const answers = await runWizard();

      // Should prompt for new profile since existing is invalid
      expect(answers.userProfile).toBe('advanced');
    });
  });

  describe('Offline Mode (AC6)', () => {
    it('should handle offline mode gracefully', async () => {
      installDependencies.mockResolvedValue({
        success: true,
        offlineMode: true,
        packageManager: 'npm',
      });

      const answers = await runWizard();

      expect(answers.depsInstalled).toBe(true);
      expect(answers.depsResult.offlineMode).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('offline mode'));
    });
  });

  describe('Error Handling (AC4, AC5)', () => {
    it('should offer retry on installation failure', async () => {
      installDependencies
        .mockResolvedValueOnce({
          success: false,
          errorMessage: 'Network connection failed',
          solution: 'Check your internet connection',
          errorCategory: 'network',
        })
        .mockResolvedValueOnce({
          success: true,
          packageManager: 'npm',
        });

      // Mock prompt sequence: 1) language, 2) user profile (Story 10.2), 3) project type + IDEs + tech preset, 4) retryDeps
      inquirer.prompt
        .mockResolvedValueOnce({ language: 'en' })
        .mockResolvedValueOnce({ userProfile: 'advanced' }) // Story 10.2: User Profile
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          selectedIDEs: [],
          selectedTechPreset: 'none',
        })
        .mockResolvedValueOnce({
          retryDeps: true,
        });

      const answers = await runWizard();

      expect(installDependencies).toHaveBeenCalledTimes(2);
      expect(answers.depsInstalled).toBe(true);
    });

    it('should allow skipping installation on failure', async () => {
      installDependencies.mockResolvedValue({
        success: false,
        errorMessage: 'Network connection failed',
        solution: 'Check your internet connection',
      });

      // Mock prompt sequence: 1) language, 2) user profile (Story 10.2), 3) project type + IDEs + tech preset, 4) retryDeps
      inquirer.prompt
        .mockResolvedValueOnce({ language: 'en' })
        .mockResolvedValueOnce({ userProfile: 'advanced' }) // Story 10.2: User Profile
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          selectedIDEs: [],
          selectedTechPreset: 'none',
        })
        .mockResolvedValueOnce({
          retryDeps: false,
        });

      const answers = await runWizard();

      expect(answers.depsInstalled).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('manually'));
    });

    it('should display clear error messages', async () => {
      installDependencies.mockResolvedValue({
        success: false,
        errorMessage: 'Permission denied',
        solution: 'Try running with elevated permissions',
        errorCategory: 'permission',
      });

      inquirer.prompt
        .mockResolvedValueOnce({
          projectType: 'greenfield',
        })
        .mockResolvedValueOnce({
          retryDeps: false,
        });

      await runWizard();

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Permission denied'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('elevated permissions'));
    });
  });

  describe('Progress Feedback (AC3)', () => {
    it('should show installation progress messages', async () => {
      await runWizard();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Installing dependencies'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('installed'));
    });
  });

  describe('Wizard State Flow', () => {
    it('should maintain correct state through all steps', async () => {
      const answers = await runWizard();

      // Verify all story steps completed
      expect(answers.projectType).toBeDefined(); // Story 1.3
      expect(answers.selectedIDEs).toBeDefined(); // Story 1.4
      expect(answers.envConfigured).toBeDefined(); // Story 1.6
      expect(answers.packageManager).toBeDefined(); // Story 1.7 (auto-detected)
      expect(answers.depsInstalled).toBeDefined(); // Story 1.7
      expect(answers.aioxCoreInstalled).toBeDefined(); // Story 1.4 - AIOX core
    });

    it('should handle environment config failure gracefully', async () => {
      configureEnvironment.mockRejectedValue(new Error('Env config failed'));

      // Mock prompt sequence: 1) language, 2) user profile (Story 10.2), 3) project type + IDEs + tech preset, 4) continueWithoutEnv
      inquirer.prompt
        .mockResolvedValueOnce({ language: 'en' })
        .mockResolvedValueOnce({ userProfile: 'advanced' }) // Story 10.2: User Profile
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          selectedIDEs: [],
          selectedTechPreset: 'none',
        })
        .mockResolvedValueOnce({
          continueWithoutEnv: true,
        });

      const answers = await runWizard();

      expect(answers.envConfigured).toBe(false);
      // Should still proceed to dependency installation
      expect(installDependencies).toHaveBeenCalled();
    });

    it('should handle AIOX core installation failure gracefully', async () => {
      installAioxCore.mockRejectedValue(new Error('AIOX core installation failed'));

      const answers = await runWizard();

      expect(answers.aioxCoreInstalled).toBe(false);
      // Should still proceed to other steps
      expect(configureEnvironment).toHaveBeenCalled();
    });
  });
});
