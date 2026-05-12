#!/usr/bin/env node

/**
 * AIOX V3 Schema Validator
 *
 * Validates agent and task files against V3 schemas.
 * Supports both V2 (legacy) and V3 formats.
 *
 * Usage:
 *   node validate-v3-schema.js <file> [--type agent|task] [--strict]
 *   node validate-v3-schema.js --all [--type agent|task]
 *   node validate-v3-schema.js --diff <file>
 *
 * Options:
 *   --type      Specify file type (agent or task). Auto-detected if omitted.
 *   --strict    Require V3 autoClaude section (fail on V2-only files)
 *   --all       Validate all agents/tasks in standard locations
 *   --diff      Show V2 vs V3 field differences for a file
 *   --json      Output results as JSON
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Schema locations
const SCHEMA_DIR = __dirname;
const _AGENT_SCHEMA_PATH = path.join(SCHEMA_DIR, 'agent-v3-schema.json');
const _TASK_SCHEMA_PATH = path.join(SCHEMA_DIR, 'task-v3-schema.json');

// Default locations
const AGENTS_DIR = path.join(__dirname, '..', 'development', 'agents');
const TASKS_DIR = path.join(__dirname, '..', 'development', 'tasks');

/**
 * Load and parse a schema file
 */
async function _loadSchema(schemaPath) {
  const content = await fs.readFile(schemaPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Clean YAML content by removing markdown formatting inside YAML blocks
 */
function cleanYamlContent(yamlContent) {
  // Replace markdown bold headers with valid YAML keys
  // e.g., "**Entrada:**" -> "inputs:"
  const cleaned = yamlContent
    .replace(/\*\*Entrada:\*\*/g, 'inputs:')
    .replace(/\*\*Saida:\*\*/g, 'outputs:')
    .replace(/\*\*Saída:\*\*/g, 'outputs:')
    .replace(/\*\*Steps:\*\*/g, 'steps:')
    .replace(/\*\*Passos:\*\*/g, 'steps:')
    .replace(/\*\*Pre-condições:\*\*/g, 'preConditions:')
    .replace(/\*\*Pré-condições:\*\*/g, 'preConditions:');

  return cleaned;
}

/**
 * Extract YAML content from markdown file
 */
function extractYamlFromMarkdown(content) {
  // Look for YAML in code blocks
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlBlockMatch) {
    const cleanedYaml = cleanYamlContent(yamlBlockMatch[1]);
    return yaml.load(cleanedYaml);
  }

  // Look for frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const cleanedYaml = cleanYamlContent(frontmatterMatch[1]);
    return yaml.load(cleanedYaml);
  }

  return null;
}

/**
 * Detect file type from content
 */
function detectFileType(content, parsed) {
  if (parsed?.agent?.id || parsed?.agent?.name) {
    return 'agent';
  }
  if (parsed?.task || content.includes('## Task Definition')) {
    return 'task';
  }
  return 'unknown';
}

/**
 * Check if file has V3 autoClaude section
 */
function hasV3Section(parsed) {
  return parsed?.autoClaude?.version === '3.0';
}

/**
 * Validate required fields based on schema
 */
function validateRequiredFields(parsed, schema, type) {
  const errors = [];
  const warnings = [];

  if (type === 'agent') {
    // Check required agent fields
    if (!parsed.agent) {
      errors.push('Missing required "agent" section');
    } else {
      if (!parsed.agent.id) errors.push('Missing agent.id');
      if (!parsed.agent.name) errors.push('Missing agent.name');
      if (!parsed.agent.title) errors.push('Missing agent.title');
      if (!parsed.agent.icon) errors.push('Missing agent.icon');
    }

    if (!parsed.persona && !parsed.persona_profile) {
      warnings.push('Missing persona or persona_profile section');
    }

    if (!parsed.commands || parsed.commands.length === 0) {
      warnings.push('No commands defined');
    }

    // V3 specific checks
    if (!parsed.autoClaude) {
      warnings.push('No autoClaude section (V2 format)');
    }
  }

  if (type === 'task') {
    // Check task frontmatter or definition
    if (!parsed.task && !parsed.frontmatter) {
      warnings.push('No task definition or frontmatter found');
    }

    // V3 specific checks
    if (!parsed.autoClaude) {
      warnings.push('No autoClaude section (V2 format)');
    }
  }

  return { errors, warnings };
}

/**
 * Get V2 vs V3 field differences
 */
function getV2V3Diff(parsed, type) {
  const v2Fields = [];
  const v3Fields = [];

  if (type === 'agent') {
    // V2 fields (always present)
    if (parsed.agent) v2Fields.push('agent.*');
    if (parsed.persona || parsed.persona_profile) v2Fields.push('persona/persona_profile');
    if (parsed.commands) v2Fields.push('commands');
    if (parsed.dependencies) v2Fields.push('dependencies');
    if (parsed['activation-instructions']) v2Fields.push('activation-instructions');
    if (parsed['develop-story']) v2Fields.push('develop-story');

    // V3 fields (new)
    if (parsed.autoClaude) {
      v3Fields.push('autoClaude.version');
      if (parsed.autoClaude.specPipeline) v3Fields.push('autoClaude.specPipeline');
      if (parsed.autoClaude.execution) v3Fields.push('autoClaude.execution');
      if (parsed.autoClaude.recovery) v3Fields.push('autoClaude.recovery');
      if (parsed.autoClaude.qa) v3Fields.push('autoClaude.qa');
      if (parsed.autoClaude.memory) v3Fields.push('autoClaude.memory');
      if (parsed.autoClaude.worktree) v3Fields.push('autoClaude.worktree');
    }
  }

  if (type === 'task') {
    // V2 fields
    if (parsed.frontmatter) v2Fields.push('frontmatter');
    if (parsed.task) v2Fields.push('task');
    if (parsed.inputs) v2Fields.push('inputs');
    if (parsed.outputs) v2Fields.push('outputs');
    if (parsed.steps) v2Fields.push('steps');
    if (parsed.executionModes) v2Fields.push('executionModes');

    // V3 fields
    if (parsed.autoClaude) {
      v3Fields.push('autoClaude.version');
      if (parsed.autoClaude.deterministic !== undefined) v3Fields.push('autoClaude.deterministic');
      if (parsed.autoClaude.elicit !== undefined) v3Fields.push('autoClaude.elicit');
      if (parsed.autoClaude.pipelinePhase) v3Fields.push('autoClaude.pipelinePhase');
      if (parsed.autoClaude.verification) v3Fields.push('autoClaude.verification');
      if (parsed.autoClaude.selfCritique) v3Fields.push('autoClaude.selfCritique');
      if (parsed.autoClaude.recovery) v3Fields.push('autoClaude.recovery');
    }
  }

  return { v2Fields, v3Fields };
}

/**
 * Validate a single file
 */
async function validateFile(filePath, options = {}) {
  const { type: forceType, strict = false } = options;

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = extractYamlFromMarkdown(content);

    if (!parsed) {
      return {
        file: filePath,
        valid: false,
        errors: ['Could not parse YAML content from file'],
        warnings: [],
        version: 'unknown',
      };
    }

    const type = forceType || detectFileType(content, parsed);
    if (type === 'unknown') {
      return {
        file: filePath,
        valid: false,
        errors: ['Could not detect file type (agent or task)'],
        warnings: [],
        version: 'unknown',
      };
    }

    const version = hasV3Section(parsed) ? 'V3' : 'V2';
    const { errors, warnings } = validateRequiredFields(parsed, null, type);

    // In strict mode, V2 files fail validation
    if (strict && version === 'V2') {
      errors.push('Strict mode: File is V2 format, missing autoClaude section');
    }

    return {
      file: filePath,
      type,
      valid: errors.length === 0,
      version,
      errors,
      warnings,
      parsed,
    };
  } catch (error) {
    return {
      file: filePath,
      valid: false,
      errors: [`File read error: ${error.message}`],
      warnings: [],
      version: 'unknown',
    };
  }
}

/**
 * Validate all files in a directory
 */
async function validateAll(type = 'all') {
  const results = [];

  if (type === 'all' || type === 'agent') {
    try {
      const agentFiles = await fs.readdir(AGENTS_DIR);
      for (const file of agentFiles) {
        if (file.endsWith('.md')) {
          const result = await validateFile(path.join(AGENTS_DIR, file), { type: 'agent' });
          results.push(result);
        }
      }
    } catch (error) {
      console.error(`Error reading agents directory: ${error.message}`);
    }
  }

  if (type === 'all' || type === 'task') {
    try {
      const taskFiles = await fs.readdir(TASKS_DIR);
      for (const file of taskFiles) {
        if (file.endsWith('.md')) {
          const result = await validateFile(path.join(TASKS_DIR, file), { type: 'task' });
          results.push(result);
        }
      }
    } catch (error) {
      console.error(`Error reading tasks directory: ${error.message}`);
    }
  }

  return results;
}

/**
 * Format validation results for console output
 */
function formatResults(results, jsonOutput = false) {
  if (jsonOutput) {
    return JSON.stringify(results, null, 2);
  }

  const lines = [];
  let totalValid = 0;
  let totalV2 = 0;
  let totalV3 = 0;

  for (const result of results) {
    const status = result.valid ? '✅' : '❌';
    const versionBadge = result.version === 'V3' ? '🆕' : '📦';

    lines.push(`${status} ${versionBadge} ${path.basename(result.file)} (${result.version})`);

    if (result.errors.length > 0) {
      for (const error of result.errors) {
        lines.push(`   ❌ ${error}`);
      }
    }

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        lines.push(`   ⚠️  ${warning}`);
      }
    }

    if (result.valid) totalValid++;
    if (result.version === 'V2') totalV2++;
    if (result.version === 'V3') totalV3++;
  }

  lines.push('');
  lines.push('━'.repeat(50));
  lines.push(`Total: ${results.length} files`);
  lines.push(`Valid: ${totalValid}/${results.length}`);
  lines.push(`V2 (legacy): ${totalV2} | V3 (new): ${totalV3}`);

  return lines.join('\n');
}

/**
 * Main CLI handler
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
AIOX V3 Schema Validator

Usage:
  node validate-v3-schema.js <file>           Validate single file
  node validate-v3-schema.js --all            Validate all agents and tasks
  node validate-v3-schema.js --diff <file>    Show V2 vs V3 differences

Options:
  --type agent|task    Force file type detection
  --strict             Require V3 autoClaude section
  --json               Output as JSON
    `);
    return;
  }

  const jsonOutput = args.includes('--json');
  const strict = args.includes('--strict');
  const typeArg = args.includes('--type') ? args[args.indexOf('--type') + 1] : null;

  if (args.includes('--all')) {
    const results = await validateAll(typeArg);
    console.log(formatResults(results, jsonOutput));
    process.exit(results.every((r) => r.valid) ? 0 : 1);
  }

  if (args.includes('--diff')) {
    const fileIndex = args.indexOf('--diff') + 1;
    const filePath = args[fileIndex];
    if (!filePath) {
      console.error('Error: --diff requires a file path');
      process.exit(1);
    }

    const result = await validateFile(filePath, { type: typeArg });
    if (!result.parsed) {
      console.error(result.errors.join('\n'));
      process.exit(1);
    }

    const diff = getV2V3Diff(result.parsed, result.type);
    console.log(`\nFile: ${path.basename(filePath)}`);
    console.log(`Type: ${result.type}`);
    console.log(`Version: ${result.version}\n`);
    console.log('V2 Fields (existing):');
    diff.v2Fields.forEach((f) => console.log(`  ✓ ${f}`));
    console.log('\nV3 Fields (Auto-Claude):');
    if (diff.v3Fields.length > 0) {
      diff.v3Fields.forEach((f) => console.log(`  🆕 ${f}`));
    } else {
      console.log('  (none - file needs migration)');
    }
    return;
  }

  // Single file validation
  const filePath = args.find((a) => !a.startsWith('--'));
  if (!filePath) {
    console.error('Error: No file specified');
    process.exit(1);
  }

  const result = await validateFile(filePath, { type: typeArg, strict });
  console.log(formatResults([result], jsonOutput));
  process.exit(result.valid ? 0 : 1);
}

// Export for programmatic use
module.exports = {
  validateFile,
  validateAll,
  getV2V3Diff,
  extractYamlFromMarkdown,
};

// Run CLI if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
