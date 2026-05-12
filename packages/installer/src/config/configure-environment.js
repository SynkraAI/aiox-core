/**
 * Environment Configuration Module
 * Story 1.6: Environment Configuration
 *
 * Handles .env and core-config.yaml generation with interactive prompts
 *
 * @module configure-environment
 */

 
// Console statements are intentional for user feedback during installation

const fs = require('fs-extra');
const path = require('path');
const { password, select } = require('@clack/prompts');
const { generateEnvContent, generateEnvExample } = require('./templates/env-template');
const { generateCoreConfig } = require('./templates/core-config-template');
const {
  validateEnvFormat,
  validateApiKeyFormat,
  validateYamlSyntax,
  validateCoreConfigStructure,
  sanitizeInput,
} = require('./validation/config-validator');
const { getMergeStrategy, hasMergeStrategy } = require('../merger/index.js');

/**
 * Configure environment files (.env and core-config.yaml)
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.targetDir] - Target directory (default: process.cwd())
 * @param {string} [options.projectType] - Project type from Story 1.3
 * @param {Array<string>} [options.selectedIDEs] - Selected IDEs from Story 1.4
 * @param {Array<Object>} [options.mcpServers] - MCP servers from Story 1.5
 * @param {string} [options.userProfile] - User profile from Story 10.2 (bob|advanced)
 * @param {boolean} [options.skipPrompts] - Skip interactive prompts (for testing)
 * @param {boolean} [options.forceMerge] - Force merge mode (Story 9.4)
 * @param {boolean} [options.noMerge] - Disable merge mode (Story 9.4)
 * @returns {Promise<Object>} Configuration result
 */
async function configureEnvironment(options = {}) {
  const {
    targetDir = process.cwd(),
    projectType = 'GREENFIELD',
    selectedIDEs = [],
    mcpServers = [],
    userProfile = 'advanced', // Default for backward compatibility (Story 10.2)
    skipPrompts = false,
    forceMerge = false,
    noMerge = false,
  } = options;

  const results = {
    envCreated: false,
    envExampleCreated: false,
    coreConfigCreated: false,
    gitignoreUpdated: false,
    errors: [],
  };

  try {
    // Step 1: Check for existing .env and handle with merge/backup/overwrite
    const envPath = path.join(targetDir, '.env');
    const envExists = await fs.pathExists(envPath);
    let envAction = 'create'; // 'create', 'merge', 'overwrite', 'skip'
    const isBrownfield = projectType === 'BROWNFIELD' || projectType === 'EXISTING_AIOX';
    const canMerge = !noMerge && hasMergeStrategy(envPath);

    if (envExists) {
      // Story 9.4: Handle CLI flags for merge behavior
      if (forceMerge && canMerge) {
        // --merge flag: Force merge without prompting
        envAction = 'merge';
        console.log('🔀 Using merge mode (--merge flag)');
      } else if (skipPrompts) {
        // Quiet mode: default to merge for brownfield, overwrite for greenfield
        envAction = isBrownfield && canMerge ? 'merge' : 'overwrite';
      } else {
        // Interactive mode: Offer merge option for brownfield projects
        const choices = [];

        if (canMerge) {
          choices.push({
            value: 'merge',
            label: 'Merge (add new variables, keep existing)',
            hint: isBrownfield ? 'recommended' : '',
          });
        }

        choices.push(
          { value: 'backup', label: 'Backup and overwrite' },
          { value: 'overwrite', label: 'Overwrite completely' },
          { value: 'skip', label: 'Skip (keep existing)' },
        );

        envAction = await select({
          message: 'Found existing .env file. What would you like to do?',
          options: choices,
          initialValue: isBrownfield && canMerge ? 'merge' : 'backup',
        });

        if (envAction === 'backup') {
          const backupPath = path.join(targetDir, `.env.backup.${Date.now()}`);
          await fs.copy(envPath, backupPath);
          console.log(`✅ Backup created: ${backupPath}`);
          envAction = 'overwrite';
        }
      }
    }

    // Step 2: API keys are configured later via .env or aiox-master
    // Skipping prompts during installation for better UX
    const apiKeys = {};

    if (!skipPrompts) {
      console.log('\n💡 API keys can be configured later in .env file or via aiox-master');
    }

    // Step 3: Generate .env content
    const envContent = generateEnvContent(apiKeys);

    // Validate .env format
    const envValidation = validateEnvFormat(envContent);
    if (!envValidation.valid) {
      results.errors.push(...envValidation.errors);
      throw new Error('Generated .env file has invalid format');
    }

    // Step 4: Write .env file based on action
    if (envAction === 'skip') {
      console.log('⏭️  Skipped .env file (keeping existing)');
    } else if (envAction === 'merge' && envExists) {
      // Merge existing with new
      const existingContent = await fs.readFile(envPath, 'utf8');
      const merger = getMergeStrategy(envPath);
      const mergeResult = await merger.merge(existingContent, envContent);

      await fs.writeFile(envPath, mergeResult.content, { encoding: 'utf8' });
      results.envCreated = true;

      console.log('✅ Merged .env file');
      console.log(`   📋 Preserved: ${mergeResult.stats.preserved}, Added: ${mergeResult.stats.added}`);
      if (mergeResult.stats.conflicts > 0) {
        console.log(`   ⚠️  Suggestions: ${mergeResult.stats.conflicts} (see comments in file)`);
      }
    } else {
      // Create new or overwrite
      await fs.writeFile(envPath, envContent, { encoding: 'utf8' });
      results.envCreated = true;
      console.log('✅ Created .env file');
    }

    // Set file permissions (0600 on Unix systems)
    if (results.envCreated && process.platform !== 'win32') {
      await fs.chmod(envPath, 0o600);
    }

    // Step 4: Generate and write .env.example
    const envExamplePath = path.join(targetDir, '.env.example');
    const envExampleContent = generateEnvExample();
    await fs.writeFile(envExamplePath, envExampleContent, { encoding: 'utf8' });
    results.envExampleCreated = true;
    console.log('✅ Created .env.example file');

    // Step 5: Update .gitignore
    await updateGitignore(targetDir);
    results.gitignoreUpdated = true;
    console.log('✅ Updated .gitignore');

    // Step 6: Generate and write core-config.yaml
    const coreConfigDir = path.join(targetDir, '.aiox-core');
    await fs.ensureDir(coreConfigDir);

    const coreConfigContent = generateCoreConfig({
      projectType,
      selectedIDEs,
      mcpServers,
      userProfile,
      aioxVersion: '2.1.0',
    });

    // Validate YAML syntax
    const yamlValidation = validateYamlSyntax(coreConfigContent);
    if (!yamlValidation.valid) {
      results.errors.push(yamlValidation.error);
      throw new Error('Generated core-config.yaml has invalid YAML syntax');
    }

    // Validate core config structure
    const structureValidation = validateCoreConfigStructure(yamlValidation.parsed);
    if (!structureValidation.valid) {
      results.errors.push(...structureValidation.errors);
      throw new Error('Generated core-config.yaml has invalid structure');
    }

    const coreConfigPath = path.join(coreConfigDir, 'core-config.yaml');
    await fs.writeFile(coreConfigPath, coreConfigContent, { encoding: 'utf8' });
    results.coreConfigCreated = true;
    console.log('✅ Created .aiox-core/core-config.yaml');

    return results;
  } catch (error) {
    results.errors.push(error.message);
    throw error;
  }
}

/**
 * Collect API keys via interactive prompts
 *
 * @returns {Promise<Object>} API keys object
 */
async function collectApiKeys() {
  const keys = {};

  // OpenAI API Key
  const openaiKey = await password({
    message: 'OpenAI API Key (optional):',
    validate: (value) => {
      if (!value) return; // Empty is ok (skip)
      const sanitized = sanitizeInput(value);
      const validation = validateApiKeyFormat(sanitized, 'openai');
      return validation.valid ? undefined : validation.error;
    },
  });

  if (openaiKey && typeof openaiKey === 'string') {
    keys.openai = sanitizeInput(openaiKey);
    console.log('✓ OpenAI API key configured');
  } else {
    console.log('⊘ Skipped - configure later in .env');
  }

  // Anthropic API Key
  const anthropicKey = await password({
    message: 'Anthropic API Key (optional):',
    validate: (value) => {
      if (!value) return; // Empty is ok (skip)
      const sanitized = sanitizeInput(value);
      const validation = validateApiKeyFormat(sanitized, 'anthropic');
      return validation.valid ? undefined : validation.error;
    },
  });

  if (anthropicKey && typeof anthropicKey === 'string') {
    keys.anthropic = sanitizeInput(anthropicKey);
    console.log('✓ Anthropic API key configured');
  } else {
    console.log('⊘ Skipped - configure later in .env');
  }

  // ClickUp API Key (optional service)
  const clickupKey = await password({
    message: 'ClickUp API Key (optional):',
    validate: (value) => {
      if (!value) return; // Empty is ok (skip)
      const sanitized = sanitizeInput(value);
      const validation = validateApiKeyFormat(sanitized);
      return validation.valid ? undefined : validation.error;
    },
  });

  if (clickupKey && typeof clickupKey === 'string') {
    keys.clickup = sanitizeInput(clickupKey);
    console.log('✓ ClickUp API key configured');
  } else {
    console.log('⊘ Skipped - configure later in .env');
  }

  // GitHub Token (optional service)
  const githubToken = await password({
    message: 'GitHub Personal Access Token (optional):',
    validate: (value) => {
      if (!value) return; // Empty is ok (skip)
      const sanitized = sanitizeInput(value);
      const validation = validateApiKeyFormat(sanitized, 'github');
      return validation.valid ? undefined : validation.error;
    },
  });

  if (githubToken && typeof githubToken === 'string') {
    keys.github = sanitizeInput(githubToken);
    console.log('✓ GitHub token configured');
  } else {
    console.log('⊘ Skipped - configure later in .env');
  }

  // Exa API Key (for web search)
  const exaKey = await password({
    message: 'Exa API Key (optional):',
    validate: (value) => {
      if (!value) return; // Empty is ok (skip)
      const sanitized = sanitizeInput(value);
      const validation = validateApiKeyFormat(sanitized);
      return validation.valid ? undefined : validation.error;
    },
  });

  if (exaKey && typeof exaKey === 'string') {
    keys.exa = sanitizeInput(exaKey);
    console.log('✓ Exa API key configured');
  } else {
    console.log('⊘ Skipped - configure later in .env');
  }

  return keys;
}

/**
 * Update .gitignore to include critical entries for AIOX projects
 *
 * @param {string} targetDir - Target directory
 * @returns {Promise<void>}
 */
async function updateGitignore(targetDir) {
  const gitignorePath = path.join(targetDir, '.gitignore');
  let gitignoreContent = '';

  // Read existing .gitignore if it exists
  if (await fs.pathExists(gitignorePath)) {
    gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
  }

  // Critical entries that must be in .gitignore
  const criticalEntries = {
    'Environment & Secrets': ['.env', '.env.local', '.env.*.local', '*.key', '*.pem'],
    'Dependencies': ['node_modules/', 'node_modules'],
    'Build & Logs': ['dist/', 'build/', '*.log', 'logs/'],
    'IDE & OS': ['.DS_Store', 'Thumbs.db', '.idea/', '*.swp'],
    'AIOX Local': ['.aiox-core/local/', '.claude/settings.local.json', '.aiox/install-log.txt'],
  };

  const lines = gitignoreContent.split('\n').map(line => line.trim());
  const entriesToAdd = [];

  // Check each critical entry
  for (const [category, entries] of Object.entries(criticalEntries)) {
    const missingEntries = entries.filter(entry => {
      // Check if entry already exists (with or without leading /)
      const normalizedEntry = entry.replace(/^\//, '');
      return !lines.some(line => {
        const normalizedLine = line.replace(/^\//, '');
        return normalizedLine === normalizedEntry || normalizedLine === entry;
      });
    });

    if (missingEntries.length > 0) {
      entriesToAdd.push({ category, entries: missingEntries });
    }
  }

  // Add missing entries
  if (entriesToAdd.length > 0) {
    let newContent = gitignoreContent.trim();

    for (const { category, entries } of entriesToAdd) {
      const section = `\n\n# ${category} (AIOX)\n${entries.join('\n')}`;
      newContent += section;
    }

    newContent += '\n';

    await fs.writeFile(gitignorePath, newContent, { encoding: 'utf8' });
  }
}

module.exports = {
  configureEnvironment,
  collectApiKeys,
  updateGitignore,
};
