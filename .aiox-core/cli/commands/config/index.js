/**
 * Config Command Module
 *
 * CLI commands for the layered configuration system (ADR-PRO-002).
 *
 * Subcommands:
 *   aiox config show [--level <n>] [--app <name>] [--debug]
 *   aiox config diff --levels <a>,<b>
 *   aiox config migrate [--dry-run] [--force]
 *   aiox config validate [--level <n>]
 *   aiox config init-local
 *
 * @module cli/commands/config
 * @version 1.0.0
 * @story PRO-4 — Core-Config Split Implementation
 */

'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// Resolve core config modules (relative from .aiox-core/cli/commands/config/)
const configResolverPath = path.resolve(__dirname, '..', '..', '..', 'core', 'config', 'config-resolver');
const mergeUtilsPath = path.resolve(__dirname, '..', '..', '..', 'core', 'config', 'merge-utils');
const envInterpolatorPath = path.resolve(__dirname, '..', '..', '..', 'core', 'config', 'env-interpolator');

/**
 * Lazy-load config modules (avoids failing at import time if yaml not installed)
 */
function loadModules() {
  const { resolveConfig, isLegacyMode, getConfigAtLevel, CONFIG_FILES } = require(configResolverPath);
  const { deepMerge } = require(mergeUtilsPath);
  const { lintEnvPatterns } = require(envInterpolatorPath);
  return { resolveConfig, isLegacyMode, getConfigAtLevel, CONFIG_FILES, deepMerge, lintEnvPatterns };
}

/**
 * Get project root (cwd)
 */
function getProjectRoot() {
  return process.cwd();
}

// ---------------------------------------------------------------------------
// aiox config show
// ---------------------------------------------------------------------------

function showAction(options) {
  const { resolveConfig, getConfigAtLevel } = loadModules();
  const root = getProjectRoot();

  try {
    if (options.level) {
      // Show a specific level (raw, no merge)
      const data = getConfigAtLevel(root, options.level, { appDir: options.app });
      if (!data) {
        console.error(`No config found for level: ${options.level}`);
        process.exit(1);
      }
      console.log(yaml.dump(data, { lineWidth: 120, noRefs: true }));
      return;
    }

    // Show full resolved config
    const result = resolveConfig(root, {
      appDir: options.app,
      debug: options.debug,
      skipCache: true,
    });

    if (options.debug && result.sources) {
      // Debug mode: show each value with source annotation
      printDebugConfig(result.config, result.sources);
    } else {
      console.log(yaml.dump(result.config, { lineWidth: 120, noRefs: true }));
    }

    // Print warnings
    if (result.warnings && result.warnings.length > 0) {
      console.error('');
      for (const w of result.warnings) {
        console.error(`  WARNING: ${w}`);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Print config with source annotations for --debug mode.
 */
function printDebugConfig(config, sources, prefix = '') {
  for (const [key, value] of Object.entries(config)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const source = sources[fullKey];
    const tag = source ? `[${source.level}: ${path.basename(source.file)}]` : '[unknown]';

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      console.log(`${fullKey}: ${tag}`);
      printDebugConfig(value, sources, fullKey);
    } else {
      const display = Array.isArray(value)
        ? JSON.stringify(value)
        : String(value);
      console.log(`  ${fullKey} = ${display}  ${tag}`);
    }
  }
}

// ---------------------------------------------------------------------------
// aiox config diff
// ---------------------------------------------------------------------------

function diffAction(options) {
  const { getConfigAtLevel } = loadModules();
  const root = getProjectRoot();

  if (!options.levels) {
    console.error('Error: --levels is required (e.g., --levels 1,2)');
    process.exit(1);
  }

  const [levelA, levelB] = options.levels.split(',').map(l => l.trim());
  if (!levelA || !levelB) {
    console.error('Error: --levels requires two levels separated by comma (e.g., --levels 1,2)');
    process.exit(1);
  }

  try {
    const configA = getConfigAtLevel(root, levelA, { appDir: options.app }) || {};
    const configB = getConfigAtLevel(root, levelB, { appDir: options.app }) || {};

    const diff = computeDiff(configA, configB, levelA, levelB);

    if (diff.length === 0) {
      console.log(`No differences between level ${levelA} and level ${levelB}.`);
      return;
    }

    console.log(`Differences: ${levelA} vs ${levelB}`);
    console.log('='.repeat(60));
    for (const entry of diff) {
      switch (entry.type) {
        case 'added':
          console.log(`  + ${entry.key}: ${formatValue(entry.valueB)}  [only in ${levelB}]`);
          break;
        case 'removed':
          console.log(`  - ${entry.key}: ${formatValue(entry.valueA)}  [only in ${levelA}]`);
          break;
        case 'changed':
          console.log(`  ~ ${entry.key}:`);
          console.log(`      ${levelA}: ${formatValue(entry.valueA)}`);
          console.log(`      ${levelB}: ${formatValue(entry.valueB)}`);
          break;
      }
    }
    console.log(`\nTotal: ${diff.length} difference(s)`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function computeDiff(objA, objB, _labelA, _labelB, prefix = '') {
  const diff = [];
  const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);

  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const inA = key in objA;
    const inB = key in objB;

    if (!inA) {
      diff.push({ type: 'added', key: fullKey, valueB: objB[key] });
    } else if (!inB) {
      diff.push({ type: 'removed', key: fullKey, valueA: objA[key] });
    } else if (isObj(objA[key]) && isObj(objB[key])) {
      diff.push(...computeDiff(objA[key], objB[key], _labelA, _labelB, fullKey));
    } else if (JSON.stringify(objA[key]) !== JSON.stringify(objB[key])) {
      diff.push({ type: 'changed', key: fullKey, valueA: objA[key], valueB: objB[key] });
    }
  }

  return diff;
}

function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

function formatValue(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

// ---------------------------------------------------------------------------
// aiox config migrate
// ---------------------------------------------------------------------------

function migrateAction(options) {
  const { isLegacyMode, resolveConfig, CONFIG_FILES } = loadModules();
  const root = getProjectRoot();

  try {
    if (!isLegacyMode(root)) {
      console.log('Project already uses layered config (framework-config.yaml found).');
      console.log('Nothing to migrate.');
      return;
    }

    const legacyPath = path.join(root, CONFIG_FILES.legacy);
    const legacyContent = fs.readFileSync(legacyPath, 'utf8');
    const legacyConfig = yaml.load(legacyContent);

    // Section-to-level mapping per ADR-PRO-002
    const l1Sections = splitL1(legacyConfig);
    const l2Sections = splitL2(legacyConfig);
    const l4Sections = splitL4(legacyConfig);

    if (options.dryRun) {
      console.log('=== DRY RUN — no files will be written ===\n');
      console.log('--- framework-config.yaml (L1) ---');
      console.log(yaml.dump(l1Sections, { lineWidth: 120 }));
      console.log('--- project-config.yaml (L2) ---');
      console.log(yaml.dump(l2Sections, { lineWidth: 120 }));
      console.log('--- local-config.yaml (L4) ---');
      console.log(yaml.dump(l4Sections, { lineWidth: 120 }));
      return;
    }

    // Check existing split files
    const fwPath = path.join(root, CONFIG_FILES.framework);
    const projPath = path.join(root, CONFIG_FILES.project);
    const localPath = path.join(root, CONFIG_FILES.local);

    if (!options.force) {
      const exists = [fwPath, projPath, localPath].filter(p => fs.existsSync(p));
      if (exists.length > 0) {
        console.error('Split config files already exist:');
        exists.forEach((p) => { console.error(`  ${p}`); });
        console.error('Use --force to overwrite.');
        process.exit(1);
      }
    }

    // Create backup
    const backupPath = legacyPath + '.backup';
    fs.copyFileSync(legacyPath, backupPath);
    console.log(`Backup created: ${backupPath}`);

    // Write split files
    const header1 = '# AIOX Framework Configuration (Level 1)\n# DO NOT EDIT — Part of the AIOX framework.\n# Override in project-config.yaml or local-config.yaml.\n\n';
    fs.writeFileSync(fwPath, header1 + yaml.dump(l1Sections, { lineWidth: 120 }));
    console.log(`Created: ${CONFIG_FILES.framework}`);

    const header2 = '# AIOX Project Configuration (Level 2)\n# Project-specific settings shared across the team.\n\n';
    fs.writeFileSync(projPath, header2 + yaml.dump(l2Sections, { lineWidth: 120 }));
    console.log(`Created: ${CONFIG_FILES.project}`);

    const header4 = '# AIOX Local Configuration (Level 4)\n# Machine-specific overrides. DO NOT commit to git.\n\n';
    fs.writeFileSync(localPath, header4 + yaml.dump(l4Sections, { lineWidth: 120 }));
    console.log(`Created: ${CONFIG_FILES.local}`);

    // Update .gitignore if needed
    ensureGitignore(root, '.aiox-core/local-config.yaml');

    // Validate: resolved config should match original
    const resolved = resolveConfig(root, { skipCache: true });
    const originalStr = JSON.stringify(legacyConfig);
    const resolvedStr = JSON.stringify(resolved.config);

    if (originalStr === resolvedStr) {
      console.log('\nValidation: PASS — Resolved config matches original.');
    } else {
      console.log('\nValidation: WARNING — Resolved config differs from original.');
      console.log('This may be expected due to key normalization. Run `aiox config diff` to inspect.');
    }

    console.log('\nMigration complete. Original preserved at core-config.yaml.backup');
  } catch (error) {
    console.error(`Migration error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Extract L1 (Framework) sections from monolithic config.
 */
function splitL1(config) {
  const l1 = {};

  // metadata (framework portion)
  if (config.markdownExploder !== undefined) l1.markdownExploder = config.markdownExploder;
  l1.metadata = { name: 'Synkra AIOX', framework_version: '3.12.0' };

  // resource_locations (Section 3)
  if (config.toolsLocation) l1.resource_locations = { tools_dir: config.toolsLocation };
  if (config.scriptsLocation) {
    l1.resource_locations = l1.resource_locations || {};
    l1.resource_locations.scripts = config.scriptsLocation;
  }
  if (config.dataLocation) {
    l1.resource_locations = l1.resource_locations || {};
    l1.resource_locations.data_dir = config.dataLocation;
  }
  if (config.elicitationLocation) {
    l1.resource_locations = l1.resource_locations || {};
    l1.resource_locations.elicitation_dir = config.elicitationLocation;
  }
  if (config.squadsTemplateLocation) {
    l1.resource_locations = l1.resource_locations || {};
    l1.resource_locations.squads_template_dir = config.squadsTemplateLocation;
  }
  if (config.mindsLocation) {
    l1.resource_locations = l1.resource_locations || {};
    l1.resource_locations.minds_dir = config.mindsLocation;
  }

  // performance_defaults (Section 6 - defaults)
  if (config.lazyLoading) l1.performance_defaults = { lazy_loading: config.lazyLoading };
  if (config.git) {
    l1.performance_defaults = l1.performance_defaults || {};
    l1.performance_defaults.git = config.git;
  }

  // utility_scripts_registry (Section 11)
  if (config.utils) l1.utility_scripts_registry = config.utils;

  // ide_sync_system (Section 12)
  if (config.ideSync) l1.ide_sync_system = config.ideSync;

  return l1;
}

/**
 * Extract L2 (Project) sections from monolithic config.
 */
function splitL2(config) {
  const l2 = {};

  // project metadata (Section 1 - project portion)
  if (config.project) l2.project = config.project;

  // documentation_paths (Section 2)
  const docs = {};
  if (config.qa) docs.qa_dir = config.qa.qaLocation;
  if (config.prd) {
    docs.prd_file = config.prd.prdFile;
    docs.prd_version = config.prd.prdVersion;
    docs.prd_sharded = config.prd.prdSharded;
    docs.prd_sharded_location = config.prd.prdShardedLocation;
  }
  if (config.architecture) {
    docs.architecture_file = config.architecture.architectureFile;
    docs.architecture_version = config.architecture.architectureVersion;
    docs.architecture_sharded = config.architecture.architectureSharded;
    docs.architecture_sharded_location = config.architecture.architectureShardedLocation;
  }
  if (config.devStoryLocation) docs.stories_dir = config.devStoryLocation;
  if (config.devDebugLog) docs.dev_debug_log = config.devDebugLog;
  if (config.slashPrefix) docs.slash_prefix = config.slashPrefix;
  if (config.customTechnicalDocuments !== undefined) docs.custom_technical_documents = config.customTechnicalDocuments;
  if (config.devLoadAlwaysFiles) docs.dev_load_always_files = config.devLoadAlwaysFiles;
  if (config.devLoadAlwaysFilesFallback) docs.dev_load_always_files_fallback = config.devLoadAlwaysFilesFallback;
  if (Object.keys(docs).length > 0) l2.documentation_paths = docs;

  // github_integration (Section 8)
  if (config.github) l2.github_integration = config.github;

  // coderabbit_integration (Section 9 - non-secret portion)
  if (config.coderabbit_integration) {
    const cr = { ...config.coderabbit_integration };
    // Remove machine-specific keys (they go to L4)
    delete cr.installation_mode;
    delete cr.wsl_config;
    delete cr.commands;
    l2.coderabbit_integration = cr;
  }

  // squads (Section 10)
  if (config.squads) l2.squads = config.squads;

  // logging (Section 7)
  const logging = {};
  if (config.decisionLogging) logging.decision_logging = config.decisionLogging;
  if (config.projectStatus) logging.project_status = config.projectStatus;
  if (config.agentIdentity) logging.agent_identity = config.agentIdentity;
  if (Object.keys(logging).length > 0) l2.logging = logging;

  // pvMindContext
  if (config.pvMindContext) l2.pv_mind_context = config.pvMindContext;

  // storyBacklog
  if (config.storyBacklog) l2.story_backlog = config.storyBacklog;

  // auto_claude (Section 13)
  if (config.autoClaude) l2.auto_claude = config.autoClaude;

  return l2;
}

/**
 * Extract L4 (Local) sections from monolithic config.
 */
function splitL4(config) {
  const l4 = {};

  // ide_configuration (Section 4)
  if (config.ide) l4.ide = config.ide;

  // mcp_configuration (Section 5)
  if (config.mcp) l4.mcp = config.mcp;

  // coderabbit secrets/machine (Section 9 - machine portion)
  if (config.coderabbit_integration) {
    const cr = config.coderabbit_integration;
    const l4cr = {};
    if (cr.installation_mode) l4cr.installation_mode = cr.installation_mode;
    if (cr.wsl_config) l4cr.wsl_config = cr.wsl_config;
    if (cr.commands) l4cr.commands = cr.commands;
    if (Object.keys(l4cr).length > 0) l4.coderabbit_integration = l4cr;
  }

  return l4;
}

/**
 * Ensure a path is in .gitignore
 */
function ensureGitignore(root, entry) {
  const gitignorePath = path.join(root, '.gitignore');
  if (!fs.existsSync(gitignorePath)) return;

  const content = fs.readFileSync(gitignorePath, 'utf8');
  if (!content.includes(entry)) {
    fs.appendFileSync(gitignorePath, `\n# Local config (machine-specific secrets)\n${entry}\n`);
    console.log(`.gitignore updated: added ${entry}`);
  }
}

// ---------------------------------------------------------------------------
// aiox config validate
// ---------------------------------------------------------------------------

function validateAction(options) {
  const { resolveConfig, getConfigAtLevel, CONFIG_FILES } = loadModules();
  const { lintEnvPatterns } = require(envInterpolatorPath);
  const root = getProjectRoot();

  try {
    const issues = [];

    if (options.level) {
      // Validate specific level
      const data = getConfigAtLevel(root, options.level);
      if (!data) {
        console.error(`No config found for level: ${options.level}`);
        process.exit(1);
      }
      validateYamlSyntax(root, options.level, issues);
    } else {
      // Validate all levels
      const levels = ['framework', 'project', 'pro', 'local'];
      for (const level of levels) {
        validateYamlSyntax(root, level, issues);
      }

      // Check env patterns in L1/L2
      const l1 = getConfigAtLevel(root, 'framework');
      if (l1) {
        const l1Lint = lintEnvPatterns(l1, CONFIG_FILES.framework);
        issues.push(...l1Lint.map(w => `[LINT WARNING] ${w}`));
      }

      const l2 = getConfigAtLevel(root, 'project');
      if (l2) {
        const l2Lint = lintEnvPatterns(l2, CONFIG_FILES.project);
        issues.push(...l2Lint.map(w => `[LINT WARNING] ${w}`));
      }
    }

    if (issues.length === 0) {
      console.log('Config validation: PASS');
    } else {
      console.log(`Config validation: ${issues.length} issue(s) found`);
      for (const issue of issues) {
        console.log(`  ${issue}`);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error(`Validation error: ${error.message}`);
    process.exit(1);
  }
}

function validateYamlSyntax(root, level, issues) {
  const { CONFIG_FILES } = loadModules();
  const fileMap = {
    framework: CONFIG_FILES.framework,
    project: CONFIG_FILES.project,
    pro: CONFIG_FILES.pro,
    local: CONFIG_FILES.local,
  };

  const relativePath = fileMap[level];
  if (!relativePath) return;

  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return; // Optional files are OK to be missing

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    yaml.load(content);
    console.log(`  ${level}: OK (${relativePath})`);
  } catch (error) {
    issues.push(`[YAML ERROR] ${relativePath}: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// aiox config init-local
// ---------------------------------------------------------------------------

function initLocalAction() {
  const root = getProjectRoot();
  const templatePath = path.join(root, '.aiox-core', 'local-config.yaml.template');
  const targetPath = path.join(root, '.aiox-core', 'local-config.yaml');

  if (!fs.existsSync(templatePath)) {
    console.error('Template not found: .aiox-core/local-config.yaml.template');
    process.exit(1);
  }

  if (fs.existsSync(targetPath)) {
    console.error('local-config.yaml already exists. Remove it first or edit directly.');
    process.exit(1);
  }

  fs.copyFileSync(templatePath, targetPath);
  console.log('Created: .aiox-core/local-config.yaml (from template)');
  console.log('Edit this file to customize your machine-specific settings.');

  // Ensure gitignore
  ensureGitignore(root, '.aiox-core/local-config.yaml');
}

// ---------------------------------------------------------------------------
// Command builder
// ---------------------------------------------------------------------------

/**
 * Create the `aiox config` command with all subcommands.
 * @returns {Command}
 */
function createConfigCommand() {
  const configCmd = new Command('config')
    .description('Manage layered configuration (ADR-PRO-002)');

  // aiox config show
  configCmd
    .command('show')
    .description('Show resolved configuration')
    .option('-l, --level <level>', 'Show specific level (1, 2, pro, 3, 4)')
    .option('-a, --app <name>', 'Include app-specific config (L3)')
    .option('-d, --debug', 'Show source annotations for each value')
    .action(showAction);

  // aiox config diff
  configCmd
    .command('diff')
    .description('Compare configuration between two levels')
    .requiredOption('--levels <a,b>', 'Two levels to compare (e.g., 1,2)')
    .option('-a, --app <name>', 'Include app-specific context')
    .action(diffAction);

  // aiox config migrate
  configCmd
    .command('migrate')
    .description('Migrate monolithic core-config.yaml to layered files')
    .option('--dry-run', 'Preview without writing files')
    .option('--force', 'Overwrite existing split files')
    .action(migrateAction);

  // aiox config validate
  configCmd
    .command('validate')
    .description('Validate YAML syntax and lint config files')
    .option('-l, --level <level>', 'Validate specific level only')
    .action(validateAction);

  // aiox config init-local
  configCmd
    .command('init-local')
    .description('Create local-config.yaml from template')
    .action(initLocalAction);

  return configCmd;
}

module.exports = {
  createConfigCommand,
};
