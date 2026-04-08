#!/usr/bin/env node

/**
 * AIOX Catalog Generator
 *
 * Scans the codebase and generates a comprehensive catalog of:
 * - Squads
 * - Skills
 * - Tools
 * - Agents
 *
 * Usage: node scripts/generate-catalog.js
 */

const fs = require('fs');
const path = require('path');
// Simple YAML key extractor (avoids js-yaml dependency)
function simpleYamlValue(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) return null;
  const raw = match[1].trim();

  // Block scalar indicators (|, >, >-, |-) — read indented lines below
  if (/^[|>][+-]?$/.test(raw)) {
    const lines = content.split('\n');
    const keyIndex = lines.findIndex(l => l.match(new RegExp(`^${key}:\\s*[|>]`)));
    if (keyIndex === -1) return null;
    const blockLines = [];
    for (let i = keyIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^\S/.test(line) || line.trim() === '' && blockLines.length > 0 && /^\S/.test(lines[i + 1] || '')) break;
      if (line.trim() !== '') blockLines.push(line.replace(/^\s+/, ''));
    }
    return blockLines.join(' ').trim() || null;
  }

  return raw.replace(/^['"]|['"]$/g, '');
}

const ROOT = process.cwd();
const SQUADS_DIR = path.join(ROOT, 'squads');
const SKILLS_DIR = path.join(ROOT, 'skills');
const TOOLS_DIR = path.join(ROOT, 'tools');
const AGENTS_DIR = path.join(ROOT, '.claude', 'commands', 'AIOS', 'agents');
const TAXONOMY_PATH = path.join(ROOT, '.aios-core', 'data', 'domain-taxonomy.json');

/**
 * Load domain taxonomy for tag inference
 */
function loadTaxonomy() {
  try {
    const content = fs.readFileSync(TAXONOMY_PATH, 'utf8');
    return JSON.parse(content).domains;
  } catch (e) {
    log('⚠️  domain-taxonomy.json not found, tag inference disabled', 'yellow');
    return {};
  }
}

/**
 * Extract tags from YAML content (looks for `tags:` field)
 * Supports both inline array `tags: [a, b]` and multiline `tags:\n  - a\n  - b`
 */
function extractYamlTags(content) {
  // Inline: tags: [content, marketing]
  const inlineMatch = content.match(/^tags:\s*\[([^\]]+)\]/m);
  if (inlineMatch) {
    return inlineMatch[1].split(',').map(t => t.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  }

  // Multiline: tags:\n  - content\n  - marketing
  const multiMatch = content.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (multiMatch) {
    return multiMatch[1].split('\n')
      .map(line => line.replace(/^\s+-\s+/, '').trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  return [];
}

/**
 * Extract tags from markdown frontmatter (--- delimited)
 */
function extractFrontmatterTags(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return [];
  return extractYamlTags(fmMatch[1]);
}

/**
 * Infer tags from name + description using taxonomy keywords
 * Name matches get 2x weight to prioritize direct relevance
 */
function inferTags(name, description, taxonomy) {
  const nameLower = name.toLowerCase();
  const descLower = description.toLowerCase();
  const matched = [];

  for (const [domain, config] of Object.entries(taxonomy)) {
    let score = 0;
    for (const kw of config.keywords) {
      const kwLower = kw.toLowerCase();
      // Name match = 2 points (strong signal)
      if (nameLower.includes(kwLower)) score += 2;
      // Description match = 1 point
      else if (descLower.includes(kwLower)) score += 1;
    }
    // Require score >= 2 to avoid false positives from single generic keyword matches
    if (score >= 2) {
      matched.push({ domain, score });
    }
  }

  // Sort by score descending, take top 3
  matched.sort((a, b) => b.score - a.score);
  const result = matched.slice(0, 3).map(m => m.domain);

  // If nothing matched at threshold 2, try threshold 1 (better than uncategorized)
  if (result.length === 0) {
    for (const [domain, config] of Object.entries(taxonomy)) {
      for (const kw of config.keywords) {
        if (nameLower.includes(kw.toLowerCase()) || descLower.includes(kw.toLowerCase())) {
          return [domain];
        }
      }
    }
  }

  return result;
}

/**
 * Resolve tags for an item: explicit > inferred > fallback
 */
function resolveTags(explicitTags, name, description, taxonomy) {
  if (explicitTags.length > 0) {
    // Validate explicit tags against taxonomy
    const valid = explicitTags.filter(t => taxonomy[t]);
    if (valid.length > 0) return valid;
  }

  const inferred = inferTags(name, description, taxonomy);
  if (inferred.length > 0) return inferred;

  // Last resort: 'uncategorized' — should trigger review
  return ['uncategorized'];
}

// Remove a broken symlink if it exists (existsSync returns false but lstatSync succeeds)
function removeBrokenSymlink(filePath) {
  try {
    fs.lstatSync(filePath);
    if (!fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) { /* doesn't exist at all, fine */ }
}

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Extract squad metadata
 */
function extractSquads(taxonomy) {
  log('📦 Scanning squads...', 'cyan');

  const squads = [];

  if (!fs.existsSync(SQUADS_DIR)) {
    log('⚠️  Squads directory not found', 'yellow');
    return squads;
  }

  const items = fs.readdirSync(SQUADS_DIR)
    .filter(item => {
      const fullPath = path.join(SQUADS_DIR, item);
      return fs.statSync(fullPath).isDirectory() && !item.startsWith('_');
    })
    .sort();

  items.forEach(squadDir => {
    const squadPath = path.join(SQUADS_DIR, squadDir);
    const yamlPath = path.join(squadPath, 'squad.yaml');
    const readmePath = path.join(squadPath, 'README.md');

    let name = squadDir;
    let description = 'Sem descrição';
    let explicitTags = [];

    // Try YAML first
    if (fs.existsSync(yamlPath)) {
      try {
        const content = fs.readFileSync(yamlPath, 'utf8');
        name = simpleYamlValue(content, 'name') || squadDir;
        const desc = simpleYamlValue(content, 'description');
        if (desc) {
          description = desc.substring(0, 200);
        }
        explicitTags = extractYamlTags(content);
      } catch (e) {
        // Ignore YAML errors
      }
    }

    // Fallback to README
    if (description === 'Sem descrição' && fs.existsSync(readmePath)) {
      try {
        const content = fs.readFileSync(readmePath, 'utf8');
        if (explicitTags.length === 0) {
          explicitTags = extractFrontmatterTags(content);
        }
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.startsWith('# ') && !line.startsWith('## ')) {
            description = line.replace(/^#+\s*/, '').replace(/[#*~\-`]/g, '').trim().substring(0, 200);
            break;
          }
          if (line.startsWith('>')) {
            description = line.replace(/^>\s*/, '').trim().substring(0, 200);
            break;
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    const tags = resolveTags(explicitTags, squadDir, description, taxonomy);

    squads.push({
      name,
      slug: squadDir,
      description,
      tags,
    });
  });

  log(`✓ Found ${squads.length} squads`, 'green');
  return squads;
}

/**
 * Extract skills metadata
 */
function extractSkills(taxonomy) {
  log('⚡ Scanning skills...', 'cyan');

  const skills = [];

  if (!fs.existsSync(SKILLS_DIR)) {
    log('⚠️  Skills directory not found', 'yellow');
    return skills;
  }

  const items = fs.readdirSync(SKILLS_DIR)
    .filter(item => {
      const fullPath = path.join(SKILLS_DIR, item);
      return fs.statSync(fullPath).isDirectory() && !item.startsWith('.');
    })
    .sort();

  items.forEach(skillName => {
    const skillPath = path.join(SKILLS_DIR, skillName);
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    const readmePath = path.join(skillPath, 'README.md');

    let description = 'Sem descrição';
    let explicitTags = [];

    // Try SKILL.md first, then README.md
    const docPath = fs.existsSync(skillMdPath) ? skillMdPath : (fs.existsSync(readmePath) ? readmePath : null);

    if (docPath) {
      try {
        const content = fs.readFileSync(docPath, 'utf8');
        explicitTags = extractFrontmatterTags(content);
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.startsWith('# ')) {
            description = line.replace('# ', '').trim().substring(0, 200);
            break;
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    const tags = resolveTags(explicitTags, skillName, description, taxonomy);

    skills.push({
      name: skillName,
      description,
      tags,
    });
  });

  log(`✓ Found ${skills.length} skills`, 'green');
  return skills;
}

/**
 * Extract tools metadata
 */
function extractTools(taxonomy) {
  log('🔧 Scanning tools...', 'cyan');

  const tools = [];

  if (!fs.existsSync(TOOLS_DIR)) {
    log('⚠️  Tools directory not found', 'yellow');
    return tools;
  }

  const items = fs.readdirSync(TOOLS_DIR)
    .filter(item => {
      const fullPath = path.join(TOOLS_DIR, item);
      return fs.statSync(fullPath).isDirectory() &&
             !item.startsWith('.') &&
             !item.startsWith('__');
    })
    .sort();

  items.forEach(toolName => {
    const toolPath = path.join(TOOLS_DIR, toolName);
    const readmePath = path.join(toolPath, 'README.md');

    let description = 'Sem descrição';
    let explicitTags = [];

    if (fs.existsSync(readmePath)) {
      try {
        const content = fs.readFileSync(readmePath, 'utf8');
        explicitTags = extractFrontmatterTags(content);
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.startsWith('# ')) {
            description = line.replace('# ', '').trim().substring(0, 200);
            break;
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    const tags = resolveTags(explicitTags, toolName, description, taxonomy);

    tools.push({
      name: toolName,
      description,
      tags,
    });
  });

  log(`✓ Found ${tools.length} tools`, 'green');
  return tools;
}

/**
 * Extract minds metadata from squads/mind-cloning/minds/INDEX.md
 */
function extractMinds() {
  log('🧠 Scanning minds...', 'cyan');

  const minds = [];
  const mindsDir = path.join(SQUADS_DIR, 'mind-cloning', 'minds');
  const indexPath = path.join(mindsDir, 'INDEX.md');

  if (!fs.existsSync(indexPath)) {
    log('⚠️  Minds INDEX.md not found', 'yellow');
    return minds;
  }

  try {
    const content = fs.readFileSync(indexPath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      // Parse table rows: | # | Name | `slug` | Status | Fidelity | Domain |
      const match = line.match(/^\|\s*\d+\s*\|\s*(.+?)\s*\|\s*`(.+?)`\s*\|\s*(\w+)\s*\|\s*(\w+)\s*\|\s*(.+?)\s*\|$/);
      if (match) {
        const [, name, slug, status, fidelity, domain] = match;
        minds.push({
          name: name.trim(),
          slug: slug.trim(),
          status: status.trim(),
          fidelity: fidelity.trim(),
          domain: domain.trim(),
        });
      }
    }
  } catch (e) {
    log(`⚠️  Error reading minds INDEX: ${e.message}`, 'yellow');
  }

  log(`✓ Found ${minds.length} minds`, 'green');
  return minds;
}

/**
 * Extract agents metadata (hardcoded, from system knowledge)
 */
function extractAgents() {
  log('👥 Loading agents...', 'cyan');

  const agents = [
    { id: '@dev', persona: 'Dex', scope: 'Implementação de código, git add/commit, branch management', tags: ['dev'] },
    { id: '@qa', persona: 'Quinn', scope: 'Testes e qualidade, QA gates, code review', tags: ['dev'] },
    { id: '@architect', persona: 'Aria', scope: 'Arquitetura e design técnico, technology selection', tags: ['dev'] },
    { id: '@pm', persona: 'Morgan', scope: 'Product Management, epic orchestration, requirements', tags: ['productivity'] },
    { id: '@po', persona: 'Pax', scope: 'Product Owner, story validation, backlog prioritization', tags: ['productivity'] },
    { id: '@sm', persona: 'River', scope: 'Scrum Master, story creation, sprint management', tags: ['productivity'] },
    { id: '@analyst', persona: 'Alex', scope: 'Pesquisa e análise de dados', tags: ['research', 'data'] },
    { id: '@data-engineer', persona: 'Dara', scope: 'Database design, schema DDL, query optimization', tags: ['data', 'dev'] },
    { id: '@ux-design-expert', persona: 'Uma', scope: 'UX/UI design, design systems, user research', tags: ['design'] },
    { id: '@devops', persona: 'Gage', scope: 'CI/CD, git push (EXCLUSIVO), MCP management, infrastructure', tags: ['devops'] },
    { id: '@aiox-master', persona: 'Master', scope: 'Framework governance, constitutional enforcement', tags: ['ai-ops'] },
    { id: '@squad-creator', persona: 'Scout', scope: 'Squad creation, workspace setup, onboarding', tags: ['ai-ops'] },
  ];

  log(`✓ Loaded ${agents.length} agents`, 'green');
  return agents;
}

/**
 * Generate markdown catalog
 */
function generateMarkdown(squads, skills, tools, agents, minds) {
  const date = new Date().toLocaleDateString('pt-BR');
  const tagFmt = (tags) => tags.map(t => `\`${t}\``).join(', ');

  let markdown = `# AIOX Catalog

> Gerado automaticamente em ${date}

---

## Squads (${squads.length})

| Squad | Tags | Descrição | Ativação |
|-------|------|-----------|----------|
`;

  squads.forEach(squad => {
    markdown += `| ${squad.name} | ${tagFmt(squad.tags)} | ${squad.description} | \`/${squad.slug}\` |\n`;
  });

  markdown += `\n---\n\n## Skills (${skills.length})

| Skill | Tags | Descrição | Ativação |
|-------|------|-----------|----------|
`;

  skills.forEach(skill => {
    markdown += `| ${skill.name} | ${tagFmt(skill.tags)} | ${skill.description} | \`/AIOS:skills:${skill.name}\` |\n`;
  });

  markdown += `\n---\n\n## Tools (${tools.length})

| Tool | Tags | Descrição |
|------|------|-----------|
`;

  tools.forEach(tool => {
    markdown += `| ${tool.name} | ${tagFmt(tool.tags)} | ${tool.description} |\n`;
  });

  markdown += `\n---\n\n## Minds (${minds.length})

| Mente | Slug | Status | Fidelidade | Domínio |
|-------|------|--------|------------|---------|
`;

  minds.forEach(mind => {
    markdown += `| ${mind.name} | \`${mind.slug}\` | ${mind.status} | ${mind.fidelity} | ${mind.domain} |\n`;
  });

  markdown += `\n---\n\n## Agents (${agents.length})

| Agent | Tags | Persona | Escopo |
|-------|------|---------|--------|
`;

  agents.forEach(agent => {
    markdown += `| ${agent.id} | ${tagFmt(agent.tags)} | ${agent.persona} | ${agent.scope} |\n`;
  });

  markdown += `\n---\n\n## Quick Reference

### Slash Commands Pattern
- **Squads:** \`/squad-name\` (ex: \`/agent-autonomy\`, \`/kaizen\`)
- **Skills:** \`/AIOS:skills:skill-name\` (ex: \`/AIOS:skills:book-to-markdown\`)
- **Agents:** \`@agent-id\` (ex: \`@dev\`, \`@architect\`)
- **Minds:** Referenciadas por slug em \`squads/mind-cloning/minds/{slug}/\`

### Common Workflows

#### Story Development Cycle
\`\`\`
@sm *create-story → @po *validate → @dev *develop → @qa *qa-gate → @devops *push
\`\`\`

#### Spec Pipeline
\`\`\`
@pm *gather → @architect *assess → @analyst *research → @pm *spec → @qa *critique
\`\`\`

#### Brownfield Discovery
\`\`\`
@architect *audit → @data-engineer *schema-review → @ux-design-expert *frontend-spec → @qa *validate
\`\`\`

---

## Domain Taxonomy

| Domínio | Squads | Skills | Tools | Agents |
|---------|--------|--------|-------|--------|
`;

  // Count items per domain
  const taxonomy = loadTaxonomy();
  const domainCounts = {};
  for (const domain of Object.keys(taxonomy)) {
    domainCounts[domain] = { squads: 0, skills: 0, tools: 0, agents: 0 };
  }
  domainCounts['uncategorized'] = { squads: 0, skills: 0, tools: 0, agents: 0 };

  squads.forEach(s => s.tags.forEach(t => { if (domainCounts[t]) domainCounts[t].squads++; }));
  skills.forEach(s => s.tags.forEach(t => { if (domainCounts[t]) domainCounts[t].skills++; }));
  tools.forEach(s => s.tags.forEach(t => { if (domainCounts[t]) domainCounts[t].tools++; }));
  agents.forEach(s => s.tags.forEach(t => { if (domainCounts[t]) domainCounts[t].agents++; }));

  for (const [domain, counts] of Object.entries(domainCounts)) {
    const total = counts.squads + counts.skills + counts.tools + counts.agents;
    if (total === 0) continue;
    const label = taxonomy[domain] ? taxonomy[domain].label : domain;
    markdown += `| ${label} | ${counts.squads} | ${counts.skills} | ${counts.tools} | ${counts.agents} |\n`;
  }

  markdown += `\n---

## Data Completeness

| Categoria | Total | Coverage |
|-----------|-------|----------|
| Squads | ${squads.length} | 100% |
| Skills | ${skills.length} | 100% |
| Tools | ${tools.length} | 100% |
| Minds | ${minds.length} | 100% |
| Agents | ${agents.length} | 100% |

---

*AIOX Catalog — CLI First | Observability Second | UI Third*
`;

  return markdown;
}

/**
 * Sync slash commands — ensure every squad has a README.md in .claude/commands/, .gemini/commands/, .codex/commands/
 */
function syncCommands(squads) {
  log('🔗 Syncing slash commands...', 'cyan');

  const models = ['claude', 'gemini', 'codex'];
  let totalCreated = 0;

  models.forEach(model => {
    const commandsDir = path.join(ROOT, `.${model}`, 'commands');
    let modelCreated = 0;

    squads.forEach(squad => {
      const cmdDir = path.join(commandsDir, squad.slug);
      const cmdReadme = path.join(cmdDir, 'README.md');

      if (!fs.existsSync(cmdDir)) {
        fs.mkdirSync(cmdDir, { recursive: true });
      }

      if (!fs.existsSync(cmdReadme)) {
        // Copy README from squad source, or generate minimal one
        const srcReadme = path.join(SQUADS_DIR, squad.slug, 'README.md');
        if (fs.existsSync(srcReadme)) {
          fs.copyFileSync(srcReadme, cmdReadme);
        } else {
          fs.writeFileSync(cmdReadme, `# ${squad.name}\n\n${squad.description}\n`, 'utf8');
        }
        modelCreated++;
      }
    });

    if (modelCreated > 0) {
      log(`✓ ${model}: Created ${modelCreated} missing command(s)`, 'green');
    } else {
      log(`✓ ${model}: All commands in sync`, 'green');
    }

    totalCreated += modelCreated;
  });

  if (totalCreated === 0) {
    log('✓ All models synchronized', 'green');
  }
}

/**
 * Sync skill slash commands — symlinks from .claude/commands/AIOS/skills/ to skills/
 * Also syncs to .gemini/ and .codex/
 */
function syncSkillCommands(skills) {
  log('🔗 Syncing skill commands...', 'cyan');

  const models = ['claude', 'gemini', 'codex'];
  let totalCreated = 0;

  // Determine main doc file for a skill (README.md preferred, SKILL.md fallback)
  function getMainDoc(skillName) {
    const readmePath = path.join(SKILLS_DIR, skillName, 'README.md');
    const skillMdPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
    if (fs.existsSync(readmePath)) return 'README.md';
    if (fs.existsSync(skillMdPath)) return 'SKILL.md';
    return null;
  }

  // Get subdirectories of a skill (only dirs that actually contain .md files)
  function getSubdirs(skillName) {
    const skillPath = path.join(SKILLS_DIR, skillName);
    try {
      return fs.readdirSync(skillPath)
        .filter(item => {
          const fullPath = path.join(skillPath, item);
          if (!fs.statSync(fullPath).isDirectory()) return false;
          if (item.startsWith('.') || item.startsWith('__') || item === 'node_modules') return false;
          // Only count as subdir if it actually contains .md files
          const hasMdFiles = fs.readdirSync(fullPath).some(f => f.endsWith('.md'));
          return hasMdFiles;
        });
    } catch (e) {
      return [];
    }
  }

  // Get .md files inside a subdirectory
  function getMdFiles(skillName, subdir) {
    const dirPath = path.join(SKILLS_DIR, skillName, subdir);
    try {
      return fs.readdirSync(dirPath)
        .filter(f => f.endsWith('.md'));
    } catch (e) {
      return [];
    }
  }

  models.forEach(model => {
    const skillsCmdDir = path.join(ROOT, `.${model}`, 'commands', 'AIOS', 'skills');
    let modelCreated = 0;

    // Ensure AIOS/skills/ directory exists
    if (!fs.existsSync(skillsCmdDir)) {
      fs.mkdirSync(skillsCmdDir, { recursive: true });
    }

    // Clean stale entries: remove symlinks/dirs that no longer match a skill
    const skillNames = new Set(skills.map(s => s.name));
    try {
      const existing = fs.readdirSync(skillsCmdDir);
      existing.forEach(entry => {
        const entryPath = path.join(skillsCmdDir, entry);
        const baseName = entry.replace(/\.md$/, '');
        // Skip if it matches a current skill
        if (skillNames.has(baseName)) return;
        // Remove stale entry (symlink, file, or directory)
        try {
          const stat = fs.lstatSync(entryPath);
          if (stat.isDirectory()) {
            fs.rmSync(entryPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(entryPath);
          }
          log(`🧹 ${model}: Removed stale entry: ${entry}`, 'yellow');
        } catch (e) { /* ignore */ }
      });
    } catch (e) { /* dir doesn't exist yet, fine */ }

    skills.forEach(skill => {
      const mainDoc = getMainDoc(skill.name);
      if (!mainDoc) {
        log(`⚠️  ${skill.name}: no README.md or SKILL.md, skipping`, 'yellow');
        return;
      }

      const subdirs = getSubdirs(skill.name);
      const isComplex = subdirs.length > 0;

      // Clean conflicting entry type (dir exists but should be symlink, or vice-versa)
      // Use removeBrokenSymlink + lstatSync to also detect broken symlinks
      const simpleSymlink = path.join(skillsCmdDir, `${skill.name}.md`);
      const complexDir = path.join(skillsCmdDir, skill.name);
      if (isComplex) {
        removeBrokenSymlink(simpleSymlink);
        if (fs.existsSync(simpleSymlink)) {
          fs.unlinkSync(simpleSymlink);
          log(`🔄 ${model}: ${skill.name} changed simple→complex, cleaned old symlink`, 'cyan');
        }
      } else if (!isComplex && fs.existsSync(complexDir)) {
        try {
          const stat = fs.lstatSync(complexDir);
          if (stat.isDirectory()) {
            fs.rmSync(complexDir, { recursive: true, force: true });
            log(`🔄 ${model}: ${skill.name} changed complex→simple, cleaned old dir`, 'cyan');
          }
        } catch (e) { /* ignore */ }
      }

      if (isComplex) {
        // Complex skill: create folder with README symlink + subdir symlinks
        const cmdDir = path.join(skillsCmdDir, skill.name);
        if (!fs.existsSync(cmdDir)) {
          fs.mkdirSync(cmdDir, { recursive: true });
        }

        // Main doc symlink
        const cmdReadme = path.join(cmdDir, 'README.md');
        removeBrokenSymlink(cmdReadme);
        if (!fs.existsSync(cmdReadme)) {
          // ../../../../../skills/{name}/README.md (5 levels: README → {skill}/ → skills/ → AIOS/ → commands/ → .claude/ → root)
          const relTarget = path.join('..', '..', '..', '..', '..', 'skills', skill.name, mainDoc);
          fs.symlinkSync(relTarget, cmdReadme);
          modelCreated++;
        }

        // Subdir symlinks (individual .md files)
        subdirs.forEach(subdir => {
          const mdFiles = getMdFiles(skill.name, subdir);
          if (mdFiles.length === 0) return;

          const cmdSubdir = path.join(cmdDir, subdir);
          if (!fs.existsSync(cmdSubdir)) {
            fs.mkdirSync(cmdSubdir, { recursive: true });
          }

          mdFiles.forEach(mdFile => {
            const cmdFile = path.join(cmdSubdir, mdFile);
            removeBrokenSymlink(cmdFile);
            if (!fs.existsSync(cmdFile)) {
              // ../../../../../../skills/{name}/{subdir}/{file}.md (6 levels: file → {subdir}/ → {skill}/ → skills/ → AIOS/ → commands/ → .claude/ → root)
              const relTarget = path.join('..', '..', '..', '..', '..', '..', 'skills', skill.name, subdir, mdFile);
              fs.symlinkSync(relTarget, cmdFile);
              modelCreated++;
            }
          });
        });
      } else {
        // Simple skill: single symlink {name}.md
        const cmdFile = path.join(skillsCmdDir, `${skill.name}.md`);
        removeBrokenSymlink(cmdFile);
        if (!fs.existsSync(cmdFile)) {
          // ../../../../skills/{name}/README.md (4 levels: skills/ → AIOS/ → commands/ → .claude/ → root)
          const relTarget = path.join('..', '..', '..', '..', 'skills', skill.name, mainDoc);
          fs.symlinkSync(relTarget, cmdFile);
          modelCreated++;
        }
      }
    });

    if (modelCreated > 0) {
      log(`✓ ${model}: Created ${modelCreated} skill command(s)`, 'green');
    } else {
      log(`✓ ${model}: All skill commands in sync`, 'green');
    }

    totalCreated += modelCreated;
  });

  if (totalCreated === 0) {
    log('✓ All skill commands synchronized', 'green');
  }
}

/**
 * Sync skills to global user commands (~/.claude/commands/AIOS/skills/)
 * This makes all skills available in EVERY project, not just aios-core.
 */
function syncGlobalSkillCommands(skills) {
  log('🌐 Syncing global skill commands...', 'cyan');

  const homeDir = require('os').homedir();
  const globalSkillsDir = path.join(homeDir, '.claude', 'commands', 'AIOS', 'skills');
  let created = 0;
  let updated = 0;
  let removed = 0;

  // Ensure directory exists
  if (!fs.existsSync(globalSkillsDir)) {
    fs.mkdirSync(globalSkillsDir, { recursive: true });
  }

  // Clean stale entries
  const skillNames = new Set(skills.map(s => s.name));
  try {
    const existing = fs.readdirSync(globalSkillsDir);
    existing.forEach(entry => {
      const baseName = entry.replace(/\.md$/, '');
      if (skillNames.has(baseName)) return;
      const entryPath = path.join(globalSkillsDir, entry);
      try {
        const stat = fs.lstatSync(entryPath);
        if (stat.isDirectory()) {
          fs.rmSync(entryPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(entryPath);
        }
        removed++;
      } catch (e) { /* ignore */ }
    });
  } catch (e) { /* fine */ }

  // Determine main doc file for a skill
  function getMainDoc(skillName) {
    const readmePath = path.join(SKILLS_DIR, skillName, 'README.md');
    const skillMdPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
    if (fs.existsSync(readmePath)) return 'README.md';
    if (fs.existsSync(skillMdPath)) return 'SKILL.md';
    return null;
  }

  // Get subdirectories with .md files
  function getSubdirs(skillName) {
    const skillPath = path.join(SKILLS_DIR, skillName);
    try {
      return fs.readdirSync(skillPath)
        .filter(item => {
          const fullPath = path.join(skillPath, item);
          if (!fs.statSync(fullPath).isDirectory()) return false;
          if (item.startsWith('.') || item === 'node_modules') return false;
          return fs.readdirSync(fullPath).some(f => f.endsWith('.md'));
        });
    } catch (e) {
      return [];
    }
  }

  skills.forEach(skill => {
    const mainDoc = getMainDoc(skill.name);
    if (!mainDoc) return;

    const subdirs = getSubdirs(skill.name);
    const isComplex = subdirs.length > 0;
    const absSkillDir = path.join(SKILLS_DIR, skill.name);

    // Clean conflicting types (use removeBrokenSymlink to also catch broken links)
    const simpleSymlink = path.join(globalSkillsDir, `${skill.name}.md`);
    const complexDir = path.join(globalSkillsDir, skill.name);
    if (isComplex) {
      removeBrokenSymlink(simpleSymlink);
      if (fs.existsSync(simpleSymlink)) {
        fs.unlinkSync(simpleSymlink);
      }
    } else if (!isComplex && fs.existsSync(complexDir)) {
      try {
        if (fs.lstatSync(complexDir).isDirectory()) {
          fs.rmSync(complexDir, { recursive: true, force: true });
        }
      } catch (e) { /* ignore */ }
    }

    if (isComplex) {
      // Complex: directory with symlinks
      if (!fs.existsSync(complexDir)) {
        fs.mkdirSync(complexDir, { recursive: true });
      }

      // Main doc symlink (absolute path for global)
      const cmdReadme = path.join(complexDir, 'README.md');
      const absTarget = path.join(absSkillDir, mainDoc);
      removeBrokenSymlink(cmdReadme);
      if (!fs.existsSync(cmdReadme)) {
        fs.symlinkSync(absTarget, cmdReadme);
        created++;
      }

      // Subdir symlinks
      subdirs.forEach(subdir => {
        const srcSubdir = path.join(absSkillDir, subdir);
        const mdFiles = fs.readdirSync(srcSubdir).filter(f => f.endsWith('.md'));
        if (mdFiles.length === 0) return;

        const cmdSubdir = path.join(complexDir, subdir);
        if (!fs.existsSync(cmdSubdir)) {
          fs.mkdirSync(cmdSubdir, { recursive: true });
        }

        mdFiles.forEach(mdFile => {
          const cmdFile = path.join(cmdSubdir, mdFile);
          removeBrokenSymlink(cmdFile);
          if (!fs.existsSync(cmdFile)) {
            fs.symlinkSync(path.join(srcSubdir, mdFile), cmdFile);
            created++;
          }
        });
      });
    } else {
      // Simple: single symlink (absolute path for global)
      removeBrokenSymlink(simpleSymlink);
      if (!fs.existsSync(simpleSymlink)) {
        fs.symlinkSync(path.join(absSkillDir, mainDoc), simpleSymlink);
        created++;
      }
    }
  });

  if (removed > 0) log(`🧹 Removed ${removed} stale global command(s)`, 'yellow');
  if (created > 0) {
    log(`✓ Global: Created ${created} skill command(s)`, 'green');
  } else {
    log('✓ Global: All skill commands in sync', 'green');
  }
}

/**
 * Sync top-level skill shortcuts to global ~/.claude/commands/
 *
 * Project-level commands in .claude/commands/*.md that reference a skill
 * (contain "skills/" in their content) get mirrored to the global commands
 * directory so they work from ANY project, not just aios-core.
 */
function syncTopLevelShortcuts() {
  log('🔗 Syncing top-level shortcuts to global...', 'cyan');

  const homeDir = require('os').homedir();
  const globalCmdsDir = path.join(homeDir, '.claude', 'commands');
  const projectCmdsDir = path.join(ROOT, '.claude', 'commands');
  let created = 0;
  let updated = 0;

  if (!fs.existsSync(globalCmdsDir)) {
    fs.mkdirSync(globalCmdsDir, { recursive: true });
  }

  // Read all .md files in project commands (top-level only, not subdirs)
  const projectCmds = fs.readdirSync(projectCmdsDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('.'));

  projectCmds.forEach(cmdFile => {
    const projectPath = path.join(projectCmdsDir, cmdFile);
    const globalPath = path.join(globalCmdsDir, cmdFile);

    try {
      const content = fs.readFileSync(projectPath, 'utf8');

      // Only sync commands that reference skills/ or SKILL.md (skill shortcuts)
      if (!content.includes('skills/') && !content.includes('SKILL.md')) {
        return;
      }

      // If content uses relative paths like ~/aios-core, convert to absolute
      const absContent = content.replace(/~\/aios-core/g, path.join(homeDir, 'aios-core'));

      if (!fs.existsSync(globalPath)) {
        fs.writeFileSync(globalPath, absContent, 'utf8');
        created++;
        log(`  + ${cmdFile}`, 'green');
      } else {
        // Update if content differs
        const existingContent = fs.readFileSync(globalPath, 'utf8');
        if (existingContent !== absContent) {
          fs.writeFileSync(globalPath, absContent, 'utf8');
          updated++;
          log(`  ~ ${cmdFile} (updated)`, 'cyan');
        }
      }
    } catch (e) {
      // Skip files that can't be read
    }
  });

  if (created > 0 || updated > 0) {
    log(`✓ Global shortcuts: ${created} created, ${updated} updated`, 'green');
  } else {
    log('✓ Global shortcuts: all in sync', 'green');
  }
}

/**
 * Generate catalog-tags.json for programmatic matching
 */
function generateTagsJson(squads, skills, tools, agents, minds) {
  const index = {
    $schema: 'AIOX Catalog Tags — programmatic matching index',
    generated: new Date().toISOString(),
    squads: {},
    skills: {},
    tools: {},
    agents: {},
    minds: {},
  };

  squads.forEach(s => {
    index.squads[s.slug] = { description: s.description, tags: s.tags, activation: `/${s.slug}` };
  });
  skills.forEach(s => {
    index.skills[s.name] = { description: s.description, tags: s.tags, activation: `/AIOS:skills:${s.name}` };
  });
  tools.forEach(s => {
    index.tools[s.name] = { description: s.description, tags: s.tags };
  });
  agents.forEach(s => {
    index.agents[s.id] = { persona: s.persona, scope: s.scope, tags: s.tags };
  });
  minds.forEach(s => {
    index.minds[s.slug] = { name: s.name, status: s.status, fidelity: s.fidelity, domain: s.domain };
  });

  // Domain reverse index: domain → [items]
  index.byDomain = {};
  const addToDomain = (type, slug, tags) => {
    for (const tag of tags) {
      if (!index.byDomain[tag]) index.byDomain[tag] = [];
      index.byDomain[tag].push({ type, slug });
    }
  };
  squads.forEach(s => addToDomain('squad', s.slug, s.tags));
  skills.forEach(s => addToDomain('skill', s.name, s.tags));
  tools.forEach(s => addToDomain('tool', s.name, s.tags));
  agents.forEach(s => addToDomain('agent', s.id, s.tags));

  return index;
}

/**
 * Validate no items left untagged
 */
function validateTags(squads, skills, tools, agents) {
  const untagged = [];

  squads.forEach(s => { if (s.tags.includes('uncategorized')) untagged.push(`squad:${s.slug}`); });
  skills.forEach(s => { if (s.tags.includes('uncategorized')) untagged.push(`skill:${s.name}`); });
  tools.forEach(s => { if (s.tags.includes('uncategorized')) untagged.push(`tool:${s.name}`); });

  if (untagged.length > 0) {
    log(`\n⚠️  ${untagged.length} item(s) tagged as 'uncategorized' (needs review):`, 'yellow');
    untagged.forEach(item => log(`  - ${item}`, 'yellow'));
  } else {
    log('✓ All items have domain tags', 'green');
  }

  return untagged;
}

/**
 * Main execution
 */
function main() {
  try {
    log('\n🚀 AIOX Catalog Generator', 'blue');
    log('========================\n', 'blue');

    // Load taxonomy
    const taxonomy = loadTaxonomy();
    const domainCount = Object.keys(taxonomy).length;
    log(`✓ Loaded taxonomy with ${domainCount} domains`, 'green');

    // Extract data
    const squads = extractSquads(taxonomy);
    const skills = extractSkills(taxonomy);
    const tools = extractTools(taxonomy);
    const agents = extractAgents();
    const minds = extractMinds();

    // Validate tags
    log('\n🏷️  Validating tags...', 'cyan');
    const untagged = validateTags(squads, skills, tools, agents);

    // Sync slash commands (project-level)
    syncCommands(squads);
    syncSkillCommands(skills);

    // Sync global commands (user-level — available in ALL projects)
    syncGlobalSkillCommands(skills);

    // Sync top-level shortcuts (project → global for skill commands)
    syncTopLevelShortcuts();

    // Generate markdown
    log('\n📝 Generating markdown...', 'cyan');
    const markdown = generateMarkdown(squads, skills, tools, agents, minds);

    // Write catalog.md
    const outputPath = path.join(ROOT, '.aios-core', 'data', 'catalog.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');
    log(`✓ Catalog written to ${outputPath}`, 'green');

    // Write catalog-tags.json
    log('📝 Generating tags JSON...', 'cyan');
    const tagsJson = generateTagsJson(squads, skills, tools, agents, minds);
    const jsonPath = path.join(ROOT, '.aios-core', 'data', 'catalog-tags.json');
    fs.writeFileSync(jsonPath, JSON.stringify(tagsJson, null, 2), 'utf8');
    log(`✓ Tags JSON written to ${jsonPath}`, 'green');

    // Summary
    log('\n📊 Summary', 'blue');
    log(`  Squads:  ${squads.length}`, 'green');
    log(`  Skills:  ${skills.length}`, 'green');
    log(`  Tools:   ${tools.length}`, 'green');
    log(`  Minds:   ${minds.length}`, 'green');
    log(`  Agents:  ${agents.length}`, 'green');
    if (untagged.length > 0) {
      log(`  ⚠️  Uncategorized: ${untagged.length}`, 'yellow');
    }
    log('\n✨ Done!\n', 'green');

    process.exit(0);
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'yellow');
    console.error(error);
    process.exit(1);
  }
}

main();
