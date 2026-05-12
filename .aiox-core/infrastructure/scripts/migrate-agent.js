#!/usr/bin/env node

/**
 * AIOX Agent Migration Script (V2 → V3)
 * Story 2.4: Migrates agents to V3 format with Auto-Claude capabilities
 *
 * Usage:
 *   node migrate-agent.js <agent-id> [--dry-run] [--backup] [--force]
 *   node migrate-agent.js --list
 *
 * @module migrate-agent
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Paths
const AGENTS_DIR = '.aiox-core/development/agents';
const BACKUP_DIR = '.aiox/migration-backup';
const SCHEMAS_DIR = '.aiox-core/schemas';

// Agent capability matrix based on role
const AGENT_CAPABILITIES = {
  pm: {
    specPipeline: {
      canGather: true,
      canWrite: true,
    },
  },
  architect: {
    specPipeline: {
      canAssess: true,
    },
    execution: {
      canCreatePlan: true,
      canCreateContext: true,
    },
  },
  analyst: {
    specPipeline: {
      canResearch: true,
    },
    memory: {
      canExtractPatterns: true,
    },
  },
  dev: {
    execution: {
      canExecute: true,
      canVerify: true,
      selfCritique: {
        enabled: true,
        checklistRef: 'story-dod-checklist.md',
      },
    },
    recovery: {
      canTrack: true,
      canRollback: true,
      maxAttempts: 3,
      stuckDetection: true,
    },
    memory: {
      canCaptureInsights: true,
    },
  },
  qa: {
    specPipeline: {
      canCritique: true,
    },
    execution: {
      canVerify: true,
    },
    qa: {
      canReview: true,
      canFixRequest: true,
      reviewPhases: 10,
      maxIterations: 5,
    },
  },
  devops: {
    worktree: {
      canCreate: true,
      canMerge: true,
      canCleanup: true,
    },
  },
  po: {
    specPipeline: {
      canGather: true,
      canWrite: true,
    },
  },
  sm: {
    // Scrum Master doesn't have specific Auto-Claude capabilities
  },
  'aiox-master': {
    specPipeline: {
      canGather: true,
      canAssess: true,
      canResearch: true,
      canWrite: true,
      canCritique: true,
    },
    execution: {
      canCreatePlan: true,
      canCreateContext: true,
    },
  },
  'data-engineer': {
    execution: {
      canExecute: true,
      canVerify: true,
    },
    memory: {
      canExtractPatterns: true,
    },
  },
  'ux-design-expert': {
    specPipeline: {
      canResearch: true,
    },
    execution: {
      canCreateContext: true,
    },
  },
  'squad-creator': {
    execution: {
      canCreatePlan: true,
    },
  },
};

/**
 * Extract YAML content from markdown file
 */
function extractYamlFromMarkdown(content) {
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlBlockMatch) {
    try {
      return { yaml: yaml.load(yamlBlockMatch[1]), raw: yamlBlockMatch[1] };
    } catch (e) {
      return { error: e.message };
    }
  }
  return { yaml: null, raw: null };
}

/**
 * Check if agent already has V3 autoClaude section
 */
function isAlreadyV3(parsed) {
  return parsed?.autoClaude?.version === '3.0';
}

/**
 * Generate autoClaude section for an agent
 */
function generateAutoClaudeSection(agentId) {
  const capabilities = AGENT_CAPABILITIES[agentId] || {};

  const autoClaude = {
    version: '3.0',
    migratedAt: new Date().toISOString(),
  };

  // Add capabilities based on agent role
  if (capabilities.specPipeline) {
    autoClaude.specPipeline = {
      canGather: capabilities.specPipeline.canGather || false,
      canAssess: capabilities.specPipeline.canAssess || false,
      canResearch: capabilities.specPipeline.canResearch || false,
      canWrite: capabilities.specPipeline.canWrite || false,
      canCritique: capabilities.specPipeline.canCritique || false,
    };
  }

  if (capabilities.execution) {
    autoClaude.execution = {
      canCreatePlan: capabilities.execution.canCreatePlan || false,
      canCreateContext: capabilities.execution.canCreateContext || false,
      canExecute: capabilities.execution.canExecute || false,
      canVerify: capabilities.execution.canVerify || false,
    };
    if (capabilities.execution.selfCritique) {
      autoClaude.execution.selfCritique = capabilities.execution.selfCritique;
    }
  }

  if (capabilities.recovery) {
    autoClaude.recovery = capabilities.recovery;
  }

  if (capabilities.qa) {
    autoClaude.qa = capabilities.qa;
  }

  if (capabilities.memory) {
    autoClaude.memory = {
      canCaptureInsights: capabilities.memory.canCaptureInsights || false,
      canExtractPatterns: capabilities.memory.canExtractPatterns || false,
      canDocumentGotchas: capabilities.memory.canDocumentGotchas || false,
    };
  }

  if (capabilities.worktree) {
    autoClaude.worktree = capabilities.worktree;
  }

  return autoClaude;
}

/**
 * Convert autoClaude object to YAML string with proper indentation
 */
function autoClaudeToYaml(autoClaude) {
  return yaml.dump({ autoClaude }, { indent: 2, lineWidth: -1 }).trim();
}

/**
 * Insert autoClaude section into markdown content
 */
function insertAutoClaudeSection(content, autoClaudeYaml) {
  // Find the closing ``` of the YAML block
  const yamlBlockMatch = content.match(/(```yaml\n[\s\S]*?)(```)/);

  if (!yamlBlockMatch) {
    return { error: 'Could not find YAML block in file' };
  }

  const beforeClosing = yamlBlockMatch[1];
  const closing = yamlBlockMatch[2];

  // Insert autoClaude section before the closing ```
  const newContent = content.replace(
    yamlBlockMatch[0],
    `${beforeClosing}\n${autoClaudeYaml}\n${closing}`
  );

  return { content: newContent };
}

/**
 * Generate diff output
 */
function generateDiff(agentId, autoClaude) {
  const lines = [];

  lines.push('');
  lines.push(`═══════════════════════════════════════════════════════════`);
  lines.push(`  Migration Preview: ${agentId}.md (V2 → V3)`);
  lines.push(`═══════════════════════════════════════════════════════════`);
  lines.push('');
  lines.push('+ Added autoClaude section:');
  lines.push('');

  const yamlStr = autoClaudeToYaml(autoClaude);
  yamlStr.split('\n').forEach((line) => {
    lines.push(`  + ${line}`);
  });

  lines.push('');
  lines.push(`═══════════════════════════════════════════════════════════`);

  return lines.join('\n');
}

/**
 * Migrate a single agent
 */
async function migrateAgent(rootPath, agentId, options = {}) {
  const { dryRun = false, backup = false, force = false } = options;

  const agentPath = path.join(rootPath, AGENTS_DIR, `${agentId}.md`);

  // Check if file exists
  try {
    await fs.access(agentPath);
  } catch {
    return { success: false, error: `Agent file not found: ${agentPath}` };
  }

  // Read file
  const content = await fs.readFile(agentPath, 'utf-8');

  // Parse YAML
  const { yaml: parsed, error: parseError } = extractYamlFromMarkdown(content);

  if (parseError) {
    return { success: false, error: `YAML parse error: ${parseError}` };
  }

  if (!parsed) {
    return { success: false, error: 'No YAML block found in file' };
  }

  // Check if already V3
  if (isAlreadyV3(parsed) && !force) {
    return {
      success: false,
      error: `Agent ${agentId} is already V3. Use --force to re-migrate.`,
      version: 'V3',
    };
  }

  // Generate autoClaude section
  const autoClaude = generateAutoClaudeSection(agentId);
  const autoClaudeYaml = autoClaudeToYaml(autoClaude);

  // Dry run - just show diff
  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      diff: generateDiff(agentId, autoClaude),
      autoClaude,
    };
  }

  // Create backup if requested
  if (backup) {
    const backupPath = path.join(rootPath, BACKUP_DIR);
    await fs.mkdir(backupPath, { recursive: true });

    const backupFile = path.join(backupPath, `${agentId}.md.bak`);
    await fs.writeFile(backupFile, content);
  }

  // Insert autoClaude section
  const { content: newContent, error: insertError } = insertAutoClaudeSection(
    content,
    autoClaudeYaml
  );

  if (insertError) {
    return { success: false, error: insertError };
  }

  // Write migrated file
  await fs.writeFile(agentPath, newContent);

  // Validate migration
  const { validateFile } = require(path.join(rootPath, SCHEMAS_DIR, 'validate-v3-schema.js'));
  const validation = await validateFile(agentPath, { type: 'agent', strict: true });

  return {
    success: true,
    agentId,
    migrated: true,
    backup: backup ? path.join(BACKUP_DIR, `${agentId}.md.bak`) : null,
    validation: {
      valid: validation.valid,
      version: validation.version,
      errors: validation.errors,
      warnings: validation.warnings,
    },
  };
}

/**
 * List all agents and their migration status
 */
async function listAgents(rootPath) {
  const agentsPath = path.join(rootPath, AGENTS_DIR);
  const files = await fs.readdir(agentsPath);

  const agents = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const agentId = path.basename(file, '.md');
    const content = await fs.readFile(path.join(agentsPath, file), 'utf-8');
    const { yaml: parsed } = extractYamlFromMarkdown(content);

    const hasCapabilities = AGENT_CAPABILITIES[agentId] !== undefined;
    const isV3 = isAlreadyV3(parsed);

    agents.push({
      id: agentId,
      name: parsed?.agent?.name || 'Unknown',
      version: isV3 ? 'V3' : 'V2',
      hasCapabilities,
      file,
    });
  }

  return agents;
}

/**
 * Format list output
 */
function formatListOutput(agents) {
  const lines = [];

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('  AIOX Agents - Migration Status');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');

  const v2Count = agents.filter((a) => a.version === 'V2').length;
  const v3Count = agents.filter((a) => a.version === 'V3').length;

  lines.push(`Total: ${agents.length} agents | V2: ${v2Count} | V3: ${v3Count}`);
  lines.push('');

  agents.forEach((agent) => {
    const vBadge = agent.version === 'V3' ? '🆕' : '📦';
    const capBadge = agent.hasCapabilities ? '✓' : '○';
    lines.push(`  ${vBadge} ${agent.id.padEnd(20)} ${agent.version} ${capBadge} ${agent.name}`);
  });

  lines.push('');
  lines.push('Legend: 🆕 V3 | 📦 V2 | ✓ Has capability mapping | ○ No mapping');
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * CLI handler
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
AIOX Agent Migration Script (V2 → V3)

Usage:
  node migrate-agent.js <agent-id> [options]
  node migrate-agent.js --list

Options:
  --dry-run     Show migration diff without applying
  --backup      Create backup before migration
  --force       Re-migrate even if already V3
  --list        List all agents and migration status
  --help        Show this help message

Examples:
  node migrate-agent.js dev --dry-run
  node migrate-agent.js dev --backup
  node migrate-agent.js qa --dry-run
  node migrate-agent.js --list
    `);
    return;
  }

  // Find project root
  let rootPath = process.cwd();
  while (rootPath !== '/') {
    try {
      await fs.access(path.join(rootPath, '.aiox-core'));
      break;
    } catch {
      rootPath = path.dirname(rootPath);
    }
  }

  if (rootPath === '/') {
    console.error('Error: Could not find .aiox-core directory. Run from project root.');
    process.exit(1);
  }

  // List mode
  if (args.includes('--list')) {
    const agents = await listAgents(rootPath);
    console.log(formatListOutput(agents));
    return;
  }

  // Migration mode
  const agentId = args.find((a) => !a.startsWith('--'));
  if (!agentId) {
    console.error('Error: Agent ID required');
    process.exit(1);
  }

  const dryRun = args.includes('--dry-run');
  const backup = args.includes('--backup');
  const force = args.includes('--force');

  const result = await migrateAgent(rootPath, agentId, { dryRun, backup, force });

  if (!result.success) {
    console.error(`❌ Migration failed: ${result.error}`);
    process.exit(1);
  }

  if (result.dryRun) {
    console.log(result.diff);
    console.log('\nTo apply migration, run without --dry-run flag.');
  } else {
    console.log(`\n✅ Agent ${agentId} migrated to V3 successfully!`);
    if (result.backup) {
      console.log(`   Backup: ${result.backup}`);
    }
    console.log(`   Validation: ${result.validation.valid ? 'PASSED' : 'FAILED'}`);
    if (result.validation.errors.length > 0) {
      console.log(`   Errors: ${result.validation.errors.join(', ')}`);
    }
    if (result.validation.warnings.length > 0) {
      console.log(`   Warnings: ${result.validation.warnings.join(', ')}`);
    }
  }
}

// Export for programmatic use
module.exports = {
  migrateAgent,
  listAgents,
  generateAutoClaudeSection,
  AGENT_CAPABILITIES,
};

// Run CLI if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
