#!/usr/bin/env node

/**
 * AIOX Asset Inventory Generator
 * Story 2.1: Creates comprehensive inventory of all AIOX assets
 *
 * Usage:
 *   node asset-inventory.js [--verbose] [--json] [--output path]
 *
 * @module asset-inventory
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Asset locations relative to project root
const ASSET_PATHS = {
  agents: '.aiox-core/development/agents',
  tasks: '.aiox-core/development/tasks',
  templates: '.aiox-core/product/templates',
  checklists: '.aiox-core/product/checklists',
  scripts: '.aiox-core/infrastructure/scripts',
  schemas: '.aiox-core/schemas',
  data: '.aiox-core/development/data',
};

// File patterns for each asset type
const ASSET_PATTERNS = {
  agents: /\.md$/,
  tasks: /\.md$/,
  templates: /\.(yaml|yml|md)$/,
  checklists: /\.md$/,
  scripts: /\.js$/,
  schemas: /\.(json|js)$/,
  data: /\.(md|yaml|yml|json)$/,
};

/**
 * Extract YAML content from markdown file
 */
function extractYamlFromMarkdown(content) {
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlBlockMatch) {
    try {
      return yaml.load(yamlBlockMatch[1]);
    } catch (e) {
      return null;
    }
  }

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    try {
      return yaml.load(frontmatterMatch[1]);
    } catch (e) {
      return null;
    }
  }

  return null;
}

/**
 * Extract dependencies from an agent file
 */
function extractAgentDependencies(parsed, content) {
  const deps = {
    tasks: [],
    templates: [],
    checklists: [],
    data: [],
    tools: [],
  };

  if (parsed?.dependencies) {
    if (Array.isArray(parsed.dependencies.tasks)) {
      deps.tasks = parsed.dependencies.tasks;
    }
    if (Array.isArray(parsed.dependencies.templates)) {
      deps.templates = parsed.dependencies.templates;
    }
    if (Array.isArray(parsed.dependencies.checklists)) {
      deps.checklists = parsed.dependencies.checklists;
    }
    if (Array.isArray(parsed.dependencies.data)) {
      deps.data = parsed.dependencies.data;
    }
    if (Array.isArray(parsed.dependencies.tools)) {
      deps.tools = parsed.dependencies.tools;
    }
  }

  return deps;
}

/**
 * Extract dependencies from a task file
 */
function extractTaskDependencies(parsed, content) {
  const deps = {
    templates: [],
    checklists: [],
    tools: [],
  };

  // Check frontmatter
  if (parsed?.templates) deps.templates = parsed.templates;
  if (parsed?.checklists) deps.checklists = parsed.checklists;
  if (parsed?.tools) deps.tools = parsed.tools;

  // Check content for references
  const templateRefs = content.match(/templates?\/[a-z0-9-]+\.(yaml|yml|md)/gi) || [];
  const checklistRefs = content.match(/checklists?\/[a-z0-9-]+\.md/gi) || [];

  templateRefs.forEach((ref) => {
    const name = path.basename(ref);
    if (!deps.templates.includes(name)) deps.templates.push(name);
  });

  checklistRefs.forEach((ref) => {
    const name = path.basename(ref);
    if (!deps.checklists.includes(name)) deps.checklists.push(name);
  });

  return deps;
}

/**
 * Detect schema version (V2 or V3)
 */
function detectVersion(parsed) {
  if (parsed?.autoClaude?.version === '3.0') {
    return 'v3';
  }
  return 'v2';
}

/**
 * Scan a directory for assets
 */
async function scanDirectory(dirPath, pattern, rootPath) {
  const assets = [];

  try {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      if (!pattern.test(file)) continue;

      const fullPath = path.join(dirPath, file);
      const stat = await fs.stat(fullPath);

      if (!stat.isFile()) continue;

      const relativePath = path.relative(rootPath, fullPath);
      const content = await fs.readFile(fullPath, 'utf-8');

      assets.push({
        file,
        path: relativePath,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        content,
      });
    }
  } catch (error) {
    // Directory doesn't exist
    return [];
  }

  return assets;
}

/**
 * Process agent assets
 */
function processAgents(rawAssets) {
  return rawAssets.map((asset) => {
    const parsed = extractYamlFromMarkdown(asset.content) || {};

    return {
      type: 'agent',
      id: parsed.agent?.id || path.basename(asset.file, '.md'),
      name: parsed.agent?.name || 'Unknown',
      title: parsed.agent?.title || 'Unknown',
      path: asset.path,
      version: detectVersion(parsed),
      dependencies: extractAgentDependencies(parsed, asset.content),
      commandCount: Array.isArray(parsed.commands) ? parsed.commands.length : 0,
      size: asset.size,
      modified: asset.modified,
    };
  });
}

/**
 * Process task assets
 */
function processTasks(rawAssets) {
  return rawAssets.map((asset) => {
    const parsed = extractYamlFromMarkdown(asset.content) || {};

    // Extract task name from various formats
    let taskName = parsed.task?.name || parsed.task || null;
    if (typeof taskName === 'object') taskName = taskName?.name || null;
    if (!taskName) taskName = path.basename(asset.file, '.md');

    return {
      type: 'task',
      id: path.basename(asset.file, '.md'),
      name: taskName,
      responsavel: parsed.task?.responsavel || parsed.responsavel || 'Unknown',
      path: asset.path,
      version: detectVersion(parsed),
      dependencies: extractTaskDependencies(parsed, asset.content),
      elicit: parsed.elicit || parsed.task?.elicit || false,
      size: asset.size,
      modified: asset.modified,
    };
  });
}

/**
 * Process template assets
 */
function processTemplates(rawAssets) {
  return rawAssets.map((asset) => {
    const ext = path.extname(asset.file);
    let parsed = null;

    if (ext === '.yaml' || ext === '.yml') {
      try {
        parsed = yaml.load(asset.content);
      } catch (e) {
        // Invalid YAML
      }
    } else if (ext === '.md') {
      parsed = extractYamlFromMarkdown(asset.content);
    }

    return {
      type: 'template',
      id: path.basename(asset.file, ext),
      name: parsed?.name || path.basename(asset.file, ext),
      format: ext.substring(1),
      path: asset.path,
      size: asset.size,
      modified: asset.modified,
    };
  });
}

/**
 * Process checklist assets
 */
function processChecklists(rawAssets) {
  return rawAssets.map((asset) => {
    const parsed = extractYamlFromMarkdown(asset.content);

    // Count checklist items
    const itemCount = (asset.content.match(/^- \[[ x]\]/gm) || []).length;

    return {
      type: 'checklist',
      id: path.basename(asset.file, '.md'),
      name: parsed?.name || path.basename(asset.file, '.md'),
      path: asset.path,
      itemCount,
      size: asset.size,
      modified: asset.modified,
    };
  });
}

/**
 * Process script assets
 */
function processScripts(rawAssets) {
  return rawAssets.map((asset) => {
    // Extract module description from JSDoc
    const descMatch = asset.content.match(/@module\s+([^\n]+)/);
    const description = descMatch ? descMatch[1].trim() : null;

    // Check for exports
    const hasExports =
      asset.content.includes('module.exports') || asset.content.includes('exports.');

    // Check if it's a CLI script
    const isCli = asset.content.includes('#!/usr/bin/env node');

    return {
      type: 'script',
      id: path.basename(asset.file, '.js'),
      path: asset.path,
      description,
      hasExports,
      isCli,
      size: asset.size,
      modified: asset.modified,
    };
  });
}

/**
 * Find orphan assets (not referenced by any agent or task)
 */
function findOrphans(inventory) {
  const referenced = new Set();

  // Collect all referenced assets
  inventory.agents.forEach((agent) => {
    agent.dependencies.tasks.forEach((t) => referenced.add(`task:${t.replace('.md', '')}`));
    agent.dependencies.templates.forEach((t) =>
      referenced.add(`template:${t.replace(/\.(yaml|yml|md)$/, '')}`)
    );
    agent.dependencies.checklists.forEach((t) =>
      referenced.add(`checklist:${t.replace('.md', '')}`)
    );
    agent.dependencies.data.forEach((t) => referenced.add(`data:${t.replace(/\.(md|yaml)$/, '')}`));
  });

  inventory.tasks.forEach((task) => {
    task.dependencies.templates.forEach((t) =>
      referenced.add(`template:${t.replace(/\.(yaml|yml|md)$/, '')}`)
    );
    task.dependencies.checklists.forEach((t) =>
      referenced.add(`checklist:${t.replace('.md', '')}`)
    );
  });

  // Find orphans
  const orphans = [];

  inventory.tasks.forEach((task) => {
    if (!referenced.has(`task:${task.id}`)) {
      orphans.push({ type: 'task', id: task.id, path: task.path });
    }
  });

  inventory.templates.forEach((template) => {
    if (!referenced.has(`template:${template.id}`)) {
      orphans.push({ type: 'template', id: template.id, path: template.path });
    }
  });

  inventory.checklists.forEach((checklist) => {
    if (!referenced.has(`checklist:${checklist.id}`)) {
      orphans.push({ type: 'checklist', id: checklist.id, path: checklist.path });
    }
  });

  return orphans;
}

/**
 * Count dependencies for each asset
 */
function countDependencies(inventory) {
  const counts = {};

  // Count how many times each asset is referenced
  inventory.agents.forEach((agent) => {
    agent.dependencies.tasks.forEach((t) => {
      const key = `task:${t.replace('.md', '')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    agent.dependencies.templates.forEach((t) => {
      const key = `template:${t.replace(/\.(yaml|yml|md)$/, '')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    agent.dependencies.checklists.forEach((t) => {
      const key = `checklist:${t.replace('.md', '')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
  });

  inventory.tasks.forEach((task) => {
    task.dependencies.templates.forEach((t) => {
      const key = `template:${t.replace(/\.(yaml|yml|md)$/, '')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    task.dependencies.checklists.forEach((t) => {
      const key = `checklist:${t.replace('.md', '')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
  });

  return counts;
}

/**
 * Generate inventory summary
 */
function generateSummary(inventory, orphans) {
  return {
    agents: inventory.agents.length,
    tasks: inventory.tasks.length,
    templates: inventory.templates.length,
    checklists: inventory.checklists.length,
    scripts: inventory.scripts.length,
    schemas: inventory.schemas?.length || 0,
    orphans: orphans.length,
    v2Assets:
      inventory.agents.filter((a) => a.version === 'v2').length +
      inventory.tasks.filter((t) => t.version === 'v2').length,
    v3Assets:
      inventory.agents.filter((a) => a.version === 'v3').length +
      inventory.tasks.filter((t) => t.version === 'v3').length,
  };
}

/**
 * Main inventory generator
 */
async function generateInventory(rootPath, options = {}) {
  const { verbose = false } = options;

  // Scan all asset directories
  const [rawAgents, rawTasks, rawTemplates, rawChecklists, rawScripts, rawSchemas] =
    await Promise.all([
      scanDirectory(path.join(rootPath, ASSET_PATHS.agents), ASSET_PATTERNS.agents, rootPath),
      scanDirectory(path.join(rootPath, ASSET_PATHS.tasks), ASSET_PATTERNS.tasks, rootPath),
      scanDirectory(path.join(rootPath, ASSET_PATHS.templates), ASSET_PATTERNS.templates, rootPath),
      scanDirectory(
        path.join(rootPath, ASSET_PATHS.checklists),
        ASSET_PATTERNS.checklists,
        rootPath
      ),
      scanDirectory(path.join(rootPath, ASSET_PATHS.scripts), ASSET_PATTERNS.scripts, rootPath),
      scanDirectory(path.join(rootPath, ASSET_PATHS.schemas), ASSET_PATTERNS.schemas, rootPath),
    ]);

  // Process each asset type
  const inventory = {
    agents: processAgents(rawAgents),
    tasks: processTasks(rawTasks),
    templates: processTemplates(rawTemplates),
    checklists: processChecklists(rawChecklists),
    scripts: processScripts(rawScripts),
    schemas: rawSchemas.map((s) => ({
      type: 'schema',
      id: path.basename(s.file, path.extname(s.file)),
      path: s.path,
      format: path.extname(s.file).substring(1),
      size: s.size,
      modified: s.modified,
    })),
  };

  // Find orphans and count dependencies
  const orphans = findOrphans(inventory);
  const dependencyCounts = countDependencies(inventory);

  // Add reference counts to assets
  inventory.tasks.forEach((task) => {
    task.referencedBy = dependencyCounts[`task:${task.id}`] || 0;
  });
  inventory.templates.forEach((template) => {
    template.referencedBy = dependencyCounts[`template:${template.id}`] || 0;
  });
  inventory.checklists.forEach((checklist) => {
    checklist.referencedBy = dependencyCounts[`checklist:${checklist.id}`] || 0;
  });

  // Generate final report
  const report = {
    generated: new Date().toISOString(),
    rootPath,
    summary: generateSummary(inventory, orphans),
    orphans,
    assets: inventory,
  };

  // Remove content from verbose output (it's huge)
  if (!verbose) {
    report.assets.agents.forEach((a) => delete a.content);
    report.assets.tasks.forEach((t) => delete t.content);
  }

  return report;
}

/**
 * Format output for console
 */
function formatConsoleOutput(report, verbose = false) {
  const lines = [];

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('  AIOX Asset Inventory');
  lines.push(`  Generated: ${report.generated}`);
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');

  lines.push('SUMMARY');
  lines.push('───────');
  lines.push(`  Agents:     ${report.summary.agents}`);
  lines.push(`  Tasks:      ${report.summary.tasks}`);
  lines.push(`  Templates:  ${report.summary.templates}`);
  lines.push(`  Checklists: ${report.summary.checklists}`);
  lines.push(`  Scripts:    ${report.summary.scripts}`);
  lines.push(`  Schemas:    ${report.summary.schemas}`);
  lines.push('');
  lines.push(`  V2 Assets:  ${report.summary.v2Assets}`);
  lines.push(`  V3 Assets:  ${report.summary.v3Assets}`);
  lines.push(`  Orphans:    ${report.summary.orphans}`);
  lines.push('');

  if (verbose) {
    lines.push('AGENTS');
    lines.push('──────');
    report.assets.agents.forEach((agent) => {
      const vBadge = agent.version === 'v3' ? '🆕' : '📦';
      lines.push(`  ${vBadge} ${agent.id} (${agent.name}) - ${agent.commandCount} commands`);
      if (agent.dependencies.tasks.length > 0) {
        lines.push(`     └─ Tasks: ${agent.dependencies.tasks.slice(0, 5).join(', ')}...`);
      }
    });
    lines.push('');

    lines.push('TASKS (top 20)');
    lines.push('──────────────');
    report.assets.tasks.slice(0, 20).forEach((task) => {
      const vBadge = task.version === 'v3' ? '🆕' : '📦';
      const refs = task.referencedBy > 0 ? `(${task.referencedBy} refs)` : '(orphan)';
      lines.push(`  ${vBadge} ${task.id} ${refs}`);
    });
    lines.push('');

    if (report.orphans.length > 0) {
      lines.push('ORPHAN ASSETS');
      lines.push('─────────────');
      report.orphans.forEach((orphan) => {
        lines.push(`  ⚠️  ${orphan.type}: ${orphan.id}`);
      });
      lines.push('');
    }
  }

  lines.push('═══════════════════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * CLI handler
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
AIOX Asset Inventory Generator

Usage:
  node asset-inventory.js [options]

Options:
  --verbose     Show detailed asset information
  --json        Output as JSON
  --output <path>  Save report to file (default: stdout)
  --help        Show this help message
    `);
    return;
  }

  const verbose = args.includes('--verbose');
  const jsonOutput = args.includes('--json');
  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

  // Find project root (look for .aiox-core directory)
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

  const report = await generateInventory(rootPath, { verbose });

  let output;
  if (jsonOutput) {
    output = JSON.stringify(report, null, 2);
  } else {
    output = formatConsoleOutput(report, verbose);
  }

  if (outputPath) {
    const fullOutputPath = path.resolve(outputPath);
    await fs.writeFile(fullOutputPath, output);
    console.log(`Report saved to: ${fullOutputPath}`);
  } else {
    console.log(output);
  }
}

// Export for programmatic use
module.exports = {
  generateInventory,
  ASSET_PATHS,
};

// Run CLI if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
