#!/usr/bin/env node

/**
 * IDE Sync - Main orchestrator for syncing agents to IDEs
 * @story 6.19 - IDE Command Auto-Sync System
 *
 * Commands:
 *   sync     - Sync agents to all enabled IDEs
 *   validate - Validate sync status (report mode)
 *   report   - Generate sync status report
 *
 * Flags:
 *   --ide <name>  - Sync specific IDE only
 *   --strict      - Exit with code 1 if drift detected (CI mode)
 *   --dry-run     - Preview changes without writing
 *   --verbose     - Show detailed output
 *   --quiet       - Minimal output (for pre-commit hooks)
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

const { parseAllAgents } = require('./agent-parser');
const { generateAllRedirects, writeRedirects } = require('./redirect-generator');
const { validateAllIdes, formatValidationReport } = require('./validator');

// Transformers
const claudeCodeTransformer = require('./transformers/claude-code');
const cursorTransformer = require('./transformers/cursor');
const windsurfTransformer = require('./transformers/windsurf');
const antigravityTransformer = require('./transformers/antigravity');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Load core-config.yaml and extract ideSync section
 * @param {string} projectRoot - Project root directory
 * @returns {object} - ideSync configuration
 */
function loadConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.aios-core', 'core-config.yaml');

  // Default configuration
  const defaultConfig = {
    enabled: true,
    source: '.aios-core/development/agents',
    targets: {
      'claude-code': {
        enabled: true,
        path: '.claude/commands/AIOS/agents',
        format: 'full-markdown-yaml',
      },
      cursor: {
        enabled: true,
        path: '.cursor/rules/agents',
        format: 'condensed-rules',
      },
      windsurf: {
        enabled: false, // Disabled - consolidating to core IDEs (v3.10.0)
        path: '.windsurf/rules/agents',
        format: 'xml-tagged-markdown',
      },
      antigravity: {
        enabled: true,
        path: '.antigravity/rules/agents',
        format: 'cursor-style',
      },
    },
    redirects: {
      'aios-developer': 'aios-master',
      'aios-orchestrator': 'aios-master',
      'db-sage': 'data-engineer',
      'github-devops': 'devops',
    },
    validation: {
      strictMode: true,
      failOnDrift: true,
      failOnOrphaned: false,
    },
  };

  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      const config = yaml.load(content);

      if (config && config.ideSync) {
        return { ...defaultConfig, ...config.ideSync };
      }
    }
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not load config, using defaults${colors.reset}`);
  }

  return defaultConfig;
}

/**
 * Get transformer for IDE format
 * @param {string} format - IDE format name
 * @returns {object} - Transformer module
 */
function getTransformer(format) {
  const transformers = {
    'full-markdown-yaml': claudeCodeTransformer,
    'condensed-rules': cursorTransformer,
    'xml-tagged-markdown': windsurfTransformer,
    'cursor-style': antigravityTransformer,
  };

  return transformers[format] || claudeCodeTransformer;
}

/**
 * Sync agents to a specific IDE
 * @param {object[]} agents - Parsed agent data
 * @param {object} ideConfig - IDE configuration
 * @param {string} ideName - IDE name
 * @param {string} projectRoot - Project root
 * @param {object} options - Sync options
 * @returns {object} - Sync result
 */
function syncIde(agents, ideConfig, ideName, projectRoot, options) {
  const result = {
    ide: ideName,
    targetDir: path.join(projectRoot, ideConfig.path),
    files: [],
    errors: [],
  };

  if (!ideConfig.enabled) {
    result.skipped = true;
    return result;
  }

  const transformer = getTransformer(ideConfig.format);

  // Ensure target directory exists
  if (!options.dryRun) {
    fs.ensureDirSync(result.targetDir);
  }

  // Transform and write each agent
  for (const agent of agents) {
    // Skip agents with fatal errors (no YAML block found or failed parse with no fallback)
    if (agent.error && agent.error === 'Failed to parse YAML') {
      result.errors.push({
        agent: agent.id,
        error: agent.error,
      });
      continue;
    }
    if (agent.error && agent.error === 'No YAML block found') {
      result.errors.push({
        agent: agent.id,
        error: agent.error,
      });
      continue;
    }

    try {
      const content = transformer.transform(agent);
      const filename = transformer.getFilename(agent);
      const targetPath = path.join(result.targetDir, filename);

      if (!options.dryRun) {
        fs.writeFileSync(targetPath, content, 'utf8');
      }

      result.files.push({
        agent: agent.id,
        filename,
        path: targetPath,
        content,
      });
    } catch (error) {
      result.errors.push({
        agent: agent.id,
        error: error.message,
      });
    }
  }

  return result;
}

/**
 * Execute sync command
 * @param {object} options - Command options
 */
async function commandSync(options) {
  const projectRoot = process.cwd();
  const config = loadConfig(projectRoot);

  if (!config.enabled) {
    if (!options.quiet) {
      console.log(`${colors.yellow}IDE sync is disabled in config${colors.reset}`);
    }
    return;
  }

  if (!options.quiet) {
    console.log(`${colors.bright}${colors.blue}🔄 IDE Sync${colors.reset}`);
    console.log('');
  }

  // Parse all agents
  const agentsDir = path.join(projectRoot, config.source);
  if (!options.quiet) {
    console.log(`${colors.dim}Source: ${agentsDir}${colors.reset}`);
  }

  const agents = parseAllAgents(agentsDir);
  if (!options.quiet) {
    console.log(`${colors.dim}Found ${agents.length} agents${colors.reset}`);
    console.log('');
  }

  // Filter IDEs if --ide flag specified
  let targetIdes = Object.entries(config.targets);
  if (options.ide) {
    targetIdes = targetIdes.filter(([name]) => name === options.ide);
    if (targetIdes.length === 0) {
      console.error(`${colors.red}Error: IDE '${options.ide}' not found in config${colors.reset}`);
      process.exit(1);
    }
  }

  const results = [];

  // Sync to each IDE
  for (const [ideName, ideConfig] of targetIdes) {
    if (!ideConfig.enabled) {
      if (!options.quiet) {
        console.log(`${colors.dim}⏭️  ${ideName}: skipped (disabled)${colors.reset}`);
      }
      continue;
    }

    if (!options.quiet) {
      console.log(`${colors.cyan}📁 Syncing ${ideName}...${colors.reset}`);
    }

    const result = syncIde(agents, ideConfig, ideName, projectRoot, options);
    results.push(result);

    // Generate redirects for this IDE
    const redirects = generateAllRedirects(config.redirects, result.targetDir, ideConfig.format);
    const redirectResult = writeRedirects(redirects, options.dryRun);

    if (options.verbose && !options.quiet) {
      console.log(`   ${colors.dim}Target: ${result.targetDir}${colors.reset}`);
    }

    const agentCount = result.files.length;
    const redirectCount = redirectResult.written.length;
    const errorCount = result.errors.length;

    if (!options.quiet) {
      let status = `${colors.green}✓${colors.reset}`;
      if (errorCount > 0) {
        status = `${colors.yellow}⚠${colors.reset}`;
      }

      console.log(
        `   ${status} ${agentCount} agents, ${redirectCount} redirects${errorCount > 0 ? `, ${errorCount} errors` : ''}`
      );

      if (options.verbose && result.errors.length > 0) {
        for (const err of result.errors) {
          console.log(`   ${colors.red}✗ ${err.agent}: ${err.error}${colors.reset}`);
        }
      }
    }
  }

  // Summary
  const totalFiles = results.reduce((sum, r) => sum + r.files.length, 0);
  const totalRedirects =
    Object.keys(config.redirects).length * targetIdes.filter(([, c]) => c.enabled).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  if (!options.quiet) {
    console.log('');

    if (options.dryRun) {
      console.log(
        `${colors.yellow}Dry run: ${totalFiles} agents + ${totalRedirects} redirects would be written${colors.reset}`
      );
    } else {
      console.log(
        `${colors.green}✅ Sync complete: ${totalFiles} agents + ${totalRedirects} redirects${colors.reset}`
      );
    }

    if (totalErrors > 0) {
      console.log(`${colors.yellow}⚠️  ${totalErrors} errors occurred${colors.reset}`);
    }
  }
}

/**
 * Execute validate command
 * @param {object} options - Command options
 */
async function commandValidate(options) {
  const projectRoot = process.cwd();
  const config = loadConfig(projectRoot);

  if (!config.enabled) {
    console.log(`${colors.yellow}IDE sync is disabled in config${colors.reset}`);
    return;
  }

  console.log(`${colors.bright}${colors.blue}🔍 IDE Sync Validation${colors.reset}`);
  console.log('');

  // Parse all agents
  const agentsDir = path.join(projectRoot, config.source);
  const agents = parseAllAgents(agentsDir);

  // Build expected files for each IDE
  const ideConfigs = {};

  for (const [ideName, ideConfig] of Object.entries(config.targets)) {
    if (!ideConfig.enabled) continue;

    const transformer = getTransformer(ideConfig.format);
    const expectedFiles = [];

    for (const agent of agents) {
      if (agent.error) continue;

      try {
        const content = transformer.transform(agent);
        const filename = transformer.getFilename(agent);
        expectedFiles.push({ filename, content });
      } catch (error) {
        // Skip agents that fail to transform
      }
    }

    // Add redirect files
    const redirects = generateAllRedirects(
      config.redirects,
      path.join(projectRoot, ideConfig.path),
      ideConfig.format
    );

    for (const redirect of redirects) {
      expectedFiles.push({
        filename: redirect.filename,
        content: redirect.content,
      });
    }

    ideConfigs[ideName] = {
      expectedFiles,
      targetDir: path.join(projectRoot, ideConfig.path),
    };
  }

  // Validate
  const results = validateAllIdes(ideConfigs, config.redirects);

  // Output report
  const report = formatValidationReport(results, options.verbose);
  console.log(report);

  // Exit code
  if (options.strict && !results.summary.pass) {
    console.log('');
    console.log(`${colors.red}Validation failed in strict mode${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 * @returns {object} - Parsed options
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    command: args[0] || 'sync',
    ide: null,
    strict: false,
    dryRun: false,
    verbose: false,
    quiet: false,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--ide' && args[i + 1]) {
      options.ide = args[++i];
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
    }
  }

  return options;
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
${colors.bright}IDE Sync${colors.reset} - Sync AIOS agents to IDE command files

${colors.bright}Usage:${colors.reset}
  node ide-sync/index.js <command> [options]

${colors.bright}Commands:${colors.reset}
  sync      Sync agents to all enabled IDEs (default)
  validate  Validate sync status
  report    Generate sync status report (alias for validate)

${colors.bright}Options:${colors.reset}
  --ide <name>   Sync/validate specific IDE only
  --strict       Exit with code 1 if drift detected (CI mode)
  --dry-run      Preview changes without writing files
  --verbose, -v  Show detailed output
  --quiet, -q    Minimal output (for pre-commit hooks)

${colors.bright}Examples:${colors.reset}
  node ide-sync/index.js sync
  node ide-sync/index.js sync --ide cursor
  node ide-sync/index.js validate --strict
  node ide-sync/index.js sync --dry-run --verbose
`);
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();

  if (options.command === 'help' || options.command === '--help' || options.command === '-h') {
    showHelp();
    return;
  }

  switch (options.command) {
    case 'sync':
      await commandSync(options);
      break;

    case 'validate':
    case 'report':
      await commandValidate(options);
      break;

    default:
      console.error(`${colors.red}Unknown command: ${options.command}${colors.reset}`);
      showHelp();
      process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = {
  loadConfig,
  getTransformer,
  syncIde,
  commandSync,
  commandValidate,
};
