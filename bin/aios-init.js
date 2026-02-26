#!/usr/bin/env node

/**
 * AIOS-FullStack Installation Wizard v5 (LEGACY)
 * Based on the original beautiful visual design with ASCII art
 * Version: 2.1.0
 *
 * ⚠️ DEPRECATED (since v3.11.3, scheduled for removal in v5.0.0):
 * This file is the LEGACY installer.
 * The new modular wizard is located at: packages/installer/src/wizard/index.js
 *
 * This file is kept as a fallback for edge cases where the new wizard
 * is not available. All new development should use the new wizard.
 *
 * Migration path:
 * - Use `npx aios-core` which routes through bin/aios.js to the new wizard
 * - Do NOT call this file directly
 *
 * Supported IDEs (4 total):
 * - Claude Code, Cursor, Gemini CLI, GitHub Copilot
 */

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const yaml = require('js-yaml');
const { execSync, exec, spawn } = require('child_process');
const { promisify } = require('util');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora'); // INS-2 Performance: Progress indicators (AC9)

// INS-2 Performance: Promisified exec for async shell commands (AC7)
const execAsync = promisify(exec);

/**
 * Execute command with inherited stdio (for npm install -g that needs user interaction)
 * INS-2 Performance: Async version that doesn't block event loop
 * @param {string} command - Command to execute
 * @param {object} options - Spawn options
 * @returns {Promise<void>}
 */
function spawnAsync(command, options = {}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...options });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

// ASCII Art Banner (Clean blocky style like reference image)
const BANNER = chalk.cyan(`
  █████╗ ██╗ ██████╗ ███████╗      ███████╗██╗   ██╗██╗     ██╗     ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ██╔══██╗██║██╔═══██╗██╔════╝      ██╔════╝██║   ██║██║     ██║     ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
 ███████║██║██║   ██║███████╗█████╗█████╗  ██║   ██║██║     ██║     ███████╗   ██║   ███████║██║     █████╔╝
 ██╔══██║██║██║   ██║╚════██║╚════╝██╔══╝  ██║   ██║██║     ██║     ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
 ██║  ██║██║╚██████╔╝███████║      ██║     ╚██████╔╝███████╗███████╗███████║   ██║   ██║  ██║╚██████╗██║  ██╗
 ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚══════╝      ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
`);

const SUBTITLE = chalk.magenta('Universal AI Agent Framework for Any Domain');
// Read version from package.json dynamically
const packageJsonVersion = require(path.join(__dirname, '..', 'package.json')).version;
const VERSION = chalk.yellow(`Installer v${packageJsonVersion}`);

/**
 * Smart path resolution for AIOS Core modules
 */
function resolveAiosCoreModule(modulePath) {
  const aiosCoreModule = path.join(__dirname, '..', '.aios-core', modulePath);

  const moduleExists =
    fs.existsSync(aiosCoreModule + '.js') ||
    fs.existsSync(aiosCoreModule + '/index.js') ||
    fs.existsSync(aiosCoreModule);

  if (!moduleExists) {
    throw new Error(
      `Cannot find AIOS Core module: ${modulePath}\n` +
        `Searched: ${aiosCoreModule}\n` +
        'Please ensure aios-core is installed correctly.'
    );
  }

  return require(aiosCoreModule);
}

// Load AIOS Core modules
const { detectRepositoryContext } = resolveAiosCoreModule(
  'infrastructure/scripts/repository-detector'
);
// PM adapters imported but not used directly (loaded dynamically)
// const { ClickUpAdapter } = resolveAiosCoreModule('utils/pm-adapters/clickup-adapter');
// const { GitHubProjectsAdapter } = resolveAiosCoreModule('utils/pm-adapters/github-adapter');
// const { JiraAdapter } = resolveAiosCoreModule('utils/pm-adapters/jira-adapter');

// Brownfield upgrade module (Story 6.18)
let brownfieldUpgrader;
try {
  brownfieldUpgrader = require('../packages/installer/src/installer/brownfield-upgrader');
} catch (_err) {
  // Module may not be available in older installations
  brownfieldUpgrader = null;
}

async function main() {
  console.clear();

  // Check for minimal mode flag
  const isMinimalMode = process.argv.includes('--minimal');

  // Display beautiful banner
  console.log(BANNER);
  console.log(SUBTITLE);
  console.log(VERSION);
  if (isMinimalMode) {
    console.log(chalk.yellow('   🔹 Minimal Installation Mode'));
  }
  console.log('');
  console.log(chalk.gray('═'.repeat(80)));
  console.log('');

  const projectRoot = process.cwd();
  let context = detectRepositoryContext();

  // Setup prerequisites if needed
  if (!context) {
    console.log(chalk.blue('⚙️  Setting up project prerequisites...\n'));

    // Check for git repository
    // INS-2 Performance: Use async exec (AC7)
    let hasGit = false;
    try {
      await execAsync('git rev-parse --git-dir', { cwd: projectRoot });
      hasGit = true;
    } catch (_err) {
      // Not a git repo
    }

    if (!hasGit) {
      // INS-2 Performance: Add spinner for git init (AC9)
      const gitSpinner = ora('Initializing git repository...').start();
      try {
        await execAsync('git init', { cwd: projectRoot });
        gitSpinner.succeed('Git repository initialized');
      } catch (_err) {
        gitSpinner.fail('Failed to initialize git repository');
        process.exit(1);
      }
    }

    // Check for package.json
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      const dirName = path.basename(projectRoot);
      const defaultPackage = {
        name: dirName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: 'AIOS-FullStack project',
        main: 'index.js',
        scripts: { test: 'echo "Error: no test specified" && exit 1' },
        keywords: [],
        author: '',
        license: 'ISC',
      };
      // INS-2 Performance: Use async write instead of sync
      await fse.writeFile(packageJsonPath, JSON.stringify(defaultPackage, null, 2));
      console.log(chalk.green('✓') + ' package.json created');
    }

    console.log(chalk.green('✓') + ' Prerequisites ready\n');

    // Try to detect context again
    context = detectRepositoryContext();

    // If still no context, create minimal one
    if (!context) {
      // INS-2 Performance: Use async read instead of sync
      const packageJson = JSON.parse(await fse.readFile(packageJsonPath, 'utf8'));
      context = {
        projectRoot,
        packageName: packageJson.name,
        packageVersion: packageJson.version,
        repositoryUrl: 'local-repository',
        frameworkLocation: path.join(__dirname, '..'),
      };
    }
  }

  console.log(chalk.cyan('📦 Package:') + ` ${context.packageName}`);
  console.log('');

  // Check for existing installation (Story 6.18 - Brownfield Upgrade)
  const installedManifestPath = path.join(projectRoot, '.aios-core', '.installed-manifest.yaml');
  const hasExistingInstall = fs.existsSync(installedManifestPath);

  if (hasExistingInstall && brownfieldUpgrader) {
    console.log(chalk.yellow('🔄 Existing AIOS installation detected!'));
    console.log('');

    const sourceDir = path.join(context.frameworkLocation, '.aios-core');
    const upgradeCheck = brownfieldUpgrader.checkUpgradeAvailable(sourceDir, projectRoot);

    if (upgradeCheck.available) {
      console.log(chalk.green(`   Upgrade available: ${upgradeCheck.from} → ${upgradeCheck.to}`));
      console.log('');

      // Generate upgrade report for display
      const sourceManifest = brownfieldUpgrader.loadSourceManifest(sourceDir);
      const installedManifest = brownfieldUpgrader.loadInstalledManifest(projectRoot);
      const report = brownfieldUpgrader.generateUpgradeReport(
        sourceManifest,
        installedManifest,
        projectRoot
      );

      console.log(chalk.gray('─'.repeat(80)));
      const { upgradeChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'upgradeChoice',
          message: chalk.white('What would you like to do?'),
          choices: [
            {
              name:
                `  Upgrade to ${upgradeCheck.to} ` +
                chalk.gray(
                  `(${report.newFiles.length} new, ${report.modifiedFiles.length} updated files)`
                ),
              value: 'upgrade',
            },
            {
              name: '  Dry Run ' + chalk.gray('(Show what would be changed without applying)'),
              value: 'dry-run',
            },
            {
              name: '  Fresh Install ' + chalk.gray('(Reinstall everything, overwrite all files)'),
              value: 'fresh',
            },
            {
              name: '  Cancel ' + chalk.gray('(Exit without changes)'),
              value: 'cancel',
            },
          ],
        },
      ]);

      if (upgradeChoice === 'cancel') {
        console.log(chalk.yellow('\nInstallation cancelled.'));
        process.exit(0);
      }

      if (upgradeChoice === 'dry-run') {
        console.log('');
        console.log(brownfieldUpgrader.formatUpgradeReport(report));
        console.log('');
        console.log(chalk.yellow('This was a dry run. No files were changed.'));
        console.log(chalk.gray('Run again and select "Upgrade" to apply changes.'));
        process.exit(0);
      }

      if (upgradeChoice === 'upgrade') {
        console.log('');
        console.log(chalk.blue('📦 Applying upgrade...'));

        const result = await brownfieldUpgrader.applyUpgrade(report, sourceDir, projectRoot, {
          dryRun: false,
        });

        if (result.success) {
          // Update installed manifest
          const packageJson = require(path.join(context.frameworkLocation, 'package.json'));
          brownfieldUpgrader.updateInstalledManifest(
            projectRoot,
            sourceManifest,
            `aios-core@${packageJson.version}`
          );

          console.log(chalk.green('✓') + ` Upgraded ${result.filesInstalled.length} files`);
          if (result.filesSkipped.length > 0) {
            console.log(
              chalk.yellow('⚠') + ` Preserved ${result.filesSkipped.length} user-modified files`
            );
          }
          console.log('');
          console.log(chalk.green('✅ Upgrade complete!'));
          console.log(chalk.gray(`   From: ${upgradeCheck.from}`));
          console.log(chalk.gray(`   To:   ${upgradeCheck.to}`));
          process.exit(0);
        } else {
          console.error(chalk.red('✗') + ' Upgrade failed with errors:');
          for (const err of result.errors) {
            console.error(chalk.red(`   - ${err.path}: ${err.error}`));
          }
          process.exit(1);
        }
      }

      // If 'fresh' was selected, continue with normal installation flow below
      if (upgradeChoice === 'fresh') {
        console.log(chalk.yellow('\nProceeding with fresh installation...'));
        console.log('');
      }
    } else {
      console.log(chalk.green(`   Current version: ${upgradeCheck.from || 'unknown'}`));
      console.log(
        chalk.gray('   No upgrade available. You can proceed with fresh install if needed.')
      );
      console.log('');
    }
  }

  // Step 1: Installation Mode
  console.log(chalk.gray('─'.repeat(80)));
  const { installMode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'installMode',
      message: chalk.white('How are you using AIOS-FullStack?'),
      choices: [
        {
          name: '  Using AIOS in a project ' + chalk.gray('(Framework files added to .gitignore)'),
          value: 'project-development',
        },
        {
          name:
            '  Developing AIOS framework itself ' + chalk.gray('(Framework files are source code)'),
          value: 'framework-development',
        },
      ],
    },
  ]);

  // Save installation config
  const config = {
    installation: {
      mode: installMode,
      detected_at: new Date().toISOString(),
    },
    repository: {
      url: context.repositoryUrl,
      auto_detect: true,
    },
    framework: {
      source: installMode === 'framework-development' ? 'local' : 'npm',
      version: context.packageVersion,
      location: context.frameworkLocation,
    },
    git_ignore_rules: {
      mode: installMode,
      ignore_framework_files: installMode === 'project-development',
    },
  };

  const configPath = path.join(context.projectRoot, '.aios-installation-config.yaml');
  // INS-2 Performance: Use async write instead of sync
  await fse.writeFile(configPath, yaml.dump(config));

  // Update .gitignore
  // INS-2 Performance: Now async
  await updateGitIgnore(installMode, context.projectRoot);

  // Step 2: PM Tool
  console.log('');
  const { pmTool } = await inquirer.prompt([
    {
      type: 'list',
      name: 'pmTool',
      message: chalk.white('Do you use a project management tool?'),
      choices: [
        { name: '  None (local YAML files only) ' + chalk.gray('- Recommended'), value: 'local' },
        { name: '  ClickUp ' + chalk.gray('- Requires API token'), value: 'clickup' },
        { name: '  GitHub Projects ' + chalk.gray('- Uses gh auth'), value: 'github-projects' },
        { name: '  Jira ' + chalk.gray('- Requires API token'), value: 'jira' },
      ],
    },
  ]);

  // Save PM config
  // INS-2 Performance: Now async
  await savePMConfig(pmTool, {}, context.projectRoot);

  // Step 3: IDE Selection (CHECKBOX with instructions)
  console.log('');
  console.log(chalk.gray('─'.repeat(80)));
  console.log(
    chalk.dim(
      '  Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed'
    )
  );
  console.log('');

  const { ides } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'ides',
      message: chalk.white('Which IDE(s) will you use?'),
      choices: [
        {
          name: '  Claude Code ' + chalk.blue('(v4)') + chalk.gray(' - Recommended'),
          value: 'claude',
          checked: true,
        },
        { name: '  Cursor ' + chalk.blue('(v4)'), value: 'cursor' },
        { name: '  Gemini CLI ' + chalk.blue('(v4)'), value: 'gemini' },
        { name: '  GitHub Copilot ' + chalk.blue('(v4)'), value: 'github-copilot' },
        {
          name: '  AntiGravity ' + chalk.blue('(v4)') + chalk.gray(' - Google AI IDE'),
          value: 'antigravity',
        },
        new inquirer.Separator(chalk.gray('─'.repeat(40))),
        { name: '  Skip IDE setup', value: 'none' },
      ],
      validate: function (answer) {
        if (answer.length < 1) {
          return 'You must choose at least one option.';
        }
        return true;
      },
    },
  ]);

  // Step 4a: Check and offer to install CLI tools
  const cliToolsToCheck = [];
  if (ides.includes('claude')) {
    cliToolsToCheck.push({ ide: 'claude', command: 'claude', name: 'Claude Code', npm: '@anthropic-ai/claude-code' });
  }
  if (ides.includes('gemini')) {
    cliToolsToCheck.push({ ide: 'gemini', command: 'gemini', name: 'Gemini CLI', npm: '@google/gemini-cli' });
  }

  if (cliToolsToCheck.length > 0) {
    console.log('');
    console.log(chalk.blue('🔍 Checking CLI tools...'));

    // INS-2 Performance: Check CLI tools in parallel (AC7)
    const toolCheckResults = await Promise.all(
      cliToolsToCheck.map(async (tool) => {
        try {
          const checkCmd = process.platform === 'win32' ? `where ${tool.command}` : `command -v ${tool.command}`;
          await execAsync(checkCmd);
          return { tool, installed: true };
        } catch {
          return { tool, installed: false };
        }
      })
    );

    const missingTools = [];
    for (const result of toolCheckResults) {
      if (result.installed) {
        console.log(chalk.green('✓') + ` ${result.tool.name} is installed`);
      } else {
        console.log(chalk.yellow('⚠') + ` ${result.tool.name} is not installed`);
        missingTools.push(result.tool);
      }
    }

    if (missingTools.length > 0) {
      console.log('');
      const toolNames = missingTools.map(t => t.name).join(', ');
      const { installClis } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installClis',
          message: chalk.white(`Would you like to install ${toolNames}?`),
          default: true,
        },
      ]);

      if (installClis) {
        for (const tool of missingTools) {
          console.log(chalk.blue(`📥 Installing ${tool.name}...`));
          try {
            // INS-2 Performance: Use async spawn instead of sync (AC7)
            await spawnAsync(`npm install -g ${tool.npm}`);
            console.log(chalk.green('✓') + ` ${tool.name} installed successfully`);

            // Show post-install instructions
            if (tool.ide === 'claude') {
              console.log(chalk.gray('  Run `claude` to authenticate with your Anthropic account'));
            } else if (tool.ide === 'gemini') {
              console.log(chalk.gray('  Run `gemini` to authenticate with your Google account'));
            }
          } catch (error) {
            console.log(chalk.red('✗') + ` Failed to install ${tool.name}: ${error.message}`);
            console.log(chalk.gray(`  You can install manually: npm install -g ${tool.npm}`));
          }
        }
      } else {
        console.log(chalk.gray('  Skipping CLI installation. You can install later:'));
        for (const tool of missingTools) {
          console.log(chalk.gray(`    npm install -g ${tool.npm}`));
        }
      }
    }
  }

  // Step 4b: Copy AIOS Core files
  console.log('');

  const sourceCoreDir = path.join(context.frameworkLocation, '.aios-core');
  const targetCoreDir = path.join(context.projectRoot, '.aios-core');

  if (fs.existsSync(sourceCoreDir)) {
    // INS-2 Performance: Add spinner for file copy (AC9)
    const copySpinner = ora('Installing AIOS Core files...').start();
    await fse.copy(sourceCoreDir, targetCoreDir);
    copySpinner.succeed(
      'AIOS Core files installed ' +
        chalk.gray('(11 agents, 68 tasks, 23 templates)')
    );

    // Create installed manifest for brownfield upgrades (Story 6.18)
    if (brownfieldUpgrader) {
      try {
        const sourceManifest = brownfieldUpgrader.loadSourceManifest(sourceCoreDir);
        if (sourceManifest) {
          const packageJson = require(path.join(context.frameworkLocation, 'package.json'));
          brownfieldUpgrader.updateInstalledManifest(
            context.projectRoot,
            sourceManifest,
            `aios-core@${packageJson.version}`
          );
          console.log(
            chalk.green('✓') +
              ' Installation manifest created ' +
              chalk.gray('(enables future upgrades)')
          );
        }
      } catch (manifestErr) {
        // Non-critical - just log warning
        console.log(
          chalk.yellow('⚠') +
            ' Could not create installation manifest ' +
            chalk.gray('(brownfield upgrades may not work)')
        );
      }
    }
  } else {
    console.error(chalk.red('✗') + ' AIOS Core files not found');
    process.exit(1);
  }

  // Copy IDE rules and commands if IDE was selected
  if (!ides.includes('none')) {
    console.log('');
    console.log(chalk.blue('📝 Installing IDE configurations...'));

    const ideRulesMap = {
      claude: { source: 'claude-rules.md', target: '.claude/CLAUDE.md' },
      cursor: { source: 'cursor-rules.md', target: '.cursor/rules.md' },
      gemini: { source: 'gemini-rules.md', target: '.gemini/rules.md' },
      'github-copilot': { source: 'copilot-rules.md', target: '.github/chatmodes/aios-agent.md' },
      antigravity: { source: 'antigravity-rules.md', target: '.antigravity/rules.md' },
    };

    // Step 1: Copy basic IDE rules files
    for (const ide of ides) {
      if (ide !== 'none' && ideRulesMap[ide]) {
        const ideConfig = ideRulesMap[ide];
        const sourceRules = path.join(targetCoreDir, 'product', 'templates', 'ide-rules', ideConfig.source);
        const targetRules = path.join(context.projectRoot, ideConfig.target);

        if (fs.existsSync(sourceRules)) {
          await fse.ensureDir(path.dirname(targetRules));
          await fse.copy(sourceRules, targetRules);
          console.log(
            chalk.green('✓') + ` ${ide.charAt(0).toUpperCase() + ide.slice(1)} base rules installed`
          );
        }
      }
    }

    // INS-2 Performance: Cache directory listings to avoid redundant readdirSync calls
    // The same agent/task directories are read 6-7 times across IDE installations
    // This reduces directory reads from 6-7x to 1x (AC3)
    const coreAgentsSource = path.join(targetCoreDir, 'development', 'agents');
    const coreTasksSource = path.join(targetCoreDir, 'development', 'tasks');

    // Cache agent files list (read once, use many times)
    const cachedAgentFiles = fs.existsSync(coreAgentsSource)
      ? fs.readdirSync(coreAgentsSource).filter((f) => f.endsWith('.md'))
      : [];

    // Cache task files list
    const cachedTaskFiles = fs.existsSync(coreTasksSource)
      ? fs.readdirSync(coreTasksSource).filter((f) => f.endsWith('.md'))
      : [];

    // Step 2: Install AIOS CORE agents and tasks for Claude Code
    // v4: Agents and tasks are in development/ module
    if (ides.includes('claude')) {
      const coreAgentsTarget = path.join(
        context.projectRoot,
        '.claude',
        'commands',
        'AIOS',
        'agents'
      );

      const coreTasksTarget = path.join(
        context.projectRoot,
        '.claude',
        'commands',
        'AIOS',
        'tasks'
      );

      if (cachedAgentFiles.length > 0) {
        await fse.copy(coreAgentsSource, coreAgentsTarget);
        console.log(chalk.green('✓') + ` Claude Code CORE agents installed (${cachedAgentFiles.length} agents)`);
      }

      if (cachedTaskFiles.length > 0) {
        await fse.copy(coreTasksSource, coreTasksTarget);
        console.log(chalk.green('✓') + ` Claude Code CORE tasks installed (${cachedTaskFiles.length} tasks)`);
      }

      // Create AIOS README for Claude Code
      const aiossReadme = path.join(
        context.projectRoot,
        '.claude',
        'commands',
        'AIOS',
        'README.md'
      );
      await fse.ensureDir(path.dirname(aiossReadme));
      await fse.writeFile(
        aiossReadme,
        `# AIOS Core Commands

This directory contains the core AIOS-FullStack agents and tasks.

## Usage
- Agents: Use slash commands like /dev, /architect, /qa, /pm, etc.
- Tasks: Reference tasks in agent workflows

## Documentation
See .aios-core/user-guide.md for complete documentation.
`
      );

      // Silent statusline setup (graceful skip if user already has one)
      await setupGlobalStatuslineLegacy(sourceCoreDir);
    }

    // Step 3: Install AIOS CORE agents for Cursor
    // v4: Agents are in development/ module
    // INS-2 Performance: Uses cached agent files list
    if (ides.includes('cursor')) {
      const cursorRulesTarget = path.join(
        context.projectRoot,
        '.cursor',
        'rules',
        'AIOS',
        'agents'
      );

      if (cachedAgentFiles.length > 0) {
        await fse.ensureDir(cursorRulesTarget);

        // Convert .md files to .mdc for Cursor (using cached list)
        for (const agentFile of cachedAgentFiles) {
          const sourcePath = path.join(coreAgentsSource, agentFile);
          const targetFileName = agentFile.replace('.md', '.mdc');
          const targetPath = path.join(cursorRulesTarget, targetFileName);
          await fse.copy(sourcePath, targetPath);
        }

        console.log(
          chalk.green('✓') + ` Cursor CORE rules installed (${cachedAgentFiles.length} agents)`
        );
      }

      // Create AIOS README for Cursor
      const cursorReadme = path.join(context.projectRoot, '.cursor', 'rules', 'AIOS', 'README.md');
      await fse.ensureDir(path.dirname(cursorReadme));
      await fse.writeFile(
        cursorReadme,
        `# AIOS Core Rules

This directory contains the core AIOS-FullStack agent rules for Cursor.

## Usage
These rules are automatically loaded by Cursor to provide agent-specific context.

## Documentation
See .aios-core/user-guide.md for complete documentation.
`
      );
    }

    // Step 4: Install AIOS CORE agents for other IDEs (Gemini, AntiGravity)
    // v4: Agents are in development/ module
    // INS-2 Performance: Uses cached agent files list
    const otherIdeInstalls = ['gemini', 'antigravity'];
    for (const ide of otherIdeInstalls) {
      if (ides.includes(ide)) {
        const ideRulesDir = ide === 'gemini' ? '.gemini' : `.${ide}`;
        const ideRulesTarget = path.join(
          context.projectRoot,
          ideRulesDir,
          'rules',
          'AIOS',
          'agents'
        );

        if (cachedAgentFiles.length > 0) {
          await fse.ensureDir(ideRulesTarget);

          // Copy agent files (using cached list)
          for (const agentFile of cachedAgentFiles) {
            const sourcePath = path.join(coreAgentsSource, agentFile);
            const targetPath = path.join(ideRulesTarget, agentFile);
            await fse.copy(sourcePath, targetPath);
          }

          const ideName = ide.charAt(0).toUpperCase() + ide.slice(1);
          console.log(
            chalk.green('✓') + ` ${ideName} CORE agents installed (${cachedAgentFiles.length} agents)`
          );
        }
      }
    }

    // Step 5: Install GitHub Copilot chat modes
    // v4: Agents are in development/ module
    // INS-2 Performance: Uses cached agent files list
    if (ides.includes('github-copilot')) {
      const copilotModesDir = path.join(context.projectRoot, '.github', 'chatmodes');

      if (cachedAgentFiles.length > 0) {
        await fse.ensureDir(copilotModesDir);

        // Copy agent files (using cached list)
        for (const agentFile of cachedAgentFiles) {
          const sourcePath = path.join(coreAgentsSource, agentFile);
          const agentName = agentFile.replace('.md', '');
          const targetPath = path.join(copilotModesDir, `aios-${agentName}.md`);
          await fse.copy(sourcePath, targetPath);
        }

        console.log(
          chalk.green('✓') + ` GitHub Copilot chat modes installed (${cachedAgentFiles.length} modes)`
        );
      }
    }
  }

  // Step 7: Squads (CHECKBOX with visual)
  // Try multiple locations for squads (npm package vs local development vs npx)
  // __dirname is the 'bin/' directory of the package, so '..' gives us the package root
  const packageRoot = path.resolve(__dirname, '..');

  const possibleSquadsDirs = [
    // Primary: relative to this script (works for npx and local) - squads/
    path.join(packageRoot, 'squads'),
    // Secondary: context-based framework location - squads/
    path.join(context.frameworkLocation, 'squads'),
    // Tertiary: installed in project's node_modules - squads/
    path.join(context.projectRoot, 'node_modules', 'aios-core', 'squads'),
    path.join(context.projectRoot, 'node_modules', '@aios', 'fullstack', 'squads'),
  ];

  let sourceSquadsDir = null;
  for (const dir of possibleSquadsDirs) {
    if (fs.existsSync(dir)) {
      sourceSquadsDir = dir;
      break;
    }
  }

  const availableSquads = [];
  let selectedSquads = []; // Declare here to be accessible in summary

  if (sourceSquadsDir && fs.existsSync(sourceSquadsDir)) {
    // INS-2 Performance: Use withFileTypes to avoid separate statSync calls per entry
    // This reduces N+1 syscalls to just 1 syscall for the entire directory
    let squads = fs
      .readdirSync(sourceSquadsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Filter for minimal mode - only show squad-creator
    if (isMinimalMode) {
      squads = squads.filter((squad) => squad === 'squad-creator');
    }

    availableSquads.push(...squads);
  }

  if (availableSquads.length > 0) {
    console.log('');
    console.log(chalk.gray('─'.repeat(80)));
    console.log(
      chalk.dim(
        '  Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed'
      )
    );
    console.log('');

    const result = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedSquads',
        message: chalk.white('Select squads to install (optional)'),
        choices: availableSquads.map((squad) => ({
          name: '  ' + squad,
          value: squad,
        })),
      },
    ]);

    selectedSquads = result.selectedSquads; // Assign to outer scope variable

    if (selectedSquads.length > 0) {
      console.log('');
      console.log(chalk.blue('📦 Installing squads...'));

      // Always install to squads/ directory (modern naming)
      const targetSquadsDir = path.join(context.projectRoot, 'squads');

      // INS-2 Performance: Copy all squads in parallel first (AC6)
      await Promise.all(
        selectedSquads.map(async (squad) => {
          const sourceSquad = path.join(sourceSquadsDir, squad);
          const targetSquad = path.join(targetSquadsDir, squad);
          await fse.copy(sourceSquad, targetSquad);
        })
      );
      console.log(chalk.green('✓') + ` Squads copied: ${selectedSquads.join(', ')}`);

      // Process IDE-specific installations sequentially for ordered logging
      for (const squad of selectedSquads) {
        const targetSquad = path.join(targetSquadsDir, squad);

        // INS-2 Performance: Cache squad file lists once per squad (used by Claude, Cursor, etc.)
        const squadAgentsSource = path.join(targetSquad, 'agents');
        const squadTasksSource = path.join(targetSquad, 'tasks');
        const squadReadmeSource = path.join(targetSquad, 'README.md');

        // Cache squad agents/tasks lists (read once per squad, use for all IDEs)
        const squadAgentFiles = fs.existsSync(squadAgentsSource)
          ? fs.readdirSync(squadAgentsSource).filter((f) => f.endsWith('.md'))
          : [];
        const squadTaskFiles = fs.existsSync(squadTasksSource)
          ? fs.readdirSync(squadTasksSource).filter((f) => f.endsWith('.md'))
          : [];
        const hasSquadReadme = fs.existsSync(squadReadmeSource);

        // Install squad agents/tasks for Claude Code
        if (ides.includes('claude')) {
          const squadClaudeTarget = path.join(context.projectRoot, '.claude', 'commands', squad);

          // Copy agents (using cached list)
          if (squadAgentFiles.length > 0) {
            const squadAgentsTarget = path.join(squadClaudeTarget, 'agents');
            await fse.copy(squadAgentsSource, squadAgentsTarget);
            console.log(chalk.green('  ✓') + ` Claude Code ${squad} agents (${squadAgentFiles.length} agents)`);
          }

          // Copy tasks (using cached list)
          if (squadTaskFiles.length > 0) {
            const squadTasksTarget = path.join(squadClaudeTarget, 'tasks');
            await fse.copy(squadTasksSource, squadTasksTarget);
            console.log(chalk.green('  ✓') + ` Claude Code ${squad} tasks (${squadTaskFiles.length} tasks)`);
          }

          // Copy README (using cached check)
          if (hasSquadReadme) {
            await fse.copy(squadReadmeSource, path.join(squadClaudeTarget, 'README.md'));
          }
        }

        // Install squad agents for Cursor
        if (ides.includes('cursor') && squadAgentFiles.length > 0) {
          const cursorSquadTarget = path.join(
            context.projectRoot,
            '.cursor',
            'rules',
            squad,
            'agents'
          );
          await fse.ensureDir(cursorSquadTarget);

          // Convert .md files to .mdc for Cursor (using cached list)
          for (const agentFile of squadAgentFiles) {
            const sourcePath = path.join(squadAgentsSource, agentFile);
            const targetFileName = agentFile.replace('.md', '.mdc');
            const targetPath = path.join(cursorSquadTarget, targetFileName);
            await fse.copy(sourcePath, targetPath);
          }

          console.log(chalk.green('  ✓') + ` Cursor ${squad} rules (${squadAgentFiles.length} agents)`);

          // Copy README for Cursor (using cached check)
          if (hasSquadReadme) {
            await fse.copy(
              squadReadmeSource,
              path.join(context.projectRoot, '.cursor', 'rules', squad, 'README.md')
            );
          }
        }
      }
    }
  }

  // Post-installation validation (Story 6.19)
  console.log('');
  // INS-2 Performance: Add spinner for validation (AC9)
  const validationSpinner = ora('Validating installation integrity...').start();

  let validationPassed = true;
  try {
    const { PostInstallValidator } = require('../packages/installer/src/installer/post-install-validator');
    const validator = new PostInstallValidator(context.projectRoot, context.frameworkLocation, {
      verifyHashes: false,
      verbose: false,
      // SECURITY NOTE: Signature verification is disabled during initial installation
      // because the manifest signature (.minisig) may not yet be present in the package.
      // This is acceptable for post-install validation which only checks file presence.
      // For production integrity checks, users should run `aios validate` which
      // enforces signature verification when the .minisig file is present.
      requireSignature: false,
    });

    const report = await validator.validate();

    if (
      report.status === 'failed' ||
      report.stats.missingFiles > 0 ||
      report.stats.corruptedFiles > 0
    ) {
      validationPassed = false;
      validationSpinner.warn('Installation validation found issues:');
      console.log(chalk.dim(`   - Missing files: ${report.stats.missingFiles}`));
      console.log(chalk.dim(`   - Corrupted files: ${report.stats.corruptedFiles}`));
      console.log('');
      console.log(
        chalk.yellow('   Run ') +
          chalk.cyan('aios validate --repair') +
          chalk.yellow(' to fix issues')
      );
    } else {
      validationSpinner.succeed(`Installation verified (${report.stats.validFiles} files)`);
    }
  } catch (validationError) {
    // Log validation errors but don't fail installation
    // This allows installation to proceed even if validator module has issues
    // However, users should investigate validation errors manually
    validationPassed = false;
    validationSpinner.warn('Post-installation validation encountered an error');
    console.log(chalk.dim(`   Error: ${validationError.message}`));
    if (process.env.DEBUG || process.env.AIOS_DEBUG) {
      console.log(chalk.dim(`   Stack: ${validationError.stack}`));
    }
    console.log(chalk.dim('   Run `aios validate` to check installation integrity'));
  }

  // Summary
  console.log('');
  console.log(chalk.gray('═'.repeat(80)));
  console.log('');
  console.log(chalk.green.bold('✓ AIOS-FullStack installation complete! 🎉'));
  console.log('');
  console.log(chalk.cyan('📋 Configuration Summary:'));
  console.log('  ' + chalk.dim('Mode:           ') + installMode);
  console.log('  ' + chalk.dim('Version:        ') + packageJsonVersion);
  console.log('  ' + chalk.dim('Repository:     ') + context.repositoryUrl);
  console.log(
    '  ' + chalk.dim('IDE(s):         ') + (ides.includes('none') ? 'none' : ides.join(', '))
  );
  console.log('  ' + chalk.dim('PM Tool:        ') + pmTool);

  if (availableSquads.length > 0 && selectedSquads && selectedSquads.length > 0) {
    console.log('  ' + chalk.dim('Squads:         ') + ' ' + selectedSquads.join(', '));
  }

  console.log('');
  console.log(chalk.cyan('📁 Installed Structure:'));
  console.log('  ' + chalk.dim('.aios-core/') + '           - Framework core files');

  if (ides.includes('claude')) {
    console.log('  ' + chalk.dim('.claude/'));
    console.log('    ' + chalk.dim('├─ CLAUDE.md') + '        - Main configuration');
    console.log('    ' + chalk.dim('└─ commands/'));
    console.log('      ' + chalk.dim('  ├─ AIOS/') + '         - Core agents & tasks');
    if (selectedSquads && selectedSquads.length > 0) {
      selectedSquads.forEach((squad) => {
        console.log('      ' + chalk.dim(`  └─ ${squad}/`) + '     - Squad commands');
      });
    }
  }

  if (ides.includes('cursor')) {
    console.log('  ' + chalk.dim('.cursor/'));
    console.log('    ' + chalk.dim('├─ rules.md') + '         - Main configuration');
    console.log('    ' + chalk.dim('└─ rules/'));
    console.log('      ' + chalk.dim('  ├─ AIOS/') + '         - Core agent rules');
    if (selectedSquads && selectedSquads.length > 0) {
      selectedSquads.forEach((squad) => {
        console.log('      ' + chalk.dim(`  └─ ${squad}/`) + '     - Squad rules');
      });
    }
  }

  // Show other IDE installations
  const otherInstalledIdes = ['gemini', 'antigravity'].filter((ide) =>
    ides.includes(ide)
  );
  for (const ide of otherInstalledIdes) {
    const ideDir = ide === 'gemini' ? '.gemini' : `.${ide}`;
    console.log(
      '  ' +
        chalk.dim(`${ideDir}/`) +
        '           - ' +
        ide.charAt(0).toUpperCase() +
        ide.slice(1) +
        ' configuration'
    );
  }

  if (ides.includes('github-copilot')) {
    console.log('  ' + chalk.dim('.github/chatmodes/') + '   - GitHub Copilot agent modes');
  }

  console.log('');
  console.log(chalk.cyan('📚 Next steps:'));

  if (ides.includes('claude')) {
    console.log('  ' + chalk.yellow('Claude Code:'));
    console.log('    • Use slash commands: /dev, /architect, /qa, /pm, /github-devops');
    console.log('    • Browse: .claude/commands/AIOS/agents/ for all available agents');
  }

  if (ides.includes('cursor')) {
    console.log('  ' + chalk.yellow('Cursor:'));
    console.log('    • Agent rules auto-loaded from .cursor/rules/');
    console.log('    • Use @agent-name to activate agents in chat');
  }

  if (ides.includes('gemini')) {
    console.log('  ' + chalk.yellow('Gemini CLI:'));
    console.log('    • Include agent context in your prompts');
  }

  if (ides.includes('github-copilot')) {
    console.log('  ' + chalk.yellow('GitHub Copilot:'));
    console.log('    • Open Chat view and select Agent mode');
    console.log('    • Requires VS Code 1.101+ with chat.agent.enabled: true');
  }

  if (ides.includes('antigravity')) {
    console.log('  ' + chalk.yellow('AntiGravity:'));
    console.log('    • Use Workspace Rules to activate agents');
    console.log('    • Browse: .antigravity/rules/AIOS/agents/ for all available agents');
  }

  console.log('  ' + chalk.yellow('General:'));
  console.log('    • Run ' + chalk.yellow('aios validate') + ' to verify installation integrity');
  console.log('    • Run ' + chalk.yellow('aios validate --repair') + ' to fix any missing files');
  console.log('    • Check .aios-core/user-guide.md for complete documentation');
  console.log('    • Explore squads/ for additional capabilities');
  console.log('');
  console.log(chalk.gray('═'.repeat(80)));
  console.log('');
}

/**
 * Updates .gitignore file based on installation mode
 * INS-2 Performance: Converted to async
 */
async function updateGitIgnore(mode, projectRoot) {
  const gitignorePath = path.join(projectRoot, '.gitignore');

  let gitignore = '';
  if (fs.existsSync(gitignorePath)) {
    // INS-2 Performance: Use async read
    gitignore = await fse.readFile(gitignorePath, 'utf8');
  }

  if (mode === 'project-development') {
    const frameworkRules = [
      '',
      '# AIOS-FullStack Framework Files (auto-managed - do not edit)',
      '.aios-core/',
      'node_modules/@aios/',
      'outputs/minds/',
      '.aios-installation-config.yaml',
      '# End AIOS-FullStack auto-managed section',
      '',
    ];

    const hasFrameworkSection = gitignore.includes('# AIOS-FullStack Framework Files');

    if (!hasFrameworkSection) {
      gitignore += frameworkRules.join('\n');
      // INS-2 Performance: Use async write
      await fse.writeFile(gitignorePath, gitignore);
    }
  }
}

/**
 * Save PM configuration
 * INS-2 Performance: Converted to async
 */
async function savePMConfig(pmTool, config, projectRoot) {
  const pmConfigData = {
    pm_tool: {
      type: pmTool,
      configured_at: new Date().toISOString(),
      config: config,
    },
    sync_behavior: {
      auto_sync_on_status_change: true,
      create_tasks_on_story_creation: false,
      bidirectional_sync: false,
    },
  };

  const configPath = path.join(projectRoot, '.aios-pm-config.yaml');
  // INS-2 Performance: Use async write
  await fse.writeFile(configPath, yaml.dump(pmConfigData));
}

/**
 * Setup global statusline for Claude Code (legacy installer version)
 * Graceful skip: returns silently if user already has a statusLine configured.
 * @param {string} sourceCoreDir - Path to installed .aios-core directory
 */
async function setupGlobalStatuslineLegacy(sourceCoreDir) {
  const os = require('os');
  const homeDir = os.homedir();
  const globalSettingsPath = path.join(homeDir, '.claude', 'settings.json');

  // Read existing global settings
  let settings = {};
  try {
    if (fs.existsSync(globalSettingsPath)) {
      settings = JSON.parse(fs.readFileSync(globalSettingsPath, 'utf8'));
    }
  } catch {
    settings = {};
  }

  // GRACEFUL SKIP: User already has a statusLine
  if (settings.statusLine) {
    return;
  }

  // Source templates
  const templatesDir = path.join(sourceCoreDir, 'product', 'templates', 'statusline');
  const scriptSource = path.join(templatesDir, 'statusline-script.js');
  const hookSource = path.join(templatesDir, 'track-agent.sh');

  if (!fs.existsSync(scriptSource) || !fs.existsSync(hookSource)) {
    return;
  }

  // Target paths
  const scriptTarget = path.join(homeDir, '.claude', 'statusline-script.js');
  const hookTarget = path.join(homeDir, '.claude', 'hooks', 'track-agent.sh');

  try {
    await fse.ensureDir(path.join(homeDir, '.claude', 'hooks'));
    await fse.ensureDir(path.join(homeDir, '.claude', 'session-cache'));
    await fse.copy(scriptSource, scriptTarget);
    await fse.copy(hookSource, hookTarget);
  } catch {
    return;
  }

  // Add statusLine + hook to settings
  const scriptPathEscaped = scriptTarget.replace(/\\/g, '\\\\');
  settings.statusLine = {
    type: 'command',
    command: `node "${scriptPathEscaped}"`,
  };

  if (!settings.hooks) {
    settings.hooks = {};
  }
  if (!Array.isArray(settings.hooks.UserPromptSubmit)) {
    settings.hooks.UserPromptSubmit = [];
  }

  const hookPathEscaped = hookTarget.replace(/\\/g, '\\\\');
  const alreadyHasTrackAgent = settings.hooks.UserPromptSubmit.some(entry => {
    if (Array.isArray(entry.hooks)) {
      return entry.hooks.some(h => h.command && h.command.includes('track-agent'));
    }
    return entry.command && entry.command.includes('track-agent');
  });

  if (!alreadyHasTrackAgent) {
    settings.hooks.UserPromptSubmit.push({
      matcher: '',
      hooks: [
        {
          type: 'command',
          command: `bash "${hookPathEscaped}"`,
        },
      ],
    });
  }

  try {
    await fse.ensureDir(path.dirname(globalSettingsPath));
    await fse.writeFile(globalSettingsPath, JSON.stringify(settings, null, 2), 'utf8');
  } catch {
    // Silent failure — statusline is non-critical
  }
}

// Run installer with error handling
main().catch((error) => {
  console.error('');
  console.error(chalk.red('✗ Installation failed: ') + error.message);
  console.error('');
  process.exit(1);
});
