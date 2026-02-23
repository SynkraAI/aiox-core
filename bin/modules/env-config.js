/**
 * AIOS-FullStack Environment Configuration Module
 * Story 1.6: Environment Configuration
 *
 * Creates .env and core-config.yaml files with user-provided API keys
 * and project configuration.
 *
 * @module env-config
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');

/**
 * Configure environment files (.env and core-config.yaml)
 *
 * @param {Object} options - Configuration options
 * @param {string} options.projectPath - Project root path
 * @param {Object} options.wizardState - State from previous wizard steps
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Object>} Configuration result
 */
async function configureEnvironment(options = {}) {
  const {
    projectPath = process.cwd(),
    wizardState = {},
    onProgress = () => {},
  } = options;

  const results = {
    success: false,
    files: [],
    skippedKeys: [],
    errors: [],
  };

  const spinner = ora();

  try {
    onProgress({ phase: 'env-config', message: 'Configuring environment...' });

    // Step 1: Collect API keys from user
    spinner.start('Collecting API keys...');
    const apiKeys = await collectAPIKeys();
    spinner.succeed('API keys collected');

    // Step 2: Generate .env file
    spinner.start('Creating .env file...');
    const envResult = await generateEnvFile(projectPath, apiKeys, wizardState);
    if (envResult.success) {
      results.files.push(envResult.file);
      spinner.succeed(`.env created at ${path.relative(projectPath, envResult.file)}`);
    } else {
      throw new Error(envResult.error);
    }

    // Step 3: Generate .env.example file
    spinner.start('Creating .env.example file...');
    const envExampleResult = await generateEnvExampleFile(projectPath);
    if (envExampleResult.success) {
      results.files.push(envExampleResult.file);
      spinner.succeed('.env.example created');
    } else {
      spinner.warn(`.env.example skipped: ${envExampleResult.error}`);
    }

    // Step 4: Update .gitignore
    spinner.start('Updating .gitignore...');
    await ensureEnvInGitignore(projectPath);
    spinner.succeed('.gitignore updated');

    // Step 5: Generate core-config.yaml
    spinner.start('Creating core-config.yaml...');
    const yamlResult = await generateCoreConfigYAML(projectPath, wizardState);
    if (yamlResult.success) {
      results.files.push(yamlResult.file);
      spinner.succeed(`core-config.yaml created at ${path.relative(projectPath, yamlResult.file)}`);
    } else {
      throw new Error(yamlResult.error);
    }

    // Track skipped API keys
    results.skippedKeys = Object.entries(apiKeys)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    results.success = true;
    return results;

  } catch (error) {
    spinner.fail('Environment configuration failed');
    results.success = false;
    results.errors.push(error.message);
    return results;
  }
}

/**
 * Collect API keys from user via interactive prompts
 *
 * @returns {Promise<Object>} API keys object
 */
async function collectAPIKeys() {
  console.log(chalk.cyan('\n🔐 API Key Configuration'));
  console.log(chalk.gray('All API keys are optional. Press Enter to skip.\n'));

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'openaiKey',
      message: 'OpenAI API Key (optional):',
      mask: '*',
    },
    {
      type: 'password',
      name: 'anthropicKey',
      message: 'Anthropic API Key (optional):',
      mask: '*',
    },
    {
      type: 'password',
      name: 'exaKey',
      message: 'Exa Search API Key (optional):',
      mask: '*',
    },
    {
      type: 'password',
      name: 'clickupKey',
      message: 'ClickUp API Key (optional):',
      mask: '*',
    },
    {
      type: 'password',
      name: 'githubToken',
      message: 'GitHub Personal Access Token (optional):',
      mask: '*',
    },
  ]);

  // Show summary of skipped keys
  const skipped = Object.entries(answers)
    .filter(([_, value]) => !value || value.trim() === '')
    .map(([key]) => key.replace('Key', '').replace('Token', ''));

  if (skipped.length > 0) {
    console.log(chalk.gray(`\n⏭️  Skipped: ${skipped.join(', ')} (can configure later in .env)\n`));
  }

  return answers;
}

/**
 * Generate .env file from template
 *
 * @param {string} projectPath - Project root path
 * @param {Object} apiKeys - API keys from user
 * @param {Object} wizardState - Wizard state
 * @returns {Promise<Object>} Result with file path or error
 */
async function generateEnvFile(projectPath, apiKeys, _wizardState) {
  try {
    const envPath = path.join(projectPath, '.env');

    // Check if .env already exists
    if (await fs.pathExists(envPath)) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '.env file already exists. What would you like to do?',
          choices: [
            { name: 'Create backup and overwrite', value: 'backup' },
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Skip (keep existing)', value: 'skip' },
          ],
          default: 'backup',
        },
      ]);

      if (action === 'skip') {
        return { success: true, file: envPath, skipped: true };
      }

      if (action === 'backup') {
        const backupPath = `${envPath}.backup.${Date.now()}`;
        await fs.copy(envPath, backupPath);
        console.log(chalk.gray(`  Backup created: ${path.basename(backupPath)}`));
      }
    }

    // Load template
    const templatePath = path.join(__dirname, '../../templates/env/.env.template');
    let template = await fs.readFile(templatePath, 'utf8');

    // Replace placeholders
    const variables = {
      nodeEnv: 'development',
      aiosVersion: '2.1.0',
      openaiKey: apiKeys.openaiKey || '',
      anthropicKey: apiKeys.anthropicKey || '',
      exaKey: apiKeys.exaKey || '',
      clickupKey: apiKeys.clickupKey || '',
      githubToken: apiKeys.githubToken || '',
    };

    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    // Validate .env format (basic check)
    validateEnvFormat(template);

    // Write .env file
    await fs.writeFile(envPath, template, 'utf8');

    // Set file permissions (Unix only - 0600 = owner read/write only)
    if (process.platform !== 'win32') {
      try {
        await fs.chmod(envPath, 0o600);
      } catch (error) {
        console.warn(chalk.yellow(`  Warning: Could not set file permissions: ${error.message}`));
      }
    }

    return { success: true, file: envPath };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate .env.example file (safe to commit)
 *
 * @param {string} projectPath - Project root path
 * @returns {Promise<Object>} Result
 */
async function generateEnvExampleFile(projectPath) {
  try {
    const examplePath = path.join(projectPath, '.env.example');
    const templatePath = path.join(__dirname, '../../templates/env/.env.example');

    // Copy template as-is (no variable replacement)
    await fs.copy(templatePath, examplePath);

    return { success: true, file: examplePath };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Ensure .env is in .gitignore
 *
 * @param {string} projectPath - Project root path
 */
async function ensureEnvInGitignore(projectPath) {
  const gitignorePath = path.join(projectPath, '.gitignore');

  try {
    let gitignoreContent = '';

    if (await fs.pathExists(gitignorePath)) {
      gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
    }

    // Check if .env is already in .gitignore
    if (!gitignoreContent.includes('.env')) {
      // Add .env to .gitignore
      const envSection = '\n# Environment variables (contains secrets)\n.env\n.env.local\n.env.*.local\n';
      gitignoreContent += envSection;
      await fs.writeFile(gitignorePath, gitignoreContent, 'utf8');
    }

  } catch (error) {
    console.warn(chalk.yellow(`  Warning: Could not update .gitignore: ${error.message}`));
  }
}

/**
 * Generate core-config.yaml from template
 *
 * @param {string} projectPath - Project root path
 * @param {Object} wizardState - Wizard state
 * @returns {Promise<Object>} Result
 */
async function generateCoreConfigYAML(projectPath, wizardState) {
  try {
    const aiosCoreDir = path.join(projectPath, '.aios-core');
    const yamlPath = path.join(aiosCoreDir, 'core-config.yaml');

    // Ensure .aios-core directory exists
    await fs.ensureDir(aiosCoreDir);

    // Load template
    const templatePath = path.join(__dirname, '../../templates/env/core-config.yaml.template');
    let template = await fs.readFile(templatePath, 'utf8');

    // Prepare variables
    const projectName = wizardState.projectName || path.basename(projectPath);
    const projectType = wizardState.projectType || 'greenfield';
    const selectedIDEs = wizardState.selectedIDEs || [];
    const installedMCPs = wizardState.installedMCPs || [];

    // Format IDE config files list
    const ideConfigFiles = selectedIDEs.map(ide => `    - "${getIDEConfigFile(ide)}"`).join('\n') || '    []';

    const variables = {
      aiosVersion: '2.1.0',
      projectName,
      projectType,
      nodeEnv: 'development',
      timestamp: new Date().toISOString(),
      selectedIDEs: JSON.stringify(selectedIDEs),
      installedMCPs: JSON.stringify(installedMCPs),
      ideConfigFiles,
    };

    // Replace placeholders
    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    // Validate YAML syntax
    try {
      yaml.load(template);
    } catch (yamlError) {
      throw new Error(`Invalid YAML syntax: ${yamlError.message}`);
    }

    // Write core-config.yaml
    await fs.writeFile(yamlPath, template, 'utf8');

    return { success: true, file: yamlPath };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get config file path for IDE
 *
 * @param {string} ideKey - IDE key
 * @returns {string} Config file path
 */
function getIDEConfigFile(ideKey) {
  const ideConfigMap = {
    cursor: '.cursor/rules/aios-global.mdc',
    zed: '.zed/settings.json',
    antigravity: '.antigravity.yaml',
    continue: '.continue/config.json',
  };

  return ideConfigMap[ideKey] || ideKey;
}

/**
 * Validate .env file format
 *
 * @param {string} content - .env file content
 * @throws {Error} If format is invalid
 */
function validateEnvFormat(content) {
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;

    // Check KEY=value format
    if (!line.includes('=')) {
      throw new Error(`Invalid .env format at line ${i + 1}: Missing '=' separator`);
    }

    // Check for spaces around =
    const [key] = line.split('=');
    if (key.trim() !== key) {
      throw new Error(`Invalid .env format at line ${i + 1}: Spaces around key not allowed`);
    }
  }
}

/**
 * Display environment configuration summary
 *
 * @param {Object} results - Configuration results
 */
 
function displayConfigSummary(results) {
  console.log('');
  console.log(chalk.cyan('📊 Environment Configuration Summary:'));
  console.log('');

  if (results.files.length > 0) {
    console.log(chalk.green('✓ Files created:'));
    results.files.forEach(file => {
      console.log(`  - ${path.basename(file)}`);
    });
    console.log('');
  }

  if (results.skippedKeys.length > 0) {
    console.log(chalk.yellow('⏭️  Skipped API keys:'));
    results.skippedKeys.forEach(key => {
      console.log(`  - ${key} (configure later in .env)`);
    });
    console.log('');
  }

  console.log(chalk.gray('📋 Next steps:'));
  console.log(chalk.gray('  1. Add missing API keys to .env file'));
  console.log(chalk.gray('  2. Review core-config.yaml settings'));
  console.log(chalk.gray('  3. Never commit .env file (already in .gitignore)'));
  console.log('');
}
 

module.exports = {
  configureEnvironment,
  displayConfigSummary,
  collectAPIKeys,
  generateEnvFile,
  generateCoreConfigYAML,
  validateEnvFormat,
};
