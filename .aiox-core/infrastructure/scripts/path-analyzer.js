#!/usr/bin/env node

/**
 * AIOX Path Analyzer
 * Story 2.2: Analyzes dependencies between assets and detects broken references
 *
 * Usage:
 *   node path-analyzer.js [--verbose] [--json] [--fix] [--output path]
 *
 * @module path-analyzer
 */

const fs = require('fs').promises;
const path = require('path');

// Reference patterns to detect
const REFERENCE_PATTERNS = [
  // Markdown code refs to .aiox-core
  { pattern: /`\.aiox-core\/[^`]+`/g, type: 'code-ref' },
  // Task references
  { pattern: /tasks\/([a-z0-9-]+)\.md/gi, type: 'task' },
  // Template references (yaml, yml, md)
  { pattern: /templates\/([a-z0-9-]+)\.(yaml|yml|md)/gi, type: 'template' },
  // Checklist references
  { pattern: /checklists\/([a-z0-9-]+)\.md/gi, type: 'checklist' },
  // Script references
  { pattern: /scripts\/([a-z0-9-]+)\.js/gi, type: 'script' },
  // Data file references
  { pattern: /data\/([a-z0-9-]+)\.(md|yaml|yml|json)/gi, type: 'data' },
  // Schema references
  { pattern: /schemas\/([a-z0-9-]+)\.(json|js)/gi, type: 'schema' },
  // Direct file paths in dependencies section
  { pattern: /^\s+-\s+([a-z0-9-]+\.(?:md|yaml|yml|js))$/gim, type: 'dependency-item' },
];

// Asset directories for path resolution
const ASSET_DIRS = {
  task: '.aiox-core/development/tasks',
  template: '.aiox-core/product/templates',
  checklist: '.aiox-core/product/checklists',
  script: '.aiox-core/infrastructure/scripts',
  data: '.aiox-core/development/data',
  schema: '.aiox-core/schemas',
  agent: '.aiox-core/development/agents',
};

/**
 * Find all files to analyze
 */
async function findFilesToAnalyze(rootPath) {
  const files = [];
  const dirsToScan = [
    { dir: '.aiox-core/development/agents', type: 'agent' },
    { dir: '.aiox-core/development/tasks', type: 'task' },
    { dir: '.aiox-core/product/templates', type: 'template' },
    { dir: '.aiox-core/product/checklists', type: 'checklist' },
  ];

  for (const { dir, type } of dirsToScan) {
    const fullDir = path.join(rootPath, dir);
    try {
      const entries = await fs.readdir(fullDir);
      for (const entry of entries) {
        if (entry.endsWith('.md') || entry.endsWith('.yaml') || entry.endsWith('.yml')) {
          files.push({
            path: path.join(dir, entry),
            fullPath: path.join(fullDir, entry),
            type,
          });
        }
      }
    } catch (e) {
      // Directory doesn't exist
    }
  }

  return files;
}

/**
 * Extract references from file content
 */
function extractReferences(content, filePath) {
  const references = [];

  for (const { pattern, type } of REFERENCE_PATTERNS) {
    // Reset regex
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(content)) !== null) {
      const fullMatch = match[0];
      let refName = match[1] || fullMatch;

      // Clean up the reference
      refName = refName.replace(/^`|`$/g, '');

      // Skip if it's a self-reference
      if (refName === path.basename(filePath)) continue;

      references.push({
        type,
        reference: refName,
        fullMatch,
        position: match.index,
      });
    }
  }

  return references;
}

/**
 * Resolve reference to actual file path
 */
function resolveReference(ref, rootPath) {
  // If it's a full path already
  if (ref.reference.startsWith('.aiox-core/')) {
    return path.join(rootPath, ref.reference);
  }

  // If it's a dependency item (just filename)
  if (ref.type === 'dependency-item') {
    // Try to find in common locations
    const possibleDirs = Object.values(ASSET_DIRS);
    for (const dir of possibleDirs) {
      const fullPath = path.join(rootPath, dir, ref.reference);
      return fullPath; // Return first match attempt
    }
  }

  // Resolve based on type
  const dirMap = {
    task: ASSET_DIRS.task,
    template: ASSET_DIRS.template,
    checklist: ASSET_DIRS.checklist,
    script: ASSET_DIRS.script,
    data: ASSET_DIRS.data,
    schema: ASSET_DIRS.schema,
  };

  const baseDir = dirMap[ref.type];
  if (baseDir) {
    // Extract just the filename if it includes directory
    const filename = ref.reference.includes('/') ? path.basename(ref.reference) : ref.reference;
    return path.join(rootPath, baseDir, filename);
  }

  return null;
}

/**
 * Check if file exists
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
 * Analyze a single file
 */
async function analyzeFile(file, rootPath) {
  const content = await fs.readFile(file.fullPath, 'utf-8');
  const references = extractReferences(content, file.path);

  const analysis = {
    file: file.path,
    type: file.type,
    references: [],
    brokenReferences: [],
    validReferences: [],
  };

  for (const ref of references) {
    const resolvedPath = resolveReference(ref, rootPath);

    if (resolvedPath) {
      const exists = await fileExists(resolvedPath);
      const relativePath = path.relative(rootPath, resolvedPath);

      const refInfo = {
        type: ref.type,
        reference: ref.reference,
        resolvedPath: relativePath,
        exists,
      };

      analysis.references.push(refInfo);

      if (exists) {
        analysis.validReferences.push(refInfo);
      } else {
        analysis.brokenReferences.push(refInfo);
      }
    }
  }

  return analysis;
}

/**
 * Suggest fixes for broken references
 */
async function suggestFixes(brokenRef, rootPath) {
  const suggestions = [];
  const filename = path.basename(brokenRef.reference);
  const nameWithoutExt = path.basename(filename, path.extname(filename));

  // Search for similar files
  for (const [type, dir] of Object.entries(ASSET_DIRS)) {
    const fullDir = path.join(rootPath, dir);
    try {
      const files = await fs.readdir(fullDir);
      for (const file of files) {
        const fileWithoutExt = path.basename(file, path.extname(file));

        // Check for exact match
        if (file === filename || file === brokenRef.reference) {
          suggestions.push({
            type: 'exact-match',
            suggestedPath: path.join(dir, file),
            confidence: 'high',
          });
        }
        // Check for similar name (case insensitive)
        else if (fileWithoutExt.toLowerCase() === nameWithoutExt.toLowerCase()) {
          suggestions.push({
            type: 'similar-name',
            suggestedPath: path.join(dir, file),
            confidence: 'medium',
          });
        }
        // Check for partial match
        else if (
          fileWithoutExt.includes(nameWithoutExt) ||
          nameWithoutExt.includes(fileWithoutExt)
        ) {
          suggestions.push({
            type: 'partial-match',
            suggestedPath: path.join(dir, file),
            confidence: 'low',
          });
        }
      }
    } catch (e) {
      // Directory doesn't exist
    }
  }

  return suggestions;
}

/**
 * Main path analysis
 */
async function analyzePaths(rootPath, options = {}) {
  const { verbose = false, fix = false } = options;

  const files = await findFilesToAnalyze(rootPath);
  const results = [];
  const allBrokenRefs = [];
  const allValidRefs = [];

  for (const file of files) {
    const analysis = await analyzeFile(file, rootPath);
    results.push(analysis);

    analysis.brokenReferences.forEach((ref) => {
      allBrokenRefs.push({
        ...ref,
        sourceFile: file.path,
      });
    });

    analysis.validReferences.forEach((ref) => {
      allValidRefs.push({
        ...ref,
        sourceFile: file.path,
      });
    });
  }

  // Generate fix suggestions if requested
  const fixSuggestions = [];
  if (fix) {
    for (const broken of allBrokenRefs) {
      const suggestions = await suggestFixes(broken, rootPath);
      if (suggestions.length > 0) {
        fixSuggestions.push({
          broken,
          suggestions,
        });
      }
    }
  }

  // Build reference graph
  const referenceGraph = {};
  for (const result of results) {
    referenceGraph[result.file] = result.validReferences.map((r) => r.resolvedPath);
  }

  // Calculate statistics
  const stats = {
    filesAnalyzed: files.length,
    totalReferences: allValidRefs.length + allBrokenRefs.length,
    validReferences: allValidRefs.length,
    brokenReferences: allBrokenRefs.length,
    byType: {},
  };

  // Count by type
  [...allValidRefs, ...allBrokenRefs].forEach((ref) => {
    stats.byType[ref.type] = (stats.byType[ref.type] || 0) + 1;
  });

  return {
    generated: new Date().toISOString(),
    rootPath,
    stats,
    brokenReferences: allBrokenRefs,
    fixSuggestions,
    referenceGraph,
    details: verbose ? results : undefined,
  };
}

/**
 * Format output for console
 */
function formatConsoleOutput(report, verbose = false) {
  const lines = [];

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('  AIOX Path Analysis Report');
  lines.push(`  Generated: ${report.generated}`);
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');

  lines.push('SUMMARY');
  lines.push('───────');
  lines.push(`  Files Analyzed:    ${report.stats.filesAnalyzed}`);
  lines.push(`  Total References:  ${report.stats.totalReferences}`);
  lines.push(`  Valid References:  ${report.stats.validReferences}`);
  lines.push(`  Broken References: ${report.stats.brokenReferences}`);
  lines.push('');

  lines.push('REFERENCES BY TYPE');
  lines.push('──────────────────');
  for (const [type, count] of Object.entries(report.stats.byType)) {
    lines.push(`  ${type}: ${count}`);
  }
  lines.push('');

  if (report.brokenReferences.length > 0) {
    lines.push('BROKEN REFERENCES');
    lines.push('─────────────────');
    report.brokenReferences.forEach((ref) => {
      lines.push(`  ❌ ${ref.sourceFile}`);
      lines.push(`     └─ Missing: ${ref.reference} (type: ${ref.type})`);
    });
    lines.push('');
  }

  if (report.fixSuggestions && report.fixSuggestions.length > 0) {
    lines.push('FIX SUGGESTIONS');
    lines.push('───────────────');
    report.fixSuggestions.forEach((fix) => {
      lines.push(`  📍 ${fix.broken.reference} in ${fix.broken.sourceFile}`);
      fix.suggestions.slice(0, 3).forEach((s) => {
        const icon = s.confidence === 'high' ? '✅' : s.confidence === 'medium' ? '🔶' : '🔷';
        lines.push(`     ${icon} ${s.suggestedPath} (${s.confidence})`);
      });
    });
    lines.push('');
  }

  if (report.brokenReferences.length === 0) {
    lines.push('✅ All references are valid!');
    lines.push('');
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
AIOX Path Analyzer

Usage:
  node path-analyzer.js [options]

Options:
  --verbose     Show detailed file analysis
  --json        Output as JSON
  --fix         Include fix suggestions for broken references
  --output <path>  Save report to file (default: stdout)
  --help        Show this help message
    `);
    return;
  }

  const verbose = args.includes('--verbose');
  const jsonOutput = args.includes('--json');
  const fix = args.includes('--fix');
  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

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

  const report = await analyzePaths(rootPath, { verbose, fix });

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

  // Exit with error code if there are broken references
  process.exit(report.brokenReferences.length > 0 ? 1 : 0);
}

// Export for programmatic use
module.exports = {
  analyzePaths,
  extractReferences,
  REFERENCE_PATTERNS,
  ASSET_DIRS,
};

// Run CLI if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
