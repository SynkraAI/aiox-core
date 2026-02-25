/**
 * AIOS Interactive Wizard - Main Entry Point
 *
 * Story 1.2: Interactive Wizard Foundation
 * Provides core wizard functionality with visual feedback and navigation
 *
 * @module wizard
 */

const inquirer = require('inquirer');
const path = require('path');
const fse = require('fs-extra');
const { execSync } = require('child_process');
const { colors } = require('../utils/aios-colors');
const {
  getLanguageQuestion,
  getUserProfileQuestion,
  getProjectTypeQuestion,
  getIDEQuestions,
  getTechPresetQuestion,
} = require('./questions');
const { setLanguage, t } = require('./i18n');
const yaml = require('js-yaml');
const { showWelcome, showCompletion, showCancellation } = require('./feedback');
const { generateIDEConfigs, showSuccessSummary, copySkillFiles, copyExtraCommandFiles } = require('./ide-config-generator');
const {
  configureEnvironment,
} = require('../config/configure-environment');
const {
  installDependencies,
} = require('../installer/dependency-installer');
const { commandSync, commandValidate } = require('../../../../.aios-core/infrastructure/scripts/ide-sync/index');
const {
  installAiosCore,
  hasPackageJson,
} = require('../installer/aios-core-installer');
const {
  validateInstallation,
  displayValidationReport,
  provideTroubleshooting,
} = require('./validation');
const {
  installLLMRouting,
  isLLMRoutingInstalled,
} = require('../../../../.aios-core/infrastructure/scripts/llm-routing/install-llm-routing');

// DISABLED: Legacy installation block superseded by squads flow (OSR-8)
// /**
//  * Generate AntiGravity workflow content for squad agents
//  * @param {string} agentName - Agent name (e.g., 'data-collector')
//  * @param {string} packName - Starter squad name (e.g., 'etl')
//  * @returns {string} Workflow file content
//  */
// function generateExpansionPackWorkflow(agentName, packName) {
//   const displayName = agentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
//
//   return `---
// description: Ativa o agente ${displayName} (${packName})
// ---
//
// # Ativação do Agente ${displayName}
//
// **Squad:** ${packName}
//
// **INSTRUÇÕES CRÍTICAS PARA O ANTIGRAVITY:**
//
// 1. Leia COMPLETAMENTE o arquivo \`.antigravity/agents/${packName}/${agentName}.md\`
// 2. Siga EXATAMENTE as \`activation-instructions\` definidas no bloco YAML do agente
// 3. Adote a persona conforme definido no agente
// 4. Execute a saudação conforme \`greeting_levels\` definido no agente
// 5. **MANTENHA esta persona até receber o comando \`*exit\`**
// 6. Responda aos comandos com prefixo \`*\` conforme definido no agente
// 7. Siga as regras globais do projeto em \`.antigravity/rules.md\`
//
// **Comandos disponíveis:** Use \`*help\` para ver todos os comandos do agente.
// `;
// }

/**
 * Check for existing user_profile in core-config.yaml (Story 10.2 - Idempotency)
 * Returns the existing profile if found, null otherwise
 *
 * @param {string} targetDir - Target directory to check
 * @returns {Promise<string|null>} Existing user profile or null
 */
async function getExistingUserProfile(targetDir = process.cwd()) {
  const coreConfigPath = path.join(targetDir, '.aios-core', 'core-config.yaml');

  try {
    if (await fse.pathExists(coreConfigPath)) {
      const content = await fse.readFile(coreConfigPath, 'utf8');
      const config = yaml.load(content);

      if (config && config.user_profile) {
        // Validate the value
        const validProfiles = ['bob', 'advanced'];
        const normalizedProfile = String(config.user_profile).toLowerCase().trim();

        if (validProfiles.includes(normalizedProfile)) {
          return normalizedProfile;
        }
      }
    }
  } catch {
    // Config doesn't exist or is invalid - will ask for profile
  }

  return null;
}

/**
 * Map wizard language code to Claude Code settings.json language name (Story ACT-12)
 * Claude Code uses full language names, not ISO codes.
 */
const LANGUAGE_MAP = {
  en: 'english',
  pt: 'portuguese',
  es: 'spanish',
};

/**
 * Write language preference to Claude Code's native settings.json (Story ACT-12)
 * Replaces the old approach of storing language in core-config.yaml.
 * Claude Code v4.0.4+ natively supports a `language` field in settings.json
 * that is automatically injected into the system prompt.
 *
 * @param {string} language - Language code from wizard (en|pt|es)
 * @param {string} [projectDir] - Project directory (default: process.cwd())
 * @returns {Promise<boolean>} true if written successfully
 */
async function writeClaudeSettings(language, projectDir = process.cwd()) {
  const claudeDir = path.join(projectDir, '.claude');
  const settingsPath = path.join(claudeDir, 'settings.json');

  try {
    await fse.ensureDir(claudeDir);

    let settings = {};
    if (await fse.pathExists(settingsPath)) {
      const content = await fse.readFile(settingsPath, 'utf8');
      settings = JSON.parse(content);
    }

    const claudeLanguage = LANGUAGE_MAP[language] || language;
    settings.language = claudeLanguage;

    await fse.writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
    return true;
  } catch {
    // Non-blocking: language is a preference, not critical
    return false;
  }
}

/**
 * Get existing language from Claude Code settings.json (Story ACT-12 - Idempotency)
 * Returns the existing language code if found, null otherwise.
 *
 * @param {string} [projectDir] - Project directory to check
 * @returns {Promise<string|null>} Existing language code or null
 */
async function getExistingLanguage(projectDir = process.cwd()) {
  const settingsPath = path.join(projectDir, '.claude', 'settings.json');

  try {
    if (await fse.pathExists(settingsPath)) {
      const content = await fse.readFile(settingsPath, 'utf8');
      const settings = JSON.parse(content);

      if (settings && settings.language) {
        // Reverse map: Claude Code language name → wizard code
        const reverseMap = Object.fromEntries(
          Object.entries(LANGUAGE_MAP).map(([k, v]) => [v, k]),
        );
        const langValue = String(settings.language).toLowerCase().trim();
        return reverseMap[langValue] || null;
      }
    }
  } catch {
    // Settings don't exist or invalid JSON
  }

  return null;
}

/**
 * Handle Ctrl+C gracefully
 */
let cancellationRequested = false;
let sigintHandlerAdded = false;

function setupCancellationHandler() {
  // Prevent adding multiple listeners (MaxListeners warning fix)
  if (sigintHandlerAdded) {
    return;
  }

  // Increase limit to prevent warning during testing
  process.setMaxListeners(15);

  const handleSigint = async () => {
    if (cancellationRequested) {
      // Second Ctrl+C - force exit
      console.log('\nForce exit');
      process.exit(0);
    }

    cancellationRequested = true;

    console.log('\n');
    const { t: translate } = require('./i18n');
    const { confirmCancel } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmCancel',
        message: translate('cancelConfirm'),
        default: false,
      },
    ]);

    if (confirmCancel) {
      showCancellation();
      process.exit(0);
    } else {
      cancellationRequested = false;
      console.log(translate('continuing') + '\n');
      // Note: inquirer will resume automatically
    }
  };

  process.on('SIGINT', handleSigint);
  sigintHandlerAdded = true;
}

/**
 * Main wizard execution function
 *
 * @returns {Promise<Object>} Wizard answers object
 *
 * @example
 * const { runWizard } = require('./src/wizard');
 * const answers = await runWizard();
 * console.log(answers.projectType); // 'greenfield' or 'brownfield'
 */
async function runWizard(options = {}) {
  try {
    // Setup graceful cancellation
    setupCancellationHandler();

    // Show welcome message with AIOS branding
    if (!options.quiet) {
      showWelcome();
    }

    // Start i18n with default or detected language
    setLanguage(options.language || 'en');

    let answers = {};

    if (options.quiet) {
      // Quiet mode: Skip all prompts, use defaults
      // Story 10.2: Check for existing user_profile (idempotency)
      // Story ACT-12: Language delegated to Claude Code settings.json
      const existingProfile = await getExistingUserProfile();
      const existingLang = await getExistingLanguage();
      answers = {
        language: options.language || existingLang || 'en',
        userProfile: options.userProfile || existingProfile || 'advanced', // Story 10.2
        projectType: options.projectType || 'brownfield', // Default to brownfield for safety
        selectedIDEs: options.ide ? [options.ide] : [],   // Support single IDE flag if added later
        selectedTechPreset: 'none',
        ...options, // Merge any other options
      };
    } else {
      // Interactive mode
      // Phase 1: Language selection (must be first to apply i18n)
      // Story ACT-12: Check idempotency via Claude Code settings.json
      let languageAnswer;
      const existingLanguage = await getExistingLanguage();

      if (existingLanguage) {
        // Idempotent: Use existing language, don't re-ask
        console.log(`\n✓ ${t('languageSkipped') || 'Language already configured'}: ${existingLanguage}\n`);
        languageAnswer = { language: existingLanguage };
      } else {
        languageAnswer = await inquirer.prompt([getLanguageQuestion()]);
      }
      setLanguage(languageAnswer.language);

      // Phase 1.5: User Profile selection (Story 10.2 - Epic 10)
      // Check for idempotency - if user_profile already exists, skip question
      let userProfileAnswer = {};
      const existingProfile = await getExistingUserProfile();

      if (existingProfile) {
        // Idempotent: Use existing profile, don't re-ask
        console.log(`\n✓ ${t('userProfileSkipped')}: ${existingProfile}\n`);
        userProfileAnswer = { userProfile: existingProfile };
      } else {
        // New installation: Ask for user profile
        userProfileAnswer = await inquirer.prompt([getUserProfileQuestion()]);
      }

      // Phase 2: Build remaining questions with i18n applied
      const remainingQuestions = [
        getProjectTypeQuestion(),
        ...getIDEQuestions(),
        ...getTechPresetQuestion(),
      ];

      // Performance tracking (AC: < 100ms per question)
      const startTime = Date.now();

      // Run wizard with remaining questions
      const remainingAnswers = await inquirer.prompt(remainingQuestions);

      // Merge all answers (including user profile from Story 10.2)
      answers = { ...languageAnswer, ...userProfileAnswer, ...remainingAnswers };

      // Log performance metrics
      const duration = Date.now() - startTime;
      const totalQuestions = remainingQuestions.length + 2; // +1 for language, +1 for user profile
      const avgTimePerQuestion = totalQuestions > 0 ? duration / totalQuestions : 0;

      if (avgTimePerQuestion > 100) {
        console.warn(
          `Warning: Average question response time (${avgTimePerQuestion.toFixed(0)}ms) exceeds 100ms target`,
        );
      }
    }

    // Story 1.4: Install AIOS core framework (agents, tasks, workflows, templates)
    console.log('\n📦 Installing AIOS core framework...');
    let aiosCoreResult = null;
    try {
      aiosCoreResult = await installAiosCore({
        targetDir: process.cwd(),
        onProgress: (_status) => {
          // Silent progress - spinner handles feedback
        },
      });

      if (aiosCoreResult.success) {
        console.log(`✅ AIOS core installed (${aiosCoreResult.installedFolders.length} folders)`);
        console.log(
          `   - Agents: ${aiosCoreResult.installedFolders.includes('agents') ? '✓' : '⨉'}`,
        );
        console.log(`   - Tasks: ${aiosCoreResult.installedFolders.includes('tasks') ? '✓' : '⨉'}`);
        console.log(
          `   - Workflows: ${aiosCoreResult.installedFolders.includes('workflows') ? '✓' : '⨉'}`,
        );
        console.log(
          `   - Templates: ${aiosCoreResult.installedFolders.includes('templates') ? '✓' : '⨉'}`,
        );
      }
      answers.aiosCoreInstalled = true;
      answers.aiosCoreResult = aiosCoreResult;
    } catch (error) {
      console.error('\n⚠️  AIOS core installation failed:', error.message);
      answers.aiosCoreInstalled = false;
    }

    // Install Tech Preset if selected
    if (answers.selectedTechPreset && answers.selectedTechPreset !== 'none') {
      console.log('\n📐 Configuring Tech Preset...');

      try {
        // Find tech-presets source directory
        const possiblePresetDirs = [
          path.join(__dirname, '..', '..', '.aios-core', 'data', 'tech-presets'),
          path.join(process.cwd(), '.aios-core', 'data', 'tech-presets'),
        ];

        let sourcePresetDir = null;
        for (const dir of possiblePresetDirs) {
          if (fse.existsSync(dir)) {
            sourcePresetDir = dir;
            break;
          }
        }

        if (sourcePresetDir) {
          const presetFile = path.join(sourcePresetDir, `${answers.selectedTechPreset}.md`);

          if (fse.existsSync(presetFile)) {
            // Copy preset to project's .aios-core/data/tech-presets/
            const targetPresetDir = path.join(process.cwd(), '.aios-core', 'data', 'tech-presets');
            await fse.ensureDir(targetPresetDir);

            // BUG-5 fix (INS-1): Guard against source === dest (e.g., running inside aios-core repo)
            const targetPresetFile = path.join(targetPresetDir, `${answers.selectedTechPreset}.md`);
            const sourceResolved = path.resolve(presetFile);
            const targetResolved = path.resolve(targetPresetFile);

            if (sourceResolved === targetResolved) {
              console.log('   ℹ️  Tech preset already in place (framework-dev mode)');
            } else {
              // Copy the selected preset
              await fse.copy(presetFile, targetPresetFile);

              // Copy the template too
              const templateFile = path.join(sourcePresetDir, '_template.md');
              if (fse.existsSync(templateFile)) {
                const targetTemplate = path.join(targetPresetDir, '_template.md');
                if (path.resolve(templateFile) !== path.resolve(targetTemplate)) {
                  await fse.copy(templateFile, targetTemplate);
                }
              }

              // Update technical-preferences.md to mark the selected preset
              const techPrefsFile = path.join(
                process.cwd(),
                '.aios-core',
                'data',
                'technical-preferences.md',
              );
              const techPrefsSource = path.join(sourcePresetDir, '..', 'technical-preferences.md');

              if (fse.existsSync(techPrefsSource)) {
                const techPrefsSourceResolved = path.resolve(techPrefsSource);
                const techPrefsTargetResolved = path.resolve(techPrefsFile);

                if (techPrefsSourceResolved !== techPrefsTargetResolved) {
                  // Prefer existing target file to preserve user customizations
                  const baseFile = fse.existsSync(techPrefsFile) ? techPrefsFile : techPrefsSource;
                  let techPrefsContent = await fse.readFile(baseFile, 'utf8');

                  // Add active preset marker only if not already present
                  const activePresetSection = `\n## Active Preset\n\n**Selected:** \`${answers.selectedTechPreset}\`\n\nThis preset was selected during installation. The @architect and @dev agents will use these patterns by default.\n`;

                  if (!techPrefsContent.includes('## Active Preset')) {
                    // Insert after the first heading
                    techPrefsContent = techPrefsContent.replace(
                      '# User-Defined Preferred Patterns and Preferences',
                      '# User-Defined Preferred Patterns and Preferences' + activePresetSection,
                    );
                    await fse.writeFile(techPrefsFile, techPrefsContent, 'utf8');
                  }
                }
              }
            }

            console.log(`   ✅ Tech Preset: ${answers.selectedTechPreset}`);
            console.log(
              `   📁 Location: .aios-core/data/tech-presets/${answers.selectedTechPreset}.md`,
            );
            answers.techPresetInstalled = true;
            answers.techPresetResult = { preset: answers.selectedTechPreset, success: true };
          } else {
            console.log(`   ⚠️  Preset file not found: ${answers.selectedTechPreset}`);
            answers.techPresetInstalled = false;
          }
        } else {
          console.log('   ⚠️  Tech presets directory not found');
          answers.techPresetInstalled = false;
        }
      } catch (error) {
        console.error(`   ⚠️  Tech Preset error: ${error.message}`);
        answers.techPresetInstalled = false;
      }
    } else {
      answers.techPresetInstalled = false;
      answers.techPresetResult = { preset: 'none', success: true };
    }

    // Legacy squad installation path removed; unified squads flow is now the only supported path.

    // Story 1.4: Generate IDE configs if IDEs were selected
    let ideConfigResult = null;
    if (answers.selectedIDEs && answers.selectedIDEs.length > 0) {
      // Pass merge options from CLI to IDE config generator (Story 9.4)
      const ideOptions = {
        ...answers,
        forceMerge: options.forceMerge,
        noMerge: options.noMerge,
      };
      ideConfigResult = await generateIDEConfigs(answers.selectedIDEs, ideOptions);

      if (ideConfigResult.success) {
        showSuccessSummary(ideConfigResult);
      } else {
        console.error('\n⚠️  Some IDE configurations could not be created:');
        if (ideConfigResult.errors) {
          ideConfigResult.errors.forEach((err) => {
            console.error(`  - ${err.ide || 'Unknown'}: ${err.error}`);
          });
        }
      }

      // Legacy per-squad IDE copy path removed; sync pipeline handles IDE propagation.
    }

    // Story INS-4.3: Wire settings.json boundary generator after .aios-core/ copy
    console.log('\n🔒 Generating boundary rules...');
    try {
      const settingsGenerator = require('../../../../.aios-core/infrastructure/scripts/generate-settings-json');
      settingsGenerator.generate(process.cwd());
      const settingsContent = await fse.readFile(path.join(process.cwd(), '.claude', 'settings.json'), 'utf8').catch(() => '{}');
      const settingsParsed = JSON.parse(settingsContent);
      const denyCount = (settingsParsed.permissions && settingsParsed.permissions.deny) ? settingsParsed.permissions.deny.length : 0;
      console.log(`✅ settings.json: generated (${denyCount} deny rules)`);
      answers.settingsGenerated = true;
      answers.settingsDenyCount = denyCount;
    } catch (error) {
      console.warn(`⚠️  settings.json generation failed: ${error.message} — run 'aios doctor --fix' post-install`);
      answers.settingsGenerated = false;
    }

    // Story INS-4.3: Copy skills (Gap #11)
    console.log('\n📚 Copying skills...');
    try {
      const skillsResult = await copySkillFiles(process.cwd());
      if (skillsResult.skipped) {
        console.log('   ℹ️  Skills: source not found (skipped)');
      } else {
        console.log(`✅ Skills: ${skillsResult.count} copied`);
      }
      answers.skillsCopied = skillsResult.count;
      answers.skillsSkipped = skillsResult.skipped;
    } catch (error) {
      console.warn(`⚠️  Skills copy failed: ${error.message}`);
      answers.skillsCopied = 0;
    }

    // Story INS-4.3: Copy extra commands (Gap #12)
    console.log('\n📋 Copying extra commands...');
    try {
      const commandsResult = await copyExtraCommandFiles(process.cwd());
      if (commandsResult.skipped) {
        console.log('   ℹ️  Extra commands: source not found (skipped)');
      } else {
        console.log(`✅ Commands: ${commandsResult.count} extras copied`);
      }
      answers.extraCommandsCopied = commandsResult.count;
      answers.extraCommandsSkipped = commandsResult.skipped;
    } catch (error) {
      console.warn(`⚠️  Extra commands copy failed: ${error.message}`);
      answers.extraCommandsCopied = 0;
    }

    // Story INS-4.5: IDE Sync — transform agents/skills/commands for each configured IDE
    console.log('\n🔄 Running IDE sync...');
    const targetProjectRoot = process.cwd();
    const savedCwd = process.cwd();
    try {
      process.chdir(targetProjectRoot);
      await commandSync({ quiet: true });
      answers.ideSyncStatus = 'synced';
      console.log('✅ IDE sync: synced');

      // Validate sync output (commandValidate does not support quiet — suppress its console output)
      const _origLog = console.log;
      console.log = () => {};
      try {
        await commandValidate({ quiet: true });
        answers.ideSyncValidation = 'pass';
      } catch (validateError) {
        answers.ideSyncValidation = 'drift';
      } finally {
        console.log = _origLog;
      }
      if (answers.ideSyncValidation === 'drift') {
        console.warn('⚠️  IDE sync validation: drift detected — run \'aios doctor --fix\' post-install');
      }
    } catch (syncError) {
      console.warn(`⚠️  IDE sync failed: ${syncError.message} — run 'aios doctor --fix' post-install`);
      answers.ideSyncStatus = 'failed';
      answers.ideSyncValidation = 'skipped';
    } finally {
      process.chdir(savedCwd);
    }

    // Story INS-4.6: Entity Registry Bootstrap — populate entity-registry.yaml on install
    // Story INS-4.12: Fix module resolution + bootstrap timing
    // Bootstrap runs AFTER .aios-core deps are installed (aios-core-installer.js:324-345)
    // NODE_PATH ensures spawned scripts can resolve packages from .aios-core/node_modules/
    console.log('\n📇 Bootstrapping entity registry...');
    try {
      const registryScript = path.join(process.cwd(), '.aios-core', 'development', 'scripts', 'populate-entity-registry.js');
      if (fse.existsSync(registryScript)) {
        // INS-4.12 AC3: Guard — skip bootstrap if .aios-core deps are not installed
        const aiosCoreNodeModules = path.join(process.cwd(), '.aios-core', 'node_modules');
        if (!fse.existsSync(aiosCoreNodeModules)) {
          console.warn('⚠️  .aios-core/node_modules/ not found — skipping entity registry bootstrap');
          console.warn('   Run: cd .aios-core && npm install --production');
          answers.entityRegistryStatus = 'skipped-no-deps';
        } else {
        // INS-4.12 AC2: Set NODE_PATH so spawned scripts resolve deps from .aios-core/node_modules/
          const parentNodeModules = path.join(process.cwd(), 'node_modules');
          const nodePath = [aiosCoreNodeModules, parentNodeModules].join(path.delimiter);
          const startMs = Date.now();
          execSync(`node "${registryScript}"`, {
            cwd: process.cwd(),
            encoding: 'utf8',
            timeout: 30000,
            stdio: 'pipe',
            env: { ...process.env, NODE_PATH: nodePath },
          });
          const elapsedMs = Date.now() - startMs;

          // Read entity count from generated registry
          const registryPath = path.join(process.cwd(), '.aios-core', 'data', 'entity-registry.yaml');
          let entityCount = 0;
          if (fse.existsSync(registryPath)) {
            const registryContent = fse.readFileSync(registryPath, 'utf8');
            const countMatch = registryContent.match(/entityCount:\s*(\d+)/);
            entityCount = countMatch ? parseInt(countMatch[1], 10) : 0;
          }

          console.log(`✅ Entity registry: populated (${entityCount} entities, ${(elapsedMs / 1000).toFixed(1)}s)`);
          answers.entityRegistryStatus = 'populated';
          answers.entityRegistryCount = entityCount;
          answers.entityRegistryMs = elapsedMs;
        } // end else (deps exist)
      } else {
        console.log('   ℹ️  Entity registry script not found (skipped)');
        answers.entityRegistryStatus = 'skipped';
      }
    } catch (error) {
      console.warn(`⚠️  Entity registry bootstrap failed: ${error.message} — run 'aios doctor' post-install`);
      answers.entityRegistryStatus = 'failed';
    }

    // Story 1.6: Environment Configuration
    console.log('\n📝 Configuring environment...');

    try {
      const envResult = await configureEnvironment({
        targetDir: process.cwd(),
        projectType: answers.projectType || 'greenfield',
        selectedIDEs: answers.selectedIDEs || [],
        mcpServers: answers.mcpServers || [],
        userProfile: answers.userProfile || 'advanced', // Story 10.2: User Profile
        skipPrompts: options.quiet || false, // Skip prompts in quiet mode
        forceMerge: options.forceMerge, // Story 9.4: Smart Merge support
        noMerge: options.noMerge, // Story 9.4: Smart Merge support
      });

      // Story ACT-12: Write language to Claude Code settings.json
      if (answers.language) {
        const langWritten = await writeClaudeSettings(answers.language);
        if (langWritten) {
          console.log('  - Language written to .claude/settings.json');
        } else {
          console.warn('  - Failed to write language to .claude/settings.json');
        }
      }

      if (envResult.envCreated && envResult.coreConfigCreated) {
        console.log('\n✅ Environment configuration complete!');
        console.log('  - .env file created');
        console.log('  - .env.example file created');
        console.log('  - .aios-core/core-config.yaml created');
        if (envResult.gitignoreUpdated) {
          console.log('  - .gitignore updated');
        }
      }

      // Store env config result for downstream stories
      answers.envConfigured = true;
      answers.envResult = envResult;
    } catch (error) {
      console.error('\n⚠️  Environment configuration failed:');
      console.error(`  ${error.message}`);

      // Ask user if they want to continue without env config
      const { continueWithoutEnv } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueWithoutEnv',
          message: 'Continue installation without environment configuration?',
          default: false,
        },
      ]);

      if (!continueWithoutEnv) {
        throw new Error('Installation cancelled - environment configuration required');
      }

      answers.envConfigured = false;
      console.log('\n⚠️  Continuing without environment configuration...');
    }

    // Story 1.7: Dependency Installation
    // Check if package.json exists first (greenfield projects won't have one)
    const { detectPackageManager } = require('../installer/dependency-installer');
    const projectPath = process.cwd();
    const packageJsonExists = await hasPackageJson(projectPath);

    if (!packageJsonExists) {
      // Greenfield project - no package.json, skip dependency installation
      console.log('\n📦 Dependency installation...');
      console.log('   ℹ️  No package.json found (greenfield project)');
      console.log('   💡 Dependencies will be installed when you add a package.json');
      answers.depsInstalled = true; // Mark as success since there's nothing to install
      answers.depsResult = { success: true, skipped: true, reason: 'no-package-json' };
      answers.packageManager = detectPackageManager();
    } else {
      // Brownfield project or existing project - has package.json
      console.log('\n📦 Installing dependencies...');

      // Auto-detect package manager (no longer asked as question)
      const detectedPM = detectPackageManager();
      answers.packageManager = detectedPM;

      try {
        const depsResult = await installDependencies({
          packageManager: detectedPM,
          projectPath: projectPath,
        });

        if (depsResult.success) {
          if (depsResult.offlineMode) {
            console.log('✅ Using existing dependencies (offline mode)');
          } else {
            console.log(`✅ Dependencies installed with ${depsResult.packageManager}!`);
          }
          answers.depsInstalled = true;
          answers.depsResult = depsResult;
        } else {
          console.error('\n⚠️  Dependency installation failed:');
          console.error(`  ${depsResult.errorMessage}`);
          console.error(`  Solution: ${depsResult.solution}`);

          // Ask user if they want to retry
          const { retryDeps } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'retryDeps',
              message: 'Retry dependency installation?',
              default: true,
            },
          ]);

          if (retryDeps) {
            // Recursive retry with exponential backoff (built into installDependencies)
            const retryResult = await installDependencies({
              packageManager: answers.packageManager,
              projectPath: projectPath,
            });

            if (retryResult.success) {
              console.log(`\n✅ Dependencies installed with ${retryResult.packageManager}!`);
              answers.depsInstalled = true;
              answers.depsResult = retryResult;
            } else {
              console.log(
                '\n⚠️  Installation still failed. You can run `npm install` manually later.',
              );
              answers.depsInstalled = false;
              answers.depsResult = retryResult;
            }
          } else {
            console.log('\n⚠️  Skipping dependency installation. Run manually with `npm install`.');
            answers.depsInstalled = false;
            answers.depsResult = depsResult;
          }
        }
      } catch (error) {
        console.error('\n⚠️  Dependency installation error:', error.message);
        answers.depsInstalled = false;
      }
    }

    // DISABLED: MCPs are advanced config that can confuse beginners
    // TODO: Remove entirely in future version - each project has unique MCP needs
    // Story 1.5/1.8: MCP Installation
    // if (answers.selectedMCPs && answers.selectedMCPs.length > 0) {
    //   console.log('\n🔌 Installing MCPs...');
    //
    //   try {
    //     const mcpResult = await installProjectMCPs({
    //       selectedMCPs: answers.selectedMCPs,
    //       projectPath: process.cwd(),
    //       apiKeys: answers.exaApiKey ? { EXA_API_KEY: answers.exaApiKey } : {},
    //       onProgress: (status) => {
    //         if (status.mcp) {
    //           console.log(`  [${status.mcp}] ${status.message}`);
    //         } else {
    //           console.log(`  ${status.message}`);
    //         }
    //       },
    //     });
    //
    //     if (mcpResult.success) {
    //       const successCount = Object.values(mcpResult.installedMCPs).filter(r => r.status === 'success').length;
    //       console.log(`\n✅ MCPs installed successfully! (${successCount}/${answers.selectedMCPs.length})`);
    //       console.log(`   Configuration: ${mcpResult.configPath}`);
    //     } else {
    //       console.error('\n⚠️  Some MCPs failed to install:');
    //       mcpResult.errors.forEach(err => console.error(`  - ${err}`));
    //       console.log('\n💡 Check .aios/install-errors.log for details');
    //     }
    //
    //     // Store MCP result for validation
    //     answers.mcpsInstalled = mcpResult.success;
    //     answers.mcpResult = mcpResult;
    //
    //   } catch (error) {
    //     console.error('\n⚠️  MCP installation error:', error.message);
    //     answers.mcpsInstalled = false;
    //   }
    // }

    // Story 6.7: LLM Routing Installation
    console.log('\nInstalling LLM Routing commands...');
    try {
      // Check if already installed
      if (isLLMRoutingInstalled()) {
        console.log('   ℹ️  LLM Routing already installed');
        answers.llmRoutingInstalled = true;
        answers.llmRoutingResult = { success: true, alreadyInstalled: true };
      } else {
        const llmResult = installLLMRouting({
          projectRoot: process.cwd(),
          onProgress: (msg) => console.log(`   ${msg}`),
          onError: (msg) => console.error(`   ${msg}`),
        });

        if (llmResult.success) {
          console.log('\n✅ LLM Routing installed!');
          console.log('   • claude-max  → Uses Claude Max subscription');
          console.log('   • claude-free → Uses DeepSeek (~$0.14/M tokens)');
          console.log('\n   💡 For claude-free, add DEEPSEEK_API_KEY to your .env');
          answers.llmRoutingInstalled = true;
          answers.llmRoutingResult = llmResult;
        } else {
          console.error('\n⚠️  LLM Routing installation had errors:');
          llmResult.errors.forEach((err) => console.error(`   - ${err}`));
          answers.llmRoutingInstalled = false;
          answers.llmRoutingResult = llmResult;
        }
      }
    } catch (error) {
      console.error('\n⚠️  LLM Routing error:', error.message);
      answers.llmRoutingInstalled = false;
    }

    // Story INS-3.2: Pro Installation Wizard (optional phase)
    if (!options.skipPro) {
      try {
        const { runProWizard } = require('./pro-setup');
        const isCI = process.env.CI === 'true' || !process.stdout.isTTY;
        const hasProKey = !!process.env.AIOS_PRO_KEY;

        const proOptions = { targetDir: process.cwd() };

        if (isCI && hasProKey) {
          // CI mode: auto-run if AIOS_PRO_KEY is set
          console.log('\n🔑 Pro license key detected, running Pro setup...');
          const proResult = await runProWizard({ ...proOptions, quiet: true });
          answers.proInstalled = proResult.success;
          answers.proResult = proResult;
        } else if (!isCI && !options.quiet) {
          // Interactive mode: ask which edition to install
          const { edition } = await inquirer.prompt([
            {
              type: 'list',
              name: 'edition',
              message: colors.primary('Which edition do you want to install?'),
              choices: [
                {
                  name: 'Community (free) — agents, workflows, squads, full CLI',
                  value: 'community',
                },
                {
                  name: 'Pro (requires account) — premium squads, minds, priority support',
                  value: 'pro',
                },
              ],
              default: 'community',
            },
          ]);

          if (edition === 'pro') {
            const proResult = await runProWizard(proOptions);
            answers.proInstalled = proResult.success;
            answers.proResult = proResult;

            if (!proResult.success && proResult.error) {
              console.error(`\n⚠️  Pro activation failed: ${proResult.error}`);

              const { fallback } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'fallback',
                  message: colors.primary('Continue with Community (free) edition instead?'),
                  default: true,
                },
              ]);

              if (!fallback) {
                console.log('\n👋 Installation cancelled. Run again when ready.');
                return answers;
              }

              console.log('\n📦 Continuing with Community edition...\n');
            }
          } else {
            answers.proInstalled = false;
          }
        }
      } catch (error) {
        console.error(`\n⚠️  Pro setup error: ${error.message}`);
        answers.proInstalled = false;
      }
    }

    // Story 1.8: Installation Validation
    console.log('\n🔍 Validating installation...\n');

    try {
      const validation = await validateInstallation(
        {
          files: {
            ideConfigs: ideConfigResult?.files || [],
            env: '.env',
            coreConfig: '.aios-core/core-config.yaml',
            mcpConfig: '.mcp.json',
          },
          configs: {
            env: answers.envResult,
            mcps: answers.mcpResult,
            coreConfig: '.aios-core/core-config.yaml',
          },
          mcps: answers.mcpResult,
          dependencies: answers.depsResult,
        },
        (status) => {
          console.log(`  [${status.step}] ${status.message}`);
        },
      );

      // Display validation report
      await displayValidationReport(validation);

      // Offer troubleshooting if there are errors
      if (validation.errors && validation.errors.length > 0) {
        await provideTroubleshooting(validation.errors);
      }

      // Store validation result
      answers.validationResult = validation;
    } catch (error) {
      console.error('\n⚠️  Validation failed:', error.message);
      console.log('Installation may be incomplete. Check logs in .aios/ directory.');
    }

    // Show completion
    showCompletion();

    return answers;
  } catch (error) {
    if (error.isTtyError) {
      console.error("Error: Prompt couldn't be rendered in the current environment");
    } else {
      console.error('Wizard error:', error.message);
    }
    throw error;
  }
}

/**
 * Answer object schema (for integration documentation)
 *
 * @typedef {Object} WizardAnswers
 * @property {string} projectType - 'greenfield' or 'brownfield' (Story 1.3)
 * @property {string[]} [selectedIDEs] - Selected IDEs array (Story 1.4)
 * @property {string[]} [mcpServers] - Selected MCP servers (Story 1.5)
 * @property {boolean} [envConfigured] - Whether env config succeeded (Story 1.6)
 * @property {Object} [envResult] - Environment configuration result (Story 1.6)
 * @property {boolean} envResult.envCreated - .env file created
 * @property {boolean} envResult.envExampleCreated - .env.example file created
 * @property {boolean} envResult.coreConfigCreated - core-config.yaml created
 * @property {boolean} envResult.gitignoreUpdated - .gitignore updated
 * @property {Array<string>} envResult.errors - Any errors encountered
 * @property {string} packageManager - Selected package manager (Story 1.7)
 * @property {boolean} [depsInstalled] - Whether dependencies installed successfully (Story 1.7)
 * @property {Object} [depsResult] - Dependency installation result (Story 1.7)
 * @property {boolean} depsResult.success - Installation succeeded
 * @property {boolean} [depsResult.offlineMode] - Used existing node_modules
 * @property {string} depsResult.packageManager - Package manager used
 * @property {string} [depsResult.error] - Error message if failed
 */

module.exports = {
  runWizard,
  // ACT-12: Exported for testing
  _testing: {
    writeClaudeSettings,
    getExistingLanguage,
    LANGUAGE_MAP,
  },
};
