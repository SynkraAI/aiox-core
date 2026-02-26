#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const fg = require('fast-glob');
const crypto = require('crypto');
const { classifyLayer } = require('../../core/ids/layer-classifier');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const REGISTRY_PATH = path.resolve(__dirname, '../../data/entity-registry.yaml');

const SCAN_CONFIG = [
  { category: 'tasks', basePath: '.aios-core/development/tasks', glob: '**/*.md', type: 'task' },
  { category: 'templates', basePath: '.aios-core/product/templates', glob: '**/*.{yaml,yml,md}', type: 'template' },
  { category: 'scripts', basePath: '.aios-core/development/scripts', glob: '**/*.{js,mjs}', type: 'script' },
  { category: 'modules', basePath: '.aios-core/core', glob: '**/*.{js,mjs}', type: 'module' },
  { category: 'agents', basePath: '.aios-core/development/agents', glob: '**/*.{md,yaml,yml}', type: 'agent' },
  { category: 'checklists', basePath: '.aios-core/development/checklists', glob: '**/*.md', type: 'checklist' },
  { category: 'data', basePath: '.aios-core/data', glob: '**/*.{yaml,yml,md}', type: 'data' },
  { category: 'workflows', basePath: '.aios-core/development/workflows', glob: '**/*.{yaml,yml}', type: 'workflow' },
  { category: 'utils', basePath: '.aios-core/core/utils', glob: '**/*.js', type: 'util' },
  { category: 'tools', basePath: '.aios-core/development/tools', glob: '**/*.{md,js,sh}', type: 'tool' },
  { category: 'infra-scripts', basePath: '.aios-core/infrastructure/scripts', glob: '**/*.js', type: 'script' },
  { category: 'infra-tools', basePath: '.aios-core/infrastructure/tools', glob: '**/*.{yaml,yml,md}', type: 'tool' },
  { category: 'product-checklists', basePath: '.aios-core/product/checklists', glob: '**/*.md', type: 'checklist' },
  { category: 'product-data', basePath: '.aios-core/product/data', glob: '**/*.{yaml,yml,md}', type: 'data' }
];

const ADAPTABILITY_DEFAULTS = {
  agent: 0.3,
  module: 0.4,
  template: 0.5,
  checklist: 0.6,
  data: 0.5,
  script: 0.7,
  task: 0.8,
  workflow: 0.4,
  util: 0.6,
  tool: 0.7
};

const EXTERNAL_TOOLS = new Set([
  'coderabbit', 'git', 'github-cli', 'docker', 'supabase', 'browser',
  'ffmpeg', 'n8n', 'context7', 'playwright', 'apify', 'clickup',
  'jira', 'slack', 'exa', 'eslint', 'jest', 'npm', 'node',
  'docker-gateway', 'desktop-commander', 'railway'
]);

const DEPRECATED_PATTERNS = [/^old[-_]/, /^backup[-_]/, /deprecated/i, /^legacy[-_]/];

const SENTINEL_VALUES = new Set(['n/a', 'na', 'none', 'tbd', 'todo', '-', '']);

function isSentinel(value) {
  return SENTINEL_VALUES.has(value.toLowerCase().trim());
}

function isNoise(value) {
  const trimmed = value.trim();
  // Very short fragments (1-2 chars) unless they are known agent refs
  if (trimmed.length <= 2 && !KNOWN_AGENTS.includes(trimmed)) return true;
  // Natural language fragments (contains spaces and > 2 words)
  if (trimmed.includes(' ') && trimmed.split(/\s+/).length > 2) return true;
  // Template placeholders
  if (trimmed.includes('{{') || trimmed.includes('${')) return true;
  return false;
}

function computeChecksum(filePath) {
  const content = fs.readFileSync(filePath);
  return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
}

function extractEntityId(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

function extractKeywords(filePath, content) {
  const name = path.basename(filePath, path.extname(filePath));
  const parts = name.split(/[-_.]/g).filter((p) => p.length > 1);

  const headerMatch = content.match(/^#\s+(.+)/m);
  if (headerMatch) {
    const headerWords = headerMatch[1]
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['the', 'and', 'for', 'with', 'this', 'that', 'from'].includes(w));
    parts.push(...headerWords.slice(0, 5));
  }

  return [...new Set(parts.map((p) => p.toLowerCase()))];
}

function extractPurpose(content, filePath) {
  const purposeMatch = content.match(/^##\s*Purpose\s*\n+([\s\S]*?)(?=\n##|\n---|\n$)/im);
  if (purposeMatch) {
    return purposeMatch[1].trim().split('\n')[0].substring(0, 200);
  }

  const descMatch = content.match(/(?:description|purpose|summary)[:]\s*(.+)/i);
  if (descMatch) {
    return descMatch[1].trim().substring(0, 200);
  }

  const headerMatch = content.match(/^#\s+(.+)/m);
  if (headerMatch) {
    return headerMatch[1].trim().substring(0, 200);
  }

  return `Entity at ${path.relative(REPO_ROOT, filePath)}`;
}

const YAML_DEP_FIELDS = {
  agent: {
    nested: ['tasks', 'templates', 'checklists', 'tools', 'scripts'],
    arrayFields: [
      { arrayPath: 'commands', field: 'task' },
    ],
  },
  workflow: {
    nested: [],
    arrayFields: [
      { arrayPath: 'phases', field: 'task' },
      { arrayPath: 'phases', field: 'agent' },
      { arrayPath: 'sequence', field: 'agent' },
      { arrayPath: 'steps', field: 'task' },
      { arrayPath: 'steps', field: 'uses' },
    ],
  },
};

const KNOWN_AGENTS = [
  'dev', 'qa', 'pm', 'po', 'sm', 'architect', 'devops',
  'analyst', 'data-engineer', 'ux-design-expert', 'aios-master'
];

// Pattern A: YAML dependency block items (- name.md)
const YAML_BLOCK_RE = /^\s*[-*]\s+([\w.-]+\.(?:md|yaml|js))\s*$/gm;
// Pattern B: Label list (- **Tasks:** a.md, b.md)
const LABEL_LIST_RE = /^\s*[-*]\s+\*\*[\w\s]+:\*\*\s+(.+)$/gm;
// Pattern C: Markdown links to entity files
const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+\.(?:md|yaml|js))\)/g;
// Pattern D: Agent references
const AGENT_REF_RE = new RegExp('@(' + KNOWN_AGENTS.join('|') + ')\\b', 'g');

function extractYamlDependencies(filePath, entityType, verbose = false) {
  const deps = new Set();
  const fieldMap = YAML_DEP_FIELDS[entityType];
  if (!fieldMap) return [];

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }

  let doc;
  // For MD files, extract YAML from code blocks instead of parsing the whole file
  if (path.extname(filePath) === '.md') {
    const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)```/);
    if (!yamlBlockMatch) return [];
    try {
      doc = yaml.load(yamlBlockMatch[1]);
    } catch {
      console.warn(`[IDS] YAML parse warning (embedded block): ${filePath} — skipping`);
      return [];
    }
  } else {
    try {
      doc = yaml.load(content);
    } catch {
      console.warn(`[IDS] YAML parse warning: ${filePath} — skipping YAML extraction`);
      return [];
    }
  }

  if (!doc || typeof doc !== 'object') return [];

  // Extract nested dependency fields (e.g., doc.dependencies.tasks)
  const depsSection = doc.dependencies || {};
  for (const field of fieldMap.nested) {
    const items = depsSection[field];
    if (Array.isArray(items)) {
      for (const item of items) {
        if (typeof item === 'string') {
          const cleaned = item.replace(/#.*$/, '').trim().replace(/\.md$/, '');
          if (!cleaned) continue;
          if (isSentinel(cleaned)) {
            if (verbose) console.log(`[IDS] Filtered sentinel "${cleaned}" from YAML deps in "${filePath}"`);
            continue;
          }
          if (isNoise(cleaned)) {
            if (verbose) console.log(`[IDS] Filtered noise "${cleaned}" from YAML deps in "${filePath}"`);
            continue;
          }
          deps.add(cleaned);
        }
      }
    }
  }

  // Extract array fields (e.g., doc.commands[].task, doc.sequence[].agent)
  for (const { arrayPath, field } of fieldMap.arrayFields) {
    const arr = doc[arrayPath] || doc.workflow?.[arrayPath] || [];
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (item && typeof item === 'object') {
          const val = item[field];
          if (typeof val === 'string' && val.trim()) {
            deps.add(val.trim().replace(/\.md$/, ''));
          }
        }
      }
    }
  }

  return [...deps];
}

function extractMarkdownCrossReferences(content, entityId, verbose = false) {
  const deps = new Set();

  const addDep = (ref) => {
    if (ref === entityId) return;
    if (isSentinel(ref)) {
      if (verbose) console.log(`[IDS] Filtered sentinel "${ref}" from MD cross-refs in "${entityId}"`);
      return;
    }
    if (isNoise(ref)) {
      if (verbose) console.log(`[IDS] Filtered noise "${ref}" from MD cross-refs in "${entityId}"`);
      return;
    }
    deps.add(ref);
  };

  // Pattern A: YAML block items (- filename.md)
  let match;
  while ((match = YAML_BLOCK_RE.exec(content)) !== null) {
    addDep(match[1].replace(/\.md$/, ''));
  }

  // Pattern B: Label lists (- **Tasks:** a.md, b.md)
  while ((match = LABEL_LIST_RE.exec(content)) !== null) {
    const items = match[1].split(/[,;]\s*/);
    for (const item of items) {
      const fileMatch = item.trim().match(/([\w.-]+\.(?:md|yaml|js))/);
      if (fileMatch) {
        addDep(fileMatch[1].replace(/\.md$/, ''));
      }
    }
  }

  // Pattern C: Markdown links to entity files
  while ((match = MD_LINK_RE.exec(content)) !== null) {
    const linkPath = match[2];
    const basename = path.basename(linkPath, path.extname(linkPath));
    addDep(basename);
  }

  // Pattern D: Agent references (@dev, @qa, etc.)
  while ((match = AGENT_REF_RE.exec(content)) !== null) {
    deps.add(match[1]);
  }

  return [...deps];
}

function detectDependencies(content, entityId, verbose = false) {
  const deps = new Set();

  const requireMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
  for (const m of requireMatches) {
    const reqPath = m[1];
    if (reqPath.startsWith('.') || reqPath.startsWith('/')) {
      const base = path.basename(reqPath, path.extname(reqPath));
      if (base !== entityId) deps.add(base);
    }
  }

  const importMatches = content.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g);
  for (const m of importMatches) {
    const impPath = m[1];
    if (impPath.startsWith('.') || impPath.startsWith('/')) {
      const base = path.basename(impPath, path.extname(impPath));
      if (base !== entityId) deps.add(base);
    }
  }

  const depListMatch = content.match(/dependencies:\s*\n((?:\s+-\s+.+\n)*)/);
  if (depListMatch) {
    const items = depListMatch[1].matchAll(/-\s+(.+)/g);
    for (const item of items) {
      const dep = item[1].trim().replace(/\.md$/, '');
      if (dep === entityId) continue;
      if (isSentinel(dep)) {
        if (verbose) console.log(`[IDS] Filtered sentinel "${dep}" from "${entityId}"`);
        continue;
      }
      if (isNoise(dep)) {
        if (verbose) console.log(`[IDS] Filtered noise "${dep}" from "${entityId}"`);
        continue;
      }
      deps.add(dep);
    }
  }

  return [...deps];
}

function scanCategory(config, verbose = false) {
  const absBase = path.resolve(REPO_ROOT, config.basePath);

  if (!fs.existsSync(absBase)) {
    console.warn(`[IDS] Directory not found: ${config.basePath} — skipping`);
    return {};
  }

  const globPattern = path.posix.join(absBase.replace(/\\/g, '/'), config.glob);
  const files = fg.sync(globPattern, { onlyFiles: true, absolute: true });

  const entities = {};
  const seenIds = new Set();

  for (const filePath of files) {
    const entityId = extractEntityId(filePath);

    if (seenIds.has(entityId)) {
      console.warn(`[IDS] Duplicate entity ID "${entityId}" at ${path.relative(REPO_ROOT, filePath)} — skipping`);
      continue;
    }
    seenIds.add(entityId);

    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      console.warn(`[IDS] Could not read ${filePath} — skipping`);
      continue;
    }

    const relPath = path.relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    const keywords = extractKeywords(filePath, content);
    const purpose = extractPurpose(content, filePath);
    const baseDeps = detectDependencies(content, entityId, verbose);

    // Semantic YAML extraction for agents and workflows
    const yamlCategories = ['agents', 'workflows'];
    const yamlDeps = yamlCategories.includes(config.category)
      ? extractYamlDependencies(filePath, config.type, verbose)
      : [];

    // Markdown cross-reference extraction for tasks, checklists, templates, product-checklists
    const mdCategories = ['tasks', 'checklists', 'templates', 'product-checklists'];
    const mdDeps = mdCategories.includes(config.category)
      ? extractMarkdownCrossReferences(content, entityId, verbose)
      : [];

    // Merge all dependencies (deduplicated — each extractor already filters sentinel/noise)
    const dependencies = [...new Set([...baseDeps, ...yamlDeps, ...mdDeps])];

    // Extract lifecycle override from YAML frontmatter or metadata (NOG-16B AC5)
    let lifecycleOverride = null;
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const lfMatch = frontmatterMatch[1].match(/^lifecycle:\s*(.+)$/m);
      if (lfMatch) lifecycleOverride = lfMatch[1].trim();
    }
    if (!lifecycleOverride) {
      const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)```/);
      if (yamlBlockMatch) {
        const lfMatch = yamlBlockMatch[1].match(/^lifecycle:\s*(.+)$/m);
        if (lfMatch) lifecycleOverride = lfMatch[1].trim();
      }
    }
    if (!lifecycleOverride) {
      const inlineMatch = content.match(/^lifecycle:\s*(.+)$/m);
      if (inlineMatch) lifecycleOverride = inlineMatch[1].trim();
    }

    const checksum = computeChecksum(filePath);
    const defaultScore = ADAPTABILITY_DEFAULTS[config.type] || 0.5;

    const entity = {
      path: relPath,
      layer: classifyLayer(relPath),
      type: config.type,
      purpose,
      keywords,
      usedBy: [],
      dependencies,
      externalDeps: [],
      plannedDeps: [],
      lifecycle: 'experimental',
      adaptability: {
        score: defaultScore,
        constraints: [],
        extensionPoints: []
      },
      checksum,
      lastVerified: new Date().toISOString()
    };

    if (lifecycleOverride) {
      entity._lifecycleOverride = lifecycleOverride;
    }

    entities[entityId] = entity;
  }

  return entities;
}

function buildNameIndex(allEntities) {
  const nameIndex = new Map();
  for (const [category, entities] of Object.entries(allEntities)) {
    for (const [id, entity] of Object.entries(entities)) {
      nameIndex.set(id, { category, id });
      if (entity.path) {
        const filename = entity.path.split('/').pop();
        if (!nameIndex.has(filename)) {
          nameIndex.set(filename, { category, id });
        }
        const basename = filename.replace(/\.[^.]+$/, '');
        if (!nameIndex.has(basename)) {
          nameIndex.set(basename, { category, id });
        }
      }
    }
  }
  return nameIndex;
}

function countResolution(allEntities, nameIndex) {
  let total = 0;
  let resolved = 0;
  for (const entities of Object.values(allEntities)) {
    for (const entity of Object.values(entities)) {
      for (const dep of entity.dependencies) {
        total++;
        if (nameIndex.has(dep)) resolved++;
      }
    }
  }
  return { total, resolved, unresolved: total - resolved };
}

function resolveUsedBy(allEntities) {
  const nameIndex = buildNameIndex(allEntities);

  // Reset usedBy to avoid duplicates on re-scan
  for (const entities of Object.values(allEntities)) {
    for (const entity of Object.values(entities)) {
      entity.usedBy = [];
    }
  }

  // Build reverse references
  for (const [category, entities] of Object.entries(allEntities)) {
    for (const [entityId, entity] of Object.entries(entities)) {
      for (const depRef of entity.dependencies) {
        const target = nameIndex.get(depRef);
        if (target && allEntities[target.category] && allEntities[target.category][target.id]) {
          const usedBy = allEntities[target.category][target.id].usedBy;
          if (!usedBy.includes(entityId)) {
            usedBy.push(entityId);
          }
        }
      }
    }
  }
}

function classifyDependencies(allEntities, nameIndex) {
  for (const entities of Object.values(allEntities)) {
    for (const entity of Object.values(entities)) {
      const internal = [];
      const external = [];
      const planned = [];
      for (const dep of entity.dependencies) {
        if (nameIndex.has(dep)) {
          internal.push(dep);
        } else if (EXTERNAL_TOOLS.has(dep.toLowerCase())) {
          external.push(dep);
        } else {
          planned.push(dep);
        }
      }
      entity.dependencies = internal;
      entity.externalDeps = external;
      entity.plannedDeps = planned;
    }
  }
}

function detectLifecycle(entityId, entity) {
  if (entity._lifecycleOverride) {
    const val = entity._lifecycleOverride;
    delete entity._lifecycleOverride;
    return val;
  }
  for (const pat of DEPRECATED_PATTERNS) {
    if (pat.test(entityId)) return 'deprecated';
  }
  const hasDeps = entity.dependencies.length > 0 ||
    (entity.externalDeps && entity.externalDeps.length > 0) ||
    (entity.plannedDeps && entity.plannedDeps.length > 0);
  const hasUsedBy = entity.usedBy.length > 0;
  if (!hasDeps && !hasUsedBy) return 'orphan';
  if (hasUsedBy) return 'production';
  return 'experimental';
}

function assignLifecycles(allEntities) {
  for (const [, entities] of Object.entries(allEntities)) {
    for (const [entityId, entity] of Object.entries(entities)) {
      entity.lifecycle = detectLifecycle(entityId, entity);
    }
  }
}

function populate(options = {}) {
  const verbose = options.verbose || process.argv.includes('--verbose') || process.env.AIOS_DEBUG === 'true';

  console.log('[IDS] Starting entity registry population...');

  const allEntities = {};
  let totalCount = 0;

  for (const config of SCAN_CONFIG) {
    console.log(`[IDS] Scanning ${config.category} in ${config.basePath}...`);
    const entities = scanCategory(config, verbose);
    const count = Object.keys(entities).length;
    allEntities[config.category] = entities;
    totalCount += count;
    console.log(`[IDS]   Found ${count} ${config.category}`);
  }

  // Preserve invocationExamples from existing registry (TOK-4B)
  // invocationExamples are manually curated and must survive re-population.
  // Limits: max 3 examples per entity, max 200 tokens per example (ADR-5).
  try {
    const existingYaml = fs.readFileSync(REGISTRY_PATH, 'utf8');
    const existingRegistry = yaml.load(existingYaml);
    if (existingRegistry && existingRegistry.entities) {
      for (const [category, entities] of Object.entries(existingRegistry.entities)) {
        if (!allEntities[category]) continue;
        for (const [entityId, entity] of Object.entries(entities)) {
          if (entity.invocationExamples && Array.isArray(entity.invocationExamples) && allEntities[category][entityId]) {
            // Enforce limits: max 3 examples, each max 200 chars
            const examples = entity.invocationExamples.slice(0, 3).map((e) => String(e).slice(0, 200));
            allEntities[category][entityId].invocationExamples = examples;
          }
        }
      }
      console.log('[IDS] Preserved invocationExamples from existing registry');
    }
  } catch {
    // No existing registry or parse error — skip preservation
  }

  console.log('[IDS] Resolving usedBy relationships...');
  resolveUsedBy(allEntities);

  // Classify dependencies into internal, external, planned (NOG-16B)
  const nameIndex = buildNameIndex(allEntities);
  console.log('[IDS] Classifying dependencies (internal/external/planned)...');
  classifyDependencies(allEntities, nameIndex);

  // Assign lifecycle states (NOG-16B)
  console.log('[IDS] Detecting entity lifecycle states...');
  assignLifecycles(allEntities);

  // Resolution rate metric (uses internal deps only after classification)
  const { total, resolved, unresolved } = countResolution(allEntities, nameIndex);
  const rate = total > 0 ? Math.round(resolved / total * 100) : 0;
  console.log(`[IDS] Resolution rate: ${rate}% (${resolved}/${total} deps resolved, ${unresolved} unresolved)`);

  const categories = SCAN_CONFIG.map((c) => ({
    id: c.category,
    description: getCategoryDescription(c.category),
    basePath: c.basePath
  }));

  const registry = {
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      entityCount: totalCount,
      checksumAlgorithm: 'sha256',
      resolutionRate: rate
    },
    entities: allEntities,
    categories
  };

  const yamlContent = yaml.dump(registry, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false
  });

  try {
    fs.writeFileSync(REGISTRY_PATH, yamlContent, 'utf8');
  } catch (err) {
    throw new Error(`[IDS] Failed to write registry to ${REGISTRY_PATH}: ${err.message}`);
  }
  console.log(`[IDS] Registry written to ${path.relative(REPO_ROOT, REGISTRY_PATH)}`);
  console.log(`[IDS] Total entities: ${totalCount}`);

  return registry;
}

function getCategoryDescription(category) {
  const descriptions = {
    tasks: 'Executable task workflows for agent operations',
    templates: 'Document and code generation templates',
    scripts: 'Utility and automation scripts',
    modules: 'Core framework modules and libraries',
    agents: 'Agent persona definitions and configurations',
    checklists: 'Validation and review checklists',
    data: 'Configuration and reference data files',
    workflows: 'Multi-phase orchestration workflows',
    utils: 'Shared utility libraries and helpers',
    tools: 'Development tool definitions and configurations',
    'infra-scripts': 'Infrastructure automation and utility scripts',
    'infra-tools': 'Infrastructure tool definitions and configurations',
    'product-checklists': 'Product validation and review checklists',
    'product-data': 'Product reference data and configuration files'
  };
  return descriptions[category] || category;
}

if (require.main === module) {
  try {
    const registry = populate();
    console.log('[IDS] Population complete.');
    process.exit(0);
  } catch (err) {
    console.error('[IDS] Population failed:', err.message);
    process.exit(1);
  }
}

module.exports = {
  populate,
  scanCategory,
  extractEntityId,
  extractKeywords,
  extractPurpose,
  detectDependencies,
  extractYamlDependencies,
  extractMarkdownCrossReferences,
  computeChecksum,
  resolveUsedBy,
  buildNameIndex,
  countResolution,
  classifyDependencies,
  detectLifecycle,
  assignLifecycles,
  isSentinel,
  isNoise,
  SCAN_CONFIG,
  ADAPTABILITY_DEFAULTS,
  SENTINEL_VALUES,
  YAML_DEP_FIELDS,
  KNOWN_AGENTS,
  EXTERNAL_TOOLS,
  DEPRECATED_PATTERNS,
  REPO_ROOT,
  REGISTRY_PATH
};
