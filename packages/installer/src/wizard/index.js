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
const {
  getLanguageQuestion,
  getProjectTypeQuestion,
  getIDEQuestions,
  getTechPresetQuestion,
} = require('./questions');
const { setLanguage } = require('./i18n');
const { showWelcome, showCompletion, showCancellation } = require('./feedback');
const { generateIDEConfigs, showSuccessSummary } = require('./ide-config-generator');
const {
  configureEnvironment,
} = require('../config/configure-environment');
const {
  installDependencies,
} = require('../installer/dependency-installer');
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

// DISABLED: Squads replaced expansion-packs (OSR-8)
// /**
//  * Generate AntiGravity workflow content for expansion pack agents
//  * @param {string} agentName - Agent name (e.g., 'data-collector')
//  * @param {string} packName - Expansion pack name (e.g., 'etl')
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
// **Expansion Pack:** ${packName}
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
async function runWizard() {
  try {
    // Setup graceful cancellation
    setupCancellationHandler();

    // Show welcome message with AIOS branding
    showWelcome();

    // Phase 1: Language selection (must be first to apply i18n)
    const languageAnswer = await inquirer.prompt([getLanguageQuestion()]);
    setLanguage(languageAnswer.language);

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

    // Merge all answers
    const answers = { ...languageAnswer, ...remainingAnswers };

    // Log performance metrics
    const duration = Date.now() - startTime;
    const totalQuestions = remainingQuestions.length + 1; // +1 for language question
    const avgTimePerQuestion = totalQuestions > 0 ? duration / totalQuestions : 0;

    if (avgTimePerQuestion > 100) {
      console.warn(
        `Warning: Average question response time (${avgTimePerQuestion.toFixed(0)}ms) exceeds 100ms target`,
      );
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

            // Copy the selected preset
            await fse.copy(
              presetFile,
              path.join(targetPresetDir, `${answers.selectedTechPreset}.md`),
            );

            // Copy the template too
            const templateFile = path.join(sourcePresetDir, '_template.md');
            if (fse.existsSync(templateFile)) {
              await fse.copy(templateFile, path.join(targetPresetDir, '_template.md'));
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
              let techPrefsContent = await fse.readFile(techPrefsSource, 'utf8');

              // Add active preset marker
              const activePresetSection = `\n## Active Preset\n\n**Selected:** \`${answers.selectedTechPreset}\`\n\nThis preset was selected during installation. The @architect and @dev agents will use these patterns by default.\n`;

              // Insert after the first heading
              techPrefsContent = techPrefsContent.replace(
                '# User-Defined Preferred Patterns and Preferences',
                '# User-Defined Preferred Patterns and Preferences' + activePresetSection,
              );

              await fse.writeFile(techPrefsFile, techPrefsContent, 'utf8');
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

    // DISABLED: Squads replaced expansion-packs (OSR-8)
    // Install Expansion Packs if selected
    // if (answers.selectedExpansionPacks && answers.selectedExpansionPacks.length > 0) {
    //   console.log('\n🎁 Installing Expansion Packs...');
    //
    //   // Detect source expansion-packs directory (npm package location)
    //   const possibleSourceDirs = [
    //     path.join(__dirname, '..', '..', 'expansion-packs'),
    //     path.join(__dirname, '..', '..', '..', 'expansion-packs'),
    //     path.join(process.cwd(), 'node_modules', '@synkra/aios-core', 'expansion-packs'),
    //   ];
    //
    //   let sourceExpansionDir = null;
    //   for (const dir of possibleSourceDirs) {
    //     if (fse.existsSync(dir)) {
    //       sourceExpansionDir = dir;
    //       break;
    //     }
    //   }
    //
    //   if (sourceExpansionDir) {
    //     const targetExpansionDir = path.join(process.cwd(), 'expansion-packs');
    //     await fse.ensureDir(targetExpansionDir);
    //
    //     const installedPacks = [];
    //     const failedPacks = [];
    //
    //     for (const pack of answers.selectedExpansionPacks) {
    //       const sourcePack = path.join(sourceExpansionDir, pack);
    //       const targetPack = path.join(targetExpansionDir, pack);
    //
    //       try {
    //         if (fse.existsSync(sourcePack)) {
    //           await fse.copy(sourcePack, targetPack);
    //           installedPacks.push(pack);
    //           console.log(`   ✅ ${pack}`);
    //         } else {
    //           failedPacks.push({ pack, reason: 'not found' });
    //           console.log(`   ⚠️  ${pack} - not found in source`);
    //         }
    //       } catch (packError) {
    //         failedPacks.push({ pack, reason: packError.message });
    //         console.log(`   ⚠️  ${pack} - ${packError.message}`);
    //       }
    //     }
    //
    //     answers.expansionPacksInstalled = installedPacks.length > 0;
    //     answers.expansionPacksResult = {
    //       installed: installedPacks,
    //       failed: failedPacks,
    //       targetDir: targetExpansionDir,
    //     };
    //
    //     if (installedPacks.length > 0) {
    //       console.log(`\n✅ Expansion Packs installed (${installedPacks.length}/${answers.selectedExpansionPacks.length})`);
    //     }
    //   } else {
    //     console.log('   ⚠️  Expansion packs source directory not found');
    //     answers.expansionPacksInstalled = false;
    //   }
    // }

    // Story 1.4: Generate IDE configs if IDEs were selected
    let ideConfigResult = null;
    if (answers.selectedIDEs && answers.selectedIDEs.length > 0) {
      ideConfigResult = await generateIDEConfigs(answers.selectedIDEs, answers);

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

      // DISABLED: Squads replaced expansion-packs (OSR-8)
      // Install expansion pack agents to each selected IDE
      // if (answers.expansionPacksResult && answers.expansionPacksResult.installed.length > 0) {
      //   console.log('\n📦 Installing expansion pack agents to IDEs...');
      //
      //   for (const packName of answers.expansionPacksResult.installed) {
      //     const packAgentsDir = path.join(answers.expansionPacksResult.targetDir, packName, 'agents');
      //
      //     if (await fse.pathExists(packAgentsDir)) {
      //       const agentFiles = (await fse.readdir(packAgentsDir)).filter(f => f.endsWith('.md'));
      //
      //       if (agentFiles.length > 0) {
      //         for (const ideKey of answers.selectedIDEs) {
      //           const ideConfig = getIDEConfig(ideKey);
      //           if (!ideConfig || !ideConfig.agentFolder) continue;
      //
      //           const isAntiGravity = ideConfig.specialConfig && ideConfig.specialConfig.type === 'antigravity';
      //
      //           // Determine target folder for this expansion pack
      //           let targetFolder;
      //           if (isAntiGravity) {
      //             // AntiGravity: workflows go to .agent/workflows/{packName}/
      //             targetFolder = path.join(process.cwd(), ideConfig.agentFolder, packName);
      //             // Also need to copy actual agents to .antigravity/agents/{packName}/
      //             const agentsTargetFolder = path.join(process.cwd(), ideConfig.specialConfig.agentsFolder, packName);
      //             await fse.ensureDir(agentsTargetFolder);
      //
      //             for (const agentFile of agentFiles) {
      //               const sourcePath = path.join(packAgentsDir, agentFile);
      //               const agentName = agentFile.replace('.md', '');
      //
      //               // Create workflow file
      //               const workflowContent = generateExpansionPackWorkflow(agentName, packName);
      //               await fse.ensureDir(targetFolder);
      //               await fse.writeFile(path.join(targetFolder, agentFile), workflowContent, 'utf8');
      //
      //               // Copy actual agent
      //               await fse.copy(sourcePath, path.join(agentsTargetFolder, agentFile));
      //             }
      //           } else {
      //             // Other IDEs: copy directly to agentFolder/{packName}/
      //             targetFolder = path.join(process.cwd(), ideConfig.agentFolder, packName);
      //             await fse.ensureDir(targetFolder);
      //
      //             for (const agentFile of agentFiles) {
      //               await fse.copy(
      //                 path.join(packAgentsDir, agentFile),
      //                 path.join(targetFolder, agentFile),
      //               );
      //             }
      //           }
      //         }
      //         console.log(`   ✅ ${packName}: ${agentFiles.length} agents installed to ${answers.selectedIDEs.length} IDE(s)`);
      //       }
      //     }
      //   }
      // }
    }

    // Story 1.6: Environment Configuration
    console.log('\n📝 Configuring environment...');

    try {
      const envResult = await configureEnvironment({
        targetDir: process.cwd(),
        projectType: answers.projectType || 'greenfield',
        selectedIDEs: answers.selectedIDEs || [],
        mcpServers: answers.mcpServers || [],
        skipPrompts: false, // Interactive mode
      });

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
};
