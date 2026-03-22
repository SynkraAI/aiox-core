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
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

const ROOT = process.cwd();
const SQUADS_DIR = path.join(ROOT, 'squads');
const SKILLS_DIR = path.join(ROOT, '.aios', 'skills');
const TOOLS_DIR = path.join(ROOT, 'tools');
const AGENTS_DIR = path.join(ROOT, '.claude', 'commands', 'AIOS', 'agents');

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
function extractSquads() {
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

    // Try YAML first
    if (fs.existsSync(yamlPath)) {
      try {
        const content = fs.readFileSync(yamlPath, 'utf8');
        name = simpleYamlValue(content, 'name') || squadDir;
        const desc = simpleYamlValue(content, 'description');
        if (desc) {
          description = desc.substring(0, 200);
        }
      } catch (e) {
        // Ignore YAML errors
      }
    }

    // Fallback to README
    if (description === 'Sem descrição' && fs.existsSync(readmePath)) {
      try {
        const content = fs.readFileSync(readmePath, 'utf8');
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

    squads.push({
      name,
      slug: squadDir,
      description,
    });
  });

  log(`✓ Found ${squads.length} squads`, 'green');
  return squads;
}

/**
 * Extract skills metadata
 */
function extractSkills() {
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

    if (fs.existsSync(skillMdPath)) {
      try {
        const content = fs.readFileSync(skillMdPath, 'utf8');
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
    } else if (fs.existsSync(readmePath)) {
      try {
        const content = fs.readFileSync(readmePath, 'utf8');
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

    skills.push({
      name: skillName,
      description,
    });
  });

  log(`✓ Found ${skills.length} skills`, 'green');
  return skills;
}

/**
 * Extract tools metadata
 */
function extractTools() {
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

    if (fs.existsSync(readmePath)) {
      try {
        const content = fs.readFileSync(readmePath, 'utf8');
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

    tools.push({
      name: toolName,
      description,
    });
  });

  log(`✓ Found ${tools.length} tools`, 'green');
  return tools;
}

/**
 * Extract agents metadata (hardcoded, from system knowledge)
 */
function extractAgents() {
  log('👥 Loading agents...', 'cyan');

  const agents = [
    {
      id: '@dev',
      persona: 'Dex',
      scope: 'Implementação de código, git add/commit, branch management',
    },
    {
      id: '@qa',
      persona: 'Quinn',
      scope: 'Testes e qualidade, QA gates, code review',
    },
    {
      id: '@architect',
      persona: 'Aria',
      scope: 'Arquitetura e design técnico, technology selection',
    },
    {
      id: '@pm',
      persona: 'Morgan',
      scope: 'Product Management, epic orchestration, requirements',
    },
    {
      id: '@po',
      persona: 'Pax',
      scope: 'Product Owner, story validation, backlog prioritization',
    },
    {
      id: '@sm',
      persona: 'River',
      scope: 'Scrum Master, story creation, sprint management',
    },
    {
      id: '@analyst',
      persona: 'Alex',
      scope: 'Pesquisa e análise de dados',
    },
    {
      id: '@data-engineer',
      persona: 'Dara',
      scope: 'Database design, schema DDL, query optimization',
    },
    {
      id: '@ux-design-expert',
      persona: 'Uma',
      scope: 'UX/UI design, design systems, user research',
    },
    {
      id: '@devops',
      persona: 'Gage',
      scope: 'CI/CD, git push (EXCLUSIVO), MCP management, infrastructure',
    },
    {
      id: '@aios-master',
      persona: 'Master',
      scope: 'Framework governance, constitutional enforcement',
    },
    {
      id: '@squad-creator',
      persona: 'Scout',
      scope: 'Squad creation, workspace setup, onboarding',
    },
  ];

  log(`✓ Loaded ${agents.length} agents`, 'green');
  return agents;
}

/**
 * Generate markdown catalog
 */
function generateMarkdown(squads, skills, tools, agents) {
  const date = new Date().toLocaleDateString('pt-BR');

  let markdown = `# AIOX Catalog

> Gerado automaticamente em ${date}

---

## Squads (${squads.length})

| Squad | Descrição | Ativação |
|-------|-----------|----------|
`;

  squads.forEach(squad => {
    markdown += `| ${squad.name} | ${squad.description} | \`/${squad.slug}\` |\n`;
  });

  markdown += `\n---\n\n## Skills (${skills.length})

| Skill | Descrição | Ativação |
|-------|-----------|----------|
`;

  skills.forEach(skill => {
    markdown += `| ${skill.name} | ${skill.description} | \`/AIOS:skills:${skill.name}\` |\n`;
  });

  markdown += `\n---\n\n## Tools (${tools.length})

| Tool | Descrição |
|------|-----------|
`;

  tools.forEach(tool => {
    markdown += `| ${tool.name} | ${tool.description} |\n`;
  });

  markdown += `\n---\n\n## Agents (${agents.length})

| Agent | Persona | Escopo |
|-------|---------|--------|
`;

  agents.forEach(agent => {
    markdown += `| ${agent.id} | ${agent.persona} | ${agent.scope} |\n`;
  });

  markdown += `\n---\n\n## Quick Reference

### Slash Commands Pattern
- **Squads:** \`/squad-name\` (ex: \`/agent-autonomy\`, \`/kaizen\`)
- **Skills:** \`/AIOS:skills:skill-name\` (ex: \`/AIOS:skills:book-to-markdown\`)
- **Agents:** \`@agent-id\` (ex: \`@dev\`, \`@architect\`)

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

## Data Completeness

| Categoria | Total | Coverage |
|-----------|-------|----------|
| Squads | ${squads.length} | 100% |
| Skills | ${skills.length} | 100% |
| Tools | ${tools.length} | 100% |
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
      const simpleSymlink = path.join(skillsCmdDir, `${skill.name}.md`);
      const complexDir = path.join(skillsCmdDir, skill.name);
      if (isComplex && fs.existsSync(simpleSymlink)) {
        fs.unlinkSync(simpleSymlink);
        log(`🔄 ${model}: ${skill.name} changed simple→complex, cleaned old symlink`, 'cyan');
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
        if (!fs.existsSync(cmdReadme)) {
          // ../../../../skills/{name}/README.md
          const relTarget = path.join('..', '..', '..', '..', '..', '.aios', 'skills', skill.name, mainDoc);
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
            if (!fs.existsSync(cmdFile)) {
              // ../../../../../skills/{name}/{subdir}/{file}.md
              const relTarget = path.join('..', '..', '..', '..', '..', '..', '.aios', 'skills', skill.name, subdir, mdFile);
              fs.symlinkSync(relTarget, cmdFile);
              modelCreated++;
            }
          });
        });
      } else {
        // Simple skill: single symlink {name}.md
        const cmdFile = path.join(skillsCmdDir, `${skill.name}.md`);
        if (!fs.existsSync(cmdFile)) {
          // ../../../skills/{name}/README.md
          const relTarget = path.join('..', '..', '..', '..', '.aios', 'skills', skill.name, mainDoc);
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

    // Clean conflicting types
    const simpleSymlink = path.join(globalSkillsDir, `${skill.name}.md`);
    const complexDir = path.join(globalSkillsDir, skill.name);
    if (isComplex && fs.existsSync(simpleSymlink)) {
      fs.unlinkSync(simpleSymlink);
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
          if (!fs.existsSync(cmdFile)) {
            fs.symlinkSync(path.join(srcSubdir, mdFile), cmdFile);
            created++;
          }
        });
      });
    } else {
      // Simple: single symlink (absolute path for global)
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
 * Main execution
 */
function main() {
  try {
    log('\n🚀 AIOX Catalog Generator', 'blue');
    log('========================\n', 'blue');

    // Extract data
    const squads = extractSquads();
    const skills = extractSkills();
    const tools = extractTools();
    const agents = extractAgents();

    // Sync slash commands (project-level)
    syncCommands(squads);
    syncSkillCommands(skills);

    // Sync global commands (user-level — available in ALL projects)
    syncGlobalSkillCommands(skills);

    // Generate markdown
    log('\n📝 Generating markdown...', 'cyan');
    const markdown = generateMarkdown(squads, skills, tools, agents);

    // Write file
    const outputPath = path.join(ROOT, '.aios-core', 'data', 'catalog.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');

    log(`✓ Catalog written to ${outputPath}`, 'green');

    // Summary
    log('\n📊 Summary', 'blue');
    log(`  Squads:  ${squads.length}`, 'green');
    log(`  Skills:  ${skills.length}`, 'green');
    log(`  Tools:   ${tools.length}`, 'green');
    log(`  Agents:  ${agents.length}`, 'green');
    log('\n✨ Done!\n', 'green');

    process.exit(0);
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'yellow');
    console.error(error);
    process.exit(1);
  }
}

main();
