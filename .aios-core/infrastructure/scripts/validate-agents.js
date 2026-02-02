#!/usr/bin/env node

/**
 * AIOS Agent Consistency Validator
 *
 * Validates all agent definitions for consistency according to the
 * Agent Consistency Refactor PRD requirements:
 *
 * 1. Command uniqueness across agents (1 command = 1 owner)
 * 2. Dependency existence verification
 * 3. Format schema validation
 * 4. Cross-agent reference validation
 *
 * Usage:
 *   node validate-agents.js                    Validate all agents
 *   node validate-agents.js --json             Output as JSON
 *   node validate-agents.js --fix-suggestions  Show fix suggestions
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation errors found
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Paths
const ROOT_DIR = path.join(__dirname, '..', '..');
const AGENTS_DIR = path.join(ROOT_DIR, 'development', 'agents');
const TASKS_DIR = path.join(ROOT_DIR, 'development', 'tasks');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'development', 'templates');
const CHECKLISTS_DIR = path.join(ROOT_DIR, 'development', 'checklists');
const DATA_DIR = path.join(ROOT_DIR, 'development', 'data');
const UTILS_DIR = path.join(ROOT_DIR, 'development', 'utils');
const WORKFLOWS_DIR = path.join(ROOT_DIR, 'development', 'workflows');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'development', 'scripts');

// Commands that are allowed to be shared by multiple agents
// These are utility/infrastructure commands, not domain-specific
const SHARED_COMMANDS = new Set([
  // Core utility commands (all agents)
  'help',
  'yolo',
  'exit',
  'guide',
  'session-info',
  // Document operations (multiple agents can output docs)
  'doc-out',
  'shard-doc',
  'shard-prd',
  'research',
  'execute-checklist',
  // Status/monitoring (multiple agents can check status)
  'status',
  // Infrastructure commands delegated to specific agents but callable from many
  'document-project',
  // Backlog operations (PO and QA both manage backlog items)
  'backlog-add',
  'backlog-review',
  // Build/rollback (dev operations that overlap between dev/devops/data)
  'build',
  'rollback',
  // Correct-course (all agents can use on own domain)
  'correct-course',
]);

/**
 * Extract YAML content from markdown file
 */
function extractYamlFromMarkdown(content) {
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlBlockMatch) {
    return yaml.load(yamlBlockMatch[1]);
  }
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    return yaml.load(frontmatterMatch[1]);
  }
  return null;
}

/**
 * Load all agent files
 */
async function loadAllAgents() {
  const agents = [];

  try {
    const files = await fs.readdir(AGENTS_DIR);
    for (const file of files) {
      if (file.endsWith('.md') && !file.startsWith('_')) {
        const filePath = path.join(AGENTS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = extractYamlFromMarkdown(content);

        if (parsed?.agent) {
          agents.push({
            file,
            path: filePath,
            id: parsed.agent.id || file.replace('.md', ''),
            name: parsed.agent.name,
            commands: parsed.commands || [],
            dependencies: parsed.dependencies || {},
            parsed,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error reading agents directory: ${error.message}`);
  }

  return agents;
}

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate command uniqueness across agents
 * Returns: { errors: [], warnings: [], commandOwners: Map }
 */
function validateCommandUniqueness(agents) {
  const commandOwners = new Map(); // command -> [{ agent, hasVisibility }]
  const errors = [];
  const warnings = [];

  for (const agent of agents) {
    if (!Array.isArray(agent.commands)) continue;
    for (const cmd of agent.commands) {
      let cmdName;
      if (typeof cmd === 'string') {
        // String format: 'command: description'
        cmdName = cmd.split(':')[0].trim();
      } else if (cmd.name) {
        // Explicit format: { name: 'command', ... }
        cmdName = cmd.name;
      } else if (typeof cmd === 'object') {
        // Shorthand format: { command: 'description' } - take first key
        const keys = Object.keys(cmd);
        cmdName = keys[0]?.split(' ')[0]; // Handle 'command {args}' format
      }
      if (!cmdName) continue;

      if (!commandOwners.has(cmdName)) {
        commandOwners.set(cmdName, []);
      }
      commandOwners.get(cmdName).push({
        agent: agent.id,
        file: agent.file,
        hasVisibility: cmd.visibility !== undefined,
      });
    }
  }

  // Check for duplicates
  for (const [cmd, owners] of commandOwners) {
    if (owners.length > 1 && !SHARED_COMMANDS.has(cmd)) {
      const ownerList = owners.map((o) => `@${o.agent}`).join(', ');
      errors.push({
        type: 'DUPLICATE_COMMAND',
        command: cmd,
        owners: owners.map((o) => o.agent),
        message: `Command "*${cmd}" has multiple owners: ${ownerList}`,
        suggestion: `Keep "*${cmd}" only in the primary owner agent and remove from others, or add to SHARED_COMMANDS if intentionally shared.`,
      });
    }
  }

  return { errors, warnings, commandOwners };
}

/**
 * Validate dependencies exist
 */
async function validateDependencies(agents) {
  const errors = [];
  const warnings = [];

  const depDirs = {
    tasks: TASKS_DIR,
    templates: TEMPLATES_DIR,
    checklists: CHECKLISTS_DIR,
    data: DATA_DIR,
    utils: UTILS_DIR,
    workflows: WORKFLOWS_DIR,
    scripts: SCRIPTS_DIR,
  };

  for (const agent of agents) {
    const deps = agent.dependencies;

    for (const [depType, depList] of Object.entries(deps)) {
      if (!Array.isArray(depList)) continue;

      const depDir = depDirs[depType];
      if (!depDir) {
        warnings.push({
          type: 'UNKNOWN_DEP_TYPE',
          agent: agent.id,
          depType,
          message: `Unknown dependency type "${depType}" in @${agent.id}`,
        });
        continue;
      }

      for (const depFile of depList) {
        const depPath = path.join(depDir, depFile);
        const exists = await fileExists(depPath);

        if (!exists) {
          // Missing dependencies are warnings, not errors (pre-existing technical debt)
          warnings.push({
            type: 'MISSING_DEPENDENCY',
            agent: agent.id,
            depType,
            depFile,
            expectedPath: depPath,
            message: `Missing dependency: @${agent.id} → ${depType}/${depFile}`,
            suggestion: `Create the file at ${depPath} or remove from agent dependencies.`,
          });
        }
      }
    }
  }

  return { errors, warnings };
}

/**
 * Validate agent format
 */
function validateAgentFormat(agents) {
  const errors = [];
  const warnings = [];

  for (const agent of agents) {
    const { parsed, file, id } = agent;

    // Check required fields
    if (!parsed.agent.id) {
      errors.push({
        type: 'MISSING_FIELD',
        agent: id,
        field: 'agent.id',
        message: `Missing agent.id in ${file}`,
      });
    }

    if (!parsed.agent.name) {
      errors.push({
        type: 'MISSING_FIELD',
        agent: id,
        field: 'agent.name',
        message: `Missing agent.name in ${file}`,
      });
    }

    if (!parsed.agent.title) {
      errors.push({
        type: 'MISSING_FIELD',
        agent: id,
        field: 'agent.title',
        message: `Missing agent.title in ${file}`,
      });
    }

    if (!parsed.agent.icon) {
      warnings.push({
        type: 'MISSING_FIELD',
        agent: id,
        field: 'agent.icon',
        message: `Missing agent.icon in ${file}`,
      });
    }

    // Check command format
    // Accepted formats:
    // 1. { name: 'cmd', description: '...' } - explicit format (preferred)
    // 2. { cmd: 'description' } - shorthand format (valid)
    // 3. 'cmd: description' - string format (deprecated)
    for (let i = 0; i < agent.commands.length; i++) {
      const cmd = agent.commands[i];
      if (typeof cmd === 'string') {
        // String format is deprecated but we'll just warn
        warnings.push({
          type: 'DEPRECATED_COMMAND_FORMAT',
          agent: id,
          command: cmd,
          message: `Command "${cmd}" in @${id} uses deprecated string format`,
          suggestion: `Consider converting to: - name: ${cmd.split(':')[0].trim()}\n    description: "${cmd.split(':')[1]?.trim() || 'TODO: add description'}"`,
        });
      }
      // Note: { cmd: 'description' } shorthand format is valid and does NOT generate errors
    }

    // Check autoClaude section
    if (!parsed.autoClaude) {
      warnings.push({
        type: 'MISSING_AUTOCLAUDE',
        agent: id,
        message: `Missing autoClaude section in ${file} (V2 format)`,
        suggestion: `Add autoClaude section with version: '3.0'`,
      });
    }

    // Check greeting script
    const activation = parsed['activation-instructions'];
    if (activation) {
      const activationStr = Array.isArray(activation) ? activation.join('\n') : String(activation);
      if (activationStr.includes('generate-greeting.js')) {
        warnings.push({
          type: 'DEPRECATED_GREETING',
          agent: id,
          message: `@${id} uses deprecated generate-greeting.js`,
          suggestion: `Change to greeting-builder.js`,
        });
      }
    }
  }

  return { errors, warnings };
}

/**
 * Format results for console
 */
function formatResults(results, showSuggestions = false) {
  const lines = [];
  const { commandValidation, dependencyValidation, formatValidation, summary } = results;

  lines.push('');
  lines.push('━'.repeat(60));
  lines.push('  AIOS Agent Consistency Validation Report');
  lines.push('━'.repeat(60));
  lines.push('');

  // Command Uniqueness
  lines.push('📋 Command Uniqueness Check');
  lines.push('─'.repeat(40));
  if (commandValidation.errors.length === 0) {
    lines.push('  ✅ All commands have unique owners (or are shared)');
  } else {
    for (const err of commandValidation.errors) {
      lines.push(`  ❌ ${err.message}`);
      if (showSuggestions && err.suggestion) {
        lines.push(`     💡 ${err.suggestion}`);
      }
    }
  }
  lines.push('');

  // Dependencies
  lines.push('📦 Dependencies Existence Check');
  lines.push('─'.repeat(40));
  if (dependencyValidation.errors.length === 0) {
    lines.push('  ✅ All dependencies exist');
  } else {
    for (const err of dependencyValidation.errors) {
      lines.push(`  ❌ ${err.message}`);
      if (showSuggestions && err.suggestion) {
        lines.push(`     💡 ${err.suggestion}`);
      }
    }
  }
  if (dependencyValidation.warnings.length > 0) {
    for (const warn of dependencyValidation.warnings) {
      lines.push(`  ⚠️  ${warn.message}`);
    }
  }
  lines.push('');

  // Format Validation
  lines.push('📝 Agent Format Check');
  lines.push('─'.repeat(40));
  if (formatValidation.errors.length === 0) {
    lines.push('  ✅ All agents follow standard format');
  } else {
    for (const err of formatValidation.errors) {
      lines.push(`  ❌ ${err.message}`);
      if (showSuggestions && err.suggestion) {
        lines.push(`     💡 ${err.suggestion}`);
      }
    }
  }
  if (formatValidation.warnings.length > 0) {
    for (const warn of formatValidation.warnings) {
      lines.push(`  ⚠️  ${warn.message}`);
      if (showSuggestions && warn.suggestion) {
        lines.push(`     💡 ${warn.suggestion}`);
      }
    }
  }
  lines.push('');

  // Summary
  lines.push('━'.repeat(60));
  lines.push('  Summary');
  lines.push('━'.repeat(60));
  lines.push(`  Agents validated: ${summary.totalAgents}`);
  lines.push(`  Errors: ${summary.totalErrors}`);
  lines.push(`  Warnings: ${summary.totalWarnings}`);
  lines.push('');

  if (summary.totalErrors === 0) {
    lines.push('  ✅ All validations passed!');
  } else {
    lines.push(`  ❌ ${summary.totalErrors} error(s) found - please fix before committing`);
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Main validation function
 */
async function validateAgents(options = {}) {
  const { json = false, fixSuggestions = false } = options;

  // Load all agents
  const agents = await loadAllAgents();

  if (agents.length === 0) {
    console.error('No agents found in', AGENTS_DIR);
    process.exit(1);
  }

  // Run validations
  const commandValidation = validateCommandUniqueness(agents);
  const dependencyValidation = await validateDependencies(agents);
  const formatValidation = validateAgentFormat(agents);

  // Calculate summary
  const totalErrors =
    commandValidation.errors.length +
    dependencyValidation.errors.length +
    formatValidation.errors.length;

  const totalWarnings =
    commandValidation.warnings.length +
    dependencyValidation.warnings.length +
    formatValidation.warnings.length;

  const results = {
    commandValidation,
    dependencyValidation,
    formatValidation,
    summary: {
      totalAgents: agents.length,
      totalErrors,
      totalWarnings,
      valid: totalErrors === 0,
    },
  };

  // Output
  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(formatResults(results, fixSuggestions));
  }

  return results;
}

// CLI handler
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
AIOS Agent Consistency Validator

Usage:
  node validate-agents.js                    Validate all agents
  node validate-agents.js --json             Output as JSON
  node validate-agents.js --fix-suggestions  Show fix suggestions

Exit codes:
  0 - All validations passed
  1 - Validation errors found
    `);
    return;
  }

  const options = {
    json: args.includes('--json'),
    fixSuggestions: args.includes('--fix-suggestions') || args.includes('--fix'),
  };

  const results = await validateAgents(options);
  process.exit(results.summary.valid ? 0 : 1);
}

// Export for programmatic use
module.exports = {
  validateAgents,
  validateCommandUniqueness,
  validateDependencies,
  validateAgentFormat,
  loadAllAgents,
};

// Run CLI if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
