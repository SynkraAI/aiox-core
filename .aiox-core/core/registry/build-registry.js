/**
 * Service Registry Builder
 *
 * Scans AIOX modules and builds the service registry JSON file.
 * Extracts metadata from tasks, templates, scripts, checklists, and workflows.
 *
 * @module build-registry
 * @version 1.0.0
 * @created Story 2.6 - Service Registry Creation
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// Registry version
const REGISTRY_VERSION = '1.0.0';

// Source directories to scan
const SCAN_SOURCES = [
  {
    pattern: '.aiox-core/development/tasks/**/*.md',
    category: 'task',
    taskFormat: 'TASK-FORMAT-V1',
    subcategoryExtractor: (filePath) => {
      const parts = filePath.split('/');
      const filename = parts[parts.length - 1];
      // Extract agent prefix (e.g., dev-, qa-, po-)
      const prefixMatch = filename.match(/^([a-z]+)-/);
      if (prefixMatch) {
        return prefixMatch[1];
      }
      // Extract db- prefix for database tasks
      if (filename.startsWith('db-')) {
        return 'database';
      }
      // Check for specific keywords
      if (filename.includes('create')) return 'creation';
      if (filename.includes('modify') || filename.includes('edit')) return 'modification';
      if (filename.includes('audit') || filename.includes('validate')) return 'validation';
      if (filename.includes('analyze')) return 'analysis';
      return 'general';
    },
  },
  {
    pattern: '.aiox-core/product/templates/**/*.md',
    category: 'template',
    taskFormat: 'TEMPLATE',
    subcategoryExtractor: (filePath) => {
      if (filePath.includes('ide-rules')) return 'ide-rules';
      if (filePath.includes('personalized')) return 'personalized';
      return 'document';
    },
  },
  {
    pattern: '.aiox-core/infrastructure/scripts/**/*.js',
    category: 'script',
    taskFormat: 'SCRIPT',
    subcategoryExtractor: (filePath) => {
      const filename = path.basename(filePath, '.js');
      if (filename.includes('validator') || filename.includes('checker')) return 'validation';
      if (filename.includes('analyzer')) return 'analysis';
      if (filename.includes('generator')) return 'generation';
      if (filename.includes('manager')) return 'management';
      if (filename.includes('config') || filename.includes('loader')) return 'configuration';
      if (filename.includes('test')) return 'testing';
      return 'utility';
    },
    skipArchived: true,
  },
  {
    pattern: '.aiox-core/product/checklists/**/*.md',
    category: 'checklist',
    taskFormat: 'CHECKLIST',
    subcategoryExtractor: () => 'quality',
  },
  {
    pattern: '.aiox-core/development/workflows/**/*.yaml',
    category: 'workflow',
    taskFormat: 'WORKFLOW',
    subcategoryExtractor: (filePath) => {
      const filename = path.basename(filePath, '.yaml');
      if (filename.includes('brownfield')) return 'brownfield';
      if (filename.includes('greenfield')) return 'greenfield';
      return 'general';
    },
  },
  {
    pattern: '.aiox-core/core/data/**/*.md',
    category: 'data',
    taskFormat: 'TASK-FORMAT-V1',
    subcategoryExtractor: () => 'knowledge',
  },
  {
    pattern: '.aiox-core/core/data/**/*.yaml',
    category: 'data',
    taskFormat: 'TASK-FORMAT-V1',
    subcategoryExtractor: () => 'configuration',
  },
];

/**
 * Convert filename to kebab-case ID
 */
function toKebabId(filename) {
  return filename
    .replace(/\.(md|js|yaml|yml)$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert kebab-case to title case
 */
function toTitleCase(kebab) {
  return kebab
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract description from markdown file (first paragraph)
 */
async function extractMarkdownDescription(filePath, baseDir) {
  try {
    const fullPath = path.join(baseDir, filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    const lines = content.split('\n');

    // Find first non-empty, non-header line
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        // Clean up markdown formatting
        return trimmed
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/`/g, '')
          .slice(0, 200);
      }
    }
    return 'No description available';
  } catch (_error) {
    return 'No description available';
  }
}

/**
 * Extract description from JS file (JSDoc or first comment)
 */
async function extractJSDescription(filePath, baseDir) {
  try {
    const fullPath = path.join(baseDir, filePath);
    const content = await fs.readFile(fullPath, 'utf8');

    // Look for JSDoc @description or first line after /**
    const jsdocMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (jsdocMatch) {
      const jsdoc = jsdocMatch[0];
      // Extract description
      const descMatch = jsdoc.match(/@description\s+(.+?)(?=\n\s*\*\s*@|\*\/)/s);
      if (descMatch) {
        return descMatch[1].replace(/\n\s*\*\s*/g, ' ').trim().slice(0, 200);
      }
      // Get first paragraph after /**
      const firstPara = jsdoc.match(/\/\*\*\s*\n\s*\*\s*(.+?)(?=\n\s*\*\s*\n|\n\s*\*\s*@|\*\/)/s);
      if (firstPara) {
        return firstPara[1].replace(/\n\s*\*\s*/g, ' ').trim().slice(0, 200);
      }
    }
    return 'JavaScript utility script';
  } catch (_error) {
    return 'JavaScript utility script';
  }
}

/**
 * Extract tags from filename and path
 */
function extractTags(filePath, category, subcategory) {
  const filename = path.basename(filePath).replace(/\.(md|js|yaml|yml)$/, '');
  const tags = new Set();

  // Add category and subcategory
  tags.add(category);
  if (subcategory) tags.add(subcategory);

  // Extract words from filename
  const words = filename.split(/[-_]/).filter(w => w.length > 2);
  words.forEach(w => tags.add(w.toLowerCase()));

  // Add specific tags based on patterns
  if (filename.includes('qa') || filename.includes('test')) tags.add('testing');
  if (filename.includes('dev')) tags.add('development');
  if (filename.includes('db') || filename.includes('database')) tags.add('database');
  if (filename.includes('create') || filename.includes('generate')) tags.add('creation');
  if (filename.includes('validate') || filename.includes('check')) tags.add('validation');
  if (filename.includes('analyze') || filename.includes('audit')) tags.add('analysis');
  if (filename.includes('po') || filename.includes('story')) tags.add('product');
  if (filename.includes('github') || filename.includes('git')) tags.add('git');

  return Array.from(tags);
}

/**
 * Extract agents from filename
 */
function extractAgents(filePath) {
  const filename = path.basename(filePath);
  const agents = [];

  const agentPrefixes = {
    'dev-': 'dev',
    'qa-': 'qa',
    'po-': 'po',
    'pm-': 'pm',
    'sm-': 'sm',
    'db-': 'db-sage',
    'architect-': 'architect',
    'analyst-': 'analyst',
    'github-devops-': 'github-devops',
    'ux-': 'ux-expert',
  };

  for (const [prefix, agent] of Object.entries(agentPrefixes)) {
    if (filename.startsWith(prefix)) {
      agents.push(agent);
      break;
    }
  }

  return agents;
}

/**
 * Determine executor types based on category
 */
function getExecutorTypes(category) {
  const executorMap = {
    'task': ['Agent', 'Worker'],
    'template': ['Agent'],
    'script': ['CLI', 'Script'],
    'checklist': ['Agent'],
    'workflow': ['Agent', 'Worker'],
    'data': ['Agent'],
  };
  return executorMap[category] || ['Agent'];
}

/**
 * Estimate performance based on category
 */
function estimatePerformance(category) {
  const perfMap = {
    'task': { avgDuration: '1m', cacheable: false, parallelizable: false },
    'template': { avgDuration: '100ms', cacheable: true, parallelizable: true },
    'script': { avgDuration: '500ms', cacheable: true, parallelizable: true },
    'checklist': { avgDuration: '2m', cacheable: false, parallelizable: false },
    'workflow': { avgDuration: '5m', cacheable: false, parallelizable: false },
    'data': { avgDuration: '50ms', cacheable: true, parallelizable: true },
  };
  return perfMap[category] || { avgDuration: '1s', cacheable: false, parallelizable: false };
}

/**
 * Build worker entry from file
 */
async function buildWorkerEntry(filePath, source, baseDir) {
  const filename = path.basename(filePath);
  const id = toKebabId(filename);
  const name = toTitleCase(id);
  const subcategory = source.subcategoryExtractor(filePath);

  // Extract description based on file type
  let description;
  if (filePath.endsWith('.js')) {
    description = await extractJSDescription(filePath, baseDir);
  } else {
    description = await extractMarkdownDescription(filePath, baseDir);
  }

  return {
    id,
    name,
    description,
    category: source.category,
    subcategory,
    inputs: [],
    outputs: [],
    tags: extractTags(filePath, source.category, subcategory),
    path: filePath.replace(/\\/g, '/'),
    taskFormat: source.taskFormat,
    executorTypes: getExecutorTypes(source.category),
    performance: estimatePerformance(source.category),
    agents: extractAgents(filePath),
    metadata: {
      source: source.category === 'task' ? 'development' :
        source.category === 'template' || source.category === 'checklist' ? 'product' :
          source.category === 'script' ? 'infrastructure' : 'core',
      addedVersion: REGISTRY_VERSION,
    },
  };
}

/**
 * Build category summary
 */
function buildCategorySummary(workers) {
  const categories = {};

  for (const worker of workers) {
    if (!categories[worker.category]) {
      categories[worker.category] = {
        count: 0,
        subcategories: new Set(),
        description: getCategoryDescription(worker.category),
      };
    }
    categories[worker.category].count++;
    if (worker.subcategory) {
      categories[worker.category].subcategories.add(worker.subcategory);
    }
  }

  // Convert Sets to arrays
  for (const cat of Object.values(categories)) {
    cat.subcategories = Array.from(cat.subcategories).sort();
  }

  return categories;
}

/**
 * Get category description
 */
function getCategoryDescription(category) {
  const descriptions = {
    'task': 'Executable task workflows for agents',
    'template': 'Document and code templates',
    'script': 'JavaScript utility scripts',
    'checklist': 'Quality validation checklists',
    'workflow': 'Multi-step workflow definitions',
    'data': 'Knowledge base and configuration data',
  };
  return descriptions[category] || 'General category';
}

/**
 * Main build function
 */
async function buildRegistry(baseDir = process.cwd()) {
  console.log('Building service registry...');
  console.log(`Base directory: ${baseDir}`);

  const workers = [];
  const seenIds = new Set();

  for (const source of SCAN_SOURCES) {
    console.log(`\nScanning: ${source.pattern}`);

    try {
      const files = await glob(source.pattern, {
        cwd: baseDir,
        nodir: true,
        ignore: source.skipArchived ? ['**/_archived/**'] : [],
      });

      console.log(`  Found ${files.length} files`);

      for (const file of files) {
        const worker = await buildWorkerEntry(file, source, baseDir);

        // Ensure unique IDs
        if (seenIds.has(worker.id)) {
          worker.id = `${worker.id}-${source.category}`;
        }
        seenIds.add(worker.id);

        workers.push(worker);
      }
    } catch (error) {
      console.error(`  Error scanning ${source.pattern}:`, error.message);
    }
  }

  // Sort workers by category and name
  workers.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  const registry = {
    version: REGISTRY_VERSION,
    generated: new Date().toISOString(),
    totalWorkers: workers.length,
    categories: buildCategorySummary(workers),
    workers,
  };

  console.log(`\nTotal workers: ${workers.length}`);
  console.log('Categories:', Object.keys(registry.categories).join(', '));

  return registry;
}

/**
 * Save registry to file
 */
async function saveRegistry(registry, outputPath) {
  const json = JSON.stringify(registry, null, 2);
  await fs.writeFile(outputPath, json, 'utf8');
  console.log(`\nRegistry saved to: ${outputPath}`);
}

/**
 * CLI entry point
 */
async function main() {
  const baseDir = process.argv[2] || process.cwd();
  const outputPath = process.argv[3] || path.join(baseDir, '.aiox-core/core/registry/service-registry.json');

  try {
    const registry = await buildRegistry(baseDir);
    await saveRegistry(registry, outputPath);

    console.log('\nBuild complete!');
    console.log(`Workers: ${registry.totalWorkers}`);

    if (registry.totalWorkers < 97) {
      console.warn(`\nWARNING: Registry has ${registry.totalWorkers} workers, expected 97+`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  buildRegistry,
  saveRegistry,
  REGISTRY_VERSION,
};
